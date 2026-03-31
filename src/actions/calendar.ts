"use server";

import { getCalendarClient } from "@/lib/google-auth";
import { serverEnv } from "@/env";
import { formatISO, addDays } from "date-fns";
import { doc, setDoc, serverTimestamp, getDocs, collection, query, where } from "firebase/firestore";
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

    return items.map((item) => ({
      id: item.id || crypto.randomUUID(),
      summary: item.summary || "Sem Título",
      description: item.description || "",
      start: item.start?.dateTime || item.start?.date || "",
      end: item.end?.dateTime || item.end?.date || "",
      location: item.location || "",
      htmlLink: item.htmlLink || "",
    }));
  } catch (error) {
    console.error("Erro ao buscar eventos do Google Calendar:", error);
    return [];
  }
}

/**
 * Sincronização de 90 Dias (Firestore 🛡️)
 * Captura todos os eventos do Google e persiste no banco de dados.
 * Lógica: Incremental (não deleta passados).
 */
export async function syncCalendarToFirestore() {
  try {
    const calendar = await getCalendarClient();
    const now = new Date();
    const ninetyDaysOut = addDays(now, 90);

    const timeMin = formatISO(now);
    const timeMax = formatISO(ninetyDaysOut);

    console.log(`🔄 Iniciando sincronização: ${timeMin} até ${timeMax}`);

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
      const eventId = item.id;
      if (!eventId) continue;

      const eventRef = doc(db, "Calendar_Events", eventId);
      
      await setDoc(eventRef, {
        id: eventId,
        summary: item.summary || "Sem Título",
        description: item.description || "",
        start: item.start?.dateTime || item.start?.date || "",
        end: item.end?.dateTime || item.end?.date || "",
        htmlLink: item.htmlLink || "",
        lastSync: serverTimestamp(),
        status: "sincronizado" // Pode indicar que veio do Google
      }, { merge: true });

      syncCount++;
    }

    return { 
      success: true, 
      count: syncCount,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error("Erro na sincronização de agenda:", error);
    throw new Error(error.message || "Falha crítica na sincronização de agenda.");
  }
}

/**
 * Busca os eventos sincronizados diretamente do Firestore.
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
