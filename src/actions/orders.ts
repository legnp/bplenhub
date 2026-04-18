"use server";

import { getAdminDb } from "@/lib/firebase-admin";
import { USER_ORDERS_COLLECTION } from "@/config/collections";
import { requireAuth } from "@/lib/auth-guards";

export interface Order {
  id: string;
  orderId: string;
  userId: string;
  userEmail: string;
  productId: string;
  productSlug: string;
  productTitle: string;
  basePrice: number;
  appliedDiscount: number;
  finalPrice: number;
  currency: string;
  status: string;
  statusDetail?: string;
  gateway: string;
  mpPreferenceId?: string;
  mpPaymentId?: string;
  createdAt: string; 
  updatedAt: string;
}

/**
 * BPlen HUB — Orders Action
 * Busca a trilha e o histórico financeiro do usuário logado.
 */
export async function getUserOrdersAction(idToken?: string): Promise<{ success: boolean; data?: Order[]; error?: string }> {
  try {
    const session = await requireAuth(idToken);
    const db = getAdminDb();

    // Governança: Busca Severa por UID
    const ordersSnap = await db.collection(USER_ORDERS_COLLECTION)
      .where("userId", "==", session.uid)
      .orderBy("createdAt", "desc")
      .get();

    const orders: Order[] = [];

    ordersSnap.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        orderId: data.orderId || "",
        userId: data.userId || "",
        userEmail: data.userEmail || "",
        productId: data.productId || "",
        productSlug: data.productSlug || "",
        productTitle: data.productTitle || "",
        basePrice: data.basePrice || 0,
        appliedDiscount: data.appliedDiscount || 0,
        finalPrice: data.finalPrice || 0,
        currency: data.currency || "BRL",
        status: data.status || "pending",
        statusDetail: data.statusDetail || "",
        gateway: data.gateway || "mercadopago",
        mpPreferenceId: data.mpPreferenceId || "",
        mpPaymentId: data.mpPaymentId || "",
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
      });
    });

    return { success: true, data: orders };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno ao buscar faturamentos.";
    console.error("❌ [Orders Action Error]:", error);
    return { success: false, error: message };
  }
}
