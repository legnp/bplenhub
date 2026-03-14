import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
  const { email } = req.query;
  if (!email) return res.status(400).json({ authorized: false });

  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0]; // Lê a primeira aba da planilha
    const rows = await sheet.getRows();

    const userRow = rows.find(row => 
      row.get('email').toLowerCase() === email.toLowerCase() && 
      row.get('status').toLowerCase() === 'ativo'
    );

    if (userRow) {
      return res.status(200).json({ authorized: true, products: userRow.get('produtos') });
    }
    return res.status(403).json({ authorized: false });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
