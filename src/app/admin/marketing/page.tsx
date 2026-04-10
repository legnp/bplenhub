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
import GlassModal from "@/components/ui/GlassModal";

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
    <div className="space-y-8 animate-fade-in">
      
      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="space-y-1 text-left">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            CUPONS E <span className="text-[var(--accent-start)] italic">OFERTAS</span>
          </h1>
          <p className="text-[var(--text-muted)] text-sm font-medium opacity-70">
            Gestão de cupons e ofertas.
          </p>
        </div>

        <button 
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-tr from-[var(--accent-start)] to-[var(--accent-end)] rounded-2xl font-bold text-[10px] uppercase tracking-widest text-white transition-all shadow-lg hover:translate-y-[-2px] active:scale-[0.98] shadow-[var(--accent-start)]/20"
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

      {/* Busca e Tabela (Glass Style) */}
      <div className="bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-[2.5rem] overflow-hidden shadow-sm">
         <div className="p-5 border-b border-[var(--border-primary)] flex items-center gap-4 bg-[var(--accent-soft)]/20">
            <Search size={16} className="text-[var(--text-muted)] opacity-40" />
            <input 
               type="text" 
               placeholder="Buscar por código (ex: BPLEN20)..."
               className="bg-transparent outline-none text-xs font-bold uppercase tracking-widest w-full text-[var(--text-primary)] placeholder:text-[var(--text-muted)] placeholder:opacity-40" 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
            />
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/40">
                     <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] opacity-40">Cupom</th>
                     <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] opacity-40">Tipo / Valor</th>
                     <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] opacity-40">Uso</th>
                     <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] opacity-40">Status</th>
                     <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] opacity-40 text-right">Ações</th>
                  </tr>
               </thead>
               <tbody>
                  {filteredCoupons.map((coupon) => (
                     <tr key={coupon.id} className="border-b border-[var(--border-primary)] hover:bg-[var(--accent-soft)] transition-colors group">
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-[var(--accent-start)]/5 flex items-center justify-center text-[var(--accent-start)] font-bold text-xs border border-[var(--accent-start)]/10">
                                 {coupon.code.slice(0, 2)}
                              </div>
                              <span className="font-bold text-xs tracking-tight uppercase text-[var(--text-primary)]">{coupon.code}</span>
                           </div>
                        </td>
                        <td className="px-8 py-5">
                           <span className="px-3 py-1 bg-[var(--accent-soft)] rounded-full text-[9px] font-bold uppercase tracking-widest text-[var(--accent-start)]">
                              {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `R$ ${coupon.value} OFF`}
                           </span>
                        </td>
                        <td className="px-8 py-5">
                           <div className="space-y-1">
                              <div className="w-24 h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-primary)]">
                                 <div 
                                    className="h-full bg-[var(--accent-start)]" 
                                    style={{ width: `${Math.min(100, (coupon.usageCount / (coupon.usageLimit || 1)) * 100)}%` }} 
                                 />
                              </div>
                              <p className="text-[8px] font-bold text-[var(--text-muted)] opacity-60">{coupon.usageCount} / {coupon.usageLimit || '∞'}</p>
                           </div>
                        </td>
                        <td className="px-8 py-5">
                           {coupon.active ? (
                              <div className="flex items-center gap-2 text-emerald-500 text-[9px] font-bold uppercase tracking-widest">
                                 <CheckCircle2 size={12} /> Ativo
                              </div>
                           ) : (
                              <div className="flex items-center gap-2 text-[var(--text-muted)] opacity-40 text-[9px] font-bold uppercase tracking-widest">
                                 <AlertCircle size={12} /> Inativo
                              </div>
                           )}
                        </td>
                        <td className="px-8 py-5 text-right">
                           <button 
                             onClick={() => { setSelectedCoupon(coupon); setIsEditorOpen(true); }}
                             className="p-3 hover:bg-[var(--accent-soft)] rounded-2xl text-[var(--text-muted)] hover:text-[var(--accent-start)] transition-all"
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

      {/* Editor de Cupons (Glassmorphism 3.1) */}
      <GlassModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title="Configuração de Oferta"
        subtitle="Gerencie os parâmetros estratégicos do cupom de desconto."
      >
        {selectedCoupon && (
          <div className="space-y-8 p-2 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] opacity-40">Código do Cupom</label>
                  <input 
                     type="text" 
                     className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl p-4.5 text-sm font-bold uppercase outline-none focus:border-[var(--accent-start)] transition-all tracking-widest text-[var(--text-primary)]"
                     value={selectedCoupon.code}
                     onChange={(e) => setSelectedCoupon({...selectedCoupon, code: e.target.value})}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] opacity-40">Tipo de Desconto</label>
                  <select 
                     className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl p-4.5 text-sm font-bold outline-none focus:border-[var(--accent-start)] appearance-none text-[var(--text-primary)] px-6"
                     value={selectedCoupon.type}
                     onChange={(e) => setSelectedCoupon({...selectedCoupon, type: e.target.value as any})}
                  >
                     <option value="percentage">Porcentagem (%)</option>
                     <option value="fixed">Valor Fixo (R$)</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] opacity-40">Valor do Desconto</label>
                  <input 
                     type="number" 
                     className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl p-4.5 text-sm font-bold outline-none text-[var(--text-primary)]"
                     value={selectedCoupon.value}
                     onChange={(e) => setSelectedCoupon({...selectedCoupon, value: parseFloat(e.target.value)})}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] opacity-40">Limite de Uso (0 = ∞)</label>
                  <input 
                     type="number" 
                     className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl p-4.5 text-sm font-bold outline-none text-[var(--text-primary)]"
                     value={selectedCoupon.usageLimit}
                     onChange={(e) => setSelectedCoupon({...selectedCoupon, usageLimit: parseInt(e.target.value)})}
                  />
               </div>
            </div>

            <div className="flex items-center gap-4 pt-6 border-t border-[var(--border-primary)]">
               <button 
                 onClick={() => setSelectedCoupon({...selectedCoupon, active: !selectedCoupon.active})}
                 className={`flex-1 p-4.5 rounded-2xl text-[9px] font-bold uppercase tracking-widest transition-all ${selectedCoupon.active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-[var(--input-bg)] text-[var(--text-muted)] border border-[var(--border-primary)] font-bold'}`}
               >
                  Status: {selectedCoupon.active ? "Ativado" : "Desativado"}
               </button>
               <button 
                 onClick={handleSave}
                 className="flex-[2] p-4.5 bg-gradient-to-tr from-[var(--accent-start)] to-[var(--accent-end)] rounded-2xl text-[9px] font-bold uppercase tracking-widest text-white shadow-xl hover:translate-y-[-2px] active:scale-[0.98] transition-all"
               >
                  Salvar Configurações
               </button>
            </div>
          </div>
        )}
      </GlassModal>

    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
   return (
      <div className="p-6 bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-[2rem] flex items-center justify-between group hover:border-[var(--accent-start)]/30 transition-all shadow-sm">
         <div className="space-y-1">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] opacity-40">{label}</p>
            <p className="text-3xl font-bold text-[var(--text-primary)]">{value}</p>
         </div>
         <div className="p-3 bg-[var(--accent-start)]/5 rounded-2xl text-[var(--text-muted)] group-hover:text-[var(--accent-start)] transition-colors">
            {icon}
         </div>
      </div>
   );
}
