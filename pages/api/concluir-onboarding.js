import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import formidable from 'formidable';
import fs from 'fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (Server-side)
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
    
    const sessionId = fields.sessionId ? fields.sessionId[0] : null;
    const orientador = fields.orientador ? fields.orientador[0] : '';
    const comentarios = fields.comentarios ? fields.comentarios[0] : '';

    if (!sessionId) {
      return res.status(400).json({ error: 'ID da sessão é obrigatório' });
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
      scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive'],
    });

    const tokenResponse = await auth.getAccessToken();
    const token = tokenResponse.token;

    if (!token) {
      throw new Error('Não foi possível gerar o token OAuth da Google.');
    }

    const drive = google.drive({ version: 'v3', auth });
    const folderId = '1ZXQPbiECmGbjnS3gLlayaLE8KTqHT28t';

    let fileLink = '';
    let fileName = '';

    // Upload file if present
    const ataFiles = files.ata;
    if (ataFiles && ataFiles.length > 0) {
      const file = ataFiles[0];
      
      // Criar nome personalizado: Ata_Onboarding-[YYYYMMDD]-[sessionId]
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
      const extension = file.originalFilename.split('.').pop();
      const newFileName = `Ata_Onboarding-${dateStr}-${sessionId.substring(0, 8)}.${extension}`;

      const fileMetadata = {
        name: newFileName,
        parents: [folderId],
      };
      const media = {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.filepath),
      };

      const responseFile = await drive.files.create({
        requestBody: fileMetadata, // Switched to requestBody
        media: media,
        fields: 'id, webViewLink, name',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fileLink = responseFile.data.webViewLink;
      fileName = responseFile.data.name;
    }

    // Update Firestore Session
    const sessionRef = db.collection('sessoes_onboarding').doc(sessionId);
    await sessionRef.set({
      concluida: true,
      ata_drive_link: fileLink,
      ata_drive_filename: fileName,
      orientador: orientador,
      comentarios: comentarios,
      data_conclusao: new Date(),
    }, { merge: true });

    return res.status(200).json({ 
      success: true, 
      message: 'Onboarding concluído e registrado no Drive!',
      fileLink,
      fileName
    });

  } catch (error) {
    console.error('Erro ao concluir onboarding:', error);
    return res.status(500).json({ 
      error: 'Falha ao processar conclusão de onboarding', 
      details: error.message 
    });
  }
}
