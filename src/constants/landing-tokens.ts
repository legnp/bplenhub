/**
 * BPlen Landing Page Design Tokens
 * Centraliza as classes de padronização para facilitar ajustes globais.
 */

export const LANDING_TOKENS = {
  // Configuração Geral de Seção — Fundo transparente e divisores com fade
  section: "relative w-full py-[70px] px-6 before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-[60%] before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-[60%] after:h-px after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent",
  container: "max-w-6xl mx-auto",
  
  // Cabeçalho de Seção (Header)
  header: {
    centered: "text-center mb-16",
    left: "text-left mb-16 flex flex-col gap-6",
    kicker: "text-[10px] font-bold tracking-[0.2em] uppercase text-[#ff0080] block mb-4",
    title: "text-3xl md:text-5xl font-bold tracking-tighter leading-[1.1]",
    description: "text-base md:text-lg text-gray-400 leading-relaxed max-w-2xl",
    descriptionCentered: "text-base md:text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto",
  },

  // Cards de Vidro (Glass Cards)
  card: {
    container: "p-8 md:p-10 rounded-3xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-md hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-500",
    title: "text-xl md:text-2xl font-bold mb-3 leading-tight",
    description: "text-sm md:text-base text-gray-400 leading-relaxed",
    kicker: "text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500 mb-2",
  }
};
