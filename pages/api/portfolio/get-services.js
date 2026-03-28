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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const snapshot = await db.collection('servicos_portfolio').get();
    const services = [];
    
    snapshot.forEach(doc => {
      services.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json({ success: true, data: services });

  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    return res.status(500).json({ error: 'Falha interna', details: error.message });
  }
}
