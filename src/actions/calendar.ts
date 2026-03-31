"use server";

import { getCalendarClient } from "@/lib/google-auth";
import { serverEnv } from "@/env";
import { formatISO, addDays, getISOWeek, getYear, parseISO, isBefore, startOfDay } from "date-fns";
import { doc, setDoc, serverTimestamp, getDocs, collection, query, runTransaction, where, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * BPlen HUB — Google Calendar Actions
 * Busca, Sincronização e Leitura de Eventos do Workspace BPlen.
 */

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  htmlLink: string;
  totalCapacity?: number;
  registeredCount?: number;
  mentor?: string;
  theme?: string;
  status?: string;
}

/**
 * Busca eventos do Google Calendar para visualização rápida no Front.
 */
export async function fetchCalendarEvents(dateReference: Date): Promise<GoogleCalendarEvent[]> {
  try {
    const calendar = await getCalendarClient();
    
    // Busca do mês base para visualização simples
    const timeMin = formatISO(new Date(dateReference.getFullYear(), dateReference.getMonth(), 1));
    const timeMax = formatISO(new Date(dateReference.getFullYear(), dateReference.getMonth() + 1, 0));

    const response = await calendar.events.list({
      calendarId: serverEnv.GOOGLE_CALENDAR_ID,
      timeMin,
      timeMax,
      maxResults: 250,
      singleEvents: true,
      orderBy: "startTime",
    });

    const items = response.data.items || [];

    return items.map((item: any) => {
      const description = item.description || "";
      const capacityMatch = description.match(/Vagas:\s*(\d+)/i);
      const mentorMatch = description.match(/Orientador:\s*(.*)/i);
      const themeMatch = description.match(/Tema:\s*(.*)/i);

      // Limpar descrição para exibição
      const cleanDescription = description
        .replace(/Vagas:\s*\d+/gi, "")
        .replace(/Orientador:\s*.*/gi, "")
        .replace(/Tema:\s*.*/gi, "")
        .trim();

      return {
        id: item.id || crypto.randomUUID(),
        summary: item.summary || "Sem Título",
        description: cleanDescription,
        start: item.start?.dateTime || item.start?.date || "",
        end: item.end?.dateTime || item.end?.date || "",
        location: item.location || "",
        htmlLink: item.htmlLink || "",
        totalCapacity: capacityMatch ? parseInt(capacityMatch[1]) : 0,
        mentor: mentorMatch ? mentorMatch[1].trim() : "BPlen",
        theme: themeMatch ? themeMatch[1].trim() : undefined,
      };
    });
  } catch (error) {
    console.error("Erro ao buscar eventos do Google Calendar:", error);
    return [];
  }
}

/**
 * Sincronização de 90 Dias (Firestore 🛡️)
 */
export async function syncCalendarToFirestore() {
  try {
    const calendar = await getCalendarClient();
    const now = new Date();
    const ninetyDaysOut = addDays(now, 90);

    const timeMin = formatISO(now);
    const timeMax = formatISO(ninetyDaysOut);

    const response = await calendar.events.list({
      calendarId: serverEnv.GOOGLE_CALENDAR_ID,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
    });

    const items = response.data.items || [];
    let syncCount = 0;

    for (const item of items) {
      if (!item.id) continue;

      const description = item.description || "";
      const capacityMatch = description.match(/Vagas:\s*(\d+)/i);
      const mentorMatch = description.match(/Orientador:\s*(.*)/i);
      const themeMatch = description.match(/Tema:\s*(.*)/i);

      const cleanDescription = description
        .replace(/Vagas:\s*\d+/gi, "")
        .replace(/Orientador:\s*.*/gi, "")
        .replace(/Tema:\s*.*/gi, "")
        .trim();

      const eventRef = doc(db, "Calendar_Events", item.id);
      
      // Upsert: Preserva registeredCount se já existir
      await setDoc(eventRef, {
        id: item.id,
        summary: item.summary || "Sem Título",
        description: cleanDescription,
        start: item.start?.dateTime || item.start?.date || "",
        end: item.end?.dateTime || item.end?.date || "",
        htmlLink: item.htmlLink || "",
        totalCapacity: capacityMatch ? parseInt(capacityMatch[1]) : 0,
        mentor: mentorMatch ? mentorMatch[1].trim() : "BPlen",
        theme: themeMatch ? themeMatch[1].trim() : null,
        lastSync: serverTimestamp(),
      }, { merge: true });

      syncCount++;
    }

    return { success: true, count: syncCount, timestamp: new Date().toISOString() };
  } catch (error: any) {
    console.error("Erro na sincronização de agenda:", error);
    throw new Error(error.message || "Falha na sincronização.");
  }
}

/**
 * Agendamento de Evento (Workflow de Governança 🔐)
 */
export async function bookEventAction(eventId: string, userId: string, userEmail: string): Promise<{ success: boolean; message: string }> {
  try {
    const eventRef = doc(db, "Calendar_Events", eventId);
    
    return await runTransaction(db, async (transaction) => {
      const eventSnap = await transaction.get(eventRef);
      if (!eventSnap.exists()) throw new Error("Evento não encontrado.");

      const eventData = eventSnap.data();
      const startTime = parseISO(eventData.start);
      const now = new Date();

      // REGRA 1: Lead-Time de 3 Dias
      const minLeadTime = addDays(startOfDay(now), 3);
      if (isBefore(startTime, minLeadTime)) {
        throw new Error("Agendamentos permitidos apenas com 3 dias de antecedência.");
      }

      // REGRA 2: Janela Onboarding (Max 20 dias)
      if (eventData.summary.toLowerCase().includes("onboarding")) {
        const maxOnboardingWindow = addDays(startOfDay(now), 20);
        if (!isBefore(startTime, maxOnboardingWindow)) {
          throw new Error("Eventos de Onboarding só podem ser agendados até 20 dias à frente.");
        }
      }

      // REGRA 3: 1 Evento por Semana ISO
      const week = getISOWeek(startTime);
      const year = getYear(startTime);
      const weekBookingId = `${userId}_week_${week}_${year}`;
      const weekBookingRef = doc(db, "User_Bookings", weekBookingId);
      
      const weekBookingSnap = await transaction.get(weekBookingRef);
      if (weekBookingSnap.exists()) {
        throw new Error(`Você já possui um agendamento para a Semana SI-${week.toString().padStart(2, '0')}. Limite: 1 por semana.`);
      }

      // REGRA 4: Capacidade
      const capacity = eventData.totalCapacity || 0;
      const registered = eventData.registeredCount || 0;
      if (registered >= capacity) {
        throw new Error("Infelizmente as vagas para este horário esgotaram.");
      }

      // EXECUÇÃO:
      // 1. Criar registro de participação
      const attendeeRef = doc(db, `Calendar_Events/${eventId}/attendees`, userId);
      transaction.set(attendeeRef, {
        userId,
        email: userEmail,
        timestamp: serverTimestamp()
      });

      // 2. Incrementar contador
      transaction.update(eventRef, {
        registeredCount: registered + 1
      });

      // 3. Registrar trava de semana
      transaction.set(weekBookingRef, {
        userId,
        eventId,
        week,
        year,
        timestamp: serverTimestamp()
      });

      return { success: true, message: "Sucesso" };
    });
  } catch (error: any) {
    console.error("Erro no booking:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Busca eventos sincronizados diretamente do Firestore.
 */
export async function getSyncedEvents() {
    try {
      const q = query(collection(db, "Calendar_Events"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as GoogleCalendarEvent);
    } catch (error) {
      console.error("Erro ao buscar eventos do Firestore:", error);
      return [];
    }
}

/**
 * Busca agendamentos do usuário e enriquece com detalhes do evento.
 */
export async function getUserBookingsAction(userId: string) {
  try {
    const q = query(collection(db, "User_Bookings"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    // Buscar todos os eventos sincronizados para o "join" em memória
    // Em uma escala maior, usaríamos um Map ou buscaríamos apenas os IDs necessários
    const allEvents = await getSyncedEvents();
    const eventsMap = new Map(allEvents.map(e => [e.id, e]));

    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      const eventDetail = eventsMap.get(data.eventId);
      
      return {
        id: docSnap.id,
        eventId: data.eventId,
        userId: data.userId,
        week: data.week,
        year: data.year,
        timestamp: data.timestamp?.toDate?.()?.toISOString() || null,
        rating: data.rating || 0,
        feedback: data.feedback || "",
        eventDetail: eventDetail || null
      };
    }).sort((a, b) => {
      const startA = a.eventDetail ? new Date(a.eventDetail.start).getTime() : 0;
      const startB = b.eventDetail ? new Date(b.eventDetail.start).getTime() : 0;
      return startB - startA; // Mais recentes primeiro
    });
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return [];
  }
}

/**
 * Submete avaliação Likert e feedback para um agendamento.
 */
export async function submitEvaluationAction(bookingId: string, rating: number, feedback: string) {
  try {
    const bookingRef = doc(db, "User_Bookings", bookingId);
    await setDoc(bookingRef, {
      rating,
      feedback,
      evaluatedAt: serverTimestamp()
    }, { merge: true });
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao submeter avaliação:", error);
    return { success: false };
  }
}
