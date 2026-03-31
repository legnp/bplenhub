"use client";

import React, { useState, useEffect } from "react";
import { syncCalendarToFirestore, getSyncedEvents, GoogleCalendarEvent } from "@/actions/calendar";
import { RefreshCw, CheckCircle2, AlertCircle, Calendar as CalendarIcon, ExternalLink, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AgendaManagementPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<{ count: number; timestamp: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncedEvents, setSyncedEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // Carregar preview dos eventos já sincronizados
  useEffect(() => {
    async function load() {
      setIsLoadingList(true);
      try {
        const events = await getSyncedEvents();
        // Ordenar por data de início
        const sorted = events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
        setSyncedEvents(sorted);
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
      
      // Atualiza a lista após sync
      const updatedEvents = await getSyncedEvents();
      setSyncedEvents(updatedEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()));
    } catch (err: any) {
      setError(err.message || "Erro ao sincronizar agenda.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
            Sincronizar Agenda
          </h1>
          <p className="text-[#1D1D1F]/60 mt-2 font-medium">
            Captura de eventos (próximos 90 dias) para base de agendamentos.
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={isSyncing}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
            isSyncing 
              ? "bg-[#1D1D1F]/5 text-[#1D1D1F]/40 cursor-not-allowed" 
              : "bg-gradient-to-tr from-[#667eea] to-[#764ba2] text-white shadow-[#667eea]/20"
          }`}
        >
          {isSyncing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {isSyncing ? "SINCRONIZANDO..." : "SINCRONIZAR AGORA"}
        </button>
      </div>

      {/* Sync Status Alert */}
      {lastSyncResult && (
        <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold">Sincronização Concluída!</p>
            <p className="opacity-80">
              {lastSyncResult.count} eventos capturados e armazenados com sucesso em {format(new Date(lastSyncResult.timestamp), "HH:mm:ss")}.
            </p>
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

      {/* Current Database View */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Clock className="w-4 h-4 text-[#1D1D1F]/40" />
          <h3 className="text-sm font-bold text-[#1D1D1F]/60 uppercase tracking-widest">Eventos na Base (Firestore)</h3>
        </div>

        {isLoadingList ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-white/20 animate-pulse rounded-2xl border border-white/40"></div>
            ))}
          </div>
        ) : syncedEvents.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-[#1D1D1F]/10 rounded-3xl bg-white/30 backdrop-blur-sm">
            <CalendarIcon className="w-10 h-10 text-[#1D1D1F]/20 mx-auto mb-4" />
            <p className="text-[#1D1D1F]/50 font-medium">Nenhum evento sincronizado na base.</p>
            <p className="text-xs text-[#1D1D1F]/30 mt-1">Clique em "Sincronizar Agora" para buscar dados do Google.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {syncedEvents.map(event => (
              <div 
                key={event.id}
                className="group p-5 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl hover:bg-white hover:shadow-xl transition-all hover:scale-[1.01]"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 bg-[#667eea]/5 rounded-xl text-[#667eea]">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <a 
                    href={event.htmlLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2 text-[#1D1D1F]/20 hover:text-[#667eea] transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                
                <h4 className="font-bold text-[#1D1D1F] line-clamp-1">{event.summary}</h4>
                
                <div className="mt-3 flex flex-col gap-1.5">
                  <div className="text-[11px] font-bold text-[#1D1D1F]/40 flex items-center gap-1.5 uppercase tracking-wider">
                    <Clock className="w-3 h-3" />
                    {event.start && format(new Date(event.start), "dd 'de' MMMM", { locale: ptBR })}
                  </div>
                  <div className="text-[10px] font-medium text-[#1D1D1F]/60 flex items-center gap-1.5">
                    {event.start && format(new Date(event.start), "HH:mm")} - {event.end && format(new Date(event.end), "HH:mm")}
                  </div>
                </div>

                {event.description && (
                  <p className="mt-3 text-[10px] text-[#1D1D1F]/50 line-clamp-2 border-t border-black/5 pt-2 italic">
                    {event.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-[#667eea]/5 border border-[#667eea]/10 rounded-2xl">
        <div className="flex gap-3">
          <AlertCircle className="w-4 h-4 text-[#667eea] shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#1D1D1F]/70 leading-relaxed">
            <span className="font-bold text-[#667eea]">Lógica de Governança:</span> Esta função captura eventos 100% integrais do Google Workspace. Os dados capturados servem como infraestrutura para permitir que leads B2C/B2B reservem horários via Hub. A sincronização é incremental e não sobrescreve anotações administrativas feitas diretamente no Firestore.
          </p>
        </div>
      </div>
    </div>
  );
}
