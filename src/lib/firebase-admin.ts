import * as admin from "firebase-admin";
import { serverEnv } from "@/env";

/**
 * BPlen HUB — Firebase Admin SDK (Segurança Real 🛡️)
 * Inicializa o Admin SDK para operações privilegiadas e validação de tokens no servidor.
 * Agora com suporte a Safe Initialization para evitar crashes durante o build.
 */

function getAdminApp() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const adminConfig = {
    projectId: serverEnv.FIREBASE_PROJECT_ID,
    clientEmail: serverEnv.FIREBASE_CLIENT_EMAIL,
    privateKey: serverEnv.FIREBASE_PRIVATE_KEY,
  };

  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert(adminConfig),
    });
    console.log("✅ [Firebase Admin] Inicializado com sucesso.");
    return app;
  } catch (error) {
    console.error("❌ [Firebase Admin] Erro inesperado na inicialização:", error);
    // Em ambiente de build, não queremos crashear o processo imediatamente
    if (process.env.NODE_ENV === "production" && !serverEnv.FIREBASE_PRIVATE_KEY) {
       console.warn("⚠️ [Firebase Admin] Build detectado ou variáveis ausentes. As operações administrativas podem falhar em runtime.");
    }
    throw error;
  }
}

/**
 * Getters seguros para os serviços administrativo.
 * Garantem que a inicialização só ocorra quando o serviço for de fato solicitado.
 */

export const getAdminAuth = () => {
    try {
        return getAdminApp().auth();
    } catch (e) {
        console.error("❌ [Firebase Admin] Falha ao obter Auth. O app foi inicializado corretamente?");
        throw e;
    }
};

export const getAdminDb = () => {
    try {
        return getAdminApp().firestore();
    } catch (e) {
        console.error("❌ [Firebase Admin] Falha ao obter Firestore. O app foi inicializado corretamente?");
        throw e;
    }
};

// Mantemos os exports originais como proxies para compatibilidade imediata se possível,
// mas o ideal é migrar gradualmente para os getters.
export const adminAuth = admin.apps.length > 0 ? admin.apps[0]!.auth() : null as unknown as admin.auth.Auth;
export const adminDb = admin.apps.length > 0 ? admin.apps[0]!.firestore() : null as unknown as admin.firestore.Firestore;

export default admin;

