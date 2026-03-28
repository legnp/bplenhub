import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const initializeFirebase = () => {
  if (!getApps().length) {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '')
      : null;

    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        privateKey: privateKey,
      }),
    });
  }
};
initializeFirebase();
const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const serviceData = req.body;
    const { id, nome, jornada } = serviceData;

    if (!id || !nome || !jornada) {
      return res.status(400).json({ error: 'Campos obrigatórios: id, nome, jornada' });
    }

    const privateKey = process.env.GOOGLE_PRIVATE_KEY
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '')
      : null;

    if (!privateKey || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      throw new Error('Configurações de autenticação Google ausentes no servidor.');
    }

    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets'],
    });

    const tokenResponse = await auth.getAccessToken();
    if (!tokenResponse.token) throw new Error('Falha ao gerar o token OAuth da Google.');
    const token = tokenResponse.token;

    const drive = google.drive({ version: 'v3', auth });

    // Determinar pasta pai (Parent Folder)
    const parentFolderId = jornada === 'Carreira Profissional' 
      ? '1C7ExWR3SS3KGjmrAN8Jxr_HZWkp0fJI1' 
      : '1jPTCFEuLFjA5_J4UgycMyHDMUVnzVabm';

    const folderName = `${id}_${nome.replace(/[^a-zA-Z0-9 -]/g, '')}`;

    // Verificar se a pasta já existe
    const q = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and '${parentFolderId}' in parents and trashed=false`;
    const searchRes = await drive.files.list({ 
      q, spaces: 'drive', fields: 'nextPageToken, files(id, name)',
      supportsAllDrives: true, includeItemsFromAllDrives: true,
      headers: { Authorization: `Bearer ${token}` }
    });
    
    let folderId;

    if (searchRes.data.files.length > 0) {
      folderId = searchRes.data.files[0].id;
    } else {
      // Criar nova pasta
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
      };
      
      const folder = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id',
        supportsAllDrives: true,
        headers: { Authorization: `Bearer ${token}` }
      });
      folderId = folder.data.id;
    }

    // Gerar/Atualizar o Google Sheets da Ficha Tecnica
    const sheetName = `${id}_${nome.replace(/[^a-zA-Z0-9 -]/g, '')}-Ficha_Tecnica`;
    const qSheet = `mimeType='application/vnd.google-apps.spreadsheet' and name='${sheetName}' and '${folderId}' in parents and trashed=false`;
    const searchSheet = await drive.files.list({ 
      q: qSheet, spaces: 'drive', fields: 'files(id)',
      supportsAllDrives: true, includeItemsFromAllDrives: true,
      headers: { Authorization: `Bearer ${token}` }
    });
    
    let sheetId;
    if (searchSheet.data.files.length > 0) {
      sheetId = searchSheet.data.files[0].id;
    } else {
      // Criar nova planilha DIRETAMENTE na pasta alvo para evitar erros de permissão de transferência entre My Drive e Shared Drives
      const sheetMetadata = {
        name: sheetName,
        mimeType: 'application/vnd.google-apps.spreadsheet',
        parents: [folderId]
      };
      
      const spreadsheet = await drive.files.create({
        requestBody: sheetMetadata,
        fields: 'id',
        supportsAllDrives: true,
        headers: { Authorization: `Bearer ${token}` }
      });
      sheetId = spreadsheet.data.id;

    }

    // ====== POPULAR PLANILHA ======
    const sheetsApi = google.sheets({ version: 'v4', auth });
    
    const rows = [
      ['FICHA TÉCNICA DO SERVIÇO', ''],
      ['ID', id],
      ['Nome', nome],
      ['Jornada', jornada],
      ['Público', serviceData.publico || ''],
      ['Etapa', serviceData.etapa || ''],
      ['Status', serviceData.status || 'Pendente'],
      ['Link Pagamento', serviceData.link_pagamento || ''],
      [''],
      ['DESCRIÇÃO E OBJETIVO', ''],
      ['Objetivo', serviceData.objetivo || ''],
      ['Descrição', serviceData.descricao || ''],
      ['Observações Gerais', serviceData.observacoes || ''],
      [''],
      ['CRONOGRAMA / ESTRUTURA', ''],
      ['SLA (Unidade)', 'SLA (Prazo)', 'Checkpoint', 'Duração'],
    ];

    if (serviceData.cronograma && Array.isArray(serviceData.cronograma)) {
      serviceData.cronograma.forEach(c => rows.push([c.tipo_prazo || '', c.prazo_valor || '', c.checkpoint || '', `${c.duracao_valor} ${c.duracao_tipo}`]));
    }

    rows.push(['']);
    rows.push(['PRODUTO E COMERCIAL', '']);
    rows.push(['Link de Pagamento', serviceData.link_pagamento || '']);
    rows.push(['Link de Vendas', serviceData.link_vendas || '']);
    if (serviceData.capa_url) rows.push(['Link Imagem da Capa', serviceData.capa_url]);
    if (serviceData.qrcode_url) rows.push(['Link Imagem QR Code', serviceData.qrcode_url]);
    rows.push(['Moeda Padrão', serviceData.preco_padrao?.moeda || 'BRL']);
    rows.push(['Valor Padrão', serviceData.preco_padrao?.valor || 0]);
    rows.push(['']);
    
    rows.push(['OFERTAS E COMBOS', '']);
    rows.push(['Nome/Título', 'Desconto %', 'Valor Final', 'Status', 'Termos/Obs', 'Validade']);
    if (serviceData.ofertas && Array.isArray(serviceData.ofertas)) {
      serviceData.ofertas.forEach(o => rows.push([o.nome || '', `${o.desconto_perc || 0}%`, o.valor_final || 0, o.status || 'Ativa', o.termos || '', o.validade || '']));
    }

    rows.push(['']);
    rows.push(['CUPONS DE DESCONTO', '']);
    rows.push(['Código Cupom', 'Desconto %', 'Valor Final', 'Status', 'Termos/Obs', 'Validade']);
    if (serviceData.cupons && Array.isArray(serviceData.cupons)) {
      serviceData.cupons.forEach(c => rows.push([c.codigo || '', `${c.desconto_perc || 0}%`, c.valor_final || 0, c.status || 'Ativa', c.termos || '', c.validade || '']));
    }
    rows.push(['']);
    rows.push(['TERMOS JURÍDICOS', '']);
    rows.push(['Termos e Condições', serviceData.termos || 'Nenhum termo especificado.']);

    // Limpar planilha antes de reescrever para evitar dados fantasma (ex: o usuário deletou um cupom)
    await sheetsApi.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: 'A1:Z500',
      headers: { Authorization: `Bearer ${token}` }
    });

    await sheetsApi.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: 'A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: rows },
      headers: { Authorization: `Bearer ${token}` }
    });
    // ====== FIM POPULAR ======

    // Salvar no Firestore
    const serviceRef = db.collection('servicos_portfolio').doc(id);
    
    const payload = {
      ...serviceData,
      drive_folder_id: folderId,
      ficha_tecnica_sheet_id: sheetId,
      updated_at: new Date()
    };
    
    await serviceRef.set(payload, { merge: true });

    return res.status(200).json({ 
      success: true, 
      folderId,
      sheetId,
      message: 'Serviço salvo com sucesso!' 
    });

  } catch (error) {
    console.error('Erro ao salvar serviço:', error);
    return res.status(500).json({ error: 'Falha interna', details: error.message, stack: error.stack });
  }
}
