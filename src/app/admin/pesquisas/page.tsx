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
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-4">
            Pesquisas Interativas
            <span className="px-3 py-1 rounded-full bg-accent-soft text-accent-start text-[10px] font-bold uppercase tracking-widest border border-accent-start/20">
              Admin
            </span>
          </h1>
          <p className="text-sm text-gray-500">
            Gerencie e analise as enquetes distribuídas no HUB e páginas de conteúdo.
          </p>
        </div>

        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-start to-accent-end text-white rounded-2xl font-bold text-sm hover:shadow-[0_0_20px_rgba(255,44,141,0.3)] transition-all">
          <Plus size={18} />
          Nova Pesquisa
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between text-gray-500">
            <BarChart3 size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Respostas Totais</span>
          </div>
          <div className="text-4xl font-bold text-white">1,248</div>
          <p className="text-[10px] text-accent-start font-bold uppercase">+14% em 7 dias</p>
        </div>
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between text-gray-500">
            <Users size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Ativos Hoje</span>
          </div>
          <div className="text-4xl font-bold text-white">84</div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Em tempo real</p>
        </div>
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between text-gray-500">
            <CheckCircle2 size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Pesquisas Ativas</span>
          </div>
          <div className="text-4xl font-bold text-white">{MOCK_SURVEYS.length}</div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Disponíveis no HUB</p>
        </div>
      </div>

      {/* Main List Table */}
      <div className="rounded-[2.5rem] bg-white/[0.03] border border-white/10 overflow-hidden backdrop-blur-md">
        
        {/* Table Filters Header */}
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="relative w-full md:max-w-xs group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-white transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Filtrar por nome..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-300 outline-none focus:border-accent-start/50 transition-all font-medium"
              />
           </div>
           <div className="flex gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-colors">
                 <Filter size={14} /> Filtros
              </button>
           </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Questão</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Opções</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Exibições</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SURVEYS.map((survey) => (
                <tr key={survey.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white group-hover:text-accent-start transition-colors leading-relaxed">
                        {survey.question}
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">ID: {survey.id}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest">
                      <CheckCircle2 size={10} /> {survey.status}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className="text-xs text-gray-300 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                      {survey.options.length} alternativas
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-3/4 h-full bg-accent-start rounded-full" />
                      </div>
                      <span className="text-xs font-bold text-gray-400">75%</span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"><Eye size={18} /></button>
                       <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"><Settings size={18} /></button>
                       <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"><MoreHorizontal size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Admin Table */}
        <div className="p-8 flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-white/[0.01]">
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
