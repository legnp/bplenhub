import admin, { getAdminDb } from "@/lib/firebase-admin";
import { USER_PERMISSIONS_COLLECTION } from "@/config/collections";

/**
 * BPlen HUB — Entitlement Engine (Soberania 🛡️)
 * Centraliza a lógica de ativação de serviços para ser usada por:
 * 1. Checkout Manual (Legacy/Admin)
 * 2. Webhooks de Pagamento (Mercado Pago)
 */

interface GrantEntitlementParams {
  uid: string;
  productId: string;
  productSlug: string;
  productTitle: string;
  orderId?: string;
}

export async function grantServiceEntitlement(params: GrantEntitlementParams) {
  const { uid, productId, productSlug, productTitle, orderId } = params;
  const db = getAdminDb();
  
  console.log(`🧬 [Entitlement] Iniciando ativação: ${productTitle} para UID: ${uid}`);

  const userRef = db.collection(USER_PERMISSIONS_COLLECTION).doc(uid);

  return await db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    
    const currentServices = userDoc.exists 
      ? (userDoc.data()?.services || {}) 
      : {};

    // Ativando o serviço (Entitlement via ID ou Slug)
    const updatedServices = {
      ...currentServices,
      [productId]: true,
      [productSlug]: true,
      member_area_access: true // Toda compra garante acesso à área de membros
    };

    const updateData: Record<string, any> = {
      services: updatedServices,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastPurchase: {
        productTitle,
        productSlug,
        orderId: orderId || "legacy",
        purchasedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    };

    // Promoção automática para Membro
    if (!userDoc.exists || userDoc.data()?.role === "visitor") {
      updateData.role = "member";
    }

    if (userDoc.exists) {
      transaction.update(userRef, updateData);
    } else {
      // Se não existir registro de permissão, criamos um básico
      // Nota: As informações de cadastro (User) já devem existir via Welcome Survey
      transaction.set(userRef, {
        uid,
        role: "member",
        onboardStatus: "pending",
        ...updateData
      });
    }

    return { success: true };
  });
}
