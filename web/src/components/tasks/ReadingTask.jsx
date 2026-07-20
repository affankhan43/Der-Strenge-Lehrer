import { useState } from 'react';

export default function ReadingTask({ content, onReady }) {
  const [phase, setPhase] = useState('read'); // 'read' | 'quiz' | 'done'
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const questions = content?.questions || [];
  const text = content?.text || '';

  const handleAnswer = (qi, ai) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qi]: ai }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setPhase('done');
    onReady?.(true);
  };

  const allAnswered = questions.length === 0 || questions.every((_, i) => answers[i] !== undefined);
  const score = questions.filter((q, i) => answers[i] === q.correct).length;

  if (phase === 'read') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 18px' }}>
          <h3 style={{ color: 'var(--text1)', fontSize: 16, fontWeight: 700, margin: '0 0 14px' }}>{content?.title}</h3>
          <div style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.9, whiteSpace: 'pre-line' }}>{text}</div>
        </div>
        <button
          onClick={() => setPhase('quiz')}
          style={{ background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.4)', color: '#c4b5fd', borderRadius: 10, padding: '12px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
        >
          Gelesen — Fragen beantworten →
        </button>
      </div>
    );
  }

  if (phase === 'quiz') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ color: 'var(--text3)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', margin: 0, textTransform: 'uppercase' }}>
          Verständnisfragen
        </p>
        {questions.map((q, qi) => (
          <div key={qi} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ color: 'var(--text1)', fontSize: 14, fontWeight: 600, margin: '0 0 10px' }}>{qi + 1}. {q.q}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {q.options.map((opt, ai) => (
                <button
                  key={ai}
                  onClick={() => handleAnswer(qi, ai)}
                  style={{
                    textAlign: 'left',
                    padding: '9px 14px',
                    borderRadius: 8,
                    border: `1px solid ${answers[qi] === ai ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    background: answers[qi] === ai ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.03)',
                    color: answers[qi] === ai ? '#c4b5fd' : 'var(--text2)',
                    cursor: 'pointer',
                    fontSize: 13,
                    transition: 'all .15s',
                  }}
                >
                  {String.fromCharCode(65 + ai)}. {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          style={{ background: allAnswered ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.04)', border: `1px solid ${allAnswered ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.08)'}`, color: allAnswered ? '#4ade80' : 'var(--text3)', borderRadius: 10, padding: '12px 18px', cursor: allAnswered ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 600, transition: 'all .2s' }}
        >
          Antworten abgeben
        </button>
      </div>
    );
  }

  // done phase
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 6 }}>{score === questions.length ? '🎉' : score >= questions.length / 2 ? '👍' : '📚'}</div>
        <div style={{ color: '#4ade80', fontWeight: 700, fontSize: 16 }}>{score}/{questions.length} richtig</div>
        <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>
          {score === questions.length ? 'Perfekt! Vollständiges Verständnis.' : score >= questions.length / 2 ? 'Gut gemacht! Lies den Text nochmal für die falschen Antworten.' : 'Lies den Text nochmal langsam durch.'}
        </div>
      </div>
      {questions.map((q, qi) => (
        <div key={qi} style={{ borderRadius: 8, padding: '10px 14px', background: answers[qi] === q.correct ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)', border: `1px solid ${answers[qi] === q.correct ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
          <span style={{ fontSize: 13, color: answers[qi] === q.correct ? '#4ade80' : '#f87171' }}>
            {answers[qi] === q.correct ? '✓' : '✗'} {q.q}
          </span>
          {answers[qi] !== q.correct && (
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Richtig: {q.options[q.correct]}</div>
          )}
        </div>
      ))}
    </div>
  );
}
