import { useState } from 'react';

function speak(text, rate = 1) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'de-DE';
  utt.rate = rate;
  window.speechSynthesis.speak(utt);
}

export default function VocabTask({ content, onReady }) {
  const words = content?.words || [];
  const [revealed, setRevealed] = useState({});
  const [confirmed, setConfirmed] = useState(false);
  const [speaking, setSpeaking] = useState(null); // index + rate key

  const revealedCount = Object.keys(revealed).length;
  const canConfirm = revealedCount >= Math.ceil(words.length / 2);
  const allRevealed = revealedCount >= words.length;

  const reveal = (i) => {
    if (revealed[i]) return;
    setRevealed(prev => ({ ...prev, [i]: true }));
    speak(words[i].de, 1);
  };

  const revealAll = () => {
    const all = {};
    words.forEach((_, i) => { all[i] = true; });
    setRevealed(all);
  };

  const confirmDone = () => {
    setConfirmed(true);
    onReady?.(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Topic */}
      {content?.topic && (
        <div style={{
          padding: '8px 14px',
          background: 'rgba(124,58,237,.08)',
          border: '1px solid rgba(124,58,237,.18)',
          borderRadius: 10,
          color: '#a78bfa',
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
        }}>
          {content.topic}
        </div>
      )}

      {/* Status row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 120,
            height: 5,
            background: 'rgba(255,255,255,.07)',
            borderRadius: 3,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${(revealedCount / words.length) * 100}%`,
              background: allRevealed ? '#22c55e' : '#a78bfa',
              borderRadius: 3,
              transition: 'width .3s ease',
            }} />
          </div>
          <span style={{
            color: revealedCount > 0 ? '#c4b5fd' : '#44446a',
            fontSize: 12, fontWeight: 700,
          }}>
            {revealedCount}/{words.length}
            {allRevealed && <span style={{ color: '#4ade80', marginLeft: 6 }}>✓ Alle</span>}
          </span>
        </div>
        {!allRevealed && (
          <button onClick={revealAll} style={{
            background: 'rgba(255,255,255,.05)',
            border: '1px solid rgba(255,255,255,.1)',
            color: '#7878aa',
            borderRadius: 8, padding: '5px 13px',
            cursor: 'pointer', fontSize: 12, fontWeight: 600,
            transition: 'all .2s',
          }}
          onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,.09)'; e.target.style.color = '#c0c0e0'; }}
          onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,.05)'; e.target.style.color = '#7878aa'; }}>
            Alle zeigen
          </button>
        )}
      </div>

      {/* Word grid — 2 columns for readability */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 8,
      }}>
        {words.map((w, i) => {
          const isRevealed = !!revealed[i];
          return (
            <button
              key={i}
              onClick={() => reveal(i)}
              style={{
                textAlign: 'left',
                borderRadius: 14,
                padding: '14px 15px',
                background: isRevealed
                  ? 'rgba(124,58,237,.1)'
                  : 'rgba(255,255,255,.04)',
                border: `1px solid ${isRevealed ? 'rgba(124,58,237,.3)' : 'rgba(255,255,255,.08)'}`,
                cursor: isRevealed ? 'default' : 'pointer',
                transition: 'all .2s',
                minHeight: 80,
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Revealed accent line */}
              {isRevealed && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                  background: 'linear-gradient(90deg, #7c3aed, #4d9fff)',
                  opacity: .7,
                }} />
              )}

              {/* German word — always visible */}
              <span style={{
                fontWeight: 800,
                fontSize: 15,
                color: '#eeeeff',
                display: 'block',
                lineHeight: 1.2,
              }}>
                {w.de}
              </span>

              {/* Translation + example — revealed only */}
              {isRevealed ? (
                <>
                  <span style={{ fontSize: 13, color: '#c4b5fd', fontWeight: 600 }}>
                    {w.en}
                  </span>
                  {/* Audio buttons */}
                  <div
                    style={{ display: 'flex', gap: 5, marginTop: 4 }}
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() => speak(w.de, 1)}
                      title="Normal sprechen"
                      style={{
                        background: 'rgba(96,165,250,.15)', border: '1px solid rgba(96,165,250,.3)',
                        color: '#93c5fd', borderRadius: 6, padding: '2px 8px', fontSize: 11,
                        fontWeight: 700, cursor: 'pointer', lineHeight: 1.6,
                      }}
                    >🔊</button>
                    <button
                      onClick={() => speak(w.de, 0.55)}
                      title="Langsam sprechen"
                      style={{
                        background: 'rgba(96,165,250,.08)', border: '1px solid rgba(96,165,250,.2)',
                        color: '#7aa8d8', borderRadius: 6, padding: '2px 8px', fontSize: 11,
                        fontWeight: 700, cursor: 'pointer', lineHeight: 1.6,
                      }}
                    >🐢 langsam</button>
                  </div>
                  {w.example && (
                    <span style={{
                      fontSize: 11, color: '#5a5a8a', lineHeight: 1.45,
                      fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,.06)',
                      paddingTop: 5, marginTop: 2,
                    }}>
                      {w.example}
                    </span>
                  )}
                </>
              ) : (
                <span style={{
                  fontSize: 11,
                  color: '#44446a',
                  fontWeight: 600,
                }}>
                  Tippen zum Aufdecken
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Confirm button */}
      {canConfirm && !confirmed && (
        <button
          onClick={confirmDone}
          style={{
            padding: '15px 20px',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            border: 'none',
            borderRadius: 14,
            color: '#fff',
            fontSize: 15,
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all .2s',
            boxShadow: '0 4px 20px rgba(124,58,237,.3)',
            letterSpacing: '.02em',
          }}
          onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 28px rgba(124,58,237,.4)'; }}
          onMouseLeave={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 4px 20px rgba(124,58,237,.3)'; }}
        >
          ✓ Vokabeln gelernt — weiter
        </button>
      )}

      {confirmed && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 16px',
          background: 'rgba(34,197,94,.07)',
          border: '1px solid rgba(34,197,94,.2)',
          borderRadius: 12,
        }}>
          <span style={{ fontSize: 22 }}>✅</span>
          <div>
            <div style={{ color: '#4ade80', fontSize: 13, fontWeight: 700 }}>Vokabeln abgeschlossen</div>
            <div style={{ color: '#5a5a8a', fontSize: 11, marginTop: 2 }}>{revealedCount} von {words.length} Wörtern aufgedeckt</div>
          </div>
        </div>
      )}

      {!canConfirm && revealedCount === 0 && (
        <p style={{
          color: '#44446a', fontSize: 12, margin: 0,
          textAlign: 'center', lineHeight: 1.6,
          padding: '4px 0',
        }}>
          Tippe auf die Karten, um die Übersetzung zu sehen.
          <br />Mindestens die Hälfte aufdecken, um fortzufahren.
        </p>
      )}

      {!canConfirm && revealedCount > 0 && (
        <p style={{ color: '#5a5a8a', fontSize: 12, margin: 0, textAlign: 'center' }}>
          Noch {Math.ceil(words.length / 2) - revealedCount} weitere aufdecken…
        </p>
      )}
    </div>
  );
}
