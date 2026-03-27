import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../components/Layout';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(null);
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
          
          // Fetch additional progress data from Firestore
          try {
            const userDocRef = doc(db, 'usuarios', currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              setUserData(userDocSnap.data());
            }
          } catch (err) {
            console.error("Erro ao buscar dados do Firestore:", err);
          }

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

  const getJourneyProgress = () => {
    const items = [
      { id: 'onboarding', name: '1. Onboarding', isAlwaysUnlocked: true },
      { id: 'analise_comportamental', name: '2. Análise Comportamental' },
      { id: 'posicionamento_carreira', name: '3. Plano de Posicionamento de Carreira' },
      { id: 'autolideranca_grupo', name: '4.1 Consultoria Autoliderança (Grupo)' },
      { id: 'autolideranca_individual', name: '4.2 Consultoria Autoliderança (Individual)' },
      { id: 'offboarding', name: '5. Offboarding', isAlwaysUnlocked: true },
    ];

    return items.map(item => {
      let status = 'Pendente';
      
      if (item.id === 'onboarding') {
        if (userData?.presenca_confirmada) {
          status = 'Concluído';
        } else if (userData?.agendamento_onboarding || userData?.survey_checkin_concluido) {
          status = 'Em andamento';
        }
      }
      // Outras etapas podem ser adicionadas aqui conforme implementadas
      
      const isUnlocked = item.isAlwaysUnlocked || products.includes(item.id);
      const statusClass = status === 'Concluído' ? 'status-concluido' : 
                         status === 'Em andamento' ? 'status-andamento' : 'status-pendente';
      
      return { ...item, status, isUnlocked, statusClass };
    });
  };

  if (loading) {
    return (
      <div className="page-wrapper center-content">
        <p className="loading-text">Carregando seu portal...</p>
      </div>
    );
  }

  return (
    <Layout 
      title="Dashboard"
      user={user}
      theme={theme}
      toggleTheme={toggleTheme}
      handleLogout={handleLogout}
    >
      <main className="dashboard-main">
        <h1 style={{ marginBottom: '10px' }}>Sua jornada</h1>
        <p className="subtitle" style={{ marginBottom: '30px' }}>Visualize o progresso da sua consultoria e acesse seus materiais.</p>

        <div className="jornada-grid">
          {/* COLUNA ESQUERDA: TRILHA DE PRODUTOS */}
          <div className="jornada-left-col">
            {getJourneyProgress().map((item) => {
              return (
                <div 
                  key={item.id} 
                  className={`journey-item bplen-glass-dark ${item.isUnlocked ? 'unlocked' : 'locked'}`}
                  style={{ cursor: item.isUnlocked && item.id === 'onboarding' ? 'pointer' : 'default' }}
                  onClick={() => {
                    if (item.isUnlocked && item.id === 'onboarding') {
                      router.push('/onboarding');
                    }
                  }}
                >
                  <div className="journey-info">
                    <div className="lock-icon">
                      {item.isUnlocked ? '🔓' : '🔒'}
                    </div>
                    <span className="journey-name">{item.name}</span>
                  </div>
                  
                  <div className={`status-indicator ${item.statusClass}`}>
                    <div className="status-glow"></div>
                    {item.status}
                  </div>
                </div>
              );
            })}
          </div>

          {/* COLUNA DIREITA: ORIENTAÇÃO EM GRUPO */}
          <div className="jornada-right-col">
            <div className="bplen-glass-dark" style={{ padding: '30px', borderRadius: '25px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ background: 'rgba(255,75,75,0.1)', width: '60px', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '20px' }}>
                🎯
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>Orientação em Grupo</h2>
              <p className="subtitle" style={{ marginBottom: '25px', lineHeight: '1.6' }}>
                Participe das sessões ao vivo para tirar dúvidas, aprofundar temas estratégicos e interagir com outros membros da BPlen Hub.
              </p>
              <button 
                className="primary-btn" 
                style={{ alignSelf: 'flex-start', padding: '12px 30px' }}
                onClick={() => router.push('/orientacao_em_grupo')}
              >
                Agendar Orientação
              </button>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
