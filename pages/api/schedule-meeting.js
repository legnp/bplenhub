import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin (Server-side)
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
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { email, name, date, time } = req.body;

  if (!email || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar'],
      subject: 'lisandra.lencina@bplen.com'
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
      // 2. Adicionar ao evento existente no Calendar
      const updatedAttendees = [...(event.attendees || []), { email, displayName: name }];
      
      const updatedEvent = await calendar.events.patch({
        calendarId,
        eventId: event.id,
        requestBody: { attendees: updatedAttendees },
        sendUpdates: 'all'
      });

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
        message: 'Adicionado ao grupo existente',
        meetingLink: updatedEvent.data.hangoutLink
      });

    } else {
      // 4. Criar NOVO evento no Calendar
      const newEvent = await calendar.events.insert({
        calendarId,
        conferenceDataVersion: 1,
        requestBody: {
          summary: `Onboarding BPlen Hub - Grupo`,
          description: `Sessão de Onboarding estratégica para novos membros.`,
          start: { dateTime: startDateTime.toISOString() },
          end: { dateTime: endDateTime.toISOString() },
          attendees: [
            { email: 'lisandra.lencina@bplen.com' },
            { email, displayName: name }
          ],
          conferenceData: {
            createRequest: {
              requestId: `onboarding-${Date.now()}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' }
            }
          }
        },
        sendUpdates: 'all'
      });

      // 5. Criar no Firestore
      const eventId = newEvent.data.id;
      const sessionRef = db.collection('sessoes_onboarding').doc(eventId);
      await sessionRef.set({
        id: eventId,
        data_hora: Timestamp.fromDate(startDateTime),
        vagas_totais: 10,
        vagas_ocupadas: 1,
        vagas_restantes: 9,
        participantes: [{ email, name, data_agendamento: new Date() }],
        status: 'proxima',
        link_meet: newEvent.data.hangoutLink || '',
        lastSync: FieldValue.serverTimestamp()
      });

      return res.status(200).json({
        success: true,
        message: 'Agendamento criado com sucesso',
        meetingLink: newEvent.data.hangoutLink
      });
    }

  } catch (error) {
    console.error('Calendar API Error:', error);
    return res.status(500).json({ error: 'Erro ao processar agendamento', details: error.message });
  }
}
