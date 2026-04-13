"use client";

import React, { useState } from "react";
import { JourneyNav } from "@/components/journey/JourneyNav";
import { useAuthContext } from "@/context/AuthContext";
import { useJourney } from "@/hooks/useJourney";
import { usePathname } from "next/navigation";
import AtmosphericLoading from "@/components/shared/AtmosphericLoading";

/**
 * BPlen HUB — Journey Layout 🧬🛡️
 * The premium frame for the 6-stage member journey.
 */
export default function JourneyLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuthContext();
  const pathname = usePathname();
  const currentStepId = pathname.split('/').pop() || "onboarding";
  
// Progress tracker
  const { stages, progress, loading: journeyLoading, getStepStatus, getStageTelemetry } = useJourney(user?.uid || "guest");

  if (authLoading || journeyLoading) {
    return <AtmosphericLoading />;
  }

  // Pre-calculate status map for Navigator
  const statusMap = stages.reduce((acc, stage) => {
    acc[stage.id] = getStepStatus(stage.id);
    return acc;
  }, {} as any);

  return (
    <section className="min-h-screen pt-[10px] pb-24 px-4 sm:px-8 bg-[var(--bg-primary)] animate-in fade-in duration-700">
        <div className="max-w-7xl mx-auto px-6">
          <JourneyNav 
             stages={stages}
             currentStepId={currentStepId} 
             stepStatusMap={progress?.steps ? Object.fromEntries(
                Object.entries(progress.steps).map(([k, v]) => [k, v.status])
             ) : {}}
             getStageTelemetry={getStageTelemetry}
          />
        </div>

      <div className="flex-1 w-full max-w-7xl mx-auto">
        {children}
      </div>
    </section>
  );
}
