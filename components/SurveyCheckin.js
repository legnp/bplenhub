import React, { useState, useEffect, useRef, useMemo } from 'react';

// --- Typewriter Hook ---
const useTypewriter = (text, speed = 45) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    if (!text) return;

    setIsTyping(true);
    let i = 0;

    const timer = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayedText, isTyping };
};

// --- Constants ---
const SEGURADORAS = [
  'Bradesco Saúde', 'Amil', 'SulAmérica', 'Unimed', 'Porto Seguro',
  'Notre Dame Intermédica', 'Hapvida', 'Allianz Saúde', 'MetLife',
  'Omint', 'Mediservice', 'Care Plus', 'Cassi', 'Outros'
];

// --- Main Survey Component ---
export default function DiagnosticSurvey({ user, theme, onComplete }) {
  const [currentQId, setCurrentQId] = useState('q1_intro');
  const [surveyData, setSurveyData] = useState({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  const userName = user?.displayName?.split(' ')[0] || 'Visitante';

  // State Machine Definition
  const questions = {
    q1_intro: {
      type: 'buttons',
      text: `Olá ${userName}! Agora que já se familiarizou com a plataforma, você nos permite conhecer um pouco mais sobre você?`,
      options: [
        { label: 'Com certeza', next: 'q2_com_certeza' },
        { label: 'Sim, mas não muito', next: 'q2_mas_nao_muito' }
      ]
    },
    q2_mas_nao_muito: {
      type: 'text',
      id: 'preocupacao',
      text: `${userName}, entendido. Hoje qual é a sua maior preocupação em contar sobre você?`,
      next: 'q3_objetivos'
    },
    q2_com_certeza: {
      type: 'text',
      id: 'melhor_coisa',
      text: `Legal!!! Vamos nessa! Qual é a melhor coisa sobre você, que deveríamos saber para te apoiar na sua jornada?`,
      next: 'q3_objetivos'
    },
    q3_objetivos: {
      type: 'multi_text',
      text: `${userName}, qual é o seu principal objetivo pelos próximos 90 dias, 6 meses e 5 anos?`,
      fields: [
        { id: 'objetivos', placeholder: 'Objetivos em 90 dias, 6 meses e 5 anos' },
        { id: 'tempo_busca', placeholder: 'Em quanto tempo você pretende iniciar a busca pelo primeiro objetivo?' }
      ],
      next: 'q4_barreiras'
    },
    q4_barreiras: {
      type: 'text',
      id: 'barreiras',
      text: `Quais são as maiores barreiras que você enfrenta hoje para alcançar esses objetivos?`,
      placeholder: 'Suas barreiras...',
      next: 'q5_desafios'
    },
    q5_desafios: {
      type: 'multi_select',
      id: 'desafios',
      text: `Certo! E dentro desse contexto, quais são os SEUS 3 a 5 maiores desafios?`,
      min: 3, max: 5,
      options: [
        'Entender jargões, termos técnicos ou expressões',
        'Organizar o meu tempo e a priorização de tarefas diárias',
        'Esforço excessivo para manter meu foco e concentração',
        'Ergonomia ou ambiente inadequado',
        'Sobrecarga de informações (dificuldade em filtrar o que é útil)',
        'Dificuldade que os outros me entendam com clareza',
        'Resistência ou dificuldade em me adaptar a novas ferramentas',
        'Dificuldade em delegar tarefas e confiar que os outros vão entregar',
        'Falta de clareza no alinhamento de expectativas com outros',
        'Eu travo em dar ou receber feedbacks positivos e/ou difíceis (corretivos)',
        'Sensação de sobrecarga constante ou proximidade de burnout',
        'Síndrome do Impostor (medo de não estar à altura dos desafios)',
        'Ansiedade em relação a resultados futuros ou mudanças',
        'Exaustão mental causada pelo excesso de tomada de decisão',
        'Dificuldade em me desconectar das atividades (falta de "botão off")'
      ],
      next: 'q6_pausa'
    },
    q6_pausa: {
      type: 'buttons',
      text: `Que avanço! Parabéns! Sabemos que nem sempre é tão fácil resumir nossos desafios em algumas palavras. Mas é isso, um passo por vez!\n\nPodemos prosseguir?`,
      options: [
        { label: 'Sim', next: 'q7_nicho' },
        { label: 'Pausar', next: 'PAUSE' }
      ]
    },
    q7_nicho: {
      type: 'cascaded_select',
      text: `Ótimo! Qual o seu principal nicho e área de atuação hoje?`,
      fields: [
        { id: 'nicho', placeholder: 'Selecione o nicho...', options: ['Tecnologia', 'Saúde', 'Educação', 'Finanças', 'Marketing', 'Indústria', 'Varejo', 'Outros'] },
        { id: 'departamento', placeholder: 'Selecione a área...', options: ['Desenvolvimento', 'Vendas', 'RH', 'Marketing', 'Operações', 'Financeiro', 'Diretoria', 'Outros'], dependsOn: 'nicho' }
      ],
      next: 'q8_rotina'
    },
    q8_rotina: {
      type: 'text',
      id: 'rotina',
      text: `Nos conte um pouco mais sobre o que você faz.\nQual é o seu cargo atual? Quais são suas atividades? Como é a sua rotina?`,
      placeholder: 'Cargo, atividades, rotina...',
      next: 'q9_maturidade'
    },
    q9_maturidade: {
      type: 'cascaded_buttons_select',
      text: `Qual é o estágio da maturidade da sua carreira profissional?`,
      fields: [
        { id: 'estagio', type: 'buttons', options: ['Aprendiz', 'Junior', 'Pleno', 'Sênior', 'Conselheiro', 'Diretoria', 'Dono'] },
        { id: 'anos_exp', type: 'select', placeholder: 'Tempo total de experiência profissional', options: Array.from({ length: 40 }, (_, i) => ({ id: String(i + 1), nome: `${i + 1} ano(s)` })), dependsOn: 'estagio' }
      ],
      next: 'q9b_regime'
    },
    q9b_regime: {
      type: 'buttons',
      id: 'regime_trabalho',
      text: `${userName}, hoje você está empregado em regime CLT ou PJ?`,
      options: [
        { label: 'Sim', next: 'q9c_pacote' },
        { label: 'Não', next: 'q10_rendimento' }
      ]
    },
    q9c_pacote: {
      type: 'benefits_package',
      text: `Como está o seu pacote de remuneração e benefícios atual?`,
      next: 'q11_conheceu'
    },
    q10_rendimento: {
      type: 'currency_group',
      text: `Qual é o seu rendimento médio mensal?`,
      next: 'q11_conheceu'
    },
    q11_conheceu: {
      type: 'text',
      id: 'conheceu_bplen',
      text: `${userName}, como você conheceu a BPlen? Porque você nos deu a permissão de te ajudar nessa jornada, e o que você espera encontrar por aqui? Como podemos te ajudar?`,
      placeholder: 'Sua história e expectativas...',
      next: 'q12_likert'
    },
    q12_likert: {
      type: 'likert',
      id: 'avaliacao',
      text: `Até aqui, como você avalia a sua experiência? E como gostaria que continuássemos te conduzindo?`,
      next: 'COMPLETE'
    }
  };

  const currentQ = questions[currentQId];
  const { displayedText, isTyping } = useTypewriter(currentQ.text);

  const randomizedOptions = useMemo(() => {
    if (currentQ?.type === 'multi_select') {
      return [...currentQ.options].sort(() => Math.random() - 0.5);
    }
    return currentQ?.options || [];
  }, [currentQId]);

  const [showNextBtn, setShowNextBtn] = useState(false);
  const typingTimer = useRef(null);

  useEffect(() => {
    // Reset next button state when question changes
    if (currentQ.type === 'buttons') {
      setShowNextBtn(!isTyping); // Show immediately after typing finishes
    } else if (currentQ.type === 'multi_select' || currentQ.type === 'cascaded_select' || currentQ.type === 'cascaded_buttons_select' || currentQ.type === 'likert' || currentQ.type === 'currency_group' || currentQ.type === 'benefits_package') {
      setShowNextBtn(!isTyping);
    } else {
      setShowNextBtn(false); // Text fields require 3 seconds of continuous typing
    }
  }, [currentQId, isTyping]);

  const handleInputChangeDelay = (id, val) => {
    setSurveyData(prev => ({ ...prev, [id]: val }));

    if (currentQ.type === 'text' || currentQ.type === 'multi_text') {
      if (!showNextBtn && !typingTimer.current) {
        typingTimer.current = setTimeout(() => {
          setShowNextBtn(true);
          typingTimer.current = null;
        }, 3000);
      }
    }
  };

  const handleNext = (nextStepId) => {
    if (nextStepId === 'COMPLETE') {
      onComplete(surveyData);
    } else if (nextStepId === 'PAUSE') {
      console.log('User paused the survey', surveyData);
      // Could show a pause message or redirect
      onComplete(surveyData); // for now complete it
    } else {
      setCurrentQId(nextStepId);
    }
  };

  // Theming Colors
  const textColor = theme === 'light' ? '#0a1a2f' : '#ffffff';
  const inputBg = theme === 'light' ? '#ffffff' : '#1a1a1a';
  const inputBorderColor = theme === 'light' ? '#cbd5e1' : '#333';

  // Auto-resize textarea helper
  const autoResize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  // Custom Next Arrow Button (Delicate AI style)
  const AIArrowButton = ({ onClick, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'var(--primary)',
        color: '#fff',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: '0 4px 15px rgba(138, 79, 255, 0.4)',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.3s ease',
        marginLeft: 'auto'
      }}
    >
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    </button>
  );

  return (
    <div className="survey-container" style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'left', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '5px' }}>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(25px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide {
          animation: fadeSlideUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .survey-container input::placeholder,
        .survey-container textarea::placeholder,
        .survey-container select option[disabled] {
          color: ${theme === 'light' ? '#888' : '#666'} !important;
          opacity: 1;
        }
      `}</style>

      {/* Floating Question Text */}
      <h2 style={{
        fontSize: '24px',
        marginBottom: '30px',
        color: textColor,
        fontWeight: '500',
        lineHeight: '1.4',
        whiteSpace: 'pre-line',
        fontFamily: '"Caladea", Georgia, serif'
      }}>
        {displayedText}
      </h2>

      {/* Input Area (Only fades in after typing finishes) */}
      <div style={{
        opacity: isTyping ? 0 : 1,
        transform: isTyping ? 'translateY(25px)' : 'translateY(0)',
        transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: isTyping ? 'none' : 'auto'
      }}>

        {currentQ.type === 'buttons' && (
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {currentQ.options.map((opt, i) => {
              const label = typeof opt === 'string' ? opt : opt.label;
              const nextStep = typeof opt === 'string' ? currentQ.next : opt.next;
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (currentQ.id) setSurveyData(prev => ({ ...prev, [currentQ.id]: label }));
                    handleNext(nextStep);
                  }}
                  className="btn-glass-subtle"
                  style={{
                    borderRadius: '20px',
                    padding: '12px 24px',
                    border: `1px solid var(--primary)`,
                    color: textColor === '#ffffff' ? '#ffffff' : 'var(--primary)',
                    boxShadow: '0 0 10px rgba(138, 79, 255, 0.1) inset'
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {currentQ.type === 'text' && (
          <textarea
            placeholder={currentQ.placeholder}
            value={surveyData[currentQ.id] || ''}
            onChange={(e) => handleInputChangeDelay(currentQ.id, e.target.value)}
            onInput={autoResize}
            style={{ width: '100%', minHeight: '100px', padding: '15px', borderRadius: '12px', background: inputBg, border: `1px solid ${inputBorderColor}`, color: textColor, fontSize: '16px', outline: 'none', resize: 'vertical', overflow: 'hidden' }}
          />
        )}

        {currentQ.type === 'multi_text' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {currentQ.fields.map(f => (
              <input
                key={f.id}
                type="text"
                placeholder={f.placeholder}
                value={surveyData[f.id] || ''}
                onChange={(e) => handleInputChangeDelay(f.id, e.target.value)}
                style={{ width: '100%', padding: '15px', borderRadius: '12px', background: inputBg, border: `1px solid ${inputBorderColor}`, color: textColor, fontSize: '16px', outline: 'none' }}
              />
            ))}
          </div>
        )}

        {currentQ.type === 'multi_select' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(5, 1fr)', gap: '10px' }}>
              {randomizedOptions.map((opt, i) => {
                const selected = surveyData[currentQ.id] || [];
                const isSelected = selected.includes(opt);
                return (
                  <button
                    key={i}
                    onClick={() => {
                      let newSelected = [...selected];
                      if (isSelected) {
                        newSelected = newSelected.filter(item => item !== opt);
                      } else if (newSelected.length < currentQ.max) {
                        newSelected.push(opt);
                      }
                      handleInputChangeDelay(currentQ.id, newSelected);
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: isSelected ? 'var(--primary)' : inputBg,
                      border: `1px solid ${isSelected ? 'var(--primary)' : inputBorderColor}`,
                      color: isSelected ? '#fff' : textColor,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      minHeight: '52px'
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
              Selecione entre {currentQ.min} e {currentQ.max} opções. ({(surveyData[currentQ.id] || []).length} selecionadas)
            </p>
          </div>
        )}

        {currentQ.type === 'cascaded_select' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {currentQ.fields.map((f, i) => {
              if (f.dependsOn && !surveyData[f.dependsOn]) return null;
              return (
                <div key={f.id} style={{ animation: 'fadeIn 0.5s ease' }}>
                  <select
                    value={surveyData[f.id] || ''}
                    onChange={(e) => handleInputChangeDelay(f.id, e.target.value)}
                    style={{ width: '100%', padding: '15px', borderRadius: '12px', background: inputBg, border: `1px solid ${inputBorderColor}`, color: textColor, fontSize: '16px', outline: 'none' }}
                  >
                    <option value="" disabled>{f.placeholder}</option>
                    {f.options.map(opt => (
                      <option key={opt.id || opt} value={opt.id || opt}>{opt.nome || opt}</option>
                    ))}
                  </select>
                  {surveyData[f.id] === 'Outros' && (
                    <input
                      type="text"
                      placeholder="Descreva qual..."
                      value={surveyData[`${f.id}_outros`] || ''}
                      onChange={(e) => handleInputChangeDelay(`${f.id}_outros`, e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', background: inputBg, border: `1px solid ${inputBorderColor}`, color: textColor, fontSize: '14px', outline: 'none', marginTop: '10px' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {currentQ.type === 'cascaded_buttons_select' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {currentQ.fields.map((f, i) => {
              if (f.dependsOn && !surveyData[f.dependsOn]) return null;

              if (f.type === 'buttons') {
                return (
                  <div key={f.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', animation: 'fadeIn 0.5s ease' }}>
                    {f.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => handleInputChangeDelay(f.id, opt)}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '20px',
                          background: surveyData[f.id] === opt ? 'var(--primary)' : 'transparent',
                          border: `1px solid ${surveyData[f.id] === opt ? 'var(--primary)' : inputBorderColor}`,
                          color: surveyData[f.id] === opt ? '#fff' : textColor,
                          cursor: 'pointer'
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                );
              } else {
                return (
                  <div key={f.id} style={{ animation: 'fadeIn 0.5s ease' }}>
                    <select
                      value={surveyData[f.id] || ''}
                      onChange={(e) => handleInputChangeDelay(f.id, e.target.value)}
                      style={{ width: '100%', padding: '15px', borderRadius: '12px', background: inputBg, border: `1px solid ${inputBorderColor}`, color: textColor, fontSize: '16px', outline: 'none' }}
                    >
                      <option value="" disabled>{f.placeholder}</option>
                      {f.options.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.nome}</option>
                      ))}
                    </select>
                  </div>
                );
              }
            })}
          </div>
        )}

        {currentQ.type === 'currency_group' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[1, 2].map(group => {
              const label = group === 1 ? 'Atual' : 'Expectativa';
              return (
                <div key={group} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>{label}</span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select
                      value={surveyData[`moeda_${group}`] || 'BRL'}
                      onChange={(e) => handleInputChangeDelay(`moeda_${group}`, e.target.value)}
                      style={{ width: '90px', flex: 'none', padding: '15px', borderRadius: '12px', background: inputBg, border: `1px solid ${inputBorderColor}`, color: textColor, fontSize: '16px', outline: 'none' }}
                    >
                      <option value="BRL">BRL</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                    <input
                      type="text"
                      placeholder="0,00"
                      value={surveyData[`valor_${group}`] || ''}
                      onChange={(e) => handleInputChangeDelay(`valor_${group}`, e.target.value)}
                      style={{ flex: 1, padding: '15px', borderRadius: '12px', background: inputBg, border: `1px solid ${inputBorderColor}`, color: textColor, fontSize: '16px', outline: 'none' }}
                    />
                  </div>
                </div>
              );
            })}
            <button
              onClick={() => handleNext(currentQ.next)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'underline', cursor: 'pointer', alignSelf: 'flex-start' }}
            >
              Prefiro não responder
            </button>
          </div>
        )}

        {currentQ.type === 'benefits_package' && (() => {
          const ben = (id, field) => surveyData[`ben_${id}_${field}`];
          const setBen = (id, field, val) => handleInputChangeDelay(`ben_${id}_${field}`, val);
          const isBenSelected = (id) => surveyData[`ben_${id}`];
          const toggleBen = (id) => setSurveyData(prev => ({ ...prev, [`ben_${id}`]: !prev[`ben_${id}`] }));

          const currencyRow = (id) => (
            <div style={{ display: 'flex', gap: '8px' }}>
              <select value={ben(id, 'moeda') || 'BRL'} onChange={e => setBen(id, 'moeda', e.target.value)}
                style={{ width: '80px', flex: 'none', padding: '10px', borderRadius: '10px', background: inputBg, border: `1px solid ${inputBorderColor}`, color: textColor, fontSize: '14px', outline: 'none' }}>
                <option value="BRL">BRL</option><option value="USD">USD</option><option value="EUR">EUR</option>
              </select>
              <input type="text" placeholder="0,00" value={ben(id, 'valor') || ''} onChange={e => setBen(id, 'valor', e.target.value)}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', background: inputBg, border: `1px solid ${inputBorderColor}`, color: textColor, fontSize: '14px', outline: 'none' }} />
            </div>
          );

          const yesNoRow = (id, field, label) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: textColor, minWidth: '120px' }}>{label}</span>
              {['Sim', 'Não'].map(opt => (
                <button key={opt} onClick={() => setBen(id, field, opt)}
                  style={{ padding: '6px 16px', borderRadius: '16px', fontSize: '13px', cursor: 'pointer', border: `1px solid ${ben(id, field) === opt ? 'var(--primary)' : inputBorderColor}`, background: ben(id, field) === opt ? 'var(--primary)' : 'transparent', color: ben(id, field) === opt ? '#fff' : textColor, transition: 'all 0.2s' }}>
                  {opt}
                </button>
              ))}
            </div>
          );

          const descontoRow = (id) => yesNoRow(id, 'desconto', 'Descontado em folha?');
          const btnStyle = (id, field, opt) => ({ padding: '8px 14px', borderRadius: '16px', fontSize: '13px', cursor: 'pointer', border: `1px solid ${ben(id, field) === opt ? 'var(--primary)' : inputBorderColor}`, background: ben(id, field) === opt ? 'var(--primary)' : 'transparent', color: ben(id, field) === opt ? '#fff' : textColor, transition: 'all 0.2s' });
          const fieldInput = (id, field, placeholder) => (
            <input type="text" placeholder={placeholder} value={ben(id, field) || ''} onChange={e => setBen(id, field, e.target.value)}
              style={{ padding: '10px', borderRadius: '10px', background: inputBg, border: `1px solid ${inputBorderColor}`, color: textColor, fontSize: '14px', outline: 'none', width: '100%' }} />
          );

          const cardStyle = (id) => ({
            background: isBenSelected(id) ? (theme === 'light' ? 'rgba(138,79,255,0.04)' : 'rgba(138,79,255,0.08)') : 'transparent',
            border: `1px solid ${isBenSelected(id) ? 'var(--primary)' : inputBorderColor}`,
            borderRadius: '12px', padding: '12px 16px', transition: 'all 0.2s'
          });

          const benefitsList = [
            { id: 'salario', label: 'Salário' },
            { id: 'bonus', label: 'Bônus/PLR' },
            { id: 'previdencia', label: 'Previdência Privada' },
            { id: 'vrva_flex', label: 'VR/VA Flex' },
            { id: 'vr', label: 'VR' },
            { id: 'va', label: 'VA' },
            { id: 'vt', label: 'VT' },
            { id: 'vale_combustivel', label: 'Vale Combustível' },
            { id: 'estacionamento', label: 'Estacionamento' },
            { id: 'seguro_medico', label: 'Seguro Médico' },
            { id: 'seguro_odonto', label: 'Seguro Odontológico' },
            { id: 'seguro_vida', label: 'Seguro de Vida' },
            { id: 'dayoff', label: 'Dayoff' },
            { id: 'home_office', label: 'Home Office' },
          ];

          const renderSubFields = (b) => {
            switch (b.id) {
              case 'salario':
                return currencyRow('salario');
              case 'bonus':
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {currencyRow('bonus')}
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginTop: '4px' }}>Poderia detalhar um pouco mais?</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '13px', color: textColor }}>A base de cálculo é com base em:</span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {['Quantidade de salários', 'Porcentagem dos resultados'].map(opt => (
                          <button key={opt} onClick={() => setBen('bonus', 'base_calculo', opt)} style={btnStyle('bonus', 'base_calculo', opt)}>{opt}</button>
                        ))}
                      </div>
                    </div>
                    {ben('bonus', 'base_calculo') === 'Quantidade de salários' && fieldInput('bonus', 'qtd_salarios', 'Quantidade de salários')}
                    {yesNoRow('bonus', 'meta', 'Condicionado a meta?')}
                    {ben('bonus', 'meta') === 'Sim' && (
                      <textarea placeholder="Descreva a meta..." value={ben('bonus', 'meta_desc') || ''} onChange={e => setBen('bonus', 'meta_desc', e.target.value)}
                        onInput={autoResize}
                        style={{ padding: '10px', borderRadius: '10px', background: inputBg, border: `1px solid ${inputBorderColor}`, color: textColor, fontSize: '14px', outline: 'none', resize: 'vertical', overflow: 'hidden', minHeight: '60px' }} />
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '13px', color: textColor }}>Frequência de recebimento:</span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {['Mensal', 'Trimestral', 'Semestral', 'Anual'].map(opt => (
                          <button key={opt} onClick={() => setBen('bonus', 'frequencia', opt)} style={btnStyle('bonus', 'frequencia', opt)}>{opt}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              case 'previdencia':
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {fieldInput('previdencia', 'valor', 'Valor mensal (R$)')}
                    {yesNoRow('previdencia', 'empresa_contribui', 'A empresa contribui?')}
                    {ben('previdencia', 'empresa_contribui') === 'Sim' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '10px', borderLeft: '2px solid var(--primary)' }}>
                        {fieldInput('previdencia', 'empresa_valor', 'Valor ou % da contribuição da empresa')}
                        {fieldInput('previdencia', 'teto', 'Teto de contribuição (se houver)')}
                      </div>
                    )}
                    {descontoRow('previdencia')}
                  </div>
                );
              case 'vrva_flex': case 'vr': case 'va': case 'vt': case 'vale_combustivel':
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {fieldInput(b.id, 'valor', 'Valor mensal (R$)')}
                    {descontoRow(b.id)}
                  </div>
                );
              case 'estacionamento':
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['Integral', 'Valor compartilhado'].map(opt => (
                        <button key={opt} onClick={() => setBen('estacionamento', 'tipo', opt)} style={btnStyle('estacionamento', 'tipo', opt)}>{opt}</button>
                      ))}
                    </div>
                    {descontoRow('estacionamento')}
                  </div>
                );
              case 'seguro_medico': case 'seguro_odonto':
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <select value={ben(b.id, 'seguradora') || ''} onChange={e => setBen(b.id, 'seguradora', e.target.value)}
                      style={{ padding: '10px', borderRadius: '10px', background: inputBg, border: `1px solid ${inputBorderColor}`, color: textColor, fontSize: '14px', outline: 'none' }}>
                      <option value="" disabled>Selecione a seguradora...</option>
                      {SEGURADORAS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {ben(b.id, 'seguradora') === 'Outros' && (
                      <input type="text" placeholder="Qual seguradora?" value={ben(b.id, 'seguradora_outros') || ''} onChange={e => setBen(b.id, 'seguradora_outros', e.target.value)}
                        style={{ padding: '10px', borderRadius: '10px', background: inputBg, border: `1px solid ${inputBorderColor}`, color: textColor, fontSize: '14px', outline: 'none' }} />
                    )}
                    {yesNoRow(b.id, 'coparticipacao', 'Tem coparticipação?')}
                    {descontoRow(b.id)}
                  </div>
                );
              case 'seguro_vida': case 'dayoff': case 'home_office':
                return null;
              default:
                return null;
            }
          };

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '55vh', overflowY: 'auto', paddingRight: '6px' }}>
              {benefitsList.map(b => {
                const subFields = renderSubFields(b);
                return (
                  <div key={b.id} style={cardStyle(b.id)}>
                    <div onClick={() => toggleBen(b.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: textColor }}>{b.label}</span>
                      <span style={{ fontSize: '18px', color: isBenSelected(b.id) ? 'var(--primary)' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                        {isBenSelected(b.id) ? '✓' : '+'}
                      </span>
                    </div>
                    {isBenSelected(b.id) && subFields && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${inputBorderColor}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {subFields}
                      </div>
                    )}
                  </div>
                );
              })}
              <div style={{ marginTop: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Algum outro benefício que não foi listado?</span>
                <textarea placeholder="Descreva aqui..." value={surveyData.ben_outros || ''} onChange={e => handleInputChangeDelay('ben_outros', e.target.value)}
                  onInput={autoResize}
                  style={{ width: '100%', minHeight: '70px', padding: '10px', borderRadius: '10px', background: inputBg, border: `1px solid ${inputBorderColor}`, color: textColor, fontSize: '14px', outline: 'none', resize: 'vertical', overflow: 'hidden' }} />
              </div>
            </div>
          );
        })()}


        {currentQ.type === 'likert' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <style>{`
              @keyframes glitterFloat1 { 0%,100% { transform: translate(0,0) scale(1); opacity: 0.9; } 25% { transform: translate(2px,-3px) scale(1.3); opacity: 1; } 50% { transform: translate(-1px,2px) scale(0.8); opacity: 0.6; } 75% { transform: translate(3px,1px) scale(1.1); opacity: 0.8; } }
              @keyframes glitterFloat2 { 0%,100% { transform: translate(0,0) scale(0.8); opacity: 0.7; } 33% { transform: translate(-3px,2px) scale(1.2); opacity: 1; } 66% { transform: translate(2px,-2px) scale(0.9); opacity: 0.5; } }
              @keyframes glitterFloat3 { 0%,100% { transform: translate(0,0) scale(1); opacity: 0.5; } 20% { transform: translate(1px,3px) scale(1.4); opacity: 1; } 60% { transform: translate(-2px,-1px) scale(0.7); opacity: 0.4; } 80% { transform: translate(2px,0px) scale(1.1); opacity: 0.9; } }
              @keyframes glitterTwinkle { 0%,100% { opacity: 0; transform: scale(0); } 50% { opacity: 1; transform: scale(1); } }
              @keyframes glitterEscape { 0% { opacity: 0.8; transform: translate(0,0) scale(1); } 100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0); } }
              @keyframes shimmerPulse { 0%,100% { opacity: 0.05; } 50% { opacity: 0.18; } }
              .star-container { transition: transform 0.2s ease; }
              .star-container:hover { transform: scale(1.15); }
              .glitter-particle { transform-origin: center; }
            `}</style>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '20px 0' }}
              onMouseLeave={() => setHoveredStar(0)}>
              {[1, 2, 3, 4, 5].map(num => {
                const isActive = num <= (hoveredStar || surveyData.nps || 0);
                const isHoverFill = hoveredStar > 0 && num <= hoveredStar;

                const glitterParticles = [
                  { cx: 14, cy: 12, r: 1.2, anim: 'glitterFloat1', dur: '2.5s', del: '0s' },
                  { cx: 28, cy: 14, r: 0.9, anim: 'glitterFloat2', dur: '3.2s', del: '0.3s' },
                  { cx: 21, cy: 20, r: 1.5, anim: 'glitterFloat3', dur: '2.8s', del: '0.1s' },
                  { cx: 16, cy: 27, r: 1.0, anim: 'glitterFloat2', dur: '3.5s', del: '0.6s' },
                  { cx: 26, cy: 25, r: 1.3, anim: 'glitterFloat1', dur: '2.2s', del: '0.4s' },
                  { cx: 11, cy: 18, r: 0.8, anim: 'glitterFloat3', dur: '3.0s', del: '0.8s' },
                  { cx: 30, cy: 20, r: 1.1, anim: 'glitterFloat1', dur: '2.6s', del: '0.2s' },
                  { cx: 18, cy: 15, r: 0.7, anim: 'glitterFloat2', dur: '3.3s', del: '0.5s' },
                  { cx: 24, cy: 30, r: 1.0, anim: 'glitterFloat3', dur: '2.9s', del: '0.7s' },
                  { cx: 21, cy: 8, r: 0.9, anim: 'glitterFloat1', dur: '3.1s', del: '0.9s' },
                  { cx: 19, cy: 23, r: 0.6, anim: 'glitterFloat2', dur: '2.4s', del: '1.1s' },
                  { cx: 25, cy: 18, r: 1.4, anim: 'glitterFloat3', dur: '2.7s', del: '0.15s' },
                ];

                const twinkles = [
                  { cx: 13, cy: 16, size: 3, del: '0s', dur: '1.8s' },
                  { cx: 27, cy: 22, size: 2.5, del: '0.6s', dur: '2.2s' },
                  { cx: 20, cy: 10, size: 2, del: '1.2s', dur: '1.5s' },
                  { cx: 23, cy: 28, size: 2.8, del: '0.3s', dur: '2.0s' },
                  { cx: 17, cy: 21, size: 2.2, del: '0.9s', dur: '1.7s' },
                ];

                const escapeParticles = [
                  { x: -4, y: -2, dx: '-10px', dy: '-12px', del: '0s', dur: '2.5s', r: 1.2 },
                  { x: 44, y: 10, dx: '10px', dy: '-8px', del: '0.5s', dur: '3s', r: 0.9 },
                  { x: -2, y: 30, dx: '-8px', dy: '10px', del: '1s', dur: '2.8s', r: 1.0 },
                  { x: 43, y: 28, dx: '12px', dy: '6px', del: '0.3s', dur: '2.2s', r: 0.8 },
                  { x: 20, y: -3, dx: '4px', dy: '-14px', del: '0.7s', dur: '3.2s', r: 1.1 },
                  { x: 40, y: 20, dx: '14px', dy: '2px', del: '1.2s', dur: '2.6s', r: 0.7 },
                ];

                return (
                  <div key={num} className="star-container"
                    onMouseEnter={() => setHoveredStar(num)}
                    onClick={() => handleInputChangeDelay('nps', num)}
                    style={{ cursor: 'pointer', position: 'relative', width: '46px', height: '46px' }}>
                    <svg viewBox="0 0 42 42" width="46" height="46" style={{ display: 'block', overflow: 'visible' }}>
                      <defs>
                        <clipPath id={`starClip-${num}`}>
                          <polygon points="21,3 25.7,14.5 38.1,15.4 28.6,23.5 31.6,35.6 21,29 10.4,35.6 13.4,23.5 3.9,15.4 16.3,14.5" />
                        </clipPath>
                        <radialGradient id={`glitterGrad-${num}`}>
                          <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
                          <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                      {/* Star outline */}
                      <polygon points="21,3 25.7,14.5 38.1,15.4 28.6,23.5 31.6,35.6 21,29 10.4,35.6 13.4,23.5 3.9,15.4 16.3,14.5"
                        fill="none"
                        stroke={isActive ? 'var(--primary)' : (theme === 'light' ? '#cbd5e1' : '#444')}
                        strokeWidth="0.7"
                        strokeLinejoin="round"
                        style={{ transition: 'stroke 0.3s ease' }} />
                      {/* Glitter fill inside star */}
                      {isActive && (
                        <g clipPath={`url(#starClip-${num})`}>
                          {/* Soft holographic base */}
                          <polygon points="21,3 25.7,14.5 38.1,15.4 28.6,23.5 31.6,35.6 21,29 10.4,35.6 13.4,23.5 3.9,15.4 16.3,14.5"
                            fill="var(--primary)" opacity={isHoverFill ? '0.12' : '0.06'}
                            style={{ transition: 'opacity 0.4s ease' }} />
                          {/* Shimmer overlay */}
                          <rect x="0" y="0" width="42" height="42"
                            fill={`url(#glitterGrad-${num})`}
                            opacity="0"
                            style={{ animation: isHoverFill ? 'shimmerPulse 2s ease-in-out infinite' : 'none' }} />
                          {/* Glitter dots */}
                          {glitterParticles.map((p, i) => (
                            <circle key={i} className="glitter-particle" cx={p.cx} cy={p.cy} r={p.r}
                              fill={i % 3 === 0 ? '#fff' : (i % 3 === 1 ? 'var(--primary)' : 'rgba(200,170,255,0.9)')}
                              opacity="0.8"
                              style={{
                                animation: isHoverFill ? `${p.anim} ${p.dur} ease-in-out ${p.del} infinite` : 'none',
                                transition: 'opacity 0.3s ease'
                              }} />
                          ))}
                          {/* Cross-shaped twinkle sparkles */}
                          {twinkles.map((t, i) => (
                            <g key={`tw-${i}`} style={{ animation: isHoverFill ? `glitterTwinkle ${t.dur} ease-in-out ${t.del} infinite` : 'none' }}>
                              <line x1={t.cx - t.size} y1={t.cy} x2={t.cx + t.size} y2={t.cy}
                                stroke="#fff" strokeWidth="0.5" strokeLinecap="round" opacity="0.9" />
                              <line x1={t.cx} y1={t.cy - t.size} x2={t.cx} y2={t.cy + t.size}
                                stroke="#fff" strokeWidth="0.5" strokeLinecap="round" opacity="0.9" />
                            </g>
                          ))}
                        </g>
                      )}
                      {/* Escaping glitter particles (outside clip) */}
                      {isActive && isHoverFill && escapeParticles.map((ep, i) => (
                        <circle key={`esc-${i}`} cx={ep.x} cy={ep.y} r={ep.r}
                          fill={i % 2 === 0 ? '#fff' : 'var(--primary)'}
                          style={{
                            '--dx': ep.dx, '--dy': ep.dy,
                            animation: `glitterEscape ${ep.dur} ease-out ${ep.del} infinite`
                          }} />
                      ))}
                    </svg>
                    {/* Number label */}
                    <span style={{
                      position: 'absolute', bottom: '-18px', left: '50%', transform: 'translateX(-50%)',
                      fontSize: '11px', fontWeight: '600',
                      color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                      transition: 'color 0.3s ease'
                    }}>{num}</span>
                  </div>
                );
              })}
            </div>
            {surveyData.nps && (
              <textarea
                placeholder="Como gostaria que continuássemos te conduzindo?"
                value={surveyData.feedback || ''}
                onChange={(e) => handleInputChangeDelay('feedback', e.target.value)}
                onInput={autoResize}
                style={{ width: '100%', minHeight: '100px', padding: '15px', borderRadius: '12px', background: inputBg, border: `1px solid ${inputBorderColor}`, color: textColor, fontSize: '16px', outline: 'none', resize: 'vertical', overflow: 'hidden', animation: 'fadeIn 0.5s ease' }}
              />
            )}
          </div>
        )}

        {showNextBtn && currentQ.type !== 'buttons' && (
          <div className="animate-fade-slide" style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
            <AIArrowButton onClick={() => handleNext(currentQ.next)} />
          </div>
        )}
      </div>

    </div>
  );
}
