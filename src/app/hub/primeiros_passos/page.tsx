"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
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
        if (stage && stage.substeps && stage.substeps.length > 0) {
          setStandaloneStage(stage);
          
          // Lógica de Navegação Inicial: Focar no primeiro incompleto
          const completedIds = progress?.steps[stage.id]?.completedSubSteps || [];
          const firstIncomplete = stage.substeps.find(ss => !completedIds.includes(ss.id));
          setCurrentSubStepId(firstIncomplete?.id || stage.substeps[0]?.id || "");
        } else if (stage) {
          // Caso existir o estágio mas não ter subpassos
          setStandaloneStage(stage);
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
          onClick={() => router.push("/hub")}
          className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-start)] hover:opacity-70"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  // Estado de Segurança: Caso a trilha esteja vazia no Firestore
  if (!standaloneStage.substeps || standaloneStage.substeps.length === 0) {
     return (
        <div className="p-20 text-center space-y-6 max-w-xl mx-auto animate-fade-in">
           <div className="w-16 h-16 bg-[var(--accent-soft)] rounded-full flex items-center justify-center mx-auto text-[var(--accent-start)]">
              <Sparkles size={32} />
           </div>
           <div className="space-y-2">
              <h2 className="text-xl font-bold text-[var(--text-primary)] uppercase tracking-widest">Quase lá!</h2>
              <p className="text-[11px] font-medium text-[var(--text-muted)] lg:px-12 leading-relaxed">
                 Estamos preparando os seus Primeiros Passos personalizados. 
                 Em breve este ecossistema estará repleto de ferramentas para sua carreira.
              </p>
           </div>
           <button 
             onClick={() => router.push("/hub")}
             className="px-8 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all"
           >
             Voltar ao Início
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
