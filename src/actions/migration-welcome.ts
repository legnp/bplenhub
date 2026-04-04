"use server";

import { collection, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SurveyResponse, SurveyStatus } from "@/types/survey";

/**
 * MIGRATION SCRIPT — WelcomeSurvey Legacy to Institutional 🧬
 * Move dados de User/{mat}.User_Welcome para User/{mat}/Surveys/welcome_survey.
 */
export async function runWelcomeMigration() {
  const results = {
    total: 0,
    migrated: 0,
    skipped: 0,
    errors: 0
  };

  try {
    const usersSnap = await getDocs(collection(db, "User"));
    results.total = usersSnap.size;

    for (const userDoc of usersSnap.docs) {
      const userData = userDoc.data();
      const matricula = userDoc.id;
      const legacyWelcome = userData.User_Welcome;

      if (!legacyWelcome) {
        results.skipped++;
        continue;
      }

      // Evitar sobreposição se já existir na nova estrutura
      const surveyRef = doc(db, "User", matricula, "Surveys", "welcome_survey");
      
      // Mapeamento de Campos (Legacy -> Institutional)
      const institutionalData = {
        nickname: legacyWelcome.User_Nickname || legacyWelcome.nickname || "",
        userType: legacyWelcome.User_Type || legacyWelcome.userType || "",
        topics: legacyWelcome.Customer_FirstTopics || legacyWelcome.topics || [],
        demand: legacyWelcome.Customer_FirstDemand || legacyWelcome.demand || "",
        origin: legacyWelcome.Customer_Origin || legacyWelcome.origin || ""
      };

      const payload: SurveyResponse = {
        surveyId: "welcome_survey",
        matricula,
        status: "completed" as SurveyStatus,
        data: institutionalData as any,
        submittedAt: legacyWelcome.submittedAt || serverTimestamp(),
        metadata: {
          surveyId: "welcome_survey",
          domain: "ONBOARDING",
          context: "migration_v1_to_v2",
          version: "2.0"
        }
      };

      try {
        // A. Gravar na Subcoleção (Survey_Global)
        await setDoc(surveyRef, payload, { merge: true });

        // B. Atualizar Raiz do Usuário (Identificação Core 🛡️)
        const userRef = doc(db, "User", matricula);
        await setDoc(userRef, {
          hasCompletedWelcome: true,
          User_Nickname: institutionalData.nickname,
          User_Type: institutionalData.userType.includes("empresa") || institutionalData.userType.includes("PJ") ? "PJ" : "PF",
          lastUpdated: serverTimestamp()
        }, { merge: true });

        results.migrated++;
        console.log(`✅ [Migration] Usuário migrado e perfil atualizado: ${matricula}`);
      } catch (e) {
        console.error(`❌ [Migration] Erro ao migrar ${matricula}:`, e);
        results.errors++;
      }
    }

    return { success: true, results };
  } catch (error) {
    console.error("Erro crítico na migração:", error);
    throw error;
  }
}
