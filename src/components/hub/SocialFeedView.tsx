"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  ArrowUpRight, 
  Globe, 
  Phone, 
  Search,
  Calendar,
  Sparkles,
  Share2
} from "lucide-react";
import { SocialPost, SocialPlatform } from "@/types/social";

interface SocialFeedViewProps {
  posts: SocialPost[];
}

const platformIcons: Record<SocialPlatform, any> = {
  linkedin: Share2,
  instagram: Share2,
  tiktok: Globe,
  whatsapp: Phone,
  other: Search
};

const platformNames: Record<SocialPlatform, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  other: "Canal"
};

export function SocialFeedView({ posts }: SocialFeedViewProps) {
  if (posts.length === 0) {
    return (
      <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/50">
        <Sparkles className="w-16 h-16 text-gray-200 mx-auto mb-6" />
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Nenhum conteúdo no momento</p>
        <p className="text-[11px] text-gray-400 opacity-60 mt-3 max-w-xs mx-auto">
          Fique atento às nossas redes sociais para atualizações constantes.
        </p>
      </div>
    );
  }

  // Ordenação: Destaques primeiro, depois por data
  const sortedPosts = [...posts].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return 0; // Já vêm ordenados por data da action
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
      {sortedPosts.map((post, idx) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1 }}
          className="group relative flex flex-col bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
        >
          {/* Featured Badge */}
          {post.isFeatured && (
            <div className="absolute top-6 right-6 z-10 px-3 py-1.5 bg-black text-white text-[8px] font-black uppercase tracking-widest rounded-full flex items-center gap-2 shadow-xl">
              <Sparkles size={10} className="text-[var(--accent-start)]" />
              Destaque
            </div>
          )}

          {/* Thumbnail */}
          <div className="relative h-60 overflow-hidden bg-gray-50">
            <img 
              src={post.thumbnail} 
              alt={post.title} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=600';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-0 group-hover:opacity-10 transition-opacity" />
            
            {/* Platform Icon Overlay */}
            <div className="absolute bottom-6 left-6 p-3 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-100 shadow-xl group-hover:scale-110 transition-transform">
              {React.createElement(platformIcons[post.platform] || Search, { size: 16, className: "text-black" })}
            </div>
          </div>

          {/* Content */}
          <div className="p-10 flex-grow flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={12} className="text-gray-300" />
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                {post.publishedAt}
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-200 mx-1" />
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-start)]">
                {platformNames[post.platform]}
              </span>
            </div>

            <h3 className="text-xl font-bold text-black tracking-tight mb-4 group-hover:text-[var(--accent-start)] transition-colors line-clamp-2 leading-tight">
              {post.title}
            </h3>

            <p className="text-sm text-gray-500 leading-relaxed font-medium line-clamp-3 mb-8 opacity-80">
              {post.summary}
            </p>

            <div className="mt-auto pt-8 border-t border-gray-50 flex justify-between items-center">
              <a 
                href={post.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-black hover:text-[var(--accent-start)] transition-all group/link"
              >
                Ler Post <ArrowUpRight size={14} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
              </a>
              
              <div className="text-[9px] font-bold text-gray-300 pointer-events-none italic">
                BPlen Insights
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
