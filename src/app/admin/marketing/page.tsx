"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getAdminCouponsList, saveCouponAction } from "@/actions/coupons";
import { Coupon } from "@/types/marketing";
import { 
  Plus, 
  Trash2, 
  Ticket, 
  Search, 
  Calendar, 
  Hash, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Settings2,
  Lock,
  Percent
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MarketingAdminPage() {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Partial<Coupon> | null>(null);
  const [search, setSearch] = useState("");

  const fetchCoupons = async () => {
    if (!user) return;
    const token = await user.getIdToken();
    const result = await getAdminCouponsList(token);
    if (result.success && result.data) {
      setCoupons(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, [user]);

  const handleCreateNew = () => {
    setSelectedCoupon({
      code: "",
      type: "percentage",
      value: 0,
      active: true,
      usageCount: 0,
      usageLimit: 0
    });
    setIsEditorOpen(true);
  };

  const handleSave = async () => {
    if (!selectedCoupon || !user) return;
    const token = await user.getIdToken();
    const result = await saveCouponAction(selectedCoupon, token);
    if (result.success) {
      setIsEditorOpen(false);
      fetchCoupons();
    } else {
      alert("Erro ao salvar cupom: " + result.error);
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 p-10 max-w-7xl mx-auto">
      
      {/* Header Interativo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
           <div className="flex items-center gap-3">
              <div className="p-3 bg-pink-500/10 text-pink-500 rounded-2xl shadow-inner">
                 <Ticket size={24} />
              </div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">Motor de <span className="opacity-40">Marketing</span></h1>
           </div>
           <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <Lock size={12} /> Gestão de Cupons & Ofertas Estratégicas
           </p>
        </div>

        <button 
          onClick={handleCreateNew}
          className="px-8 py-4 bg-white text-black rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:scale-[1.05] shadow-2xl transition-all flex items-center gap-3"
        >
          <Plus size={16} /> Criar Novo Cupom
        </button>
      </div>

      {/* Grid de Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <MetricCard icon={<Hash size={18} />} label="Cupons Ativos" value={coupons.filter(c => c.active).length} />
         <MetricCard icon={<Percent size={18} />} label="Total de Resgates" value={coupons.reduce((acc, c) => acc + (c.usageCount || 0), 0)} />
         <MetricCard icon={<Clock size={18} />} label="Expirando em Breve" value={coupons.filter(c => c.expiryDate && new Date(c.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length} />
      </div>

      {/* Busca e Tabela */}
      <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-xl">
         <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-white/[0.02]">
            <Search size={18} className="text-gray-500" />
            <input 
               type="text" 
               placeholder="Buscar por código (ex: BPLEN20)..."
               className="bg-transparent outline-none text-xs font-black uppercase tracking-widest w-full text-white placeholder:text-gray-700" 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
            />
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                     <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-gray-500">Cupom</th>
                     <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-gray-500">Tipo / Valor</th>
                     <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-gray-500">Uso</th>
                     <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-gray-500">Status</th>
                     <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-gray-500 text-right">Ações</th>
                  </tr>
               </thead>
               <tbody>
                  {filteredCoupons.map((coupon) => (
                     <tr key={coupon.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 font-black text-xs">
                                 {coupon.code.slice(0, 2)}
                              </div>
                              <span className="font-black text-xs tracking-tighter uppercase">{coupon.code}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest">
                              {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `R$ ${coupon.value} OFF`}
                           </span>
                        </td>
                        <td className="px-8 py-6">
                           <div className="space-y-1">
                              <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                 <div 
                                    className="h-full bg-pink-500" 
                                    style={{ width: `${Math.min(100, (coupon.usageCount / (coupon.usageLimit || 1)) * 100)}%` }} 
                                 />
                              </div>
                              <p className="text-[8px] font-bold text-gray-500">{coupon.usageCount} / {coupon.usageLimit || '∞'}</p>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           {coupon.active ? (
                              <div className="flex items-center gap-2 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                                 <CheckCircle2 size={12} /> Ativo
                              </div>
                           ) : (
                              <div className="flex items-center gap-2 text-gray-500 text-[9px] font-black uppercase tracking-widest">
                                 <AlertCircle size={12} /> Inativo
                              </div>
                           )}
                        </td>
                        <td className="px-8 py-6 text-right">
                           <button 
                             onClick={() => { setSelectedCoupon(coupon); setIsEditorOpen(true); }}
                             className="p-3 hover:bg-white/10 rounded-2xl transition-all"
                           >
                              <Settings2 size={16} />
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Modal do Editor (Bento Style) */}
      <AnimatePresence>
         {isEditorOpen && selectedCoupon && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-black border border-white/20 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(255,192,203,0.1)] p-10 space-y-10"
               >
                  <div className="flex justify-between items-center">
                     <h2 className="text-xl font-black uppercase italic tracking-tighter">Configuração de <span className="text-pink-500">Oferta</span></h2>
                     <button onClick={() => setIsEditorOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                        <Plus size={20} className="rotate-45" />
                     </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Código do Cupom</label>
                        <input 
                           type="text" 
                           className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 text-sm font-black uppercase outline-none focus:border-pink-500 transition-all tracking-widest"
                           value={selectedCoupon.code}
                           onChange={(e) => setSelectedCoupon({...selectedCoupon, code: e.target.value})}
                        />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Tipo de Desconto</label>
                        <select 
                           className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 text-sm font-black outline-none focus:border-pink-500 appearance-none text-white px-8"
                           value={selectedCoupon.type}
                           onChange={(e) => setSelectedCoupon({...selectedCoupon, type: e.target.value as any})}
                        >
                           <option value="percentage">Porcentagem (%)</option>
                           <option value="fixed">Valor Fixo (R$)</option>
                        </select>
                     </div>
                     <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Valor do Desconto</label>
                        <input 
                           type="number" 
                           className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 text-sm font-black outline-none"
                           value={selectedCoupon.value}
                           onChange={(e) => setSelectedCoupon({...selectedCoupon, value: parseFloat(e.target.value)})}
                        />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Limite de Uso (0 = ∞)</label>
                        <input 
                           type="number" 
                           className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 text-sm font-black outline-none"
                           value={selectedCoupon.usageLimit}
                           onChange={(e) => setSelectedCoupon({...selectedCoupon, usageLimit: parseInt(e.target.value)})}
                        />
                     </div>
                  </div>

                  <div className="flex items-center gap-6 pt-6 border-t border-white/10">
                     <button 
                       onClick={() => setSelectedCoupon({...selectedCoupon, active: !selectedCoupon.active})}
                       className={`flex-1 p-5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedCoupon.active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-white/5 text-gray-500 border border-white/10 font-bold'}`}
                     >
                        Status: {selectedCoupon.active ? "Ativado" : "Desativado"}
                     </button>
                     <button 
                       onClick={handleSave}
                       className="flex-[2] p-5 bg-pink-500 hover:bg-pink-600 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white shadow-xl hover:scale-[1.02] transition-all"
                     >
                        Confirmar e Salvar Configurações
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
   return (
      <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-between group hover:border-pink-500/30 transition-all">
         <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">{label}</p>
            <p className="text-4xl font-black tracking-tighter italic">{value}</p>
         </div>
         <div className="p-4 bg-white/5 rounded-2xl text-gray-400 group-hover:text-pink-500 transition-colors">
            {icon}
         </div>
      </div>
   );
}
