"use client";

import React, { useEffect, useRef } from "react";

/**
 * ParticleNexus — Global Revelation Overlay
 * Partículas invisíveis que são reveladas pelo rastro do mouse em toda a página.
 */
export function ParticleNexus() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 450; // Aumentado para cobrir a tela, mas apenas revelado

    const colors = [
      "rgba(255, 0, 128", // Pink
      "rgba(121, 40, 202", // Purple
      "rgba(192, 38, 211", // Violet
    ];

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      colorBase: string;
      alpha: number = 0;
      targetAlpha: number = 0;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.vx = (Math.random() - 0.5) * 0.2; 
        this.vy = (Math.random() - 0.5) * 0.2;
        this.size = Math.random() * 2 + 1;
        this.colorBase = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Revelação pelo Mouse
        if (mouse.current.active) {
          const dx = mouse.current.x - this.x;
          const dy = mouse.current.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const revealDist = 250; // Raio de revelação

          if (dist < revealDist) {
            // Aumenta alpha quanto mais perto do mouse
            const force = (revealDist - dist) / revealDist;
            this.targetAlpha = force * 0.8;
            
            // Efeito vácuo (repulsão suave)
            if (dist < 100) {
              const repelForce = (100 - dist) / 100;
              this.x -= (dx / dist) * repelForce * 6;
              this.y -= (dy / dist) * repelForce * 6;
            }
          } else {
            this.targetAlpha = 0;
          }
        } else {
          this.targetAlpha = 0;
        }

        // Decay suave do alpha
        this.alpha += (this.targetAlpha - this.alpha) * 0.05;

        // Wrap around as bordas do Viewport
        if (this.x < 0) this.x = canvas!.width;
        if (this.x > canvas!.width) this.x = 0;
        if (this.y < 0) this.y = canvas!.height;
        if (this.y > canvas!.height) this.y = 0;
      }

      draw() {
        if (!ctx || this.alpha < 0.01) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `${this.colorBase}, ${this.alpha})`;
        ctx.fill();
        
        if (this.size > 2 && this.alpha > 0.4) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = `${this.colorBase}, ${this.alpha})`;
        } else {
          ctx.shadowBlur = 0;
        }
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      mouse.current.active = true;
    };

    const handleMouseLeave = () => {
      mouse.current.active = false;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
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
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[1] opacity-60"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
