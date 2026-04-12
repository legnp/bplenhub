"use server";

import { getAdminDb } from "@/lib/firebase-admin";
import { Product } from "@/types/products";
import { JourneyStep, SubStepConfig } from "@/types/journey";
import { surveys } from "@/config/surveys";

/**
 * BPlen HUB — Journey Engine (Server Side) 🧬
 * Busca dinamicamente os produtos marcados como etapas da jornada no Firestore.
 */
export async function getJourneyStagesAction(): Promise<JourneyStep[]> {
  try {
    const db = getAdminDb();
    console.log("🔍 [JourneyAction] Buscando etapas dinâmicas no Firestore...");
    const productsRef = db.collection("products");
    
    // Simplificamos a query para evitar erros de índice composto no Firestore
    const snapshot = await productsRef
      .where("isStepJourney", "==", true)
      .get();

    console.log(`📊 [JourneyAction] Documentos encontrados: ${snapshot.size}`);

    const journeyProducts = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product))
      // Filtramos e ordenamos em memória para máxima compatibilidade
      .filter(p => p.status?.toLowerCase() === "active")
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    console.log(`✅ [JourneyAction] Etapas ativas e ordenadas: ${journeyProducts.length}`);

    // Map Products to JourneySteps
    const stages: JourneyStep[] = journeyProducts.map((product) => {
      const substeps: SubStepConfig[] = [];

      // 1. Map Surveys to Substeps
      product.capabilities.surveys.forEach((surveyId) => {
        const surveyConfig = (surveys as any)[surveyId];
        substeps.push({
          id: `ss-srv-${surveyId}`,
          title: surveyConfig?.title || `Pesquisa: ${surveyId}`,
          type: "survey",
          referenceId: surveyId,
          description: surveyConfig?.description || "Análise e diagnóstico"
        });
      });

      // 2. Map Forms to Substeps
      product.capabilities.forms.forEach((formId) => {
        substeps.push({
          id: `ss-frm-${formId}`,
          title: `Formulário: ${formId}`, // Could be expanded by fetching form titles
          type: "form",
          referenceId: formId
        });
      });

      // 3. Map Event Types (Meetings) to Substeps
      product.capabilities.allowedEventTypes.forEach((eventTypeId) => {
        substeps.push({
          id: `ss-mtg-${eventTypeId}`,
          title: `Agendar Sessão`,
          type: "meeting",
          referenceId: eventTypeId,
          description: "Sessão individual com mentor"
        });
      });

      return {
        id: product.slug || product.id,
        order: product.order || 0,
        title: product.title,
        subtitle: product.sheet.description.slice(0, 60) + "...",
        icon: "Target", // Default icon, could be dynamic from product metadata
        description: product.sheet.description,
        substeps: substeps
      };
    });

    return stages;
  } catch (error) {
    console.error("Error fetching dynamic journey stages:", error);
    return [];
  }
}
