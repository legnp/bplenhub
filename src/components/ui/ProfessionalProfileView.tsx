"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  Mail, 
  Phone,
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
      
      {/* Glows Decorativos de Fundo */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[var(--accent-start)] rounded-full blur-[180px] opacity-[0.05] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--accent-end)] rounded-full blur-[180px] opacity-[0.05] pointer-events-none -z-10" />

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
          <div className="relative group p-8 rounded-[2.5rem] bg-[var(--glass-bg)] border border-[var(--border-primary)] backdrop-blur-2xl shadow-2xl overflow-hidden">
            
            {/* Foto de Perfil (Circular & Glow) */}
            <div className="flex justify-center mb-6 relative">
              <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-[var(--accent-start)] to-[var(--accent-end)] relative z-10">
                <div className="w-full h-full rounded-full border-2 border-[var(--bg-primary)] overflow-hidden relative">
                  <Image 
                    src={profile.photo} 
                    alt={profile.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-[var(--accent-start)] rounded-full blur-[60px] opacity-10 animate-pulse" />
            </div>

            {/* Nome e Cargo */}
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-1">
                {profile.name}
              </h1>
              <p className="text-[var(--accent-start)] text-[10px] font-black uppercase tracking-[0.2em]">
                {profile.role}
              </p>
              <p className="text-xs text-[var(--text-muted)] font-medium px-4 leading-relaxed line-clamp-2">
                {profile.shortBio}
              </p>
            </div>

            {/* Redes Sociais Integradas */}
            <div className="flex items-center justify-center gap-4 mb-8">
              {profile.social.linkedin && (
                <Link href={profile.social.linkedin} target="_blank" className="p-3 bg-[var(--social-bg)] border border-[var(--border-primary)] rounded-2xl hover:bg-[var(--accent-soft)] hover:border-[var(--accent-start)]/30 hover:scale-110 transition-all block text-[var(--accent-start)]">
                  <img src="/linkedin.webp" alt="LinkedIn" className="w-5 h-5 object-contain opacity-[var(--social-icon-opacity)] hover:opacity-100 transition-opacity" />
                </Link>
              )}
              {profile.social.instagram && (
                <Link href={profile.social.instagram} target="_blank" className="p-3 bg-[var(--social-bg)] border border-[var(--border-primary)] rounded-2xl hover:bg-[var(--accent-soft)] hover:border-[var(--accent-start)]/30 hover:scale-110 transition-all block text-[var(--accent-start)]">
                  <img src="/insta.png" alt="Instagram" className="w-5 h-5 object-contain opacity-[var(--social-icon-opacity)] hover:opacity-100 transition-opacity" />
                </Link>
              )}
              {profile.social.whatsapp && (
                <Link href={profile.social.whatsapp} target="_blank" className="p-3 bg-[var(--social-bg)] border border-[var(--border-primary)] rounded-2xl hover:bg-[var(--accent-soft)] hover:border-[var(--accent-start)]/30 hover:scale-110 transition-all block text-[var(--accent-start)]">
                  <img src="/whatsapp.png" alt="WhatsApp" className="w-5 h-5 object-contain opacity-[var(--social-icon-opacity)] hover:opacity-100 transition-opacity" />
                </Link>
              )}
              {profile.social.tiktok && (
                <Link href={profile.social.tiktok} target="_blank" className="p-3 bg-[var(--social-bg)] border border-[var(--border-primary)] rounded-2xl hover:bg-[var(--accent-soft)] hover:border-[var(--accent-start)]/30 hover:scale-110 transition-all block text-[var(--accent-start)]">
                  <img src="/tiktok.png" alt="TikTok" className="w-5 h-5 object-contain opacity-[var(--social-icon-opacity)] hover:opacity-100 transition-opacity" />
                </Link>
              )}
            </div>
            
            {/* Informações de Contato Direto */}
            <div className="flex flex-col items-center gap-1.5 mb-8">
              <div className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors group cursor-default">
                <Mail size={12} className="text-[var(--accent-start)]/50 group-hover:text-[var(--accent-start)] transition-colors" />
                <span className="text-[10px] font-medium tracking-wider">{profile.email}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors group cursor-default">
                <Phone size={12} className="text-[var(--accent-start)]/50 group-hover:text-[var(--accent-start)] transition-colors" />
                <span className="text-[10px] font-medium tracking-wider">{profile.phone}</span>
              </div>
            </div>

            {/* Ações principais do Card */}
            <div className="space-y-3">
              <Link 
                href="/agendar"
                className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)] text-white rounded-2xl font-bold text-sm tracking-tight hover:shadow-[0_0_30px_rgba(var(--accent-start-rgb),0.3)] transition-all active:scale-[0.98]"
              >
                <Calendar size={18} />
                RESERVAR HORÁRIO
              </Link>
              
              <button 
                onClick={() => setShowQR(!showQR)}
                className="w-full flex items-center justify-center gap-3 py-4 bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] rounded-2xl font-bold text-sm tracking-tight hover:bg-[var(--accent-soft)] transition-all"
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
                  className="absolute inset-0 z-50 bg-[var(--bg-primary)]/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className="bg-white p-4 rounded-3xl mb-4 border-4 border-[var(--accent-start)]/20">
                    <QRCodeSVG 
                      value={vCardData} 
                      size={180}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-[var(--text-primary)] font-bold mb-1">Escaneie para Salvar</p>
                  <p className="text-xs text-[var(--text-muted)] mb-6 px-4 leading-relaxed">Aponte a câmera para salvar o contato imediatamente na sua agenda.</p>
                  <button 
                    onClick={() => setShowQR(false)}
                    className="text-[10px] font-black text-[var(--accent-start)] uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors"
                  >
                    FECHAR
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Logo BPlen Sutil abaixo do card */}
          <div className="flex justify-center mt-8 opacity-20">
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[var(--text-primary)]">BPlen HUB</span>
          </div>

        </motion.div>

        {/* Gatilho para Camada 2 */}
        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={scrollToDetails}
          className="absolute bottom-10 flex flex-col items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors group cursor-pointer"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Conheça mais minha trajetória</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </motion.button>

      </section>

      {/* ==========================================
          CAMADA 2: PERFIL COMPLETO (DETALHES)
      ========================================== */}
      <section ref={detailRef} className="py-24 px-6 relative overflow-hidden bg-[var(--bg-primary)]/5">
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
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.1] max-w-3xl text-[var(--text-primary)]">
                  {profile.name}: Uma visão técnica com <span className="text-[var(--text-muted)]">olhar profundamente humano</span>.
                </h2>
                <p className="text-lg md:text-xl text-[var(--text-muted)] leading-relaxed max-w-4xl italic">
                  &quot;{profile.details.about}&quot;
                </p>
              </motion.div>
            </div>

            {/* Grid de Informações Aprofundadas */}
            <div className="lg:col-span-7 space-y-16">
              
              {/* Timeline Dinâmica */}
              <div className="space-y-8">
                <h3 className="text-xl font-bold flex items-center gap-3 text-[var(--text-primary)]">
                  <Briefcase size={20} className="text-[var(--accent-start)]" />
                  Experiência Profissional
                </h3>
                <div className="relative border-l border-[var(--border-primary)] ml-3 space-y-12 py-4">
                  {profile.details.timeline.map((item, idx) => (
                    <div key={idx} className="relative pl-8">
                      <div className={`absolute w-6 h-6 border rounded-full -left-3 top-[-2px] flex items-center justify-center bg-[var(--bg-primary)]
                        ${item.isHighlight ? "border-[var(--accent-start)]/50 shadow-[0_0_15px_rgba(var(--accent-start-rgb),0.3)]" : "border-[var(--border-primary)]"}`}>
                        <div className={`w-2 h-2 rounded-full ${item.isHighlight ? "bg-[var(--accent-start)]" : "bg-[var(--text-muted)]"}`} />
                      </div>
                       <span className={`text-[10px] font-black tracking-widest uppercase mb-1 block ${item.isHighlight ? "text-[var(--accent-start)]" : "text-[var(--text-muted)]"}`}>
                        {item.year}
                      </span>
                      <h4 className={`text-lg font-bold ${item.isHighlight ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-sm text-[var(--text-muted)] mt-1 leading-relaxed">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Resultados Citados */}
              {profile.details.results && (
                <div className="p-8 md:p-10 rounded-[2rem] bg-[var(--glass-bg)] border border-[var(--border-primary)] relative overflow-hidden group">
                  <Award className="absolute top-[-20px] right-[-20px] w-40 h-40 text-[var(--accent-start)]/5 rotate-12 group-hover:rotate-6 transition-transform duration-1000" />
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-[var(--text-primary)]">
                      <Zap size={20} className="text-[var(--accent-start)]" />
                      Principais Resultados
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.details.results.map((result, idx) => (
                        <div key={idx} className="flex gap-3 items-start">
                          <CheckCircle2 size={16} className="text-[var(--accent-start)] shrink-0 mt-1" />
                          <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">{result}</p>
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
              <div className="p-8 rounded-[2rem] bg-[var(--glass-bg)] border border-[var(--border-primary)]">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-3 text-[var(--text-primary)]">
                  <GraduationCap size={18} className="text-[var(--accent-start)]" />
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
