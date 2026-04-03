import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * BPlen HUB — Transactional Utilities (Blindagem)
 * Gerenciamento atômico de sequências e contadores globais.
 */

/**
 * Obtém o próximo número de sequência para usuários.
 * Usa Firestore Transactions para evitar condições de corrida (Race Conditions).
 */
export async function getNextUserSequence(): Promise<number> {
  const counterRef = doc(db, "_internal", "counters", "user", "global");

  try {
    return await runTransaction(db, async (transaction) => {
      const counterSnap = await transaction.get(counterRef);
      
      let nextCount = 1;

      if (counterSnap.exists()) {
        const currentCount = counterSnap.data().count || 0;
        nextCount = currentCount + 1;
        transaction.update(counterRef, { 
          count: nextCount,
          lastUpdated: serverTimestamp() 
        });
      } else {
        // Se não existir, inicializa o contador global
        transaction.set(counterRef, { 
          count: 1,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp() 
        });
        nextCount = 1;
      }

      return nextCount;
    });
  } catch (error) {
    console.error("Erro ao gerar sequência atômica (getNextUserSequence):", error);
    throw new Error("Falha ao gerar identificador único de usuário.");
  }
}
