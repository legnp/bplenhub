"use client";

import { useState, useEffect } from "react";
import { JourneyProgress, StepStatus, UserStepProgress, JourneyStep } from "@/types/journey";
import { getJourneyStagesAction } from "@/actions/journey";
import { getMemberQuotasAction } from "@/actions/quotas";
import { MemberQuotaWallet } from "@/types/entitlements";

/**
 * BPlen HUB — useJourney 🧬🛡️
 * Logic hook for member journey progress and access control.
 * Now fully dynamic: fetches stages from Products and progress from User metadata.
 */
export function useJourney(uid: string) {
  const [stages, setStages] = useState<JourneyStep[]>([]);
  const [progress, setProgress] = useState<JourneyProgress | null>(null);
  const [quotas, setQuotas] = useState<MemberQuotaWallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        console.log("🧬 [useJourney] Sincronizando telemetria dinâmica...");
        
        // 1. Fetch Stages from Firestore (via Action)
        const dynamicStages = await getJourneyStagesAction();
        setStages(dynamicStages);

        // 2. Fetch Real Quotas for granular access
        const userQuotas = await getMemberQuotasAction(uid);
        setQuotas(userQuotas);

        // 3. Initialize or Fetch Progress from Firestore
        const initialSteps: Record<string, UserStepProgress> = {};
        dynamicStages.forEach((stage, idx) => {
          initialSteps[stage.id] = {
            stepId: stage.id,
            status: idx === 0 ? "current" : "locked",
            completedSubSteps: [],
            currentSubStepId: stage.substeps[0]?.id
          };
        });

        // TODO: In the next phase, load real progress from /users/{uid}/journey
        const initialProgress: JourneyProgress = {
          matricula: "MEMBER-ID", 
          lastActiveStepId: dynamicStages[0]?.id || "onboarding",
          steps: initialSteps,
          overallProgress: 0
        };

        setProgress(initialProgress);
      } catch (error) {
        console.error("❌ [useJourney] Falha crítica na sincronização:", error);
      } finally {
        setLoading(false);
      }
    };

    if (uid && uid !== "guest") init();
  }, [uid]);

  const updateSubStep = (stepId: string, subStepId: string, completed: boolean) => {
    if (!progress) return;

    setProgress(prev => {
      if (!prev) return null;
      const step = prev.steps[stepId];
      if (!step) return prev;

      const newCompleted = completed 
        ? [...new Set([...step.completedSubSteps, subStepId])]
        : step.completedSubSteps.filter(id => id !== subStepId);

      const stage = stages.find(s => s.id === stepId);
      const allSubStepsCount = stage?.substeps.length || 0;
      const status: StepStatus = (newCompleted.length >= allSubStepsCount && allSubStepsCount > 0) 
        ? "completed" 
        : "current";

      return {
        ...prev,
        steps: {
          ...prev.steps,
          [stepId]: {
            ...step,
            completedSubSteps: newCompleted,
            status
          }
        }
      };
    });
  };

  /**
   * Retorna os dados analíticos de uma etapa (Telemetria Real)
   */
  const getStageTelemetry = (stepId: string) => {
    const stage = stages.find(s => s.id === stepId);
    const stepProgress = progress?.steps[stepId];
    
    // Cálculo de % Real
    const totalSubsteps = stage?.substeps.length || 0;
    const completedCount = stepProgress?.completedSubSteps.length || 0;
    const percentage = totalSubsteps > 0 ? Math.round((completedCount / totalSubsteps) * 100) : 0;

    // Checagem de Acesso Granular
    const hasQuota = quotas?.quotas[stepId] ? (quotas.quotas[stepId].total > 0) : false;
    
    // Identificar se é o "Próximo Passo" lógico
    const currentStepIndex = stages.findIndex(s => s.id === progress?.lastActiveStepId);
    const thisStepIndex = stages.findIndex(s => s.id === stepId);
    const isNext = thisStepIndex === currentStepIndex + 1;

    return {
      status: stepProgress?.status || "locked",
      percentage,
      hasAccess: hasQuota,
      isNext,
      substepsLabel: `${completedCount}/${totalSubsteps}`
    };
  };

  const getStepStatus = (stepId: string): StepStatus => {
    return progress?.steps[stepId]?.status || "locked";
  };

  return {
    stages,
    progress,
    loading,
    quotas,
    updateSubStep,
    getStepStatus,
    getStageTelemetry
  };
}
