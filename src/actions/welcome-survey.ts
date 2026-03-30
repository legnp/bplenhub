"use server";

import { collection, getCountFromServer, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getDriveClient, getSheetsClient } from "@/lib/google-auth";
import { serverEnv } from "@/env";

interface WelcomeSurveyData {
  uid: string;
  email: string;
  Authentication_Name: string;
  User_Nickname: string;
  User_Type: "PF" | "PJ";
  Customer_FirstTopics: string[];
  Customer_FirstDemand: string;
  Customer_Origin: string;
}

export async function submitWelcomeSurvey(data: WelcomeSurveyData) {
  try {
    // 1. Gerar Matrícula BPlen
    const usersCol = collection(db, "User");
    const snapshot = await getCountFromServer(usersCol);
    const count = snapshot.data().count + 1; // Próximo usuário

    const seq = count.toString().padStart(3, "0"); // xxx
    const type = data.User_Type;

    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const aammdd = `${yy}${mm}${dd}`;

    const matricula = `BP-${seq}-${type}-${aammdd}`;

    // 2. Gravar no Firestore
    // Firestore > Coleção > User > Matricula BPlen (Direto no documento)
    const userRef = doc(db, "User", matricula);
    await setDoc(userRef, {
      uid: data.uid,
      email: data.email,
      Authentication_Name: data.Authentication_Name,
      createdAt: serverTimestamp(),
      hasCompletedWelcome: true,
      lastUpdated: serverTimestamp(),
      // Dados da Pesquisa salvos como um Objeto (Mapa) para evitar subcoleções profundas
      User_Welcome: {
        ...data,
        matricula,
        submittedAt: serverTimestamp()
      }
    }, { merge: true });

    // Também cria um mapa reverso de uid -> matricula para facilitar login futuro
    const uidMapRef = doc(db, "_AuthMap", data.uid);
    await setDoc(uidMapRef, { matricula });

    // 3. Criar Pasta e Planilha no Google Drive (Agora com await para garantir conclusão)
    await syncToDrive(matricula, data);

    return { success: true, matricula };
  } catch (error: any) {
    console.error("Erro na Server Action:", error);
    throw new Error(error.message || "Falha ao enviar survey");
  }
}

// ────────────────────────────────────────────────────────────────
/**
 * Utilitário de Diagnóstico Silencioso (Replicado do Laboratório) 🧪
 */
function checkKeySignature() {
  const key = serverEnv.FIREBASE_PRIVATE_KEY;
  if (!key.includes("-----BEGIN PRIVATE KEY-----") || !key.includes("-----END PRIVATE KEY-----")) {
    throw new Error("Chave Privada malformada detectada na sincronização do Drive.");
  }
}

// ──────────────────────────────
// Sincronização Google Drive / Sheets (Padrão Laboratório ✅)
// ──────────────────────────────
async function syncToDrive(matricula: string, data: WelcomeSurveyData) {
  try {
    checkKeySignature();
    
    const drive = await getDriveClient();
    const sheets = await getSheetsClient();
    const baseFolderId = serverEnv.GOOGLE_DRIVE_USUARIOS_ID; // Pasta 'Users'

    // 1. Garantir que a pasta 2.2.B2C existe dentro de Users (Lógica Premium 🛡️)
    const listFolders = await drive.files.list({
      q: `'${baseFolderId}' in parents and name = '2.2.B2C' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: "files(id)",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    let b2cFolderId;
    if (listFolders.data.files && listFolders.data.files.length > 0) {
      b2cFolderId = listFolders.data.files[0].id;
    } else {
      const createB2C = await drive.files.create({
        supportsAllDrives: true,
        requestBody: {
          name: "2.2.B2C",
          mimeType: "application/vnd.google-apps.folder",
          parents: [baseFolderId],
        },
        fields: "id",
      });
      b2cFolderId = createB2C.data.id;
    }

    // 2. Criar pasta da matrícula dentro de 2.2.B2C
    const folderRes = await drive.files.create({
      supportsAllDrives: true,
      requestBody: {
        name: matricula,
        mimeType: "application/vnd.google-apps.folder",
        parents: [b2cFolderId!],
      },
      fields: "id",
    });
    
    const userFolderId = folderRes.data.id;
    if (!userFolderId) throw new Error("Falha ao criar pasta do usuário no Drive");

    // 3. Criar planilha User_Welcome (Google Sheets) dentro da pasta criada
    const sheetRes = await drive.files.create({
      supportsAllDrives: true,
      requestBody: {
        name: `User_Welcome - ${matricula}`,
        mimeType: "application/vnd.google-apps.spreadsheet",
        parents: [userFolderId],
      },
      fields: "id",
    });

    const spreadsheetId = sheetRes.data.id!;

    // 4. Identificar o nome da primeira aba disponível (evita erro Sheet1 vs Página1)
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetTitle = spreadsheet.data.sheets?.[0].properties?.title || "Sheet1";

    // 5. Cadastrar dados e criar cabeçalho
    const headers = [
      "Timestamp", "Matrícula", "UID", "Email", "Nome Autenticação", 
      "Como devemos te chamar?", "Tipo", "Temas Buscados", 
      "Demanda", "Origem"
    ];
    const rowData = [
      new Date().toLocaleString("pt-BR"),
      matricula,
      data.uid,
      data.email,
      data.Authentication_Name,
      data.User_Nickname,
      data.User_Type,
      data.Customer_FirstTopics.join(", "),
      data.Customer_FirstDemand,
      data.Customer_Origin
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetTitle}!A1:J2`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [headers, rowData],
      },
    });

    console.log(`✅ [Welcome Survey] Drive Sincronizado: ${matricula}`);
  } catch (error: any) {
    console.error("Erro na Sincronização do Drive (SyncToDrive):", error);
    throw error;
  }
}
