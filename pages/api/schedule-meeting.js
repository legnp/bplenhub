import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

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
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { email, name, date, time } = req.body;

  if (!email || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const pk = process.env.GOOGLE_PRIVATE_KEY
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '')
      : null;

    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: pk,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });



    const calendar = google.calendar({ version: 'v3', auth });
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'c_8065a455c764d31b19be4cadf973b33fc8f567cf577ba4d3fff87c8608e050fc@group.calendar.google.com';

    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

    // 1. Buscar evento no Calendar
    const existingEvents = await calendar.events.list({
      calendarId,
      timeMin: startDateTime.toISOString(),
      timeMax: endDateTime.toISOString(),
      singleEvents: true,
    });

    let event = existingEvents.data.items?.find(e => e.summary && e.summary.toLowerCase().includes('onboarding'));

    if (event) {
      console.log(`Event found: ${event.id}. Recording in Firestore...`);
      const linkMeet = event.hangoutLink || '';

      // 3. Atualizar Firestore (Vagas)
      const sessionRef = db.collection('sessoes_onboarding').doc(event.id);
      await sessionRef.set({
        vagas_ocupadas: FieldValue.increment(1),
        vagas_restantes: FieldValue.increment(-1),
        participantes: FieldValue.arrayUnion({ email, name, data_agendamento: new Date() }),
        lastUpdate: FieldValue.serverTimestamp()
      }, { merge: true });

      return res.status(200).json({
        success: true,
        message: 'Adicionado ao grupo de onboarding',
        meetingLink: linkMeet
      });

    } else {
      console.log('No onboarding event found in Calendar for this time.');
      return res.status(404).json({ 
        error: 'Sessão não encontrada no calendário', 
        details: 'Por favor, aguarde a sincronização da agenda ou verifique se o horário está correto.' 
      });
    }


  } catch (error) {
    console.error('Calendar API Error:', error);
    return res.status(500).json({ error: 'Erro ao processar agendamento', details: error.message });
  }
}
