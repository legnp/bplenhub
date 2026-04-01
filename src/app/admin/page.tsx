export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
          Dashboard Administrativo
        </h1>
        <p className="text-[#1D1D1F]/60 mt-2 font-medium">BPlen HUB - Centro de Comando</p>
      </div>

      <div className="p-6 bg-white/50 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm mt-8">
        <h3 className="text-xl font-semibold mb-2 text-[#1D1D1F]">Bem-vindo(a) ao seu HUB</h3>
        <p className="text-[#1D1D1F]/70 text-sm">
          Utilize a navegação lateral para visualizar e gerenciar o ecossistema. 
          Use o menu &quot;Sincronizar Agenda&quot; para organizar seus serviços e os menus de 
          Formulários, Portfólio e Usuários para gerenciar os pilares operacionais.
        </p>
      </div>
    </div>
  );
}
