"use server";

import { getAdminDb } from "@/lib/firebase-admin";
import { UserEntitlement } from "@/types/entitlements";
import { revalidatePath } from "next/cache";

const ENTITLEMENTS_COLLECTION = "entitlements";

/**
 * BPlen HUB — Entitlements Server Actions 🛡️
 * Controla quem tem acesso a quais serviços.
 */

/**
 * Busca acessos de um usuário específico
 */
export async function getUserEntitlements(uid: string): Promise<UserEntitlement[]> {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection(ENTITLEMENTS_COLLECTION)
      .where("uid", "==", uid)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserEntitlement));
  } catch (error) {
    console.error(`Erro ao buscar entitlements para UID ${uid}:`, error);
    return [];
  }
}

/**
 * Verifica se um usuário possui acesso a um produto específico
 */
export async function checkUserAccess(uid: string, productId: string): Promise<UserEntitlement | null> {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection(ENTITLEMENTS_COLLECTION)
      .where("uid", "==", uid)
      .where("productId", "==", productId)
      .where("status", "==", "active")
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as UserEntitlement;
  } catch (error) {
    console.error(`Erro ao verificar acesso do UID ${uid} ao produto ${productId}:`, error);
    return null;
  }
}

/**
 * Concede acesso a um produto (Pós-checkout ou Admin)
 */
export async function grantAccessAction(uid: string, productId: string) {
  try {
    const db = getAdminDb();
    const data: Omit<UserEntitlement, 'id'> = {
      uid,
      productId,
      status: 'active',
      acquiredAt: new Date().toISOString(),
      progress: {
        completedSubSteps: [],
        lastAccessedAt: new Date().toISOString(),
        overallPercentage: 0
      }
    };

    const newDoc = await db.collection(ENTITLEMENTS_COLLECTION).add(data);
    
    revalidatePath("/hub/dashboard");
    revalidatePath("/hub/servicos");
    
    return { success: true, entitlementId: newDoc.id };
  } catch (error) {
    console.error("Erro ao conceder acesso:", error);
    throw new Error("Falha ao conceder acesso");
  }
}
