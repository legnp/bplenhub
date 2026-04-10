import React from "react";
import { Metadata } from "next";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  FileText, 
  Eye, 
  Settings, 
  CheckCircle2, 
  ClipboardCheck,
  Zap,
  LayoutGrid
} from "lucide-react";
import { FORMS_REGISTRY } from "@/config/forms";

export const metadata: Metadata = {
  title: "Gestão de Formulários | Admin BPlen",
  description: "Administração de fluxos operacionais e coleta de dados (Forms_Global).",
};

export default function FormsManagementPage() {
  const forms = FORMS_REGISTRY;

  return (
    <div className="p-6 md:p-8 space-y-10 animate-fade-in-up">
      
      {/* Header Admin */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            FORMULÁRIOS
          </h1>
          <p className="text-[var(--text-muted)] text-[11px] font-medium opacity-70">
            Gerenciamento de formulário para workflows, triagem e CRM.
          </p>
        </div>

        <button className="flex items-center gap-2 px-6 py-3 bg-[var(--input-bg)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-2xl font-bold text-sm hover:border-[var(--accent-start)]/50 transition-all">
          <Settings size={18} />
          Configurações de Engine
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-[var(--input-bg)] border border-[var(--border-primary)] space-y-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <ClipboardCheck size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Roteiros Ativos</span>
          </div>
          <div className="text-4xl font-bold text-[var(--text-primary)] text-left">
            {forms.length}
          </div>
          <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest text-left">
            Configurações em registry.ts
          </p>
        </div>
        <div className="p-6 rounded-3xl bg-[var(--input-bg)] border border-[var(--border-primary)] space-y-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <Zap size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Interaçõe 24h</span>
          </div>
          <div className="text-4xl font-bold text-[var(--accent-start)] text-left">
            OFFLINE
          </div>
          <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest text-left">Sincronização Ativa</p>
        </div>
        <div className="p-6 rounded-3xl bg-[var(--input-bg)] border border-[var(--border-primary)] space-y-4 shadow-sm hover:shadow-md transition-all border-l-4 border-l-[var(--accent-start)]">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <LayoutGrid size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Capacidade</span>
          </div>
          <div className="text-4xl font-bold text-[var(--text-primary)] text-left">100%</div>
          <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest text-left">Motor V2.1 Ativo</p>
        </div>
      </div>

      {/* Main List Table */}
      <div className="rounded-[2.5rem] bg-[var(--input-bg)] border border-[var(--border-primary)] overflow-hidden shadow-2xl">
        
        {/* Table Filters Header */}
        <div className="p-6 border-b border-[var(--border-primary)] flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="relative w-full md:max-w-xs group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Filtrar formulários..." 
                className="w-full bg-[var(--bg-primary)]/50 border border-[var(--input-border)] rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-start)]/50 transition-all font-medium placeholder:text-[var(--text-muted)] placeholder:opacity-40"
              />
           </div>
           <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">
             Gestão de Operações BPlen HUB
           </p>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto text-left">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border-primary)]">
                <th className="p-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-60">Título do Formulário / ID</th>
                <th className="p-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-60">Tipo</th>
                <th className="p-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-60">Sincronização</th>
                <th className="p-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-60 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((form) => (
                <tr key={form.id} className="border-b border-[var(--border-primary)] hover:bg-[var(--accent-soft)] transition-colors group">
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-start)] transition-colors leading-relaxed">
                        {form.title}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest mt-1 font-mono">ID: {form.id}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-start)]/5 text-[var(--accent-start)] text-[10px] font-bold uppercase tracking-widest border border-[var(--accent-start)]/20">
                      {form.kind}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">
                        {form.sheetNamePrefix || "Não configurado"}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Drive Sync Ativo</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                       <a 
                         href={`/admin/forms/preview/${form.id}`}
                         className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-[var(--text-primary)] text-[10px] font-bold rounded-lg hover:border-[var(--accent-start)]/50 transition-all font-mono tracking-widest"
                       >
                         <Eye size={14} className="text-[var(--accent-start)]" /> PREVIEW
                       </a>
                       <button className="p-2 hover:bg-white/5 rounded-lg transition-all text-[var(--text-muted)]">
                         <MoreHorizontal size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}

              {forms.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-sm text-[var(--text-muted)] font-medium italic">
                    Nenhum formulário operacional registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Admin Table */}
        <div className="p-8 flex justify-between items-center text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest bg-[var(--bg-primary)]/40">
           Exibindo {forms.length} roteiros operacionais (Forms_Global)
           <div className="flex gap-4 font-bold">
              <button disabled className="opacity-30">Página Anterior</button>
              <button disabled className="opacity-30">Próxima Página</button>
           </div>
        </div>
      </div>

    </div>
  );
}
