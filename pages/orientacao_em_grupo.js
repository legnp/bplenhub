import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { db, auth } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit, Timestamp } from 'firebase/firestore';
import Layout from '../components/Layout';

// --- Helpers ---
const getISOWeek = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return String(weekNo).padStart(2, '0');
};

// --- Custom Calendar Component ---
const CustomCalendar = ({ selectedDate, onSelectDate, theme, availableSessions, minDate, maxDate }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const today = new Date();

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  const handleGoToday = () => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));

  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const lastDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);

  const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastDayOfMonth.getDate();

  const monthName = viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const weekDays = ['SI', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  const isSelected = (d) => selectedDate && d.toDateString() === selectedDate.toDateString();
  const isToday = (d) => d.toDateString() === today.toDateString();

  const isAvailable = (d) => {
    if (minDate && d < minDate) return false;
    if (maxDate && d > maxDate) return false;
    // Check if there is at least one session on this day
    return availableSessions.some(s => s.dateObj.toDateString() === d.toDateString());
  };

  const rows = [];
  let currentDay = 1 - startOffset;

  while (currentDay <= daysInMonth) {
    const week = [];
    const firstDayOfWeek = new Date(viewDate.getFullYear(), viewDate.getMonth(), currentDay);
    week.push({ isSI: true, value: getISOWeek(firstDayOfWeek) });

    for (let i = 0; i < 7; i++) {
      const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), currentDay);
      if (currentDay > 0 && currentDay <= daysInMonth) {
        week.push({ isSI: false, date: d, day: currentDay, available: isAvailable(d) });
      } else {
        week.push({ isSI: false, date: null, day: '', available: false });
      }
      currentDay++;
    }
    rows.push(week);
  }

  return (
    <div className="bplen-glass-dark" style={{ width: '100%', maxWidth: '420px', margin: '0 auto', padding: '25px', borderRadius: '24px', border: '1px solid var(--glass-border)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={handleGoToday} className="secondary-btn" style={{ padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>Hoje</button>
        <h3 style={{ fontSize: '16px', textTransform: 'capitalize', margin: 0, fontWeight: '700' }}>{monthName}</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '20px' }}>&lt;</button>
          <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '20px' }}>&gt;</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px', textAlign: 'center' }}>
        {weekDays.map(wd => (
          <div key={wd} style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-muted)', paddingBottom: '10px' }}>{wd}</div>
        ))}
        {rows.map((week, widx) => week.map((cell, cidx) => {
          if (cell.isSI) return <div key={`si-${widx}`} style={{ fontSize: '10px', color: 'var(--primary)', opacity: 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>{cell.value}</div>;
          if (!cell.date) return <div key={`empty-${widx}-${cidx}`} />;
          
          const selected = isSelected(cell.date);
          const active = cell.available;

          return (
            <div 
              key={cell.date.getTime()} 
              onClick={() => onSelectDate(cell.date)} 
              style={{
                aspectRatio: '1/1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '14px', borderRadius: '14px',
                cursor: 'pointer', 
                background: selected ? 'var(--primary)' : (active ? 'rgba(138, 79, 255, 0.05)' : 'transparent'),
                color: selected ? '#fff' : (active ? 'var(--text-main)' : 'var(--text-muted)'),
                opacity: active || selected ? 1 : 0.3, 
                border: isToday(cell.date) ? '1px solid var(--primary)' : 'none',
                position: 'relative',
                transition: 'all 0.2s ease',
                fontWeight: selected || active ? '700' : '400'
              }}
            >
              {cell.day}
              {active && !selected && <div style={{ position: 'absolute', bottom: '4px', width: '4px', height: '4px', background: 'var(--primary)', borderRadius: '50%' }}></div>}
            </div>
          );
        }))}
      </div>
      <div style={{ marginTop: '15px', borderTop: '1px solid var(--glass-border)', paddingTop: '10px', textAlign: 'left' }}>
        <span style={{ fontSize: '9px', color: 'var(--text-muted)', opacity: 0.7 }}>SI: Semana ISO (ISO 8601) - Identificador semanal global.</span>
      </div>
    </div>
  );
};

export default function OrientacaoGrupo() {
  const [user, setUser] = useState(null);
  const [onboardingDate, setOnboardingDate] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [theme, setTheme] = useState('dark');
  const router = useRouter();

  const parseFirestoreDate = (ts) => {
    if (!ts) return null;
    if (typeof ts.toDate === 'function') return ts.toDate();
    if (ts.seconds) return new Date(ts.seconds * 1000);
    return new Date(ts);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('bplen-theme');
    if (savedTheme) setTheme(savedTheme);

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.agendamento_onboarding?.timestamp) {
            setOnboardingDate(parseFirestoreDate(data.agendamento_onboarding.timestamp));
          } else {
            console.warn('Onboarding date not found in user doc, using today as fallback');
            setOnboardingDate(new Date());
          }
        }
        await fetchSessions();
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    document.body.className = `${theme}-theme theme-transition dashboard-bg`;
    return () => { document.body.className = ''; };
  }, [theme]);

  const fetchSessions = async () => {
    try {
      console.log('Fetching sessions for Orientação em Grupo...');
      const q = query(collection(db, 'sessoes_orientacao_grupo'), orderBy('data_hora', 'asc'));
      const querySnapshot = await getDocs(q);
      const sessData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dateObj: parseFirestoreDate(data.data_hora)
        };
      });
      console.log(`Found ${sessData.length} sessions.`);
      setSessions(sessData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('bplen-theme', newTheme);
  };

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const maxDate = useMemo(() => {
    if (!onboardingDate) return null;
    const d = new Date(onboardingDate);
    d.setHours(23, 59, 59, 999);
    d.setDate(d.getDate() + 150);
    return d;
  }, [onboardingDate]);

  const minDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const availableSessionsForDate = useMemo(() => {
    return sessions.filter(s => 
      s.dateObj.getDate() === selectedDate.getDate() &&
      s.dateObj.getMonth() === selectedDate.getMonth() &&
      s.dateObj.getFullYear() === selectedDate.getFullYear()
    );
  }, [sessions, selectedDate]);

  const nextSevenSessions = useMemo(() => {
    const today = new Date();
    return sessions
      .filter(s => s.dateObj >= today)
      .slice(0, 7);
  }, [sessions]);

  const handleSchedule = async (session) => {
    if (session.vagas_restantes <= 0) {
      setMessage({ type: 'error', text: 'Esta sessão está lotada.' });
      return;
    }

    if (!confirm(`Confirmar agendamento para "${session.tema}" em ${session.dateObj.toLocaleDateString()} às ${session.dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}?`)) return;

    setScheduling(true);
    try {
      const res = await fetch('/api/schedule-orientacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.displayName || 'Usuário BPlen',
          eventId: session.id, // Enviar ID direto para evitar erros de timezone
          date: session.dateObj.toISOString().split('T')[0],
          time: session.dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false })
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Agendamento realizado com sucesso! Verifique seu e-mail.' });
        fetchSessions();

        // Enviar E-mail de Confirmação (Resend)
        fetch('/api/send-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: user.displayName || 'Membro BPlen',
            email: user.email,
            data: session.dateObj.toLocaleDateString('pt-BR'),
            hora: session.dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            link_meet: data.meetingLink || session.link_meet,
            timestamp: session.dateObj.getTime(),
            type: 'orientacao' // Identificador para o template correto
          })
        }).catch(err => console.error("Erro ao enviar email:", err));

      } else {
        setMessage({ 
          type: 'error', 
          text: data.error + (data.details ? `: ${data.details}` : '')
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro de conexão.' });
    }
    setScheduling(true); // Manter bloqueado por um momento
    setTimeout(() => setScheduling(false), 2000);
  };

  if (loading) return <div className="loading-screen">Carregando seus agendamentos...</div>;

  return (
    <Layout title="Orientação em Grupo" user={user} theme={theme} toggleTheme={toggleTheme} handleLogout={handleLogout}>
      <main className="dashboard-main orientacao-main">
        <header style={{ marginBottom: '40px' }}>
          <h1 className="title">Orientação em Grupo</h1>
          <p className="subtitle">Escolha o melhor tema e horário para sua jornada.</p>
        </header>

        {message.text && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '20px' }}>
            {message.text}
          </div>
        )}

        <div className="orient-split-grid">
          {/* COLUNA ESQUERDA: CALENDÁRIO CUSTOMIZADO */}
          <div className="orient-col-left">
            <CustomCalendar 
              selectedDate={selectedDate} 
              onSelectDate={setSelectedDate} 
              theme={theme}
              availableSessions={sessions}
              minDate={minDate}
              maxDate={maxDate}
            />
            <div className="orient-legend">
              <span className="dot"></span> Dias com sessões disponíveis
            </div>
          </div>

          {/* COLUNA DIREITA: GRADES */}
          <div className="orient-col-right">
            
            {/* GRADE 1: SESSÕES DO DIA SELECIONADO */}
            <section style={{ marginBottom: '40px' }}>
              <h2 className="grid-section-title">
                Horários para {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
              </h2>
              <div className="slots-container">
                {availableSessionsForDate.length > 0 ? (
                  availableSessionsForDate.map(s => (
                    <div key={s.id} className="bplen-glass-dark slot-card-orient">
                      <div className="slot-header-orient">
                        <span className="slot-time-orient">{s.dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="slot-vagas-orient">{s.vagas_restantes} vagas</span>
                      </div>
                      <div className="slot-theme-orient" title={s.tema}>{s.tema}</div>
                      <button 
                        className="primary-btn slot-btn-orient" 
                        onClick={() => handleSchedule(s)}
                        disabled={scheduling || s.vagas_restantes <= 0}
                      >
                        {scheduling ? 'Processando...' : 'Agendar esta sessão'}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="no-orient-slots">Nenhuma sessão encontrada para esta data.</div>
                )}
              </div>
            </section>

            {/* GRADE 2: PRÓXIMAS 7 SESSÕES */}
            <section>
              <h2 className="grid-section-title">Próximas 7 Sessões</h2>
              <div className="bplen-glass-dark upcoming-orient-list">
                {nextSevenSessions.map(s => (
                  <div key={s.id} className="upcoming-orient-item" onClick={() => { setSelectedDate(s.dateObj); }}>
                    <div className="upcoming-date-box">
                      <span className="upcoming-day">{s.dateObj.getDate()}</span>
                      <span className="upcoming-month">{s.dateObj.toLocaleDateString('pt-BR', { month: 'short' })}</span>
                    </div>
                    <div className="upcoming-info-box">
                      <div className="upcoming-theme-text">{s.tema}</div>
                      <div className="upcoming-time-text">{s.dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <button className="secondary-btn upcoming-btn-orient" onClick={(e) => { e.stopPropagation(); handleSchedule(s); }}>Agendar</button>
                  </div>
                ))}
                {nextSevenSessions.length === 0 && <p className="no-orient-slots" style={{ padding: '20px' }}>Nenhuma sessão futura programada.</p>}
              </div>
            </section>
          </div>
        </div>
      </main>

      <style jsx>{`
        .orientacao-main { max-width: 1300px !important; }
        .title { font-size: 36px; font-weight: 800; margin-bottom: 8px; color: var(--text-main); }
        
        .orient-split-grid { display: grid; grid-template-columns: 420px 1fr; gap: 40px; align-items: start; }
        
        .orient-legend { margin-top: 20px; font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 8px; padding-left: 10px; }
        .orient-legend .dot { width: 6px; height: 6px; background: var(--primary); border-radius: 50%; box-shadow: 0 0 8px var(--primary); }

        .grid-section-title { font-size: 18px; font-weight: 700; color: var(--text-main); margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
        
        .slots-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
        .slot-card-orient { padding: 24px; border-radius: 20px; transition: all 0.3s ease; border: 1px solid rgba(255,255,255,0.05); }
        .slot-card-orient:hover { border-color: var(--primary); transform: translateY(-3px); }
        .slot-header-orient { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .slot-time-orient { font-size: 24px; font-weight: 800; color: var(--text-main); }
        .slot-vagas-orient { font-size: 11px; color: var(--text-muted); padding: 4px 12px; background: rgba(255,255,255,0.05); border-radius: 20px; font-weight: 600; }
        .slot-theme-orient { font-size: 14px; font-weight: 600; color: var(--primary); margin-bottom: 24px; height: 42px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.5; }
        .slot-btn-orient { width: 100%; border-radius: 14px; font-size: 13px; font-weight: 600; }

        .upcoming-orient-list { border-radius: 24px; padding: 8px; }
        .upcoming-orient-item { display: flex; align-items: center; padding: 14px 18px; border-radius: 18px; cursor: pointer; transition: background 0.2s; gap: 20px; }
        .upcoming-orient-item:hover { background: rgba(255,255,255,0.04); }
        
        .upcoming-date-box { display: flex; flex-direction: column; align-items: center; min-width: 55px; background: rgba(255,255,255,0.03); padding: 10px; border-radius: 14px; }
        .upcoming-day { font-size: 22px; font-weight: 800; line-height: 1; color: var(--text-main); }
        .upcoming-month { font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-top: 4px; }
        
        .upcoming-info-box { flex: 1; min-width: 0; }
        .upcoming-theme-text { font-size: 15px; font-weight: 600; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .upcoming-time-text { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
        .upcoming-btn-orient { padding: 10px 20px !important; font-size: 13px !important; border-radius: 12px !important; }

        .no-orient-slots { grid-column: 1 / -1; padding: 60px; text-align: center; color: var(--text-muted); background: rgba(255,255,255,0.01); border: 1px dashed rgba(255,255,255,0.1); border-radius: 24px; font-size: 15px; }

        .alert { padding: 16px 24px; border-radius: 18px; font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 12px; }
        .alert-success { background: rgba(0, 255, 136, 0.08); color: #00ff88; border: 1px solid rgba(0, 255, 136, 0.2); }
        .alert-error { background: rgba(255, 77, 77, 0.08); color: #ff4d4d; border: 1px solid rgba(255, 77, 77, 0.2); }

        .loading-screen { height: 100vh; display: flex; align-items: center; justify-content: center; background: #0a0a0c; color: var(--text-muted); font-size: 18px; font-weight: 600; letter-spacing: 2px; }

        @media (max-width: 1024px) {
          .orient-split-grid { grid-template-columns: 1fr; gap: 30px; }
          .orient-col-left { max-width: 420px; margin: 0 auto; width: 100%; }
        }
      `}</style>
    </Layout>
  );
}
