/**
 * BPlen HUB — Firestore Serialization Utilities 🧬
 * Utilitários para converter objetos complexos do Firestore (como Timestamp)
 * em tipos primitivos aceitos por Client Components do Next.js.
 */

/**
 * Converte recursivamente um objeto contendo Timestamps em um objeto com strings ISO.
 * Protege a fronteira de Serialização entre Server e Client Components.
 */
export function safeSerialize<T = any>(data: any): T {
  if (!data) return data;

  // Se for um Timestamp do Firestore Admin
  if (data && typeof data === 'object' && '_seconds' in data && '_nanoseconds' in data) {
    try {
      // Usamos a duck-typing para detectar o Timestamp e converter
      // O método toDate() é injetado pelo Admin SDK no objeto retornado
      if (typeof (data as any).toDate === 'function') {
        return (data as any).toDate().toISOString() as any;
      }
      // Fallback manual se o toDate não estiver disponível (raro no Admin)
      return new Date(data._seconds * 1000).toISOString() as any;
    } catch (e) {
      return null as any;
    }
  }

  // Se for Array, processa cada item
  if (Array.isArray(data)) {
    return data.map(item => safeSerialize(item)) as any;
  }

  // Se for Objeto, processa cada chave recursivamente
  if (typeof data === 'object' && data !== null) {
    const result: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = safeSerialize(data[key]);
      }
    }
    return result as T;
  }

  return data;
}
