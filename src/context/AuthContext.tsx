"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { doc, getDoc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserServices } from "@/types/users";
import { syncSessionCookie } from "@/actions/auth-session";

/**
 * BPlen HUB — AuthContext (Estado Global de Autenticação)
 * Gerencia o estado do usuário de forma reativa e o expõe via hooks.
 * Agora com suporte a Real-time Permissions via onSnapshot 📡🛡️
 */

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  matricula: string | null;
  nickname: string | null;
  services: UserServices;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  matricula: null,
  nickname: null,
  services: {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [matricula, setMatricula] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [services, setServices] = useState<UserServices>({});
  
  // Referência para gerenciar o encerramento rigoroso do listener de permissões
  const unsubscribePermissions = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    // Escuta mudanças no estado de autenticação (login/logout/refresh)
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // Cleanup de listeners anteriores se o usuário mudar ou deslogar
      if (unsubscribePermissions.current) {
        unsubscribePermissions.current();
        unsubscribePermissions.current = null;
      }

      if (!currentUser) {
        setIsAdmin(false);
        setMatricula(null);
        setNickname(null);
        setServices({});
        await syncSessionCookie(null); // Remove o cookie do servidor 🛡️
        setLoading(false);
        return;
      }
      
      // Sincroniza o UID com o servidor para Route Guards (Server Components)
      await syncSessionCookie(currentUser.uid);

      // Hardcoded fallback safety para email master (UX imediata)
      const email = currentUser.email?.toLowerCase() || "";
      if (email === "lisandra.lencina@bplen.com" || email === "it@bplen.com" || email.endsWith("@bplen.com")) {
        setIsAdmin(true);
      }

      try {
        // 1. Obter Matrícula BPlen via UID Map (Leitura Única)
        const uidMapRef = doc(db, "_AuthMap", currentUser.uid);
        const uidMapSnap = await getDoc(uidMapRef);
        
        if (uidMapSnap.exists()) {
          const mat = uidMapSnap.data().matricula;
          setMatricula(mat);
          
          if (mat) {
            // 2. Obter Dados de Perfil (Leitura Única para Nickname)
            const userRef = doc(db, "User", mat);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
              const d = userSnap.data();
              // Priorizar nova estrutura: User_Nickname na raiz
              const resolvedNick = d.User_Nickname || d.User_Welcome?.User_Nickname || d.Authentication_Name || d.User_Name || "Membro BPlen";
              setNickname(resolvedNick);

              // 3. Estabelecer Listener em Tempo Real para Permissões (onSnapshot)
              const permissionsRef = doc(db, "User", mat, "User_Permissions", "access");
              
              unsubscribePermissions.current = onSnapshot(permissionsRef, (permSnap) => {
                if (permSnap.exists()) {
                  const pData = permSnap.data();
                  setIsAdmin(pData.admin === true);
                  setServices(pData.services || {});
                  console.log(`📡 [AuthContext] Permissões atualizadas em tempo real para: ${currentUser.email}`);
                } else {
                  // Fallback se o documento sumir
                  setIsAdmin(false);
                  setServices({});
                }
              }, (error) => {
                console.error("❌ [AuthContext] Erro no listener de permissões:", error);
              });
            }
          }
        }
      } catch (err: unknown) {
        console.error("❌ [AuthContext] Erro ao inicializar estado global:", err);
      }
      
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribePermissions.current) {
        unsubscribePermissions.current();
      }
    };
  }, []);

  const logout = async () => {
    try {
      await syncSessionCookie(null); // Limpeza preventiva no servidor
      await signOut(auth);
    } catch (error) {
      console.error("❌ [AuthContext] Erro ao deslogar:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, matricula, nickname, services, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

/** Hook personalizado para consumir o contexto de autenticação */
export const useAuthContext = () => useContext(AuthContext);
