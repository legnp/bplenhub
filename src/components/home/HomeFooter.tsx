"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

/**
 * HomeFooter (Rodapé da Landing Page)
 * Design ultra-minimalista: Apenas texto discreto na base ("Sem formas visíveis").
 */
export function HomeFooter() {
  const { user, signInWithGoogle, isLoggingIn } = useAuth();
  const router = useRouter();

  return (
    <footer className="w-full border-t border-white/5 bg-black/30 backdrop-blur-xl pt-[10px] pb-6 px-6 mt-[10px]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
        
        {/* Bloco de Texto Principal e Legal (CNPJ) */}
        <div className="max-w-2xl text-[11px] leading-relaxed text-gray-500">
          <p className="mb-2">
            <strong className="text-gray-400 font-medium">BPlen</strong> é uma Consultoria de Negócios com Foco em Desenvolvimento Humano que utiliza método, dados e abordagens humanas holísticas para descomplicar o desenvolvimento humano no trabalho.
          </p>
          <p>
            Copyright © {new Date().getFullYear()} BPlen. Todos os direitos reservados. <br className="hidden md:block" />
            LENCINA ESTRATÉGIA E GESTÃO DE NEGÓCIOS E PESSOAS LTDA • CNPJ: 62.857.668/0001-07
          </p>
        </div>

        {/* Links Rápidos Discretos */}
        <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-[11px] font-medium text-gray-400 uppercase tracking-widest">
          {user ? (
            <Link href="/hub" className="hover:text-white transition-colors">BPlen HUB</Link>
          ) : (
            <button 
              onClick={async () => {
                try {
                  await signInWithGoogle();
                  router.push("/hub");
                } catch (err) {
                  console.error("Erro ao acessar HUB via Footer:", err);
                }
              }}
              disabled={isLoggingIn}
              className="hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? "Conectando..." : "BPlen HUB"}
            </button>
          )}
          <Link href="#" className="hover:text-white transition-colors">Privacidade</Link>
          <Link href="#" className="hover:text-white transition-colors">Termos</Link>
        </div>

      </div>
    </footer>
  );
}
