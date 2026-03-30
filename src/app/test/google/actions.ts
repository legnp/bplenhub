"use server";

import { Resend } from "resend";
import { 
  getCalendarClient, 
  getDriveClient, 
  getSheetsClient 
} from "@/lib/google-auth";
import { serverEnv } from "@/env";

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
export async function testCalendar() {
  try {
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
  } catch (error: any) {
    console.error("Erro no Teste de Agenda:", error);
    return { success: false, message: error.message };
  }
}

// ──────────────────────────────
// 2. Teste de Pastas (Drive)
// ──────────────────────────────
export async function testDriveFolders() {
  try {
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
  } catch (error: any) {
    console.error("Erro no Teste de Pastas:", error);
    return { success: false, message: error.message };
  }
}

// ──────────────────────────────
// 3. Teste de Sheets (Escrita)
// ──────────────────────────────
export async function testSheets() {
  try {
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
  } catch (error: any) {
    console.error("Erro no Teste de Sheets:", error);
    return { success: false, message: error.message };
  }
}

// ──────────────────────────────
// 4. Teste de Upload (Drive)
// ──────────────────────────────
export async function testUpload() {
  try {
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
  } catch (error: any) {
    console.error("Erro no Teste de Upload:", error);
    return { success: false, message: error.message };
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

export async function testEmail(alias: string) {
  try {
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
  } catch (error: any) {
    console.error("Erro no Teste de E-mail:", error);
    throw new Error(error.message || "Falha ao enviar e-mail de teste.");
  }
}
