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
import {
  collection,
  addDoc,
  updateDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  doc,
  getDoc
} from "firebase/firestore";
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
 * Consulta FreeBusy do Google Calendar E slots bloqueados no Firestore
 * para evitar overbooking enquanto requisições estão pendentes.
 */
export async function getPublicSlotsAction(dateStr: string): Promise<TimeSlot[]> {
  try {
    const calendar = await getCalendarClient();
    const settings = CALENDAR_CONFIG.PUBLIC_BOOKING_SETTINGS;
    const targetDate = parseISO(dateStr);
    const timeMin = formatISO(startOfDay(targetDate));
    const timeMax = formatISO(endOfDay(targetDate));

    // 1. FreeBusy do Google Calendar
    const fbResponse = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        items: [{ id: serverEnv.GOOGLE_CALENDAR_ID }]
      }
    });

    const busyIntervals = fbResponse.data.calendars?.[serverEnv.GOOGLE_CALENDAR_ID]?.busy || [];

    // 2. Slots bloqueados no Firestore (requisições pendentes ou aprovadas)
    const blockedQuery = query(
      collection(db, "Booking_Requests"),
      where("slotBlocked", "==", true),
      where("status", "in", ["pending", "approved"])
    );
    const blockedSnap = await getDocs(blockedQuery);
    const firestoreBlocked: { start: string; end: string }[] = [];
    blockedSnap.forEach((docSnap) => {
      const d = docSnap.data();
      firestoreBlocked.push({ start: d.requestedSlot, end: d.requestedSlotEnd });
    });

    // 3. Gerar slots baseados nas Working Hours e Duração
    const slots: TimeSlot[] = [];
    const [startH, startM] = settings.workingHours.start.split(":").map(Number);
    const [endH, endM] = settings.workingHours.end.split(":").map(Number);

    let currentSlotStart = setMinutes(setHours(startOfDay(targetDate), startH), startM);
    const dayEnd = setMinutes(setHours(startOfDay(targetDate), endH), endM);

    const now = new Date();
    const minAllowedTime = addDays(now, settings.minDaysInFuture);

    while (isBefore(currentSlotStart, dayEnd)) {
      const currentSlotEnd = addMinutes(currentSlotStart, settings.defaultDuration);

      // Verificar conflito com GCal
      const isBusyGCal = busyIntervals.some(busy => {
        const bStart = parseISO(busy.start!);
        const bEnd = parseISO(busy.end!);
        return isBefore(currentSlotStart, bEnd) && isBefore(bStart, currentSlotEnd);
      });

      // Verificar conflito com Firestore (anti-overbooking)
      const isBusyFirestore = firestoreBlocked.some(blocked => {
        const bStart = parseISO(blocked.start);
        const bEnd = parseISO(blocked.end);
        return isBefore(currentSlotStart, bEnd) && isBefore(bStart, currentSlotEnd);
      });

      const isAllowedByLeadTime = isAfter(currentSlotStart, minAllowedTime);

      slots.push({
        start: formatISO(currentSlotStart),
        end: formatISO(currentSlotEnd),
        available: !isBusyGCal && !isBusyFirestore && isAllowedByLeadTime
      });

      currentSlotStart = addMinutes(currentSlotEnd, settings.bufferBetweenMeetings);
    }

    return slots;
  } catch (error: unknown) {
    console.error("Erro ao buscar slots públicos:", error);
    throw new Error("Falha ao carregar horários disponíveis.");
  }
}

/**
 * Salva a REQUISIÇÃO de agendamento no Firestore e envia e-mail de recebimento.
 * NÃO cria evento no Google Calendar — isso é feito pelo admin ao aprovar.
 */
export async function bookPublicMeetingAction(formData: {
  name: string;
  email: string;
  phone: string;
  screening: Record<string, string>;
  slot: string;
}) {
  try {
    const duration = CALENDAR_CONFIG.MEETING_SETTINGS.duration;
    const startTime = parseISO(formData.slot);
    const endTime = addMinutes(startTime, duration);

    // 1. Salvar requisição no Firestore (bloqueia o slot imediatamente)
    await addDoc(collection(db, "Booking_Requests"), {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      screening: formData.screening,
      requestedSlot: formData.slot,
      requestedSlotEnd: formatISO(endTime),
      status: "pending",
      slotBlocked: true,
      createdAt: serverTimestamp(),
    });

    // 2. E-mail de recebimento para o lead (afável, sem confirm ainda)
    await resend.emails.send({
      from: "BPlen HUB <hub@bplen.com>",
      to: [formData.email],
      subject: "BPlen | Recebemos sua solicitação de 1 to 1 ✨",
      html: `
        <div style="font-family: 'Inter', sans-serif; color: #1D1D1F; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #fff;">
          
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 16px; padding: 12px 28px;">
              <span style="color: white; font-weight: 900; font-size: 18px; letter-spacing: -0.02em;">BPlen HUB</span>
            </div>
          </div>

          <h2 style="font-size: 28px; font-weight: 900; color: #1D1D1F; letter-spacing: -0.03em; margin-bottom: 8px;">
            Olá, ${formData.name}! 👋
          </h2>
          <p style="font-size: 16px; color: #555; line-height: 1.7; margin-bottom: 32px;">
            Recebemos com sucesso o seu pedido de reunião <strong>1 to 1</strong> com a equipe BPlen. Ficamos muito felizes com o seu interesse!
          </p>

          <div style="background: #f8f9ff; border: 1px solid #e8edff; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
            <p style="margin: 0 0 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #667eea;">Dados da Solicitação</p>
            <p style="margin: 8px 0; font-size: 15px; color: #333;">
              📅 <strong>Data solicitada:</strong> ${format(startTime, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </p>
            <p style="margin: 8px 0; font-size: 15px; color: #333;">
              ⏰ <strong>Horário:</strong> ${format(startTime, "HH:mm")} às ${format(endTime, "HH:mm")}
            </p>
            <p style="margin: 8px 0; font-size: 15px; color: #333;">
              🎯 <strong>Formato:</strong> 1 to 1 — 45 min via Google Meet
            </p>
          </div>

          <div style="background: linear-gradient(135deg, #667eea15, #764ba215); border: 1px solid #667eea30; border-radius: 16px; padding: 20px 24px; margin-bottom: 32px;">
            <p style="margin: 0; font-size: 14px; color: #555; line-height: 1.7;">
              ⚡ <strong>Próximo passo:</strong> Nossa equipe irá analisar sua solicitação e confirmar o agendamento em breve — você receberá um e-mail de confirmação com o link do Google Meet e o convite de calendário.
            </p>
          </div>

          <hr style="border: 0; border-top: 1px solid #eee; margin: 40px 0;" />
          <p style="font-size: 11px; color: #86868b; text-align: center; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">
            BPlen HUB — Evolução através da excelência.
          </p>
        </div>
      `,
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Erro no bookPublicMeetingAction:", error);
    const err = error as Error;
    return {
      success: false,
      message: err.message || "Erro ao processar agendamento."
    };
  }
}

/**
 * Aprovação de Requisição pelo Admin.
 * Cria o evento no Google Calendar com Meet, atualiza Firestore
 * e envia e-mail de confirmação com invite.ics para o lead.
 */
export async function approveBookingRequestAction(requestId: string) {
  try {
    const calendar = await getCalendarClient();
    const duration = CALENDAR_CONFIG.MEETING_SETTINGS.duration;
    const meetingTitle = CALENDAR_CONFIG.MEETING_SETTINGS.title;

    // 1. Buscar dados da requisição no Firestore
    const requestRef = doc(db, "Booking_Requests", requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
      return { success: false, message: "Requisição não encontrada." };
    }

    const request = requestSnap.data();

    if (request.status !== "pending") {
      return { success: false, message: "Esta requisição já foi processada." };
    }

    const startTime = parseISO(request.requestedSlot);
    const endTime = addMinutes(startTime, duration);

    const eventDescription = `
👤 Cliente: ${request.name}
📧 E-mail: ${request.email}
📱 Telefone: ${request.phone}

📝 Triagem:
${Object.entries(request.screening || {}).map(([q, a]) => `• ${q}: ${a}`).join("\n")}

🆔 Request ID: ${requestId}
🔗 Agendado via BPlen HUB
    `.trim();

    // 2. Criar evento no Google Calendar (Calendário BPlen HUB)
    const calendarResponse = await calendar.events.insert({
      calendarId: serverEnv.GOOGLE_BOOKING_CALENDAR_ID,
      conferenceDataVersion: 1,
      requestBody: {
        summary: meetingTitle,
        description: eventDescription,
        start: { dateTime: formatISO(startTime) },
        end: { dateTime: formatISO(endTime) },
        // Removido attendees para evitar erro 403 de Domain-Wide Delegation.
        // O convite é enviado via arquivo .ics no email do Resend.
        conferenceData: {
          createRequest: {
            requestId: `bplen-${requestId}`,
            conferenceSolutionKey: { type: "hangoutsMeet" }
          }
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 30 },
          ],
        },
      }
    });

    const event = calendarResponse.data;
    const meetingLink = event.hangoutLink || "";

    // 3. Atualizar Firestore com dados da aprovação
    await updateDoc(requestRef, {
      status: "approved",
      calendarEventId: event.id,
      meetingLink,
      meetingTitle,
      meetingDuration: duration,
      approvedAt: serverTimestamp(),
    });

    // 4. Gerar arquivo .ics
    const icsContent = generateIcsString({
      title: meetingTitle,
      description: `Reunião 1 to 1 com a equipe BPlen.\n\nLink: ${meetingLink}`,
      location: meetingLink,
      start: startTime,
      end: endTime,
      uid: event.id || `bplen-${requestId}`
    });

    // 5. Enviar e-mail de confirmação com ICS
    await resend.emails.send({
      from: "BPlen HUB <hub@bplen.com>",
      to: [request.email],
      subject: `Confirmado: Sua reunião BPlen | 1 to 1 ✅`,
      attachments: [
        {
          filename: "invite-bplen.ics",
          content: Buffer.from(icsContent)
        }
      ],
      html: `
        <div style="font-family: 'Inter', sans-serif; color: #1D1D1F; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #fff;">

          <div style="text-align: center; margin-bottom: 40px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 16px; padding: 12px 28px;">
              <span style="color: white; font-weight: 900; font-size: 18px; letter-spacing: -0.02em;">BPlen HUB</span>
            </div>
          </div>

          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 64px; height: 64px; background: #22c55e15; border: 2px solid #22c55e40; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 28px;">✅</div>
          </div>

          <h2 style="font-size: 28px; font-weight: 900; color: #1D1D1F; letter-spacing: -0.03em; text-align: center; margin-bottom: 8px;">
            Reunião Confirmada!
          </h2>
          <p style="font-size: 16px; color: #555; line-height: 1.7; text-align: center; margin-bottom: 36px;">
            Olá, <strong>${request.name}</strong>! Sua reunião <strong>1 to 1</strong> com a equipe BPlen foi confirmada. Estamos ansiosos para conversar com você.
          </p>

          <div style="background: #f8f9ff; border: 1px solid #e8edff; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
            <p style="margin: 0 0 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #667eea;">Detalhes da Reunião</p>
            <p style="margin: 10px 0; font-size: 15px; color: #333;">📅 <strong>${format(startTime, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</strong></p>
            <p style="margin: 10px 0; font-size: 15px; color: #333;">⏰ <strong>${format(startTime, "HH:mm")} às ${format(endTime, "HH:mm")}</strong> (45 minutos)</p>
            <p style="margin: 10px 0; font-size: 15px; color: #333;">💻 <strong>Google Meet</strong></p>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${meetingLink}" target="_blank"
               style="display: inline-block; padding: 18px 40px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; text-decoration: none; border-radius: 16px; font-weight: 800; font-size: 15px; letter-spacing: -0.01em; box-shadow: 0 8px 24px rgba(102,126,234,0.3);">
              🎥 Entrar na Reunião
            </a>
          </div>

          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px 20px; margin-bottom: 32px;">
            <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.6;">
              📎 <strong>Convite de Calendário:</strong> Anexamos um arquivo <code>.ics</code> a este e-mail. Abra-o para adicionar a reunião automaticamente à sua agenda.
            </p>
          </div>

          <hr style="border: 0; border-top: 1px solid #eee; margin: 40px 0;" />
          <p style="font-size: 11px; color: #86868b; text-align: center; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">
            BPlen HUB — Evolução através da excelência.
          </p>
        </div>
      `,
    });

    return { success: true, meetingLink };
  } catch (error: unknown) {
    console.error("Erro no approveBookingRequestAction:", error);
    const err = error as Error;
    return {
      success: false,
      message: err.message || "Erro ao aprovar agendamento."
    };
  }
}

/**
 * Rejeita uma requisição de agendamento.
 */
export async function rejectBookingRequestAction(requestId: string) {
  try {
    const requestRef = doc(db, "Booking_Requests", requestId);
    await updateDoc(requestRef, {
      status: "rejected",
      slotBlocked: false, // Libera o slot para outros
      rejectedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: unknown) {
    console.error("Erro no rejectBookingRequestAction:", error);
    return { success: false, message: "Erro ao rejeitar requisição." };
  }
}

/**
 * Busca todas as requisições de agendamento para o Admin.
 */
export async function getBookingRequestsAction(statusFilter?: "pending" | "approved" | "rejected") {
  try {
    let q;
    if (statusFilter) {
      q = query(
        collection(db, "Booking_Requests"),
        where("status", "==", statusFilter)
      );
    } else {
      q = query(collection(db, "Booking_Requests"));
    }

    const snap = await getDocs(q);
    const requests: {
      id: string;
      name: string;
      email: string;
      phone: string;
      screening: Record<string, string>;
      requestedSlot: string;
      requestedSlotEnd: string;
      status: string;
      meetingLink?: string;
      createdAt: string;
    }[] = [];

    snap.forEach((docSnap) => {
      const d = docSnap.data();
      requests.push({
        id: docSnap.id,
        name: d.name,
        email: d.email,
        phone: d.phone,
        screening: d.screening || {},
        requestedSlot: d.requestedSlot,
        requestedSlotEnd: d.requestedSlotEnd,
        status: d.status,
        meetingLink: d.meetingLink,
        createdAt: d.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      });
    });

    // Ordenar por data de criação (mais recente primeiro)
    requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return requests;
  } catch (error: unknown) {
    console.error("Erro ao buscar requisições:", error);
    return [];
  }
}
