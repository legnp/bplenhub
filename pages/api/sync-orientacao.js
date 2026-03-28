import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('--- START ORIENTACAO SYNC ---');
  try {
    const pk = process.env.GOOGLE_PRIVATE_KEY
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '')
      : null;

    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: pk,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const tokenRes = await auth.getAccessToken();
    const token = tokenRes.token;
    if (!token) throw new Error('Failed to get Google Access Token');

    const calId = process.env.GOOGLE_CALENDAR_ID || 'c_8065a455c764d31b19be4cadf973b33fc8f567cf577ba4d3fff87c8608e050fc@group.calendar.google.com';
    
    console.log(`[SYNC ORIENTACAO] Fetching from calendar: ${calId}`);

    const tMinDate = new Date();
    tMinDate.setHours(0, 0, 0, 0); // Começar do início do dia de hoje
    const tMin = tMinDate.toISOString();

    
    const fut = new Date();
    fut.setDate(fut.getDate() + 150); 
    const tMax = fut.toISOString();

    console.log(`Syncing from ${tMin} to ${tMax}`);

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events?timeMin=${tMin}&timeMax=${tMax}&singleEvents=true&orderBy=startTime&maxResults=2500`;

    const calendarRes = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!calendarRes.ok) throw new Error(`Google API returned ${calendarRes.status}`);

    const result = await calendarRes.json();
    const allItems = result.items || [];
    console.log(`Total events fetched from Google: ${allItems.length}`);

    // Filtro mais abrangente e logando o que foi filtrado
    const items = allItems.filter(e => {
        const summary = (e.summary || '').toLowerCase();
        const isMatch = summary.includes('orientação');
        if (isMatch) console.log(`[MATCH] ${e.summary} | ${e.start.dateTime || e.start.date}`);
        return isMatch;
    });

    console.log(`Matching orientation events: ${items.length}`);

    let syncedCount = 0;
    const syncedEvents = [];

    for (const event of items) {
      try {
        const tema = event.description || 'Tema: A DEFINIR';
        const start = event.start.dateTime || event.start.date;
        if (!start) {
          console.log(`[SKIP] Event ${event.id} has no start time.`);
          continue;
        }

        const sessionRef = db.collection('sessoes_orientacao_grupo').doc(event.id);
        
        // Operação atômica ou merge seguro
        await sessionRef.set({
          data_hora: Timestamp.fromDate(new Date(start)),
          link_meet: event.hangoutLink || '',
          vagas_totais: 10,
          titulo: event.summary,
          tema: tema
        }, { merge: true });

        // Garantir campos de vagas (vagas_ocupadas e vagas_restantes)
        const snap = await sessionRef.get();
        const docData = snap.data() || {};
        
        const updateData = {};
        if (docData.vagas_ocupadas === undefined) {
          updateData.vagas_ocupadas = 0;
          updateData.participantes = [];
        }
        
        // Recalcular vagas_restantes sempre para garantir integridade no sync
        const ocupadas = docData.vagas_ocupadas || 0;
        updateData.vagas_restantes = 10 - ocupadas;
        updateData.lastSync = FieldValue.serverTimestamp();
        
        await sessionRef.update(updateData);

        syncedEvents.push({
          id: event.id,
          titulo: event.summary,
          tema: tema,
          data_hora: start,
          vagas_restantes: 10 - ocupadas
        });
        syncedCount++;
      } catch (loopErr) {
        console.error(`Error processing event ${event.id}:`, loopErr.message);
      }
    }

    console.log(`--- SYNC FINISHED: ${syncedCount} synced ---`);
    return res.status(200).json({ 
      success: true, 
      count: syncedCount,
      events: syncedEvents
    });

  } catch (err) {
    console.error('SYNC FATAL ERROR:', err);
    return res.status(500).json({ error: err.message });
  }
}
