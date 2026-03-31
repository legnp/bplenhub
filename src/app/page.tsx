import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 theme-dark">
      {/* Container Principal */}
      <div className="max-w-4xl text-center space-y-8 animate-fade-in-up">
        
        {/* Eyebrow */}
        <p className="uppercase tracking-[0.3em] text-[#30D5C8] text-sm font-semibold">
          LENS By Lis — Evoluindo para BPlen
        </p>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Descomplicar o <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#30D5C8] to-[#007AFF]">
            Desenvolvimento Humano
          </span>
          <br className="hidden md:block" /> no Trabalho.
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Sua Consultoria especializada em criar culturas organizacionais de alto impacto. 
          A nova plataforma BPlen está nascendo aqui.
        </p>

        {/* CTA */}
        <div className="pt-8">
          <Link 
            href="/hub" 
            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-black font-semibold tracking-wide hover:scale-105 transition-all shadow-[0_0_30px_rgba(48,213,200,0.3)]"
          >
            Acessar BPlen HUB →
          </Link>
        </div>

      </div>

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#30D5C8] rounded-full blur-[150px] opacity-10 pointer-events-none -z-10" />
    </main>
  );
}
