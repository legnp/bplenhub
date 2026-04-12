/**
 * BPlen Landing Page Design Tokens
 * Centraliza as classes de padronização para facilitar ajustes globais.
 */

export const LANDING_TOKENS = {
  // Configuração Geral de Seção — Fundo transparente e divisores com fade
  section: "relative w-full py-[70px] px-6 before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-[60%] before:h-px before:bg-gradient-to-r before:from-transparent before:via-[var(--border-primary)] before:to-transparent after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-[60%] after:h-px after:bg-gradient-to-r after:from-transparent after:via-[var(--border-primary)] after:to-transparent",
  container: "max-w-6xl mx-auto",
  
  // Cabeçalho de Seção (Header)
  header: {
    centered: "text-center mb-5",
    left: "text-left mb-5 flex flex-col gap-6",
    kicker: "text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--accent-start)] block mb-4",
    title: "text-3xl md:text-5xl font-bold tracking-tighter leading-[1.1] text-[var(--text-primary)]",
    description: "text-base md:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl",
    descriptionCentered: "text-base md:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto",
  },

  // Cards de Vidro (Glass Cards)
  card: {
    container: "p-8 md:p-10 rounded-3xl bg-[var(--input-bg)] border border-[var(--input-border)] backdrop-blur-md hover:bg-[var(--accent-soft)] hover:border-[var(--accent-start)] transition-all duration-500",
    title: "text-xl md:text-2xl font-bold mb-3 leading-tight text-[var(--text-primary)]",
    description: "text-sm md:text-base text-[var(--text-secondary)] leading-relaxed",
    kicker: "text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--text-muted)] mb-2",
  }
};
