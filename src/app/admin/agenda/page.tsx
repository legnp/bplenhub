"use client";

import React, { useState, useEffect, useMemo } from "react";
import { syncCalendarToFirestore, getSyncedEvents, GoogleCalendarEvent } from "@/actions/calendar";
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Calendar as CalendarIcon, 
  ExternalLink, 
  Clock, 
  LayoutDashboard, 
  Filter, 
  ArrowUpDown, 
  TrendingUp,
  Activity
} from "lucide-react";
import { format, addDays, isBefore, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

type SortOption = "date" | "name" | "status";
type DateRangeOption = "all" | "15" | "30";

export default function AgendaManagementPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<{ count: number; timestamp: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncedEvents, setSyncedEvents] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Novos controles de visualização
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [dateRange, setDateRange] = useState<DateRangeOption>("all");

  // Carregar preview dos eventos já sincronizados
  useEffect(() => {
    async function load() {
      setIsLoadingList(true);
      try {
        const events = await getSyncedEvents();
        setSyncedEvents(events);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingList(false);
      }
    }
    load();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);
    try {
      const result = await syncCalendarToFirestore();
      setLastSyncResult({ count: result.count, timestamp: result.timestamp });
      
      const updatedEvents = await getSyncedEvents();
      setSyncedEvents(updatedEvents);
    } catch (err: any) {
      setError(err.message || "Erro ao sincronizar agenda.");
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Cálculo de Estatísticas (Stats Section)
   */
  const stats = useMemo(() => {
    if (!syncedEvents.length) return { total: 0, types: [], status: { sync: 0 } };

    const total = syncedEvents.length;
    
    // Contagem por Tipo (Top 5)
    const typeMap: Record<string, number> = {};
    syncedEvents.forEach(ev => {
      const type = ev.summary || "Sem Título";
      typeMap[type] = (typeMap[type] || 0) + 1;
    });

    const topTypes = Object.entries(typeMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      total,
      types: topTypes,
      status: {
        sync: syncedEvents.filter(e => e.status === "sincronizado" || !e.status).length
      }
    };
  }, [syncedEvents]);

  /**
   * Processamento da Lista (Filtro + Ordenação)
   */
  const processedEvents = useMemo(() => {
    let result = [...syncedEvents];

    // 1. Filtro de Busca (Título + Descrição)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(ev => 
        ev.summary?.toLowerCase().includes(term) || 
        ev.description?.toLowerCase().includes(term)
      );
    }

    // 2. Filtro Temporal (15 ou 30 dias)
    if (dateRange !== "all") {
      const now = new Date();
      const limit = addDays(now, parseInt(dateRange));
      result = result.filter(ev => {
        const date = ev.start ? parseISO(ev.start) : new Date();
        return isBefore(date, limit);
      });
    }

    // 3. Ordenação
    result.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(a.start).getTime() - new Date(b.start).getTime();
      }
      if (sortBy === "name") {
        return a.summary.localeCompare(b.summary);
      }
      // Placeholder status sort (todos são 'sincronizado' por enquanto)
      return 0;
    });

    return result;
  }, [syncedEvents, searchTerm, dateRange, sortBy]);

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
            Gestão de Agenda
          </h1>
          <p className="text-[#1D1D1F]/60 mt-2 font-medium">
            Interface de controle operacional e auditoria de serviços.
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={isSyncing}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] shrink-0 ${
            isSyncing 
              ? "bg-[#1D1D1F]/5 text-[#1D1D1F]/40 cursor-not-allowed" 
              : "bg-gradient-to-tr from-[#667eea] to-[#764ba2] text-white shadow-[#667eea]/20"
          }`}
        >
          {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {isSyncing ? "SINCRONIZANDO..." : "SINCRONIZAR AGORA"}
        </button>
      </div>

      {/* Stats Cards Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm transition-all hover:bg-white/60">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#667eea]/10 rounded-xl text-[#667eea]">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-[#1D1D1F]/40 uppercase tracking-widest leading-none">Total na Base</span>
          </div>
          <div className="text-4xl font-black text-[#1D1D1F]">{stats.total}</div>
          <p className="text-[10px] text-[#1D1D1F]/50 mt-1 font-medium italic">Eventos mapeados no ecossistema</p>
        </div>

        <div className="p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm transition-all hover:bg-white/60">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#764ba2]/10 rounded-xl text-[#764ba2]">
               <Activity className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-[#1D1D1F]/40 uppercase tracking-widest leading-none">Status Sincronizado</span>
          </div>
          <div className="text-4xl font-black text-[#1D1D1F]">{stats.status.sync}</div>
          <div className="flex items-center gap-1.5 mt-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[10px] font-bold text-green-600 uppercase">Operacional</span>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm">
           <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#667eea]/10 rounded-xl text-[#667eea]">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-[#1D1D1F]/40 uppercase tracking-widest leading-none">Principais Tipos / Serviços (Top 5)</span>
           </div>
           
           <div className="flex flex-wrap gap-2">
              {stats.types.map((t, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-xl border border-white/80 shadow-sm">
                  <span className="text-[10px] font-bold text-[#1D1D1F] line-clamp-1 max-w-[150px]">{t.name}</span>
                  <span className="text-[10px] font-black text-[#667eea] bg-[#667eea]/10 px-1.5 rounded-lg">{t.count}</span>
                </div>
              ))}
              {stats.types.length === 0 && <span className="text-[10px] text-[#1D1D1F]/40 italic">Aguardando dados...</span>}
           </div>
        </div>
      </div>

      {/* Controls Bar (Filter/Sort/Search) */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl sticky top-4 z-10 shadow-[0_8px_32px_0_rgba(31,38,135,0.02)]">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1D1D1F]/30" />
          <input 
            type="text" 
            placeholder="Filtrar por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/60 border border-white/80 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#667eea]/30 transition-all placeholder:text-[#1D1D1F]/30"
          />
        </div>

        {/* Date Filters */}
        <div className="flex items-center bg-white/60 p-1.5 rounded-2xl border border-white/80 shadow-sm gap-1">
           {(["all", "15", "30"] as DateRangeOption[]).map((opt) => (
             <button
                key={opt}
                onClick={() => setDateRange(opt)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all uppercase tracking-tight ${
                  dateRange === opt 
                    ? "bg-[#1D1D1F] text-white shadow-md shadow-[#1D1D1F]/20" 
                    : "text-[#1D1D1F]/40 hover:text-[#1D1D1F]"
                }`}
             >
                {opt === "all" ? "Todos" : `Próx. ${opt} Dias`}
             </button>
           ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white/60 rounded-2xl border border-white/80 shadow-sm">
           <ArrowUpDown className="w-3.5 h-3.5 text-[#1D1D1F]/40" />
           <select 
             value={sortBy} 
             onChange={(e) => setSortBy(e.target.value as SortOption)}
             className="bg-transparent text-[10px] font-bold text-[#1D1D1F] focus:outline-none cursor-pointer uppercase tracking-tight"
           >
              <option value="date">Ordenar por Data</option>
              <option value="name">Ordenar por Nome</option>
              <option value="status">Ordenar por Status</option>
           </select>
        </div>
      </div>

      {/* Sync Feedback Alerts */}
      {lastSyncResult && (
        <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-700 animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            <span className="font-bold">Dashboard Atualizado:</span> {lastSyncResult.count} eventos capturados em {format(new Date(lastSyncResult.timestamp), "HH:mm:ss")}.
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold">Falha na Sincronização</p>
            <p className="opacity-80">{error}</p>
          </div>
        </div>
      )}

      {/* Events Grid */}
      <div className="space-y-4">
        {isLoadingList ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-44 bg-white/20 animate-pulse rounded-3xl border border-white/40"></div>
            ))}
          </div>
        ) : processedEvents.length === 0 ? (
          <div className="p-20 text-center border-2 border-dashed border-[#1D1D1F]/10 rounded-3xl bg-white/30 backdrop-blur-sm">
            <CalendarIcon className="w-12 h-12 text-[#1D1D1F]/10 mx-auto mb-4" />
            <p className="text-sm text-[#1D1D1F]/50 font-bold uppercase tracking-widest">Nenhum evento encontrado</p>
            <p className="text-xs text-[#1D1D1F]/30 mt-2">Ajuste os filtros ou realize uma nova sincronização.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processedEvents.map(event => (
              <div 
                key={event.id}
                className="group relative p-6 bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl hover:bg-white hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]"
              >
                {/* Status Indicator Dot (Requested Adjustment) */}
                <div className="absolute top-6 left-6 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-black/[0.03] shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <span className="text-[9px] font-black text-[#1D1D1F]/60 uppercase tracking-tighter">Sincronizado</span>
                </div>

                <div className="flex justify-end items-start mb-6">
                  <a 
                    href={event.htmlLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2.5 bg-white shadow-sm border border-black/5 rounded-2xl text-[#1D1D1F]/20 hover:text-[#667eea] hover:border-[#667eea]/30 transition-all hover:scale-110"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                
                <h4 className="font-bold text-lg text-[#1D1D1F] line-clamp-2 leading-tight min-h-[56px]">{event.summary}</h4>
                
                <div className="mt-6 space-y-3 pt-6 border-t border-black/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#667eea]/5 flex items-center justify-center text-[#667eea]">
                      <CalendarIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[#1D1D1F]/30 uppercase tracking-widest">Data do Serviço</p>
                      <p className="text-xs font-bold text-[#1D1D1F]">{event.start && format(new Date(event.start), "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#764ba2]/5 flex items-center justify-center text-[#764ba2]">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[#1D1D1F]/30 uppercase tracking-widest">Horário Previsto</p>
                      <p className="text-xs font-bold text-[#1D1D1F]">
                        {event.start && format(new Date(event.start), "HH:mm")} - {event.end && format(new Date(event.end), "HH:mm")}
                      </p>
                    </div>
                  </div>
                </div>

                {event.description && (
                  <div className="mt-6 p-4 rounded-2xl bg-black/[0.02] border border-black/[0.03]">
                    <p className="text-[10px] text-[#1D1D1F]/60 line-clamp-2 italic leading-relaxed">
                      "{event.description}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Logic Box */}
      <div className="p-4 bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl shadow-sm">
        <div className="flex gap-4">
          <div className="p-2 bg-[#667eea]/10 rounded-xl shrink-0">
             <AlertCircle className="w-4 h-4 text-[#667eea]" />
          </div>
          <p className="text-[11px] text-[#1D1D1F]/60 leading-relaxed font-medium">
            <span className="font-bold text-[#1D1D1F]">Governança BPlen (90 Dias):</span> Este dashboard utiliza uma base sincronizada incremental. Eventos passados são arquivados automaticamente para atribuição de Auditoria e Atas, enquanto eventos futuros são atualizados a cada sincronização. A ordenação e agrupamento por título auxiliam na identificação rápida de gargalos de portfólio.
          </p>
        </div>
      </div>
    </div>
  );
}

