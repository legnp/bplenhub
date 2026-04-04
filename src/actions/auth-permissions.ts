"use server";

import { getAdminDb } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";
import { UserRole, UserServices } from "@/types/users";

/**
 * BPlen HUB — Auth Permissions Action (Segurança 🛡️)
 * Verifica permissões e garante automação de "Admin" para conta Master.
 * Transição para Firebase Admin SDK (Node.js) para governança soberana.
 */

// ──────────────────────────────
// Governança: Allowlist de Administradores Master (Soberania 🛡️)
// Apenas estes e-mails recebem auto-grant se o banco estiver vazio ou para recuperação.
// ──────────────────────────────
const MASTER_EMAILS = [
  "lisandra.lencina@bplen.com", 
  "it@bplen.com", 
  "legnp@bplen.com"
];

export async function syncUserPermissionsOnLogin(uid: string, email: string | null) {
  if (!email) return { isAdmin: false, role: "visitor", services: {} };

  try {
    const isMasterEmail = MASTER_EMAILS.includes(email.toLowerCase());


    // 1. Determina a Matrícula via UID Mapping (ou Autocorreção via Email) 🛡️
    const uidMapRef = getAdminDb().collection("_AuthMap").doc(uid);
    let uidMapSnap = await uidMapRef.get();

    let matricula = "";
    if (uidMapSnap.exists) {
      const data = uidMapSnap.data();
      matricula = data?.matricula;
      const storedEmail = data?.email;

      // 🚨 Validação de Consistência: Se o e-mail mudou para este UID, re-validamos
      if (storedEmail && email && storedEmail !== email.toLowerCase()) {
         console.warn(`⚠️ [Auth Sync] Conflito de E-mail detectado: ${storedEmail} -> ${email}. Re-sincronizando...`);
         // Buscar matrícula correta pelo novo e-mail
         const correctUserSnap = await getAdminDb()
           .collection("User")
           .where("email", "==", email.toLowerCase())
           .limit(1)
           .get();
         
         if (!correctUserSnap.empty) {
            matricula = correctUserSnap.docs[0].id;
            await uidMapRef.update({ 
               matricula, 
               email: email.toLowerCase(),
               updatedAt: admin.firestore.FieldValue.serverTimestamp() 
            });
         }
      }
    } else {
      // 🔄 Auto-Cura: Se o UID não existe, buscamos por e-mail na coleção User
      console.log(`🔍 [Auth Sync] UID Novo. Tentando localizar por e-mail: ${email}...`);
      const userByEmailSnap = await getAdminDb()
        .collection("User")
        .where("email", "==", email.toLowerCase())
        .limit(1)
        .get();
        
      if (!userByEmailSnap.empty) {
        matricula = userByEmailSnap.docs[0].id;
        await uidMapRef.set({ 
          matricula, 
          email: email.toLowerCase(),
          healedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ [Auth Sync] Mapeamento auto-corrigido: ${uid} -> ${matricula}`);
      }
    }

    console.log(`🔍 [Auth Trace] UID: ${uid} | Matrícula Final: ${matricula || "Visitante"}`);

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
        console.warn(`⚠️ [Auth Status] UID ${uid} não encontrado no _AuthMap.`);
        return { isAdmin: false, role: "visitor", services: {} };
      }

      const matricula = uidMapSnap.data()?.matricula;
      const permissionsPath = `User/${matricula}/User_Permissions/access`;
      const permissionsRef = getAdminDb().doc(permissionsPath);
      const permSnap = await permissionsRef.get();

      console.log(`🔍 [Auth Trace] UID: ${uid} | Matrícula Resolvida: ${matricula} | Path: ${permissionsPath}`);

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
