"use client";

import React, { useState } from "react";
import { Product, ProductSheet, CapabilityConfig, WorkflowStep } from "@/types/products";
import { 
  Save, 
  X, 
  Layout, 
  Settings, 
  Zap, 
  Compass, 
  Eye, 
  Plus, 
  Trash2, 
  HelpCircle, 
  Search,
  CheckCircle2,
  FileText
} from "lucide-react";
import { SURVEY_REGISTRY } from "@/config/surveys";
import { saveProductAction } from "@/actions/products";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface AdminProductBuilderProps {
  initialProduct?: Product;
}

/**
 * AdminProductBuilder — BPlen HUB 🧬
 * Componente modular para construção de produtos e workflows dinâmicos.
 */
export function AdminProductBuilder({ initialProduct }: AdminProductBuilderProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'identity' | 'sheet' | 'capabilities' | 'workflow'>('identity');
  const [isSaving, setIsSaving] = useState(false);

  // State unificado do Produto
  const [product, setProduct] = useState<Partial<Product>>(initialProduct || {
    title: "",
    slug: "",
    price: 0,
    category: 'people',
    status: 'draft',
    isStepJourney: false,
    order: 1,
    sheet: {
      description: "",
      coverImage: "",
      paymentConditions: "",
      faq: [],
      termsAndConditions: "",
      seo: { title: "", description: "", keywords: [] }
    },
    capabilities: { surveys: [], forms: [], allowedEventTypes: [] },
    workflow: []
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveProductAction(product);
      setIsSaved(true);
      // Pequeno delay para o usuário ver o feedback de sucesso
      setTimeout(() => {
        router.push("/admin/products");
      }, 1500);
    } catch (error) {
      alert("Erro ao salvar produto");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[3rem] overflow-hidden flex flex-col min-h-[700px] shadow-2xl relative">
      
      {/* Builder Header */}
      <div className="p-8 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-secondary)]/30">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-[var(--accent-primary)]/10 rounded-2xl text-[var(--accent-primary)]">
              <Zap size={20} />
           </div>
           <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">
                {product.id ? `Editando: ${product.title}` : "Novo Produto Estratégico"}
              </h2>
              <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mt-1">Configuração de Ecossistema & Entrega</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={() => router.back()}
             className="px-6 py-2.5 rounded-xl border border-[var(--border-primary)] text-[9px] font-black uppercase tracking-widest hover:bg-[var(--input-bg)] transition-all"
           >
             Descartar
           </button>
           <button 
             onClick={handleSave}
             disabled={isSaving || isSaved}
             className={`px-8 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all ${isSaved ? 'bg-green-500 text-white' : 'bg-[var(--text-primary)] text-[var(--bg-primary)]'}`}
           >
             {isSaving ? (
               <Plus className="animate-spin w-3 h-3" />
             ) : isSaved ? (
               <CheckCircle2 size={14} />
             ) : (
               <Save size={14} />
             )}
             {isSaved ? "Sucesso!" : "Salvar Alterações"}
           </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]/10">
        <TabButton active={activeTab === 'identity'} onClick={() => setActiveTab('identity')} label="Identidade" icon={<Settings size={14} />} />
        <TabButton active={activeTab === 'sheet'} onClick={() => setActiveTab('sheet')} label="Ficha Técnica" icon={<FileText size={14} />} />
        <TabButton active={activeTab === 'capabilities'} onClick={() => setActiveTab('capabilities')} label="Funcionalidades" icon={<Zap size={14} />} />
        <TabButton active={activeTab === 'workflow'} onClick={() => setActiveTab('workflow')} label="Jornada/Workflow" icon={<Compass size={14} />} />
      </div>

      {/* Form Area */}
      <div className="flex-1 p-10 overflow-y-auto max-h-[600px] custom-scrollbar">
        <AnimatePresence mode="wait">
           {activeTab === 'identity' && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                 <IdentityForm product={product} setProduct={setProduct} />
              </motion.div>
           )}
           {activeTab === 'sheet' && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                 <SheetForm product={product} setProduct={setProduct} />
              </motion.div>
           )}
           {activeTab === 'capabilities' && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                 <CapabilitiesForm product={product} setProduct={setProduct} />
              </motion.div>
           )}
           {activeTab === 'workflow' && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                 <WorkflowForm product={product} setProduct={setProduct} />
              </motion.div>
           )}
        </AnimatePresence>
      </div>

    </div>
  );
}

// Helpers Components
function TabButton({ active, onClick, label, icon }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${active ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]' : 'border-transparent text-[var(--text-muted)] opacity-50 hover:opacity-100'}`}
    >
      {icon}
      {label}
    </button>
  );
}

// Sub-forms (Simplicados para a primeira versão)
function IdentityForm({ product, setProduct }: any) {
  return (
    <div className="space-y-8 max-w-2xl">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
           <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Título do Produto</label>
           <input 
             type="text" 
             className="w-full bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-2xl p-4 text-xs" 
             value={product.title}
             onChange={(e) => setProduct({...product, title: e.target.value})}
           />
        </div>
        <div className="space-y-2">
           <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Slug (URL)</label>
           <input 
             type="text" 
             className="w-full bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-2xl p-4 text-xs font-mono" 
             value={product.slug}
             onChange={(e) => setProduct({...product, slug: e.target.value})}
           />
        </div>
      </div>
      
      <div className="space-y-4 p-6 bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/20 rounded-2xl">
         <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={product.isStepJourney} 
              onChange={(e) => setProduct({...product, isStepJourney: e.target.checked})}
              className="w-5 h-5 rounded-lg accent-[var(--accent-primary)]"
            />
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest">Produto da Jornada (Step Journey)</p>
               <p className="text-[8px] text-[var(--text-muted)] italic">Marcar se este produto compõe a trilha principal do membro.</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function SheetForm({ product, setProduct }: any) {
   return (
     <div className="space-y-8 max-w-3xl">
       <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Descrição de Serviço</label>
          <textarea 
            rows={5}
            className="w-full bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-2xl p-6 text-xs leading-relaxed" 
            value={product.sheet.description}
            onChange={(e) => setProduct({...product, sheet: { ...product.sheet, description: e.target.value }})}
          />
       </div>
       {/* Adicionar mais campos conforme necessário */}
     </div>
   );
}

function CapabilitiesForm({ product, setProduct }: any) {
  return (
    <div className="space-y-8 max-w-4xl">
       <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)]">Vincular Pesquisas (Surveys)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
             {SURVEY_REGISTRY.map((survey) => {
               const isSelected = product.capabilities.surveys.includes(survey.id);
               return (
                 <button 
                   key={survey.id}
                   onClick={() => {
                     const scouts = isSelected 
                       ? product.capabilities.surveys.filter((id: string) => id !== survey.id)
                       : [...product.capabilities.surveys, survey.id];
                     setProduct({ ...product, capabilities: { ...product.capabilities, surveys: scouts } });
                   }}
                   className={`p-4 rounded-2xl border text-left transition-all ${isSelected ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10' : 'border-[var(--border-primary)] bg-[var(--bg-secondary)]/20 opacity-60'}`}
                 >
                    <p className="text-[9px] font-black uppercase tracking-widest">{survey.id}</p>
                    <p className="text-[8px] opacity-60 mt-1 line-clamp-1">{survey.title}</p>
                 </button>
               )
             })}
          </div>
       </div>
    </div>
  )
}

function WorkflowForm({ product, setProduct }: any) {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)]">Etapas de Workflow</h3>
          <button 
            onClick={() => {
               const newStep: WorkflowStep = { id: `step-${Date.now()}`, title: "Nova Etapa", type: 'task', description: "" };
               setProduct({ ...product, workflow: [...product.workflow, newStep] });
            }}
            className="px-4 py-2 bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-[var(--accent-primary)] transition-all"
          >
             Adicionar Etapa
          </button>
       </div>

       <div className="space-y-4">
          {product.workflow.map((step: WorkflowStep, idx: number) => (
             <div key={step.id} className="p-6 bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-2xl flex items-center gap-6">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-primary)] flex items-center justify-center text-[9px] font-black">{idx + 1}</div>
                <input 
                  type="text" 
                  value={step.title}
                  onChange={(e) => {
                     const newWorkflow = [...product.workflow];
                     newWorkflow[idx].title = e.target.value;
                     setProduct({ ...product, workflow: newWorkflow });
                  }}
                  className="bg-transparent border-b border-[var(--border-primary)] text-xs font-bold focus:border-[var(--accent-primary)] outline-none flex-1"
                />
                <button 
                  onClick={() => {
                     setProduct({ ...product, workflow: product.workflow.filter((sRef: any) => sRef.id !== step.id) });
                  }}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                >
                   <Trash2 size={16} />
                </button>
             </div>
          ))}
       </div>
    </div>
  )
}
