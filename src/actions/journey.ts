"use server";

import { getAdminDb } from "@/lib/firebase-admin";
import { Product } from "@/types/products";
import { JourneyStep, SubStepConfig } from "@/types/journey";
import { surveys } from "@/config/surveys";

/**
 * BPlen HUB — Grouped Journey Engine (Server Side) 🧬
 * Busca produtos marcados como jornada e os AGRUPA por 'order'.
 * Isso permite que múltiplos serviços (ex: Carreira Individual e Grupo) 
 * apareçam sob um único ícone de etapa.
 */
export async function getJourneyStagesAction(): Promise<JourneyStep[]> {
  try {
    const db = getAdminDb();
    console.log("🔍 [JourneyAction] Iniciando busca agrupada no Firestore...");
    
    // 1. Fetch all candidate products
    const snapshot = await db.collection("products")
      .where("isStepJourney", "==", true)
      .get();

    if (snapshot.empty) {
      console.warn("⚠️ [JourneyAction] Nenhum produto de jornada encontrado.");
      return [];
    }

    // 2. Map and Filter active products
    const journeyProducts = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Product))
      .filter(p => p.status?.toLowerCase() === "active" && p.order && p.order > 0);

    // 3. GROUP BY ORDER 📦
    const groupedStages: Record<number, { main: Product, products: Product[] }> = {};

    journeyProducts.forEach(p => {
      const order = Number(p.order);
      if (!groupedStages[order]) {
        groupedStages[order] = { main: p, products: [p] };
      } else {
        groupedStages[order].products.push(p);
        // O produto "main" é preferencialmente o que tem a slug mais curta/limpa (ex: 'coaching-e-mentoria' vs 'coaching')
        if (p.slug && p.slug.length < (groupedStages[order].main.slug?.length || 999)) {
          groupedStages[order].main = p;
        }
      }
    });

    // 4. Transform Groups into JourneySteps
    const stages: JourneyStep[] = Object.entries(groupedStages)
      .map(([orderStr, group]) => {
        const order = Number(orderStr);
        const { main, products } = group;
        const allSubsteps: SubStepConfig[] = [];

        // Consolidar substeps de todos os produtos do grupo
        products.forEach(product => {
          const productSubsteps: SubStepConfig[] = [];

          // 1. Gather all potential functional substeps
          // Surveys
          if (product.capabilities?.surveys) {
            product.capabilities.surveys.forEach(srvId => {
              const srv = (surveys as any)[srvId];
              productSubsteps.push({
                id: `ss-srv-${srvId}`,
                title: srv?.title || `Pesquisa: ${srvId}`,
                type: "survey",
                referenceId: srvId,
                description: srv?.description || "Análise e diagnóstico"
              });
            });
          }
          // Forms
          if (product.capabilities?.forms) {
            product.capabilities.forms.forEach(frmId => {
              productSubsteps.push({
                id: `ss-frm-${frmId}`,
                title: `Formulário: ${frmId}`,
                type: "form",
                referenceId: frmId
              });
            });
          }
          // Meetings
          if (product.capabilities?.allowedEventTypes) {
            product.capabilities.allowedEventTypes.forEach(evtId => {
              productSubsteps.push({
                id: `ss-mtg-${evtId}`,
                title: products.length > 1 ? `Agendar: ${product.title}` : `Agendar Sessão`,
                type: "meeting",
                referenceId: evtId,
                description: product.sheet?.description || "Sessão individual"
              });
            });
          }

          // 2. 🧠 Sincronizar nomes com o Workflow de Entrega (Definido no Admin)
          // Se houver um workflow definido, usamos os títulos por índice.
          if (product.workflow && product.workflow.length > 0) {
            productSubsteps.forEach((ss, idx) => {
              const workflowStep = product.workflow[idx];
              if (workflowStep) {
                // Sobrescrevemos o título técnico pelo título definido na jornada estratégica
                ss.title = workflowStep.title;
                // Se o workflow tiver descrição, também atualizamos para ser mais humano
                if (workflowStep.description) {
                  ss.description = workflowStep.description;
                }
              }
            });
          }

          allSubsteps.push(...productSubsteps);
        });

        // 🔮 Mapeamento de Ícones Inteligente (Baseado em Ordem/Slug)
        const getIconName = (order: number, slug?: string) => {
          if (slug === 'onboarding') return "Rocket";
          if (slug?.includes('analise-comportamental')) return "Fingerprint";
          if (order === 2) return "Compass";
          if (order === 4) return "Map";
          if (order === 5) return "TrendingUp";
          if (order === 6) return "MessageSquareHeart";
          if (order === 7) return "Award";
          return "Target";
        };

        return {
          id: main.slug || main.id,
          order: order,
          title: main.title,
          subtitle: main.sheet?.description?.slice(0, 60) + "..." || "",
          icon: getIconName(order, main.slug), 
          description: main.sheet?.description || "",
          substeps: allSubsteps
        };
      })
      .sort((a, b) => a.order - b.order);

    console.log(`✅ [JourneyAction] Arquitetura consolidada para ${stages.length} estágios únicos.`);
    return stages;

  } catch (error) {
    console.error("🚨 [JourneyAction] Erro fatal no agrupamento:", error);
    return [];
  }
}
