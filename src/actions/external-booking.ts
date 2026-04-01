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
import { doc, setDoc, serverTimestamp, collection, addDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Resend } from "resend";
import { CALENDAR_CONFIG } from "@/config/calendarConfig";
import { generateIcsString } from "@/lib/ics-utils";

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
 * Baseia-se no Free/Busy da agenda de disponibilidade configurada.
 */
export async function getPublicSlotsAction(dateStr: string): Promise<TimeSlot[]> {
  try {
    const calendar = await getCalendarClient();
    const settings = CALENDAR_CONFIG.PUBLIC_BOOKING_SETTINGS;
    
    const targetDate = parseISO(dateStr);
    const timeMin = formatISO(startOfDay(targetDate));
    const timeMax = formatISO(endOfDay(targetDate));

    // 1. Consultar Free/Busy da agenda de disponibilidade
    const fbResponse = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        items: [{ id: serverEnv.GOOGLE_CALENDAR_ID }]
      }
    });

    const busyIntervals = fbResponse.data.calendars?.[serverEnv.GOOGLE_CALENDAR_ID]?.busy || [];

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
 * Executa o agendamento externo: Salva Lead, Cria Evento com Meet, gera ICS e envia E-mail.
 */
export async function bookPublicMeetingAction(formData: {
  name: string;
  email: string;
  phone: string;
  screening: Record<string, string>;
  slot: string;
}) {
  try {
    const calendar = await getCalendarClient();
    const startTime = parseISO(formData.slot);
    const endTime = addMinutes(startTime, CALENDAR_CONFIG.PUBLIC_BOOKING_SETTINGS.defaultDuration);

    // 1. Salvar Lead Inicial no Firestore
    const leadRef = await addDoc(collection(db, "User_Leads"), {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      screening: formData.screening,
      selectedSlot: formData.slot,
      status: "pending_calendar", // Status temporário enquanto cria agenda
      createdAt: serverTimestamp()
    });

    // 2. Criar Evento no Google Calendar com Google Meet
    // 2. Criar Evento para gerar Google Meet (na agenda primária da Service Account para evitar erros de permissão)
    const eventDescription = `
👤 **Cliente:** ${formData.name}
📧 **E-mail:** ${formData.email}
📱 **Telefone:** ${formData.phone}

---
📝 **Triagem:**
${Object.entries(formData.screening).map(([q, a]) => `• ${q}: ${a}`).join("\n")}

🆔 **Lead ID:** ${leadRef.id}
🔗 **Agendado via BPlen HUB**
`.trim();

    // Passo A: Gerar o Meet Link na agenda "dona" da Service Account
    const meetResponse = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      requestBody: {
        summary: `BPlen Meet: ${formData.name}`,
        description: `Link gerado para agendamento ${leadRef.id}`,
        start: { dateTime: formatISO(startTime) },
        end: { dateTime: formatISO(endTime) },
        conferenceData: {
          createRequest: {
            requestId: `meet-${leadRef.id}`,
            conferenceSolutionKey: { type: "hangoutsMeet" }
          }
        },
      }
    });

    const meetingLink = meetResponse.data.hangoutLink || "";

    // Passo B: Criar o evento na agenda de destino (legnp@bplen.com) como evento simples
    const calendarResponse = await calendar.events.insert({
      calendarId: serverEnv.GOOGLE_BOOKING_CALENDAR_ID,
      requestBody: {
        summary: `BPlen | 1 to 1: ${formData.name}`,
        description: `${eventDescription}\n\n🎥 Link da Reunião: ${meetingLink}`,
        start: { dateTime: formatISO(startTime) },
        end: { dateTime: formatISO(endTime) },
        location: meetingLink,
        reminders: {
          useDefault: false,
          overrides: [
            { method: "popup", minutes: 30 },
          ],
        },
      }
    });

    const eventId = calendarResponse.data.id;

    // 3. Atualizar Firestore com dados do evento
    await updateDoc(leadRef, {
      status: "confirmed",
      calendarEventId: eventId,
      meetingLink: meetingLink,
      meetingDuration: CALENDAR_CONFIG.PUBLIC_BOOKING_SETTINGS.defaultDuration,
      meetingTitle: `BPlen | 1 to 1: ${formData.name}`,
      bookingCalendar: serverEnv.GOOGLE_BOOKING_CALENDAR_ID
    });

    // 4. Gerar arquivo .ics
    const icsContent = generateIcsString({
      title: `BPlen | 1 to 1: ${formData.name}`,
      description: `${eventDescription}\n\nLink da Reunião: ${meetingLink}`,
      location: meetingLink,
      start: startTime,
      end: endTime,
      uid: eventId || `bplen-${Date.now()}`
    });

    // 5. Enviar E-mail via Resend (hub@bplen.com)
    await resend.emails.send({
      from: "BPlen HUB <hub@bplen.com>",
      to: [formData.email],
      subject: `Confirmado: Sua reunião com a BPlen`,
      attachments: [
        {
          filename: "convite-bplen.ics",
          content: Buffer.from(icsContent)
        }
      ],
      html: `
        <div style="font-family: sans-serif; color: #1D1D1F; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 20px;">
          <h2 style="color: #667eea; font-weight: 900; letter-spacing: -0.02em;">Olá, ${formData.name}!</h2>
          <p style="font-size: 16px; line-height: 1.5;">Sua reunião estratégica 1 to 1 foi confirmada com sucesso.</p>
          
          <div style="background: #f9f9fb; padding: 25px; border-radius: 16px; margin: 24px 0; border: 1px solid #eee;">
            <p style="margin: 8px 0; font-size: 14px;"><strong>📅 Data:</strong> ${format(startTime, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
            <p style="margin: 8px 0; font-size: 14px;"><strong>⏰ Horário:</strong> ${format(startTime, "HH:mm")} às ${format(endTime, "HH:mm")}</p>
            <p style="margin: 8px 0; font-size: 14px;"><strong>💻 Plataforma:</strong> Google Meet</p>
          </div>

          <div style="margin: 32px 0; text-align: center;">
            <a href="${meetingLink}" target="_blank" style="display: inline-block; padding: 16px 32px; background: #667eea; color: white; text-decoration: none; border-radius: 14px; font-weight: bold; font-size: 16px; box-shadow: 0 10px 20px rgba(102,126,234,0.2);">
               Acessar Sala de Reunião
            </a>
          </div>

          <p style="color: #667eea; font-weight: 900; text-transform: uppercase; font-size: 11px; letter-spacing: 0.1em; margin-top: 40px;">⚠️ Importante:</p>
          <p style="font-size: 13px; color: #666;">Anexamos um arquivo de calendário (ICS) a este email. Ao abri-lo, o evento será adicionado automaticamente à sua agenda pessoal com todos os alertas configurados.</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 40px 0;" />
          <p style="font-size: 11px; color: #86868b; text-align: center; font-weight: 500;">Este é um e-mail oficial do BPlen HUB.<br/>Evolução através da excelência.</p>
        </div>
      `,
    });

    return { success: true, leadId: leadRef.id };
  } catch (error: unknown) {
    console.error("Erro no bookPublicMeetingAction:", error);
    const err = error as Error;
    return { 
      success: false, 
      message: err.message || "Erro ao processar agendamento." 
    };
  }
}
