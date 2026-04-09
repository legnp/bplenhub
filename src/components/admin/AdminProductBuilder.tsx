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
  FileText,
  Users,
  Handshake
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
    targetAudiences: [],
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
    <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[3rem] overflow-hidden flex flex-col min-h-[700px] shadow-2xl relative text-[var(--text-primary)]">
      
      {/* Builder Header */}
      <div className="p-8 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-secondary)]/30">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-[var(--accent-primary)]/10 rounded-2xl text-[var(--accent-primary)]">
              <Zap size={20} />
           </div>
           <div>
              <h2 className="text-sm font-black uppercase tracking-widest">
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
              <motion.div key="identity" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                 <IdentityForm product={product} setProduct={setProduct} />
              </motion.div>
           )}
           {activeTab === 'sheet' && (
              <motion.div key="sheet" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                 <SheetForm product={product} setProduct={setProduct} />
              </motion.div>
           )}
           {activeTab === 'capabilities' && (
              <motion.div key="capabilities" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                 <CapabilitiesForm product={product} setProduct={setProduct} />
              </motion.div>
           )}
           {activeTab === 'workflow' && (
              <motion.div key="workflow" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
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

// Sub-forms
function IdentityForm({ product, setProduct }: any) {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
           <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Título do Produto</label>
              <input 
                type="text" 
                className="w-full bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-2xl p-4 text-xs outline-none focus:border-[var(--accent-primary)] transition-all" 
                value={product.title}
                onChange={(e) => setProduct({...product, title: e.target.value})}
              />
           </div>
           <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Slug (URL)</label>
              <input 
                type="text" 
                className="w-full bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-2xl p-4 text-xs font-mono outline-none focus:border-[var(--accent-primary)] transition-all" 
                value={product.slug}
                onChange={(e) => setProduct({...product, slug: e.target.value})}
              />
           </div>
        </div>

        <div className="space-y-6">
           <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Público-Alvo (Segmentação)</label>
           <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'people', label: 'Pessoas (Individual)', icon: <Users size={14} /> },
                { id: 'companies', label: 'Empresas (Corporativo)', icon: <Layout size={14} /> },
                { id: 'partners', label: 'Parceiros (Agências/Mestres)', icon: <Handshake size={14} /> }
              ].map((audience) => {
                const isSelected = product.targetAudiences?.includes(audience.id as any);
                return (
                  <button 
                    key={audience.id}
                    type="button"
                    onClick={() => {
                      const current = product.targetAudiences || [];
                      const next = isSelected 
                        ? current.filter((a: string) => a !== audience.id)
                        : [...current, audience.id];
                      setProduct({ ...product, targetAudiences: next });
                    }}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${isSelected ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5 text-[var(--text-primary)]' : 'border-[var(--border-primary)] opacity-40 hover:opacity-100 text-[var(--text-muted)]'}`}
                  >
                     {audience.icon}
                     <span className="text-[10px] font-black uppercase tracking-widest">{audience.label}</span>
                     {isSelected && <CheckCircle2 size={14} className="ml-auto text-[var(--accent-primary)]" />}
                  </button>
                )
              })}
           </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-6 items-start">
        <div className="space-y-4 p-6 bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/20 rounded-2xl flex-1 min-w-[300px]">
           <div className="flex items-center gap-3 cursor-pointer" onClick={() => setProduct({...product, isStepJourney: !product.isStepJourney})}>
              <div className={`w-10 h-6 rounded-full transition-all relative ${product.isStepJourney ? 'bg-[var(--accent-primary)]' : 'bg-gray-700'}`}>
                 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${product.isStepJourney ? 'left-5' : 'left-1'}`} />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest">Produto da Jornada (Step Journey)</p>
                 <p className="text-[8px] text-[var(--text-muted)] italic">Marque se este produto compõe a trilha estratégica no Dashboard.</p>
              </div>
           </div>
           
           {product.isStepJourney && (
              <div className="pt-4 border-t border-[var(--accent-primary)]/10 space-y-2">
                 <label className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">Ordem na Jornada (1 a 6)</label>
                 <input 
                   type="number" 
                   min="1" 
                   max="6"
                   className="w-20 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg p-2 text-xs"
                   value={product.order}
                   onChange={(e) => setProduct({...product, order: parseInt(e.target.value)})}
                 />
              </div>
           )}
        </div>

        <div className="space-y-4 p-6 bg-white/5 border border-white/10 rounded-2xl flex-1 min-w-[300px]">
           <div className="flex items-center gap-3 cursor-pointer" onClick={() => setProduct({...product, status: product.status === 'active' ? 'draft' : 'active'})}>
              <div className={`w-10 h-6 rounded-full transition-all relative ${product.status === 'active' ? 'bg-green-500' : 'bg-yellow-500/50'}`}>
                 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${product.status === 'active' ? 'left-5' : 'left-1'}`} />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest">Status do Produto: <span className={product.status === 'active' ? 'text-green-500' : 'text-yellow-500'}>{product.status === 'active' ? 'ATIVO' : 'RASCUNHO'}</span></p>
                 <p className="text-[8px] text-[var(--text-muted)] italic">Ative para que o produto apareça nas páginas públicas de serviços.</p>
              </div>
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
            placeholder="Descreva o serviço para o cliente..."
            className="w-full bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-2xl p-6 text-xs leading-relaxed outline-none focus:border-[var(--accent-primary)] transition-all" 
            value={product.sheet.description}
            onChange={(e) => setProduct({...product, sheet: { ...product.sheet, description: e.target.value }})}
          />
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
             <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Preço de Venda (R$)</label>
             <input 
               type="number" 
               className="w-full bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-2xl p-4 text-xs" 
               value={product.price}
               onChange={(e) => setProduct({...product, price: parseFloat(e.target.value)})}
             />
          </div>
          <div className="space-y-2">
             <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">URL da Capa (Serviço)</label>
             <input 
               type="text" 
               placeholder="Link da imagem..."
               className="w-full bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-2xl p-4 text-xs font-mono" 
               value={product.sheet.coverImage}
               onChange={(e) => setProduct({...product, sheet: { ...product.sheet, coverImage: e.target.value }})}
             />
          </div>
       </div>
     </div>
   );
}

function CapabilitiesForm({ product, setProduct }: any) {
  return (
    <div className="space-y-8 max-w-4xl">
       <div className="space-y-4">
          <div className="flex items-center gap-2 text-[var(--accent-primary)]">
             <Zap size={14} />
             <h3 className="text-[10px] font-black uppercase tracking-widest">Ativos do Sistema</h3>
          </div>
          <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest">Vincular Pesquisas (Surveys)</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
             {SURVEY_REGISTRY.map((survey) => {
               const isSelected = product.capabilities.surveys.includes(survey.id);
               return (
                 <button 
                   key={survey.id}
                   type="button"
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

       <div className="space-y-4">
          <div className="flex items-center gap-2 text-[var(--accent-primary)]">
             <Compass size={14} />
             <h3 className="text-[10px] font-black uppercase tracking-widest">Agendamentos (Calendário)</h3>
          </div>
          <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest">Tipos de Reunião Disponíveis</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
             {[
               { id: 'sessao-boas-vindas', title: 'Sessão de Boas-vindas', icon: '🐣' },
               { id: 'sessao-devolutiva', title: 'Sessão Devolutiva', icon: '🎯' },
               { id: 'mentoria-individual', title: 'Mentoria Individual', icon: '🤝' },
               { id: 'reuniao-estrategica', title: 'Reunião Estratégica', icon: '🧠' }
             ].map((event) => {
               const isSelected = product.capabilities.allowedEventTypes.includes(event.id);
               return (
                 <button 
                   key={event.id}
                   type="button"
                   onClick={() => {
                     const current = product.capabilities.allowedEventTypes || [];
                     const next = isSelected 
                       ? current.filter((id: string) => id !== event.id)
                       : [...current, event.id];
                     setProduct({ ...product, capabilities: { ...product.capabilities, allowedEventTypes: next } });
                   }}
                   className={`p-4 rounded-2xl border text-left transition-all ${isSelected ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10' : 'border-[var(--border-primary)] bg-[var(--bg-secondary)]/20 opacity-60'}`}
                 >
                    <div className="flex items-center justify-between">
                       <p className="text-[9px] font-black uppercase tracking-widest">{event.id}</p>
                       <span className="text-xs">{event.icon}</span>
                    </div>
                    <p className="text-[8px] opacity-60 mt-1 line-clamp-1">{event.title}</p>
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
          <div className="flex items-center gap-2 text-[var(--accent-primary)]">
             <Compass size={14} />
             <h3 className="text-[10px] font-black uppercase tracking-widest">Workflow de Entrega</h3>
          </div>
          <button 
            type="button"
            onClick={() => {
               const newStep: WorkflowStep = { id: `step-${Date.now()}`, title: "Nova Etapa", type: 'task', description: "" };
               setProduct({ ...product, workflow: [...product.workflow, newStep] });
            }}
            className="px-4 py-2 bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-[var(--accent-primary)] transition-all flex items-center gap-2"
          >
             <Plus size={12} />
             Nova Etapa
          </button>
       </div>

       <div className="space-y-4">
          {product.workflow.map((step: WorkflowStep, idx: number) => (
             <div key={step.id} className="p-6 bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-2xl flex items-center gap-6 group hover:border-[var(--accent-primary)]/50 transition-all">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center text-[9px] font-black">{idx + 1}</div>
                <div className="flex-1 space-y-3">
                   <input 
                     type="text" 
                     value={step.title}
                     placeholder="Título da etapa..."
                     onChange={(e) => {
                        const newWorkflow = [...product.workflow];
                        newWorkflow[idx].title = e.target.value;
                        setProduct({ ...product, workflow: newWorkflow });
                     }}
                     className="bg-transparent border-b border-[var(--border-primary)] text-xs font-bold focus:border-[var(--accent-primary)] outline-none w-full pb-1"
                   />
                </div>
                <button 
                  type="button"
                  onClick={() => {
                     setProduct({ ...product, workflow: product.workflow.filter((sRef: WorkflowStep) => sRef.id !== step.id) });
                  }}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                   <Trash2 size={16} />
                </button>
             </div>
          ))}

          {product.workflow.length === 0 && (
             <div className="p-12 border-2 border-dashed border-[var(--border-primary)] rounded-[2rem] flex flex-col items-center justify-center opacity-30 text-center">
                <Compass size={32} className="mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Sem etapas definidas</p>
             </div>
          )}
       </div>
    </div>
  )
}
