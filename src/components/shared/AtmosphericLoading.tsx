"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const COLORS = [
  "rgba(255, 0, 128", // Pink BPlen
  "rgba(121, 40, 202", // Purple BPlen
  "rgba(192, 38, 211", // Violet BPlen
];

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  colorBase: string;
  alpha: number;
  baseAlpha: number;
  targetAlpha: number;
  offset: number;

  constructor(width: number, height: number) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.baseSize = Math.random() * 2 + 0.5;
    this.size = this.baseSize;
    this.colorBase = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.baseAlpha = Math.random() * 0.3 + 0.1;
    this.alpha = this.baseAlpha;
    this.targetAlpha = this.baseAlpha;
    this.offset = Math.random() * Math.PI * 2;
  }

  update(mouse: { x: number, y: number, active: boolean }, width: number, height: number) {
    this.x += this.vx;
    this.y += this.vy;

    // Breathing Logic (Oscilation)
    const time = Date.now() * 0.0015;
    const pulse = Math.sin(time + this.offset);
    this.size = this.baseSize + pulse * 0.5;
    this.targetAlpha = this.baseAlpha + pulse * 0.1;

    // Mouse Interaction
    if (mouse.active) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const revealDist = 200;

      if (dist < revealDist) {
        // Shine when close to mouse
        this.targetAlpha = Math.min(0.8, this.targetAlpha + (1 - dist / revealDist) * 0.6);
        
        // Soft Repel
        if (dist < 80) {
          const force = (80 - dist) / 80;
          this.x -= (dx / dist) * force * 4;
          this.y -= (dy / dist) * force * 4;
        }
      }
    }

    this.alpha += (this.targetAlpha - this.alpha) * 0.1;

    // Wrap around
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `${this.colorBase}, ${this.alpha})`;
    ctx.fill();

    if (this.alpha > 0.4) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = `${this.colorBase}, ${this.alpha * 0.5})`;
    } else {
      ctx.shadowBlur = 0;
    }
  }
}

export default function AtmosphericLoading() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const count = 120;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.update(mouse.current, canvas.width, canvas.height);
        p.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      mouse.current.active = true;
    };

    const handleMouseLeave = () => {
      mouse.current.active = false;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    
    resize();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-[var(--bg-primary)] flex flex-col items-center justify-center overflow-hidden">
      {/* Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
        style={{ mixBlendMode: "screen" }}
      />

      {/* Center Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-8"
      >
        {/* Breathing Core Glow (Optional visual anchor) */}
        <div className="relative w-32 h-32 flex flex-col items-center justify-center">
           <motion.div 
             animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.15, 0.05] }}
             transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
             className="absolute inset-0 bg-gradient-to-tr from-[#ff0080] to-[#7928ca] rounded-full blur-3xl"
           />
           <div className="relative z-10 flex flex-col items-center">
              <span className="text-xl font-bold tracking-tighter text-[var(--text-primary)]">
                 BPlen <span className="gradient-accent bg-clip-text text-transparent italic text-xl">HUB</span>
              </span>
           </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--accent-start)] animate-pulse">
            Carregando BPlen HUB
          </p>
          <div className="flex items-center gap-1.5 opacity-20">
             <div className="w-1 h-1 rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:-0.3s]" />
             <div className="w-1 h-1 rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:-0.15s]" />
             <div className="w-1 h-1 rounded-full bg-[var(--text-muted)] animate-bounce" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
