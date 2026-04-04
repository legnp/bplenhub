import * as admin from "firebase-admin";
import { serverEnv } from "@/env";

/**
 * BPlen HUB — Firebase Admin SDK (Soberania de Dados)
 * Inicialização controlada por Getters para evitar crashes no build e persistência de nulos.
 */

function initializeAdmin() {
  // Se já existir uma instância viva, retorna ela
  if (admin.apps.length > 0) return admin.apps[0]!;

  // Proteção para o ambiente de build do Vercel/NextJS
  // Se as chaves estiverem vazias, não tentamos inicializar (evita o crash global)
  if (!serverEnv.FIREBASE_PROJECT_ID || !serverEnv.FIREBASE_PRIVATE_KEY) {
    if (process.env.NODE_ENV === "production") {
      console.warn("⚠️ [Firebase Admin] Variáveis de ambiente ausentes. Executando em modo de build seguro.");
    }
    return null;
  }

  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serverEnv.FIREBASE_PROJECT_ID,
        clientEmail: serverEnv.FIREBASE_CLIENT_EMAIL,
        privateKey: serverEnv.FIREBASE_PRIVATE_KEY,
      }),
    });

    // ──────────────────────────────
    // Configurações Globais Firestore Admin 🛡️
    // ignoreUndefinedProperties: Essencial para evitar erros ao gravar objetos com campos opcionais undefined.
    // ──────────────────────────────
    app.firestore().settings({ ignoreUndefinedProperties: true });

    console.log(`✅ [Firebase Admin] Instância inicializada: ${serverEnv.FIREBASE_PROJECT_ID}`);
    return app;
  } catch (error: any) {
    console.error("❌ [Firebase Admin] Erro Crítico:", error.message);
    return null;
  }
}

/**
 * Getters Dinâmicos (Sempre use estes em vez de constantes globais)
 */

export const getAdminAuth = () => {
  const app = initializeAdmin();
  if (!app) {
    throw new Error("Falha ao inicializar Firebase Auth Admin (Chaves ausentes?)");
  }
  return app.auth();
};

export const getAdminDb = () => {
  const app = initializeAdmin();
  if (!app) {
    throw new Error("Falha ao inicializar Firebase Firestore Admin (Chaves ausentes?)");
  }
  return app.firestore();
};

// Export padrão do módulo carregado
export default admin;
