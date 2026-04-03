import * as admin from "firebase-admin";
import { serverEnv } from "@/env";

/**
 * BPlen HUB — Firebase Admin SDK (Segurança Real 🛡️)
 * Inicializa o Admin SDK para operações privilegiadas e validação de tokens no servidor.
 */

const adminConfig = {
  projectId: serverEnv.FIREBASE_PROJECT_ID,
  clientEmail: serverEnv.FIREBASE_CLIENT_EMAIL,
  privateKey: serverEnv.FIREBASE_PRIVATE_KEY,
};

// Singleton para garantir que o Admin SDK seja inicializado apenas uma vez
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(adminConfig),
    });
    console.log("✅ [Firebase Admin] Inicializado com sucesso.");
  } catch (error) {
    console.error("❌ [Firebase Admin] Erro na inicialização:", error);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export default admin;
