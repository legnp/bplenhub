"use server";

import { serverEnv } from "@/env";
import {
  formatISO,
  parseISO,
  isBefore,
  startOfDay,
  isAfter,
  addDays
} from "date-fns";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CALENDAR_CONFIG } from "@/config/calendarConfig";
import { bookEventAction } from "./calendar";

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
 * Agora baseia-se nos eventos já sincronizados na coleção Calendar_Events.
 */
export async function getPublicSlotsAction(dateStr: string): Promise<TimeSlot[]> {
  try {
    const targetDate = parseISO(dateStr);
    const timeMin = formatISO(startOfDay(targetDate));
    const timeMax = formatISO(addDays(startOfDay(targetDate), 1));

    // 1. Consultar eventos 1 to 1 no Firestore
    const eventsQuery = query(
      collection(db, "Calendar_Events"),
      where("start", ">=", timeMin),
      where("start", "<", timeMax),
      orderBy("start", "asc")
    );

    const snap = await getDocs(eventsQuery);
    const slots: TimeSlot[] = [];

    const now = new Date();
    // Respeitar o lead time configurado
    const minAllowedTime = addDays(now, CALENDAR_CONFIG.PUBLIC_BOOKING_SETTINGS.minDaysInFuture);

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const summary = data.summary || "";
      
      // FILTRO: Apenas eventos que contenham "1 to 1"
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

/**
 * Interface adaptada para o bookPublicMeetingAction
 */
export async function bookPublicMeetingAction(formData: {
  name: string;
  email: string;
  phone: string;
  screening: Record<string, string>;
  slot: string; // Este é o ID do evento (eventId)
}) {
  try {
    // Agora simplesmente repassamos para a bookEventAction unificada
    // O userId para leads pode ser um hash do email ou um UUID temporário
    const userId = `lead_${Buffer.from(formData.email).toString('base64').substring(0, 10)}`;

    const result = await bookEventAction(
      formData.slot, // eventId
      userId,
      formData.email,
      undefined, // sem matricula
      undefined, // sem nickname
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
    console.error("Erro no bookPublicMeetingAction unificado:", error);
    return {
      success: false,
      message: "Erro ao processar seu agendamento."
    };
  }
}
