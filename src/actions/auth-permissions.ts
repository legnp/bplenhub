"use server";

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * BPlen HUB — Auth Permissions Action (Segurança 🛡️)
 * Verifica permissões e garante automação de "Admin" para conta Master.
 */

// Email Master que recebe a Flag de Admin automaticamente
const MASTER_DOMAINS = ["@bplen.com"];
const MASTER_EMAILS = ["lisandra.lencina@bplen.com", "it@bplen.com"]; // Fallback de hardcoded accounts principais

export async function syncUserPermissionsOnLogin(uid: string, email: string | null) {
  if (!email) return false;

  try {
    const isMasterEmail = MASTER_EMAILS.includes(email.toLowerCase()) || 
                          MASTER_DOMAINS.some(domain => email.toLowerCase().endsWith(domain));

    // Determina o Documento de UID Mapping
    const uidMapRef = doc(db, "_AuthMap", uid);
    const uidMapSnap = await getDoc(uidMapRef);

    let matricula = "";

    // Se o usuário ainda não passou pelo Welcome (não tem Matrícula), não forçamos,
    // mas guardaremos a permissão via UID também caso necessário,
    // ou simplesmente aguardamos. A regra é: User > [Matricula] > User_Permissions.
    if (uidMapSnap.exists()) {
      matricula = uidMapSnap.data().matricula;
    }

    if (!matricula) {
       // Permissão administrativa flutuante se não houver matrícula ainda.
       // Essa permissão real será solidificada no fluxo de Onboard B2C/B2B (Welcome Survey).
       return isMasterEmail;
    }

    // Lógica de Registro de Permissão no Banco
    const permissionsRef = doc(db, "User", matricula, "User_Permissions", "access");
    const permSnap = await getDoc(permissionsRef);

    let isAdmin = false;

    if (permSnap.exists()) {
      isAdmin = permSnap.data().admin === true;
    }

    // Se é conta Master, mas não tem Admin Flag Ativa na base, CONCEDE AUTOMATICAMENTE.
    if (isMasterEmail && !isAdmin) {
      await setDoc(permissionsRef, {
        admin: true,
        grantedAt: serverTimestamp(),
        grantedReason: "SYSTEM_MASTER_AUTO_GRANT"
      }, { merge: true });
      isAdmin = true;
      console.log(`✅ [Segurança] Permissão de Admin concedida para Master Account: ${email}`);
    }

    return isAdmin;

  } catch (error) {
    console.error("Erro na Sincronização de Permissões:", error);
    return false;
  }
}

/**
 * Busca o Status de Permissão (Leitura em Tempo Real ou SSR)
 */
export async function fetchUserPermissionsStatus(uid: string) {
    const uidMapRef = doc(db, "_AuthMap", uid);
    const uidMapSnap = await getDoc(uidMapRef);

    if (!uidMapSnap.exists()) return false;
    const matricula = uidMapSnap.data().matricula;

    const permissionsRef = doc(db, "User", matricula, "User_Permissions", "access");
    const permSnap = await getDoc(permissionsRef);

    if (!permSnap.exists()) return false;
    return permSnap.data().admin === true;
}
