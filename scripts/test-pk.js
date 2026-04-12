const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8');
let pk = "";
envConfig.split(/\r?\n/).forEach(line => {
    if (line.startsWith('FIREBASE_PRIVATE_KEY=')) {
        pk = line.split('=')[1].trim().replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    }
});

console.log("PK Start:", JSON.stringify(pk.substring(0, 40)));
console.log("PK End:", JSON.stringify(pk.substring(pk.length - 40)));

try {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: "bplenhub",
            clientEmail: "firebase-adminsdk-fbsvc@bplenhub.iam.gserviceaccount.com",
            privateKey: pk
        })
    });
    console.log("✅ Success!");
} catch (e) {
    console.log("❌ Failed:", e.message);
}
