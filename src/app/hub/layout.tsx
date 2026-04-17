import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { HubShell } from "@/components/hub/HubShell";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Home",
    template: "BPlen HUB | %s",
  },
};

/**
 * HUB LAYOUT — O Gate de Autenticação Server-Side 🛡️
 * O servidor toma a decisão de autorização ANTES do JS carregar no cliente.
 */
export default async function HubLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const hasSignedSession = cookieStore.has("bplen_session");
  const hasLegacySession = cookieStore.has("bplen_session_uid");

  // 🛡️ [Autoridade do Servidor] 
  // Bloqueio imediato na orquestração da página. Se não houver cookie, o redirect 
  // ocorre no nível de cabeçalho HTTP, antes de qualquer dado chegar ao navegador.
  if (!hasSignedSession && !hasLegacySession) {
     console.log("🚦 [Route Gate] Sessão não encontrada nos cookies. Redirecionamento Server-Side...");
     redirect("/");
  }

  // Se houver sessão (UID no cookie), permitimos a renderização da Shell e do Conteúdo.
  return (
    <HubShell>
       {children}
    </HubShell>
  );
}
