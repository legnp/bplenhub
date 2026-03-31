"use server";

import { getCalendarClient } from "@/lib/google-auth";
import { serverEnv } from "@/env";
import { formatISO, addDays, getISOWeek, getYear, parseISO, isBefore, startOfDay, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { doc, setDoc, serverTimestamp, getDocs, collection, query, runTransaction, where, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Resend } from "resend";
import { CALENDAR_CONFIG } from "@/config/calendarConfig";

const resend = new Resend(serverEnv.RESEND_API_KEY);

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
 * Identifica novos eventos, atualiza existentes e remove "fantasmas" (deletados no Google).
 */
export async function syncCalendarToFirestore() {
  try {
    const calendar = await getCalendarClient();
    const now = new Date();
    const ninetyDaysOut = addDays(now, CALENDAR_CONFIG.SYNC_WINDOW_DAYS);

    const timeMin = formatISO(now);
    const timeMax = formatISO(ninetyDaysOut);

    const response = await calendar.events.list({
      calendarId: serverEnv.GOOGLE_CALENDAR_ID,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
    });

    const googleItems = response.data.items || [];
    const googleIds = new Set(googleItems.map(item => item.id).filter(Boolean));

    // 1. Cleanup: Buscar eventos no Firestore nesse período para detecção de deletados
    const eventsQuery = query(
      collection(db, "Calendar_Events"),
      where("start", ">=", timeMin),
      where("start", "<=", timeMax)
    );
    const firestoreSnap = await getDocs(eventsQuery);
    
    let deleteCount = 0;
    for (const docSnap of firestoreSnap.docs) {
      if (!googleIds.has(docSnap.id)) {
        await runTransaction(db, async (transaction) => {
          // Remover evento e travas de semana associadas? 
          // Por segurança, apenas marcamos como 'deleted_on_google' ou removemos o evento principal.
          // Aqui optaremos por deletar o evento do calendário para não poluir a UI.
          transaction.delete(docSnap.ref);
        });
        deleteCount++;
      }
    }

    // 2. Upsert: Sincronizar dados atuais do Google
    let syncCount = 0;
    for (const item of googleItems) {
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
      
      // Upsert: Preserva registeredCount se já existir via merge: true
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

    return { 
      success: true, 
      synced: syncCount, 
      deleted: deleteCount,
      timestamp: new Date().toISOString() 
    };
  } catch (error: any) {
    console.error("Erro na sincronização de agenda:", error);
    throw new Error(error.message || "Falha na sincronização.");
  }
}

/**
 * Agendamento de Evento (Workflow de Governança 🔐)
 */
export async function bookEventAction(
  eventId: string, 
  userId: string, 
  userEmail: string,
  oneToOneData?: { type: string; expectations: string }
): Promise<{ success: boolean; message: string }> {
  try {
    const eventRef = doc(db, "Calendar_Events", eventId);
    
    // 1. Buscar Matrícula e Nickname
    const uidMapRef = doc(db, "_AuthMap", userId);
    const uidMapSnap = await getDoc(uidMapRef);
    
    let matricula = "N/A";
    let nickname = "Membro BPlen";

    if (uidMapSnap.exists()) {
      matricula = uidMapSnap.data().matricula || "N/A";
      const userRef = doc(db, "User", matricula);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        nickname = userSnap.data().User_Nickname || userSnap.data().User_Name || "Membro BPlen";
      }
    }

    return await runTransaction(db, async (transaction) => {
      const eventSnap = await transaction.get(eventRef);
      if (!eventSnap.exists()) throw new Error("Evento não encontrado.");

      const eventData = eventSnap.data() as GoogleCalendarEvent;
      const startTime = parseISO(eventData.start);
      const now = new Date();

      // [REGRAS DE GOVERNANÇA CENTRALIZADAS 🔐]
      const minLeadTime = addDays(startOfDay(now), CALENDAR_CONFIG.MIN_LEAD_TIME_DAYS);
      if (isBefore(startTime, minLeadTime)) {
        throw new Error(`Agendamentos permitidos apenas com ${CALENDAR_CONFIG.MIN_LEAD_TIME_DAYS} dias de antecedência.`);
      }

      if (eventData.summary.toLowerCase().includes("onboarding")) {
        const maxOnboardingWindow = addDays(startOfDay(now), CALENDAR_CONFIG.MAX_ONBOARDING_WINDOW_DAYS);
        if (!isBefore(startTime, maxOnboardingWindow)) {
          throw new Error(`Eventos de Onboarding só podem ser agendados até ${CALENDAR_CONFIG.MAX_ONBOARDING_WINDOW_DAYS} dias à frente.`);
        }
      }

      const week = getISOWeek(startTime);
      const year = getYear(startTime);
      const weekBookingId = `${userId}_week_${week}_${year}`;
      const weekBookingRef = doc(db, "User_Bookings", weekBookingId);
      
      const weekBookingSnap = await transaction.get(weekBookingRef);
      if (weekBookingSnap.exists()) {
        throw new Error(`Você já possui um agendamento para a Semana SI-${week.toString().padStart(2, '0')}. Limite: 1 por semana.`);
      }

      const capacity = eventData.totalCapacity || 0;
      const registered = eventData.registeredCount || 0;
      if (registered >= capacity) {
        throw new Error("Infelizmente as vagas para este horário esgotaram.");
      }

      // EXECUÇÃO:
      // 1. Criar registro de participação detalhado
      const attendeeRef = doc(db, `Calendar_Events/${eventId}/attendees`, userId);
      transaction.set(attendeeRef, {
        userId,
        matricula,
        nickname,
        email: userEmail,
        timestamp: serverTimestamp(),
        ...oneToOneData
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
        oneToOneData: oneToOneData || null,
        timestamp: serverTimestamp()
      });

      // 4. Enviar E-mail (Workflow Resend)
      try {
        const dateStr = format(startTime, "dd 'de' MMMM", { locale: ptBR });
        const timeStr = format(startTime, "HH:mm");
        const cancelLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://hub.bplen.com'}/admin/gestao-agenda`;

        let oneToOneInfo = "";
        if (oneToOneData) {
          oneToOneInfo = `
            <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid #667eea;">
              <p style="margin: 0; font-size: 12px; color: #666;"><b>TIPO DE 1 TO 1:</b> ${oneToOneData.type}</p>
              <p style="margin: 10px 0 0 0; font-size: 13px; color: #1d1d1f;"><b>EXPECTATIVAS:</b><br/>${oneToOneData.expectations}</p>
            </div>
          `;
        }

        await resend.emails.send({
          from: `BPlen HUB <${CALENDAR_CONFIG.OFFICIAL_EMAIL}>`,
          to: userEmail,
          subject: `${nickname}, seu ${eventData.summary} foi confirmado na BPlen HUB!`,
          html: `
            <div style="font-family: sans-serif; color: #1d1d1f; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 20px;">
              <h2 style="color: #667eea; margin-bottom: 5px;">📍 Agendamento Confirmado!</h2>
              <p style="font-size: 16px; margin-top: 0;">Olá, <b>${nickname}</b>!</p>
              
              <div style="background: #fdfdfd; padding: 20px; border-radius: 16px; border: 1px solid #f0f0f0; margin: 20px 0;">
                <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px;"><b>EVENTO</b></p>
                <p style="margin: 5px 0 15px 0; font-size: 18px; color: #1d1d1f;"><b>${eventData.summary}</b></p>
                
                <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase;"><b>DATA E HORA</b></p>
                <p style="margin: 5px 0 15px 0; font-size: 14px;">${dateStr} às ${timeStr}h</p>
                
                <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase;"><b>ORIENTADOR</b></p>
                <p style="margin: 5px 0 0 0; font-size: 14px;">${eventData.mentor || "BPlen"}</p>
                
                ${eventData.theme ? `
                  <p style="margin: 15px 0 0 0; font-size: 12px; color: #999; text-transform: uppercase;"><b>TEMA</b></p>
                  <p style="margin: 5px 0 0 0; font-size: 14px;">${eventData.theme}</p>
                ` : ""}

                ${oneToOneInfo}
              </div>

              <div style="margin: 25px 0; text-align: center;">
                <a href="${eventData.htmlLink}" style="background: #667eea; color: white; padding: 12px 30px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">ACESSAR REUNIÃO</a>
              </div>

              <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
              
              <p style="font-size: 12px; color: #666; text-align: center; line-height: 1.5;">
                Deseja reagendar ou cancelar? <br/>
                <a href="${cancelLink}" style="color: #667eea; font-weight: bold;">Gerenciar minha agenda no HUB</a>
              </p>
            </div>
          `
        });
      } catch (emailError) {
        console.error("Erro ao enviar e-mail de confirmação:", emailError);
        // Não falhamos o agendamento se apenas o e-mail falhar, mas logamos.
      }

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

/**
 * Cancela um agendamento, estornando a vaga e liberando a trava de semana.
 */
export async function cancelBookingAction(
  bookingId: string,
  eventId: string,
  userId: string,
  week: number,
  year: number
) {
  try {
    return await runTransaction(db, async (transaction) => {
      const eventRef = doc(db, "Calendar_Events", eventId);
      const bookingRef = doc(db, "User_Bookings", bookingId);
      const weekBookingId = `${userId}_week_${week}_${year}`;
      const weekBookingRef = doc(db, "User_Bookings", weekBookingId);
      const attendeeRef = doc(db, `Calendar_Events/${eventId}/attendees`, userId);

      const eventSnap = await transaction.get(eventRef);
      if (!eventSnap.exists()) throw new Error("Evento não encontrado.");

      const eventData = eventSnap.data();
      const currentRegistered = eventData.registeredCount || 0;

      // 1. Decrementar contador de vagas (mínimo 0)
      transaction.update(eventRef, {
        registeredCount: Math.max(0, currentRegistered - 1)
      });

      // 2. Remover o registro de participação
      transaction.delete(attendeeRef);

      // 3. Remover o agendamento do usuário (libera a trava de semana)
      transaction.delete(bookingRef);

      // 4. Se o agendamento for a trava de semana (o que geralmente é), remover também
      if (bookingId !== weekBookingId) {
        transaction.delete(weekBookingRef);
      }

      return { success: true };
    });
  } catch (error: any) {
    console.error("Erro ao cancelar agendamento:", error);
    return { success: false, message: error.message };
  }
}
