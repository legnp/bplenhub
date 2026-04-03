"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Save, 
  Loader2, 
  Share2, 
  Phone, 
  Globe, 
  Type, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Calendar as CalendarIcon,
  MessageSquare,
  AlertCircle,
  Upload,
  CheckCircle2,
  HardDrive
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SocialPost, SocialPlatform } from "@/types/social";
import { createSocialPost, updateSocialPost } from "@/actions/social";
import { uploadSocialThumbnailToDrive, deleteSocialThumbnailFromDrive } from "@/actions/social-drive";

interface SocialPostFormProps {
  post?: SocialPost | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PLATFORMS: { id: SocialPlatform; label: string; icon: any }[] = [
  { id: 'linkedin', label: 'LinkedIn', icon: Share2 },
  { id: 'instagram', label: 'Instagram', icon: Share2 },
  { id: 'tiktok', label: 'TikTok', icon: Globe },
  { id: 'whatsapp', label: 'WhatsApp', icon: Phone },
  { id: 'other', label: 'Outro', icon: Type },
];

export function SocialPostForm({ post, onClose, onSuccess }: SocialPostFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Omit<SocialPost, 'id' | 'createdAt' | 'updatedAt'>>({
    platform: 'linkedin',
    title: '',
    summary: '',
    url: '',
    thumbnail: '',
    publishedAt: new Date().toISOString().split('T')[0],
    isActive: true,
    isFeatured: false,
  });

  useEffect(() => {
    if (post) {
      setFormData({
        platform: post.platform,
        title: post.title,
        summary: post.summary,
        url: post.url,
        thumbnail: post.thumbnail,
        publishedAt: post.publishedAt,
        isActive: post.isActive,
        isFeatured: post.isFeatured,
      });
    }
  }, [post]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação Manual de 2MB (Considere que o drive tem limites maiores, mas mantemos por performance no site)
    if (file.size > 2 * 1024 * 1024) {
      setError("O arquivo deve ter no máximo 2MB.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // 1. Criar FormData para a Server Action
      const driveFormData = new FormData();
      driveFormData.append("file", file);

      // 2. Upload para o Google Drive
      const result = await uploadSocialThumbnailToDrive(driveFormData);
      
      // 3. Se estiver editando e já houver uma imagem no Drive, apagar a antiga
      if (post && post.thumbnail && post.thumbnail !== result.url) {
         await deleteSocialThumbnailFromDrive(post.thumbnail);
      }

      setFormData(prev => ({ ...prev, thumbnail: result.url }));
    } catch (err: any) {
      setError(err.message || "Erro no upload para o Google Drive.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (post) {
        await updateSocialPost(post.id, formData);
      } else {
        await createSocialPost(formData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar postagem.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-[var(--border-primary)] flex justify-between items-center bg-[var(--input-bg)]/50">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
              {post ? "Editar Postagem" : "Nova Postagem Social"}
            </h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60">
              Gestão de Conteúdo via Drive 📁🛡️
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl text-[var(--text-muted)] hover:text-[var(--accent-start)] transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar text-left">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plataforma */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Rede Social</label>
              <div className="grid grid-cols-3 gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, platform: p.id })}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-[10px] font-bold uppercase tracking-tighter transition-all ${
                      formData.platform === p.id 
                      ? "bg-[var(--accent-start)]/10 border-[var(--accent-start)] text-[var(--accent-start)]" 
                      : "bg-[var(--input-bg)] border-[var(--border-primary)] text-[var(--text-muted)] hover:border-[var(--accent-start)]/30"
                    }`}
                  >
                    <p.icon size={14} />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Data de Publicação */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Data da Publicação</label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] opacity-40" />
                <input
                  type="date"
                  required
                  value={formData.publishedAt}
                  onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                  className="w-full bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-2xl pl-12 pr-6 py-3.5 text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)]/50 transition-all shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Seção de Mídia (Drive Upload) */}
          <div className="space-y-4 p-6 bg-[var(--accent-start)]/[0.03] border border-[var(--border-primary)] rounded-[2.5rem] shadow-sm">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1 flex items-center gap-2">
              <HardDrive size={14} className="text-[var(--accent-start)]" /> Armazenamento em Nuvem (Drive)
            </label>
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* Preview */}
              <div className="w-full md:w-36 h-36 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-primary)] overflow-hidden flex items-center justify-center shrink-0 group relative shadow-md">
                {formData.thumbnail ? (
                  <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <ImageIcon size={24} className="text-[var(--text-muted)] opacity-20" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-2">
                    <Loader2 size={24} className="text-white animate-spin" />
                    <span className="text-[8px] font-black text-white uppercase tracking-tighter">Sincronizando Drive...</span>
                  </div>
                )}
              </div>

              {/* Controles do Drive */}
              <div className="flex-1 space-y-4">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-black/10"
                >
                    {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    Fazer Upload p/ Drive (Máx 2MB)
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden" 
                    accept="image/*"
                />
                
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] opacity-40 shrink-0" />
                  <input
                    type="text"
                    required
                    placeholder="URL automática do Drive carregará aqui..."
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    className="w-full bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-2xl pl-12 pr-6 py-3.5 text-[10px] font-bold text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-start)]/50 transition-all placeholder:opacity-30"
                  />
                </div>
                {formData.thumbnail.includes("googleusercontent.com") && (
                   <div className="flex items-center gap-2 text-[9px] text-green-500 font-bold uppercase tracking-widest">
                      <CheckCircle2 size={12} /> Imagem salva com sucesso no Google Drive
                   </div>
                )}
              </div>
            </div>
          </div>

          {/* Legenda e Links */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Resumo / Legenda</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-[var(--text-muted)] opacity-40" />
                <textarea
                  required
                  rows={3}
                  placeholder="Inspiração, insight ou convite à leitura..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)]/50 transition-all placeholder:opacity-30 resize-none shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Link do Post Original</label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] opacity-40" />
                <input
                  type="url"
                  required
                  placeholder="https://www.linkedin.com/posts/..."
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full bg-[var(--input-bg)] border border-[var(--border-primary)] rounded-2xl pl-12 pr-6 py-3.5 text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-start)]/50 transition-all placeholder:opacity-30 shadow-inner"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-6 pt-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              className={`flex-1 p-5 rounded-2xl border border-[var(--border-primary)] transition-all flex items-center justify-between ${
                formData.isActive ? "bg-green-500/5 text-green-500 border-green-500/20" : "opacity-60 grayscale bg-[var(--input-bg)]"
              }`}
            >
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest">Status</p>
                <p className="text-[8px] font-bold uppercase opacity-60 tracking-wider font-mono">{formData.isActive ? "Publicado" : "Oculto"}</p>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.isActive ? "bg-green-500" : "bg-gray-400"}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.isActive ? "left-6" : "left-1"}`} />
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
              className={`flex-1 p-5 rounded-2xl border border-[var(--border-primary)] transition-all flex items-center justify-between ${
                formData.isFeatured ? "bg-[var(--accent-start)]/5 text-[var(--accent-start)] border-[var(--accent-start)]/20" : "opacity-60 grayscale bg-[var(--input-bg)]"
              }`}
            >
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest">Destaque</p>
                <p className="text-[8px] font-bold uppercase opacity-60 tracking-wider font-mono">{formData.isFeatured ? "Prioridade" : "Normal"}</p>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.isFeatured ? "bg-[var(--accent-start)]" : "bg-gray-400"}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.isFeatured ? "left-6" : "left-1"}`} />
              </div>
            </button>
          </div>
        </form>

        <div className="p-8 border-t border-[var(--border-primary)] bg-[var(--input-bg)]/50 flex justify-end gap-4 shadow-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving || isUploading}
            className="flex items-center gap-3 px-10 py-4.5 bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-[var(--accent-start)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? "Finalizando..." : post ? "Salvar Alterações" : "Salvar no BPlen HUB"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
