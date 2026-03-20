import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import formidable from 'formidable';
import fs from 'fs';

// Necessário para processar arquivos binários
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const form = formidable();
  
  try {
    const [fields, files] = await form.parse(req);
    
    // Formidable v3 retorna campos como arrays
    const userName = fields.userName ? fields.userName[0] : 'Membro';
    const matricula = fields.matricula ? fields.matricula[0] : 'BPL-XXXX';
    const userEmail = fields.userEmail ? fields.userEmail[0] : '';
    
    // Autenticação com Google
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });
    const parentId = process.env.GOOGLE_DRIVE_PARENT_ID || '1DlvOolQ8r6_Bq-EQG3udFRonJiWRGdmj';
    
    // 1. Criar/Buscar a pasta do usuário: [BPL-2026-XXXX] [Nome]
    const folderName = `[${matricula}] ${userName}`;
    
    // Busca se já existe
    const responseSearch = await drive.files.list({
      q: `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`,
      fields: 'files(id)',
    });

    let folderId;
    if (responseSearch.data.files.length > 0) {
      folderId = responseSearch.data.files[0].id;
    } else {
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId],
      };
      const responseFolder = await drive.files.create({
        resource: folderMetadata,
        fields: 'id',
      });
      folderId = responseFolder.data.id;
    }

    // 2. Upload dos arquivos
    const uploadedLinks = {};
    
    for (const key of Object.keys(files)) {
      const file = files[key][0]; // formidable v3+ retorna arrays
      const fileMetadata = {
        name: file.originalFilename,
        parents: [folderId],
      };
      const media = {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.filepath),
      };

      const responseFile = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, webViewLink',
      });
      
      uploadedLinks[key] = responseFile.data.webViewLink;
    }

    // Link da pasta principal
    const folderLink = `https://drive.google.com/drive/u/0/folders/${folderId}`;

    return res.status(200).json({ 
      success: true, 
      folderId, 
      folderLink,
      files: uploadedLinks 
    });

  } catch (error) {
    console.error('Erro no upload para o Drive:', error);
    return res.status(500).json({ error: error.message });
  }
}
