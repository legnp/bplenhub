"use client";

import { useState } from "react";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthContext } from "@/context/AuthContext";

/**
 * BPlen HUB — useAuth (Central de Comandos de Autenticação)
 * Hook unificado para realizar Login com Google e Logout.
 */

export function useAuth() {
  const { user, loading } = useAuthContext();
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
      return result.user;
    } catch (err: any) {
      console.error("Erro no Login Google:", err);
      setError(err.message || "Erro inesperado no login.");
      throw err;
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
    } catch (err: any) {
      console.error("Erro no Logout:", err);
      setError(err.message || "Erro inesperado ao sair.");
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    isLoggingIn,
    signInWithGoogle,
    signOut,
  };
}
