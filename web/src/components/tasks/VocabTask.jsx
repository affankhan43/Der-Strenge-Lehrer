import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { speakWord } from '../../utils/germanAudio';
import { useBookmarkStore } from '../../store/bookmarkStore';

const ARTICLE_STYLE = {
  der: { color:'#2563eb', bg:'rgba(37,99,235,.1)',  border:'rgba(37,99,235,.25)',  label:'der' },
  die: { color:'#db2777', bg:'rgba(219,39,119,.1)', border:'rgba(219,39,119,.25)', label:'die' },
  das: { color:'#16a34a', bg:'rgba(22,163,74,.1)',  border:'rgba(22,163,74,.25)',  label:'das' },
};
const ACCUSATIVE = { der:'den', die:'die', das:'das' };
const DATIVE     = { der:'dem', die:'der', das:'dem' };

function ArticlePill({ article }) {
  if (!article) return null;
  const st = ARTICLE_STYLE[article.toLowerCase()] || ARTICLE_STYLE.das;
  return (
    <span style={{
      display:'inline-block', fontSize:10, fontWeight:800, letterSpacing:'.05em',
      color:st.color, background:st.bg, border:`1px solid ${st.border}`,
      borderRadius:6, padding:'1px 7px', marginBottom:2, marginRight:4,
    }}>
      {st.label}
    </span>
  );
}

function CasesRow({ article }) {
  if (!article) return null;
  const art = article.toLowerCase();
  const st  = ARTICLE_STYLE[art] || ARTICLE_STYLE.das;
  return (
    <div style={{ display:'flex', gap:6, marginTop:3, flexWrap:'wrap' }}>
      <span style={{ fontSize:10, color:'var(--text3)' }}>Akk:</span>
      <span style={{ fontSize:10, fontWeight:800, color:st.color }}>{ACCUSATIVE[art]}</span>
      <span style={{ fontSize:10, color:'var(--text3)', marginLeft:6 }}>Dat:</span>
      <span style={{ fontSize:10, fontWeight:800, color:st.color }}>{DATIVE[art]}</span>
    </div>
  );
}

function BookmarkBtn({ word, day }) {
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkStore();
  const id   = `${word.de}_${day || 0}`;
  const saved = isBookmarked(word.de, day);
  const [pop, setPop] = useState(false);

  const handle = (e) => {
    e.stopPropagation();
    if (saved) {
      removeBookmark(id);
    } else {
      addBookmark({ ...word, day, id });
      setPop(true);
      setTimeout(() => setPop(false), 1200);
    }
  };

  return (
    <div style={{ position:'relative', display:'inline-flex' }}>
      <button
        onClick={handle}
        title={saved ? 'Lesezeichen entfernen' : 'Als schwieriges Wort merken'}
        style={{
          background: saved ? 'rgba(124,58,237,.1)' : 'transparent',
          border: `1px solid ${saved ? 'rgba(124,58,237,.3)' : 'var(--border)'}`,
          borderRadius:6, padding:'2px 7px',
          cursor:'pointer', fontSize:12, lineHeight:1.6,
          color: saved ? 'var(--purple)' : 'var(--text3)',
          transition:'all .2s',
        }}
      >
        {saved ? '🔖' : '📌'}
      </button>
      <AnimatePresence>
        {pop && (
          <motion.div
            initial={{ opacity:0, y:4, scale:.85 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:-4 }}
            style={{
              position:'absolute', bottom:'calc(100% + 6px)', left:'50%',
              transform:'translateX(-50%)',
              background:'var(--purple)', color:'#fff',
              fontSize:10, fontWeight:700, borderRadius:6,
              padding:'3px 8px', whiteSpace:'nowrap', zIndex:10,
              boxShadow:'0 4px 12px rgba(124,58,237,.3)',
            }}
          >
            Gemerkt ✓
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function VocabTask({ content, onReady, day }) {
  const words = content?.words || [];
  const [revealed,  setRevealed]  = useState({});
  const [confirmed, setConfirmed] = useState(false);

  const revealedCount = Object.keys(revealed).length;
  const canConfirm    = revealedCount >= Math.ceil(words.length / 2);
  const allRevealed   = revealedCount >= words.length;

  const reveal = (i) => {
    if (revealed[i]) return;
    setRevealed(prev => ({ ...prev, [i]: true }));
    speakWord(words[i].de, 1);
  };

  const revealAll = () => {
    const all = {};
    words.forEach((_, i) => { all[i] = true; });
    setRevealed(all);
  };

  const confirmDone = () => { setConfirmed(true); onReady?.(true); };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* Topic */}
      {content?.topic && (
        <div style={{
          padding:'8px 14px',
          background:'var(--purple-d)',
          border:'1px solid rgba(124,58,237,.2)',
          borderRadius:10, color:'var(--purple)',
          fontSize:11, fontWeight:800, letterSpacing:'.1em', textTransform:'uppercase',
        }}>
          {content.topic}
        </div>
      )}

      {/* Progress row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:120, height:5, background:'var(--bg3)', borderRadius:3, overflow:'hidden' }}>
            <div style={{
              height:'100%',
              width:`${(revealedCount / words.length) * 100}%`,
              background: allRevealed ? 'var(--green)' : 'var(--purple)',
              borderRadius:3, transition:'width .3s ease',
            }} />
          </div>
          <span style={{ color: revealedCount > 0 ? 'var(--purple)' : 'var(--text3)', fontSize:12, fontWeight:700 }}>
            {revealedCount}/{words.length}
            {allRevealed && <span style={{ color:'var(--green)', marginLeft:6 }}>✓ Alle</span>}
          </span>
        </div>
        {!allRevealed && (
          <button onClick={revealAll} style={{
            background:'var(--bg2)', border:'1px solid var(--border)',
            color:'var(--text2)', borderRadius:8, padding:'5px 13px',
            cursor:'pointer', fontSize:12, fontWeight:600, transition:'all .2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg3)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg2)'; }}>
            Alle zeigen
          </button>
        )}
      </div>

      {/* Word grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:8 }}>
        {words.map((w, i) => {
          const isRevealed = !!revealed[i];
          return (
            <button key={i} onClick={() => reveal(i)} style={{
              textAlign:'left', borderRadius:14, padding:'14px 15px',
              background: isRevealed ? 'var(--purple-d)' : 'var(--card)',
              border:`1px solid ${isRevealed ? 'rgba(124,58,237,.25)' : 'var(--border)'}`,
              cursor: isRevealed ? 'default' : 'pointer',
              transition:'all .2s', minHeight:84,
              display:'flex', flexDirection:'column', gap:5,
              position:'relative', overflow:'hidden',
              boxShadow: isRevealed ? 'none' : 'var(--shadow)',
            }}>
              {isRevealed && (
                <div style={{
                  position:'absolute', top:0, left:0, right:0, height:2,
                  background:'linear-gradient(90deg, var(--purple), var(--blue))', opacity:.6,
                }} />
              )}

              {w.article && <ArticlePill article={w.article} />}

              <span style={{ fontWeight:800, fontSize:15, color:'var(--text)', display:'block', lineHeight:1.2 }}>
                {w.de}
              </span>

              {isRevealed ? (
                <>
                  <span style={{ fontSize:13, color:'var(--purple)', fontWeight:600 }}>
                    {w.en}
                  </span>
                  {w.article && <CasesRow article={w.article} />}

                  {/* Audio + bookmark row */}
                  <div style={{ display:'flex', gap:5, marginTop:4, alignItems:'center' }}
                    onClick={e => e.stopPropagation()}>
                    <button onClick={() => speakWord(w.de, 1)} title="Normal" style={{
                      background:'var(--blue-d)', border:'1px solid rgba(37,99,235,.25)',
                      color:'var(--blue)', borderRadius:6, padding:'2px 8px',
                      fontSize:11, fontWeight:700, cursor:'pointer', lineHeight:1.6,
                    }}>🔊</button>
                    <button onClick={() => speakWord(w.de, 0.55)} title="Langsam" style={{
                      background:'var(--bg2)', border:'1px solid var(--border)',
                      color:'var(--text2)', borderRadius:6, padding:'2px 8px',
                      fontSize:11, fontWeight:600, cursor:'pointer', lineHeight:1.6,
                    }}>🐢</button>
                    <BookmarkBtn word={w} day={day} />
                  </div>

                  {w.example && (
                    <span style={{
                      fontSize:11, color:'var(--text3)', lineHeight:1.45,
                      fontStyle:'italic', borderTop:'1px solid var(--border)',
                      paddingTop:5, marginTop:2,
                    }}>
                      {w.example}
                    </span>
                  )}
                </>
              ) : (
                <span style={{ fontSize:11, color:'var(--text3)', fontWeight:600 }}>
                  Tippen zum Aufdecken
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Confirm */}
      {canConfirm && !confirmed && (
        <button onClick={confirmDone} style={{
          padding:'15px 20px',
          background:'linear-gradient(135deg, var(--purple), var(--blue2))',
          border:'none', borderRadius:14, color:'#fff',
          fontSize:15, fontWeight:800, cursor:'pointer',
          transition:'all .2s', boxShadow:'0 4px 20px rgba(124,58,237,.25)',
          letterSpacing:'.02em',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,58,237,.3)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,.25)'; }}>
          ✓ Vokabeln gelernt — weiter
        </button>
      )}

      {confirmed && (
        <div style={{
          display:'flex', alignItems:'center', gap:10, padding:'14px 16px',
          background:'var(--green-d)', border:'1px solid rgba(22,163,74,.25)', borderRadius:12,
        }}>
          <span style={{ fontSize:22 }}>✅</span>
          <div>
            <div style={{ color:'var(--green)', fontSize:13, fontWeight:700 }}>Vokabeln abgeschlossen</div>
            <div style={{ color:'var(--text3)', fontSize:11, marginTop:2 }}>{revealedCount} von {words.length} Wörtern aufgedeckt</div>
          </div>
        </div>
      )}

      {!canConfirm && revealedCount === 0 && (
        <p style={{ color:'var(--text3)', fontSize:12, margin:0, textAlign:'center', lineHeight:1.6, padding:'4px 0' }}>
          Tippe auf die Karten, um die Übersetzung zu sehen.<br/>
          Mindestens die Hälfte aufdecken, um fortzufahren.
        </p>
      )}
      {!canConfirm && revealedCount > 0 && (
        <p style={{ color:'var(--text3)', fontSize:12, margin:0, textAlign:'center' }}>
          Noch {Math.ceil(words.length / 2) - revealedCount} weitere aufdecken…
        </p>
      )}
    </div>
  );
}
