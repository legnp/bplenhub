"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StepContainer } from "@/components/journey/StepContainer";
import { SubStepRail } from "@/components/journey/SubStepRail";
import { StepRenderer } from "@/components/journey/StepRenderer";
import { useAuthContext } from "@/context/AuthContext";
import { useJourney } from "@/hooks/useJourney";
import { getStandaloneStageAction } from "@/actions/journey";
import { JourneyStep } from "@/types/journey";
import AtmosphericLoading from "@/components/shared/AtmosphericLoading";

/**
 * BPlen HUB — Primeiros Passos 🧬🚀
 * Página que espelha a funcionalidade de entrega da jornada,
 * mas focada exclusivamente no ecossistema de boas-vindas do HUB.
 */
export default function PrimeirosPassosPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { progress, loading: journeyLoading, updateSubStep } = useJourney(user?.uid || "guest");
  
  const [standaloneStage, setStandaloneStage] = useState<JourneyStep | null>(null);
  const [currentSubStepId, setCurrentSubStepId] = useState<string>("");
  const [isLoadingStage, setIsLoadingStage] = useState(true);

  // 🛰️ Carregar Dados Reais do Produto "PRIMEIROS_PASSOS"
  useEffect(() => {
    async function fetchStage() {
      try {
        // Buscamos pelo ID que é imutável e mais seguro
        const stage = await getStandaloneStageAction("PRIMEIROS_PASSOS");
        if (stage) {
          setStandaloneStage(stage);
          
          // Lógica de Navegação Inicial: Focar no primeiro incompleto
          const completedIds = progress?.steps[stage.id]?.completedSubSteps || [];
          const firstIncomplete = stage.substeps.find(ss => !completedIds.includes(ss.id));
          setCurrentSubStepId(firstIncomplete?.id || stage.substeps[0].id);
        }
      } catch (err) {
        console.error("❌ [PrimeirosPassos] Falha ao sincronizar estágio:", err);
      } finally {
        setIsLoadingStage(false);
      }
    }
    
    // Só dispara quando o progresso estiver sincronizado (Evita race conditions)
    if (!journeyLoading) {
      fetchStage();
    }
  }, [progress, journeyLoading]);

  if (journeyLoading || isLoadingStage) {
    return <AtmosphericLoading />;
  }

  if (!standaloneStage) {
    return (
      <div className="p-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)] uppercase tracking-widest">Trilha não encontrada</h2>
        <button 
          onClick={() => router.push("/hub/membro")}
          className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-start)] hover:opacity-70"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  const currentSubStep = standaloneStage.substeps.find(ss => ss.id === currentSubStepId) || standaloneStage.substeps[0];
  const completedSubSteps = progress?.steps[standaloneStage.id]?.completedSubSteps || [];
  const isAllCompleted = completedSubSteps.length === standaloneStage.substeps.length;

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pt-5 pb-8 px-4 animate-fade-in">
      <StepContainer
        title={standaloneStage.title}
        description={standaloneStage.description}
        badge={isAllCompleted ? "Finalizado" : "Trilha de Boas-Vindas"}
      >
        {/* Sidebar: SubStep Navigation Rail 🛤️ */}
        <SubStepRail
          id="hub-primeiros-passos-nav"
          substeps={standaloneStage.substeps}
          currentSubStepId={currentSubStepId}
          completedSubStepIds={completedSubSteps}
          onSelectSubStep={setCurrentSubStepId}
        />

        {/* Main Task Area: Step Renderer 🎥📋 */}
        <div id="hub-conteudo" className="flex-1 flex flex-col pt-[5px] pb-4 px-4 sm:pb-8 sm:px-8">
          <StepRenderer
            substep={currentSubStep}
            status={isAllCompleted ? "completed" : "current"}
            onComplete={async () => {
              // Mark current as complete
              await updateSubStep(standaloneStage.id, currentSubStepId, true);

              // Refresh UI
              router.refresh();

              // Advance linearly
              const currentIndex = standaloneStage.substeps.findIndex(ss => ss.id === currentSubStepId);
              if (currentIndex < standaloneStage.substeps.length - 1) {
                setCurrentSubStepId(standaloneStage.substeps[currentIndex + 1].id);
              } else {
                alert("Você completou todos os Primeiros Passos! Boas-vindas oficialmente ao HUB.");
              }
            }}
          />
        </div>
      </StepContainer>
    </div>
  );
}
