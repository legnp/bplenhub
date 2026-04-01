"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

/**
 * BPlen HUB — AuthContext (Estado Global de Autenticação)
 * Gerencia o estado do usuário de forma reativa e o expõe via hooks.
 */

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  matricula: string | null;
  nickname: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  matricula: null,
  nickname: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [matricula, setMatricula] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);

  useEffect(() => {
    // Escuta mudanças no estado de autenticação (login/logout/refresh)
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (!currentUser) {
        setIsAdmin(false);
        setMatricula(null);
        setNickname(null);
        setLoading(false);
        return;
      }

      // Hardcoded fallback safety for master emails immediately matching without DB read
      const email = currentUser.email?.toLowerCase() || "";
      if (
        email === "lisandra.lencina@bplen.com" || 
        email === "it@bplen.com" || 
        email.endsWith("@bplen.com")
      ) {
        setIsAdmin(true);
      }

      try {
        // Obter Matrícula BPlen via UID Map
        const uidMapRef = doc(db, "_AuthMap", currentUser.uid);
        const uidMapSnap = await getDoc(uidMapRef);
        
        if (uidMapSnap.exists()) {
          const mat = uidMapSnap.data().matricula;
          setMatricula(mat);
          
          if (mat) {
            const userRef = doc(db, "User", mat);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
              const d = userSnap.data();
              const welcome = d.User_Welcome || {};
              const resolvedNick = welcome.User_Nickname || welcome.Authentication_Name || d.User_Nickname || d.User_Name || d.Authentication_Name || "Membro BPlen";
              setNickname(resolvedNick);

              // Snapshot das Permissões
              const permissionsRef = doc(db, "User", mat, "User_Permissions", "access");
              const permSnap = await getDoc(permissionsRef);
              
              if (permSnap.exists() && permSnap.data().admin === true) {
                setIsAdmin(true);
              }
            }
          }
        }
      } catch (err: unknown) {
        const error = err as Error;
        console.error("Erro extraindo permissões do banco:", error);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, matricula, nickname }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

/** Hook personalizado para consumir o contexto de autenticação */
export const useAuthContext = () => useContext(AuthContext);
