"use client";

import { useState } from "react";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthContext } from "@/context/AuthContext";
// Server Action call (somos use client, então o Next cuidará com RPC fetch)
// Porém, como não temos a importação correta da Action porque não foi feita como export function de action,
// Vamos deixar o lado do Context cuidar das permissões, mas aqui também chamaremos a action
import { syncUserPermissionsOnLogin } from "@/actions/auth-permissions";

/**
 * BPlen HUB — useAuth (Central de Comandos de Autenticação)
 * Hook unificado para realizar Login com Google e Logout.
 */

export function useAuth() {
  const { user, loading, isAdmin } = useAuthContext();
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  /**
   * Login com Google
   * Utiliza Popup para autenticação federada.
   */
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    setIsLoggingIn(true);
    setError(null);

    try {
      const result = await signInWithPopup(auth, provider);
      
      // Validação Silenciosa de Permissão de Servidor
      await syncUserPermissionsOnLogin(result.user.uid, result.user.email);
      
      return result.user;
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Erro no Login Google:", error);
      setError(error.message || "Erro inesperado no login.");
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  /**
   * Logout
   * Encerra a sessão no Firebase Client.
   */
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Erro no Logout:", error);
      setError(error.message || "Erro inesperado ao sair.");
      throw error;
    }
  };

  return {
    user,
    loading,
    error,
    isLoggingIn,
    isAdmin,
    signInWithGoogle,
    signOut,
  };
}
