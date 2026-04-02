export default function PortfolioManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)] bg-clip-text text-transparent text-left">
          Gestão de Portfólio
        </h1>
        <p className="text-[var(--text-muted)] mt-2 font-medium text-left">Cadastro e manutenção de Serviços e Vitrines.</p>
      </div>

      <div className="p-10 text-center border-2 border-dashed border-[var(--border-primary)] rounded-2xl bg-[var(--input-bg)] backdrop-blur-sm mt-8">
        <p className="text-sm text-[var(--text-muted)] opacity-60 font-medium font-bold uppercase tracking-widest">Módulo em construção: Listagem de Fichas Técnicas inserida aqui.</p>
      </div>
    </div>
  );
}
