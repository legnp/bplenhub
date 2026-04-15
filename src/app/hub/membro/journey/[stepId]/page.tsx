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
import { GuidedTourOverlay } from "@/components/shared/GuidedTourOverlay";
import { onboardingTourSteps } from "@/config/tour/onboarding-tour";

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

  // Guided Tour State (Parte 2 do Flow de Onboarding)
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [revealedSections, setRevealedSections] = useState<string[]>([]);
  const [currentFocus, setCurrentFocus] = useState<string | null>(null);

  const getSectionStyle = (sectionId: string): React.CSSProperties => {
    return {
      filter: isTourOpen && !revealedSections.includes(sectionId) ? "blur(12px)" : "blur(0px)",
      transition: "all 0.8s ease-out",
      pointerEvents: (isTourOpen && !revealedSections.includes(sectionId) ? "none" : "auto") as React.CSSProperties["pointerEvents"],
      zIndex: isTourOpen && revealedSections.includes(sectionId) ? 50 : 1,
      borderRadius: "2rem",
      boxShadow: isTourOpen && currentFocus === sectionId 
        ? "0 0 80px rgba(255, 0, 128, 0.3)" 
        : undefined
    };
  };

  useEffect(() => {
    const header = document.getElementById("hub-global-header");
    const topNav = document.getElementById("hub-journey-top-nav");
    
    [header, topNav].forEach(el => {
      if (el) {
        if (isTourOpen) {
           el.style.filter = "blur(12px)";
           el.style.transition = "filter 0.8s ease-out";
           el.style.pointerEvents = "none";
        } else {
           el.style.filter = "none";
           el.style.pointerEvents = "auto";
        }
      }
    });
  }, [isTourOpen]);

  useEffect(() => {
    if (typeof window !== "undefined") {
       const search = window.location.search;
       if (search.includes("startTour=part2")) {
          const timer = setTimeout(() => {
             setIsTourOpen(true);
             window.history.replaceState({}, "", window.location.pathname);
          }, 1500);
          return () => clearTimeout(timer);
       }
    }
  }, []);

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
        id="hub-etapa-checkin"
        style={getSectionStyle("hub-etapa-checkin")}
        substeps={stepConfig.substeps}
        currentSubStepId={currentSubStepId}
        completedSubStepIds={progress?.steps[stepId]?.completedSubSteps || []}
        onSelectSubStep={setCurrentSubStepId}
      />

      {/* Main Task Area: Step Renderer */}
      <div id="hub-conteudo" style={getSectionStyle("hub-conteudo")} className="flex-1 flex flex-col pt-[5px] pb-4 px-4 sm:pb-8 sm:px-8">
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

    <GuidedTourOverlay 
      steps={onboardingTourSteps.slice(5)}
      isOpen={isTourOpen}
      onComplete={() => {
         setIsTourOpen(false);
         setRevealedSections([]);
         setCurrentFocus(null);
      }}
      onReveal={(ids) => setRevealedSections(ids)}
      onFocus={(id) => setCurrentFocus(id)}
      userName={user?.displayName ? user.displayName.split(" ")[0] : "Membro"}
    />
    </div>
  );
}
