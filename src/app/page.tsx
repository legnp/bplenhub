"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { WelcomeSurvey } from "@/components/forms/WelcomeSurvey";
import { GoogleLoginButton } from "@/components/auth/google-login-button";

export default function Home() {
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

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl gradient-accent" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-15 blur-3xl gradient-accent" aria-hidden="true" />
      </div>

      {/* Hero Card */}
      <div className="glass hover-lift max-w-lg w-full p-10 text-center relative z-10 animate-fade-in-up">
        {/* Logo / Brand */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            BPlen{" "}
            <span className="gradient-accent bg-clip-text text-transparent">
              HUB
            </span>
          </h1>
          <p
            className="mt-2 text-sm font-medium tracking-wide uppercase animate-fade-in-up-delay"
            style={{ color: "var(--text-secondary)" }}
          >
            Desenvolvimento Humano
          </p>
        </div>

        {/* Divider */}
        <div
          className="w-12 h-px mx-auto mb-8 animate-fade-in-up-delay"
          style={{ background: "linear-gradient(90deg, var(--accent-start), var(--accent-end))" }}
        />

        {/* Status Message */}
        <p
          className="text-sm leading-relaxed mb-8 animate-fade-in-up-delay-2"
          style={{ color: "var(--text-secondary)" }}
        >
          Ecossistema em construção.
          <br />
          Em breve, sua jornada de desenvolvimento começa aqui.
        </p>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full animate-fade-in-up-delay-2"
          style={{
            background: "rgba(102, 126, 234, 0.08)",
            border: "1px solid rgba(102, 126, 234, 0.15)",
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse-soft"
            style={{ background: "var(--accent-start)" }}
          />
          <span className="text-xs font-medium" style={{ color: "var(--accent-start)" }}>
            Infraestrutura Ativa
          </span>
        </div>
        
        {!user && (
          <div className="mt-8 relative z-10 flex justify-center">
            <GoogleLoginButton />
          </div>
        )}
      </div>
    </main>
  );
}
