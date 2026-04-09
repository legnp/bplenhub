"use client";

import React from "react";
import { AdminProductBuilder } from "@/components/admin/AdminProductBuilder";
import { ArrowLeft, Package } from "lucide-react";
import Link from "next/link";

/**
 * New Product Page — BPlen HUB 🧬
 * Ponto de entrada para criação de novos produtos no ecossistema.
 */
export default function NewProductPage() {
  return (
    <div className="p-8 md:p-12 space-y-12 animate-fade-in pb-24 max-w-6xl mx-auto">
      
      {/* Breadcrumbs / Back */}
      <header className="space-y-6">
        <Link 
          href="/admin/products"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Voltar para Lista de Produtos
        </Link>
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center shadow-xl">
              <Package size={24} />
           </div>
           <div>
              <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter">Novo Produto</h1>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1 opacity-60 italic">Definição de ecossistema e entrega estratégica</p>
           </div>
        </div>
      </header>

      {/* Builder Component */}
      <AdminProductBuilder />

    </div>
  );
}
