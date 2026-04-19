"use server";

import { getAdminDb } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/auth-guards";
import { resolveMatricula } from "./get-user-results";
import { PartnerData } from "./admin/partners";

/**
 * BPlen HUB — Networking Engine 🌐🧬
 * Busca e consolida dados de membros, profissionais e parceiros para interação.
 */

export interface NetworkingMember {
  id: string; // Matricula
  name: string;
  photoUrl: string;
  pitch: string;
  hashtags: string[];
  journeyStageId: string;
  isProfessional: boolean;
  contacts: any;
  cvVisible: boolean;
  portfolioVisible: boolean;
  cvUrl?: string;
  portfolioUrl?: string;
}

export type NetworkingTab = "membros" | "profissionais" | "parceiros";

/**
 * Busca dados para a página de Networking baseada na aba e filtros
 */
export async function getNetworkingDataAction(
  tab: NetworkingTab,
  query?: string,
  stageFilter?: string,
  serviceFilter?: string
) {
  try {
    const db = getAdminDb();
    
    // 1. ABA: PARCEIROS 🤝
    if (tab === "parceiros") {
      let partnerQuery = db.collection("Partners").where("isActive", "==", true);
      
      if (serviceFilter && serviceFilter !== "Todos") {
        partnerQuery = partnerQuery.where("serviceType", "==", serviceFilter);
      }

      const snapshot = await partnerQuery.get();
      let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PartnerData));

      // Filtro de consulta (Client-side like matching simplificado no server)
      if (query) {
        const q = query.toLowerCase();
        results = results.filter(p => 
          p.name.toLowerCase().includes(q) || 
          p.description.toLowerCase().includes(q) ||
          p.serviceType.toLowerCase().includes(q) ||
          p.keywords?.some(k => k.toLowerCase().includes(q))
        );
      }

      return { success: true, type: "partners", data: results };
    }

    // 2. ABAS: MEMBROS OU PROFISSIONAIS 🧬
    // Buscamos usuários que habilitaram a visibilidade no networking
    let userQuery = db.collection("User")
      .where("profile.networking.networking_visibility", "==", true);

    if (tab === "profissionais") {
      userQuery = userQuery.where("profile.networking.isBPlenProfessional", "==", true);
    }

    const snapshot = await userQuery.get();
    let users = snapshot.docs.map(doc => {
      const d = doc.data();
      // Resolver Estágio da Jornada via subcoleção progress (simplificado para exibição)
      // Em uma versão real, o estágio seria denormalizado no Doc principal para performance
      return {
        id: doc.id,
        name: d.profile?.fullName || d.nickname || "Membro BPlen",
        photoUrl: d.photoUrl || "",
        pitch: d.profile?.networking?.sales_pitch || "",
        hashtags: d.profile?.networking?.hashtags || [],
        journeyStageId: d.User_JourneyMap?.current_stage || "onboarding",
        isProfessional: d.profile?.networking?.isBPlenProfessional || false,
        contacts: d.profile?.networking?.contacts || {},
        cvVisible: d.profile?.networking?.cv_networking_visibility || false,
        portfolioVisible: d.profile?.networking?.portfolio_networking_visibility || false,
        cvUrl: d.profile?.address?.cv_url || "",
        portfolioUrl: d.profile?.address?.portfolio_url || ""
      } as NetworkingMember;
    });

    // Filtros de Busca e Estágio
    if (stageFilter && stageFilter !== "Todos") {
      users = users.filter(u => u.journeyStageId === stageFilter);
    }

    if (query) {
      const q = query.toLowerCase();
      users = users.filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.pitch.toLowerCase().includes(q) ||
        u.hashtags?.some(h => h.toLowerCase().includes(q))
      );
    }

    return { success: true, type: "members", data: users };

  } catch (error: any) {
    console.error("❌ [NetworkingAction] Erro:", error);
    return { success: false, error: error.message };
  }
}
