import { JWT } from 'google-auth-library';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

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

  const { email, name, date, time, eventId } = req.body;
  if (!email || !date || !time) return res.status(400).json({ error: 'Missing fields' });

  console.log('--- START BOOKING (FETCH MODE) ---');
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

    let event = null;

    // 1. Tentar encontrar pelo EventId direto
    if (eventId) {
      console.log(`Searching by eventId: ${eventId}`);
      const getUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events/${encodeURIComponent(eventId)}`;
      const getRes = await fetch(getUrl, { headers: { 'Authorization': `Bearer ${token}` } });
      if (getRes.ok) {
        event = await getRes.json();
        console.log('Event found by ID.');
      } else {
        console.warn(`Event by ID not found (Status: ${getRes.status}). Falling back to list...`);
      }
    }

    // 2. Fallback: Busca por Lista (Data/Hora)
    if (!event) {
      const startDT = new Date(`${date}T${time}:00`);
      const endDT = new Date(startDT.getTime() + 60 * 60 * 1000);
      const tMin = startDT.toISOString();
      const tMax = endDT.toISOString();
      
      console.log(`Searching by list: ${tMin} to ${tMax}`);
      const listUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events?timeMin=${tMin}&timeMax=${tMax}&singleEvents=true`;
      const listRes = await fetch(listUrl, { headers: { 'Authorization': `Bearer ${token}` } });
      if (listRes.ok) {
        const listData = await listRes.json();
        event = (listData.items || []).find(e => 
          e.summary && (e.summary.toLowerCase().includes('orientação') || e.summary.toLowerCase().includes('grupo'))
        );
      }
    }

    if (event) {
      console.log(`Patching event: ${event.id}`);
      const updatedAttendees = [...(event.attendees || []), { email, displayName: name }];
      
      const patchUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events/${encodeURIComponent(event.id)}?sendUpdates=all`;
      const patchRes = await fetch(patchUrl, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ attendees: updatedAttendees })
      });

      if (!patchRes.ok) {
        const errData = await patchRes.json();
        throw new Error(`Google Patch Error: ${JSON.stringify(errData)}`);
      }

      const updatedEventData = await patchRes.json();

      // Gravar no Firestore
      const sessionRef = db.collection('sessoes_orientacao_grupo').doc(event.id);
      await sessionRef.set({
        vagas_ocupadas: FieldValue.increment(1),
        vagas_restantes: FieldValue.increment(-1),
        participantes: FieldValue.arrayUnion({ email, name, data_agendamento: new Date() }),
        lastUpdate: FieldValue.serverTimestamp()
      }, { merge: true });

      return res.status(200).json({
        success: true,
        message: 'Adicionado ao grupo de orientação',
        meetingLink: updatedEventData.hangoutLink
      });

    } else {
      console.log('No event found. Creating new one...');
      const startDT = new Date(`${date}T${time}:00`);
      const endDT = new Date(startDT.getTime() + 60 * 60 * 1000);

      const insertUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events?conferenceDataVersion=1&sendUpdates=all`;
      const insertRes = await fetch(insertUrl, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summary: `Orientação em Grupo - BPlen Hub`,
          description: `Sessão de Orientação em Grupo.`,
          start: { dateTime: startDT.toISOString() },
          end: { dateTime: endDT.toISOString() },
          attendees: [
            { email: 'lisandra.lencina@bplen.com' },
            { email, displayName: name }
          ],
          conferenceData: {
            createRequest: {
              requestId: `orientacao-${Date.now()}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' }
            }
          }
        })
      });

      if (!insertRes.ok) {
        const errData = await insertRes.json();
        throw new Error(`Google Insert Error: ${JSON.stringify(errData)}`);
      }

      const newEventData = await insertRes.json();
      const newEventId = newEventData.id;

      const sessionRef = db.collection('sessoes_orientacao_grupo').doc(newEventId);
      await sessionRef.set({
        id: newEventId,
        data_hora: Timestamp.fromDate(startDT),
        vagas_totais: 10,
        vagas_ocupadas: 1,
        vagas_restantes: 9,
        participantes: [{ email, name, data_agendamento: new Date() }],
        status: 'proxima',
        tema: 'A definir',
        link_meet: newEventData.hangoutLink || '',
        lastSync: FieldValue.serverTimestamp()
      });

      return res.status(200).json({
        success: true,
        message: 'Orientação agendada com sucesso',
        meetingLink: newEventData.hangoutLink
      });
    }

  } catch (error) {
    console.error('Booking Fatal Error:', error);
    return res.status(500).json({ error: 'Erro ao processar agendamento', details: error.message });
  }
}
