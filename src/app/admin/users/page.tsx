export default function UsersManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)] bg-clip-text text-transparent">
          Gestão de Usuários
        </h1>
        <p className="text-[var(--text-muted)] mt-2 font-medium">Controle base de membros e acessos.</p>
      </div>

      <div className="p-10 text-center border-2 border-dashed border-[var(--border-primary)] rounded-2xl bg-[var(--input-bg)] backdrop-blur-sm mt-8">
        <p className="text-sm text-[var(--text-muted)] opacity-60 font-medium font-bold uppercase tracking-widest">Módulo em construção: O motor de busca e listagem será inserido aqui.</p>
      </div>
    </div>
  );
}
