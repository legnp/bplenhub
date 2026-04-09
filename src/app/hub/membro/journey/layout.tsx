"use client";

import React, { useState } from "react";
import { JourneyNav } from "@/components/journey/JourneyNav";
import { useAuthContext } from "@/context/AuthContext";
import { useJourney } from "@/hooks/useJourney";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { JOURNEY_STAGES } from "@/config/journey/steps-registry";

/**
 * BPlen HUB — Journey Layout 🧬🛡️
 * The premium frame for the 6-stage member journey.
 */
export default function JourneyLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuthContext();
  const pathname = usePathname();
  const currentStepId = pathname.split('/').pop() || "onboarding";
  
  // Progress tracker
  const { progress, loading: journeyLoading, getStepStatus } = useJourney(user?.uid || "guest");

  if (authLoading || journeyLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-transparent">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--accent-start)]" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] animate-pulse">Sincronizando Jornada...</p>
      </div>
    );
  }

  // Pre-calculate status map for Navigator
  const statusMap = JOURNEY_STAGES.reduce((acc, stage) => {
    acc[stage.id] = getStepStatus(stage.id);
    return acc;
  }, {} as any);

  return (
    <section className="min-h-screen pt-12 pb-24 px-4 sm:px-8 bg-[var(--bg-primary)] animate-in fade-in duration-700">
      {/* Horizontal Multi-Step Navigator */}
      <JourneyNav 
        currentStepId={currentStepId} 
        stepStatusMap={statusMap} 
      />

      <div className="flex-1 w-full max-w-7xl mx-auto">
        {children}
      </div>
    </section>
  );
}
