import { useState } from 'react';

export default function VocabTask({ content, onReady }) {
  const words = content?.words || [];
  const [revealed, setRevealed] = useState({});
  const [confirmed, setConfirmed] = useState(false);

  const revealedCount = Object.keys(revealed).length;

  const reveal = (i) => {
    if (revealed[i]) return;
    setRevealed(prev => ({ ...prev, [i]: true }));
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

  // Show confirm button once at least half the words are revealed (or all shown)
  const canConfirm = revealedCount >= Math.ceil(words.length / 2) || revealedCount === words.length;
  const allRevealed = revealedCount >= words.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {content?.topic && (
        <p style={{ color: 'var(--text3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', margin: 0, textTransform: 'uppercase' }}>
          {content.topic}
        </p>
      )}

      {/* Progress + controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: revealedCount > 0 ? '#a78bfa' : 'var(--text3)', fontSize: 12, fontWeight: 700 }}>
            {revealedCount}/{words.length} aufgedeckt
          </span>
          {allRevealed && <span style={{ fontSize: 12, color: '#22c55e' }}>✓ Alle</span>}
        </div>
        <button
          onClick={revealAll}
          style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
        >
          Alle zeigen
        </button>
      </div>

      {/* Word grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 7 }}>
        {words.map((w, i) => (
          <button
            key={i}
            onClick={() => reveal(i)}
            style={{
              textAlign: 'left',
              borderRadius: 10,
              padding: '10px 12px',
              background: revealed[i] ? 'rgba(124,58,237,0.14)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${revealed[i] ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.09)'}`,
              cursor: revealed[i] ? 'default' : 'pointer',
              transition: 'all .18s',
              minHeight: 68,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text1)', display: 'block' }}>{w.de}</span>
            {revealed[i] ? (
              <>
                <span style={{ fontSize: 13, color: '#a78bfa' }}>{w.en}</span>
                {w.example && (
                  <span style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.4, marginTop: 2, fontStyle: 'italic' }}>
                    {w.example}
                  </span>
                )}
              </>
            ) : (
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>Tippen →</span>
            )}
          </button>
        ))}
      </div>

      {/* Confirm button — appears after half revealed */}
      {canConfirm && !confirmed && (
        <button
          onClick={confirmDone}
          style={{
            marginTop: 4,
            padding: '13px 18px',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(79,70,229,0.2))',
            border: '1px solid rgba(124,58,237,0.5)',
            borderRadius: 12, color: '#c4b5fd',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            transition: 'all .2s',
          }}
        >
          ✓ Vokabeln gelernt — weiter
        </button>
      )}

      {confirmed && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10 }}>
          <span style={{ fontSize: 18 }}>✅</span>
          <span style={{ color: '#4ade80', fontSize: 13, fontWeight: 600 }}>Vokabeln abgeschlossen — {revealedCount} Wörter gelernt</span>
        </div>
      )}

      {!canConfirm && revealedCount === 0 && (
        <p style={{ color: 'var(--text3)', fontSize: 12, margin: 0, textAlign: 'center' }}>
          Tippe auf die Karten um die Übersetzung zu sehen, dann bestätige.
        </p>
      )}
    </div>
  );
}
