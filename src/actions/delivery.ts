"use server";

import admin, { getAdminDb } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/auth-guards";
import { Product } from "@/types/products";
import { PRODUCTS_COLLECTION } from "@/config/collections";

/**
 * BPlen HUB — Delivery Engine (Server Actions) 🏁📡
 * Lógica para gerenciar o progresso e entrega de serviços aos membros.
 */

interface DeliveryStatus {
  productId: string;
  completedMilestones: string[];
  lastAccessed: string;
}

/**
 * Busca os dados necessários para renderizar o Portal de Entrega.
 * Valida permissão, busca o produto e calcula o progresso automático.
 */
export async function getServiceDeliveryDataAction(slug: string, idToken: string) {
  try {
    const session = await requireAuth(idToken);
    const db = getAdminDb();

    // 🕵️ 1. Buscar o Produto
    const productSnap = await db.collection(PRODUCTS_COLLECTION)
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (productSnap.empty) {
      throw new Error("Serviço não encontrado.");
    }

    const product = { id: productSnap.docs[0].id, ...productSnap.docs[0].data() } as Product;

    // 🛡️ 2. Validar se o usuário possui este serviço contratado
    const userPermRef = db.collection("User_Permissions").doc(session.uid);
    const userPermSnap = await userPermRef.get();
    const userPerms = userPermSnap.data() || {};
    const isAdmin = userPerms.role === "admin";
    const serviceEntitlement = userPerms.services?.[product.serviceCode];

    if (!isAdmin && !serviceEntitlement) {
       throw new Error("Você não possui acesso a este serviço. Que tal contratá-lo agora?");
    }

    // 🤖 3. Calcular Progresso Automático (Milestones)
    // Buscamos se o usuário já completou as pesquisas ou formulários vinculados.
    const completedMilestones: string[] = [];

    // Verificação de Pesquisas (Surveys)
    if (product.capabilities.surveys.length > 0) {
       const resultsSnap = await db.collection("Survey_Results")
         .where("userId", "==", session.uid)
         .get();
       
       const finishedSurveyIds = resultsSnap.docs.map(d => d.data().surveyId);
       
       product.capabilities.surveys.forEach(surveyId => {
          if (finishedSurveyIds.includes(surveyId)) {
             completedMilestones.push(surveyId);
          }
       });
    }

    // 📊 4. Consumo de Cotas (Simulação elegante por enquanto)
    const quotas = {
       total: Object.values(product.grantedQuotas).reduce((acc, val) => acc + val, 0),
       used: 0 // TODO: Integrar com contagem de agendamentos reais
    };

    return {
      success: true,
      data: {
        product,
        completedMilestones,
        quotas,
        userName: session.email || "Membro BPlen"
      }
    };

  } catch (err: any) {
    console.error("[Delivery Action Error]:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Lista todos os serviços que o usuário possui ativos.
 */
export async function getMyActiveServicesAction(idToken: string) {
  try {
    const session = await requireAuth(idToken);
    const db = getAdminDb();

    const userPermRef = db.collection("User_Permissions").doc(session.uid);
    const userPermSnap = await userPermRef.get();
    
    if (!userPermSnap.exists) return { success: true, data: [] };
    
    const perms = userPermSnap.data() || {};
    const serviceCodes = Object.keys(perms.services || {}).filter(code => perms.services[code] === true);

    if (serviceCodes.length === 0) return { success: true, data: [] };

    const productsSnap = await db.collection(PRODUCTS_COLLECTION)
      .where("serviceCode", "in", serviceCodes)
      .get();

    const products = productsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];

    return { success: true, data: products };

  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
