import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchUserPermissionsStatus } from "@/actions/auth-permissions";
import { MemberAreaView } from "@/components/hub/MemberAreaView";
import { getMyActiveServicesAction } from "@/actions/delivery";

/**
 * BPlen HUB — Área de Membro (Soberania do Servidor 🛡️)
 * O acesso é validado no servidor antes de enviar qualquer JS para o navegador.
 */
export default async function MemberAreaPage() {
  const cookieStore = await cookies();
  const idToken = cookieStore.get("bplen_session_uid")?.value;

  // 1. Gate de Autenticação Primário (Fall-through do Layout)
  if (!idToken) {
    redirect("/");
  }

  // 2. Gate de Autorização Granular (Soberania de Permissões) 🛡️
  const { isAdmin, services: userServices } = await fetchUserPermissionsStatus(idToken);
  const hasAccess = isAdmin || userServices?.member_area_access === true;

  if (!hasAccess) {
    console.warn(`🚦 [MemberArea Gate] Acesso bloqueado via Servidor para o UID: ${idToken}.`);
    redirect("/hub");
  }

  // 3. Buscar Serviços Ativos do Usuário 📡
  const result = await getMyActiveServicesAction(idToken);
  const activeProducts = result.success ? (result.data || []) : [];

  // 4. Renderização Autorizada — Somente após validação legítima no servidor.
  return <MemberAreaView activeProducts={activeProducts} />;
}
