import { useState } from 'react';

function renderMarkdown(text) {
  // simple bold + table + newline rendering
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

export default function GrammarTask({ content, onReady }) {
  const exercises = content?.exercises || [];
  const [phase, setPhase] = useState('explain'); // 'explain' | 'practice' | 'done'
  const [inputs, setInputs] = useState({});
  const [mcAnswers, setMcAnswers] = useState({});
  const [checked, setChecked] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const fillBlanks = exercises.filter(e => e.type === 'fill_blank');
  const multiChoice = exercises.filter(e => e.type === 'multiple_choice');
  const allExercises = exercises;

  const setInput = (i, val) => setInputs(prev => ({ ...prev, [i]: val }));
  const setMc = (i, val) => { if (!submitted) setMcAnswers(prev => ({ ...prev, [i]: val })); };

  const checkFill = (i) => setChecked(prev => ({ ...prev, [i]: true }));

  const handleSubmit = () => {
    setSubmitted(true);
    const allChecked = {};
    allExercises.forEach((_, i) => { allChecked[i] = true; });
    setChecked(allChecked);
    const s = allExercises.filter((ex, i) => {
      if (ex.type === 'fill_blank')    return inputs[i]?.trim().toLowerCase() === ex.answer?.toLowerCase();
      if (ex.type === 'multiple_choice') return mcAnswers[i] === ex.correct;
      return false;
    }).length;
    const pct = allExercises.length > 0 ? s / allExercises.length : 1;
    setPhase('done');
    if (pct >= 0.5) onReady?.(true);
    // else: stays on done screen with retry button — onReady NOT called
  };

  const handleRetry = () => {
    setInputs({});
    setMcAnswers({});
    setChecked({});
    setSubmitted(false);
    setPhase('practice');
  };

  const allMcAnswered = multiChoice.length === 0 || allExercises.every((ex, i) => ex.type !== 'multiple_choice' || mcAnswers[i] !== undefined);
  const allFillAttempted = fillBlanks.length === 0 || allExercises.every((ex, i) => ex.type !== 'fill_blank' || (inputs[i] !== undefined && inputs[i] !== ''));
  const canSubmit = allMcAnswered && allFillAttempted;

  const score = allExercises.filter((ex, i) => {
    if (ex.type === 'fill_blank') return inputs[i]?.trim().toLowerCase() === ex.answer?.toLowerCase();
    if (ex.type === 'multiple_choice') return mcAnswers[i] === ex.correct;
    return false;
  }).length;

  if (phase === 'explain') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ color: 'var(--text3)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', margin: 0, textTransform: 'uppercase' }}>
          {content?.topic}
        </p>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '18px 16px' }}>
          <div
            style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.8 }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content?.explanation || '') }}
          />
        </div>
        <button
          onClick={() => setPhase('practice')}
          style={{ background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.4)', color: '#c4b5fd', borderRadius: 10, padding: '12px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
        >
          Übungen starten →
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ color: 'var(--text3)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', margin: 0, textTransform: 'uppercase' }}>
        {content?.topic} — Übungen
      </p>

      {allExercises.map((ex, i) => {
        const isChecked = checked[i] || submitted;

        if (ex.type === 'fill_blank') {
          const userAns = inputs[i]?.trim().toLowerCase() || '';
          const correct = ex.answer?.toLowerCase();
          const isRight = userAns === correct;

          return (
            <div key={i} style={{ background: isChecked ? (isRight ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)') : 'rgba(255,255,255,0.04)', border: `1px solid ${isChecked ? (isRight ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)') : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, padding: '14px 16px', transition: 'all .2s' }}>
              <p style={{ color: 'var(--text1)', fontSize: 14, margin: '0 0 10px' }}>
                {i + 1}. {ex.sentence.replace('___', '______')}
              </p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  value={inputs[i] || ''}
                  onChange={e => setInput(i, e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !isChecked && checkFill(i)}
                  disabled={isChecked}
                  placeholder="Deine Antwort..."
                  style={{ flex: 1, minWidth: 120, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 12px', color: 'var(--text1)', fontSize: 14, outline: 'none' }}
                />
                {!isChecked && (
                  <button onClick={() => checkFill(i)} style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#c4b5fd', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}>
                    Prüfen
                  </button>
                )}
                {isChecked && (
                  <span style={{ fontSize: 16 }}>{isRight ? '✅' : '❌'}</span>
                )}
              </div>
              {isChecked && !isRight && (
                <p style={{ color: '#f87171', fontSize: 13, margin: '8px 0 0' }}>
                  Richtig: <strong>{ex.answer}</strong>
                  {ex.hint && <span style={{ color: 'var(--text3)' }}> — {ex.hint}</span>}
                </p>
              )}
              {isChecked && isRight && ex.hint && (
                <p style={{ color: 'var(--text3)', fontSize: 12, margin: '6px 0 0' }}>{ex.hint}</p>
              )}
            </div>
          );
        }

        if (ex.type === 'multiple_choice') {
          return (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 16px' }}>
              <p style={{ color: 'var(--text1)', fontSize: 14, fontWeight: 600, margin: '0 0 10px' }}>{i + 1}. {ex.q}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ex.options.map((opt, ai) => {
                  const selected = mcAnswers[i] === ai;
                  const isCorrect = ai === ex.correct;
                  let bg = 'rgba(255,255,255,0.03)';
                  let borderColor = 'rgba(255,255,255,0.08)';
                  let color = 'var(--text2)';
                  if (isChecked) {
                    if (isCorrect) { bg = 'rgba(34,197,94,0.12)'; borderColor = 'rgba(34,197,94,0.4)'; color = '#4ade80'; }
                    else if (selected) { bg = 'rgba(239,68,68,0.12)'; borderColor = 'rgba(239,68,68,0.4)'; color = '#f87171'; }
                  } else if (selected) {
                    bg = 'rgba(124,58,237,0.15)'; borderColor = 'rgba(124,58,237,0.4)'; color = '#c4b5fd';
                  }
                  return (
                    <button key={ai} onClick={() => setMc(i, ai)} style={{ textAlign: 'left', padding: '9px 14px', borderRadius: 8, border: `1px solid ${borderColor}`, background: bg, color, cursor: submitted ? 'default' : 'pointer', fontSize: 13, transition: 'all .15s' }}>
                      {String.fromCharCode(65 + ai)}. {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }
        return null;
      })}

      {phase !== 'done' && (
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{ background: canSubmit ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.04)', border: `1px solid ${canSubmit ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.08)'}`, color: canSubmit ? '#4ade80' : 'var(--text3)', borderRadius: 10, padding: '12px 18px', cursor: canSubmit ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 600, transition: 'all .2s' }}
        >
          Alle abgeben
        </button>
      )}

      {phase === 'done' && (() => {
        const pct = allExercises.length > 0 ? score / allExercises.length : 1;
        const passed = pct >= 0.5;
        return passed ? (
          <div style={{ background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.3)', borderRadius: 12, padding: '18px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 30, marginBottom: 6 }}>{score === allExercises.length ? '🏆' : '✅'}</div>
            <div style={{ color: '#4ade80', fontWeight: 800, fontSize: 16 }}>{score}/{allExercises.length} richtig — Bestanden!</div>
            <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>
              {score === allExercises.length ? 'Perfekt! Weiter so.' : 'Gut genug. Lies die Fehler noch einmal durch.'}
            </div>
          </div>
        ) : (
          <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.35)', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <span style={{ fontSize:28 }}>❌</span>
              <div>
                <div style={{ color:'#f87171', fontWeight:800, fontSize:16 }}>Nicht bestanden — {score}/{allExercises.length} richtig</div>
                <div style={{ color:'var(--text2)', fontSize:13 }}>Mindestens 50% erforderlich. Versuche es nochmal.</div>
              </div>
            </div>
            <button
              onClick={handleRetry}
              style={{ width:'100%', padding:'12px', background:'linear-gradient(135deg,#dc2626,#b91c1c)', border:'none', borderRadius:10, color:'#fff', fontSize:15, fontWeight:800, cursor:'pointer', marginTop:4 }}
            >
              🔄 Nochmal versuchen
            </button>
          </div>
        );
      })()}
    </div>
  );
}
