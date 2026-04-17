import { Metadata } from "next";
import { redirect } from "next/navigation";
import { fetchUserPermissionsStatus } from "@/actions/auth-permissions";
import { verifySignedSession } from "@/actions/auth-session";
import MemberDashboardView from "@/components/hub/MemberDashboardView";

export const metadata: Metadata = {
  title: "Jornada de Membro",
  description: "Acompanhe sua evolução, resultados e próximos passos na sua jornada de desenvolvimento BPlen.",
};

/**
 * BPlen HUB — Área de Membro (Soberania do Servidor 🛡️)
 * O acesso é validado no servidor antes de enviar qualquer JS para o navegador.
 */
export default async function MemberAreaPage() {
  // 🛡️ Verificação de sessão assinada
  const session = await verifySignedSession();

  // 1. Gate de Autenticação Primário
  if (!session) {
    redirect("/");
  }

  // 2. Gate de Autorização Granular (Soberania de Permissões) 🛡️
  const { isAdmin, services: userServices } = await fetchUserPermissionsStatus(session.uid);
  const hasAccess = isAdmin || userServices?.member_area_access === true;

  if (!hasAccess) {
    console.warn(`🚦 [MemberArea Gate] Acesso bloqueado via Servidor para o UID: ${session.uid}.`);
    redirect("/hub");
  }

  // 3. Renderização Autorizada — Dashboard unificado no lugar da antiga lista de serviços.
  return <MemberDashboardView />;
}
