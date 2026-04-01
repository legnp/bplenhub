"use server";

import { getCalendarClient } from "@/lib/google-auth";
import { serverEnv } from "@/env";
import { 
  formatISO, 
  addDays, 
  parseISO, 
  isBefore, 
  addMinutes, 
  startOfDay, 
  endOfDay,
  setHours,
  setMinutes,
  isAfter,
  format
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { doc, setDoc, serverTimestamp, collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Resend } from "resend";
import { CALENDAR_CONFIG } from "@/config/calendarConfig";

const resend = new Resend(serverEnv.RESEND_API_KEY);

/**
 * Interface para os slots de tempo disponíveis
 */
export interface TimeSlot {
  start: string; // ISO String
  end: string;   // ISO String
  available: boolean;
}

/**
 * Busca slots disponíveis para agendamento público (1 to 1).
 * Baseia-se no Free/Busy do Google Calendar e nas configurações de Working Hours.
 */
export async function getPublicSlotsAction(dateStr: string): Promise<TimeSlot[]> {
  try {
    const calendar = await getCalendarClient();
    const settings = CALENDAR_CONFIG.PUBLIC_BOOKING_SETTINGS;
    
    const targetDate = parseISO(dateStr);
    const timeMin = formatISO(startOfDay(targetDate));
    const timeMax = formatISO(endOfDay(targetDate));

    // 1. Consultar Free/Busy do Google
    const fbResponse = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        items: [{ id: "primary" }]
      }
    });

    const busyIntervals = fbResponse.data.calendars?.primary?.busy || [];

    // 2. Gerar slots baseados nas Working Hours e Duração
    const slots: TimeSlot[] = [];
    const [startH, startM] = settings.workingHours.start.split(":").map(Number);
    const [endH, endM] = settings.workingHours.end.split(":").map(Number);

    let currentSlotStart = setMinutes(setHours(startOfDay(targetDate), startH), startM);
    const dayEnd = setMinutes(setHours(startOfDay(targetDate), endH), endM);

    // Regra de antecedência mínima (leadTime)
    const now = new Date();
    const minAllowedTime = addDays(now, settings.minDaysInFuture);

    while (isBefore(currentSlotStart, dayEnd)) {
      const currentSlotEnd = addMinutes(currentSlotStart, settings.defaultDuration);
      
      // Verificar se o slot conflita com algum intervalo ocupado
      const isBusy = busyIntervals.some(busy => {
        const bStart = parseISO(busy.start!);
        const bEnd = parseISO(busy.end!);
        // Sobreposição de intervalos: (A_start < B_end) && (B_start < A_end)
        return isBefore(currentSlotStart, bEnd) && isBefore(bStart, currentSlotEnd);
      });

      // Verificar se respeita o lead time
      const isAllowedByLeadTime = isAfter(currentSlotStart, minAllowedTime);

      slots.push({
        start: formatISO(currentSlotStart),
        end: formatISO(currentSlotEnd),
        available: !isBusy && isAllowedByLeadTime
      });

      // Avançar para o próximo slot (incluindo buffer)
      currentSlotStart = addMinutes(currentSlotEnd, settings.bufferBetweenMeetings);
    }

    return slots;
  } catch (error: unknown) {
    console.error("Erro ao buscar slots públicos:", error);
    throw new Error("Falha ao carregar horários disponíveis.");
  }
}

/**
 * Executa o agendamento externo: Salva Lead, Cria Evento no Google e envia E-mail.
 */
export async function bookPublicMeetingAction(formData: {
  name: string;
  email: string;
  phone: string;
  screening: Record<string, string>;
  slot: string; // ISO String do início do slot
}) {
  try {
    const calendar = await getCalendarClient();
    const startTime = parseISO(formData.slot);
    const endTime = addMinutes(startTime, CALENDAR_CONFIG.PUBLIC_BOOKING_SETTINGS.defaultDuration);

    // 1. Salvar Lead no Firestore
    const leadRef = await addDoc(collection(db, "User_Leads"), {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      screening: formData.screening,
      selectedSlot: formData.slot,
      status: "confirmed",
      createdAt: serverTimestamp()
    });

    // 2. Criar Evento no Google Calendar
    const eventDescription = `
🔔 **Agendamento Externo via BPlen HUB**
👤 **Cliente:** ${formData.name}
📧 **E-mail:** ${formData.email}
📱 **Telefone:** ${formData.phone}

---
📝 **Triagem:**
${Object.entries(formData.screening).map(([q, a]) => `• ${q}: ${a}`).join("\n")}

🆔 **Lead ID:** ${leadRef.id}
`.trim();

    await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: `Reunião 1to1: ${formData.name}`,
        description: eventDescription,
        start: { dateTime: formatISO(startTime) },
        end: { dateTime: formatISO(endTime) },
        attendees: [{ email: formData.email }],
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 30 },
          ],
        },
      }
    });

    // 3. Enviar E-mail via Resend (cs@bplen.com)
    await resend.emails.send({
      from: "BPlen <cs@bplen.com>",
      to: [formData.email],
      subject: `Confirmado: Sua reunião com a BPlen`,
      html: `
        <div style="font-family: sans-serif; color: #1D1D1F; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 12px;">
          <h2 style="color: #667eea;">Olá, ${formData.name}!</h2>
          <p>Seu agendamento foi realizado com sucesso.</p>
          
          <div style="background: #f9f9fb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Data:</strong> ${format(startTime, "dd / MM / yyyy", { locale: ptBR })}</p>
            <p style="margin: 5px 0;"><strong>Horário:</strong> ${format(startTime, "HH:mm")} às ${format(endTime, "HH:mm")}</p>
          </div>

          <p>Em breve você receberá um convite no seu calendário Google/Outlook com o link da reunião.</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #86868b;">Este é um e-mail automático enviado pelo BPlen HUB. Dúvidas? Responda a este e-mail ou entre em contato via WhatsApp.</p>
        </div>
      `,
    });

    return { success: true, leadId: leadRef.id };
  } catch (error: unknown) {
    console.error("Erro no bookPublicMeetingAction:", error);
    const err = error as Error;
    return { success: false, message: err.message };
  }
}
