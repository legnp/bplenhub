"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Mail,
  Phone,
  User,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  Video,
  AlertCircle,
  Filter
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  getBookingRequestsAction,
  approveBookingRequestAction,
  rejectBookingRequestAction
} from "@/actions/external-booking";

type BookingStatus = "pending" | "approved" | "rejected";

interface BookingRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  screening: Record<string, string>;
  requestedSlot: string;
  requestedSlotEnd: string;
  status: string;
  meetingLink?: string;
  createdAt: string;
}

const STATUS_CONFIG = {
  pending: {
    label: "Aguardando",
    color: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    icon: Clock,
  },
  approved: {
    label: "Aprovado",
    color: "bg-green-500/15 text-green-400 border-green-500/30",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Recusado",
    color: "bg-red-500/15 text-red-400 border-red-500/30",
    icon: XCircle,
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as BookingStatus] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function RequestCard({
  request,
  onApprove,
  onReject,
  isProcessing,
}: {
  request: BookingRequest;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isProcessing: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const startTime = parseISO(request.requestedSlot);
  const endTime = parseISO(request.requestedSlotEnd);
  const isPending = request.status === "pending";
  const isThisProcessing = isProcessing === request.id;

  const screeningLabels: Record<string, string> = {
    objetivo: "Objetivo da Reunião",
    cargo: "Cargo / Profissão",
    conheceu_como: "Como Conheceu a BPlen",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
        isPending
          ? "border-amber-500/20 bg-amber-500/5"
          : request.status === "approved"
          ? "border-green-500/15 bg-green-500/5"
          : "border-red-500/15 bg-red-500/5"
      }`}
    >
      {/* Header */}
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white font-black text-sm shrink-0">
            {request.name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="font-black text-[#1D1D1F] text-sm truncate">{request.name}</p>
              <StatusBadge status={request.status} />
            </div>
            <div className="flex items-center gap-3 text-xs text-[#1D1D1F]/50 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(startTime, "EEE, dd MMM", { locale: ptBR })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(startTime, "HH:mm")} – {format(endTime, "HH:mm")}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {request.email}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 hover:bg-black/5 rounded-xl transition-all shrink-0"
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-[#1D1D1F]/40" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#1D1D1F]/40" />
          )}
        </button>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-black/5 pt-4">

              {/* Contato */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/60 rounded-xl">
                  <p className="text-[9px] font-black text-[#667eea] uppercase tracking-widest mb-1">Telefone</p>
                  <p className="text-xs font-semibold text-[#1D1D1F] flex items-center gap-1.5">
                    <Phone className="w-3 h-3 opacity-50" /> {request.phone}
                  </p>
                </div>
                <div className="p-3 bg-white/60 rounded-xl">
                  <p className="text-[9px] font-black text-[#667eea] uppercase tracking-widest mb-1">Solicitado em</p>
                  <p className="text-xs font-semibold text-[#1D1D1F]">
                    {format(parseISO(request.createdAt), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
              </div>

              {/* Triagem */}
              <div className="space-y-2">
                <p className="text-[9px] font-black text-[#1D1D1F]/40 uppercase tracking-widest">Triagem</p>
                {Object.entries(request.screening).map(([key, value]) => (
                  value && (
                    <div key={key} className="p-3 bg-white/60 rounded-xl">
                      <p className="text-[9px] font-black text-[#667eea] uppercase tracking-widest mb-1">
                        {screeningLabels[key] || key}
                      </p>
                      <p className="text-xs text-[#1D1D1F]/70 leading-relaxed">{value}</p>
                    </div>
                  )
                ))}
              </div>

              {/* Link da Reunião (se aprovado) */}
              {request.meetingLink && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">Link Google Meet</p>
                  <a
                    href={request.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-700 font-semibold flex items-center gap-1.5 hover:underline"
                  >
                    <Video className="w-3 h-3" />
                    {request.meetingLink}
                  </a>
                </div>
              )}

              {/* Ações */}
              {isPending && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => onApprove(request.id)}
                    disabled={!!isProcessing}
                    className="flex-1 h-11 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isThisProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    {isThisProcessing ? "Aprovando..." : "Aprovar & Confirmar"}
                  </button>
                  <button
                    onClick={() => onReject(request.id)}
                    disabled={!!isProcessing}
                    className="flex-1 h-11 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 text-red-600 border border-red-500/20 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Recusar
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AdminReunioes() {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const data = await getBookingRequestsAction(
      filter === "all" ? undefined : filter
    );
    setRequests(data);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (id: string) => {
    setIsProcessing(id);
    setActionError(null);
    setActionSuccess(null);

    const result = await approveBookingRequestAction(id);

    if (result.success) {
      setActionSuccess("Reunião aprovada! E-mail de confirmação enviado ao lead.");
      await fetchRequests();
    } else {
      setActionError(result.message || "Erro ao aprovar requisição.");
    }
    setIsProcessing(null);
  };

  const handleReject = async (id: string) => {
    setIsProcessing(id);
    setActionError(null);
    setActionSuccess(null);

    const result = await rejectBookingRequestAction(id);

    if (result.success) {
      setActionSuccess("Requisição recusada. Slot liberado para outros leads.");
      await fetchRequests();
    } else {
      setActionError(result.message || "Erro ao recusar requisição.");
    }
    setIsProcessing(null);
  };

  const pendingCount = requests.filter(r => r.status === "pending").length;

  const FILTERS: { key: "all" | BookingStatus; label: string }[] = [
    { key: "all", label: "Todas" },
    { key: "pending", label: `Pendentes ${pendingCount > 0 ? `(${pendingCount})` : ""}` },
    { key: "approved", label: "Aprovadas" },
    { key: "rejected", label: "Recusadas" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1D1D1F] tracking-tight">
            Requisições 1 to 1
          </h1>
          <p className="text-sm text-[#1D1D1F]/50 mt-1 font-medium">
            Gerencie solicitações de reunião dos leads
          </p>
        </div>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/60 hover:bg-white/90 border border-black/5 rounded-xl text-xs font-black uppercase tracking-wider text-[#1D1D1F]/60 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {/* Feedback Alerts */}
      <AnimatePresence>
        {actionSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl text-sm font-semibold text-green-700"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            {actionSuccess}
          </motion.div>
        )}
        {actionError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm font-semibold text-red-700"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            {actionError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-[#1D1D1F]/30" />
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
              filter === f.key
                ? "bg-[#667eea] text-white shadow-md shadow-[#667eea]/20"
                : "bg-white/60 text-[#1D1D1F]/50 hover:bg-white hover:text-[#1D1D1F]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-30">
          <Loader2 className="w-8 h-8 animate-spin text-[#667eea]" />
          <p className="text-xs font-black uppercase tracking-widest">Carregando...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#667eea]/10 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-[#667eea]/40" />
          </div>
          <p className="text-sm font-black text-[#1D1D1F]/30 uppercase tracking-widest">
            Nenhuma requisição encontrada
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {requests.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                onApprove={handleApprove}
                onReject={handleReject}
                isProcessing={isProcessing}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
