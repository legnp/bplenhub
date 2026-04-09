"use client";

import React, { useState, useEffect } from "react";
import { AdminProductBuilder } from "@/components/admin/AdminProductBuilder";
import { ArrowLeft, Package, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase"; // Usando cliente para busca rápida (Admin check assume-se passado)
import { doc, getDoc } from "firebase/firestore";
import { Product } from "@/types/products";

/**
 * Edit Product Page — BPlen HUB 🧬
 * Permite a edição de um produto existente.
 */
export default function EditProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!params.id) return;
      try {
        const docRef = doc(db, "products", params.id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        }
      } catch (error) {
        console.error("Erro ao carregar produto:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] opacity-30">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest">Sincronizando Ficha Técnica...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-12 text-center text-red-500">
         Produto não encontrado.
      </div>
    );
  }

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
           <div className="w-12 h-12 rounded-2xl bg-[var(--accent-primary)] text-white flex items-center justify-center shadow-xl">
              <Package size={24} />
           </div>
           <div>
              <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter">Editar Produto</h1>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1 opacity-60 italic">{product.title}</p>
           </div>
        </div>
      </header>

      {/* Builder Component */}
      <AdminProductBuilder initialProduct={product} />

    </div>
  );
}
