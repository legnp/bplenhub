"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Users, 
  Search, 
  ShieldCheck, 
  ShieldOff, 
  UserCircle, 
  Mail, 
  Fingerprint, 
  Loader2,
  Activity,
  Layers,
  CheckCircle2,
  ChevronDown,
  Settings,
  X,
  CreditCard,
  Rocket
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminUser, UserRole, UserServices } from "@/types/users";
import { getAdminUsersList, updateUserPermissions } from "@/actions/users-admin";
import { auth } from "@/lib/firebase";
import { useAuthContext } from "@/context/AuthContext";

/**
 * BPlen HUB — Gestão de Usuários e Governança 👥🏗️🛡️
 * Fundação para controle de papéis e produtos/serviços granulares.
 */

const ROLE_OPTIONS: { id: UserRole; label: string; icon: any }[] = [
  { id: "admin", label: "Administrador", icon: ShieldCheck },
  { id: "member", label: "Membro", icon: Users },
  { id: "visitor", label: "Visitante", icon: UserCircle },
];

const PREDEFINED_SERVICES = [
  { id: "hub_community", label: "Comunidade HUB" },
  { id: "survey_welcome", label: "Dossiê de Boas-Vindas" },
  { id: "member_area_access", label: "🔒 Área de Membro" }, // NOVO ENTITLEMENT
  { id: "content_premium", label: "Conteúdos Premium" },
  { id: "mentoria_1to1", label: "Mentoria 1-to-1" },
  { id: "career_planning", label: "Planejamento de Carreira" },
  { id: "behavioral_analysis", label: "Análise Comportamental" },
];

export default function UsersManagementPage() {
  const { isAdmin: currentAdminStatus, loading: authLoading } = useAuthContext();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [processingUser, setProcessingUser] = useState<string | null>(null);
  
  // Modal de Serviços
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const result = await getAdminUsersList(token);
      
      if (result.success && result.data) {
        setUsers(result.data);
        setError(null);
      } else {
        setError(result.error || "Falha desconhecida ao carregar usuários.");
      }
    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError("Erro interno ao processar a requisição.");
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
      
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
        
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleUpdateRole = async (targetMatricula: string, newRole: UserRole) => {
    setProcessingUser(targetMatricula);
    try {
      const token = await auth.currentUser?.getIdToken();
      await updateUserPermissions(targetMatricula, { role: newRole }, token);
      
      setUsers(prev => prev.map(u => 
        u.matricula === targetMatricula ? { ...u, role: newRole, isAdmin: newRole === 'admin' } : u
      ));
    } catch (err: any) {
      alert(err.message || "Erro ao atualizar perfil.");
    } finally {
      setProcessingUser(null);
    }
  };

  const handleUpdateServices = async (targetMatricula: string, services: UserServices) => {
    setProcessingUser(targetMatricula);
    try {
      const token = await auth.currentUser?.getIdToken();
      await updateUserPermissions(targetMatricula, { services }, token);
      
      setUsers(prev => prev.map(u => 
        u.matricula === targetMatricula ? { ...u, services } : u
      ));
      setSelectedUser(null);
    } catch (err: any) {
      alert(err.message || "Erro ao atualizar serviços.");
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
            Controle centralizado de membros, papéis e permissões de acesso.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex items-center gap-3 glass px-6 py-3 border-blue-500/10 bg-blue-500/5">
            <Activity size={16} className="text-blue-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
               Role/Service Engine Active
            </span>
          </div>

          <button
            onClick={async () => {
              if (!confirm("Deseja executar a migração de dados legados? Isso irá atualizar todos os perfis para o novo padrão institucional.")) return;
              try {
                const { runWelcomeMigration } = await import("@/actions/migration-welcome");
                const res = await runWelcomeMigration();
                if (res.success && res.results) {
                  alert(`Sucesso! ${res.results.migrated} usuários migrados de um total de ${res.results.total}. (${res.results.skipped} pulados).`);
                  fetchUsers();
                } else {
                  alert(`Falha na migração de dados.`);
                }
              } catch (err: any) {
                alert(`Erro crítico: ${err.message}`);
              }
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--accent-start)]/10 border border-[var(--accent-start)]/20 text-[var(--accent-start)] rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-[var(--accent-start)] hover:text-white transition-all group"
          >
            <Rocket size={14} className="group-hover:translate-x-1 transition-transform" />
            Migrar Dados Legados (Cleanup)
          </button>
        </div>
      </div>

      {/* ⚠️ Alerta de Erro (Debug) */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center gap-4 text-red-500 shadow-2xl"
          >
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0">
               <X size={18} />
            </div>
            <div className="flex-1">
               <h5 className="text-[10px] font-black uppercase tracking-widest">Erro de Sincronização</h5>
               <p className="text-sm font-medium opacity-80">{error}</p>
            </div>
            <button 
              onClick={() => fetchUsers()}
              className="px-6 py-2 bg-red-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-all"
            >
              Tentar Novamente
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
          {['all', 'admin', 'member', 'visitor'].map((role) => (
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
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Papel (Role)</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Acessos Granulares</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Onboard</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-10 bg-white/5 opacity-50 italic text-[10px] uppercase font-bold tracking-widest">Sincronizando governança...</td>
                  </tr>
                ))
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
                        </div>
                      </div>
                    </td>

                    {/* Papel (Role) - Seletor Estrutural */}
                    <td className="px-8 py-6">
                      <div className="relative group/role inline-block">
                        <select 
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user.matricula, e.target.value as UserRole)}
                          disabled={processingUser === user.matricula}
                          className={`appearance-none font-black text-[9px] uppercase tracking-widest pl-3 pr-8 py-2 rounded-xl border transition-all cursor-pointer focus:outline-none ${
                            user.role === 'admin' 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" 
                            : user.role === 'member'
                            ? "bg-blue-500/10 border-blue-500/20 text-blue-600"
                            : "bg-gray-500/10 border-gray-500/20 text-gray-500"
                          } disabled:opacity-30`}
                        >
                          <option value="visitor">Visitante</option>
                          <option value="member">Membro</option>
                          <option value="admin">Administrador</option>
                        </select>
                        <ChevronDown size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
                      </div>
                    </td>

                    {/* Acessos (Destaque para Entitlements) */}
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => setSelectedUser(user)}
                        className="flex flex-wrap gap-1.5 hover:scale-[1.02] transition-transform text-left"
                      >
                         {Object.values(user.services).filter(v => v === true).length > 0 ? (
                            Object.entries(user.services)
                              .filter(([_, active]) => active)
                              .map(([id]) => (
                                <div key={id} className="px-2 py-1 bg-[var(--accent-start)]/5 border border-[var(--accent-start)]/10 rounded-lg text-[8px] font-black text-[var(--accent-start)]/70 uppercase tracking-tighter">
                                   {PREDEFINED_SERVICES.find(s => s.id === id)?.label || id}
                                </div>
                              ))
                         ) : (
                            <div className="px-2 py-1 bg-gray-500/5 border border-dashed border-gray-500/20 rounded-lg text-[8px] font-black text-gray-400 uppercase tracking-tighter">
                               Acesso Padrão (Sem Serviços)
                            </div>
                         )}
                      </button>
                    </td>

                    {/* Status Onboard */}
                    <td className="px-8 py-6">
                      <div className={`text-[10px] font-bold uppercase tracking-widest ${user.onboardStatus === 'completed' ? 'text-green-500' : 'text-amber-500 opacity-60'}`}>
                         {user.onboardStatus === 'completed' ? <CheckCircle2 size={14} className="inline mr-1" /> : <Loader2 size={12} className="inline mr-1 animate-spin" />}
                         {user.onboardStatus === 'completed' ? "Ativo" : "Pendente"}
                      </div>
                    </td>

                    {/* Ações Granulares */}
                    <td className="px-8 py-6 text-right">
                       <button 
                         onClick={() => setSelectedUser(user)}
                         className="p-3 rounded-xl bg-black text-white hover:bg-[var(--accent-start)] transition-all shadow-lg shadow-black/10 flex items-center gap-2 ml-auto"
                       >
                          <Settings size={14} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Gerenciar Serviços</span>
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Gestão de Serviços (Entitlements) */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedUser(null)}
               className="absolute inset-0 bg-black/80 backdrop-blur-md"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[3rem] overflow-hidden shadow-2xl"
             >
                {/* Modal Header */}
                <div className="p-8 border-b border-[var(--border-primary)] bg-[var(--input-bg)]/50 flex justify-between items-center text-left">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-[var(--accent-start)] uppercase tracking-widest">Acessos Granulares</p>
                      <h3 className="text-xl font-black text-[var(--text-primary)]">{selectedUser.name}</h3>
                      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight opacity-60">Configuração de Produtos & Serviços</p>
                   </div>
                   <button onClick={() => setSelectedUser(null)} className="p-3 rounded-2xl hover:bg-white/10 transition-all text-gray-500">
                      <X size={20} />
                   </button>
                </div>

                {/* Modal Body */}
                <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                   <div className="grid grid-cols-1 gap-4">
                      {PREDEFINED_SERVICES.map((service) => {
                         const isActive = selectedUser.services[service.id];
                         return (
                            <button 
                              key={service.id}
                              onClick={() => {
                                 const newServices = { ...selectedUser.services, [service.id]: !isActive };
                                 setSelectedUser({ ...selectedUser, services: newServices });
                              }}
                              className={`p-6 border rounded-[1.5rem] flex items-center justify-between transition-all group ${
                                isActive 
                                ? "bg-[var(--accent-start)]/5 border-[var(--accent-start)]/30" 
                                : "bg-[var(--input-bg)] border-[var(--border-primary)]"
                              }`}
                            >
                               <div className="flex items-center gap-4 text-left">
                                  <div className={`p-3 rounded-xl border transition-all ${
                                     isActive ? "bg-[var(--accent-start)] text-white border-[var(--accent-start)]" : "bg-white/5 border-[var(--border-primary)] text-gray-500"
                                  }`}>
                                     {isActive ? <Rocket size={18} /> : <Layers size={18} />}
                                  </div>
                                  <div>
                                     <h5 className={`font-black text-sm transition-colors ${isActive ? "text-[var(--accent-start)]" : "text-[var(--text-primary)]"}`}>
                                        {service.label}
                                     </h5>
                                     <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] opacity-60 mt-1">
                                        Liberação de trilha & Hub
                                     </p>
                                  </div>
                               </div>
                               <div className={`w-10 h-5 rounded-full relative transition-all ${isActive ? "bg-[var(--accent-start)]" : "bg-gray-700"}`}>
                                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isActive ? "left-6" : "left-1"}`} />
                               </div>
                            </button>
                         );
                      })}
                   </div>
                </div>

                {/* Modal Footer */}
                <div className="p-8 border-t border-[var(--border-primary)] bg-[var(--input-bg)]/50 flex justify-end gap-4">
                   <button 
                     onClick={() => setSelectedUser(null)}
                     className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white transition-all"
                   >
                      Cancelar
                   </button>
                   <button 
                     onClick={() => handleUpdateServices(selectedUser.matricula, selectedUser.services)}
                     disabled={processingUser === selectedUser.matricula}
                     className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30"
                   >
                      {processingUser === selectedUser.matricula ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                      {processingUser === selectedUser.matricula ? "Salvando..." : "Atualizar Acessos"}
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rodapé Informativo */}
      <div className="p-8 glass bg-[var(--input-bg)]/50 rounded-[2.5rem] border-[var(--border-primary)] flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
          <div className="absolute right-0 top-0 w-32 h-32 bg-[var(--accent-start)]/5 blur-3xl rounded-full -mr-16 -mt-16" />
          <div className="space-y-1 text-left relative z-10">
              <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)]">Entitlements Framework v1.0</h5>
              <p className="text-[10px] text-[var(--text-muted)] opacity-60">
                 Os papéis definem permissões de plataforma, enquanto os acessos granulares liberam produtos e conteúdos específicos.
              </p>
          </div>
          <div className="flex items-center gap-4 relative z-10 shrink-0">
              <div className="text-right">
                  <p className="text-[9px] font-black text-[var(--accent-start)] uppercase tracking-widest">Base de Governança</p>
                  <p className="text-[10px] font-bold text-[var(--text-primary)]">User_Permissions/access</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[var(--accent-start)]/10 flex items-center justify-center text-[var(--accent-start)]">
                  <Layers size={18} />
              </div>
          </div>
      </div>
    </div>
  );
}
