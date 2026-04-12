"use server";

import admin, { getAdminDb } from "@/lib/firebase-admin";
import { requireAdmin, requireAuth } from "@/lib/auth-guards";
import { safeSerialize } from "@/lib/utils/firestore";
import { getCalendarClient } from "@/lib/google-auth";
import { serverEnv } from "@/env";
import { formatISO, addDays, getISOWeek, getYear, parseISO, isBefore, startOfDay, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Resend } from "resend";
import { CALENDAR_CONFIG } from "@/config/calendarConfig";

import { calendar_v3 } from "googleapis";
import { getEventStandardSlug } from "@/lib/utils";

const resend = new Resend(serverEnv.RESEND_API_KEY);
const OFFICIAL_SENDER = `BPlen HUB <hub@bplen.com>`;

/**
 * BPlen HUB — Google Calendar Actions
 * Busca, Sincronização e Leitura de Eventos do Workspace BPlen.
 */

export type EventLifecycleStatus = "scheduled" | "completed" | "cancelled" | "postponed";
export type AttendanceStatus = "pending" | "present" | "absent";

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

  // Post-event Fields
  lifecycleStatus?: EventLifecycleStatus;
  postEventCompleted?: boolean;
  internalGeneralComment?: string;
  publicGeneralComment?: string;
  meetingMinutesFile?: { url: string; fileId: string; fileName: string; uploadedAt: string } | null;
  postponedFromEventId?: string | null;
  postEventUpdatedAt?: string | null;
  postEventUpdatedBy?: string;
  lastSync?: string | null;
  
  // Administrative Summary Sheet
  summarySheetUrl?: string;
  summarySheetId?: string;
  eventFolderUrl?: string;
  summarySheetUpdatedAt?: string | null;
  slug?: string;

  // Real-time Aggregated Metrics (Datas_Center Ready 🛰️)
  metrics?: {
    presenceCount: number;
    npsAvg: number;
    reviewsCount: number;
  };
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

  // Mirrored Post-event Fields
  eventLifecycleStatus?: EventLifecycleStatus;
  attendanceStatus?: AttendanceStatus;
  publicGeneralComment?: string;
  meetingMinutesFile?: { url: string; fileId: string; fileName: string; uploadedAt: string } | null;
  participantFeedback?: string;
  participantTasks?: string;
  participantDocs?: Array<{ url: string; fileId: string; fileName: string; uploadedAt: string }>;
}

export interface AttendeeData {
  userId: string;
  matricula: string;
  nickname: string;
  email: string;
  phone?: string | null;
  isLead: boolean;
  timestamp: any;
  
  // Post-event fields
  attendanceStatus?: AttendanceStatus;
  participantFeedback?: string;
  participantTasks?: string;
  participantDocs?: Array<{ url: string; fileId: string; fileName: string; uploadedAt: string }>;
  attendanceCheckedAt?: any;
  attendanceCheckedBy?: string;

  // 1 to 1 data
  type?: string; 
  expectations?: string;
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
export async function syncCalendarToFirestore(idToken?: string) {
  try {
    await requireAdmin(idToken);
    const calendar = await getCalendarClient();
    const db = getAdminDb();
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
    const eventsSnap = await db.collection("Calendar_Events")
      .where("start", ">=", timeMin)
      .where("start", "<=", timeMax)
      .get();
    
    let deleteCount = 0;
    for (const docSnap of eventsSnap.docs) {
      if (!googleIds.has(docSnap.id)) {
        await docSnap.ref.delete();
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

      const eventRef = db.collection("Calendar_Events").doc(item.id);
      
      const eventStart = item.start?.dateTime || item.start?.date || "";
      const eventSlug = getEventStandardSlug(item.summary || "Sem_Titulo", eventStart, item.id);

      // Upsert Soberano Admin
      await eventRef.set({
        id: item.id,
        summary: item.summary || "Sem Título",
        slug: eventSlug,
        description: cleanDescription,
        start: item.start?.dateTime || item.start?.date || "",
        end: item.end?.dateTime || item.end?.date || "",
        htmlLink: item.htmlLink || "",
        totalCapacity: capacityMatch ? parseInt(capacityMatch[1]) : 0,
        mentor: mentorMatch ? mentorMatch[1].trim() : "BPlen",
        theme: themeMatch ? themeMatch[1].trim() : null,
        lastSync: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

    }

    // 3. Atualizar Central de Dados (Datas_Center) 🛰️
    await updateGlobalProgramacaoRegistryAction();

    return { 
      success: true, 
      synced: syncCount, 
      deleted: deleteCount,
    };
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Erro na sincronização de agenda:", error);
    throw new Error(error.message || "Falha na sincronização.");
  }
}

/**
 * Agendamento de Evento (Nova Arquitetura: Subcoleção de User 🔐)
 * Soberania Admin para garantir escrita atômica e confiável.
 */
export async function bookEventAction(
  eventId: string, 
  userId: string, 
  userEmail: string,
  matricula?: string,
  nickname?: string,
  oneToOneData?: { type: string; expectations: string },
  leadInfo?: { name: string; phone: string }
): Promise<{ success: boolean; message: string }> {
  try {
    const db = getAdminDb();
    const eventRef = db.collection("Calendar_Events").doc(eventId);
    const displayName = nickname || leadInfo?.name || "Convidado BPlen";

    const trxResult = await db.runTransaction(async (transaction) => {
      const eventSnap = await transaction.get(eventRef);
      if (!eventSnap.exists) throw new Error("Evento não encontrado.");

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
      else if (evSum.includes("orientação individual") || evSum.includes("orientacao em grupo")) category = "individual";

      // Trava de semana na nova subcoleção (Apenas para usuários internos logados)
      const weekBookingId = `week_${week}_${year}_${category}`;
      const weekBookingRef = matricula 
        ? db.collection("User").doc(matricula).collection("User_Bookings").doc(weekBookingId)
        : null;
      
      if (weekBookingRef) {
        const weekBookingSnap = await transaction.get(weekBookingRef);
        if (weekBookingSnap.exists) {
          const catName = category === "grupo" ? "Orientação em Grupo" : category === "individual" ? "Orientação Individual" : category === "1to1" ? "1-to-1" : "evento genérico";
          throw new Error(`Você já possui um agendamento de ${catName} para a Semana SI-${week.toString().padStart(2, '0')}. Limite: 1 de cada formato na semana.`);
        }
      }

      const capacity = eventData.totalCapacity || 1;
      const registered = eventData.registeredCount || 0;
      if (registered >= capacity) {
        throw new Error("Infelizmente as vagas para este horário esgotaram.");
      }

      // EXECUÇÃO:
      // 1. Criar registro de participação detalhado no evento
      const attendeeRef = eventRef.collection("attendees").doc(userId);
      transaction.set(attendeeRef, {
        userId,
        matricula: matricula || "LEAD_EXTERNO",
        nickname: displayName,
        email: userEmail,
        phone: leadInfo?.phone || null,
        isLead: !matricula,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        attendanceStatus: "pending",
        ...oneToOneData
      });

      // 2. Incrementar contador
      transaction.update(eventRef, {
        registeredCount: registered + 1
      });

      // 3. Registrar trava de semana na subcoleção do usuário
      if (weekBookingRef) {
        transaction.set(weekBookingRef, {
          eventId,
          week,
          year,
          category,
          oneToOneData: oneToOneData || null,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
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

    // 4. Atualizar Central de Dados (Datas_Center Snapshot) 🛰️
    await updateGlobalProgramacaoRegistryAction();
    
    // 5. Enviar E-mail (FORA DA TRANSAÇÃO PARA EVITAR TIMEOUTS ⚡)
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
          from: OFFICIAL_SENDER,
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
 * Inclusão Manual de Participante (Apenas Admin) 🛡️
 * Permite adicionar membros em um evento de última hora.
 */
export async function adminAddAttendeeAction(
  eventId: string,
  matricula: string,
  adminToken: string,
  oneToOneData?: { type: string; expectations: string }
): Promise<{ success: boolean; message: string }> {
  try {
    const db = getAdminDb();
    
    // 1. Validar Sessão Admin
    const adminSession = await requireAdmin(adminToken);
    
    // 2. Buscar Dados do Usuário e do Evento
    const userSnap = await db.doc(`User/${matricula}`).get();
    if (!userSnap.exists) throw new Error(`Usuário ${matricula} não encontrado.`);
    const userData = userSnap.data()!;
    
    const eventRef = db.collection("Calendar_Events").doc(eventId);
    const eventSnap = await eventRef.get();
    if (!eventSnap.exists) throw new Error("Evento não encontrado.");
    const eventData = eventSnap.data() as GoogleCalendarEvent;

    // Dados resolvidos para o e-mail e registro
    const userId = userData.uid || matricula;
    const userEmail = userData.email || userData.User_Email;
    const displayName = userData.User_Nickname || userData.Authentication_Name || "Membro BPlen";

    if (!userEmail) throw new Error("Usuário não possui e-mail cadastrado.");

    // 3. Execução Transacional
    const trxResult = await db.runTransaction(async (transaction) => {
      const currentRegistered = eventData.registeredCount || 0;
      
      const startTime = parseISO(eventData.start);
      const week = getISOWeek(startTime);
      const year = getYear(startTime);

      let category = "geral";
      const evSum = eventData.summary.toLowerCase();
      if (evSum.includes("1 to 1")) category = "1to1";
      else if (evSum.includes("orientação em grupo") || evSum.includes("orientacao em grupo")) category = "grupo";
      else if (evSum.includes("orientação individual")) category = "individual";

      const weekBookingId = `week_${week}_${year}_${category}`;
      const weekBookingRef = db.collection("User").doc(matricula).collection("User_Bookings").doc(weekBookingId);

      // Verificamos apenas a trava de semana, opcionalmente, mas Admin pode ter poder total. 
      // Vou manter a trava para evitar duplicidade acidental no Dashboard.
      const bookingSnap = await transaction.get(weekBookingRef);
      if (bookingSnap.exists && bookingSnap.data()?.eventId !== eventId) {
        throw new Error(`Este membro já possui um agendamento de ${category} para esta semana.`);
      }

      // [ESCRITAS]
      // A. Registrar Participante no Evento
      const attendeeRef = eventRef.collection("attendees").doc(userId);
      transaction.set(attendeeRef, {
        userId,
        matricula,
        nickname: displayName,
        email: userEmail,
        isLead: false,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        attendanceStatus: "pending",
        addedByAdmin: adminSession.email,
        ...oneToOneData
      });

      // B. Incrementar Contador
      transaction.update(eventRef, {
        registeredCount: currentRegistered + 1
      });

      // C. Criar Agendamento no Aluno
      transaction.set(weekBookingRef, {
        eventId,
        week,
        year,
        category,
        oneToOneData: oneToOneData || null,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        rating: 0,
        feedback: "",
        addedByAdmin: adminSession.email
      });

      return { 
        success: true,
        emailData: {
          startTime,
          summary: eventData.summary,
          mentor: eventData.mentor,
          theme: eventData.theme,
          htmlLink: eventData.htmlLink
        }
      };
    });

    // 4. Atualizar Central de Dados (Datas_Center Snapshot) 🛰️
    await updateGlobalProgramacaoRegistryAction();

    // 5. E-mail de Confirmação (Padrão HUB)
    if (trxResult.success && trxResult.emailData) {
      const { startTime, summary, mentor, theme, htmlLink } = trxResult.emailData;
      try {
        const dateStr = format(startTime, "dd 'de' MMMM", { locale: ptBR });
        const timeStr = format(startTime, "HH:mm");
        
        await resend.emails.send({
          from: OFFICIAL_SENDER,
          to: userEmail,
          subject: `ADMIN: Você foi incluído no evento ${summary}!`,
          html: `
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
          `
        });
      } catch (err) {
        console.error("Erro ao enviar e-mail adminAddAttendee:", err);
      }
    }

    return { success: true, message: "Participante adicionado com sucesso!" };
  } catch (error: any) {
    console.error("Erro no adminAddAttendeeAction:", error);
    return { success: false, message: error.message || "Erro desconhecido." };
  }
}

import { getSheetsClient, getDriveClient } from "@/lib/google-auth";
import { ensureFolder, createSpreadsheet, renameFile, getEventDriveFolder } from "@/lib/drive-utils";

/**
 * Geração de Planilha de Resumo (Google Sheets) 📊
 * Consolida metadados e inscritos para auditoria administrativa.
 */
export async function generateEventSummarySheetAction(
  eventId: string,
  adminToken: string
): Promise<{ success: boolean; url?: string; message?: string }> {
  try {
    const db = getAdminDb();
    await requireAdmin(adminToken);

    // 1. Buscar Dados Consolidados
    const eventRef = db.collection("Calendar_Events").doc(eventId);
    const eventSnap = await eventRef.get();
    if (!eventSnap.exists) throw new Error("Evento não encontrado.");
    const eventData = eventSnap.data() as GoogleCalendarEvent;

    const attendees = await getEventAttendees(eventId);

    // 2. Preparar APIs Google
    const drive = await getDriveClient();
    const sheets = await getSheetsClient();

    // 3. Garantir Identificador Padrão (Slug)
    const standardSlug = eventData.slug || getEventStandardSlug(eventData.summary, eventData.start, eventId);
    
    // 4. Garantir Pasta do Evento (Com Governança Centralizada e Auto-Migração 🛰️)
    const baseAtasFolderId = serverEnv.GOOGLE_DRIVE_ATAS_ID;
    const eventFolderId = await getEventDriveFolder(drive, baseAtasFolderId, eventId, standardSlug);

    // 5. Verificar se a planilha já existe (Padrão: {slug}_Consolidacao)
    const reportFileName = `${standardSlug}_Consolidacao`;
    const searchRes = await drive.files.list({
      q: `name = '${reportFileName}' and '${eventFolderId}' in parents and trashed = false`,
      fields: "files(id, webViewLink)",
      spaces: "drive",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    let spreadsheetId: string;
    let spreadsheetUrl: string;

    if (searchRes.data.files && searchRes.data.files.length > 0) {
      spreadsheetId = searchRes.data.files[0].id!;
      spreadsheetUrl = searchRes.data.files[0].webViewLink!;
      console.log(`[Sheets] Planilha existente encontrada: ${spreadsheetId}`);
    } else {
      // Criar nova planilha usando o utilitário robusto
      console.log(`[Sheets] Criando nova planilha na pasta: ${eventFolderId}`);
      const newSheet = await createSpreadsheet(drive, eventFolderId, reportFileName);
      spreadsheetId = newSheet.id;
      spreadsheetUrl = newSheet.webViewLink;
      console.log(`[Sheets] Planilha criada com sucesso: ${spreadsheetId}`);
    }

    // 5. Estruturar Dados para o Sheets
    const headerRow = [
      "Matrícula", "Nome", "E-mail", "Presença", 
      "Demanda 1 to 1", "Expectativas 1 to 1", 
      "Feedback Aluno", "Mentor: Feedback", "Mentor: Tarefas", "Documentos Aluno", "Ata Geral"
    ];
    const rows = attendees.map(a => [
      a.matricula,
      a.nickname,
      a.email,
      a.attendanceStatus === "present" ? "PRESENTE" : a.attendanceStatus === "absent" ? "AUSENTE" : "PENDENTE",
      a.type || "", // Demanda 1 to 1
      a.expectations || "", // Expectativas 1 to 1
      "", // Feedback aluno
      a.participantFeedback || "",
      a.participantTasks || "",
      a.participantDocs?.map(d => d.url).join("\n") || "",
      eventData.meetingMinutesFile?.url || ""
    ]);

    const eventInfo = [
      ["RESUMO DO EVENTO", eventData.summary],
      ["DATA", eventData.start],
      ["ORIENTADOR", eventData.mentor || "BPlen"],
      ["TEMA", eventData.theme || "-"],
      ["LINK REUNIÃO", eventData.htmlLink],
      [""], // Espaçador
      ["LISTA DE PARTICIPANTES"],
      headerRow,
      ...rows
    ];

    // 6. Resolver Nome da Planilha (Localização: Sheet1 vs Página1)
    const ssMeta = await sheets.spreadsheets.get({ spreadsheetId });
    const targetTabName = ssMeta.data.sheets?.[0].properties?.title || "Sheet1";

    // 7. Atualizar Valores
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${targetTabName}!A1`,
      valueInputOption: "RAW",
      requestBody: {
        values: eventInfo,
      },
    });

    // 8. Salvar link no Firestore para o Admin encontrar fácil
    await eventRef.update({
      summarySheetUrl: spreadsheetUrl,
      summarySheetId: spreadsheetId,
      eventFolderUrl: `https://drive.google.com/drive/folders/${eventFolderId}`,
      summarySheetUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, url: spreadsheetUrl };
  } catch (error: any) {
    console.error("Erro ao gerar planilha de resumo:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Busca eventos sincronizados diretamente do Firestore.
 */
export async function getSyncedEvents(idToken?: string): Promise<GoogleCalendarEvent[]> {
    try {
      await requireAdmin(idToken);
      const db = getAdminDb();
      const snap = await db.collection("Calendar_Events").get();
      
      return snap.docs.map(doc => {
        return safeSerialize<GoogleCalendarEvent>({
          id: doc.id,
          ...doc.data()
        });
      });
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
    const db = getAdminDb();
    const bookingsSnap = await db.collection("User").doc(matricula).collection("User_Bookings").get();
    
    const allEvents = await getSyncedEvents();
    const eventsMap = new Map(allEvents.map(e => [e.id, e]));

    return bookingsSnap.docs.map(docSnap => {
      const data = docSnap.data();
      const eventDetail = eventsMap.get(data.eventId);
      
      return {
        id: docSnap.id,
        eventId: data.eventId,
        userId: matricula,
        week: data.week,
        year: data.year,
        category: data.category || "geral",
        timestamp: data.timestamp?.toDate?.()?.toISOString() || null,
        rating: data.rating || 0,
        feedback: data.feedback || "",
        evaluatedAt: data.evaluatedAt?.toDate?.()?.toISOString() || null,
        eventDetail: eventDetail || null
      };
    }).sort((a: any, b: any) => {
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
    const db = getAdminDb();
    // 1. Persistência de Transição (Local no Booking)
    const bookingRef = db.collection("User").doc(matricula).collection("User_Bookings").doc(bookingId);
    await bookingRef.set({
      rating,
      feedback,
      evaluatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // 2. Persistência Institucional (Survey_Global)
    const dynamicConfig = {
      ...bookingEvaluationSurveyConfig,
      id: `${bookingEvaluationSurveyConfig.id}_${bookingId}`
    };

    await submitSurvey(dynamicConfig, { rating, feedback }, userUid);

    // 3. Atualizar Métricas no Registro Global (NPS Sem collectionGroup 🛰️)
    try {
      const bookingSnap = await bookingRef.get();
      const eventId = bookingSnap.data()?.eventId;
      
      if (eventId) {
        // Buscamos os inscritos do evento para percorrer suas notas individuais (Evita erro de índice)
        const eventRef = db.collection("Calendar_Events").doc(eventId);
        const attendeesSnap = await eventRef.collection("attendees").get();
        
        const ratingsArr: number[] = [];
        
        await Promise.all(attendeesSnap.docs.map(async (att) => {
          const attMatricula = att.data().matricula;
          if (attMatricula) {
            const bSnap = await db.collection("User").doc(attMatricula)
              .collection("User_Bookings")
              .where("eventId", "==", eventId)
              .get();
            
            bSnap.forEach(b => {
              const r = b.data().rating;
              if (r > 0) ratingsArr.push(r);
            });
          }
        }));

        const npsAvg = ratingsArr.length > 0 
          ? parseFloat((ratingsArr.reduce((a, b) => a + b, 0) / ratingsArr.length).toFixed(1)) 
          : 0;
          
        await eventRef.set({
          metrics: {
            npsAvg: npsAvg,
            reviewsCount: ratingsArr.length
          }
        }, { merge: true });
        
        await updateGlobalProgramacaoRegistryAction();
      }
    } catch (metricError) {
      console.error("Erro ao atualizar métricas NPS (ignorado):", metricError);
    }
    
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
    const db = getAdminDb();
    const trxResult = await db.runTransaction(async (transaction: admin.firestore.Transaction) => {
      const eventRef = db.collection("Calendar_Events").doc(eventId);
      const bookingRef = db.collection("User").doc(matricula).collection("User_Bookings").doc(bookingId);
      const attendeeRef = eventRef.collection("attendees").doc(userId);

      const eventSnap = await transaction.get(eventRef);
      if (!eventSnap.exists) throw new Error("Evento não encontrado.");

      const eventData = eventSnap.data() as any;
      const currentRegistered = eventData.registeredCount || 0;

      // Coletar dados do attendee para o envio do e-mail de cancelamento
      const attendeeSnap = await transaction.get(attendeeRef);
      const attendeeData = attendeeSnap.exists ? attendeeSnap.data() as any : null;

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

    // 4. Atualizar Central de Dados (Datas_Center Snapshot) 🛰️
    await updateGlobalProgramacaoRegistryAction();

    // 5. Fora da transação: Envio Seguro do E-mail de Cancelamento (Resend Premium)
    if (trxResult.success && trxResult.email) {
      try {
        const platformLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://hub.bplen.com'}/admin/gestao-agenda`;
        await resend.emails.send({
          from: OFFICIAL_SENDER,
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

/**
 * Busca os inscritos de um evento para o painel administrativo.
 */
export async function getEventAttendees(eventId: string): Promise<AttendeeData[]> {
  try {
    const db = getAdminDb();
    const attendeesSnap = await db.collection("Calendar_Events").doc(eventId).collection("attendees").get();
    
    return attendeesSnap.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        userId: doc.id,
        timestamp: data.timestamp?.toDate?.()?.toISOString() || null,
        attendanceCheckedAt: data.attendanceCheckedAt?.toDate?.()?.toISOString() || null,
      } as AttendeeData;
    });
  } catch (error) {
    console.error("Erro ao buscar inscritos do evento:", error);
    return [];
  }
}

/**
 * Parte 1: Fechamento Geral do Evento
 */
export async function closeEventAction(
  eventId: string,
  data: {
    lifecycleStatus: EventLifecycleStatus;
    internalGeneralComment: string;
    publicGeneralComment: string;
    meetingMinutesFile: { url: string; fileId: string; fileName: string; uploadedAt: string } | null;
    updatedBy: string;
  }
) {
  try {
    const db = getAdminDb();
    const eventRef = db.collection("Calendar_Events").doc(eventId);

    await eventRef.set({
      lifecycleStatus: data.lifecycleStatus,
      postEventCompleted: true,
      internalGeneralComment: data.internalGeneralComment,
      publicGeneralComment: data.publicGeneralComment,
      meetingMinutesFile: data.meetingMinutesFile,
      postEventUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      postEventUpdatedBy: data.updatedBy
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error("Erro ao fechar evento (Parte 1):", error);
    return { success: false, message: (error as Error).message };
  }
}

/**
 * Parte 2: Fechamento Individual por Participante
 * Salva no Evento e espelha em User_Bookings.
 */
export async function closeAttendeeAction(
  eventId: string,
  userId: string,
  matricula: string,
  data: {
    attendanceStatus: AttendanceStatus;
    participantFeedback: string;
    participantTasks: string;
    participantDocs: Array<{ url: string; fileId: string; fileName: string; uploadedAt: string }>;
    checkedBy: string;
  }
) {
  try {
    const db = getAdminDb();
    
    // 1. BUSCA PRÉVIA (OUTSIDE TRANSACTION 🛡️)
    // O Node.js Admin SDK não permite queries (where) dentro de transaction.get()
    const userBookingsRef = db.collection("User").doc(matricula).collection("User_Bookings");
    const bookingQuery = await userBookingsRef.where("eventId", "==", eventId).limit(1).get();
    const bookingDoc = bookingQuery.empty ? null : bookingQuery.docs[0];

    // 2. BUSCAR DADOS DO EVENTO (READ ONLY)
    const eventRef = db.collection("Calendar_Events").doc(eventId);
    const eventSnap = await eventRef.get();
    if (!eventSnap.exists) throw new Error("Evento não encontrado.");
    const eventData = eventSnap.data() as GoogleCalendarEvent;

    // 3. EXECUÇÃO TRANSACIONAL
    await db.runTransaction(async (transaction) => {
      // Registrar no Evento
      const attendeeRef = eventRef.collection("attendees").doc(userId);
      const attendeeSnap = await transaction.get(attendeeRef);
      const prevStatus = attendeeSnap.exists ? attendeeSnap.data()?.attendanceStatus : null;

      transaction.set(attendeeRef, {
        attendanceStatus: data.attendanceStatus,
        participantFeedback: data.participantFeedback,
        participantTasks: data.participantTasks,
        participantDocs: data.participantDocs,
        attendanceCheckedAt: admin.firestore.FieldValue.serverTimestamp(),
        attendanceCheckedBy: data.checkedBy
      }, { merge: true });

      // Atualizar Contador de Presença Real-time 🛰️
      if (data.attendanceStatus === "present" && prevStatus !== "present") {
        transaction.update(eventRef, { "metrics.presenceCount": admin.firestore.FieldValue.increment(1) });
      } else if (data.attendanceStatus !== "present" && prevStatus === "present") {
        transaction.update(eventRef, { "metrics.presenceCount": admin.firestore.FieldValue.increment(-1) });
      }

      // Atualizar User_Bookings se existir (Camada de Leitura Rápida)
      if (bookingDoc) {
        transaction.set(bookingDoc.ref, {
          eventLifecycleStatus: eventData.lifecycleStatus || "completed",
          attendanceStatus: data.attendanceStatus,
          publicGeneralComment: eventData.publicGeneralComment || "",
          meetingMinutesFile: eventData.meetingMinutesFile || null,
          participantFeedback: data.participantFeedback,
          participantTasks: data.participantTasks,
          participantDocs: data.participantDocs,
          postEventUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }
    });

    // 4. Atualizar Central de Dados (Datas_Center Snapshot) 🛰️
    await updateGlobalProgramacaoRegistryAction();

    return { success: true };
  } catch (error) {
    console.error("Erro ao fechar participante (Parte 2):", error);
    return { success: false, message: (error as Error).message };
  }
}


/**
 * Snapshot de Alta Performance: Datas_Center 🛰️
 * Consolida todos os eventos da coleção Calendar_Events em um único Documento Global.
 * É chamado automaticamente em todos os gatilhos de mudança (Sync, Presença, NPS).
 */
export async function updateGlobalProgramacaoRegistryAction() {
  try {
    const db = getAdminDb();
    
    // 1. Buscar todos os eventos (Ordenados por data) para o Snapshot
    const eventsSnap = await db.collection("Calendar_Events")
      .orderBy("start", "desc")
      .limit(500)
      .get();
      
    const eventsRegistry = eventsSnap.docs.map(doc => {
      const data = doc.data() as GoogleCalendarEvent;
      
      // Lógica de Status em tempo real para o Snapshot
      const evDate = parseISO(data.start);
      const isPast = isBefore(evDate, new Date());
      let status: "futuro" | "pendente" | "concluido" = "futuro";
      if (data.postEventCompleted) status = "concluido";
      else if (isPast) status = "pendente";

      return {
        id: doc.id,
        summary: data.summary,
        start: data.start,
        end: data.end,
        mentor: data.mentor || "BPlen",
        theme: data.theme || null,
        statusLabel: status,
        folderUrl: data.eventFolderUrl || null,
        htmlLink: data.htmlLink || "",
        registeredCount: data.registeredCount || 0,
        totalCapacity: data.totalCapacity || 0,
        metrics: data.metrics || { presenceCount: 0, npsAvg: 0, reviewsCount: 0 },
        // Post-event fields for Wizard pre-population
        postEventCompleted: data.postEventCompleted || false,
        lifecycleStatus: data.lifecycleStatus || null,
        internalGeneralComment: data.internalGeneralComment || "",
        publicGeneralComment: data.publicGeneralComment || "",
        meetingMinutesFile: data.meetingMinutesFile || null
      };
    });

    // 2. Salvar na Matriz Pai (Datas_Center)
    await db.collection("Datas_Center").doc("Programacao_Registry").set({
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      count: eventsRegistry.length,
      events: eventsRegistry
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar Datas_Center/Programacao_Registry:", error);
    return { success: false, message: (error as Error).message };
  }
}

/**
 * REATOR DE DASHBOARD 🛰️ (Versão Datas_Center)
 * Agora lê instantaneamente do Datas_Center em vez de processar subcoleções.
 */
export async function getProgramacaoSummaryAction(idToken?: string): Promise<any[]> {
  try {
    await requireAdmin(idToken);
    const db = getAdminDb();
    
    const registrySnap = await db.collection("Datas_Center").doc("Programacao_Registry").get();
    
    if (!registrySnap.exists) {
      // Se ainda não existir, tenta atualizar uma primeira vez para não retornar vazio
      await updateGlobalProgramacaoRegistryAction();
      const retrySnap = await db.collection("Datas_Center").doc("Programacao_Registry").get();
      return retrySnap.data()?.events || [];
    }

    const data = registrySnap.data();
    return data?.events || [];

  } catch (error) {
    console.error("Erro ao ler resumo de programação do Datas_Center:", error);
    return [];
  }
}

/**
 * THE BIG HEAL 🛰️
 * Script de reparo para reconstruir retroativamente as métricas de todos os eventos.
 * Essencial após a migração para a arquitetura de Snapshot (Datas_Center).
 */
export async function healProgramacaoMasterAction(idToken: string) {
  try {
    await requireAdmin(idToken);
    const db = getAdminDb();
    
    // 1. Buscar todos os eventos
    const eventsSnap = await db.collection("Calendar_Events").get();
    console.log(`[Healing] Iniciando processamento de ${eventsSnap.size} eventos...`);

    // 2. Processar métricas para cada evento em paralelo
    const results = await Promise.all(eventsSnap.docs.map(async (doc) => {
      const eventId = doc.id;
      const eventRef = doc.ref;
      
      // A. Contar Presenças na subcoleção do evento
      const attendeesSnap = await eventRef.collection("attendees").get();
      const presenceCount = attendeesSnap.docs.filter(d => d.data().attendanceStatus === "present").length;
      
      // B. Contar NPS (Busca individual por participante para evitar erro de índice 🛰️)
      let totalRating = 0;
      let reviewsCount = 0;

      await Promise.all(attendeesSnap.docs.map(async (attDoc) => {
        const attMatricula = attDoc.data().matricula;
        if (attMatricula) {
          // Busca o booking específico desse usuário para este evento
          const bSnap = await db.collection("User").doc(attMatricula)
            .collection("User_Bookings")
            .where("eventId", "==", eventId)
            .get();
          
          bSnap.forEach(b => {
            const r = b.data().rating;
            if (r > 0) {
              totalRating += r;
              reviewsCount++;
            }
          });
        }
      }));

      const npsAvg = reviewsCount > 0 ? parseFloat((totalRating / reviewsCount).toFixed(1)) : 0;

      // Atualizar Documento do Evento com as métricas consolidadas
      await eventRef.set({
        metrics: {
          presenceCount: presenceCount,
          npsAvg: npsAvg,
          reviewsCount: reviewsCount
        }
      }, { merge: true });

      return eventId;
    }));

    // 3. Atualizar o Snapshot Global no final
    await updateGlobalProgramacaoRegistryAction();

    return { success: true, processed: results.length };
  } catch (error) {
    console.error("Erro no Healing de Programação:", error);
    return { success: false, message: (error as Error).message };
  }
}

