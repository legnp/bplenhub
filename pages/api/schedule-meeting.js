import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

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
      subject: 'lisandra.lencina@bplen.com' // Tenta agir em nome da Lisandra se o domínio permitir, ou apenas acessa a agenda
    });

    const calendar = google.calendar({ version: 'v3', auth });
    const calendarId = 'lisandra.lencina@bplen.com';

    // 1. Definir janela de tempo (ex: 1 hora de duração)
    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

    // 2. Buscar eventos existentes nesse horário para checar grupo
    const existingEvents = await calendar.events.list({
      calendarId,
      timeMin: startDateTime.toISOString(),
      timeMax: endDateTime.toISOString(),
      singleEvents: true,
    });

    // Procura por um evento de "Onboarding" no horário
    let event = existingEvents.data.items?.find(e => e.summary && e.summary.toLowerCase().includes('onboarding'));

    if (event) {
      // 3. Checar capacidade (Limite 10)
      const attendeeCount = event.attendees ? event.attendees.length : 0;
      
      // Lisandra conta como 1, então permitimos até 11 total (10 clientes + Lisandra)
      if (attendeeCount >= 11) {
        return res.status(409).json({ error: 'Desculpe, este horário já atingiu o limite de 10 participantes.' });
      }

      // Adicionar novo participante ao evento existente
      const updatedAttendees = [...(event.attendees || []), { email, displayName: name }];
      
      const updatedEvent = await calendar.events.patch({
        calendarId,
        eventId: event.id,
        requestBody: {
          attendees: updatedAttendees
        },
        sendUpdates: 'all'
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Adicionado ao grupo existente', 
        meetingLink: updatedEvent.data.hangoutLink 
      });

    } else {
      // 4. Criar novo evento se não existir
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

      return res.status(200).json({ 
        success: true, 
        message: 'Agendamento criado com sucesso', 
        meetingLink: newEvent.data.hangoutLink 
      });
    }

  } catch (error) {
    console.error('Calendar API Error:', error);
    // Erro amigável para o usuário se as permissões não estiverem prontas
    if (error.message.includes('not enabled') || error.message.includes('permission')) {
      return res.status(500).json({ 
        error: 'Erro de permissão no Google Calendar. Por favor, verifique se a API está ativa e a agenda compartilhada com a Service Account.',
        details: error.message 
      });
    }
    return res.status(500).json({ error: 'Erro ao processar agendamento' });
  }
}
