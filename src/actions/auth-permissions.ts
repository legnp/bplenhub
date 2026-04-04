"use server";

import { getAdminDb } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";
import { UserRole, UserServices } from "@/types/users";

/**
 * BPlen HUB — Auth Permissions Action (Segurança 🛡️)
 * Verifica permissões e garante automação de "Admin" para conta Master.
 * Transição para Firebase Admin SDK (Node.js) para governança soberana.
 */

// Email Master que recebe a Flag de Admin automaticamente
const MASTER_DOMAINS = ["@bplen.com"];
const MASTER_EMAILS = ["lisandra.lencina@bplen.com", "it@bplen.com"]; // Fallback de hardcoded accounts principais

export async function syncUserPermissionsOnLogin(uid: string, email: string | null) {
  if (!email) return { isAdmin: false, role: "visitor", services: {} };

  try {
    const isMasterEmail = MASTER_EMAILS.includes(email.toLowerCase()) || 
                          MASTER_DOMAINS.some(domain => email.toLowerCase().endsWith(domain));

    // 1. Determina a Matrícula via UID Mapping
    const uidMapRef = getAdminDb().collection("_AuthMap").doc(uid);
    const uidMapSnap = await uidMapRef.get();

    let matricula = "";
    if (uidMapSnap.exists) {
      matricula = uidMapSnap.data()?.matricula;
    }

    console.log(`[Auth Sync] UID: ${uid} -> Matrícula: ${matricula || "N/A"}`);

    if (!matricula) {
       return { 
         isAdmin: isMasterEmail, 
         role: isMasterEmail ? "admin" : "visitor", 
         services: {} 
       };
    }

    // 2. Lógica de Registro/Verificação de Permissão no Banco (Path Soberano)
    const permissionsPath = `User/${matricula}/User_Permissions/access`;
    const permissionsRef = getAdminDb().doc(permissionsPath);
    const permSnap = await permissionsRef.get();

    let isAdmin = false;
    let currentPerms = permSnap.exists ? permSnap.data() : null;

    if (currentPerms) {
      isAdmin = currentPerms.admin === true;
    }

    // 3. Auto-Grant para Master Accounts
    if (isMasterEmail && !isAdmin) {
      await permissionsRef.set({
        admin: true,
        grantedAt: admin.firestore.FieldValue.serverTimestamp(),
        grantedReason: "SYSTEM_MASTER_AUTO_GRANT"
      }, { merge: true });
      isAdmin = true;
      console.log(`✅ [Segurança] Admin Auto-Grant via Admin SDK: ${email}`);
      
      // Re-fetch para ter dados consistentes no retorno
      const updatedSnap = await permissionsRef.get();
      currentPerms = updatedSnap.data();
    }

    return {
      isAdmin,
      role: (currentPerms?.role || (isAdmin ? "admin" : "member")) as UserRole,
      services: (currentPerms?.services || {}) as UserServices
    };

  } catch (error: any) {
    console.error("❌ [Auth Sync] Erro na sincronização de permissões:", error.message);
    return { isAdmin: false, role: "visitor", services: {} };
  }
}

/**
 * Busca o Status de Permissão (Server Authority 🛡️)
 */
export async function fetchUserPermissionsStatus(uid: string): Promise<{ isAdmin: boolean; role: UserRole; services: UserServices }> {
    try {
      const uidMapRef = getAdminDb().collection("_AuthMap").doc(uid);
      const uidMapSnap = await uidMapRef.get();

      if (!uidMapSnap.exists) {
        return { isAdmin: false, role: "visitor", services: {} };
      }

      const matricula = uidMapSnap.data()?.matricula;
      const permissionsPath = `User/${matricula}/User_Permissions/access`;
      const permissionsRef = getAdminDb().doc(permissionsPath);
      const permSnap = await permissionsRef.get();

      console.log(`[Auth Status] UID: ${uid} | Matrícula: ${matricula} | Path: ${permissionsPath}`);

      if (!permSnap.exists) {
        return { isAdmin: false, role: "member", services: {} };
      }

      const data = permSnap.data();
      
      return {
        isAdmin: data?.admin === true,
        role: (data?.role || (data?.admin ? "admin" : "member")) as UserRole,
        services: (data?.services || {}) as UserServices
      };
    } catch (error: any) {
      console.error("❌ [Auth Status] Falha ao buscar permissões do servidor:", error.message);
      return { isAdmin: false, role: "visitor", services: {} };
    }
}
