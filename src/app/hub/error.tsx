"use client";

/**
 * BPlen HUB — Error Boundary (Hub) 🛡️
 * Captura erros de runtime e exibe fallback visual premium
 * em vez de tela branca. Padrão Next.js App Router.
 */

export default function HubError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="max-w-md space-y-6">
        {/* Ícone de Erro */}
        <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>

        {/* Mensagem */}
        <div className="space-y-2">
          <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-widest">
            Algo saiu do esperado
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Encontramos um problema ao carregar esta seção.
            Tente novamente ou retorne à página inicial.
          </p>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-[var(--accent-start)] text-white hover:opacity-90 transition-all shadow-lg"
          >
            Tentar Novamente
          </button>
          <a
            href="/hub"
            className="px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest border border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] transition-all"
          >
            Voltar ao Hub
          </a>
        </div>

        {/* Detalhes técnicos (dev only) */}
        {process.env.NODE_ENV === "development" && (
          <details className="mt-6 text-left">
            <summary className="text-[10px] text-[var(--text-muted)] cursor-pointer uppercase tracking-widest">
              Detalhes Técnicos
            </summary>
            <pre className="mt-2 p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-[11px] text-red-400 overflow-auto max-h-40">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}
      </div>
    </main>
  );
}
