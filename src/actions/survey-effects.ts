"use server";

import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";
import { SurveyValue } from "@/types/survey";

/**
 * BPlen HUB — Survey Effects Manager (🧠)
 * Centraliza a lógica de negócio e "efeitos colaterais" de todas as pesquisas.
 * Garante que o salvamento principal seja genérico e extensível.
 */

/**
 * Resolve ou Gera a Matrícula do usuário (🧬 Soberania de Identidade)
 * Implementa triplo-fallback: AuthMap -> UID Search -> Email Search.
 * NUNCA permite fallback anônimo para usuários autenticados.
 */
export async function resolveUserIdentity(surveyId: string, responses: Record<string, SurveyValue>, userUid?: string): Promise<string> {
  const db: admin.firestore.Firestore = getAdminDb();
  
  // 1. Caso Anônimo (Visitante sem Login)
  if (!userUid) {
     console.log(`⚠️ [Effects:Identity] Acesso anônimo detectado para survey: ${surveyId}`);
     return `BP-ANON-${new Date().getTime()}`;
  }

  console.log(`🔍 [Effects:Identity] Resolvendo identidade para UID: ${userUid}`);
  
  // 2. Tentar Mapeamento Direto (AuthMap) - Alta Performance
  const authMapRef = db.doc(`_AuthMap/${userUid}`);
  const authMapSnap = await authMapRef.get();
  if (authMapSnap.exists && authMapSnap.data()?.matricula) {
    const mat = authMapSnap.data()?.matricula;
    console.log(`🔍 [Effects:Identity] Matrícula direta encontrada: ${mat}`);
    return mat;
  }

  // 3. Fallback: Buscar na base User por ID de Autenticação (UID)
  const userByUidSnap = await db.collection("User").where("uid", "==", userUid).limit(1).get();
  if (!userByUidSnap.empty) {
    const matricula = userByUidSnap.docs[0].id;
    console.log(`🔍 [Effects:Identity] Matrícula recuperada via UID Search: ${matricula}`);
    await authMapRef.set({ matricula, recoveredAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    return matricula;
  }

  // 4. Fallback: Buscar por E-mail (Compatibilidade de Importação/Legacy)
  let userEmail = (responses.email as string) || "";
  if (!userEmail) {
     try {
        const userAuth = await getAdminAuth().getUser(userUid);
        userEmail = userAuth.email || "";
     } catch(e) {}
  }

  if (userEmail) {
    const normalizedEmail = userEmail.trim().toLowerCase();
    console.log(`🔍 [Effects:Identity] Tentando busca por e-mail normalizado: ${normalizedEmail}`);
    
    const userByEmailSnap = await db.collection("User").where("email", "==", normalizedEmail).limit(1).get();
    if (!userByEmailSnap.empty) {
      const matricula = userByEmailSnap.docs[0].id;
      console.log(`🔍 [Effects:Identity] Matrícula recuperada via Email Search: ${matricula}`);
      
      // Auto-Healing: Atualiza o UID no documento do User e cria o AuthMap
      await userByEmailSnap.docs[0].ref.update({ uid: userUid });
      await authMapRef.set({ matricula, recoveredAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
      
      return matricula;
    }
  }

  // 5. Caso Especial: Welcome Survey (Geração de Nova Matrícula)
  if (surveyId === "welcome_survey") {
    console.log(`✨ [Effects:Identity] Iniciando geração de nova matrícula BP para usuário: ${userUid}`);
    return await db.runTransaction(async (transaction) => {
      const counterRef = db.doc("_internal/counters/user/global");
      const counterSnap = await transaction.get(counterRef);
      
      let count = 1;
      if (counterSnap.exists) {
        count = (counterSnap.data()?.count || 0) + 1;
        transaction.update(counterRef, { count, lastUpdated: admin.firestore.FieldValue.serverTimestamp() });
      } else {
        transaction.set(counterRef, { count: 1, createdAt: admin.firestore.FieldValue.serverTimestamp() });
      }

      const seq = count.toString().padStart(3, "0");
      const userTypeRaw = (responses.userType as string) || "PF";
      const type = userTypeRaw.includes("empresa") || userTypeRaw.includes("PJ") ? "PJ" : "PF";
      const now = new Date();
      const aammdd = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
      
      const newMat = `BP-${seq}-${type}-${aammdd}`;
      transaction.set(authMapRef, { matricula: newMat, createdAt: admin.firestore.FieldValue.serverTimestamp() });
      
      return newMat;
    });
  }

  // 🚨 CRITICAL: Se chegou aqui e é autenticado, não permitimos prosseguir sem matrícula legítima
  console.error(`❌ [Effects:Identity] Erro Crítico: Não foi possível resolver matrícula para usuário logado (UID: ${userUid})`);
  throw new Error("Sua identidade BPlen não pôde ser resolvida. Por favor, complete o onboarding ou entre em contato com o suporte.");
}

/**
 * Processa todos os efeitos colaterais após o salvamento da pesquisa.
 * Bloqueante por design conforme solicitado (o usuário deve esperar).
 */
export async function handleSurveySideEffects(surveyId: string, responses: Record<string, SurveyValue>, matricula: string, userUid: string) {
  const db = getAdminDb();
  console.log(`🚀 [Effects:Main] Iniciando Side Effects para: ${surveyId} | Matrícula: ${matricula}`);

  try {
  if (surveyId === "welcome_survey") {
    console.log(`📡 [Effects] Iniciando processamento pós-onboarding: ${matricula}`);
    
    const userRef = db.doc(`User/${matricula}`);
    const nickname = (responses.nickname as string) || "";
    const userTypeRaw = (responses.userType as string) || "member";
    const userType = userTypeRaw.includes("empresa") || userTypeRaw.includes("PJ") ? "PJ" : "PF";

    // 1. Sincronizar Identidade (Auth -> Root Profile) 🛡️
    let authName = "Membro BPlen";
    let authEmail = "";
    try {
      const authAdmin = getAdminAuth();
      const userAuth = await authAdmin.getUser(userUid);
      authName = userAuth.displayName || userAuth.email?.split("@")[0] || authName;
      authEmail = userAuth.email || "";
    } catch (authErr) {
      console.warn("⚠️ [Effects] Falha ao buscar metadados do Auth:", authErr);
    }

    await userRef.set({
      hasCompletedWelcome: true,
      Authentication_Name: authName,
      email: authEmail,
      User_Nickname: nickname || null,
      User_Type: userType,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // 2. Sincronização Google Drive / Sheets 🛰️
    try {
      const { getDriveClient, getSheetsClient } = await import("@/lib/google-auth");
      const { serverEnv } = await import("@/env");
      const { ensureFolder, createSpreadsheet, syncDataToSheet } = await import("@/lib/drive-utils");

      const drive = await getDriveClient();
      const sheets = await getSheetsClient();
      const baseFolderId = serverEnv.GOOGLE_DRIVE_USUARIOS_ID;

      const catFolderId = await ensureFolder(drive, baseFolderId, userType === "PJ" ? "2.3.B2B" : "2.2.B2C");
      const userFolderId = await ensureFolder(drive, catFolderId, matricula);
      const spreadsheetId = await createSpreadsheet(drive, userFolderId, `User_Welcome - ${matricula}`);

      const headers = ["Timestamp", "Matrícula", "UID", "Nickname", "Interesses", "Origem"];
      const rowData: (string | number | boolean | null)[] = [
        new Date().toLocaleString("pt-BR"),
        matricula,
        userUid,
        nickname,
        Array.isArray(responses.topics) ? responses.topics.join(", ") : String(responses.topics || ""),
        String(responses.origin || "N/A")
      ];

      await syncDataToSheet(sheets, spreadsheetId, headers, rowData);
    } catch (driveErr) {
      // Nota: Como o usuário deve esperar, aqui o erro poderia travar se quiséssemos, 
      // mas mantemos o log amigável para não impedir o onboarding se o Google cair.
      console.error(`❌ [Effects] Erro crítico na Sincronização Drive:`, driveErr);
    }

    console.log(`✨ [Effects] Fluxo de Onboarding finalizado: ${matricula}`);
  }

  // EFEITOS: Check-in BPlen 📊
  if (surveyId === "check_in" || surveyId === "check_in_v1") {
    console.log(`📡 [Effects] Iniciando processamento Check-in BPlen: ${matricula}`);
    
    try {
      const { getDriveClient, getSheetsClient } = await import("@/lib/google-auth");
      const { serverEnv } = await import("@/env");
      const { ensureFolder, createSpreadsheet, syncDataToSheet } = await import("@/lib/drive-utils");

      const drive = await getDriveClient();
      const sheets = await getSheetsClient();
      const baseFolderId = serverEnv.GOOGLE_DRIVE_USUARIOS_ID;

      const isPJ = matricula.includes("-PJ-");
      const catFolderId = await ensureFolder(drive, baseFolderId, isPJ ? "2.3.B2B" : "2.2.B2C");
      const userFolderId = await ensureFolder(drive, catFolderId, matricula);
      
      // Pasta específica para Surveys/Checkins dentro do usuário
      const surveyFolderId = await ensureFolder(drive, userFolderId, "1.Surveys");
      const spreadsheetId = await createSpreadsheet(drive, surveyFolderId, `Check-in - ${matricula}`);

      const headers = [
        "Timestamp", "Matrícula", "Nicho", "Desafios", "Objetivos", "Regime",
        "CV Drive", "Portfólio Drive", "LinkedIn", "Instagram", "Web/Portfolio", "Banco Talentos", "Comentários Carreira"
      ];
      const rowData: (string | number | boolean | null)[] = [
        new Date().toLocaleString("pt-BR"),
        matricula,
        String((responses.nicho_cascata as any)?.primary || "N/A"),
        Array.isArray(responses.desafios_multi) ? responses.desafios_multi.join(", ") : "N/A",
        String(responses.objetivos_timeline || "N/A"),
        String(responses.regime_choice || "N/A"),
        (responses.cv_upload as any)?.url || "N/A",
        (responses.portfolio_upload as any)?.url || "N/A",
        String(responses.linkedin_url || "N/A"),
        String(responses.instagram_url || "N/A"),
        `${responses.web_url || ""} | ${responses.portfolio_url || ""}`,
        String(responses.banco_talentos || "N/A"),
        String(responses.comentarios_carreira || "N/A")
      ];


      await syncDataToSheet(sheets, spreadsheetId, headers, rowData);
      console.log(`✅ [Effects] Check-in sincronizado com Drive: ${matricula}`);
    } catch (driveErr) {
      console.error(`❌ [Effects] Erro na sincronização Drive do Check-in:`, driveErr);
    }
  }

  // EFEITOS: Gestão do Tempo (Tríade) ⏳
  if (surveyId === "gestao_tempo") {
    console.log(`📡 [Effects] Iniciando processamento Gestão do Tempo: ${matricula}`);
    
    // 1. Cálculo da Tríade
    const getVal = (id: string) => Number(responses[id] || 0);
    
    const totalCircunstancia = getVal("q1") + getVal("q3") + getVal("q6") + getVal("q9") + getVal("q12") + getVal("q15");
    const totalImportancia = getVal("q4") + getVal("q7") + getVal("q10") + getVal("q11") + getVal("q14") + getVal("q17");
    const totalUrgencia = getVal("q2") + getVal("q5") + getVal("q8") + getVal("q13") + getVal("q16") + getVal("q18");
    
    const totalGeral = totalCircunstancia + totalImportancia + totalUrgencia;
    
    const pctImportancia = totalGeral > 0 ? Math.round((totalImportancia / totalGeral) * 100) : 0;
    const pctUrgencia = totalGeral > 0 ? Math.round((totalUrgencia / totalGeral) * 100) : 0;
    const pctCircunstancia = totalGeral > 0 ? Math.round((totalCircunstancia / totalGeral) * 100) : 0;

    const metadata = (responses.metadata as any) || {};

    // 2. Persistência no Firestore (Prioridade Máxima 🛡️)
    const resultPath = `User/${matricula}/results/gestao_tempo`;
    console.log(`🔍 [Effects:GestaoTempo] Salvando resultado imediato em: ${resultPath}`);
    const resultRef = db.doc(resultPath);
    await resultRef.set({
      surveyId,
      matricula,
      scores: {
        importancia: { total: totalImportancia, percentage: pctImportancia },
        urgencia: { total: totalUrgencia, percentage: pctUrgencia },
        circunstancia: { total: totalCircunstancia, percentage: pctCircunstancia },
        totalGeral
      },
      responses: Object.fromEntries(Object.entries(responses).filter(([k]) => k !== "metadata")),
      durationSeconds: metadata.durationSeconds || 0,
      isReleased: false, 
      submittedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 3. Sincronização Google Sheets (Baixa Prioridade / Background-ish)
    try {
      const { getDriveClient, getSheetsClient } = await import("@/lib/google-auth");
      const { serverEnv } = await import("@/env");
      const { ensureFolder, createSpreadsheet, syncDataToSheet } = await import("@/lib/drive-utils");

      const drive = await getDriveClient();
      const sheets = await getSheetsClient();
      const baseFolderId = serverEnv.GOOGLE_DRIVE_USUARIOS_ID;

      const isPJ = matricula.includes("-PJ-");
      const catFolderId = await ensureFolder(drive, baseFolderId, isPJ ? "2.3.B2B" : "2.2.B2C");
      const userFolderId = await ensureFolder(drive, catFolderId, matricula);
      const surveyFolderId = await ensureFolder(drive, userFolderId, "1.Surveys");
      
      const spreadsheetId = await createSpreadsheet(drive, surveyFolderId, `Gestão do Tempo - ${matricula}`);

      const headers = [
        "Timestamp", "Matrícula", "Duração (s)", 
        "Total Importância", "% Importância", 
        "Total Urgência", "% Urgência", 
        "Total Circunstância", "% Circunstância",
        "Análise Final"
      ];
      
      const rowData = [
        new Date().toLocaleString("pt-BR"),
        matricula,
        metadata.durationSeconds || 0,
        totalImportancia, pctImportancia,
        totalUrgencia, pctUrgencia,
        totalCircunstancia, pctCircunstancia,
        String(responses.auto_avaliacao || "N/A")
      ];

      await syncDataToSheet(sheets, spreadsheetId, headers, rowData);
      console.log(`✅ [Effects] Gestão do Tempo sincronizado com Drive: ${matricula}`);
    } catch (driveErr) {
      console.error(`❌ [Effects] Erro na sincronização Drive Gestão do Tempo:`, driveErr);
    }
  }

  // EFEITOS: Preferências de Aprendizado (VACD) — Mapa de Representação 🧠
  if (surveyId === "preferencias_aprendizado") {
    console.log(`📡 [Effects] Iniciando processamento Preferências de Aprendizado: ${matricula}`);
    
    // 1. Lógica de Cálculo (Gabarito Oficial)
    let totalV = 0, totalA = 0, totalC = 0, totalD = 0;

    const getRanks = (qId: string) => (responses[qId] as Record<string, number>) || {};

    // Q1 Mapping
    const r1 = getRanks("q1");
    totalC += r1["Minha intuição"] || 0;
    totalA += r1["O que me soa melhor"] || 0;
    totalV += r1["O que me parece melhor"] || 0;
    totalD += r1["Um estudo preciso e minucioso do assunto"] || 0;

    // Q2 Mapping
    const r2 = getRanks("q2");
    totalA += r2["O tom de voz da outra pessoa"] || 0;
    totalV += r2["Se eu posso ou não ver o argumento da outra pessoa"] || 0;
    totalD += r2["A lógica do argumento da outra pessoa"] || 0;
    totalC += r2["Se eu entro em contato ou não com os sentimentos reais do outro"] || 0;

    // Q3 Mapping
    const r3 = getRanks("q3");
    totalV += r3["No modo como me visto e aparento"] || 0;
    totalC += r3["Pelos sentimentos que compartilho"] || 0;
    totalD += r3["Pelas palavras que escolho"] || 0;
    totalA += r3["Pelo tom da minha voz"] || 0;

    // Q4 Mapping
    const r4 = getRanks("q4");
    totalA += r4["Achar o volume e a sintonia ideais num sistema de som"] || 0;
    totalD += r4["Selecionar o ponto mais relevante relativo a um assunto interessante"] || 0;
    totalC += r4["Escolher os móveis mais confortáveis"] || 0;
    totalV += r4["Escolher as combinações de cores mais ricas e atraentes"] || 0;

    // Q5 Mapping
    const r5 = getRanks("q5");
    totalA += r5["Se estou muito em sintonia com os sons do ambiente"] || 0;
    totalD += r5["Se sou muito capaz de raciocinar com fatos e dados novos"] || 0;
    totalC += r5["Eu sou muito senível à maneira como a roupa veste o meu corpo"] || 0;
    totalV += r5["Eu respondo fortemente às cores e à aparência de uma sala"] || 0;

    const pctV = totalV * 2;
    const pctA = totalA * 2;
    const pctC = totalC * 2;
    const pctD = totalD * 2;

    const metadata = (responses.metadata as any) || {};

    // 2. Persistência no Firestore (Prioridade Máxima 🛡️)
    const resultPath = `User/${matricula}/results/preferencias_aprendizado`;
    console.log(`🔍 [Effects:Aprendizado] Salvando resultado imediato em: ${resultPath}`);
    const resultRef = db.doc(resultPath);
    await resultRef.set({
      surveyId,
      matricula,
      scores: {
        visual: { total: totalV, percentage: pctV },
        auditivo: { total: totalA, percentage: pctA },
        cinestesico: { total: totalC, percentage: pctC },
        digital: { total: totalD, percentage: pctD }
      },
      responses: Object.fromEntries(Object.entries(responses).filter(([k]) => k !== "metadata")),
      durationSeconds: metadata.durationSeconds || 0,
      isReleased: false,
      submittedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 3. Sincronização Google Sheets
    try {
      const { getDriveClient, getSheetsClient } = await import("@/lib/google-auth");
      const { serverEnv } = await import("@/env");
      const { ensureFolder, createSpreadsheet, syncDataToSheet } = await import("@/lib/drive-utils");

      const drive = await getDriveClient();
      const sheets = await getSheetsClient();
      const baseFolderId = serverEnv.GOOGLE_DRIVE_USUARIOS_ID;

      const isPJ = matricula.includes("-PJ-");
      const catFolderId = await ensureFolder(drive, baseFolderId, isPJ ? "2.3.B2B" : "2.2.B2C");
      const userFolderId = await ensureFolder(drive, catFolderId, matricula);
      const surveyFolderId = await ensureFolder(drive, userFolderId, "1.Surveys");
      
      const spreadsheetId = await createSpreadsheet(drive, surveyFolderId, `Preferências de Aprendizado - ${matricula}`);

      const headers = [
        "Timestamp", "Matrícula", "Duração (s)", 
        "% Visual", "% Auditivo", "% Cinestésico", "% Digital",
        "Análise de Hábitos"
      ];
      
      const rowData = [
        new Date().toLocaleString("pt-BR"),
        matricula,
        metadata.durationSeconds || 0,
        pctV, pctA, pctC, pctD,
        String(responses.habitos_aprendizagem || "N/A")
      ];

      await syncDataToSheet(sheets, spreadsheetId, headers, rowData);
      console.log(`✅ [Effects] Preferências de Aprendizado sincronizado com Drive: ${matricula}`);
    } catch (driveErr) {
      console.error(`❌ [Effects] Erro na sincronização Drive Preferências de Aprendizado:`, driveErr);
    }
  }

  // EFEITOS: Preferências de Reconhecimento (Linguagens de Apreciação) 💖
  if (surveyId === "preferencias_reconhecimento") {
    console.log(`📡 [Effects] Iniciando processamento Preferências de Reconhecimento: ${matricula}`);
    
    let totalA = 0, totalB = 0, totalC = 0, totalD = 0, totalE = 0;
    const groups = ["grupo1", "grupo2", "grupo3", "grupo4", "grupo5"];
    
    groups.forEach(gId => {
      const resp = responses[gId];
      
      // ✅ Suporte para Escolha Única (String) ou Múltipla (Objeto)
      if (typeof resp === "string") {
         if (resp.startsWith("A.")) totalA += 1;
         if (resp.startsWith("B.")) totalB += 1;
         if (resp.startsWith("C.")) totalC += 1;
         if (resp.startsWith("D.")) totalD += 1;
         if (resp.startsWith("E.")) totalE += 1;
      } else if (typeof resp === "object" && resp !== null) {
         Object.entries(resp).forEach(([label, value]) => {
           const v = Number(value) || 0;
           if (label.startsWith("A.")) totalA += v;
           else if (label.startsWith("B.")) totalB += v;
           else if (label.startsWith("C.")) totalC += v;
           else if (label.startsWith("D.")) totalD += v;
           else if (label.startsWith("E.")) totalE += v;
         });
      }
    });

    const totalGeral = totalA + totalB + totalC + totalD + totalE;
    const getPct = (val: number) => totalGeral > 0 ? Math.round((val / totalGeral) * 100) : 0;

    const pctA = getPct(totalA);
    const pctB = getPct(totalB);
    const pctC = getPct(totalC);
    const pctD = getPct(totalD);
    const pctE = getPct(totalE);

    const metadata = (responses.metadata as any) || {};

    // 2. Persistência no Firestore
    const resultPath = `User/${matricula}/results/preferencias_reconhecimento`;
    console.log(`🔍 [Effects:Reconhecimento] Salvando resultado em: ${resultPath}`);
    const resultRef = db.doc(resultPath);
    await resultRef.set({
      surveyId,
      matricula,
      scores: {
        afirmacao: { total: totalA, percentage: pctA },
        servico: { total: totalB, percentage: pctB },
        presentes: { total: totalC, percentage: pctC },
        tempo: { total: totalD, percentage: pctD },
        toque: { total: totalE, percentage: pctE },
        totalGeral
      },
      responses: Object.fromEntries(Object.entries(responses).filter(([k]) => k !== "metadata")),
      durationSeconds: metadata.durationSeconds || 0,
      isReleased: false,
      submittedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 3. Sincronização Google Sheets
    try {
      const { getDriveClient, getSheetsClient } = await import("@/lib/google-auth");
      const { serverEnv } = await import("@/env");
      const { ensureFolder, createSpreadsheet, syncDataToSheet } = await import("@/lib/drive-utils");

      const drive = await getDriveClient();
      const sheets = await getSheetsClient();
      const baseFolderId = serverEnv.GOOGLE_DRIVE_USUARIOS_ID;

      const isPJ = matricula.includes("-PJ-");
      const catFolderId = await ensureFolder(drive, baseFolderId, isPJ ? "2.3.B2B" : "2.2.B2C");
      const userFolderId = await ensureFolder(drive, catFolderId, matricula);
      const surveyFolderId = await ensureFolder(drive, userFolderId, "1.Surveys");
      
      const spreadsheetId = await createSpreadsheet(drive, surveyFolderId, `Preferências de Reconhecimento - ${matricula}`);

      const headers = [
        "Timestamp", "Matrícula", "Duração (s)", 
        "% Afirmação", "% Serviço", "% Presentes", "% Tempo", "% Toque",
        "Análise Interpessoal"
      ];
      
      const rowData = [
        new Date().toLocaleString("pt-BR"),
        matricula,
        metadata.durationSeconds || 0,
        pctA, pctB, pctC, pctD, pctE,
        String(responses.comunicacao_relacoes || "N/A")
      ];

      await syncDataToSheet(sheets, spreadsheetId, headers, rowData);
      console.log(`✅ [Effects] Preferências de Reconhecimento sincronizado com Drive: ${matricula}`);
    } catch (driveErr) {
      console.error(`❌ [Effects] Erro na sincronização Drive Preferências de Reconhecimento:`, driveErr);
    }
  }

  // EFEITOS: Pré-Análise Comportamental 🧬
  if (surveyId === "pre_analise_comportamental") {
    console.log(`📡 [Effects] Iniciando processamento Pré-Análise Comportamental: ${matricula}`);
    
    const metadata = (responses.metadata as any) || {};

    // 2. Persistência no Firestore (Prioridade Máxima 🛡️)
    const resultPath = `User/${matricula}/results/pre_analise_comportamental`;
    console.log(`🔍 [Effects:PreAnalise] Salvando resultado imediato em: ${resultPath}`);
    const resultRef = db.doc(resultPath);
    await resultRef.set({
      surveyId,
      matricula,
      responses: Object.fromEntries(Object.entries(responses).filter(([k]) => k !== "metadata")),
      durationSeconds: metadata.durationSeconds || 0,
      isReleased: false,
      submittedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 2. Sincronização Google Sheets
    try {
      const { getDriveClient, getSheetsClient } = await import("@/lib/google-auth");
      const { serverEnv } = await import("@/env");
      const { ensureFolder, createSpreadsheet, syncDataToSheet } = await import("@/lib/drive-utils");

      const drive = await getDriveClient();
      const sheets = await getSheetsClient();
      const baseFolderId = serverEnv.GOOGLE_DRIVE_USUARIOS_ID;

      const isPJ = matricula.includes("-PJ-");
      const catFolderId = await ensureFolder(drive, baseFolderId, isPJ ? "2.3.B2B" : "2.2.B2C");
      const userFolderId = await ensureFolder(drive, catFolderId, matricula);
      const surveyFolderId = await ensureFolder(drive, userFolderId, "1.Surveys");
      
      const spreadsheetId = await createSpreadsheet(drive, surveyFolderId, `Pré-Análise Comportamental - ${matricula}`);

      const headers = [
        "Timestamp", "Matrícula", "Duração (s)", 
        "Traços Selecionados",
        "Vida: Destino/Sorte", "Vida: Caráter/Destino", "Vida: Confia Opiniões", "Vida: Vive como quer",
        "Conflito", "Conflito (Outro)",
        "Frases Guia", "Referência Humana", "Foco Temporal", "Autodescrição", "Qualidades Admiradas", "Palavra Resumo"
      ];
      
      const resAfirmacoes = (responses.afirmacoes as Record<string, number>) || {};

      const rowData = [
        new Date().toLocaleString("pt-BR"),
        matricula,
        metadata.durationSeconds || 0,
        Array.isArray(responses.tracos) ? responses.tracos.join(", ") : "N/A",
        resAfirmacoes["A minha vida depende do destino ou da sorte"] || "N/A",
        resAfirmacoes["É o caráter que molda o destino"] || "N/A",
        resAfirmacoes["Eu confio nas opiniões de outras pessoas"] || "N/A",
        resAfirmacoes["Eu vivo da forma como eu quero"] || "N/A",
        responses.conflito || "N/A",
        responses.conflito_other || "N/A",
        responses.frases_vida || "N/A",
        responses.referencia_humana || "N/A",
        responses.reflexao_tempo || "N/A",
        responses.autodescricao_3p || "N/A",
        responses.qualidades_outros || "N/A",
        responses.resumo_pessoa || "N/A"
      ];

      await syncDataToSheet(sheets, spreadsheetId, headers, rowData);
      console.log(`✅ [Effects] Pré-Análise Comportamental sincronizado com Drive: ${matricula}`);
    } catch (driveErr) {
      console.error(`❌ [Effects] Erro na sincronização Drive Pré-Análise Comportamental:`, driveErr);
    }
  }

  } catch (globalErr: any) {
    console.error(`🚨 [Effects:Fatal] Falha Crítica no Processamento da Survey ${surveyId}:`, globalErr);
    // Não damos re-throw aqui para não travar o fluxo principal se os efeitos falharem,
    // mas o log acima nos dirá exatamente o que houve.
  }
}
