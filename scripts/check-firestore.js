const admin = require("firebase-admin");
const serviceAccount = require("./service-account.json"); // This might not exist, but usually is in these projects

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function check() {
  const snap = await db.collection("Calendar_Events").limit(5).get();
  console.log(`Found ${snap.size} events in Calendar_Events`);
  snap.forEach(doc => console.log(`- ${doc.id}: ${doc.data().summary}`));
}

check().catch(console.error);
