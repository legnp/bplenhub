"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  Calendar, 
  FileText, 
  Briefcase, 
  Handshake, 
  ChevronRight,
  Clock,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { getBookingRequestsAction } from "@/actions/external-booking";

export default function AdminDashboardPage() {
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const requests = await getBookingRequestsAction("pending");
        setPendingCount(requests.length);
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const stats = [
    {
      title: "Reuniões 1:1",
      value: loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (pendingCount ?? 0),
      label: "pendentes de aprovação",
      icon: Handshake,
      color: "text-[#667eea]",
      bg: "bg-[#667eea]/10",
      link: "/admin/reunioes",
      highlight: (pendingCount ?? 0) > 0
    },
    {
      title: "Agenda",
      value: "Ativa",
      label: "sincronização ok",
      icon: Calendar,
      color: "text-green-500",
      bg: "bg-green-500/10",
      link: "/admin/gestao-agenda"
    },
    {
      title: "Leads",
      value: "Gestão",
      label: "base de contatos",
      icon: Users,
      color: "text-[#764ba2]",
      bg: "bg-[#764ba2]/10",
      link: "/admin/users"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header com Animação */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-4xl font-black bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#667eea] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x tracking-tighter">
          Dashboard Administrativo
        </h1>
        <p className="text-[#1D1D1F]/50 font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          BPlen HUB — Centro de Comando Operacional
        </p>
      </motion.div>

      {/* Grid de Stats Interativos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link 
              href={stat.link}
              className={`group block p-6 rounded-[24px] border border-white/60 bg-white/40 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-[#667eea]/5 hover:-translate-y-1 relative overflow-hidden ${stat.highlight ? 'ring-2 ring-[#667eea]/20' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-500`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <ChevronRight className="w-4 h-4 text-[#1D1D1F]/20 group-hover:text-[#667eea] transition-colors" />
              </div>

              <div className="space-y-1">
                <h3 className="text-3xl font-black text-[#1D1D1F] tracking-tighter flex items-baseline gap-2">
                  {stat.value}
                </h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1D1D1F]/40">
                  {stat.title}
                </p>
                <p className="text-xs font-medium text-[#1D1D1F]/60">
                  {stat.label}
                </p>
              </div>

              {/* Decorative Glow for high priority */}
              {stat.highlight && (
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#667eea]/5 rounded-full blur-2xl group-hover:bg-[#667eea]/10 transition-all" />
              )}
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Access Section */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-5 h-5 text-[#667eea]" />
          <h2 className="text-xl font-black text-[#1D1D1F] tracking-tight">Atalhos de Gestão</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Novo Portfólio", icon: Briefcase, href: "/admin/portfolio" },
            { label: "Ver Formulários", icon: FileText, href: "/admin/forms" },
            { label: "Usuários", icon: Users, href: "/admin/users" },
            { label: "Ajustar Agenda", icon: Calendar, href: "/admin/agenda" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 p-4 bg-white/20 hover:bg-white/60 border border-white/40 rounded-2xl transition-all group"
            >
              <item.icon className="w-4 h-4 text-[#1D1D1F]/40 group-hover:text-[#667eea] transition-colors" />
              <span className="text-sm font-bold text-[#1D1D1F]/70 group-hover:text-[#1D1D1F]">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
