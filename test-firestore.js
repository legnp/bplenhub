const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: '.env.local' });

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

const db = getFirestore();

async function check() {
  const snapshot = await db.collection('sessoes_onboarding')
    .where('concluida', '==', true)
    .get();
  
  if (snapshot.empty) {
    console.log('Nenhum documento concluida=true encontrado na collection sessoes_onboarding.');
  }

  snapshot.forEach(doc => {
    console.log(`\nDOC FOUND CONCLUIDO ID: ${doc.id}`);
    console.log(doc.data());
  });
}

check().catch(console.error);
