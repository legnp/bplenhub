"use server";

import { getAdminDb } from "@/lib/firebase-admin";
import { MemberQuotaWallet, MemberQuota } from "@/types/entitlements";
import { getProductBySlug } from "./products"; // Se precisarmos buscar cotas do produto

const QUOTAS_COLLECTION = "Member_Quotas";

/**
 * BPlen HUB — Quota Engine ✨
 * Gestão de saldo e consumo de créditos de serviços.
 */

/**
 * Busca a carteira de cotas de um membro
 */
export async function getMemberQuotasAction(uid: string): Promise<MemberQuotaWallet | null> {
  try {
    const db = getAdminDb();
    const doc = await db.collection(QUOTAS_COLLECTION).doc(uid).get();

    if (!doc.exists) return null;
    return doc.data() as MemberQuotaWallet;
  } catch (error) {
    console.error(`Erro ao buscar cotas do membro ${uid}:`, error);
    return null;
  }
}

/**
 * Adiciona cotas manualmente a um membro (Uso Administrativo ou Pós-Compra)
 */
export async function updateMemberQuotasAction(uid: string, newQuotas: Record<string, number>) {
  try {
    const db = getAdminDb();
    const walletRef = db.collection(QUOTAS_COLLECTION).doc(uid);
    
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(walletRef);
      const now = new Date().toISOString();
      let currentQuotas: Record<string, MemberQuota> = {};

      if (doc.exists) {
        currentQuotas = (doc.data() as MemberQuotaWallet).quotas;
      }

      // Merge de Cotas
      for (const [type, amount] of Object.entries(newQuotas)) {
        const current = currentQuotas[type] || { total: 0, used: 0, lastUpdated: now };
        currentQuotas[type] = {
          total: current.total + amount,
          used: current.used,
          lastUpdated: now
        };
      }

      transaction.set(walletRef, {
        uid,
        quotas: currentQuotas,
        updatedAt: now
      }, { merge: true });
    });

    return { success: true };
  } catch (error) {
    console.error(`Erro ao atualizar cotas do membro ${uid}:`, error);
    throw new Error("Falha ao atualizar carteira de cotas.");
  }
}

/**
 * Consome um crédito de serviço (ex: ao confirmar agendamento)
 */
export async function consumeQuotaAction(uid: string, eventTypeId: string) {
  try {
    const db = getAdminDb();
    const walletRef = db.collection(QUOTAS_COLLECTION).doc(uid);

    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(walletRef);
      if (!doc.exists) throw new Error("Membro não possui carteira de cotas.");

      const wallet = doc.data() as MemberQuotaWallet;
      const quota = wallet.quotas[eventTypeId];

      if (!quota || quota.used >= quota.total) {
        throw new Error(`Saldo insuficiente para o serviço: ${eventTypeId}`);
      }

      const updatedQuotas = {
        ...wallet.quotas,
        [eventTypeId]: {
          ...quota,
          used: quota.used + 1,
          lastUpdated: new Date().toISOString()
        }
      };

      transaction.update(walletRef, { quotas: updatedQuotas });
    });

    return { success: true };
  } catch (error: any) {
    console.error(`Erro ao consumir cota do membro ${uid}:`, error);
    return { success: false, error: error.message };
  }
}
