import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
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

// --- Components ---
const Calendar = ({ selectedDate, onSelectDate, theme }) => {
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
    const minDate = new Date();
    minDate.setDate(today.getDate() + 3);
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 25);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    return d >= minDate && d <= maxDate && !isWeekend;
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
    <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
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
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [bookingError, setBookingError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem('bplen-theme');
    if (savedTheme) setTheme(savedTheme);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const docRef = doc(db, 'onboarding_surveys', currentUser.email);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().survey_checkin_concluido) {
            setIsCompleted(true);
            setCurrentStep(2);
          }
        } catch (err) { console.error(err); }
        finally { setIsCheckingPersistence(false); setLoading(false); }
      } else { router.push('/login'); }
    });
    return () => unsubscribe();
  }, [router]);

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

  const handleConfirmBooking = async () => {
    setIsBooking(true);
    setBookingError('');
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const res = await fetch('/api/schedule-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, name: user.displayName || 'Membro', date: formattedDate, time: selectedTime })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMeetingLink(data.meetingLink);
    } catch (err) { setBookingError(err.message); }
    finally { setIsBooking(false); }
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
  const timeSlots = ['09:00', '10:00', '14:00', '15:00', '16:00'];

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
              return (
                <div key={idx} className={`stepper-item ${statusClass}`} onClick={() => idx <= currentStep && setCurrentStep(idx)}>
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
                      const docRef = doc(db, 'onboarding_surveys', user.email);
                      const docSnap = await getDoc(docRef);
                      const finalMatricula = (docSnap.exists() ? docSnap.data().matricula_bplen : null) || `BPL-2026-${Math.floor(1000 + Math.random() * 9000)}`;

                      let driveLinks = null;
                      if (files && Object.keys(files).length > 0) {
                        const formData = new FormData();
                        formData.append('userName', user.displayName || 'Membro'); formData.append('matricula', finalMatricula); formData.append('userEmail', user.email);
                        Object.keys(files).forEach(key => formData.append(key, files[key]));
                        const uploadRes = await fetch('/api/upload-to-drive', { method: 'POST', body: formData });
                        const uploadData = await uploadRes.json();
                        if (uploadData.success) driveLinks = { folder: uploadData.folderLink, files: uploadData.files };
                      }

                      await setDoc(docRef, {
                        uid: user.uid, matricula_bplen: finalMatricula, survey_checkin_respostas: data, survey_checkin_concluido: true, drive_links: driveLinks,
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
                   <p onClick={() => setCurrentStep(2)} className="btn-glass-subtle" style={{ margin: '20px auto 0', cursor: 'pointer' }}>Ver Calendário →</p>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="onboarding-grid" style={{ textAlign: 'center' }}>
              <h2 style={{ color: 'var(--text-main)', fontSize: '20px', marginBottom: '10px' }}>Agende sua Sessão</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '5px' }}>Escolha uma data disponível no calendário abaixo.</p>
              <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} theme={theme} />
              {selectedDate && (
                <div style={{ marginTop: '30px', animation: 'fadeIn 0.5s ease' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '15px' }}>Horários disponíveis para {selectedDate.toLocaleDateString('pt-BR')}:</p>
                  <div className="time-slots" style={{ justifyContent: 'center' }}>
                    {timeSlots.map(time => (
                      <button key={time} className={`time-btn ${selectedTime === time ? 'selected' : ''}`} onClick={() => setSelectedTime(time)} style={{ padding: '8px 16px', borderRadius: '10px' }}>{time}</button>
                    ))}
                  </div>
                </div>
              )}
              {selectedDate && selectedTime && !meetingLink && (
                <button
                  className="btn-glass-subtle"
                  onClick={handleConfirmBooking}
                  disabled={isBooking}
                  style={{ margin: '5px auto', display: 'block' }}
                >
                  {isBooking ? 'Agendando...' : 'Confirmar Agendamento'}
                </button>
              )}
              {meetingLink && (
                <div style={{ marginTop: '30px', background: 'rgba(0, 255, 0, 0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(0, 255, 0, 0.2)' }}>
                  <h3 style={{ color: '#00ff88', marginBottom: '10px', fontSize: '16px' }}>Agendamento Confirmado!</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sessão em <strong>{selectedDate.toLocaleDateString()}</strong> às <strong>{selectedTime}</strong>.</p>
                  <a href={meetingLink} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '15px', color: 'var(--primary)', textDecoration: 'underline' }}>Abrir no Google Meet</a>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}
