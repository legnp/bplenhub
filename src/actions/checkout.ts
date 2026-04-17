"use server";

import admin, { getAdminDb } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/auth-guards";
import { Product } from "@/types/products";
import { PRODUCTS_COLLECTION } from "@/config/collections";
import { revalidatePath } from "next/cache";

/**
 * BPlen HUB — Lógica de Checkout e Provisionamento 💳🧬
 * Processa a "compra" e ativa instantaneamente o serviço para o usuário.
 */

import { validateCouponAction } from "./coupons";

export async function processServicePurchaseAction(
  productSlug: string, 
  idToken: string,
  couponCode?: string
) {
  try {
    // 🛡️ 1. Validar Autenticação
    const session = await requireAuth(idToken);

    // 🛡️ 1.1 Rate Limit: previne spam de checkout
    const { checkRateLimit, RATE_LIMITS } = await import("@/lib/rate-limit");
    const rateCheck = await checkRateLimit({ action: "checkout", uid: session.uid, windowSeconds: RATE_LIMITS.CHECKOUT.windowSeconds });
    if (!rateCheck.allowed) {
      return { success: false, error: `Aguarde ${rateCheck.retryAfterSeconds}s antes de tentar novamente.` };
    }

    const db = getAdminDb();

    // 🕵️ 2. Buscar detalhes do produto
    const productSnap = await db.collection(PRODUCTS_COLLECTION)
      .where("slug", "==", productSlug)
      .limit(1)
      .get();

    if (productSnap.empty) {
      throw new Error("Produto não encontrado para processamento.");
    }

    const product = productSnap.docs[0].data() as Product;
    const productId = product.id || productSnap.docs[0].id;
    
    // 🎟️ 2.1 Validar Cupom (se fornecido)
    let appliedDiscount = 0;
    if (couponCode) {
       const couponResult = await validateCouponAction(couponCode, product.price, productId, idToken);
       if (couponResult.valid) {
          appliedDiscount = couponResult.discountAmount;
       } else {
          console.warn(`⚠️ [Checkout] Cupom inválido tentado: ${couponCode}`);
       }
    }

    const finalPrice = Math.max(0, product.price - appliedDiscount);
    const userRef = db.collection("User_Permissions").doc(session.uid);

    // 🏛️ 3. Transação de Provisionamento (Segurança Atômica)
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      const currentServices = userDoc.exists 
        ? (userDoc.data()?.services || {}) 
        : {};

      // Ativando o serviço (Entitlement via ID ou Slug)
      const updatedServices = {
        ...currentServices,
        [productId]: true,
        [productSlug]: true, // Redundância para garantir compatibilidade de rotas
        member_area_access: true // Toda compra garante acesso à área de membros
      };

      const updateData: any = {
        services: updatedServices,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastPurchase: {
          productTitle: product.title,
          productSlug: product.slug,
          purchasedAt: admin.firestore.FieldValue.serverTimestamp()
        }
      };

      // Se o usuário era apenas visitante, promovemos para membro
      if (!userDoc.exists || userDoc.data()?.role === "visitor") {
        updateData.role = "member";
      }

      if (userDoc.exists) {
        transaction.update(userRef, updateData);
      } else {
        transaction.set(userRef, {
          matricula: session.uid.slice(0, 8).toUpperCase(), // Matricula provisória baseada em UID
          email: session.email,
          name: session.email?.split("@")[0] || "Membro BPlen",
          role: "member",
          onboardStatus: "pending",
          ...updateData
        });
      }
    });

    console.log(`✅ [Checkout] Serviço ${product.title} ativado para ${session.email}`);

    revalidatePath("/hub");
    revalidatePath("/admin/users");
    
    return { success: true, productTitle: product.title };

  } catch (error: any) {
    console.error("❌ [Checkout Action Error]:", error);
    return { success: false, error: error.message || "Erro interno ao processar contratação." };
  }
}
