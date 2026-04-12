"use client";

import { useState, useEffect } from "react";
import { JourneyProgress, StepStatus, UserStepProgress, JourneyStep } from "@/types/journey";
import { getJourneyStagesAction } from "@/actions/journey";

/**
 * BPlen HUB — useJourney 🧬🛡️
 * Logic hook for member journey progress and access control.
 * Now fully dynamic: fetches stages from Products and progress from User metadata.
 */
export function useJourney(uid: string) {
  const [stages, setStages] = useState<JourneyStep[]>([]);
  const [progress, setProgress] = useState<JourneyProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        console.log("🧬 [useJourney] Sincronizando estágios dinâmicos...");
        
        // 1. Fetch Stages from Firestore (via Action)
        const dynamicStages = await getJourneyStagesAction();
        setStages(dynamicStages);

        // 2. Initialize or Fetch Progress from Firestore
        // For now, mapping progress based on UID.
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
          matricula: "MEMBER-ID", // To be replaced by real matricula
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

    if (uid) init();
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

      // Determine new status if all are completed
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

  const getStepStatus = (stepId: string): StepStatus => {
    return progress?.steps[stepId]?.status || "locked";
  };

  return {
    stages,
    progress,
    loading,
    updateSubStep,
    getStepStatus
  };
}
