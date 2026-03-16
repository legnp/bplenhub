import React from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/router';
import Head from 'next/head';

const FluidParticles = () => {
  const canvasRef = React.useRef(null);
  const mouse = React.useRef({ x: 0, y: 0, active: false });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    const colors = ['#A14B95', '#6560AC', '#023554'];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        // 85% particles stay in the top-left cluster, 15% are scattered
        const isScattered = Math.random() < 0.15;

        if (isScattered) {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
        } else {
          // Circular distribution in the top-left
          const centerX = canvas.width * 0.15;
          const centerY = canvas.height * 0.15;
          const radius = Math.min(canvas.width, canvas.height) * 0.25;

          const angle = Math.random() * Math.PI * 2;
          const r = Math.sqrt(Math.random()) * radius;

          this.x = centerX + Math.cos(angle) * r;
          this.y = centerY + Math.sin(angle) * r;
        }

        this.size = Math.random() * 3 + 1.5;

        // Initial velocity biased towards the center for a synchronized start
        const centerSpeed = 0.2;
        const dxCenter = (canvas.width / 2) - this.x;
        const dyCenter = (canvas.height / 2) - this.y;
        const mag = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
        this.vx = (dxCenter / mag) * centerSpeed + (Math.random() - 0.5) * 0.2;
        this.vy = (dyCenter / mag) * centerSpeed + (Math.random() - 0.5) * 0.2;

        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.6 + 0.3;
      }
      update() {
        // Slight constant force towards center of screen
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const dxCenter = centerX - this.x;
        const dyCenter = centerY - this.y;
        this.vx += dxCenter * 0.00001;
        this.vy += dyCenter * 0.00001;

        this.x += this.vx;
        this.y += this.vy;

        if (mouse.current.active) {
          const dx = mouse.current.x - this.x;
          const dy = mouse.current.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 300) {
            const force = (300 - dist) / 50000; // Minimal attraction force
            this.vx += dx * force;
            this.vy += dy * force;
          }
        }

        // High friction for sluggish, elegant movement
        this.vx *= 0.94;
        this.vy *= 0.94;

        // If particle goes too far from top-left/center or off screen, reset it to top-left
        if (this.x > canvas.width || this.y > canvas.height || this.x < -100 || this.y < -100) {
          this.reset();
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
      }
    }

    const init = () => {
      particles = Array.from({ length: 300 }, () => new Particle());
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      mouse.current.active = true;
    };
    const handleMouseLeave = () => mouse.current.active = false;

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    resize();
    init();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }} />;
};

export default function Login() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/dashboard');
    } catch (error) {
      alert("Erro ao tentar entrar. Verifique sua conexão.");
    }
  };

  return (
    <div className="page-wrapper center-content" style={{ position: 'relative', overflow: 'hidden' }}>
      <Head>
        <title>BPlen Hub - Login</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      {/* Background Color Layer */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#eef2f7',
        zIndex: 0
      }} />

      <FluidParticles />

      <div className="bplen-glass" style={{
        textAlign: 'center',
        padding: '50px 40px',
        width: '100%',
        maxWidth: '420px',
        zIndex: 10,
        position: 'relative'
      }}>
        {/* Logo */}
        <img src="/logo-hub.svg" alt="Logo BPlen Hub" style={{ height: '86px', width: 'auto', display: 'block', margin: '0 auto 20px' }} />

        <p style={{
          color: '#1a2a3a',
          opacity: 0.6,
          marginBottom: '40px',
          fontSize: '16px'
        }}>
          Faça login para acessar seu Dashboard
        </p>

        <button onClick={handleLogin} className="auth-btn btn-primary-white">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="" />
          Entrar com Google
        </button>

        <p style={{ marginTop: '40px', fontSize: '13px', color: '#1a2a3a', opacity: 0.4 }}>
          Protegido por BPlen Consulting
        </p>
      </div>
    </div>
  );
}
