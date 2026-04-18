"use client";

import React, { useState, useEffect } from "react";
import { PaymentBrick } from "./PaymentBrick";
import { createPreferenceAction } from "@/actions/mp-checkout";
import { useAuthContext } from "@/context/AuthContext";
import { ShoppingBag, ShieldCheck, Zap, Info, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CheckoutFlowProps {
  product: {
    id: string;
    title: string;
    price: number;
    slug: string;
    description: string;
  };
}

export function CheckoutFlow({ product }: CheckoutFlowProps) {
  const { user } = useAuthContext();
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleInitCheckout() {
    setLoading(true);
    setError(null);
    try {
      if (!user) throw new Error("Usuário não autenticado.");
      
      const idToken = await user.getIdToken();
      const result = await createPreferenceAction(product.slug, idToken);

      if (result.success && result.preferenceId) {
        setPreferenceId(result.preferenceId);
      } else {
        setError(result.error || "Falha ao iniciar checkout.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Iniciamos a preferência automaticamente ao carregar a página
  useEffect(() => {
    handleInitCheckout();
  }, [product.slug]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      
      {/* 🧾 LADO ESQUERDO: RESUMO DO PEDIDO */}
      <div className="lg:col-span-5 space-y-8">
        <div className="p-8 rounded-[3rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl space-y-8">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent-start/10 flex items-center justify-center text-accent-start shadow-xl">
                 <ShoppingBag size={28} />
              </div>
              <div className="space-y-0.5">
                 <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">Checkout</h2>
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Resumo da contratação</p>
              </div>
           </div>

           <div className="space-y-6 pt-6 border-t border-white/10">
              <div className="flex justify-between items-start">
                 <div className="space-y-1">
                    <h3 className="font-bold text-white text-lg">{product.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed max-w-[250px]">{product.description}</p>
                 </div>
                 <div className="text-right">
                    <span className="text-sm font-black text-accent-start">R$ {product.price.toFixed(2)}</span>
                 </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <span>Subtotal</span>
                    <span>R$ {product.price.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                    <span>Desconto</span>
                    <span>- R$ 0,00</span>
                 </div>
                 <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-white">Total</span>
                    <span className="text-xl font-black text-white italic">R$ {product.price.toFixed(2)}</span>
                 </div>
              </div>
           </div>

           <div className="space-y-4">
              <div className="flex items-center gap-3 text-emerald-400">
                 <ShieldCheck size={16} />
                 <span className="text-[9px] font-black uppercase tracking-widest">Pagamento 100% Seguro</span>
              </div>
              <div className="flex items-center gap-3 text-accent-start">
                 <Zap size={16} />
                 <span className="text-[9px] font-black uppercase tracking-widest">Ativação Instantânea via Pix</span>
              </div>
           </div>
        </div>

        <div className="p-6 rounded-[2rem] bg-blue-500/5 border border-blue-500/10 flex gap-4 items-start">
           <Info size={20} className="text-blue-400 shrink-0" />
           <p className="text-[10px] text-blue-300 leading-relaxed font-medium">
              Sua nota fiscal e os detalhes da jornada serão enviados para o seu e-mail cadastrado após a confirmação do pagamento.
           </p>
        </div>
      </div>

      {/* 💳 LADO DIREITO: INTERFACE DE PAGAMENTO */}
      <div className="lg:col-span-7">
        <div className="p-1 rounded-[3rem] bg-gradient-to-b from-white/10 to-transparent">
           <div className="bg-[#121212] rounded-[2.9rem] p-6 md:p-10 min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
              
              <AnimatePresence mode="wait">
                 {loading ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-6 text-center"
                    >
                       <Loader2 size={40} className="text-accent-start animate-spin" />
                       <div className="space-y-2">
                          <h4 className="text-sm font-bold text-white uppercase tracking-widest">Iniciando Checkout Seguro</h4>
                          <p className="text-[10px] text-gray-500 font-medium">Conectando com Mercado Pago...</p>
                       </div>
                    </motion.div>
                 ) : error ? (
                    <motion.div 
                      key="error"
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      className="text-center space-y-6"
                    >
                       <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto">
                          <ShieldCheck size={32} />
                       </div>
                       <div className="space-y-2">
                          <h4 className="text-lg font-bold text-white">Ops! Algo deu errado</h4>
                          <p className="text-xs text-gray-500">{error}</p>
                       </div>
                       <button 
                         onClick={handleInitCheckout}
                         className="px-8 py-3 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                       >
                          Tentar Novamente
                       </button>
                    </motion.div>
                 ) : preferenceId ? (
                    <motion.div 
                      key="brick"
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      className="w-full"
                    >
                       <PaymentBrick 
                         preferenceId={preferenceId} 
                         amount={product.price} 
                       />
                    </motion.div>
                 ) : null}
              </AnimatePresence>

              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-start/5 blur-[100px] -z-10" />
           </div>
        </div>
      </div>

    </div>
  );
}
