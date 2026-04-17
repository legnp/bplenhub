/**
 * BPlen HUB — Email Templates (📧)
 * Centraliza os templates HTML puros para notificações transacionais.
 * Garante consistência visual e facilita a edição de conteúdo sem tocar na lógica.
 */

interface BookingEmailData {
  displayName: string;
  summary: string;
  dateStr: string;
  timeStr: string;
  mentor?: string;
  theme?: string;
  oneToOneInfo?: string;
  htmlLink: string;
  cancelLink: string;
}

/**
 * Template de Confirmação de Agendamento (1 to 1 ou Geral)
 */
export function getBookingConfirmationEmail(data: BookingEmailData) {
  const { displayName, summary, dateStr, timeStr, mentor, theme, oneToOneInfo, htmlLink, cancelLink } = data;
  
  return `
    <div style="font-family: sans-serif; color: #1d1d1f; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 20px;">
      <h2 style="color: #667eea; margin-bottom: 5px;">📍 Agendamento Confirmado!</h2>
      <p style="font-size: 16px; margin-top: 0;">Olá, <b>${displayName}</b>!</p>
      
      <div style="background: #fdfdfd; padding: 20px; border-radius: 16px; border: 1px solid #f0f0f0; margin: 20px 0;">
        <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px;"><b>EVENTO</b></p>
        <p style="margin: 5px 0 15px 0; font-size: 18px; color: #1d1d1f;"><b>${summary}</b></p>
        
        <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase;"><b>DATA E HORA</b></p>
        <p style="margin: 5px 0 15px 0; font-size: 14px;">${dateStr} às ${timeStr}h</p>
        
        <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase;"><b>ORIENTADOR</b></p>
        <p style="margin: 5px 0 0 0; font-size: 14px;">${mentor || "BPlen"}</p>
        
        ${theme ? `
          <p style="margin: 15px 0 0 0; font-size: 12px; color: #999; text-transform: uppercase;"><b>TEMA</b></p>
          <p style="margin: 5px 0 0 0; font-size: 14px;">${theme}</p>
        ` : ""}

        ${oneToOneInfo || ""}
      </div>

      <div style="margin: 25px 0; text-align: center;">
        <a href="${htmlLink}" style="background: #667eea; color: white; padding: 12px 30px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">ACESSAR REUNIÃO</a>
      </div>

      <p style="font-size: 11px; color: #999; text-align: center; margin-bottom: 20px;">
        * Anexamos um arquivo de calendário (.ics) para sua facilidade.
      </p>

      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
      
      <p style="font-size: 12px; color: #666; text-align: center; line-height: 1.5;">
        Deseja reagendar ou cancelar? <br/>
        <a href="${cancelLink}" style="color: #667eea; font-weight: bold;">Gerenciar minha agenda no HUB</a>
      </p>
    </div>
  `;
}

/**
 * Template de Inclusão Manual por Admin
 */
export function getAdminInclusionEmail(data: Omit<BookingEmailData, 'cancelLink' | 'oneToOneInfo'>) {
  const { displayName, summary, dateStr, timeStr, mentor, htmlLink } = data;

  return `
    <div style="font-family: sans-serif; color: #1d1d1f; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 20px;">
      <h2 style="color: #667eea; margin-bottom: 5px;">📍 Inclusão Confirmada!</h2>
      <p style="font-size: 16px; margin-top: 0;">Olá, <b>${displayName}</b>!</p>
      <p style="font-size: 14px; color: #666;">Você foi adicionado manualmente a este evento por um administrador.</p>
      
      <div style="background: #fdfdfd; padding: 20px; border-radius: 16px; border: 1px solid #f0f0f0; margin: 20px 0;">
        <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase;"><b>EVENTO</b></p>
        <p style="margin: 5px 0 15px 0; font-size: 18px; color: #1d1d1f;"><b>${summary}</b></p>
        <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase;"><b>DATA E HORA</b></p>
        <p style="margin: 5px 0 15px 0; font-size: 14px;">${dateStr} às ${timeStr}h</p>
        <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase;"><b>ORIENTADOR</b></p>
        <p style="margin: 5px 0 0 0; font-size: 14px;">${mentor || "BPlen"}</p>
      </div>

      <div style="margin: 25px 0; text-align: center;">
        <a href="${htmlLink}" style="background: #667eea; color: white; padding: 12px 30px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">ACESSAR REUNIÃO</a>
      </div>
    </div>
  `;
}

/**
 * Template de Cancelamento de Agendamento
 */
export function getCancellationEmail(data: { nickname: string; eventSummary: string; platformLink: string }) {
  const { nickname, eventSummary, platformLink } = data;

  return `
    <div style="font-family: sans-serif; color: #1d1d1f; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #7f1d1d15; border-radius: 20px; background: #fffcfc;">
      <h2 style="color: #ef4444; margin-bottom: 5px;">⚠️ Agendamento Cancelado</h2>
      <p style="font-size: 16px; margin-top: 0;">Olá, <b>${nickname}</b>.</p>
      
      <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
        Sua solicitação de cancelamento para o evento abaixo foi processada com sucesso e a vaga já foi devolvida ao ecossistema da BPlen.
      </p>

      <div style="background: #ffffff; padding: 20px; border-radius: 16px; border: 1px solid #fee2e2; margin: 20px 0; border-left: 4px solid #ef4444;">
        <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px;"><b>EVENTO CANCELADO</b></p>
        <p style="margin: 5px 0 0 0; font-size: 18px; color: #1d1d1f;"><b>${eventSummary}</b></p>
      </div>

      <div style="margin: 25px 0; text-align: center;">
        <a href="${platformLink}" style="background: #ef4444; color: white; padding: 12px 30px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">MARCAR NOVO HORÁRIO</a>
      </div>

      <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 30px 0;" />
      
      <p style="font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.5;">
        Se você não solicitou este cancelamento, entre em contato imediatamente com o seu Pós-Venda ou Mentor.
      </p>
    </div>
  `;
}
