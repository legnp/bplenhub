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

// --- Main Survey Component ---
export default function DiagnosticSurvey({ user, theme, onComplete }) {
  const [currentQId, setCurrentQId] = useState('q1_intro');
  const [surveyData, setSurveyData] = useState({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
        { id: 'anos_exp', type: 'select', placeholder: 'Anos de experiência', options: Array.from({length: 40}, (_, i) => ({ id: String(i+1), nome: `${i+1} ano(s)` })), dependsOn: 'estagio' }
      ],
      next: 'q10_rendimento'
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
    } else if (currentQ.type === 'multi_select' || currentQ.type === 'cascaded_select' || currentQ.type === 'cascaded_buttons_select' || currentQ.type === 'likert' || currentQ.type === 'currency_group') {
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
  
  // Custom Next Arrow Button (Delicate AI style)
  const AIArrowButton = ({ onClick, disabled }) => (
    <button 
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '50px',
        height: '50px',
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
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    </button>
  );

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'left', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(25px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide {
          animation: fadeSlideUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
            style={{ width: '100%', minHeight: '100px', padding: '15px', borderRadius: '12px', background: inputBg, border: `1px solid ${inputBorderColor}`, color: textColor, fontSize: '16px', outline: 'none', resize: 'none' }}
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
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
                    padding: '10px 18px',
                    borderRadius: '8px',
                    background: isSelected ? 'var(--primary)' : inputBg,
                    border: `1px solid ${isSelected ? 'var(--primary)' : inputBorderColor}`,
                    color: isSelected ? '#fff' : textColor,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                >
                  {opt}
                </button>
              );
            })}
            <p style={{ width: '100%', fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px' }}>
              Selecione entre {currentQ.min} e {currentQ.max} opções. ({ (surveyData[currentQ.id] || []).length } selecionadas)
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
            {[1, 2].map(group => (
              <div key={group} style={{ display: 'flex', gap: '10px' }}>
                <select
                  value={surveyData[`moeda_${group}`] || 'BRL'}
                  onChange={(e) => handleInputChangeDelay(`moeda_${group}`, e.target.value)}
                  style={{ padding: '15px', borderRadius: '12px', background: inputBg, border: `1px solid ${inputBorderColor}`, color: textColor, fontSize: '16px', outline: 'none' }}
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
            ))}
            <button 
              onClick={() => handleNext(currentQ.next)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'underline', cursor: 'pointer', alignSelf: 'flex-start' }}
            >
              Prefiro não responder
            </button>
          </div>
        )}

        {currentQ.type === 'likert' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', background: inputBg, padding: '20px', borderRadius: '12px', border: `1px solid ${inputBorderColor}` }}>
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  onClick={() => handleInputChangeDelay('nps', num)}
                  style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: surveyData.nps === num ? 'var(--primary)' : 'transparent',
                    border: `1px solid ${surveyData.nps === num ? 'var(--primary)' : inputBorderColor}`,
                    color: surveyData.nps === num ? '#fff' : textColor,
                    cursor: 'pointer', fontWeight: 'bold'
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
            {surveyData.nps && (
              <textarea 
                placeholder="Como gostaria que continuássemos te conduzindo?"
                value={surveyData.feedback || ''}
                onChange={(e) => handleInputChangeDelay('feedback', e.target.value)}
                style={{ width: '100%', minHeight: '100px', padding: '15px', borderRadius: '12px', background: inputBg, border: `1px solid ${inputBorderColor}`, color: textColor, fontSize: '16px', outline: 'none', resize: 'none', animation: 'fadeIn 0.5s ease' }}
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
