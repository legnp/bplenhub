import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function Onboarding() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [currentStep, setCurrentStep] = useState(0); // 0: Intro, 1: Diagnostic, 2: Scheduling
  const [isCompleted, setIsCompleted] = useState(false);
  const [formData, setFormData] = useState({ name: '', company: '', goal: '' });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [bookingError, setBookingError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Carregar tema preferido
    const savedTheme = localStorage.getItem('bplen-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    // Aplicar tema ao corpo para efeito global
    document.body.className = `${theme}-theme theme-transition onboarding-bg`;
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

  const handleConfirmBooking = async () => {
    setIsBooking(true);
    setBookingError('');
    setMeetingLink('');

    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const response = await fetch('/api/schedule-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: formData.name || user.displayName,
          date: formattedDate,
          time: selectedTime
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao realizar agendamento');
      }

      setMeetingLink(data.meetingLink);
    } catch (err) {
      console.error(err);
      setBookingError(err.message);
    } finally {
      setIsBooking(false);
    }
  };

  // Elegant SVG Icons (SF Symbols Style)
  const TargetIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="12" r="6"></circle>
      <circle cx="12" cy="12" r="2"></circle>
    </svg>
  );

  const DiagnosticIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
  );

  const CalendarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );

  // Stepper definition
  const steps = [
    { title: 'Introdução', icon: <TargetIcon /> },
    { title: 'Diagnóstico Estratégico', icon: <DiagnosticIcon /> },
    { title: 'Sessão de Onboarding', icon: <CalendarIcon /> }
  ];

  // Logic for dates (3 to 15 days from today)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 3; i <= 15; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        dates.push(d);
      }
    }
    return dates;
  };

  const availableDates = getAvailableDates();
  const timeSlots = ['09:00', '10:00', '14:00', '15:00', '16:00'];

  if (loading) {
    return (
      <div className="page-wrapper onboarding-bg center-content">
        <p className="loading-text" style={{ color: '#fff' }}>Carregando sua jornada...</p>
      </div>
    );
  }

  return (
    <Layout
      title="Onboarding"
      user={user}
      theme={theme}
      toggleTheme={toggleTheme}
      handleLogout={handleLogout}
      showBackButton={true}
      isHeaderSticky={true}
    >

        <div className="sticky-sub-nav" style={{ position: 'relative', top: '0', background: 'transparent', borderBottom: 'none' }}>
          <div className="onboarding-header" style={{ paddingTop: '0' }}>
            <div className="stepper">
              {steps.map((s, idx) => {
                let statusClass = 'locked';
                if (idx === currentStep) statusClass = 'active';
                if (idx < currentStep) statusClass = 'completed';

                return (
                  <div 
                    key={idx} 
                    className={`stepper-item ${statusClass}`}
                    onClick={() => idx <= currentStep && setCurrentStep(idx)}
                  >
                    <div className="stepper-icon">{statusClass === 'completed' ? '✓' : s.icon}</div>
                    <span className="stepper-label">{s.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(15px)', width: '100%', height: '1px' }}></div>

      <main className="onboarding-container">
        <div className="onboarding-card">
          {currentStep === 0 && (
            <div className="onboarding-grid">
              <h1>Bem-vindo à sua nova jornada</h1>
              <p className="subtitle">Assista ao vídeo abaixo para entender como funciona o portal.</p>
              <div className="video-container">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                  title="Onboarding Video" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
              <button 
                onClick={() => setCurrentStep(1)} 
                className="auth-btn btn-primary-white"
                style={{ maxWidth: '300px' }}
              >
                Ir para Diagnóstico →
              </button>
            </div>
          )}

          {currentStep === 1 && (
            <div className="onboarding-grid">
              <h1>Diagnóstico Estratégico</h1>
              <p className="subtitle">Conte-nos um pouco sobre você e seus objetivos.</p>
              
              <div className="diagnostic-form">
                <div>
                  <label className="subtitle" style={{ display: 'block', marginBottom: '8px' }}>Seu Nome Completo</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    disabled={isCompleted}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="João Silva"
                  />
                </div>
                <div>
                  <label className="subtitle" style={{ display: 'block', marginBottom: '8px' }}>Nome da sua Empresa</label>
                  <input 
                    type="text" 
                    value={formData.company}
                    disabled={isCompleted}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    placeholder="BPlen S.A."
                  />
                </div>
                <div>
                  <label className="subtitle" style={{ display: 'block', marginBottom: '8px' }}>Seu principal objetivo hoje</label>
                  <input 
                    type="text" 
                    value={formData.goal}
                    disabled={isCompleted}
                    onChange={(e) => setFormData({...formData, goal: e.target.value})}
                    placeholder="Escalar meus processos..."
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                {!isCompleted && (
                  <button 
                    onClick={() => setIsCompleted(true)} 
                    className="auth-btn btn-primary-white"
                    style={{ maxWidth: '200px' }}
                  >
                    Salvar Diagnóstico
                  </button>
                )}
                {isCompleted && (
                  <button 
                    onClick={() => setCurrentStep(2)} 
                    className="auth-btn btn-primary-white"
                    style={{ maxWidth: '250px' }}
                  >
                    Ir para Agendamento →
                  </button>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="onboarding-grid">
              <h1>Agende sua Sessão</h1>
              <p className="subtitle">Escolha uma data entre 3 e 15 dias a partir de hoje.</p>

              <div className="dates-grid">
                {availableDates.map((date, idx) => (
                  <div 
                    key={idx} 
                    className={`date-card ${selectedDate?.toDateString() === date.toDateString() ? 'selected' : ''}`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div style={{ fontSize: '12px', opacity: 0.6 }}>{date.toLocaleDateString('pt-BR', { weekday: 'short' })}</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{date.getDate()}</div>
                    <div style={{ fontSize: '12px', opacity: 0.6 }}>{date.toLocaleDateString('pt-BR', { month: 'short' })}</div>
                  </div>
                ))}
              </div>

              {selectedDate && (
                <>
                  <p className="subtitle">Horários disponíveis:</p>
                  <div className="time-slots">
                    {timeSlots.map(time => (
                      <button 
                        key={time} 
                        className={`time-btn ${selectedTime === time ? 'selected' : ''}`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {selectedDate && selectedTime && !meetingLink && (
                <div style={{ marginTop: '40px' }}>
                  <button 
                    className="auth-btn btn-primary-white" 
                    style={{ maxWidth: '300px' }}
                    onClick={handleConfirmBooking}
                    disabled={isBooking}
                  >
                    {isBooking ? 'Agendando...' : 'Confirmar Agendamento'}
                  </button>
                  {bookingError && (
                    <p style={{ color: '#ff4444', marginTop: '15px', fontSize: '14px' }}>
                      {bookingError}
                    </p>
                  )}
                </div>
              )}

              {meetingLink && (
                <div className="onboarding-card" style={{ marginTop: '30px', background: 'rgba(0, 255, 0, 0.05)', borderColor: 'rgba(0, 255, 0, 0.2)' }}>
                  <h3 style={{ color: '#00ff88', marginBottom: '10px' }}>✓ Agendamento Confirmado!</h3>
                  <p className="subtitle" style={{ marginBottom: '20px' }}>
                    Sua sessão foi agendada para o dia <strong>{selectedDate.toLocaleDateString()}</strong> às <strong>{selectedTime}</strong>.
                    Um convite foi enviado para o seu e-mail.
                  </p>
                  <div style={{ padding: '15px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                    <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '5px' }}>Link da Reunião (Google Meet):</p>
                    <a 
                      href={meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ color: '#fff', textDecoration: 'underline', wordBreak: 'break-all' }}
                    >
                      {meetingLink}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}
