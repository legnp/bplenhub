"use client";

import React, { useState, useEffect } from "react";
import { 
  getProgramacaoSummaryAction, 
  GoogleCalendarEvent 
} from "@/actions/calendar";
import { 
  FileText, 
  ExternalLink, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight,
  Loader2,
  MoreHorizontal,
  Calendar as CalendarIcon
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuthContext } from "@/context/AuthContext";
import PostEventWizard from "./PostEventWizard";

interface EventSummary {
  id: string;
  summary: string;
  start: string;
  end: string;
  mentor: string;
  theme?: string;
  statusLabel: "futuro" | "pendente" | "concluido";
  folderUrl: string | null;
  htmlLink: string;
  registeredCount: number;
  totalCapacity: number;
  metrics: {
    presenceCount: number;
    npsAvg: number;
    reviewsCount: number;
  };
  // Campos legados ou de transição que o PostEventWizard pode precisar
  postEventCompleted?: boolean;
  meetingMinutesFile?: { url: string; fileId: string; fileName: string; uploadedAt: string } | null;
}

export default function ProgramacaoResumo() {
  const { user } = useAuthContext();
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  // Modal Wizard State
  const [selectedEvent, setSelectedEvent] = useState<EventSummary | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Dropdown Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const idToken = await user?.getIdToken();
        const data = await getProgramacaoSummaryAction(idToken);
        setEvents(data);
      } catch (error) {
        console.error("Erro ao carregar resumo:", error);
      } finally {
        setIsLoading(false);
      }
    }
    if (user) load();
  }, [user, refreshCounter]);

  // Click away listener for dropdown
  useEffect(() => {
    const handleClickAway = () => setActiveMenuId(null);
    if (activeMenuId) {
      window.addEventListener("click", handleClickAway);
    }
    return () => window.removeEventListener("click", handleClickAway);
  }, [activeMenuId]);

  const handleOpenWizard = (ev: EventSummary) => {
    setSelectedEvent(ev);
    setIsWizardOpen(true);
    setActiveMenuId(null);
  };

  const statusMap = {
    futuro: { label: "Futuro", color: "bg-blue-500/10 text-blue-400", icon: Clock },
    pendente: { label: "Pendente Fechamento", color: "bg-amber-500/10 text-amber-500 animate-pulse", icon: AlertCircle },
    concluido: { label: "Concluído", color: "bg-green-500/10 text-green-500", icon: CheckCircle2 },
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-50">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-start)]" />
        <p className="text-[10px] font-bold uppercase tracking-widest">Carregando Programação...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Header (Desktop) */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-start)] ml-2">Snapshot Global de Programação</p>
        <button 
          onClick={async () => {
             if (confirm("Deseja recalcular todas as métricas históricas? Isso pode levar alguns segundos.")) {
               setIsLoading(true);
               try {
                 const idToken = await user?.getIdToken();
                 if (idToken) {
                   const { healProgramacaoMasterAction } = await import("@/actions/calendar");
                   const res = await healProgramacaoMasterAction(idToken);
                   if (res.success) {
                      alert(`Sucesso! ${res.processed} eventos processados.`);
                      setRefreshCounter(p => p + 1);
                   } else {
                      alert("Erro no Healing: " + res.message);
                   }
                 }
               } catch (err) {
                 console.error(err);
               } finally {
                 setIsLoading(false);
               }
             }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-start)]/10 hover:bg-[var(--accent-start)]/20 text-[var(--accent-start)] rounded-xl border border-[var(--accent-start)]/20 transition-all text-[9px] font-black uppercase tracking-widest"
        >
           <TrendingUp className="w-3 h-3" />
           Recalcular Métricas (Healing)
        </button>
      </div>

      <div className="hidden md:grid grid-cols-[2fr_1.2fr_1fr_1fr_0.8fr_1.5fr_1fr] gap-4 px-8 py-4 bg-[var(--input-bg)]/30 rounded-2xl border border-[var(--border-primary)] text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
        <div>Evento / Tema</div>
        <div>Orientador</div>
        <div>Status</div>
        <div className="text-center">NPS</div>
        <div className="text-center">Presença</div>
        <div className="text-center">Inscritos / Vagas</div>
        <div className="text-right pr-4">Ações</div>
      </div>

      {/* Row List */}
      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-[var(--border-primary)] rounded-[2.5rem] opacity-30">
            <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma programação encontrada</p>
          </div>
        ) : events.map((ev) => {
          const SIcon = statusMap[ev.statusLabel].icon;
          const isMenuOpen = activeMenuId === ev.id;

          return (
            <div 
              key={ev.id} 
              className="group grid grid-cols-1 md:grid-cols-[2fr_1.2fr_1fr_1fr_0.8fr_1.5fr_1fr] gap-4 items-center px-8 py-5 bg-[var(--bg-primary)]/40 border border-[var(--border-primary)] rounded-[2rem] hover:border-[var(--accent-start)]/30 transition-all hover:translate-x-1"
            >
              {/* Event Name & Theme */}
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[10px] font-bold text-[var(--text-muted)] opacity-50">{format(parseISO(ev.start), "dd/MM/yy - HH:mm", { locale: ptBR })}</span>
                <h4 className="text-sm font-black text-[var(--text-primary)] truncate">{ev.summary}</h4>
                {ev.theme && <span className="text-[10px] font-medium text-[var(--accent-start)] opacity-70 truncate"># {ev.theme}</span>}
              </div>

              {/* Mentor */}
              <div className="text-xs font-bold text-[var(--text-primary)]/80">
                {ev.mentor || "BPlen Hub"}
              </div>

              {/* Status */}
              <div>
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${statusMap[ev.statusLabel].color}`}>
                  <SIcon className="w-3 h-3" />
                  {statusMap[ev.statusLabel].label}
                </span>
              </div>

              {/* NPS */}
              <div className="text-center">
                {ev.metrics.npsAvg > 0 ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/5 text-green-500 rounded-lg">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-xs font-black">{ev.metrics.npsAvg}</span>
                    <span className="text-[8px] opacity-40 font-bold">({ev.metrics.reviewsCount})</span>
                  </div>
                ) : (
                  <span className="text-[9px] font-bold text-[var(--text-muted)] opacity-30">S/ Aval.</span>
                )}
              </div>

              {/* Attendance */}
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 text-xs font-black text-[var(--text-primary)]">
                  <span className={ev.metrics.presenceCount > 0 ? "text-green-500" : "opacity-30"}>{ev.metrics.presenceCount}</span>
                  <span className="opacity-20">/</span>
                  <span className="opacity-40">{ev.registeredCount}</span>
                </div>
              </div>

              {/* Registered vs Capacity */}
              <div className="text-center">
                <div className="flex flex-col items-center gap-1">
                   <div className="w-full h-1.5 bg-[var(--input-bg)] rounded-full overflow-hidden border border-[var(--border-primary)]/30">
                      <div 
                        className="h-full bg-[var(--accent-start)] rounded-full" 
                        style={{ width: `${Math.min(100, ((ev.registeredCount || 0) / (ev.totalCapacity || 1)) * 100)}%` }} 
                      />
                   </div>
                   <div className="flex items-center gap-2 text-[9px] font-bold text-[var(--text-muted)] opacity-60">
                      <Users className="w-2.5 h-2.5" />
                      {ev.registeredCount || 0} / {ev.totalCapacity || 0} vagas
                   </div>
                </div>
              </div>

              {/* Actions Dropdown */}
              <div className="flex items-center justify-end relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(isMenuOpen ? null : ev.id);
                  }}
                  className={`p-2.5 rounded-xl border transition-all ${isMenuOpen ? "bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)] shadow-lg" : "bg-[var(--input-bg)] hover:bg-[var(--input-bg-hover)] text-[var(--text-muted)] border-[var(--border-primary)]"}`}
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                {isMenuOpen && (
                  <div 
                    className="absolute top-full right-0 mt-2 w-56 p-2 bg-[var(--bg-primary)]/90 backdrop-blur-xl border border-[var(--border-primary)] rounded-[1.5rem] shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-col gap-1">
                      {/* Close Event Action */}
                      {ev.statusLabel !== "futuro" && (
                        <button 
                          onClick={() => handleOpenWizard(ev)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--accent-start)] hover:text-white transition-all text-left text-[11px] font-bold group/item"
                        >
                          <CheckCircle2 className="w-4 h-4 opacity-50 group-hover/item:opacity-100" />
                          <span>{ev.postEventCompleted ? "Ver Resumo / Dados" : "Fechar Evento"}</span>
                        </button>
                      )}

                      <hr className="my-1 border-[var(--border-primary)] opacity-30 mx-2" />

                      {/* External Links */}
                      <a 
                        href={ev.htmlLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--input-bg-hover)] transition-all text-left text-[11px] font-bold group/item"
                      >
                         <CalendarIcon className="w-4 h-4 opacity-50 text-blue-400" />
                         <span>Google Calendar</span>
                      </a>

                      {ev.folderUrl && (
                        <a 
                          href={ev.folderUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--input-bg-hover)] transition-all text-left text-[11px] font-bold group/item"
                        >
                           <ExternalLink className="w-4 h-4 opacity-50 text-green-500" />
                           <span>Pasta do Drive</span>
                        </a>
                      )}

                      {/* Minutes Action */}
                      <a 
                        href={ev.meetingMinutesFile?.url || "#"} 
                        target="_blank" 
                        rel="noreferrer"
                        onClick={(e) => !ev.meetingMinutesFile?.url && e.preventDefault()}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left text-[11px] font-bold group/item ${ev.meetingMinutesFile?.url ? "hover:bg-[var(--input-bg-hover)]" : "opacity-30 cursor-not-allowed grayscale"}`}
                      >
                         <FileText className="w-4 h-4 opacity-50 text-amber-500" />
                         <span>Visualizar Ata</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Wizard Modal */}
      {selectedEvent && (
        <PostEventWizard 
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          event={selectedEvent}
          onSuccess={() => setRefreshCounter(p => p + 1)}
        />
      )}
    </div>
  );
}
