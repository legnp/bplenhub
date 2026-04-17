"use server";

/**
 * BPlen HUB — Rate Limiter (Proteção contra Abuso 🛡️)
 * Implementa throttle por UID usando Firestore como store distribuído.
 * Previne spam de bookings, submissões de survey e operações de checkout.
 */

import { getAdminDb } from "@/lib/firebase-admin";

const RATE_LIMIT_COLLECTION = "_RateLimits";

interface RateLimitConfig {
  /** Identificador da ação (ex: "booking", "survey_submit", "checkout") */
  action: string;
  /** UID do usuário */
  uid: string;
  /** Intervalo mínimo entre chamadas em segundos */
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

/**
 * Verifica se o usuário pode executar a ação.
 * Atualiza o timestamp se permitido.
 * 
 * @returns `{ allowed: true }` se pode prosseguir, ou `{ allowed: false, retryAfterSeconds }` se bloqueado.
 */
export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const { action, uid, windowSeconds } = config;
  const db = getAdminDb();

  const docId = `${uid}_${action}`;
  const ref = db.collection(RATE_LIMIT_COLLECTION).doc(docId);

  const now = Date.now();

  try {
    const snap = await ref.get();

    if (snap.exists) {
      const lastCall = snap.data()?.timestamp as number;
      const elapsed = (now - lastCall) / 1000;

      if (elapsed < windowSeconds) {
        const retryAfter = Math.ceil(windowSeconds - elapsed);
        console.log(`⏳ [RateLimit] Bloqueado: ${uid} / ${action} — aguardar ${retryAfter}s`);
        return { allowed: false, retryAfterSeconds: retryAfter };
      }
    }

    // Permitido: atualiza timestamp
    await ref.set({ timestamp: now, action, uid }, { merge: true });
    return { allowed: true };

  } catch (err) {
    // Em caso de erro no rate limiter, permitir a ação (fail-open)
    // para não travar o sistema por causa de um mecanismo de proteção
    console.error("⚠️ [RateLimit] Erro no rate limiter (fail-open):", err);
    return { allowed: true };
  }
}

/**
 * Configurações padrão de rate limit por tipo de ação.
 * Centraliza as políticas para fácil ajuste.
 */
export const RATE_LIMITS = {
  /** Agendamento de evento: máximo 1 a cada 5 segundos */
  BOOKING: { windowSeconds: 5 },
  /** Submissão de survey: máximo 1 a cada 10 segundos */
  SURVEY_SUBMIT: { windowSeconds: 10 },
  /** Checkout: máximo 1 a cada 8 segundos */
  CHECKOUT: { windowSeconds: 8 },
  /** Sync de calendário (admin): máximo 1 a cada 30 segundos */
  CALENDAR_SYNC: { windowSeconds: 30 },
} as const;
