"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  ShieldOff, 
  UserCircle, 
  Mail, 
  Fingerprint, 
  Calendar,
  Loader2,
  AlertCircle,
  MoreVertical,
  Activity,
  Layers,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminUser } from "@/types/users";
import { getAdminUsersList, toggleUserAdminStatus } from "@/actions/users-admin";
import { auth } from "@/lib/firebase";
import { useAuthContext } from "@/context/AuthContext";

/**
 * BPlen HUB — Gestão de Usuários (Admin 👥🛡️)
 * Controle de permissões, perfis e futura governança de serviços por usuário.
 */

export default function UsersManagementPage() {
  const { isAdmin: currentAdminStatus, loading: authLoading } = useAuthContext();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "member">("all");
  const [processingUser, setProcessingUser] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const data = await getAdminUsersList(token);
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar a lista de usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.matricula.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = 
        roleFilter === "all" || 
        (roleFilter === "admin" && user.isAdmin) || 
        (roleFilter === "member" && !user.isAdmin);
        
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleToggleAdmin = async (targetMatricula: string, currentStatus: boolean) => {
    if (!confirm(`Tem certeza que deseja ${currentStatus ? "REMOVER" : "CONCEDER"} o status de administrador para este usuário?`)) return;

    setProcessingUser(targetMatricula);
    try {
      const token = await auth.currentUser?.getIdToken();
      await toggleUserAdminStatus(targetMatricula, !currentStatus, token);
      
      // Atualizar localmente para feedback instantâneo
      setUsers(prev => prev.map(u => 
        u.matricula === targetMatricula ? { ...u, isAdmin: !currentStatus } : u
      ));
    } catch (err: any) {
      alert(err.message || "Erro ao atualizar permissão.");
    } finally {
      setProcessingUser(null);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header section com Estetíca Premium */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="space-y-1 text-left">
          <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">
            Gestão de <span className="text-[var(--accent-start)] italic">Usuários</span>
          </h1>
          <p className="text-[var(--text-muted)] text-sm font-medium opacity-60">
            Administração central de perfis, permissões e ecossistema BPlen.
          </p>
        </div>

        <div className="flex items-center gap-3 glass px-6 py-3 border-emerald-500/10 bg-emerald-500/5">
           <Activity size={16} className="text-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
              Sincronizado com Firestore
           </span>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Total de Membros", value: users.length, icon: Users, color: "var(--accent-start)" },
            { label: "Administradores", value: users.filter(u => u.isAdmin).length, icon: ShieldCheck, color: "emerald-500" },
            { label: "Novos Enviados", value: users.filter(u => u.onboardStatus === "pending").length, icon: UserCircle, color: "blue-500" }
          ].map((stat, i) => (
            <div key={i} className="p-6 bg-[var(--input-bg)] rounded-[2rem] border border-[var(--border-primary)] shadow-sm text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl text-white`} style={{ backgroundColor: stat.color === "var(--accent-start)" ? stat.color : undefined, background: stat.color !== "var(--accent-start)" ? `rgba(${stat.color === 'emerald-500' ? '16, 185, 129' : '59, 130, 246'}, 0.1)` : undefined, color: stat.color !== "var(--accent-start)" ? `var(--${stat.color.split('-')[0]})` : undefined }}>
                   <stat.icon size={18} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60">{stat.label}</span>
              </div>
              <div className="text-4xl font-black text-[var(--text-primary)] tracking-tighter">{stat.value}</div>
            </div>
          ))}
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="flex flex-wrap items-center gap-4 p-5 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-[2rem] shadow-2xl backdrop-blur-3xl">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] opacity-40" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou matrícula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--bg-primary)]/50 border border-[var(--input-border)] rounded-2xl pl-12 pr-6 py-3.5 text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)]/50 transition-all"
          />
        </div>

        <div className="flex items-center bg-[var(--bg-primary)]/50 p-1.5 rounded-2xl border border-[var(--input-border)] gap-1">
          {['all', 'admin', 'member'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role as any)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black transition-all uppercase tracking-widest ${roleFilter === role
                  ? "bg-[var(--accent-start)] text-white shadow-xl shadow-[var(--accent-start)]/20"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
            >
              {role === 'all' ? 'Todos' : role}
            </button>
          ))}
        </div>
      </div>

      {/* Listagem de Usuários */}
      <div className="glass overflow-hidden rounded-[2.5rem] border-[var(--border-primary)] shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--input-bg)]/80 border-b border-[var(--border-primary)]">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Identidade / Membro</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Papel & Acesso</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Serviços Liberados</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Status Onboard</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Gerenciar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-10 bg-white/5 opacity-50">Carregando dados estruturais...</td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest bg-gray-50/50">
                    Nenhum usuário encontrado na base atual.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.matricula} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Identidade */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--bg-primary)] to-[var(--input-bg)] border border-[var(--border-primary)] flex items-center justify-center shrink-0 shadow-sm">
                           <UserCircle size={24} className="text-[var(--text-muted)] opacity-30" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-sm text-[var(--text-primary)] truncate flex items-center gap-2">
                             {user.name}
                             {user.nickname && <span className="text-[9px] px-1.5 py-0.5 bg-[var(--accent-start)]/10 text-[var(--accent-start)] rounded-md">@{user.nickname}</span>}
                          </h4>
                          <p className="text-[10px] text-[var(--text-muted)] font-medium flex items-center gap-1.5 mt-1">
                             <Mail size={10} /> {user.email}
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest mt-1.5 flex items-center gap-1.5 opacity-60">
                             <Fingerprint size={10} /> {user.matricula}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Papel & Acesso */}
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${
                        user.isAdmin 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 shadow-sm" 
                        : "bg-gray-500/5 border-gray-500/10 text-gray-400"
                      }`}>
                         {user.isAdmin ? <ShieldCheck size={12} /> : <ShieldOff size={12} />}
                         {user.isAdmin ? "Administrador" : "Membro"}
                      </div>
                    </td>

                    {/* Serviços (Espaço Preparado para o Futuro 🚀) */}
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-1.5">
                         <div className="px-2 py-1 bg-blue-500/5 border border-blue-500/10 rounded-lg text-[8px] font-black text-blue-500/70 uppercase tracking-tighter">Ecossistema BPlen</div>
                         <div className="px-2 py-1 bg-gray-500/5 border border-gray-500/10 rounded-lg text-[8px] font-black text-gray-400/40 uppercase tracking-tighter italic">
                            + Aguardando Produtos
                         </div>
                      </div>
                    </td>

                    {/* Status Onboard */}
                    <td className="px-8 py-6">
                      {user.onboardStatus === "completed" ? (
                        <div className="flex items-center gap-2 text-green-500 text-[10px] font-bold uppercase tracking-widest">
                           <CheckCircle2 size={14} /> Ativo
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-500 text-[10px] font-bold uppercase tracking-widest italic opacity-60">
                           <Loader2 size={12} className="animate-spin" /> Pendente
                        </div>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleToggleAdmin(user.matricula, user.isAdmin)}
                            disabled={processingUser === user.matricula}
                            className={`p-2.5 rounded-xl transition-all border ${
                              user.isAdmin 
                              ? "bg-red-500/5 border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                              : "bg-[var(--accent-start)]/5 border-[var(--accent-start)]/10 text-[var(--accent-start)] hover:bg-[var(--accent-start)] hover:text-white"
                            } disabled:opacity-30 disabled:pointer-events-none`}
                            title={user.isAdmin ? "Remover Privilégios Admin" : "Conceder Privilégios Admin"}
                          >
                             {processingUser === user.matricula ? (
                               <Loader2 size={16} className="animate-spin" />
                             ) : user.isAdmin ? (
                               <ShieldOff size={16} />
                             ) : (
                               <ShieldCheck size={16} />
                             )}
                          </button>
                          
                          <button className="p-2.5 rounded-xl bg-gray-500/5 border border-transparent text-[var(--text-muted)] hover:bg-white/10 transition-all opacity-40 group-hover:opacity-100">
                             <MoreVertical size={16} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rodapé Informativo */}
      <div className="p-8 glass bg-[var(--input-bg)]/50 rounded-[2.5rem] border-[var(--border-primary)] flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
          <div className="absolute right-0 top-0 w-32 h-32 bg-[var(--accent-start)]/5 blur-3xl rounded-full -mr-16 -mt-16" />
          <div className="space-y-1 text-left relative z-10">
              <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)]">Governança Corporativa</h5>
              <p className="text-[10px] text-[var(--text-muted)] opacity-60">
                 As permissões administrativas conferem acesso total a este painel e às coleções sensíveis do Firestore.
              </p>
          </div>
          <div className="flex items-center gap-4 relative z-10 shrink-0">
              <div className="text-right">
                  <p className="text-[9px] font-black text-[var(--accent-start)] uppercase tracking-widest">Base de Dados</p>
                  <p className="text-[10px] font-bold text-[var(--text-primary)]">Central Project BPlen v3</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[var(--accent-start)]/10 flex items-center justify-center text-[var(--accent-start)]">
                  <Layers size={18} />
              </div>
          </div>
      </div>
    </div>
  );
}
