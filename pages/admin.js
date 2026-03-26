import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function AdminArea() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  const router = useRouter();

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [lastSynced, setLastSynced] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('bplen-theme');
    if (savedTheme) setTheme(savedTheme);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const res = await fetch(`/api/check-admin?uid=${currentUser.uid}`);
          const data = await res.json();
          if (data.isAdmin) {
            setLoading(false);
          } else {
            router.push('/dashboard');
          }
        } catch {
          router.push('/dashboard');
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    document.body.className = `${theme}-theme theme-transition`;
    return () => { document.body.className = ''; };
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

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    setSyncError(null);
    try {
      const res = await fetch('/api/sync-calendar', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncResult(data);
        setLastSynced(new Date());
      } else {
        setSyncError(data.error || data.details || 'Erro desconhecido.');
      }
    } catch (err) {
      setSyncError('Falha ao conectar com a API. Verifique o servidor.');
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '--';
    return new Date(isoString).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="page-wrapper center-content">
        <p className="loading-text">Verificando credenciais de administrador...</p>
      </div>
    );
  }

  return (
    <Layout title="Área Admin" user={user} theme={theme} toggleTheme={toggleTheme} handleLogout={handleLogout}>
      <main className="dashboard-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ marginBottom: '8px' }}>Painel Administrativo</h1>
            <p className="subtitle">Gerencie sessões, usuários e integrações da plataforma.</p>
          </div>
          <div className="status-indicator status-concluido">
            <div className="status-glow"></div>
            Admin Ativo
          </div>
        </div>

        {/* ─── SYNC CALENDAR CARD ─── */}
        <div className="bplen-glass-dark" style={{ padding: '30px', borderRadius: '20px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '20px', marginBottom: '6px' }}>🗓️ Sincronização de Agenda</h2>
              <p className="subtitle" style={{ fontSize: '13px' }}>
                Consulta a agenda BPlen Hub no Google Agenda, extrai as reuniões de <strong>Onboarding</strong> e popula o Firestore em <code>sessoes_onboarding</code>.
              </p>
              {lastSynced && (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Última sincronização: {formatDate(lastSynced.toISOString())}
                </p>
              )}
            </div>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="primary-btn"
              style={{
                padding: '12px 24px', fontSize: '14px', whiteSpace: 'nowrap',
                opacity: isSyncing ? 0.7 : 1, cursor: isSyncing ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}
            >
              {isSyncing ? (
                <>
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></span>
                  Sincronizando...
                </>
              ) : (
                <>🔄 Sincronizar Agenda</>
              )}
            </button>
          </div>

          {/* Error */}
          {syncError && (
            <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(255,77,79,0.1)', border: '1px solid rgba(255,77,79,0.3)', color: '#ff4d4f', fontSize: '14px', marginBottom: '16px' }}>
              ❌ {syncError}
            </div>
          )}

          {/* Success */}
          {syncResult && (
            <div>
              <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', color: '#00ff88', fontSize: '14px', marginBottom: '20px' }}>
                ✅ {syncResult.message}
              </div>

              {syncResult.events && syncResult.events.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        {['Título', 'Data e Hora', 'Link Meet', 'Vagas'].map(col => (
                          <th key={col} style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap' }}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {syncResult.events.map((ev, i) => {
                        const vagasOcupadas = ev.vagas_ocupadas || 0;
                        const vagasTotais = ev.vagas_totais || 10;
                        const vagasRestantes = typeof ev.vagas_restantes !== 'undefined' ? ev.vagas_restantes : vagasTotais - vagasOcupadas;

                        return (
                          <tr key={ev.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                            <td style={{ padding: '12px 14px', color: 'var(--text-main)' }}>{ev.titulo}</td>
                            <td style={{ padding: '12px 14px', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{formatDate(ev.data_hora)}</td>
                            <td style={{ padding: '12px 14px' }}>
                              {ev.link_meet
                                ? <a href={ev.link_meet} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontSize: '12px' }}>Abrir Meet</a>
                                : <span style={{ color: 'var(--text-muted)' }}>—</span>
                              }
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <span className="status-indicator status-andamento" style={{ fontSize: '11px', padding: '4px 10px' }}>
                                {vagasOcupadas}/{vagasTotais} ocupadas ({vagasRestantes} livres)
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="subtitle" style={{ textAlign: 'center', padding: '20px 0' }}>
                  Nenhum evento de Onboarding encontrado nos próximos 90 dias.
                </p>
              )}
            </div>
          )}

          {/* Empty state before first sync */}
          {!syncResult && !syncError && !isSyncing && (
            <div style={{ textAlign: 'center', padding: '30px 0', opacity: 0.4 }}>
              <p style={{ fontSize: '32px', marginBottom: '8px' }}>📭</p>
              <p className="subtitle" style={{ fontSize: '13px' }}>Clique em "Sincronizar Agenda" para buscar as sessões disponíveis.</p>
            </div>
          )}
        </div>

        {/* Spin animation */}
        <style jsx global>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </main>
    </Layout>
  );
}

