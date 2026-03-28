import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import formidable from 'formidable';
import fs from 'fs';

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

    const folderName = fields.folderName ? fields.folderName[0] : null;
    const jornada = fields.jornada ? fields.jornada[0] : null;
    const serviceId = fields.serviceId ? fields.serviceId[0] : 'IMG';

    if (!folderName || !jornada) {
      return res.status(400).json({ error: 'Nome da pasta ou jornada ausente.' });
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

    if (!token) throw new Error('Falha ao obter token do Google Drive.');

    const drive = google.drive({ version: 'v3', auth });

    // Determinar pasta pai (Parent Folder)
    const parentFolderId = jornada === 'Carreira Profissional' 
      ? '1C7ExWR3SS3KGjmrAN8Jxr_HZWkp0fJI1' 
      : '1jPTCFEuLFjA5_J4UgycMyHDMUVnzVabm';

    // Verificar se a pasta já existe
    const q = `mimeType='application/vnd.google-apps.folder' and name='${folderName.replace(/'/g, "\\'")}' and '${parentFolderId}' in parents and trashed=false`;
    const searchRes = await drive.files.list({ 
      q, spaces: 'drive', fields: 'files(id, name)',
      supportsAllDrives: true, includeItemsFromAllDrives: true,
      headers: { Authorization: `Bearer ${token}` }
    });
    
    let folderId;

    if (searchRes.data.files && searchRes.data.files.length > 0) {
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

    const results = {};

    // Upload QR Code se existir
    if (files.qrCode && files.qrCode.length > 0) {
      const file = files.qrCode[0];
      const ext = file.originalFilename.split('.').pop();
      const metadata = { name: `${serviceId}_QRCode.${ext}`, parents: [folderId] };
      const media = { mimeType: file.mimetype, body: fs.createReadStream(file.filepath) };

      const rs = await drive.files.create({
        requestBody: metadata,
        media: media,
        fields: 'id, webViewLink, webContentLink',
        supportsAllDrives: true,
        headers: { Authorization: `Bearer ${token}` }
      });
      // Permissão opcional para visualização pública
      await drive.permissions.create({
        fileId: rs.data.id,
        requestBody: { role: 'reader', type: 'anyone' },
        supportsAllDrives: true,
        headers: { Authorization: `Bearer ${token}` }
      });

      results.qrCodeUrl = rs.data.webViewLink; // ou url direta
    }

    // Upload Capa se existir
    if (files.capa && files.capa.length > 0) {
      const file = files.capa[0];
      const ext = file.originalFilename.split('.').pop();
      const metadata = { name: `${serviceId}_Capa.${ext}`, parents: [folderId] };
      const media = { mimeType: file.mimetype, body: fs.createReadStream(file.filepath) };

      const rs = await drive.files.create({
        requestBody: metadata,
        media: media,
        fields: 'id, webViewLink, webContentLink',
        supportsAllDrives: true,
        headers: { Authorization: `Bearer ${token}` }
      });
      await drive.permissions.create({
        fileId: rs.data.id,
        requestBody: { role: 'reader', type: 'anyone' },
        supportsAllDrives: true,
        headers: { Authorization: `Bearer ${token}` }
      });

      results.capaUrl = rs.data.webViewLink;
    }

    return res.status(200).json({ success: true, ...results });

  } catch (error) {
    console.error('Erro ao fazer upload de assets:', error);
    return res.status(500).json({ error: 'Falha no upload', details: error.message });
  }
}
