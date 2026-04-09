"use server";

import { getAdminDb } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";
import { serverEnv } from "@/env";
import {
  formatISO,
  parseISO,
  isBefore,
  startOfDay,
  isAfter,
  addDays
} from "date-fns";
import { CALENDAR_CONFIG } from "@/config/calendarConfig";
import { bookEventAction } from "./calendar";
import { Resend } from "resend";

const resend = new Resend(serverEnv.RESEND_API_KEY);

/**
 * Interface para os slots de tempo disponíveis (Mapeada do Calendário Interno)
 */
export interface TimeSlot {
  id: string;      // ID do Evento no Firestore/Google
  start: string;   // ISO String
  end: string;     // ISO String
  available: boolean;
  summary: string;
}

/**
 * Busca slots disponíveis para agendamento público (1 to 1).
 * Agora baseia-se nos eventos já sincronizados na coleção Calendar_Events via Admin SDK.
 */
export async function getPublicSlotsAction(dateStr: string): Promise<TimeSlot[]> {
  try {
    const db = getAdminDb();
    const targetDate = parseISO(dateStr);
    const timeMin = formatISO(startOfDay(targetDate));
    const timeMax = formatISO(addDays(startOfDay(targetDate), 1));

    // 1. Consultar eventos 1 to 1 no Firestore (Admin)
    const snap = await db.collection("Calendar_Events")
      .where("start", ">=", timeMin)
      .where("start", "<", timeMax)
      .orderBy("start", "asc")
      .get();

    const slots: TimeSlot[] = [];
    const now = new Date();
    const minAllowedTime = addDays(now, CALENDAR_CONFIG.PUBLIC_BOOKING_SETTINGS.minDaysInFuture);

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const summary = data.summary || "";
      
      if (summary.toLowerCase().includes("1 to 1")) {
        const startTime = parseISO(data.start);
        const registered = data.registeredCount || 0;
        const capacity = data.totalCapacity || 1;

        const isAvailable = registered < capacity && isAfter(startTime, minAllowedTime);

        slots.push({
          id: docSnap.id,
          start: data.start,
          end: data.end,
          summary: data.summary,
          available: isAvailable
        });
      }
    });

    return slots;
  } catch (error: unknown) {
    console.error("Erro ao buscar slots públicos unificados:", error);
    return [];
  }
}

import { bookingScreeningFormConfig } from "@/config/forms/booking-screening";
import { submitGenericForm } from "./generic-form";

/**
 * Interface adaptada para o bookPublicMeetingAction (Forms_Global 🧬)
 */
export async function bookPublicMeetingAction(formData: {
  name: string;
  email: string;
  phone: string;
  screening: Record<string, string>;
  slot: string; // Este é o ID do evento (eventId)
}) {
  try {
    const userId = `lead_${Buffer.from(formData.email).toString('base64').substring(0, 10)}`;

    // 1. Persistência Institucional da Triagem (Forms_Global - Já usa Admin Action)
    await submitGenericForm(bookingScreeningFormConfig, formData.screening, userId);

    // 2. Execução do Booking (Já usa Admin Action)
    const result = await bookEventAction(
      formData.slot,
      userId,
      formData.email,
      undefined,
      undefined,
      { 
        type: formData.screening.objetivo || "Reunião Estratégica", 
        expectations: `Cargo: ${formData.screening.cargo} | Como conheceu: ${formData.screening.conheceu_como}` 
      },
      { 
        name: formData.name, 
        phone: formData.phone 
      }
    );

    return result;
  } catch (error: unknown) {
    console.error("Erro no bookPublicMeetingAction institucional:", error);
    return {
      success: false,
      message: "Erro ao processar seu agendamento."
    };
  }
}

/**
 * Busca todos os dias que possuem pelo menos um slot disponível nos próximos meses.
 */
export async function getPublicAvailableDaysAction(): Promise<string[]> {
  try {
    const db = getAdminDb();
    const now = new Date();
    const minAllowedDate = addDays(startOfDay(now), CALENDAR_CONFIG.PUBLIC_BOOKING_SETTINGS.minDaysInFuture);
    const maxAllowedDate = addDays(startOfDay(now), CALENDAR_CONFIG.PUBLIC_BOOKING_SETTINGS.maxDaysInFuture);

    const timeMin = formatISO(minAllowedDate);
    const timeMax = formatISO(maxAllowedDate);

    const snap = await db.collection("Calendar_Events")
      .where("start", ">=", timeMin)
      .where("start", "<", timeMax)
      .orderBy("start", "asc")
      .get();

    const availableDaysSet = new Set<string>();
    const minAllowedTime = addDays(now, CALENDAR_CONFIG.PUBLIC_BOOKING_SETTINGS.minDaysInFuture);

    snap.forEach((doc) => {
      const data = doc.data();
      const summary = data.summary || "";
      if (summary.toLowerCase().includes("1 to 1")) {
        const startTime = parseISO(data.start);
        const registered = data.registeredCount || 0;
        const capacity = data.totalCapacity || 1;

        if (registered < capacity && isAfter(startTime, minAllowedTime)) {
          availableDaysSet.add(formatISO(startOfDay(startTime), { representation: 'date' }));
        }
      }
    });

    return Array.from(availableDaysSet);
  } catch (error) {
    console.error("Erro ao buscar dias disponíveis:", error);
    return [];
  }
}

/**
 * Submete uma proposta de agenda via Admin SDK.
 */
export async function submitBookingProposalAction(formData: {
  name: string;
  email: string;
  phone: string;
  screening: Record<string, string>;
  options: { date: string; time: string }[];
}) {
  try {
    const db = getAdminDb();
    const leadId = `lead_${Buffer.from(formData.email).toString('base64').substring(0, 10)}`;
    const proposalId = `prop_${Date.now()}_${Buffer.from(formData.email).toString('base64').substring(0, 5)}`;
    
    // 1. Persistência Institucional da Triagem (Forms_Global)
    await submitGenericForm(bookingScreeningFormConfig, formData.screening, leadId);

    // 2. Gravacao da Proposta (Autoridade Admin)
    await db.collection("Booking_Proposals").doc(proposalId).set({
      ...formData,
      status: "pending",
      createdAt: new Date().toISOString(),
      type: "External_Proposal",
      leadId
    });

    // --- Envio de E-mail (Assíncrono via Resend) ---
    try {
      const optionsHtml = formData.options.map(opt => {
        const d = parseISO(opt.date);
        return `<li style="margin-bottom: 8px;">📅 <b>${d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</b> às <b>${opt.time}h</b></li>`;
      }).join('');

      await resend.emails.send({
        from: `BPlen HUB <hub@bplen.com>`,
        to: formData.email,
        subject: `Recebemos sua proposta de agenda na BPlen HUB!`,
        html: `
          <div style="font-family: sans-serif; color: #1d1d1f; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 20px;">
            <h2 style="color: #ff2c8d; margin-bottom: 5px;">🧬 Proposta Recebida!</h2>
            <p style="font-size: 16px; margin-top: 0;">Olá, <b>${formData.name}</b>!</p>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              Não encontramos um horário livre que se encaixasse perfeitamente no momento, mas já recebemos suas sugestões. 
              Nossa equipe analisará a disponibilidade e entrará em contato em breve para confirmar uma das opções abaixo:
            </p>

            <div style="background: #fdfdfd; padding: 20px; border-radius: 16px; border: 1px solid #f0f0f0; margin: 20px 0;">
              <p style="margin: 0 0 15px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px;"><b>SUAS OPÇÕES SUGERIDAS</b></p>
              <ul style="padding: 0; list-style: none; margin: 0; font-size: 14px; color: #1d1d1f;">
                ${optionsHtml}
              </ul>
            </div>

            <div style="background: #fff5f9; padding: 15px; border-radius: 12px; border-left: 4px solid #ff2c8d; margin: 20px 0;">
              <p style="margin: 0; font-size: 13px; color: #ff2c8d;"><b>PRÓXIMO PASSO:</b> Fique de olho no seu WhatsApp e e-mail. Vamos te dar um retorno oficial nas próximas horas comerciais.</p>
            </div>

            <p style="font-size: 12px; color: #666; text-align: center; margin-top: 30px;">
              Obrigado por querer descomplicar o desenvolvimento humano conosco!
            </p>
            
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 10px; color: #9ca3af; text-align: center;">BPlen HUB — Inteligência em Gestão e Desenvolvimento</p>
          </div>
        `
      });
    } catch (emailErr) {
      console.error("Erro ao enviar e-mail de proposta (ignorado):", emailErr);
    }

    return {
      success: true,
      message: "Proposta enviada com sucesso! Entraremos em contato em breve."
    };
  } catch (error) {
    console.error("Erro ao submeter proposta:", error);
    return {
      success: false,
      message: "Erro ao enviar proposta. Tente novamente."
    };
  }
}
