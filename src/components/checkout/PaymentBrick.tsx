"use client";

import React, { useEffect } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { clientEnv } from "@/env";

// Inicialização Global Única (Soberania de SDK 🛡️)
initMercadoPago(clientEnv.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY, {
  locale: "pt-BR",
});

interface PaymentBrickProps {
  preferenceId: string;
  amount: number;
  onReady?: () => void;
  onError?: (error: any) => void;
}

/**
 * BPlen HUB — Payment Brick Wrapper (💳)
 * Integra o Checkout Bricks do Mercado Pago com o design system do HUB.
 * Gerencia o ciclo de vida do pagamento e callbacks.
 */

export function PaymentBrick({ preferenceId, amount, onReady, onError }: PaymentBrickProps) {
  
  const initialization = {
    amount: amount,
    preferenceId: preferenceId,
  };

  const customization = {
    paymentMethods: {
      ticket: "all" as const,
      bankTransfer: "all" as const,
      creditCard: "all" as const,
      maxInstallments: 12, // TODO: Tornar dinâmico via prop se necessário
    },
    visual: {
      style: {
        theme: "flat" as const, // Mais limpo para combinar com Glassmorphism
        customVariables: {
          formBackgroundColor: "transparent",
          baseColor: "#667eea", // BPlen Accent
          buttonBackgroundColor: "#667eea",
          buttonTextColor: "#ffffff",
          inputBackgroundColor: "rgba(255, 255, 255, 0.05)",
          inputBorderColor: "rgba(255, 255, 255, 0.1)",
        }
      }
    }
  };

  const onSubmit = async ({ selectedPaymentMethod, formData }: any) => {
    // Para Bricks com PreferenceID, o onSubmit é apenas informativo ou para logs,
    // já que o redirect/processamento é tratado pelo próprio SDK ou Webhook.
    console.log("🚀 [PaymentBrick] Processando pagamento:", selectedPaymentMethod);
  };

  return (
    <div className="w-full min-h-[400px] animate-in fade-in duration-700">
      <Payment
        initialization={initialization}
        customization={customization}
        onSubmit={onSubmit}
        onReady={onReady}
        onError={onError}
      />
    </div>
  );
}
