"use server";

import { getCalendarClient } from "@/lib/google-auth";
import { serverEnv } from "@/env";
import { formatISO, addDays, getISOWeek, getYear, parseISO, isBefore, startOfDay, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { doc, setDoc, serverTimestamp, getDocs, collection, query, runTransaction, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Resend } from "resend";
import { CALENDAR_CONFIG } from "@/config/calendarConfig";

import { calendar_v3 } from "googleapis";

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

export interface UserBooking {
  id: string;
  eventId: string;
  userId: string;
  week: number;
  year: number;
  category?: string;
  timestamp: string | null;
  rating: number;
  feedback: string;
  evaluatedAt?: string | null;
  eventDetail: GoogleCalendarEvent | null;
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

    return items.map((item: calendar_v3.Schema$Event) => {
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
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Erro na sincronização de agenda:", error);
    throw new Error(error.message || "Falha na sincronização.");
  }
}

/**
 * Agendamento de Evento (Nova Arquitetura: Subcoleção de User 🔐)
 */
export async function bookEventAction(
  eventId: string, 
  userId: string, 
  userEmail: string,
  matricula?: string, // Opcional para Leads
  nickname?: string,  // Opcional para Leads
  oneToOneData?: { type: string; expectations: string },
  leadInfo?: { name: string; phone: string } // Novo campo para Leads
): Promise<{ success: boolean; message: string }> {
  try {
    const eventRef = doc(db, "Calendar_Events", eventId);
    const displayName = nickname || leadInfo?.name || "Convidado BPlen";

    const trxResult = await runTransaction(db, async (transaction) => {
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

      let category = "geral";
      const evSum = eventData.summary.toLowerCase();
      if (evSum.includes("1 to 1")) category = "1to1";
      else if (evSum.includes("orientação em grupo") || evSum.includes("orientacao em grupo")) category = "grupo";
      else if (evSum.includes("orientação individual") || evSum.includes("orientacao individual")) category = "individual";

      // Trava de semana na nova subcoleção (Apenas para usuários internos logados)
      const weekBookingId = `week_${week}_${year}_${category}`;
      const weekBookingRef = matricula 
        ? doc(db, "User", matricula, "User_Bookings", weekBookingId)
        : null;
      
      if (weekBookingRef) {
        const weekBookingSnap = await transaction.get(weekBookingRef);
        if (weekBookingSnap.exists()) {
          const catName = category === "grupo" ? "Orientação em Grupo" : category === "individual" ? "Orientação Individual" : category === "1to1" ? "1-to-1" : "evento genérico";
          throw new Error(`Você já possui um agendamento de ${catName} para a Semana SI-${week.toString().padStart(2, '0')}. Limite: 1 de cada formato na semana.`);
        }
      }

      const capacity = eventData.totalCapacity || 1; // Default 1 para 1 to 1
      const registered = eventData.registeredCount || 0;
      if (registered >= capacity) {
        throw new Error("Infelizmente as vagas para este horário esgotaram.");
      }

      // EXECUÇÃO:
      // 1. Criar registro de participação detalhado no evento (Para ambos: Lead ou User)
      const attendeeRef = doc(db, `Calendar_Events/${eventId}/attendees`, userId);
      transaction.set(attendeeRef, {
        userId,
        matricula: matricula || "LEAD_EXTERNO",
        nickname: displayName,
        email: userEmail,
        phone: leadInfo?.phone || null,
        isLead: !matricula,
        timestamp: serverTimestamp(),
        ...oneToOneData
      });

      // 2. Incrementar contador
      transaction.update(eventRef, {
        registeredCount: registered + 1
      });

      // 3. Registrar trava de semana na subcoleção do usuário (Apenas se for usuário interno)
      if (weekBookingRef) {
        transaction.set(weekBookingRef, {
          eventId,
          week,
          year,
          category,
          oneToOneData: oneToOneData || null,
          timestamp: serverTimestamp(),
          rating: 0,
          feedback: ""
        });
      }

      return { 
        success: true, 
        message: "Sucesso",
        emailData: {
          startTime,
          summary: eventData.summary,
          mentor: eventData.mentor,
          theme: eventData.theme,
          htmlLink: eventData.htmlLink
        }
      };
    });

    // 4. Enviar E-mail (FORA DA TRANSAÇÃO PARA EVITAR TIMEOUTS ⚡)
    if (trxResult.success && trxResult.emailData) {
      const { startTime, summary, mentor, theme, htmlLink } = trxResult.emailData;
      
      try {
        const dateStr = format(startTime, "dd 'de' MMMM", { locale: ptBR });
        const timeStr = format(startTime, "HH:mm");
        const cancelLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://hub.bplen.com'}/admin/gestao-agenda`;

        let oneToOneInfo = "";
        if (oneToOneData) {
          oneToOneInfo = `
            <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid #667eea;">
              <p style="margin: 0; font-size: 12px; color: #666;"><b>DEMANDA DO 1 TO 1:</b> ${oneToOneData.type}</p>
              <p style="margin: 10px 0 0 0; font-size: 13px; color: #1d1d1f;"><b>EXPECTATIVAS:</b><br/>${oneToOneData.expectations}</p>
            </div>
          `;
        }

        // Gerar arquivo ICS
        let icsFile = null;
        try {
          const { generateIcsString } = await import("@/lib/ics-utils");
          const endTime = new Date(startTime.getTime() + 45 * 60 * 1000); 
          icsFile = generateIcsString({
            title: `BPlen | 1 to 1 (${displayName})`,
            description: `Reunião estratégica agendada via BPlen HUB.\n\nLink da Reunião: ${htmlLink}`,
            start: startTime,
            end: endTime,
            location: "Google Meet",
            uid: `bplen-${eventId}-${userId}`
          });
        } catch (icsErr) {
          console.error("Erro ao gerar ICS (ignorado):", icsErr);
        }

        console.log(`[EMAIL] Enviando confirmação assíncrona para: ${userEmail}`);

        await resend.emails.send({
          from: `BPlen HUB <${CALENDAR_CONFIG.OFFICIAL_EMAIL}>`,
          to: userEmail,
          subject: `${displayName}, seu 1 to 1 foi confirmado na BPlen HUB!`,
          attachments: icsFile ? [
            {
              filename: 'convite_bplen.ics',
              content: Buffer.from(icsFile),
            }
          ] : [],
          html: `
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

                ${oneToOneInfo}
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
          `
        });
      } catch (emailError) {
        console.error("Erro crítico ao enviar e-mail de confirmação:", emailError);
      }
    }

    return { success: true, message: "Sucesso" };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Erro no booking:", err);
    return { success: false, message: err.message };
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
 * Busca agendamentos do usuário diretamente de sua subcoleção dedicada.
 */
export async function getUserBookingsAction(matricula: string): Promise<UserBooking[]> {
  try {
    const bookingsRef = collection(db, "User", matricula, "User_Bookings");
    const querySnapshot = await getDocs(bookingsRef);
    
    const allEvents = await getSyncedEvents();
    const eventsMap = new Map(allEvents.map(e => [e.id, e]));

    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      const eventDetail = eventsMap.get(data.eventId);
      
      return {
        id: docSnap.id,
        eventId: data.eventId,
        userId: matricula, // Mapeado para matricula na nova estrutura
        week: data.week,
        year: data.year,
        category: data.category || "geral",
        timestamp: data.timestamp?.toDate?.()?.toISOString() || null,
        rating: data.rating || 0,
        feedback: data.feedback || "",
        evaluatedAt: data.evaluatedAt?.toDate?.()?.toISOString() || null,
        eventDetail: eventDetail || null
      };
    }).sort((a, b) => {
      const startA = a.eventDetail ? new Date(a.eventDetail.start).getTime() : 0;
      const startB = b.eventDetail ? new Date(b.eventDetail.start).getTime() : 0;
      return startB - startA;
    });
  } catch (error) {
    console.error("Erro ao buscar agendamentos na subcoleção:", error);
    return [];
  }
}

import { submitSurvey } from "./submit-survey";
import { bookingEvaluationSurveyConfig } from "@/config/surveys/booking-evaluation";

/**
 * Submete avaliação Likert e feedback para um agendamento na subcoleção.
 * Agora integrado à Survey_Global.
 */
export async function submitEvaluationAction(
  matricula: string, 
  bookingId: string, 
  rating: number, 
  feedback: string,
  userUid: string
) {
  try {
    // 1. Persistência de Transição (Local no Booking)
    const bookingRef = doc(db, "User", matricula, "User_Bookings", bookingId);
    await setDoc(bookingRef, {
      rating,
      feedback,
      evaluatedAt: serverTimestamp()
    }, { merge: true });

    // 2. Persistência Institucional (Survey_Global)
    // Criamos um ID dinâmico vinculado ao agendamento
    const dynamicConfig = {
      ...bookingEvaluationSurveyConfig,
      id: `${bookingEvaluationSurveyConfig.id}_${bookingId}`
    };

    await submitSurvey(dynamicConfig, { rating, feedback }, userUid);
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao submeter avaliação institucional:", error);
    return { success: false };
  }
}


/**
 * Cancela um agendamento na subcoleção do usuário, estornando a vaga e liberando a trava de semana.
 */
export async function cancelBookingAction(
  matricula: string,
  bookingId: string,
  eventId: string,
  userId: string
) {
  try {
    const trxResult = await runTransaction(db, async (transaction) => {
      const eventRef = doc(db, "Calendar_Events", eventId);
      const bookingRef = doc(db, "User", matricula, "User_Bookings", bookingId);
      const attendeeRef = doc(db, `Calendar_Events/${eventId}/attendees`, userId);

      const eventSnap = await transaction.get(eventRef);
      if (!eventSnap.exists()) throw new Error("Evento não encontrado.");

      const eventData = eventSnap.data();
      const currentRegistered = eventData.registeredCount || 0;

      // 1. Identificar Categoria para saber qual trava liberar (se o ID for dinâmico)
      // Na nova estrutura, o bookingId JÁ É a trava (ex: week_14_2026_grupo)
      // Mas se o usuário passar um ID que não segue o padrão, tentamos encontrar.

      // Coletar dados do attendee para o envio do e-mail de cancelamento
      const attendeeSnap = await transaction.get(attendeeRef);
      const attendeeData = attendeeSnap.exists() ? attendeeSnap.data() : null;

      // 1. Decrementar contador de vagas (mínimo 0)
      transaction.update(eventRef, {
        registeredCount: Math.max(0, currentRegistered - 1)
      });

      // 2. Remover o registro de participação no evento
      transaction.delete(attendeeRef);

      // 3. Remover o agendamento da subcoleção do usuário (libera a trava)
      transaction.delete(bookingRef);

      return {
        success: true,
        email: attendeeData?.email,
        nickname: attendeeData?.nickname || "Membro BPlen",
        eventSummary: eventData.summary || "Evento"
      };
    });

    // Fora da transação: Envio Seguro do E-mail de Cancelamento (Resend Premium)
    if (trxResult.success && trxResult.email) {
      try {
        const platformLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://hub.bplen.com'}/admin/gestao-agenda`;
        await resend.emails.send({
          from: `BPlen HUB <${CALENDAR_CONFIG.OFFICIAL_EMAIL}>`,
          to: trxResult.email,
          subject: `${trxResult.nickname}, seu ${trxResult.eventSummary} foi cancelado!`,
          html: `
            <div style="font-family: sans-serif; color: #1d1d1f; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #7f1d1d15; border-radius: 20px; background: #fffcfc;">
              <h2 style="color: #ef4444; margin-bottom: 5px;">⚠️ Agendamento Cancelado</h2>
              <p style="font-size: 16px; margin-top: 0;">Olá, <b>${trxResult.nickname}</b>.</p>
              
              <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
                Sua solicitação de cancelamento para o evento abaixo foi processada com sucesso e a vaga já foi devolvida ao ecossistema da BPlen.
              </p>

              <div style="background: #ffffff; padding: 20px; border-radius: 16px; border: 1px solid #fee2e2; margin: 20px 0; border-left: 4px solid #ef4444;">
                <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px;"><b>EVENTO CANCELADO</b></p>
                <p style="margin: 5px 0 0 0; font-size: 18px; color: #1d1d1f;"><b>${trxResult.eventSummary}</b></p>
              </div>

              <div style="margin: 25px 0; text-align: center;">
                <a href="${platformLink}" style="background: #ef4444; color: white; padding: 12px 30px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">MARCAR NOVO HORÁRIO</a>
              </div>

              <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 30px 0;" />
              
              <p style="font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.5;">
                Se você não solicitou este cancelamento, entre em contato imediatamente com o seu Pós-Venda ou Mentor.
              </p>
            </div>
          `
        });
      } catch (emailError) {
        console.error("Erro ao enviar e-mail de cancelamento (ignorado no fluxo):", emailError);
      }
    }

    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Erro ao cancelar agendamento na subcoleção:", err);
    return { success: false, message: err.message };
  }
}
