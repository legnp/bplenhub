"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  Mail, 
  QrCode, 
  ChevronDown, 
  Calendar, 
  ExternalLink, 
  CheckCircle2, 
  GraduationCap,
  Award,
  Zap,
  Briefcase,
  ArrowRight
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { LANDING_TOKENS } from "@/constants/landing-tokens";
import { ProfessionalProfile } from "@/config/profissionais";
import { generateVCard } from "@/lib/vcard";

interface ProfileViewProps {
  profile: ProfessionalProfile;
}

export function ProfessionalProfileView({ profile }: ProfileViewProps) {
  const [showQR, setShowQR] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  const scrollToDetails = () => {
    detailRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const vCardData = generateVCard({
    name: profile.name,
    role: profile.role,
    phone: profile.phone,
    email: profile.email,
    url: `${typeof window !== "undefined" ? window.location.origin : ""}/profissionais/${profile.slug}`
  });

  return (
    <div className="relative isolate">
      
      {/* 🔮 Glows Decorativos de Fundo */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#ff0080] rounded-full blur-[180px] opacity-[0.05] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#667eea] rounded-full blur-[180px] opacity-[0.05] pointer-events-none -z-10" />

      {/* ==========================================
          CAMADA 1: CARTÃO VIRTUAL (HERO)
      ========================================== */}
      <section className="h-[100dvh] w-full flex flex-col items-center justify-center px-6 relative">
        
        {/* Card Principal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-[400px] relative mt-[-20px]"
        >
          {/* Base do Card Glassmorphism */}
          <div className="relative group p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden">
            
            {/* Foto de Perfil (Circular & Glow) */}
            <div className="flex justify-center mb-6 relative">
              <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-[#ff0080] to-[#667eea] relative z-10">
                <div className="w-full h-full rounded-full border-2 border-black overflow-hidden relative">
                  <Image 
                    src={profile.photo} 
                    alt={profile.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-[#ff0080] rounded-full blur-[60px] opacity-10 animate-pulse" />
            </div>

            {/* Nome e Cargo */}
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1">
                {profile.name}
              </h1>
              <p className="text-[#ff0080] text-[10px] font-black uppercase tracking-[0.2em]">
                {profile.role}
              </p>
              <p className="text-xs text-gray-400 font-medium px-4 leading-relaxed line-clamp-2">
                {profile.shortBio}
              </p>
            </div>

            {/* Redes Sociais Integradas */}
            <div className="flex items-center justify-center gap-4 mb-8">
              {profile.social.linkedin && (
                <Link href={profile.social.linkedin} target="_blank" className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-[#0077B5]/10 hover:border-[#0077B5]/30 hover:scale-110 transition-all block">
                  <img src="/linkedin.webp" alt="LinkedIn" className="w-5 h-5 object-contain" />
                </Link>
              )}
              {profile.social.instagram && (
                <Link href={profile.social.instagram} target="_blank" className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-[#E1306C]/10 hover:border-[#E1306C]/30 hover:scale-110 transition-all block">
                  <img src="/insta.png" alt="Instagram" className="w-5 h-5 object-contain" />
                </Link>
              )}
              {profile.social.whatsapp && (
                <Link href={profile.social.whatsapp} target="_blank" className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-[#25D366]/10 hover:border-[#25D366]/30 hover:scale-110 transition-all block">
                  <img src="/whatsapp.png" alt="WhatsApp" className="w-5 h-5 object-contain" />
                </Link>
              )}
              {profile.social.tiktok && (
                <Link href={profile.social.tiktok} target="_blank" className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-[#00f2ea]/10 hover:border-[#00f2ea]/30 hover:scale-110 transition-all block">
                  <img src="/tiktok.png" alt="TikTok" className="w-5 h-5 object-contain" />
                </Link>
              )}
            </div>

            {/* Ações principais do Card */}
            <div className="space-y-3">
              <Link 
                href="/agendar"
                className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-[#ff0080] to-[#667eea] text-white rounded-2xl font-bold text-sm tracking-tight hover:shadow-[0_0_30px_rgba(255,0,128,0.3)] transition-all active:scale-[0.98]"
              >
                <Calendar size={18} />
                RESERVAR HORÁRIO
              </Link>
              
              <button 
                onClick={() => setShowQR(!showQR)}
                className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-sm tracking-tight hover:bg-white/10 transition-all"
              >
                <QrCode size={18} />
                {showQR ? "OCULTAR QR CODE" : "SALVAR CONTATO"}
              </button>
            </div>

            {/* Modal do QR Code (Inline) */}
            <AnimatePresence>
              {showQR && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute inset-0 z-50 bg-[#070707]/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className="bg-white p-4 rounded-3xl mb-4 border-4 border-[#ff0080]/20">
                    <QRCodeSVG 
                      value={vCardData} 
                      size={180}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-white font-bold mb-1">Escaneie para Salvar</p>
                  <p className="text-xs text-gray-400 mb-6 px-4 leading-relaxed">Aponte a câmera para salvar o contato imediatamente na sua agenda.</p>
                  <button 
                    onClick={() => setShowQR(false)}
                    className="text-[10px] font-black text-[#ff0080] uppercase tracking-widest hover:text-white transition-colors"
                  >
                    FECHAR
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Logo BPlen Sutil abaixo do card */}
          <div className="flex justify-center mt-8 opacity-20">
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white">BPlen HUB</span>
          </div>

        </motion.div>

        {/* Gatilho para Camada 2 */}
        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={scrollToDetails}
          className="absolute bottom-10 flex flex-col items-center gap-2 text-gray-500 hover:text-white transition-colors group cursor-pointer"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Conheça mais minha trajetória</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </motion.button>

      </section>

      {/* ==========================================
          CAMADA 2: PERFIL COMPLETO (DETALHES)
      ========================================== */}
      <section ref={detailRef} className="py-24 px-6 relative overflow-hidden bg-white/[0.01]">
        <div className={LANDING_TOKENS.container}>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Coluna 1: Manifesto & Formação */}
            <div className="lg:col-span-12 lg:col-start-1 space-y-12 mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <span className={LANDING_TOKENS.header.kicker}>Sobre Lisandra</span>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.1] max-w-3xl">
                  {profile.name}: Uma visão técnica com <span className="text-gray-400">olhar profundamente humano</span>.
                </h2>
                <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-4xl italic">
                  &quot;{profile.details.about}&quot;
                </p>
              </motion.div>
            </div>

            {/* Grid de Informações Aprofundadas */}
            <div className="lg:col-span-7 space-y-16">
              
              {/* Timeline Dinâmica */}
              <div className="space-y-8">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <Briefcase size={20} className="text-[#ff0080]" />
                  Experiência Profissional
                </h3>
                <div className="relative border-l border-white/5 ml-3 space-y-12 py-4">
                  {profile.details.timeline.map((item, idx) => (
                    <div key={idx} className="relative pl-8">
                      <div className={`absolute w-6 h-6 border rounded-full -left-3 top-[-2px] flex items-center justify-center bg-black
                        ${item.isHighlight ? "border-[#ff0080]/50 shadow-[0_0_15px_rgba(255,0,128,0.3)]" : "border-white/10"}`}>
                        <div className={`w-2 h-2 rounded-full ${item.isHighlight ? "bg-[#ff0080]" : "bg-gray-700"}`} />
                      </div>
                      <span className={`text-[10px] font-black tracking-widest uppercase mb-1 block ${item.isHighlight ? "text-[#ff0080]" : "text-gray-500"}`}>
                        {item.year}
                      </span>
                      <h4 className={`text-lg font-bold ${item.isHighlight ? "text-white" : "text-gray-300"}`}>
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Resultados Citados */}
              {profile.details.results && (
                <div className="p-8 md:p-10 rounded-[2rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                  <Award className="absolute top-[-20px] right-[-20px] w-40 h-40 text-white/5 rotate-12 group-hover:rotate-6 transition-transform duration-1000" />
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <Zap size={20} className="text-[#ff0080]" />
                      Principais Resultados
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.details.results.map((result, idx) => (
                        <div key={idx} className="flex gap-3 items-start">
                          <CheckCircle2 size={16} className="text-[#ff0080] shrink-0 mt-1" />
                          <p className="text-sm text-gray-300 leading-relaxed font-medium">{result}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Coluna Lateral: Educação & Perfil */}
            <div className="lg:col-span-5 space-y-12">
              
              {/* Educação */}
              <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                  <GraduationCap size={18} className="text-[#ff0080]" />
                  Base Acadêmica
                </h3>
                <div className="space-y-4">
                  {profile.details.education.map((edu, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      <p className="text-sm text-gray-400 font-medium">{edu}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Perfil Comportamental */}
              {profile.details.behavioralProfile && (
                <div className="p-8 rounded-[2rem] bg-gradient-to-br from-[#ff0080]/5 to-[#667eea]/5 border border-white/5">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-3">
                    {profile.details.behavioralProfile.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed italic">
                    &quot;{profile.details.behavioralProfile.description}&quot;
                  </p>
                </div>
              )}

              {/* CTA Final de Aprofundamento */}
              <div className="p-8 rounded-[2rem] border border-white/10 flex flex-col gap-6 items-center text-center">
                <p className="text-sm text-gray-300 font-medium leading-relaxed">
                  Deseja descomplicar o desenvolvimento humano no seu trabalho ou negócio?
                </p>
                <Link 
                  href="/agendar"
                  className="inline-flex items-center gap-2 text-xs font-black text-[#ff0080] uppercase tracking-widest hover:gap-4 transition-all"
                >
                  Agende um 1 to 1 com Lisandra <ArrowRight size={14} />
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
