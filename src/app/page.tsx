export default function Home() {
  return (
    <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl gradient-accent"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-15 blur-3xl gradient-accent"
          aria-hidden="true"
        />
      </div>

      {/* Hero Card */}
      <div className="glass hover-lift max-w-lg w-full p-10 text-center relative z-10 animate-fade-in-up">
        {/* Logo / Brand */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            BPlen{" "}
            <span className="gradient-accent bg-clip-text text-transparent">
              HUB
            </span>
          </h1>
          <p
            className="mt-2 text-sm font-medium tracking-wide uppercase animate-fade-in-up-delay"
            style={{ color: "var(--text-secondary)" }}
          >
            Desenvolvimento Humano
          </p>
        </div>

        {/* Divider */}
        <div
          className="w-12 h-px mx-auto mb-8 animate-fade-in-up-delay"
          style={{ background: "linear-gradient(90deg, var(--accent-start), var(--accent-end))" }}
        />

        {/* Status Message */}
        <p
          className="text-sm leading-relaxed mb-8 animate-fade-in-up-delay-2"
          style={{ color: "var(--text-secondary)" }}
        >
          Ecossistema em construção.
          <br />
          Em breve, sua jornada de desenvolvimento começa aqui.
        </p>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full animate-fade-in-up-delay-2"
          style={{
            background: "rgba(102, 126, 234, 0.08)",
            border: "1px solid rgba(102, 126, 234, 0.15)",
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse-soft"
            style={{ background: "var(--accent-start)" }}
          />
          <span className="text-xs font-medium" style={{ color: "var(--accent-start)" }}>
            Infraestrutura Ativa
          </span>
        </div>
      </div>
    </main>
  );
}
