import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [theme, setTheme] = useState('dark');
  const router = useRouter();

  useEffect(() => {
    // Carregar tema preferido
    const savedTheme = localStorage.getItem('bplen-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const res = await fetch(`/api/check-access?email=${currentUser.email}`);
        const data = await res.json();

        if (data.authorized) {
          const list = data.products ? data.products.split(',').map(p => p.trim()) : [];
          setProducts(list);
          setLoading(false);
        } else {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    // Aplicar tema ao corpo para efeito global
    document.body.className = `${theme}-theme theme-transition`;
    return () => {
      document.body.className = '';
    };
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('bplen-theme', newTheme);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="page-wrapper center-content">
        <p className="loading-text">Carregando seu portal...</p>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Head>
        <title>BPlen Hub - Dashboard</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <header className="dashboard-header bplen-glass-dark">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/logo-hub.svg" alt="Logo BPlen Hub" style={{ height: '52px', width: 'auto', display: 'block' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={toggleTheme} 
            className="secondary-btn" 
            style={{ 
              padding: '8px', 
              fontSize: '18px', 
              borderRadius: '50%', 
              width: '40px', 
              height: '40px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{user.displayName}</span>
          <button onClick={handleLogout} className="secondary-btn" style={{ padding: '8px 15px', fontSize: '12px' }}>
            Sair
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <h1 style={{ marginBottom: '10px' }}>Sua jornada</h1>
        <p className="subtitle" style={{ marginBottom: '30px' }}>Visualize o progresso da sua consultoria e acesse seus materiais.</p>

        <div className="jornada-grid">
          {/* COLUNA ESQUERDA: TRILHA DE PRODUTOS */}
          <div className="jornada-left-col">
            {[
              { id: 'onboarding', name: '1. Onboarding', isAlwaysUnlocked: true, status: 'Concluído' },
              { id: 'analise_comportamental', name: '2. Análise Comportamental', status: 'Em andamento' },
              { id: 'posicionamento_carreira', name: '3. Plano de Posicionamento de Carreira', status: 'Pendente' },
              { id: 'autolideranca_grupo', name: '4.1 Consultoria Autoliderança (Grupo)', status: 'Pendente' },
              { id: 'autolideranca_individual', name: '4.2 Consultoria Autoliderança (Individual)', status: 'Pendente' },
              { id: 'offboarding', name: '5. Offboarding', isAlwaysUnlocked: true, status: 'Pendente' },
            ].map((item) => {
              const isUnlocked = item.isAlwaysUnlocked || products.includes(item.id);
              const statusClass = item.status === 'Concluído' ? 'status-concluido' : 
                                 item.status === 'Em andamento' ? 'status-andamento' : 'status-pendente';
              
              return (
                <div key={item.id} className={`journey-item bplen-glass-dark ${isUnlocked ? 'unlocked' : 'locked'}`}>
                  <div className="journey-info">
                    <div className="lock-icon">
                      {isUnlocked ? '🔓' : '🔒'}
                    </div>
                    <span className="journey-name">{item.name}</span>
                  </div>
                  
                  <div className={`status-indicator ${statusClass}`}>
                    <div className="status-glow"></div>
                    {item.status}
                  </div>
                </div>
              );
            })}
          </div>

          {/* COLUNA DIREITA: RESERVADA */}
          <div className="jornada-right-col">
            {/* Placeholder para estrutura futura */}
            <div className="bplen-glass-dark" style={{ 
              height: '100%', 
              minHeight: '400px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              opacity: 0.3,
              borderStyle: 'dashed'
            }}>
              <p className="subtitle">Conteúdo adicional em breve...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
