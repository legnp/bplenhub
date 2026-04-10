"use server";

import { Resend } from "resend";
import { 
  collection, 
  addDoc, 
  getDoc, 
  serverTimestamp,
  deleteDoc
} from "firebase/firestore";
import { 
  getCalendarClient, 
  getDriveClient, 
  getSheetsClient 
} from "@/lib/google-auth";
import { db } from "@/lib/firebase";
import { serverEnv } from "@/env";
import { requireAdmin } from "@/lib/auth-guards";

/**
 * Utilitário de Diagnóstico Silencioso 🛡️
 * Verifica se a chave privada está íntegra após a normalização do Zod.
 */
function checkKeySignature() {
  const key = serverEnv.FIREBASE_PRIVATE_KEY;
  const length = key.length;
  const hasStart = key.includes("-----BEGIN PRIVATE KEY-----");
  const hasEnd = key.includes("-----END PRIVATE KEY-----");
  const hasLiteralN = key.includes("\\n");

  console.log(`[Google API Auth] Key Signature: Length=${length}, Header=${hasStart}, Footer=${hasEnd}, LiteralN=${hasLiteralN}`);
  
  if (!hasStart || !hasEnd) {
    throw new Error("Chave Privada Malformada: Cabeçalhos PEM ausentes.");
  }
}

// ──────────────────────────────
// 1. Teste de Agenda
// ──────────────────────────────
export async function testCalendar(adminToken?: string) {
  try {
    // 🛡️ Segurança Real no Servidor
    await requireAdmin(adminToken);

    checkKeySignature();
    const calendar = await getCalendarClient();
    const res = await calendar.events.list({
      calendarId: serverEnv.GOOGLE_CALENDAR_ID,
      timeMin: new Date().toISOString(),
      maxResults: 5,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = res.data.items || [];
    return {
      success: true,
      message: `${events.length} eventos encontrados na agenda.`,
      data: events.map(e => ({ title: e.summary, start: e.start?.dateTime || e.start?.date })),
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Erro no Teste de Agenda:", err);
    return { success: false, message: err.message };
  }
}

// ──────────────────────────────
// 2. Teste de Pastas (Drive)
// ──────────────────────────────
export async function testDriveFolders(adminToken?: string) {
  try {
    // 🛡️ Segurança Real no Servidor
    await requireAdmin(adminToken);

    checkKeySignature();
    const drive = await getDriveClient();
    const domains = [
      { name: "ATA", id: serverEnv.GOOGLE_DRIVE_ATAS_ID },
      { name: "USERS", id: serverEnv.GOOGLE_DRIVE_USUARIOS_ID },
      { name: "PORTFOLIO", id: serverEnv.GOOGLE_DRIVE_PORTFOLIO_ID },
    ];

    const results = [];
    for (const domain of domains) {
      const folderName = `TESTE_LAB_${domain.name}_${new Date().getTime()}`;
      const res = await drive.files.create({
        supportsAllDrives: true,
        requestBody: {
          name: folderName,
          mimeType: "application/vnd.google-apps.folder",
          parents: [domain.id],
        },
        fields: "id",
      });
      results.push(`${domain.name}: OK (ID: ${res.data.id})`);
    }

    return { success: true, message: "Pastas criadas nos 3 domínios.", data: results };
  } catch (error: unknown) { const err = error as Error; console.error(); return { success: false, message: err.message };
  }
}

// ──────────────────────────────
// 3. Teste de Sheets (Escrita)
// ──────────────────────────────
export async function testSheets(adminToken?: string) {
  try {
    // 🛡️ Segurança Real no Servidor
    await requireAdmin(adminToken);

    checkKeySignature();
    const sheets = await getSheetsClient();
    const drive = await getDriveClient();

    // Criar uma planilha nova na pasta de Portfólio
    const sheetFile = await drive.files.create({
      supportsAllDrives: true,
      requestBody: {
        name: `TESTE_LAB_SHEETS_${new Date().getTime()}`,
        mimeType: "application/vnd.google-apps.spreadsheet",
        parents: [serverEnv.GOOGLE_DRIVE_PORTFOLIO_ID],
      },
      fields: "id",
    });

    const spreadsheetId = sheetFile.data.id!;

    // Escrever dados nela
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Sheet1!A1:B2",
      valueInputOption: "RAW",
      requestBody: {
        values: [
          ["BPlen HUB Lab", "Status"],
          ["Conexão Google API", "SINC_OK"],
        ],
      },
    });

    return {
      success: true,
      message: "Planilha criada e dados escritos.",
      data: { url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}` },
    };
  } catch (error: unknown) { const err = error as Error; console.error(); return { success: false, message: err.message };
  }
}

// ──────────────────────────────
// 4. Teste de Upload (Drive)
// ──────────────────────────────
export async function testUpload(adminToken?: string) {
  try {
    // 🛡️ Segurança Real no Servidor
    await requireAdmin(adminToken);

    checkKeySignature();
    const drive = await getDriveClient();
    const fileName = `TESTE_UPLOAD_${new Date().getTime()}.txt`;
    
    // Simular upload de arquivo de texto
    const res = await drive.files.create({
      supportsAllDrives: true,
      requestBody: {
        name: fileName,
        parents: [serverEnv.GOOGLE_DRIVE_ATAS_ID],
      },
      media: {
        mimeType: "text/plain",
        body: `Teste de upload BPlen HUB.\nData: ${new Date().toLocaleString('pt-BR')}`,
      },
      fields: "id",
    });

    return { success: true, message: `Upload concluído: ${fileName}`, data: { id: res.data.id } };
  } catch (error: unknown) { const err = error as Error; console.error(); return { success: false, message: err.message };
  }
}

// ──────────────────────────────
// 5. Teste de E-mail (Resend)
// ──────────────────────────────

const ALIAS_DISPLAY_NAMES: Record<string, string> = {
  it: "BPlen IT",
  atendimento: "BPlen Atendimento",
  hub: "BPlen HUB",
  financeiro: "BPlen Financeiro",
  "lisandra.lencina": "Lisandra Lencina (BPlen)",
};

export async function testEmail(alias: string, adminToken?: string) {
  try {
    // 🛡️ Segurança Real no Servidor
    await requireAdmin(adminToken);

    const resend = new Resend(serverEnv.RESEND_API_KEY);
    
    const displayName = ALIAS_DISPLAY_NAMES[alias] || "BPlen HUB";
    const from = `${displayName} <${alias}@bplen.com>`;
    
    const { data, error } = await resend.emails.send({
      from: from,
      to: "legnp@bplen.com", // Destinatário fixo para o teste do usuário
      subject: `📧 Laboratório BPlen: Teste de Alias [${displayName}]`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1D1D1F; background: #F5F7FA;">
          <h2 style="color: #764ba2;">Teste de Comunicação BPlen HUB</h2>
          <p>Este é um e-mail de validação técnica enviado via <strong>Resend</strong>.</p>
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
          <p><strong>Configurações do Teste:</strong></p>
          <ul>
            <li><strong>Alias Selecionado:</strong> ${alias}@bplen.com</li>
            <li><strong>Nome de Exibição:</strong> ${displayName}</li>
            <li><strong>Timestamp:</strong> ${new Date().toLocaleString('pt-BR')}</li>
          </ul>
          <p style="font-size: 12px; color: #888;">ID de Rastreamento: ${new Date().getTime()}</p>
        </div>
      `,
    });

    if (error) throw error;

    return { 
      success: true, 
      id: data?.id,
      from: from
    };
  } catch (error: unknown) { const err = error as Error; console.error(); return { success: false, message: err.message };
  }
}

// ──────────────────────────────
// 6. Teste de Banco de Dados (Firestore)
// ──────────────────────────────

export async function testFirestore(adminToken?: string) {
  try {
    // 🛡️ Segurança Real no Servidor
    await requireAdmin(adminToken);

    const testData = {
      timestamp: new Date().toISOString(),
      status: "validating_infrastructure",
      agent: "Antigravity 🧪",
      message: "Ciclo de escrita/leitura ok!"
    };

    // 1. Gravação (Escrita)
    const docRef = await addDoc(collection(db, "_laboratorio_testes"), {
      ...testData,
      createdAt: serverTimestamp() // Usa o tempo do servidor do Google
    });

    // 2. Leitura (Verificação)
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error("Documento gravado no Firestore não foi encontrado na leitura.");
    }

    const data = docSnap.data();

    // 3. Limpeza (Opcional, mas mantém o banco limpo)
    // await deleteDoc(docRef); 

    return { 
      success: true, 
      id: docRef.id,
      message: "Escrita e Leitura concluídas com sucesso!",
      data: {
        id: docRef.id,
        persistedAt: data.timestamp
      }
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Erro no Teste do Firestore:", err);
    throw new Error(err.message || "Falha ao conectar com o Cloud Firestore.");
  }
}
