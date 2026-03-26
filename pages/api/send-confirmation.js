import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { nome, email, data, hora, link_meet, timestamp } = req.body;

  if (!email || !data || !hora || !link_meet) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const firstName = nome ? nome.split(' ')[0] : 'Membro';

    let gCalUrl = '';
    let attachments = [];
    if (timestamp) {
        const sDateObj = new Date(timestamp);
        const eDateObj = new Date(sDateObj.getTime() + 60*60*1000); // 1 hora de duracao
        const formatICSDate = (date) => date.toISOString().replace(/-|:|\.\d+/g, '');
        gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Onboarding+BPlen+Hub&details=Sessão+em+grupo+para+clientes+BPlen+Hub.%0A%0AEquipe+BPlen&location=${encodeURIComponent(link_meet)}&dates=${formatICSDate(sDateObj)}/${formatICSDate(eDateObj)}`;
        
        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//BPlen HUB//Onboarding//PT',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            `DTSTART:${formatICSDate(sDateObj)}`,
            `DTEND:${formatICSDate(eDateObj)}`,
            'SUMMARY:Onboarding BPlen Hub',
            `ORGANIZER;CN=BPlen HUB:MAILTO:onboarding@bplen.com`,
            `DESCRIPTION:Sessão de Onboarding.\\nLink de acesso: ${link_meet}`,
            `LOCATION:${link_meet}`,
            `UID:${sDateObj.getTime()}@bplen.com`,
            'STATUS:CONFIRMED',
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        attachments.push({
            filename: 'convite_onboarding.ics',
            content: Buffer.from(icsContent).toString('base64'),
            content_type: 'text/calendar'
        });
    }

    const { data: emailData, error } = await resend.emails.send({
      from: 'BPlen Hub <onboarding@bplen.com>',
      to: [email],
      subject: `${firstName}, sua sessão de Onboarding foi confirmada`,
      attachments: attachments,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #333; line-height: 1.6; border: 1px solid #eee; padding: 40px; border-radius: 12px;">
          <h2 style="color: #8a4fff; font-size: 22px; margin-top: 0;">Agendamento Confirmado! ✅</h2>
          <p>Olá <strong>${firstName}</strong>,</p>
          <p>Seu Onboarding foi agendado com sucesso!</p>
          
          <div style="background-color: #f6eff3; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #8a4fff;">
            <p style="margin: 0 0 10px 0;"><strong>Data:</strong> ${data}</p>
            <p style="margin: 0 0 10px 0;"><strong>Horário:</strong> ${hora}</p>
            <p style="margin: 0;"><strong>Com:</strong> Lisandra Lencina</p>
          </div>

          <p>Para entrar na sala no horário marcado, clique no botão abaixo:</p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${link_meet}" style="background-color: #8a4fff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Acessar Sala do Google Meet
            </a>
          </div>

          <p style="color: #666; font-size: 14px; background: #fffcfd; padding: 15px; border-radius: 8px; border: 1px dashed #e8d9e2;">
            Dica: Se precisar reagendar, você pode fazer isso diretamente pelo portal BPlen HUB, com no mínimo 3 horas de antecedência.
          </p>
          
          <p style="margin-top: 30px;">Nos vemos lá!<br><strong>Equipe BPlen</strong></p>
          
          <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; font-size: 11px; color: #999; text-align: center;">
            Enviamos um arquivo de convite (.ics) em anexo para você salvar na sua agenda.
          </div>
        </div>
      `
    });

    if (error) {
      console.error("Resend Response Error:", error);
      return res.status(400).json({ error });
    }

    return res.status(200).json({ success: true, message: 'Email enviado.' });
  } catch (error) {
    console.error("Fetch/Try Error:", error);
    return res.status(500).json({ error: 'Erro interno ao enviar o email.' });
  }
}
