import { useState, useRef, useCallback } from 'react';
import { speakText, stopSpeech } from '../../utils/germanAudio';

function useArticleAudio(text) {
  const [playing, setPlaying] = useState(false);

  const play = useCallback(async (rate = 0.9) => {
    setPlaying(true);
    await speakText(text, rate);
    setPlaying(false);
  }, [text]);

  const stop = useCallback(() => {
    stopSpeech();
    setPlaying(false);
  }, []);

  return { playing, play, stop };
}

// Strip punctuation for glossary lookup
function stripPunct(w) {
  return w.replace(/^[^a-zA-ZäöüÄÖÜß]+|[^a-zA-ZäöüÄÖÜß]+$/g, '');
}

function HoverWord({ word, glossary }) {
  const [visible, setVisible] = useState(false);
  const clean = stripPunct(word);
  // Try exact, then lowercase
  const entry = glossary?.[clean] || glossary?.[clean.toLowerCase()] || glossary?.[clean.charAt(0).toUpperCase() + clean.slice(1)];
  if (!entry) return <span>{word} </span>;

  return (
    <span style={{ position: 'relative', display: 'inline' }}>
      <span
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onTouchStart={() => setVisible(v => !v)}
        style={{
          color: '#fbbf24',
          borderBottom: '1px dashed rgba(251,191,36,0.5)',
          cursor: 'help',
          transition: 'color .15s',
        }}
      >
        {word}
      </span>
      {' '}
      {visible && (
        <span style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1a1a2e',
          border: '1px solid rgba(251,191,36,0.4)',
          borderRadius: 8,
          padding: '7px 10px',
          fontSize: 12,
          lineHeight: 1.5,
          whiteSpace: 'nowrap',
          zIndex: 200,
          boxShadow: '0 4px 20px rgba(0,0,0,.6)',
          pointerEvents: 'none',
          minWidth: 120,
          maxWidth: 220,
          whiteSpace: 'normal',
          textAlign: 'center',
        }}>
          <span style={{ color: '#fbbf24', fontWeight: 700 }}>{clean}</span>
          <span style={{ color: 'var(--text3)', margin: '0 4px' }}>→</span>
          <span style={{ color: '#a5f3fc' }}>{entry.en}</span>
          {entry.grammar && (
            <div style={{ color: 'var(--text3)', fontSize: 11, marginTop: 3 }}>{entry.grammar}</div>
          )}
        </span>
      )}
    </span>
  );
}

function AnnotatedText({ text, glossary }) {
  if (!glossary || Object.keys(glossary).length === 0) {
    return (
      <div style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.9, whiteSpace: 'pre-line' }}>
        {text}
      </div>
    );
  }

  // Split by newlines first, then words
  const paragraphs = text.split('\n');
  return (
    <div style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.9 }}>
      {paragraphs.map((para, pi) => (
        <p key={pi} style={{ margin: pi > 0 ? '10px 0 0' : 0 }}>
          {para.split(' ').map((word, wi) => (
            <HoverWord key={wi} word={word} glossary={glossary} />
          ))}
        </p>
      ))}
    </div>
  );
}

export default function ReadingTask({ content, onReady }) {
  const [phase, setPhase] = useState('read');
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const questions = content?.questions || [];
  const text      = content?.text || '';
  const glossary  = content?.glossary || {};
  const hasGlossary = Object.keys(glossary).length > 0;
  const { playing, play, stop } = useArticleAudio(text);

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {hasGlossary && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 8, fontSize: 12, color: 'rgba(251,191,36,0.8)' }}>
            💡 <span><strong style={{ color: '#fbbf24' }}>Tipp:</strong> Hover über gelbe Wörter für Übersetzung &amp; Grammatik</span>
          </div>
        )}
        <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, padding: '18px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <h3 style={{ color: 'var(--text1)', fontSize: 16, fontWeight: 700, margin: 0 }}>{content?.title}</h3>
            {text && (
              <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 10 }}>
                {playing ? (
                  <button onClick={stop} title="Stop" style={{ background: 'rgba(248,113,113,.15)', border: '1px solid rgba(248,113,113,.3)', color: '#fca5a5', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    ⏹ Stop
                  </button>
                ) : (
                  <>
                    <button onClick={() => play(0.9)} title="Vorlesen" style={{ background: 'rgba(96,165,250,.15)', border: '1px solid rgba(96,165,250,.3)', color: '#93c5fd', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      🔊 Vorlesen
                    </button>
                    <button onClick={() => play(0.6)} title="Langsam vorlesen" style={{ background: 'rgba(96,165,250,.08)', border: '1px solid rgba(96,165,250,.2)', color: '#7aa8d8', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      🐢
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          <AnnotatedText text={text} glossary={glossary} />
        </div>
        {questions.length > 0 ? (
          <button
            onClick={() => setPhase('quiz')}
            style={{ background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.4)', color: '#c4b5fd', borderRadius: 10, padding: '12px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
          >
            Gelesen — Fragen beantworten →
          </button>
        ) : (
          <button
            onClick={() => { setPhase('done'); onReady?.(true); }}
            style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)', color: '#4ade80', borderRadius: 10, padding: '12px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
          >
            ✓ Text gelesen
          </button>
        )}
      </div>
    );
  }

  if (phase === 'quiz') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: 'var(--text3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', margin: 0, textTransform: 'uppercase' }}>
            Verständnisfragen
          </p>
          <button onClick={() => setPhase('read')} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text3)', borderRadius: 6, padding: '3px 9px', cursor: 'pointer', fontSize: 11 }}>
            ← Text
          </button>
        </div>
        {questions.map((q, qi) => (
          <div key={qi} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '13px 14px' }}>
            <p style={{ color: 'var(--text1)', fontSize: 14, fontWeight: 600, margin: '0 0 10px' }}>{qi + 1}. {q.q}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {q.options.map((opt, ai) => (
                <button key={ai} onClick={() => handleAnswer(qi, ai)} style={{ textAlign: 'left', padding: '8px 12px', borderRadius: 8, border: `1px solid ${answers[qi] === ai ? 'rgba(124,58,237,.5)' : 'rgba(255,255,255,.08)'}`, background: answers[qi] === ai ? 'rgba(124,58,237,.2)' : 'rgba(255,255,255,.03)', color: answers[qi] === ai ? '#c4b5fd' : 'var(--text2)', cursor: 'pointer', fontSize: 13, transition: 'all .15s' }}>
                  {String.fromCharCode(65 + ai)}. {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
        <button onClick={handleSubmit} disabled={!allAnswered} style={{ background: allAnswered ? 'rgba(34,197,94,.18)' : 'rgba(255,255,255,.04)', border: `1px solid ${allAnswered ? 'rgba(34,197,94,.4)' : 'rgba(255,255,255,.08)'}`, color: allAnswered ? '#4ade80' : 'var(--text3)', borderRadius: 10, padding: '12px 18px', cursor: allAnswered ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 600, transition: 'all .2s' }}>
          Antworten abgeben
        </button>
      </div>
    );
  }

  // Done phase
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.3)', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 30, marginBottom: 6 }}>{score === questions.length ? '🎉' : score >= questions.length / 2 ? '👍' : '📚'}</div>
        <div style={{ color: '#4ade80', fontWeight: 700, fontSize: 15 }}>{score}/{questions.length} richtig</div>
        <div style={{ color: 'var(--text2)', fontSize: 12, marginTop: 4 }}>
          {score === questions.length ? 'Perfekt! Vollständiges Verständnis.' : 'Lies den Text nochmal für die falschen Antworten.'}
        </div>
      </div>
      {questions.map((q, qi) => (
        <div key={qi} style={{ borderRadius: 8, padding: '8px 12px', background: answers[qi] === q.correct ? 'rgba(34,197,94,.07)' : 'rgba(239,68,68,.07)', border: `1px solid ${answers[qi] === q.correct ? 'rgba(34,197,94,.2)' : 'rgba(239,68,68,.2)'}` }}>
          <span style={{ fontSize: 12, color: answers[qi] === q.correct ? '#4ade80' : '#f87171' }}>
            {answers[qi] === q.correct ? '✓' : '✗'} {q.q}
          </span>
          {answers[qi] !== q.correct && (
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>Richtig: {q.options[q.correct]}</div>
          )}
        </div>
      ))}
    </div>
  );
}
