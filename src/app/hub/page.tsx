"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { WelcomeSurvey } from "@/components/forms/WelcomeSurvey";
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { HubHomeView } from "@/components/hub/HubHomeView";

export default function HubPage() {
  const { user, loading } = useAuthContext();
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState<boolean | null>(null);
  const [checkingSurvey, setCheckingSurvey] = useState(false);

  useEffect(() => {
    async function checkSurvey() {
      if (!user) {
        setHasCompletedSurvey(null);
        return;
      }
      
      setCheckingSurvey(true);
      try {
        const mapSnap = await getDoc(doc(db, "_AuthMap", user.uid));
        if (mapSnap.exists()) {
          const { matricula } = mapSnap.data();
          const userSnap = await getDoc(doc(db, "User", matricula));
          
          if (userSnap.exists() && userSnap.data().hasCompletedWelcome) {
            setHasCompletedSurvey(true);
          } else {
            setHasCompletedSurvey(false);
          }
        } else {
          setHasCompletedSurvey(false);
        }
      } catch (err) {
        console.error("Erro ao verificar status da survey:", err);
        setHasCompletedSurvey(false); // Fallback para abrir a survey em caso de erro para não travar
      } finally {
        setCheckingSurvey(false);
      }
    }

    checkSurvey();
  }, [user]);

  if (loading || checkingSurvey) {
    return (
      <main className="flex-1 flex items-center justify-center p-6 relative">
        <div className="w-8 h-8 rounded-full border-2 border-accent-start border-t-transparent animate-spin" />
      </main>
    );
  }

  if (user && hasCompletedSurvey === false) {
    return (
      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl gradient-accent" aria-hidden="true" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-15 blur-3xl gradient-accent" aria-hidden="true" />
        </div>
        
        <div className="relative z-10 w-full mt-10 mb-10">
          <WelcomeSurvey 
            userUid={user.uid}
            userName={user.displayName || "Membro"}
            userEmail={user.email || ""}
            onComplete={() => setHasCompletedSurvey(true)}
          />
        </div>
      </main>
    );
  }

  // HUB HOME — Experiência Pós-Survey
  return <HubHomeView />;
}
