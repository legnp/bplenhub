/**
 * BPlen HUB — Firestore Serialization Utilities 🧬
 * Utilitários para converter objetos complexos do Firestore (como Timestamp)
 * em tipos primitivos aceitos por Client Components do Next.js.
 */

/**
 * Converte recursivamente um objeto contendo Timestamps em um objeto com strings ISO.
 * Protege a fronteira de Serialização entre Server e Client Components.
 */
export function safeSerialize<T>(data: unknown): T {
  if (data === null || data === undefined) return data as unknown as T;

  // Se for um Timestamp do Firestore Admin (Duck-typing)
  if (typeof data === 'object' && '_seconds' in data && '_nanoseconds' in data) {
    try {
      const d = data as { toDate?: () => Date; _seconds: number };
      if (typeof d.toDate === 'function') {
        return d.toDate().toISOString() as unknown as T;
      }
      return new Date(d._seconds * 1000).toISOString() as unknown as T;
    } catch (e) {
      return null as unknown as T;
    }
  }

  // Se for Array, processa cada item
  if (Array.isArray(data)) {
    return data.map(item => safeSerialize(item)) as unknown as T;
  }

  // Se for Objeto, processa cada chave recursivamente
  if (typeof data === 'object' && data !== null) {
    const result = {} as Record<string, unknown>;
    const obj = data as Record<string, unknown>;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = safeSerialize(obj[key]);
      }
    }
    return result as unknown as T;
  }

  return data as unknown as T;
}
