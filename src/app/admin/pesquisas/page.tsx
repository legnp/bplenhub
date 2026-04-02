import React from "react";
import { Metadata } from "next";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  BarChart3, 
  Eye, 
  Settings, 
  CheckCircle2, 
  Clock, 
  Filter,
  Users
} from "lucide-react";
import { MOCK_SURVEYS } from "@/config/hub-data";

export const metadata: Metadata = {
  title: "Gestão de Pesquisas | Admin BPlen",
  description: "Administração de pesquisas interativas e enquetes do HUB.",
};

export default function AdminSurveysPage() {
  return (
    <div className="p-8 space-y-12 animate-fade-in-up">
      
      {/* Header Admin */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-4 text-left">
            Pesquisas Interativas
            <span className="px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent-start)] text-[10px] font-bold uppercase tracking-widest border border-[var(--accent-start)]/20">
              Admin
            </span>
          </h1>
          <p className="text-sm text-[var(--text-muted)] text-left">
            Gerencie e analise as enquetes distribuídas no HUB e páginas de conteúdo.
          </p>
        </div>

        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)] text-white rounded-2xl font-bold text-sm hover:shadow-[0_0_20px_rgba(255,44,141,0.3)] transition-all">
          <Plus size={18} />
          Nova Pesquisa
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-[var(--input-bg)] border border-[var(--border-primary)] space-y-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <BarChart3 size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Respostas Totais</span>
          </div>
          <div className="text-4xl font-bold text-[var(--text-primary)] text-left">1,248</div>
          <p className="text-[10px] text-[var(--accent-start)] font-bold uppercase text-left">+14% em 7 dias</p>
        </div>
        <div className="p-6 rounded-3xl bg-[var(--input-bg)] border border-[var(--border-primary)] space-y-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <Users size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Ativos Hoje</span>
          </div>
          <div className="text-4xl font-bold text-[var(--text-primary)] text-left">84</div>
          <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest text-left">Em tempo real</p>
        </div>
        <div className="p-6 rounded-3xl bg-[var(--input-bg)] border border-[var(--border-primary)] space-y-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <CheckCircle2 size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Pesquisas Ativas</span>
          </div>
          <div className="text-4xl font-bold text-[var(--text-primary)] text-left">{MOCK_SURVEYS.length}</div>
          <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest text-left">Disponíveis no HUB</p>
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
                placeholder="Filtrar por nome..." 
                className="w-full bg-[var(--bg-primary)]/50 border border-[var(--input-border)] rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-start)]/50 transition-all font-medium placeholder:text-[var(--text-muted)] placeholder:opacity-40"
              />
           </div>
           <div className="flex gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-primary)] border border-[var(--input-border)] rounded-xl text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                 <Filter size={14} /> Filtros
              </button>
           </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto text-left">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border-primary)]">
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Questão</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Opções</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Exibições</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SURVEYS.map((survey) => (
                <tr key={survey.id} className="border-b border-[var(--border-primary)] hover:bg-[var(--accent-soft)] transition-colors group">
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-start)] transition-colors leading-relaxed">
                        {survey.question}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-widest mt-1">ID: {survey.id}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest">
                      <CheckCircle2 size={10} /> {survey.status}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className="text-xs text-[var(--text-secondary)] bg-[var(--bg-primary)] px-3 py-1 rounded-lg border border-[var(--border-primary)]">
                      {survey.options.length} alternativas
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-primary)]">
                        <div className="w-3/4 h-full bg-[var(--accent-start)] rounded-full shadow-[0_0_8px_rgba(255,44,141,0.4)]" />
                      </div>
                      <span className="text-xs font-bold text-[var(--text-muted)]">75%</span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 hover:bg-[var(--accent-soft)] rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-start)] transition-all"><Eye size={18} /></button>
                       <button className="p-2 hover:bg-[var(--accent-soft)] rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-start)] transition-all"><Settings size={18} /></button>
                       <button className="p-2 hover:bg-[var(--accent-soft)] rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-start)] transition-all"><MoreHorizontal size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Admin Table */}
        <div className="p-8 flex justify-between items-center text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest bg-[var(--bg-primary)]/40">
           Exibindo {MOCK_SURVEYS.length} resultados
           <div className="flex gap-4">
              <button disabled className="opacity-30">Página Anterior</button>
              <button disabled className="opacity-30">Próxima Página</button>
           </div>
        </div>
      </div>

    </div>
  );
}
