"use client";

/**
 * BPlen HUB — Error Boundary (Admin) 🛡️
 * Captura erros de runtime no painel administrativo
 * e exibe fallback visual com opção de retry.
 */

export default function AdminError({
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
        <div className="w-16 h-16 mx-auto rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        {/* Mensagem */}
        <div className="space-y-2">
          <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-widest">
            Erro no Painel Admin
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Ocorreu um erro ao processar esta operação administrativa.
            Verifique o console para mais detalhes.
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
            href="/admin"
            className="px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest border border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] transition-all"
          >
            Voltar ao Admin
          </a>
        </div>

        {/* Detalhes técnicos (sempre visível para admin) */}
        <details className="mt-6 text-left" open={process.env.NODE_ENV === "development"}>
          <summary className="text-[10px] text-[var(--text-muted)] cursor-pointer uppercase tracking-widest">
            Detalhes Técnicos
          </summary>
          <pre className="mt-2 p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl text-[11px] text-orange-400 overflow-auto max-h-40">
            {error.message}
            {error.digest && `\nDigest: ${error.digest}`}
          </pre>
        </details>
      </div>
    </main>
  );
}
