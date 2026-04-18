import React from "react";
import { getCheckoutProductAction } from "@/actions/mp-checkout";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

/**
 * BPlen HUB — Página Mestra de Checkout (💳 Soberania de Dados)
 * Rota dinâmica que gera checkouts baseados em produtos do Firestore.
 */

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Obter o token de sessão para validação (Soberania 🛡️)
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("bplen_session")?.value || "";

  // Recupera dados do serviço de forma segura no servidor
  const result = await getCheckoutProductAction(slug, sessionToken);

  if (!result.success || !result.data) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
         <div className="w-20 h-20 rounded-[2.5rem] bg-red-500/10 flex items-center justify-center text-red-500 shadow-2xl">
            <AlertCircle size={40} />
         </div>
         <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight uppercase italic text-red-500">Serviço Indisponível</h2>
            <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto leading-relaxed">
               {result.error || "O serviço solicitado não pôde ser carregado. Verifique o link ou tente novamente."}
            </p>
         </div>
         <Link 
            href="/hub/servicos" 
            className="px-8 py-4 bg-white text-black rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3"
         >
            <ArrowLeft size={16} /> Ver Catálogo de Serviços
         </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
      
      {/* HEADER DE NAVEGAÇÃO */}
      <div className="flex items-center justify-between">
         <Link 
           href={`/hub/servicos/${slug}`} 
           className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors flex items-center gap-2 group"
         >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
            Voltar para detalhes
         </Link>
         <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-400">
            Ambiente Seguro BPlen
         </div>
      </div>

      {/* CORE: FLOW DE CHECKOUT */}
      <CheckoutFlow product={result.data} />

    </div>
  );
}
