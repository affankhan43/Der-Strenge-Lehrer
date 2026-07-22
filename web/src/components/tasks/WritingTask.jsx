import { useState } from 'react';

export default function WritingTask({ content, onReady }) {
  const [text, setText]       = useState('');
  const [showHint, setHint]   = useState(false);
  const [submitted, setDone]  = useState(false);

  if (!content) return null;

  const sentences   = text.trim().split(/[.!?]+/).filter(s => s.trim().length > 3).length;
  const minRequired = content.min_sentences || 5;
  const enough      = sentences >= minRequired;

  const handleSubmit = () => {
    if (!enough) return;
    setDone(true);
    onReady?.(true);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* Prompt */}
      <div style={{ background:'rgba(251,191,36,.07)', border:'1px solid rgba(251,191,36,.25)', borderRadius:12, padding:'16px 18px' }}>
        <div style={{ fontSize:11, fontWeight:900, letterSpacing:'0.08em', color:'#fbbf24', textTransform:'uppercase', marginBottom:6 }}>
          ✍️ Schreibaufgabe · {content.topic}
        </div>
        <p style={{ color:'var(--text1)', fontSize:14, lineHeight:1.7, margin:0 }}>{content.prompt}</p>
      </div>

      {/* Vocabulary hint toggle */}
      <button onClick={() => setHint(h => !h)}
        style={{ alignSelf:'flex-start', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', color:'var(--text2)', borderRadius:8, padding:'6px 14px', cursor:'pointer', fontSize:12, fontWeight:600 }}>
        {showHint ? '🙈 Hinweis ausblenden' : '💡 Vokabel-Hinweis anzeigen'}
      </button>

      {showHint && content.vocabulary_hint && (
        <div style={{ background:'rgba(96,165,250,.07)', border:'1px solid rgba(96,165,250,.2)', borderRadius:10, padding:'12px 16px', fontSize:13, color:'var(--text2)', lineHeight:1.6 }}>
          <strong style={{ color:'#60a5fa', display:'block', marginBottom:4 }}>Nützliche Ausdrücke:</strong>
          {content.vocabulary_hint}
        </div>
      )}

      {/* Text area */}
      {!submitted ? (
        <>
          <div style={{ position:'relative' }}>
            <textarea
              value={text}
              onChange={e => { setText(e.target.value); onReady?.(false); }}
              placeholder="Schreibe hier deine Antwort auf Deutsch…"
              rows={8}
              style={{ width:'100%', boxSizing:'border-box', background:'rgba(0,0,0,.2)', border:`1px solid ${enough ? 'rgba(74,222,128,.35)' : 'rgba(255,255,255,.1)'}`, borderRadius:10, padding:'14px 16px', color:'var(--text1)', fontSize:14, lineHeight:1.7, resize:'vertical', outline:'none', fontFamily:'inherit', transition:'border-color .2s' }}
            />
            <div style={{ position:'absolute', bottom:10, right:14, fontSize:11, color: enough ? '#4ade80' : 'var(--text3)', fontWeight:600, pointerEvents:'none' }}>
              {sentences} / {minRequired} Sätze
            </div>
          </div>

          <button onClick={handleSubmit} disabled={!enough}
            style={{ padding:'12px 20px', borderRadius:10, fontWeight:700, fontSize:14, cursor: enough ? 'pointer' : 'not-allowed', background: enough ? 'rgba(74,222,128,.15)' : 'rgba(255,255,255,.04)', border:`1px solid ${enough ? 'rgba(74,222,128,.3)' : 'rgba(255,255,255,.08)'}`, color: enough ? '#4ade80' : 'var(--text3)', transition:'all .2s' }}>
            {enough ? '✓ Abgeben & weiter' : `🔒 Mindestens ${minRequired} Sätze schreiben`}
          </button>
        </>
      ) : (
        <div style={{ background:'rgba(74,222,128,.08)', border:'1px solid rgba(74,222,128,.25)', borderRadius:12, padding:'18px' }}>
          <div style={{ color:'#4ade80', fontWeight:700, fontSize:14, marginBottom:10 }}>✓ Gut gemacht! Dein Text:</div>
          <p style={{ color:'var(--text1)', fontSize:14, lineHeight:1.7, margin:0, whiteSpace:'pre-wrap' }}>{text}</p>
        </div>
      )}
    </div>
  );
}
