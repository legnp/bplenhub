"use client";

import React, { useState, useEffect } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";

/**
 * BPlen HUB — Google Analytics Loader (Condicional) 📈🛡️
 * Este componente atua como um Gatekeeper. Ele só renderiza o script do GA4
 * se o usuário tiver dado consentimento explícito via CookieBanner.
 */

const CONSENT_KEY = "bplen_cookie_consent";
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function GoogleAnalyticsLoader() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const checkConsent = () => {
      const consent = localStorage.getItem(CONSENT_KEY);
      // Solo carregamos se o consentimento for "all"
      if (consent === "all" && GA_ID) {
        setShouldLoad(true);
      } else {
        setShouldLoad(false);
      }
    };

    // 1. Verificação inicial (ao carregar o app)
    checkConsent();

    // 2. Escutar atualizações de consentimento (disparadas pelo CookieConsent.tsx)
    window.addEventListener("bplen_consent_updated", checkConsent);

    return () => {
      window.removeEventListener("bplen_consent_updated", checkConsent);
    };
  }, []);

  // Se não houver ID ou o consentimento for negado, não injetamos nad
  if (!shouldLoad || !GA_ID) {
    return null;
  }

  return <GoogleAnalytics gaId={GA_ID} />;
}
