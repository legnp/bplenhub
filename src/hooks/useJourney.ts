"use client";

import { useState, useEffect } from "react";
import { JourneyProgress, StepStatus, UserStepProgress } from "@/types/journey";
import { JOURNEY_STAGES } from "@/config/journey/steps-registry";

/**
 * BPlen HUB — useJourney 🧬🛡️
 * Logic hook for member journey progress and access control.
 */
export function useJourney(matricula: string) {
  const [progress, setProgress] = useState<JourneyProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // Initializing mock data or loading from localStorage/Firestore in the future
  useEffect(() => {
    const loadProgress = async () => {
      setLoading(true);
      // Mock progress data
      const initialSteps: Record<string, UserStepProgress> = {};
      JOURNEY_STAGES.forEach((stage: any, idx: number) => {
        initialSteps[stage.id] = {
          stepId: stage.id,
          status: idx === 0 ? "current" as any : "locked" as any,
          completedSubSteps: [],
          currentSubStepId: stage.substeps[0]?.id
        };
      });

      const mockProgress: JourneyProgress = {
        matricula,
        lastActiveStepId: "onboarding",
        steps: initialSteps,
        overallProgress: 0
      };

      setProgress(mockProgress);
      setLoading(false);
    };

    loadProgress();
  }, [matricula]);

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
      const allSubSteps = JOURNEY_STAGES.find(s => s.id === stepId)?.substeps || [];
      const status: StepStatus = newCompleted.length === allSubSteps.length ? "completed" : "current";

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
    progress,
    loading,
    updateSubStep,
    getStepStatus
  };
}
