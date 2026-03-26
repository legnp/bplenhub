import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { uid } = req.query;

  if (!uid) {
    return res.status(400).json({ message: 'UID is required' });
  }

  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID_ADMIN || '1hkrZTmr7n3Kt-qY1kvnWKychHpEpoR8Nuwnw4hhyrrM', serviceAccountAuth);
    
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0]; // Assuming the data is in the first sheet
    const rows = await sheet.getRows();

    // The user mentioned columns: "UID", "matricula_bplen", "email", "nome_completo", "status"
    const adminUser = rows.find(row => 
      row.get('UID') === uid && row.get('status')?.toLowerCase() === 'ativo'
    );

    if (adminUser) {
      return res.status(200).json({ 
        isAdmin: true, 
        userData: {
          email: adminUser.get('email'),
          nome_completo: adminUser.get('nome_completo')
        } 
      });
    } else {
      return res.status(200).json({ isAdmin: false });
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
