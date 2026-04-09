"use client";

import React, { useState, useEffect } from "react";
import { getAdminProducts } from "@/actions/products";
import { Product } from "@/types/products";
// ... (outros imports omitidos)
import { 
  Plus, 
  Package, 
  Settings, 
  Users, 
  TrendingUp, 
  Search,
  ExternalLink,
  MoreVertical,
  Layout,
  CheckCircle2,
  Clock,
  Database
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { seedInitialProductsAction } from "@/actions/seed-products";

/**
 * Admin Product Dashboard — BPlen HUB 🧬
 * Gestão centralizada do ecossistema de serviços e produtos.
 */
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function load() {
      const data = await getAdminProducts();
      setProducts(data);
      setLoading(false);
    }
    load();
  }, []);

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 md:p-12 space-y-12 animate-fade-in pb-24">
      
      {/* Header Estratégico */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 text-[var(--accent-primary)]">
            <Package size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Ecossistema BPlen</span>
          </div>
          <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tighter">
            Gestão de <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]">Produtos & Serviços</span>
          </h1>
          <div className="flex items-center gap-4 mt-2">
             <p className="text-[var(--text-secondary)] text-xs max-w-sm leading-relaxed opacity-70">
               Configure fichas técnicas, workflows de jornada e controle o acesso granular de cada oferta do HUB.
             </p>
             <button 
               onClick={async () => {
                 if (confirm("Deseja semear os produtos iniciais (Onboarding e DISC)?")) {
                   await seedInitialProductsAction();
                   window.location.reload();
                 }
               }}
               className="flex items-center gap-2 px-3 py-1.5 bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/20 rounded-lg text-7 opacity-40 hover:opacity-100 transition-all text-[8px] font-black uppercase tracking-widest text-[var(--accent-primary)]"
             >
                <Database size={10} />
                Seed Initial Data
             </button>
          </div>
        </div>

        <Link 
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] shadow-xl transition-all"
        >
          <Plus size={16} />
          Criar Novo Produto
        </Link>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Produtos Ativos" 
          value={products.length.toString()} 
          icon={<Layout size={20} />} 
          color="blue"
        />
        <StatCard 
          label="Acessos Liberados" 
          value="--" // Em breve vinculado ao entitlements
          icon={<Users size={20} />} 
          color="green"
        />
        <StatCard 
          label="Taxa de Conclusão" 
          value="--" 
          icon={<TrendingUp size={20} />} 
          color="purple"
        />
      </div>

      {/* Tabela de Produtos */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">Portfólio de Serviços</h2>
          <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
             <input 
               type="text" 
               placeholder="Buscar produto..."
               className="pl-12 pr-6 py-3 bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-full text-[10px] focus:ring-2 focus:ring-[var(--accent-primary)] outline-none min-w-[300px]"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-primary)] rounded-[3rem] opacity-30 gap-4">
            <div className="w-6 h-6 border-2 border-t-[var(--accent-primary)] border-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest">Sincronizando Ecossistema...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-primary)] rounded-[3rem] text-center px-12">
             <Package size={32} className="text-[var(--text-muted)] opacity-20 mb-4" />
             <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map((product) => (
              <ProductItem key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="p-8 bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-[2.5rem] flex items-center justify-between group hover:border-[var(--accent-primary)]/30 transition-all">
      <div className="space-y-1">
        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">{label}</p>
        <p className="text-3xl font-black text-[var(--text-primary)] tracking-tighter">{value}</p>
      </div>
      <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] transition-colors">
        {icon}
      </div>
    </div>
  );
}

function ProductItem({ product }: { product: Product }) {
  return (
    <div className="p-6 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[2rem] flex items-center justify-between group hover:shadow-xl hover:shadow-black/5 transition-all">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-[var(--input-bg)] overflow-hidden border border-[var(--border-primary)] flex items-center justify-center relative bg-cover bg-center" style={{ backgroundImage: `url(${product.sheet.coverImage})` }}>
           {!product.sheet.coverImage && <Package className="text-[var(--text-muted)] opacity-20" />}
           <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest">{product.title}</h3>
            {product.isStepJourney && (
              <span className="px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-[7px] font-black uppercase tracking-widest">
                Journey Step #{product.order}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-tight">
            <span className="flex items-center gap-1.5"><Clock size={12} /> {product.status}</span>
            <span className="flex items-center gap-1.5 italic opacity-60">/{product.slug}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link 
          href={`/admin/products/${product.id}`}
          className="p-3 rounded-xl border border-[var(--border-primary)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/30 transition-all"
        >
          <Settings size={16} />
        </Link>
        <Link 
          href={`/servicos/${product.slug}`}
          target="_blank"
          className="p-3 rounded-xl border border-[var(--border-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
        >
          <ExternalLink size={16} />
        </Link>
        <button className="p-3 rounded-xl border border-[var(--border-primary)] text-[var(--text-muted)]">
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
}
