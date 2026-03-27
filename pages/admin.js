import { useEffect, useState, useMemo } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, query, where, getDocs, doc, updateDoc, 
  setDoc, getDoc, orderBy, limit, Timestamp 
} from 'firebase/firestore';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { RefreshCw, Users, Target, FileText, CheckCircle, ExternalLink, Calendar, UploadCloud, MessageSquare } from 'lucide-react';

const ORIENTADORES = ["Selecione...", "Carolina", "Felipe", "Mariana", "Ricardo"];

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

  // States for Onboarding Management
  const [onboardingSessions, setOnboardingSessions] = useState([]);
  const [isLoadingOnboarding, setIsLoadingOnboarding] = useState(false);
  const [onboardingError, setOnboardingError] = useState(null);
  const [updatingUid, setUpdatingUid] = useState(null); // tracking individual updates
  const [ataUrlInputs, setAtaUrlInputs] = useState({}); // tracking per-session ata input
  const [agendaInputs, setAgendaInputs] = useState({}); // { [sessionId]: { orientador, comentarios, ataFile } }
  const [isConcluding, setIsConcluding] = useState({}); // { [sessionId]: boolean }

  // Details View States
  const [detalhesFilter, setDetalhesFilter] = useState('Todas'); // 'Todas', 'Pendentes', 'Concluídas'
  const [selectedSessionId, setSelectedSessionId] = useState('');

  const filteredDetalhesSessions = useMemo(() => {
    return onboardingSessions.filter(s => {
      if (detalhesFilter === 'Concluídas') return s.concluida === true;
      if (detalhesFilter === 'Pendentes') return s.concluida !== true;
      return true; // 'Todas'
    });
  }, [onboardingSessions, detalhesFilter]);

  useEffect(() => {
    if (filteredDetalhesSessions.length > 0) {
      if (!selectedSessionId || !filteredDetalhesSessions.find(s => s.id === selectedSessionId)) {
        setSelectedSessionId(filteredDetalhesSessions[0].id);
      }
    } else {
      setSelectedSessionId('');
    }
  }, [filteredDetalhesSessions, selectedSessionId]);

  const activeDetalhesSession = filteredDetalhesSessions.find(s => s.id === selectedSessionId) || null;

  // States for Orientation (Orientação em Grupo)
  const [isSyncingOrient, setIsSyncingOrient] = useState(false);
  const [syncResultOrient, setSyncResultOrient] = useState(null);
  const [syncErrorOrient, setSyncErrorOrient] = useState(null);
  const [lastSyncedOrient, setLastSyncedOrient] = useState(null);

  // Layout state: 'onboarding' | 'sync'
  const [activeTab, setActiveTab] = useState('sync');
  const [onboardingSubTab, setOnboardingSubTab] = useState('agenda'); // 'agenda' | 'detalhes'

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
        fetchOnboardingSessions();
      } else {
        setSyncError(data.error || data.details || 'Erro desconhecido.');
      }
    } catch (err) {
      setSyncError('Falha ao conectar com a API.');
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchOnboardingSessions = async () => {
    setIsLoadingOnboarding(true);
    setOnboardingError(null);
    try {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      const q = query(
        collection(db, 'sessoes_onboarding'),
        where('data_hora', '>=', Timestamp.fromDate(start)),
        orderBy('data_hora', 'asc'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      const sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dateObj: doc.data().data_hora.toDate()
      }));
      setOnboardingSessions(sessions);
      
      const initialAtas = {};
      sessions.forEach(s => { if (s.ata_onboarding_url) initialAtas[s.id] = s.ata_onboarding_url; });
      setAtaUrlInputs(initialAtas);
    } catch (err) {
      setOnboardingError('Erro ao carregar sessões.');
    } finally {
      setIsLoadingOnboarding(false);
    }
  };

  useEffect(() => {
    if (user && activeTab === 'onboarding') {
      fetchOnboardingSessions();
    }
  }, [user, activeTab]);

  const updateParticipantStatus = async (sessionId, participantUid, statusData) => {
    setUpdatingUid(participantUid);
    try {
      const sessionRef = doc(db, 'sessoes_onboarding', sessionId);
      const sessionSnap = await getDoc(sessionRef);
      if (!sessionSnap.exists()) throw new Error('Sessão não encontrada');
      
      const updatedParticipantes = (sessionSnap.data().participantes || []).map(p => {
        if (p.uid === participantUid) return { ...p, ...statusData };
        return p;
      });

      await updateDoc(sessionRef, { participantes: updatedParticipantes });

      const userRef = doc(db, 'usuarios', participantUid);
      if (statusData.presenca_onboarding === false) {
        await updateDoc(userRef, { agendamento_onboarding: null, presenca_confirmada: false });
      } else if (statusData.presenca_onboarding === true) {
        await updateDoc(userRef, { presenca_confirmada: true });
      }

      await fetchOnboardingSessions();
    } catch (err) {
      alert('Erro: ' + err.message);
    } finally {
      setUpdatingUid(null);
    }
  };

  const handleSaveAta = async (sessionId) => {
    const url = ataUrlInputs[sessionId];
    try {
      const sessionRef = doc(db, 'sessoes_onboarding', sessionId);
      await updateDoc(sessionRef, { ata_onboarding_url: url });
      
      const sessionSnap = await getDoc(sessionRef);
      const participants = sessionSnap.data().participantes || [];
      for (const p of participants) {
        await updateDoc(doc(db, 'usuarios', p.uid), { ata_onboarding_url: url });
      }
      alert('Ata salva com sucesso!');
      await fetchOnboardingSessions();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  const handleConcluirOnboarding = async (sessionId) => {
    const inputs = agendaInputs[sessionId] || {};
    if (!inputs.orientador || inputs.orientador === "Selecione...") {
      alert("Por favor, selecione um orientador.");
      return;
    }

    setIsConcluding(prev => ({ ...prev, [sessionId]: true }));
    try {
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      formData.append('orientador', inputs.orientador);
      formData.append('comentarios', inputs.comentarios || '');
      if (inputs.ataFile) {
        formData.append('ata', inputs.ataFile);
      }

      const res = await fetch('/api/concluir-onboarding', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        alert('Onboarding concluído com sucesso!');
        await fetchOnboardingSessions();
      } else {
        throw new Error(`${data.error}${data.details ? ': ' + data.details : ''}`);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsConcluding(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  const handleSyncOrientacao = async () => {
    setIsSyncingOrient(true);
    setSyncResultOrient(null);
    setSyncErrorOrient(null);
    try {
      const res = await fetch('/api/sync-orientacao', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro na sincronização');
      setSyncResultOrient(data);
      setLastSyncedOrient(new Date());
    } catch (err) {
      setSyncErrorOrient(err.message);
    } finally {
      setIsSyncingOrient(false);
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
      <main className="dashboard-main admin-refined-layout">
        <header className="admin-refined-header">
          <div>
            <h1>Painel Administrativo</h1>
            <p>Gestão centralizada da jornada do cliente.</p>
          </div>
          <div className="admin-status-badge">
            <div className="status-dot"></div>
            Admin Autenticado
          </div>
        </header>

        {/* ─── GRID LAYOUT ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '40px', alignItems: 'start' }}>
          
          {/* SIDEBAR NAVIGATION */}
          <aside className="admin-refined-sidebar">
            <button 
              onClick={() => setActiveTab('sync')}
              className={`refined-tab-btn ${activeTab === 'sync' ? 'active' : ''}`}
            >
              <RefreshCw className="tab-icon" size={20} strokeWidth={1.5} />
              <div className="tab-text">
                <div className="tab-title">Sincronização</div>
                <div className="tab-subtitle">Google Agenda x Firestore</div>
              </div>
            </button>

            <button 
              onClick={() => setActiveTab('onboarding')}
              className={`refined-tab-btn ${activeTab === 'onboarding' ? 'active' : ''}`}
            >
              <Users className="tab-icon" size={20} strokeWidth={1.5} />
              <div className="tab-text">
                <div className="tab-title">Onboarding</div>
                <div className="tab-subtitle">Gestão de presença e atas</div>
              </div>
            </button>
          </aside>

          {/* MAIN CONTENT AREA */}
          <section style={{ minWidth: 0 }}>
            {activeTab === 'onboarding' && (
              <div className="bplen-glass-dark section-card">
                <div className="section-header">
                  <h2><Users size={24} strokeWidth={1.5} className="title-icon" /> Onboarding</h2>
                  <p className="subtitle">
                    Gestão de sessões e presença.
                  </p>
                </div>

                {/* Sub-Tabs UI */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <button 
                    onClick={() => setOnboardingSubTab('agenda')}
                    style={{ 
                      padding: '10px 0', background: 'none', border: 'none', color: onboardingSubTab === 'agenda' ? 'var(--primary)' : 'var(--text-muted)',
                      borderBottom: onboardingSubTab === 'agenda' ? '2px solid var(--primary)' : 'none', cursor: 'pointer', fontWeight: 'bold'
                    }}
                  >
                    Resumo da Agenda
                  </button>
                  <button 
                    onClick={() => setOnboardingSubTab('detalhes')}
                    style={{ 
                      padding: '10px 0', background: 'none', border: 'none', color: onboardingSubTab === 'detalhes' ? 'var(--primary)' : 'var(--text-muted)',
                      borderBottom: onboardingSubTab === 'detalhes' ? '2px solid var(--primary)' : 'none', cursor: 'pointer', fontWeight: 'bold'
                    }}
                  >
                    Detalhes (Gestão)
                  </button>
                </div>

                {isLoadingOnboarding ? (
                  <div style={{ textAlign: 'center', padding: '60px' }}>
                    <div className="loading-spinner"></div>
                    <p style={{ marginTop: '15px', color: 'var(--text-muted)' }}>Carregando sessões...</p>
                  </div>
                ) : onboardingSubTab === 'agenda' ? (
                  <div className="table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Data e Hora</th>
                          <th style={{ textAlign: 'center' }}>Inscritos</th>
                          <th>Orientador</th>
                          <th>Ata (Upload)</th>
                          <th>Comentários</th>
                          <th style={{ textAlign: 'center' }}>Comando</th>
                        </tr>
                      </thead>
                      <tbody>
                        {onboardingSessions.slice(0, 10).map(session => {
                          const inputs = agendaInputs[session.id] || { orientador: '', comentarios: '', ataFile: null };
                          const concluding = isConcluding[session.id];
                          const isConcluida = session.concluida === true;

                          return (
                            <tr key={session.id} style={{ opacity: isConcluida ? 0.6 : 1 }}>
                              <td>
                                <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{formatDate(session.dateObj)}</div>
                                <div style={{ fontSize: '10px', color: 'var(--primary)' }}>ID: {session.id.substring(0,8)}</div>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span className="status-indicator status-concluido" style={{ padding: '4px 10px', fontSize: '11px' }}>
                                  {session.participantes?.length || 0} Participantes
                                </span>
                              </td>
                              <td>
                                <select 
                                  disabled={isConcluida}
                                  value={session.orientador || inputs.orientador}
                                  onChange={(e) => setAgendaInputs(prev => ({ ...prev, [session.id]: { ...inputs, orientador: e.target.value } }))}
                                  className="admin-input-small"
                                  style={{ width: '130px' }}
                                >
                                  {ORIENTADORES.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                              </td>
                              <td>
                                {isConcluida ? (
                                  <a href={session.ata_drive_link} target="_blank" rel="noopener noreferrer" className="link-ata">
                                    <FileText size={14} /> Ver na Nuvem
                                  </a>
                                ) : (
                                  <label className="file-upload-label">
                                    <UploadCloud size={14} />
                                    <span>{inputs.ataFile ? 'Selecionado' : 'Subir Arquivo'}</span>
                                    <input 
                                      type="file" 
                                      onChange={(e) => setAgendaInputs(prev => ({ ...prev, [session.id]: { ...inputs, ataFile: e.target.files[0] } }))}
                                      style={{ display: 'none' }}
                                    />
                                  </label>
                                )}
                              </td>
                              <td>
                                <textarea 
                                  disabled={isConcluida}
                                  placeholder="Notas da reunião..."
                                  value={session.comentarios || inputs.comentarios}
                                  onChange={(e) => {
                                    if (e.target.value.length <= 2500) { // Approx 500 words
                                       setAgendaInputs(prev => ({ ...prev, [session.id]: { ...inputs, comentarios: e.target.value } }));
                                    }
                                  }}
                                  className="admin-input-obs"
                                  style={{ height: '40px', fontSize: '10px', minWidth: '150px' }}
                                />
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button 
                                  disabled={concluding || isConcluida}
                                  onClick={() => handleConcluirOnboarding(session.id)}
                                  className={`action-btn ${isConcluida ? 'btn-success' : 'btn-primary'}`}
                                >
                                  {concluding ? <RefreshCw size={14} className="spin" /> : null}
                                  {!concluding && isConcluida ? <CheckCircle size={14} /> : null}
                                  {!concluding && !isConcluida ? 'Concluir' : isConcluida ? 'Concluído' : ''}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="sessions-detalhes-view">
                    {/* Controls Row */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <select 
                        className="admin-input-small" 
                        style={{ width: '260px' }}
                        value={selectedSessionId}
                        onChange={(e) => setSelectedSessionId(e.target.value)}
                        disabled={filteredDetalhesSessions.length === 0}
                      >
                        {filteredDetalhesSessions.map(s => (
                          <option key={s.id} value={s.id}>
                            {formatDate(s.dateObj)} - {s.participantes?.length || 0} inscritos {s.concluida ? '(Concluída)' : ''}
                          </option>
                        ))}
                      </select>

                      <div className="filter-group" style={{ display: 'flex', gap: '8px' }}>
                        {['Todas', 'Pendentes', 'Concluídas'].map(filter => (
                          <button
                            key={filter}
                            onClick={() => setDetalhesFilter(filter)}
                            className={`filter-btn ${detalhesFilter === filter ? 'active' : ''}`}
                          >
                            {filter}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Active Session Content */}
                    {activeDetalhesSession ? (
                      <div className="session-item">
                        <div className="session-info-row" style={{ marginBottom: '20px' }}>
                          <div>
                            <h3 className="session-title">{activeDetalhesSession.titulo}</h3>
                            <div className="session-meta">
                              <span><Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/>{formatDate(activeDetalhesSession.dateObj)}</span>
                              <span style={{ margin: '0 8px', opacity: 0.3 }}>|</span>
                              <span><Users size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/>{activeDetalhesSession.participantes?.length || 0} inscritos</span>
                              {activeDetalhesSession.concluida && (
                                <span className="status-concluido" style={{ marginLeft: '10px', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}><CheckCircle size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }}/>Concluída</span>
                              )}
                            </div>
                          </div>
                          {activeDetalhesSession.link_meet && (
                            <a href={activeDetalhesSession.link_meet} target="_blank" rel="noopener noreferrer" className="action-btn btn-outline" style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '11px' }}>
                              <ExternalLink size={14} /> Abrir Meet
                            </a>
                          )}
                        </div>

                        <div className="table-wrapper">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Participante</th>
                                <th style={{ textAlign: 'center' }}>Presença</th>
                                <th>Notas do Orientador</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(activeDetalhesSession.participantes || []).map(p => {
                                const isUpdating = updatingUid === p.uid;
                                return (
                                  <tr key={p.uid}>
                                    <td>
                                      <div className="participant-name">{p.nome}</div>
                                      <div className="participant-email">{p.email}</div>
                                    </td>
                                    <td>
                                      <div className="presence-toggles">
                                        <button 
                                          disabled={isUpdating}
                                          onClick={() => updateParticipantStatus(activeDetalhesSession.id, p.uid, { presenca_onboarding: true })}
                                          className={`toggle-btn yes ${p.presenca_onboarding === true ? 'active' : ''}`}
                                        >
                                          SIM
                                        </button>
                                        <button 
                                          disabled={isUpdating}
                                          onClick={() => updateParticipantStatus(activeDetalhesSession.id, p.uid, { presenca_onboarding: false })}
                                          className={`toggle-btn no ${p.presenca_onboarding === false ? 'active' : ''}`}
                                        >
                                          NÃO
                                        </button>
                                      </div>
                                    </td>
                                    <td>
                                      <input 
                                        type="text" 
                                        placeholder="Add observação..." 
                                        defaultValue={p.observacao_onboarding || ''}
                                        onBlur={(e) => { if (e.target.value !== (p.observacao_onboarding || '')) updateParticipantStatus(activeDetalhesSession.id, p.uid, { observacao_onboarding: e.target.value }); }}
                                        className="admin-input-obs"
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="empty-state-small">Nenhuma sessão {detalhesFilter.toLowerCase()} encontrada.</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sync' && (
              <div className="bplen-glass-dark section-card">
                <div className="section-header">
                  <h2><RefreshCw size={24} strokeWidth={1.5} className="title-icon" /> Sincronização de Dados</h2>
                  <p className="subtitle">
                    Mantenha a agenda do Google e os registros do Firestore em harmonia.
                  </p>
                </div>

                <div className="sync-grid">
                  {/* ONBOARDING SYNC */}
                  <div className="sync-card">
                    <div className="sync-card-icon"><Calendar size={32} strokeWidth={1} /></div>
                    <h3>Agenda Onboarding</h3>
                    <p>Sincroniza reuniões de Check-in e primeiro Onboarding.</p>
                    <button onClick={handleSync} disabled={isSyncing} className="action-btn btn-outline sync-btn">
                      <RefreshCw size={16} className={isSyncing ? 'spin' : ''} />
                      {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                    </button>
                    {syncResult && <p className="sync-status success"><CheckCircle size={14}/> {syncResult.message}</p>}
                    {syncError && <p className="sync-status error">Falha: {syncError}</p>}
                  </div>

                  {/* ORIENTATION SYNC */}
                  <div className="sync-card">
                    <div className="sync-card-icon"><Target size={32} strokeWidth={1} /></div>
                    <h3>Sessões de Orientação</h3>
                    <p>Sincroniza encontros de grupo e mentorias coletivas.</p>
                    <button onClick={handleSyncOrientacao} disabled={isSyncingOrient} className="action-btn btn-outline sync-btn orient-btn">
                      <RefreshCw size={16} className={isSyncingOrient ? 'spin' : ''} />
                      {isSyncingOrient ? 'Sincronizando...' : 'Sincronizar'}
                    </button>
                    {syncResultOrient && <p className="sync-status success"><CheckCircle size={14}/> {syncResultOrient.count} sessões ativas.</p>}
                    {syncErrorOrient && <p className="sync-status error">Falha: {syncErrorOrient}</p>}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        <style jsx global>{`
          .admin-refined-layout { maxWidth: 1200px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
          .admin-refined-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 50px; }
          .admin-refined-header h1 { font-size: 28px; font-weight: 600; letter-spacing: -0.5px; margin-bottom: 4px; color: var(--text-main); }
          .admin-refined-header p { font-size: 14px; opacity: 0.7; color: var(--text-muted); }
          
          .admin-status-badge { display: flex; align-items: center; gap: 8px; padding: 6px 12px; font-size: 12px; font-weight: 500; background: rgba(0, 255, 136, 0.1); border: 1px solid rgba(0, 255, 136, 0.2); color: #00b35f; border-radius: 20px; }
          body:not(.light-theme) .admin-status-badge { color: #00ff88; }
          .status-dot { width: 6px; height: 6px; background: #00ff88; border-radius: 50%; box-shadow: 0 0 8px rgba(0,255,136,0.6); }

          .admin-refined-sidebar { display: flex; flex-direction: column; gap: 10px; position: sticky; top: 100px; }
          .refined-tab-btn { display: flex; align-items: center; gap: 14px; padding: 16px 20px; border-radius: 16px; background: transparent; border: 1px solid transparent; color: var(--text-muted); cursor: pointer; transition: all 0.2s ease; text-align: left; }
          .refined-tab-btn:hover { background: var(--glass-bg); color: var(--text-main); }
          .refined-tab-btn.active { background: rgba(138, 79, 255, 0.08); border: 1px solid rgba(138, 79, 255, 0.3); color: var(--primary); }
          .tab-text .tab-title { font-weight: 600; font-size: 14px; }
          .tab-text .tab-subtitle { font-size: 11px; opacity: 0.6; margin-top: 2px; }

          .section-card { padding: 32px; border-radius: 24px; background: var(--glass-bg-bplen-dark); border: 1px solid var(--glass-border); backdrop-filter: blur(10px); }
          .section-header { margin-bottom: 30px; }
          .section-header h2 { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 600; color: var(--text-main); }
          .section-header .subtitle { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
          .title-icon { color: var(--primary); }

          .admin-table { width: 100%; border-collapse: collapse; }
          .admin-table th { text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); border-bottom: 1px solid var(--glass-border); }
          .admin-table td { padding: 14px 12px; border-bottom: 1px solid var(--glass-border); vertical-align: middle; font-size: 13px; color: var(--text-main); }

          .admin-input-small, .admin-input-obs, .admin-input { padding: 8px 12px; font-size: 12px; border-radius: 10px; background: transparent; border: 1px solid var(--glass-border); color: var(--text-main); transition: border 0.3s; }
          .admin-input-small:focus, .admin-input-obs:focus { border-color: var(--primary); outline: none; background: var(--glass-bg); }
          body:not(.light-theme) .admin-input-small, body:not(.light-theme) .admin-input-obs { background: rgba(0,0,0,0.2); }

          .file-upload-label { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--glass-bg); border: 1px dashed var(--glass-border); border-radius: 8px; cursor: pointer; font-size: 11px; color: var(--text-muted); transition: all 0.2s; }
          .file-upload-label:hover { background: var(--glass-bg); color: var(--text-main); border-color: var(--primary); }
          .link-ata { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--primary); text-decoration: none; opacity: 0.9; }
          .link-ata:hover { opacity: 1; text-decoration: underline; }

          .action-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 8px 16px; font-size: 12px; font-weight: 500; border-radius: 10px; cursor: pointer; transition: all 0.2s; border: none; }
          .btn-primary { background: var(--primary); color: #fff; }
          .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
          .btn-success { background: rgba(0, 255, 136, 0.1); color: #00b35f; border: 1px solid rgba(0, 255, 136, 0.3); }
          body:not(.light-theme) .btn-success { color: #00ff88; }
          .btn-outline { background: transparent; border: 1px solid var(--glass-border); color: var(--text-main); }
          .btn-outline:hover { background: var(--glass-bg); border-color: var(--text-muted); }

          .sync-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
          .sync-card { padding: 24px; border: 1px solid var(--glass-border); border-radius: 20px; background: var(--glass-bg); text-align: center; transition: transform 0.3s; }
          .sync-card:hover { transform: translateY(-2px); border-color: var(--text-muted); }
          .sync-card-icon { margin-bottom: 12px; color: var(--text-muted); display: flex; justify-content: center; }
          .sync-card h3 { font-size: 16px; font-weight: 500; margin-bottom: 8px; color: var(--text-main); }
          .sync-card p { font-size: 12px; color: var(--text-muted); margin-bottom: 20px; min-height: 36px; }
          .sync-btn { width: 100%; border-radius: 12px; padding: 10px; }
          .sync-status { margin-top: 15px; font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; }
          .sync-status.success { color: #00b35f; }
          body:not(.light-theme) .sync-status.success { color: #00ff88; }
          .sync-status.error { color: #ff4d4f; }

          .spin { animation: spin 1s linear infinite; }
          @keyframes spin { 100% { transform: rotate(360deg); } }
          
          .sessions-detalhes-view { margin-top: 20px; }
          .filter-group button { border-radius: 10px; }
          .filter-btn { padding: 6px 14px; font-size: 11px; font-weight: 500; border-radius: 20px; background: transparent; border: 1px solid var(--glass-border); color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
          .filter-btn:hover { background: var(--glass-bg); color: var(--text-main); }
          .filter-btn.active { background: rgba(138, 79, 255, 0.1); border-color: rgba(138, 79, 255, 0.4); color: var(--primary); }

          .session-item { border: 1px solid var(--glass-border); border-radius: 16px; padding: 20px; background: var(--glass-bg); backdrop-filter: blur(5px); }
          .session-title { font-size: 15px; font-weight: 600; color: var(--text-main); }
          
          .participant-name { font-weight: 500; color: var(--text-main); font-size: 12px; }
          .participant-email { font-size: 10px; color: var(--text-muted); }
          .presence-toggles { display: flex; gap: 4px; justify-content: center; }
          .toggle-btn { padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s; background: var(--glass-bg); color: var(--text-muted); border: 1px solid transparent; }
          .toggle-btn.yes.active { background: rgba(0,255,136,0.1); color: #00b35f; border-color: rgba(0,255,136,0.2); }
          body:not(.light-theme) .toggle-btn.yes.active { color: #00ff88; }
          .toggle-btn.no.active { background: rgba(255,77,79,0.1); color: #ff4d4f; border-color: rgba(255,77,79,0.2); }
          .loading-spinner { width: 30px; height: 30px; border: 2px solid var(--glass-border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
        `}</style>
      </main>
    </Layout>
  );
}
