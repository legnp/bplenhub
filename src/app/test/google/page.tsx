"use client";

import React, { useState, useEffect } from "react";
import { 
  testCalendar, 
  testDriveFolders, 
  testSheets, 
  testUpload,
  testEmail,
  testFirestore
} from "./actions";
import { 
  Calendar, 
  FolderPlus, 
  FileSpreadsheet, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft,
  Zap,
  Mail,
  ChevronDown,
  Database,
  Lock,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { auth } from "@/lib/firebase";
import { useAuthContext } from "@/context/AuthContext";

/**
 * BPlen HUB — Laboratório de Testes Google APIs e Resend 🧪
 * Interface dedicada para validar Calendar, Drive, Sheets e E-mail.
 */

const ALIASES = [
  { id: "it", name: "BPlen IT" },
  { id: "atendimento", name: "BPlen Atendimento" },
  { id: "hub", name: "BPlen HUB" },
  { id: "financeiro", name: "BPlen Financeiro" },
  { id: "lisandra.lencina", name: "Lisandra Lencina (BPlen)" },
];

export default function GoogleTestLab() {
  const { user, isAdmin, loading: authLoading } = useAuthContext();
  const [results, setResults] = useState<Record<string, { success: boolean, message?: string, data?: unknown, id?: string, from?: string }>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [selectedAlias, setSelectedAlias] = useState(ALIASES[0].id);
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    // Verificação de ambiente no cliente (apenas para UI)
    // A proteção real ocorre no servidor via requireAdmin()
    if (process.env.NODE_ENV === "production") {
      setIsProduction(true);
    }
  }, []);

  const runTest = async (testId: string, testFn: (arg?: any, token?: string) => Promise<{ success: boolean, message?: string }>, arg?: unknown) => {
    setLoading(prev => ({ ...prev, [testId]: true }));
    try {
      // 🛡️ Obtendo ID Token para validação real no servidor
      const token = await auth.currentUser?.getIdToken();
      
      const res = await (arg !== undefined ? testFn(arg, token) : testFn(undefined, token));
      setResults(prev => ({ ...prev, [testId]: res }));
    } catch (err: unknown) {
      const error = err as Error;
      setResults(prev => ({ ...prev, [testId]: { success: false, message: error.message } }));
    } finally {
      setLoading(prev => ({ ...prev, [testId]: false }));
    }
  };

  // Bloqueio de Segurança para Produção (UI)
  if (isProduction) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-6">
        <div className="max-w-md w-full glass p-12 text-center space-y-6 border-red-500/20">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-500 mx-auto">
            <Lock size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-red-600">Acesso Restrito</h1>
            <p className="text-gray-500 text-sm">
              O Laboratório de Testes está desativado em ambiente de produção por motivos de segurança.
            </p>
          </div>
          <Link href="/" className="inline-block px-10 py-4 bg-black text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all">
            Voltar para Início
          </Link>
        </div>
      </div>
    );
  }

  // Verificação de Admin (UI)
  if (!authLoading && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-6">
        <div className="max-w-md w-full glass p-12 text-center space-y-6 border-amber-500/20">
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-amber-500 mx-auto">
            <AlertTriangle size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-amber-600">Apenas para Administradores</h1>
            <p className="text-gray-500 text-sm">
              Você não possui permissões administrativas para acessar as ferramentas de laboratório.
            </p>
          </div>
          <Link href="/" className="inline-block px-10 py-4 bg-black text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all">
            Voltar para Início
          </Link>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TestCard = ({ id, title, description, icon: Icon, testFn, children }: { id: string; title: string; description: string; icon: React.ElementType; testFn: (arg?: any, token?: string) => Promise<any>; children?: React.ReactNode }) => {
    const res = results[id];
    const isLoading = loading[id];

    return (
      <motion.div 
        whileHover={{ y: -4 }}
        className="glass p-8 flex flex-col gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center border border-white/20">
            <Icon className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-xs text-[#6E6E73]">{description}</p>
          </div>
        </div>

        {children}

        {res && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 transition-opacity duration-300 ${
            res.success ? "bg-green-50/50 border-green-200/50" : "bg-red-50/50 border-red-200/50"
          }`}>
            {res.success ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500 shrink-0" />
            )}
            <div className="flex flex-col gap-1 overflow-hidden">
              <p className={`text-sm font-medium ${res.success ? "text-green-700" : "text-red-700"}`}>
                {res.message || (res.success ? "Operação concluída" : "Falha na operação")}
              </p>
              {res.id && res.success && (
                <div className="mt-2 text-[10px] font-mono opacity-60 break-all bg-white/40 p-2 rounded-lg">
                  ID: {res.id}
                  {res.from && <div className="mt-1">From: {res.from}</div>}
                </div>
              )}
            </div>
          </div>
        )}

        <button
          onClick={() => runTest(id, testFn, id === "email" ? selectedAlias : undefined)}
          disabled={isLoading}
          className="mt-auto w-full glass py-3 flex items-center justify-center gap-2 font-medium hover:bg-white/40 transition-all disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-blue-500 text-blue-500" />}
          {isLoading ? "Validando..." : id === "email" ? "Enviar E-mail de Teste" : "Executar Teste"}
        </button>
      </motion.div>
    );
  };

  return (
    <main className="min-h-screen bg-[#F5F7FA] p-6 lg:p-12">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2">
              <Link href="/test/auth" className="text-xs font-semibold text-blue-500 hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Voltar
              </Link>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">
              Laboratório <span className="text-blue-500">BPlen HUB</span> 🧪
            </h1>
            <p className="text-sm text-[#6E6E73] flex items-center gap-2">
              Validação total de infraestrutura (Drive, Calendar e E-mail)
            </p>
          </div>
          
          <div className="glass px-6 py-3 border-blue-500/20 bg-blue-50/30 flex items-center gap-3 self-start md:self-center">
             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
             <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                Service Account Connected
             </span>
          </div>
        </div>

        {/* Grid de Testes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          
          <TestCard 
            id="calendar"
            title="Agenda"
            description="Consulta de eventos (Calendar)"
            icon={Calendar}
            testFn={testCalendar}
          />

          <TestCard 
            id="folders"
            title="Pastas"
            description="Criação hierárquica (Drive)"
            icon={FolderPlus}
            testFn={testDriveFolders}
          />

          <TestCard 
            id="sheets"
            title="Sheets"
            description="Escrita dinâmica (Portfólio)"
            icon={FileSpreadsheet}
            testFn={testSheets}
          />

          <TestCard 
            id="upload"
            title="Upload"
            description="Envio de arquivos (Ata)"
            icon={Upload}
            testFn={testUpload}
          />

          <TestCard 
            id="email"
            title="E-mail"
            description="Envio com Alias (Resend)"
            icon={Mail}
            testFn={testEmail}
          >
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-[#6E6E73] uppercase tracking-wider">
                Selecione o Remetente
              </label>
              <div className="relative group">
                <select 
                  value={selectedAlias}
                  onChange={(e) => setSelectedAlias(e.target.value)}
                  className="w-full glass py-3 px-4 appearance-none text-sm font-medium cursor-pointer focus:outline-none hover:bg-white/40 transition-all pr-10"
                >
                  {ALIASES.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#6E6E73] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          </TestCard>

          <TestCard 
            id="database"
            title="Banco de Dados"
            description="Escrita e Leitura (Firestore)"
            icon={Database}
            testFn={testFirestore}
          />

        </div>

      </div>
    </main>
  );
}
