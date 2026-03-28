import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Helper para normalizar texto (remover acentos)
const normalize = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

// Initialize Firebase Admin (Server-side)
if (!getApps().length) {
  const pk = process.env.GOOGLE_PRIVATE_KEY
    ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '')
    : null;
  
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey: pk,
    }),
  });
}
const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Fix private key formatting from .env
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '')
      : null;

    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    // Get OAuth token manually
    const tokenResponse = await auth.getAccessToken();
    const token = tokenResponse.token;

    if (!token) {
      throw new Error('Could not generate OAuth token');
    }

    // Buscar eventos via fetch manual
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'c_8065a455c764d31b19be4cadf973b33fc8f567cf577ba4d3fff87c8608e050fc@group.calendar.google.com';
    const timeMin = new Date().toISOString();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 90);
    const timeMax = futureDate.toISOString();

    console.log(`[SYNC ONBOARDING] Fetching from calendar: ${calendarId}`);

    // Removendo o filtro 'q' da URL para fazer filtro manual mais robusto
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&maxResults=2500`;

    const calendarRes = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!calendarRes.ok) {
      const errorData = await calendarRes.json();
      console.error(`[SYNC ONBOARDING ERROR] Google API returned ${calendarRes.status}:`, errorData);
      throw new Error(`Google API Error: ${calendarRes.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await calendarRes.json();
    const allItems = data.items || [];
    console.log(`[SYNC ONBOARDING] Total events found in Google: ${allItems.length}`);
    
    // Filtro manual insensível a maiúsculas e ACENTOS
    const items = allItems.filter(e => {
      const summary = e.summary || "";
      const isMatch = normalize(summary).includes('onboarding');
      if (isMatch) {
        console.log(`[SYNC ONBOARDING] MATCH FOUND: ${summary} em ${e.start.dateTime || e.start.date}`);
      }
      return isMatch;
    });
    console.log(`[SYNC ONBOARDING] Matching events: ${items.length}`);


    let syncedCount = 0;
    const syncedEvents = [];


    for (const event of items) {
      // Filtro extra redundante por segurança
      if (event.summary && event.summary.toLowerCase().includes('onboarding')) {
        const startDateTime = event.start.dateTime || event.start.date;
        const eventId = event.id;
        const linkMeet = event.hangoutLink || '';

        if (!startDateTime) continue;

        const sessionRef = db.collection('sessoes_onboarding').doc(eventId);

        await sessionRef.set({
          data_hora: new Date(startDateTime),
          link_meet: linkMeet,
          vagas_totais: 10,
          titulo: event.summary,
        }, { merge: true });

        // Garantir campos padrão e cálculo de vagas_restantes
        const snap = await sessionRef.get();
        if (snap.exists) {
          const docData = snap.data();
          const updateObj = {};
          let needsUpdate = false;

          if (typeof docData.vagas_ocupadas === 'undefined') {
            updateObj.vagas_ocupadas = 0;
            updateObj.participantes = [];
            needsUpdate = true;
          }

          if (typeof docData.vagas_restantes === 'undefined') {
            const currentTotais = docData.vagas_totais || 10;
            const currentOcupadas = updateObj.vagas_ocupadas !== undefined ? updateObj.vagas_ocupadas : (docData.vagas_ocupadas || 0);
            updateObj.vagas_restantes = currentTotais - currentOcupadas;
            needsUpdate = true;
          }

          if (needsUpdate) {
            await sessionRef.update(updateObj);
          }
        }

        const finalSnap = await sessionRef.get();
        const finalData = finalSnap.data() || {};

        syncedEvents.push({
          id: eventId,
          titulo: finalData.titulo || event.summary,
          data_hora: startDateTime,
          link_meet: finalData.link_meet || linkMeet,
          vagas_totais: finalData.vagas_totais || 10,
          vagas_ocupadas: finalData.vagas_ocupadas || 0,
          vagas_restantes: typeof finalData.vagas_restantes !== 'undefined' ? finalData.vagas_restantes : (finalData.vagas_totais || 10) - (finalData.vagas_ocupadas || 0)
        });

        syncedCount++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Foram sincronizadas ${syncedCount} sessões de onboarding.`,
      count: syncedCount,
      events: syncedEvents,
    });

  } catch (error) {
    console.error('API Sync Error:', error);
    return res.status(500).json({
      error: 'Erro ao sincronizar eventos',
      details: error.message
    });
  }
}
