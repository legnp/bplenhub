import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs, runTransaction, Timestamp } from 'firebase/firestore';
import CheckinSurvey from '../components/DiagnosticSurvey';

// --- Helpers ---
const getISOWeek = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return String(weekNo).padStart(2, '0');
};

const getMinBusinessDate = () => {
  let d = new Date();
  d.setDate(d.getDate() + 3); // Mínimo de 3 dias a contar de hoje
  d.setHours(0, 0, 0, 0);
  return d;
};

const getMaxDate = () => {
  let d = new Date();
  d.setDate(d.getDate() + 15); // Máximo de 15 dias a contar de hoje
  d.setHours(23, 59, 59, 999);
  return d;
};


// --- Components ---
const Calendar = ({ selectedDate, onSelectDate, theme, availableSessions }) => {
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

  const minDate = getMinBusinessDate();
  const maxDate = getMaxDate();

  const isAvailable = (d) => {
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    if (d < minDate || d > maxDate || isWeekend) return false;
    // Check if there is at least one session on this day with vagas < totais
    return availableSessions.some(s => s.dateObj.toDateString() === d.toDateString() && (s.vagas_ocupadas || 0) < (s.vagas_totais || 10));
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
    <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto', fontFamily: "'Inter', sans-serif", background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', padding: '20px', borderRadius: '16px', border: '1px solid var(--glass-border)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <button onClick={handleGoToday} style={{ background: 'rgba(138, 79, 255, 0.1)', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>Hoje</button>
        <h3 style={{ fontSize: '14px', textTransform: 'capitalize', margin: 0 }}>{monthName}</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '18px' }}>&lt;</button>
          <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '18px' }}>&gt;</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px', textAlign: 'center' }}>
        {weekDays.map(wd => (
          <div key={wd} style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-muted)', paddingBottom: '8px' }}>{wd}</div>
        ))}
        {rows.map((week, widx) => week.map((cell, cidx) => {
          if (cell.isSI) return <div key={`si-${widx}`} style={{ fontSize: '9px', color: 'var(--primary)', opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cell.value}</div>;
          if (!cell.date) return <div key={`empty-${widx}-${cidx}`} />;
          return (
            <div key={cell.date.getTime()} onClick={() => cell.available && onSelectDate(cell.date)} style={{
              aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', borderRadius: '50%',
              cursor: cell.available ? 'pointer' : 'default', background: isSelected(cell.date) ? 'var(--primary)' : 'transparent',
              color: isSelected(cell.date) ? '#fff' : (cell.available ? 'var(--text-main)' : 'var(--text-muted)'),
              opacity: cell.available ? 1 : 0.4, border: isToday(cell.date) ? '1px solid var(--primary)' : 'none',
              boxShadow: isToday(cell.date) ? '0 0 8px rgba(138, 79, 255, 0.3)' : 'none', transition: 'all 0.2s ease'
            }}>
              {cell.day}
            </div>
          );
        }))}
      </div>
      <div style={{ marginTop: '10px', borderTop: '1px solid var(--glass-border)', paddingTop: '6px', textAlign: 'left' }}>
        <span style={{ fontSize: '8px', color: 'var(--text-muted)', opacity: 0.7 }}>SI: Semana ISO (ISO 8601) - Identificador semanal global.</span>
      </div>
    </div>
  );
};

export default function Onboarding() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCheckingPersistence, setIsCheckingPersistence] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const [availableSessions, setAvailableSessions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [scheduledSession, setScheduledSession] = useState(null); // The final booked session data from/for DB
  const [oldSessionId, setOldSessionId] = useState(null); // tracking for reagendamento
  const [adminConfirmed, setAdminConfirmed] = useState(false);
  const [ataOnboardingUrl, setAtaOnboardingUrl] = useState(null);

  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const router = useRouter();

  // Load User Data
  useEffect(() => {
    const savedTheme = localStorage.getItem('bplen-theme');
    if (savedTheme) setTheme(savedTheme);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, 'usuarios', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          let checkinDone = false;
          let scheduled = null;

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            if (data.survey_checkin_concluido) checkinDone = true;
            if (data.agendamento_onboarding) scheduled = data.agendamento_onboarding;
            if (data.presenca_confirmada) setAdminConfirmed(true);
            if (data.ata_onboarding_url) setAtaOnboardingUrl(data.ata_onboarding_url);
          }

          // Fallback automático de migração: se não achou no UID, busca na coleção antiga pelo e-mail
          if (!checkinDone) {
            const oldSurveyRef = doc(db, 'onboarding_surveys', currentUser.email);
            const oldSurveySnap = await getDoc(oldSurveyRef);
            if (oldSurveySnap.exists() && oldSurveySnap.data().survey_checkin_concluido) {
              checkinDone = true;
              // Copia os dados legados para a nova coleção usuarios/{uid}
              await setDoc(userDocRef, oldSurveySnap.data(), { merge: true });
            }
          }

          if (checkinDone) {
            setIsCompleted(true);
            setCurrentStep(prev => prev < 2 ? 2 : prev);
          }
          if (scheduled) {
            setScheduledSession(scheduled);
            setOldSessionId(scheduled.id_sessao);
            setCurrentStep(2);
          }
        } catch (err) { console.error(err); }
        finally { setIsCheckingPersistence(false); setLoading(false); }
      } else { router.push('/login'); }
    });
    return () => unsubscribe();
  }, [router]);

  // Load Sessions from Firestore
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + 90); // Sync window
        const q = query(
          collection(db, 'sessoes_onboarding'),
          where('data_hora', '>=', Timestamp.fromDate(start)),
          where('data_hora', '<=', Timestamp.fromDate(end))
        );
        const snapshot = await getDocs(q);
        const sessions = snapshot.docs.map(doc => {
          const data = doc.data();
          return { id: doc.id, ...data, dateObj: data.data_hora.toDate() };
        });
        console.log('Sessões carregadas no Onboarding:', sessions.length);
        setAvailableSessions(sessions);
      } catch (e) { console.error("Error fetching sessions:", e); }
    };
    if (user) fetchSessions();
  }, [user]);

  useEffect(() => {
    document.body.className = `${theme}-theme theme-transition onboarding-bg`;
    return () => { document.body.className = ''; };
  }, [theme]);

  if (loading || isCheckingPersistence) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a1a2f', color: '#fff' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(138, 79, 255, 0.3)', borderTop: '3px solid #8a4fff', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' }} />
        <p style={{ fontFamily: '"Caladea", serif', fontSize: '18px', opacity: 0.8 }}>Carregando sua jornada...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('bplen-theme', newTheme);
  };

  const handleLogout = async () => { await signOut(auth); router.push('/login'); };

  const handleModifyBooking = () => {
    if (!scheduledSession) return;
    // Checar se falta menos de 3 horas
    const msLeft = scheduledSession.timestamp - Date.now();
    if (msLeft < 3 * 60 * 60 * 1000 && msLeft > 0) {
      alert('Não é possível modificar o agendamento quando faltam menos de 3 horas para a sessão.');
      return;
    }
    // Permite o reset do flow para reagendamento. oldSessionId is already saved in state.
    setScheduledSession(null);
    setSelectedDate(null);
    setSelectedSessionId(null);
  };



  const handleConfirmBooking = async () => {
    if (!selectedSessionId) return;
    setIsBooking(true);
    setBookingError('');
    try {
      let finalSessionDataForUI = null;

      await runTransaction(db, async (transaction) => {
        // Lendo a Sessao Alvo
        const sessionRef = doc(db, 'sessoes_onboarding', selectedSessionId);
        const sessionDoc = await transaction.get(sessionRef);
        if (!sessionDoc.exists()) throw new Error("A sessão escolhida não foi encontrada.");

        const sData = sessionDoc.data();
        const ocupadas = sData.vagas_ocupadas || 0;
        const totais = sData.vagas_totais || 10;

        if (ocupadas >= totais) {
          throw new Error("Desculpe, esta sessão esgotou as vagas enquanto você agendava.");
        }

        // Se estiver reagendando, processa a remocao da sessao atual
        if (oldSessionId && oldSessionId !== selectedSessionId) {
          const oldSessionRef = doc(db, 'sessoes_onboarding', oldSessionId);
          const oldSessionDoc = await transaction.get(oldSessionRef);
          if (oldSessionDoc.exists()) {
            const oldData = oldSessionDoc.data();
            const removedParticipantes = (oldData.participantes || []).filter(p => p.uid !== user.uid);
            transaction.update(oldSessionRef, {
              vagas_ocupadas: Math.max(0, (oldData.vagas_ocupadas || 1) - 1),
              participantes: removedParticipantes
            });
          }
        }

        // Processa a inscricao na sessao atual
        const participantInfo = { uid: user.uid, nome: user.displayName || 'Membro BPlen', email: user.email };
        const updatedParticipantes = [...(sData.participantes || []), participantInfo];
        transaction.update(sessionRef, {
          vagas_ocupadas: ocupadas + 1,
          participantes: updatedParticipantes
        });

        // Grava no perfil do usuario
        const userRef = doc(db, 'usuarios', user.uid);
        const sessionDateObj = sData.data_hora.toDate();

        finalSessionDataForUI = {
          id_sessao: selectedSessionId,
          data: sessionDateObj.toLocaleDateString('pt-BR'),
          hora: sessionDateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          link_meet: sData.link_meet || '',
          timestamp: sessionDateObj.getTime()
        };

        transaction.set(userRef, { agendamento_onboarding: finalSessionDataForUI }, { merge: true });
      });

      // Update UI state
      setScheduledSession(finalSessionDataForUI);
      setOldSessionId(finalSessionDataForUI.id_sessao); // Current valid one

      // Dispatch Email Confirmation via Resend API
      fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: user.displayName,
          email: user.email,
          data: finalSessionDataForUI.data,
          hora: finalSessionDataForUI.hora,
          link_meet: finalSessionDataForUI.link_meet,
          timestamp: finalSessionDataForUI.timestamp
        })
      }).catch(err => console.error("Erro no envio do email:", err));
    } catch (err) {
      setBookingError(err.message || 'Erro inesperado.');
    } finally {
      setIsBooking(false);
    }
  };

  const TargetIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>
    </svg>
  );
  const DiagnosticIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
  );
  const CalendarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );

  const steps = [{ title: 'Introdução', icon: <TargetIcon /> }, { title: 'Check-In', icon: <DiagnosticIcon /> }, { title: 'Sessão de Onboarding', icon: <CalendarIcon /> }];

  // Derivando horarios disponiveis com base na data do calendario
  const timeSlotsForSelectedDate = selectedDate ? availableSessions.filter(s => s.dateObj.toDateString() === selectedDate.toDateString() && (s.vagas_ocupadas || 0) < (s.vagas_totais || 10)) : [];
  timeSlotsForSelectedDate.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  return (
    <Layout title="Onboarding" user={user} theme={theme} toggleTheme={toggleTheme} handleLogout={handleLogout} showBackButton={true}>

      <div className="sticky-sub-nav" style={{ position: 'fixed', top: '80px', left: 0, width: '100%', background: 'var(--app-bg)', zIndex: 100, paddingTop: '5px', paddingBottom: '10px' }}>
        <div style={{ maxWidth: '840px', width: '60%', margin: '0 auto', padding: '0 30px', display: 'flex', justifyContent: 'flex-start' }}>
          <button onClick={() => router.push('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', marginTop: '5px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Voltar ao Dashboard
          </button>
        </div>
        <div className="onboarding-header" style={{ paddingTop: '30px' }}>
          <div className="stepper">
            {steps.map((s, idx) => {
              let statusClass = (idx === currentStep) ? 'active' : (idx < currentStep ? 'completed' : 'locked');
              // Se tiver um agendamento, todo o stepper exibe completo
              if (scheduledSession && idx <= 2) statusClass = 'completed';
              return (
                <div key={idx} className={`stepper-item ${statusClass}`} onClick={() => {
                  if (idx <= currentStep || (idx === 2 && isCompleted)) setCurrentStep(idx);
                }}>
                  <div className="stepper-icon">{statusClass === 'completed' ? '✓' : s.icon}</div>
                  <span className="stepper-label">{s.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ height: '160px' }}></div>

      <main className="onboarding-container">
        <div className="onboarding-card" style={(currentStep === 1 || currentStep === 2) ? { background: 'transparent', border: 'none', boxShadow: 'none' } : {}}>
          {currentStep === 0 && (
            <div className="onboarding-grid">
              <div className="video-container"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Onboarding Video" frameBorder="0" allowFullScreen></iframe></div>
              <button onClick={() => setCurrentStep(1)} className="btn-glass-subtle" style={{ marginTop: '20px' }}>Ir para o Check-In →</button>
            </div>
          )}

          {currentStep === 1 && (
            <div className="onboarding-grid" style={{ width: '100%', maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
              {!isCompleted ? (
                <CheckinSurvey theme={theme} onComplete={async (data, files) => {
                  setIsCompleted(true);
                  try {
                    // Salvando no usuarios/{uid} para ficar robusto
                    const userDocRef = doc(db, 'usuarios', user.uid);
                    const finalMatricula = `BPL-2026-${Math.floor(1000 + Math.random() * 9000)}`;

                    let driveLinks = null;
                    if (files && Object.keys(files).length > 0) {
                      const formData = new FormData();
                      formData.append('userName', user.displayName || 'Membro'); formData.append('matricula', finalMatricula); formData.append('userEmail', user.email);
                      Object.keys(files).forEach(key => formData.append(key, files[key]));
                      const uploadRes = await fetch('/api/upload-to-drive', { method: 'POST', body: formData });
                      const uploadData = await uploadRes.json();
                      if (uploadData.success) driveLinks = { folder: uploadData.folderLink, files: uploadData.files };
                    }

                    await setDoc(userDocRef, {
                      matricula_bplen: finalMatricula,
                      survey_checkin_respostas: data,
                      survey_checkin_concluido: true,
                      drive_links: driveLinks,
                      perfil_profissional: { nicho: data.nicho || '', area_atuacao: data.departamento || '' },
                      maturidade_carreira: { estagio: data.estagio || '', tempo_experiencia: data.anos_exp || '' },
                      updatedAt: serverTimestamp()
                    }, { merge: true });
                  } catch (err) { console.error(err); }
                }}
                />
              ) : (
                <div style={{ background: 'var(--glass-bg)', padding: '30px', borderRadius: '12px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                  <div style={{ color: 'var(--primary)', fontSize: '40px', marginBottom: '10px' }}>✓</div>
                  <h2 style={{ color: 'var(--text-main)', fontSize: '20px' }}>Check-In Concluído!</h2>
                  <p onClick={() => setCurrentStep(2)} className="btn-glass-subtle" style={{ margin: '20px auto 0', cursor: 'pointer' }}>Ir para Agendamento →</p>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="onboarding-grid" style={{ textAlign: 'center', gap: '5px' }}>

              {scheduledSession ? (
                <div style={{ background: 'var(--glass-bg)', padding: '40px', borderRadius: '16px', border: '1px solid var(--glass-border)', maxWidth: '600px', margin: '0 auto', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                  <div style={{ color: '#00ff88', fontSize: '48px', marginBottom: '15px' }}>✓</div>
                  <h2 style={{ color: 'var(--text-main)', fontSize: '22px', marginBottom: '15px', fontFamily: "'Outfit', sans-serif" }}>
                    {adminConfirmed ? '🎉 Onboarding Concluído!' : 'Agendamento Confirmado!'}
                  </h2>

                  <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', marginBottom: '25px' }}>
                    {adminConfirmed 
                      ? `${user?.displayName?.split(' ')[0] || 'Cliente'}, parabéns por concluir seu onboarding! Sua jornada bplen continua.`
                      : `${user?.displayName?.split(' ')[0] || 'Cliente'}, seu Onboarding foi agendado com sucesso para <strong>${scheduledSession.data}</strong> às <strong>${scheduledSession.hora}</strong>, com Lisandra Lencina.`
                    }
                  </p>

                  <div style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                    {!adminConfirmed && (
                      <a href={scheduledSession.link_meet} target="_blank" rel="noreferrer" className="btn-glass-subtle" style={{ padding: '12px 20px', background: 'rgba(138, 79, 255, 0.1)', color: 'var(--primary)', borderColor: 'var(--primary)', width: 'fit-content' }}>
                        Acessar Sala do Google Meet
                      </a>
                    )}
                    
                    {ataOnboardingUrl && (
                      <a href={ataOnboardingUrl} target="_blank" rel="noreferrer" className="btn-glass-subtle" style={{ padding: '12px 20px', background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', borderColor: '#00ff88', width: 'fit-content' }}>
                        📥 Baixar Ata da Sessão (PDF)
                      </a>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    {!adminConfirmed && (
                      <button onClick={handleModifyBooking} className="btn-glass-subtle" style={{ fontSize: '13px', background: 'transparent', color: 'var(--text-muted)' }}>
                        Modificar Agendamento
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <h2 style={{ color: 'var(--text-main)', fontSize: '20px', marginBottom: '10px' }}>Agende sua Sessão de Grupo</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '5px' }}>Selecione uma turma disponível na sua janela de agendamento (entre 3 a 15 dias).</p>

                  <Calendar selectedDate={selectedDate} onSelectDate={(date) => { setSelectedDate(date); setSelectedSessionId(null); }} theme={theme} availableSessions={availableSessions} />

                  {selectedDate && (
                    <div style={{ marginTop: '15px', animation: 'fadeIn 0.5s ease' }}>
                      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '15px' }}>Vagas da Turma em {selectedDate.toLocaleDateString('pt-BR')}:</p>

                      {timeSlotsForSelectedDate.length > 0 ? (
                        <div className="time-slots" style={{ justifyContent: 'center' }}>
                          {timeSlotsForSelectedDate.map(session => {
                            const t = session.dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                            const isSelected = selectedSessionId === session.id;
                            const vagasRestantes = typeof session.vagas_restantes !== 'undefined' 
                              ? session.vagas_restantes 
                              : (session.vagas_totais || 10) - (session.vagas_ocupadas || 0);

                            return (
                              <button key={session.id} className={`time-btn ${isSelected ? 'selected' : ''}`} onClick={() => setSelectedSessionId(session.id)} style={{ padding: '8px 16px', borderRadius: '10px' }}>
                                {t} <span style={{ fontSize: '10px', opacity: 0.7 }}>({vagasRestantes} vagas)</span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p style={{ fontSize: '12px', color: '#ff4f4f' }}>Nenhuma vaga restante neste dia.</p>
                      )}
                    </div>
                  )}

                  {bookingError && <p style={{ color: '#ff4f4f', marginTop: '15px', fontSize: '13px' }}>{bookingError}</p>}

                  {selectedDate && selectedSessionId && (
                    <button
                      className="btn-glass-subtle"
                      onClick={handleConfirmBooking}
                      disabled={isBooking}
                      style={{ margin: '15px auto', display: 'block', border: '1px solid var(--primary)', color: 'var(--primary)', background: 'rgba(138, 79, 255, 0.05)' }}
                    >
                      {isBooking ? 'Finalizando Inscrição...' : 'Confirmar Vaga'}
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}
