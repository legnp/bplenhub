"use server";

import admin, { getAdminDb } from "@/lib/firebase-admin";
import { requireAdmin, requireAuth } from "@/lib/auth-guards";
import { Coupon, CouponValidationResult } from "@/types/marketing";
import { revalidatePath } from "next/cache";
import { COUPONS_COLLECTION } from "@/config/collections";

import { safeSerialize } from "@/lib/utils/firestore";

/**
 * BPlen HUB — Coupon Engine (Server Actions) 💸🎟️
 */

/**
 * Salva ou Atualiza um Cupom (Admin Only) 🛡️
 */
export async function saveCouponAction(coupon: Partial<Coupon>, idToken?: string) {
  try {
    await requireAdmin(idToken);
    const db = getAdminDb();
// ...
// (mantendo a lógica interna)

    const data: Record<string, unknown> = {
      ...coupon,
      code: coupon.code?.toUpperCase().trim(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (!coupon.id) {
       data.createdAt = admin.firestore.FieldValue.serverTimestamp();
       data.usageCount = 0;
       const docRef = await db.collection(COUPONS_COLLECTION).add(data);
       return { success: true, id: docRef.id };
    } else {
       await db.collection(COUPONS_COLLECTION).doc(coupon.id).update(data);
       return { success: true };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("[SaveCoupon Error]:", err);
    return { success: false, error: message };
  }
}

/**
 * Lista todos os cupons (Admin Only) 🛡️
 */
export async function getAdminCouponsList(idToken?: string) {
  try {
    await requireAdmin(idToken);
    const db = getAdminDb();
    const snap = await db.collection(COUPONS_COLLECTION).orderBy("createdAt", "desc").get();
    
    return {
      success: true,
      data: snap.docs.map(doc => {
        return safeSerialize<Coupon>({
          ...doc.data(),
          id: doc.id
        });
      })
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

/**
 * Valida um cupom para uso no Checkout 🛒
 */
export async function validateCouponAction(
  code: string, 
  basePrice: number, 
  productId: string,
  idToken: string
): Promise<CouponValidationResult> {
  try {
    await requireAuth(idToken);
    const db = getAdminDb();
    
    const snap = await db.collection(COUPONS_COLLECTION)
      .where("code", "==", code.toUpperCase().trim())
      .where("active", "==", true)
      .get();

    if (snap.empty) {
      return { valid: false, discountAmount: 0, finalPrice: basePrice, message: "Cupom inválido ou não encontrado." };
    }

    const coupon = snap.docs[0].data() as Coupon;

    // 1. Verificar Expiração
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return { valid: false, discountAmount: 0, finalPrice: basePrice, message: "Este cupom já expirou." };
    }

    // 2. Verificar Limite de Uso
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, discountAmount: 0, finalPrice: basePrice, message: "Este cupom atingiu o limite máximo de resgates." };
    }

    // 3. Verificar Restrição de Produto
    if (coupon.restrictedToProducts && coupon.restrictedToProducts.length > 0) {
       if (!coupon.restrictedToProducts.includes(productId)) {
          return { valid: false, discountAmount: 0, finalPrice: basePrice, message: "Este cupom não é válido para este serviço." };
       }
    }

    // 4. Calcular Desconto
    let discount = 0;
    if (coupon.type === "percentage") {
      discount = (basePrice * coupon.value) / 100;
    } else {
      discount = coupon.value;
    }

    const finalPrice = Math.max(0, basePrice - discount);

    return { 
      valid: true, 
      discountAmount: discount, 
      finalPrice, 
      coupon: { code: coupon.code, type: coupon.type, value: coupon.value } 
    };

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return { valid: false, discountAmount: 0, finalPrice: basePrice, message };
  }
}
