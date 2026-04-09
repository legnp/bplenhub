"use server";

import { getAdminDb } from "@/lib/firebase-admin";
import { Product } from "@/types/products";
import { revalidatePath } from "next/cache";

const PRODUCTS_COLLECTION = "products";

/**
 * BPlen HUB — Product Engine Server Actions 🧬
 * Gerenciamento centralizado de produtos e serviços no Firestore.
 */

/**
 * Busca todos os produtos ativos
 */
export async function getActiveProducts(): Promise<Product[]> {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection(PRODUCTS_COLLECTION)
      .where("status", "==", "active")
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error("Erro ao buscar produtos ativos:", error);
    return [];
  }
}

/**
 * Busca um produto pelo Slug (para páginas dinâmicas)
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection(PRODUCTS_COLLECTION)
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Product;
  } catch (error) {
    console.error(`Erro ao buscar produto com slug ${slug}:`, error);
    return null;
  }
}

/**
 * Salva ou atualiza um produto (Admin)
 */
export async function saveProductAction(product: Partial<Product>) {
  try {
    const db = getAdminDb();
    const id = product.id;
    const data = {
      ...product,
      updatedAt: new Date().toISOString(),
    };

    if (id) {
      await db.collection(PRODUCTS_COLLECTION).doc(id).update(data);
    } else {
      const newDoc = await db.collection(PRODUCTS_COLLECTION).add({
        ...data,
        createdAt: new Date().toISOString(),
        status: 'draft'
      });
      // Importante: Não retornar aqui para permitir o revalidatePath abaixo
    }

    revalidatePath("/admin/products");
    revalidatePath("/servicos");
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar produto:", error);
    throw new Error("Falha ao salvar produto");
  }
}

/**
 * Busca produtos da Jornada (Step Journey)
 */
export async function getJourneyProducts(): Promise<Product[]> {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection(PRODUCTS_COLLECTION)
      .where("isStepJourney", "==", true)
      .where("status", "==", "active")
      .orderBy("order", "asc")
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error("Erro ao buscar produtos da jornada:", error);
    return [];
  }
}
