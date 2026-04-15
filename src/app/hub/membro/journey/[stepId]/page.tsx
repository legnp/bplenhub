"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, redirect } from "next/navigation";
import { StepContainer } from "@/components/journey/StepContainer";
import { SubStepRail } from "@/components/journey/SubStepRail";
import { StepRenderer } from "@/components/journey/StepRenderer";
import { useAuthContext } from "@/context/AuthContext";
import { useJourney } from "@/hooks/useJourney";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import AtmosphericLoading from "@/components/shared/AtmosphericLoading";

/**
 * BPlen HUB — Step Journey Engine 🧬🛡️
 * Dynamic page that resolves the current stage and renders its substeps linear-flexibly.
 */
export default function StepJourneyPage() {
  const params = useParams();
  const router = useRouter();
  const stepId = (params.stepId as string) || "onboarding";
  const { user } = useAuthContext();
  
  // Progress Logic
  const { stages, progress, loading, updateSubStep, getStepStatus } = useJourney(user?.uid || "guest");
  
  // Local state for current substep view
  const [currentSubStepId, setCurrentSubStepId] = useState<string>("");

  const stepConfig = stages.find(s => s.id === stepId);

  useEffect(() => {
    if (stepConfig && !currentSubStepId) {
      // Logic from user feedback: linear, but flexible.
      // Default to first incomplete substep or simply the first one if everything completed.
      const firstIncomplete = stepConfig.substeps.find(ss => !progress?.steps[stepId]?.completedSubSteps.includes(ss.id));
      setCurrentSubStepId(firstIncomplete?.id || stepConfig.substeps[0].id);
    }
  }, [stepConfig, currentSubStepId, progress, stepId]);

  if (loading || (!stepConfig && stages.length === 0)) {
    return <AtmosphericLoading />;
  }

  if (!stepConfig && stages.length > 0) {
     return redirect("/hub/membro");
  }

  if (!stepConfig) return null;

  const currentSubStep = stepConfig.substeps.find(ss => ss.id === currentSubStepId) || stepConfig.substeps[0];
  const stepStatus = getStepStatus(stepId);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pt-5 pb-8 px-4">
      <StepContainer 
        title={stepConfig.title} 
      description={stepConfig.description}
      badge={stepStatus === "completed" ? "Finalizado" : "Em Progresso"}
    >
      {/* Sidebar: SubStep Navigation Rail */}
      <SubStepRail 
        substeps={stepConfig.substeps}
        currentSubStepId={currentSubStepId}
        completedSubStepIds={progress?.steps[stepId]?.completedSubSteps || []}
        onSelectSubStep={setCurrentSubStepId}
      />

      {/* Main Task Area: Step Renderer */}
      <div className="flex-1 flex flex-col pt-[5px] pb-4 px-4 sm:pb-8 sm:px-8">
        <StepRenderer 
          substep={currentSubStep} 
          status={stepStatus}
          onComplete={() => {
            // Mark current as complete
            updateSubStep(stepId, currentSubStepId, true);
            
            // Advance linearly choice
            const currentIndex = stepConfig.substeps.findIndex(ss => ss.id === currentSubStepId);
            if (currentIndex < stepConfig!.substeps.length - 1) {
              setCurrentSubStepId(stepConfig!.substeps[currentIndex + 1].id);
            } else {
                // If last sub-step of the stage, go to next stage or show completion
                alert("Estágio Concluído! Redirecionando para próxima etapa...");
                const currentStageIdx = stages.findIndex(s => s.id === stepId);
                if (currentStageIdx < stages.length - 1) {
                    router.push(`/hub/membro/journey/${stages[currentStageIdx + 1].id}`);
                }
            }
          }}
        />
      </div>
    </StepContainer>
    </div>
  );
}
