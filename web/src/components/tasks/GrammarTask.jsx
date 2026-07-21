import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

export default function GrammarTask({ content, onReady }) {
  const exercises = content?.exercises || [];
  const [phase, setPhase]         = useState('explain');
  const [inputs, setInputs]       = useState({});
  const [mcAnswers, setMcAnswers] = useState({});
  const [checked, setChecked]     = useState({});
  const [submitted, setSubmitted] = useState(false);
  // Explicit pass/fail stored in state — never rely on render-time recalculation
  const [result, setResult]       = useState(null); // null | { score, total, passed }
  const onReadyCalled             = useRef(false);

  const setInput = (i, val) => { if (!submitted) setInputs(p => ({ ...p, [i]: val })); };
  const setMc    = (i, val) => { if (!submitted) setMcAnswers(p => ({ ...p, [i]: val })); };
  const checkFill = (i)    => setChecked(p => ({ ...p, [i]: true }));

  const calcScore = (ins, mcs) =>
    exercises.filter((ex, i) => {
      if (ex.type === 'fill_blank')      return ins[i]?.trim().toLowerCase() === ex.answer?.toLowerCase();
      if (ex.type === 'multiple_choice') return mcs[i] === ex.correct;
      return false;
    }).length;

  const handleSubmit = () => {
    const allChecked = {};
    exercises.forEach((_, i) => { allChecked[i] = true; });
    const score  = calcScore(inputs, mcAnswers);
    const total  = exercises.length;
    const passed = total === 0 || score / total >= 0.5;

    setChecked(allChecked);
    setSubmitted(true);
    setPhase('done');
    setResult({ score, total, passed });

    if (passed && !onReadyCalled.current) {
      onReadyCalled.current = true;
      onReady?.(true);
    }
  };

  const handleRetry = () => {
    setInputs({});
    setMcAnswers({});
    setChecked({});
    setSubmitted(false);
    setResult(null);
    setPhase('practice');
    // onReadyCalled stays false — must pass to unlock
  };

  const allMcAnswered  = exercises.every((ex, i) => ex.type !== 'multiple_choice' || mcAnswers[i] !== undefined);
  const allFillTried   = exercises.every((ex, i) => ex.type !== 'fill_blank' || (inputs[i] ?? '') !== '');
  const canSubmit      = allMcAnswered && allFillTried;

  // ── EXPLAIN ─────────────────────────────────────────────
  if (phase === 'explain') {
    return (
      <motion.div style={{ display:'flex', flexDirection:'column', gap:16 }}
        initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}>
        <p style={{ color:'var(--text3)', fontSize:12, fontWeight:700, letterSpacing:'.1em', margin:0, textTransform:'uppercase' }}>
          {content?.topic}
        </p>
        <div style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:14, padding:'18px 16px' }}>
          <div style={{ color:'var(--text2)', fontSize:14, lineHeight:1.8 }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content?.explanation || '') }} />
        </div>
        <motion.button
          whileHover={{ scale:1.02 }} whileTap={{ scale:.97 }}
          onClick={() => setPhase('practice')}
          style={{ background:'linear-gradient(135deg,rgba(124,58,237,.25),rgba(79,70,229,.2))', border:'1px solid rgba(124,58,237,.4)', color:'#c4b5fd', borderRadius:12, padding:'13px 18px', cursor:'pointer', fontSize:14, fontWeight:700 }}
        >
          ✏️ Übungen starten →
        </motion.button>
      </motion.div>
    );
  }

  // ── PRACTICE ────────────────────────────────────────────
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <p style={{ color:'var(--text3)', fontSize:11, fontWeight:700, letterSpacing:'.1em', margin:0, textTransform:'uppercase' }}>
          {content?.topic} — Übungen
        </p>
        {phase === 'done' && result && (
          <span style={{
            fontSize:12, fontWeight:800, padding:'3px 10px', borderRadius:20,
            background: result.passed ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)',
            color: result.passed ? '#4ade80' : '#f87171',
            border: `1px solid ${result.passed ? 'rgba(34,197,94,.3)' : 'rgba(239,68,68,.3)'}`,
          }}>
            {result.score}/{result.total} richtig
          </span>
        )}
      </div>

      {exercises.map((ex, i) => {
        const isChecked = checked[i] || submitted;

        if (ex.type === 'fill_blank') {
          const userAns = inputs[i]?.trim().toLowerCase() || '';
          const correct = ex.answer?.toLowerCase();
          const isRight = isChecked && userAns === correct;
          const isWrong = isChecked && userAns !== correct;

          return (
            <motion.div key={i}
              animate={isChecked ? { scale:[1,1.02,1] } : {}}
              transition={{ duration:.3 }}
              style={{
                background: isWrong ? 'rgba(239,68,68,.07)' : isRight ? 'rgba(34,197,94,.07)' : 'rgba(255,255,255,.04)',
                border:`1px solid ${isWrong ? 'rgba(239,68,68,.3)' : isRight ? 'rgba(34,197,94,.3)' : 'rgba(255,255,255,.08)'}`,
                borderRadius:10, padding:'14px 16px', transition:'all .3s',
              }}>
              <p style={{ color:'var(--text1)', fontSize:14, margin:'0 0 10px' }}>
                {i+1}. {ex.sentence.replace('___','______')}
              </p>
              <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                <input
                  value={inputs[i] || ''}
                  onChange={e => setInput(i, e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !isChecked && checkFill(i)}
                  disabled={submitted}
                  placeholder="Deine Antwort…"
                  style={{ flex:1, minWidth:100, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.12)', borderRadius:8, padding:'8px 12px', color:'var(--text1)', fontSize:14, outline:'none' }}
                />
                {!isChecked && <button onClick={() => checkFill(i)} style={{ background:'rgba(124,58,237,.2)', border:'1px solid rgba(124,58,237,.4)', color:'#c4b5fd', borderRadius:8, padding:'8px 14px', cursor:'pointer', fontSize:13 }}>Prüfen</button>}
                {isChecked && <span style={{ fontSize:16 }}>{isRight ? '✅' : '❌'}</span>}
              </div>
              {isWrong && (
                <p style={{ color:'#f87171', fontSize:13, margin:'8px 0 0' }}>
                  ✓ Richtig: <strong>{ex.answer}</strong>
                  {ex.hint && <span style={{ color:'var(--text3)' }}> — {ex.hint}</span>}
                </p>
              )}
            </motion.div>
          );
        }

        if (ex.type === 'multiple_choice') {
          return (
            <div key={i} style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:10, padding:'14px 16px' }}>
              <p style={{ color:'var(--text1)', fontSize:14, fontWeight:600, margin:'0 0 10px' }}>{i+1}. {ex.q}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {ex.options.map((opt, ai) => {
                  const sel = mcAnswers[i] === ai;
                  const isCorrect = ai === ex.correct;
                  let bg='rgba(255,255,255,.03)', bc='rgba(255,255,255,.08)', col='var(--text2)';
                  if (submitted) {
                    if (isCorrect)     { bg='rgba(34,197,94,.12)'; bc='rgba(34,197,94,.4)'; col='#4ade80'; }
                    else if (sel)      { bg='rgba(239,68,68,.12)'; bc='rgba(239,68,68,.4)'; col='#f87171'; }
                  } else if (sel)      { bg='rgba(124,58,237,.15)'; bc='rgba(124,58,237,.4)'; col='#c4b5fd'; }
                  return (
                    <motion.button key={ai} whileHover={!submitted ? { x:4 } : {}}
                      onClick={() => setMc(i, ai)}
                      style={{ textAlign:'left', padding:'9px 14px', borderRadius:8, border:`1px solid ${bc}`, background:bg, color:col, cursor:submitted?'default':'pointer', fontSize:13, transition:'all .15s' }}>
                      {String.fromCharCode(65+ai)}. {opt}
                      {submitted && isCorrect && <span style={{ marginLeft:8 }}>✓</span>}
                      {submitted && sel && !isCorrect && <span style={{ marginLeft:8 }}>✗</span>}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        }
        return null;
      })}

      {/* Submit button */}
      {phase === 'practice' && (
        <motion.button
          whileHover={canSubmit ? { scale:1.02 } : {}}
          whileTap={canSubmit ? { scale:.97 } : {}}
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            background: canSubmit ? 'linear-gradient(135deg,rgba(34,197,94,.2),rgba(16,185,129,.15))' : 'rgba(255,255,255,.04)',
            border:`1px solid ${canSubmit ? 'rgba(34,197,94,.4)' : 'rgba(255,255,255,.08)'}`,
            color: canSubmit ? '#4ade80' : 'var(--text3)',
            borderRadius:12, padding:'13px 18px',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            fontSize:14, fontWeight:700, transition:'all .2s',
          }}
        >
          {canSubmit ? '✓ Alle abgeben' : `Noch ${exercises.filter((_,i)=>(exercises[i].type==='fill_blank'?!inputs[i]:mcAnswers[i]===undefined)).length} ausstehend…`}
        </motion.button>
      )}

      {/* Result banner */}
      <AnimatePresence>
        {phase === 'done' && result && (
          <motion.div
            initial={{ opacity:0, y:20, scale:.95 }}
            animate={{ opacity:1, y:0, scale:1 }}
            transition={{ type:'spring', stiffness:300, damping:25 }}
          >
            {result.passed ? (
              <div style={{ background:'rgba(34,197,94,.1)', border:'1px solid rgba(34,197,94,.3)', borderRadius:14, padding:'20px 22px', textAlign:'center' }}>
                <div style={{ fontSize:36, marginBottom:8 }}>{result.score === result.total ? '🏆' : '✅'}</div>
                <div style={{ color:'#4ade80', fontWeight:900, fontSize:17 }}>
                  {result.score}/{result.total} richtig — Bestanden!
                </div>
                <div style={{ color:'var(--text2)', fontSize:13, marginTop:6 }}>
                  {result.score === result.total ? 'Perfekt! 100% korrekt.' : 'Gut genug. Lies die Fehler nochmal durch.'}
                </div>
              </div>
            ) : (
              <div style={{ background:'rgba(239,68,68,.08)', border:'2px solid rgba(239,68,68,.35)', borderRadius:14, padding:'20px 22px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
                  <span style={{ fontSize:36 }}>❌</span>
                  <div>
                    <div style={{ color:'#f87171', fontWeight:900, fontSize:17 }}>
                      Nicht bestanden — {result.score}/{result.total} richtig
                    </div>
                    <div style={{ color:'var(--text2)', fontSize:13, marginTop:4 }}>
                      Mindestens 50% erforderlich ({Math.ceil(result.total/2)}/{result.total}). Du musst nochmal.
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale:1.02, y:-2 }} whileTap={{ scale:.97 }}
                  onClick={handleRetry}
                  style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg,#dc2626,#b91c1c)', border:'none', borderRadius:11, color:'#fff', fontSize:15, fontWeight:900, cursor:'pointer', boxShadow:'0 4px 20px rgba(220,38,38,.4)' }}
                >
                  🔄 Nochmal versuchen — Du schaffst das!
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
