import { useState } from 'react';

export default function VocabTask({ content, onReady }) {
  const words = content?.words || [];
  const [revealed, setRevealed] = useState({});
  const [done, setDone] = useState(false);

  const reveal = (i) => {
    const next = { ...revealed, [i]: true };
    setRevealed(next);
    if (Object.keys(next).length >= words.length) {
      setDone(true);
      onReady?.(true);
    }
  };

  const revealAll = () => {
    const all = {};
    words.forEach((_, i) => { all[i] = true; });
    setRevealed(all);
    setDone(true);
    onReady?.(true);
  };

  const revealedCount = Object.keys(revealed).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {content?.topic && (
        <p style={{ color: 'var(--text3)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', margin: 0, textTransform: 'uppercase' }}>
          {content.topic}
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--text3)', fontSize: 13 }}>{revealedCount}/{words.length} gesehen</span>
        <button onClick={revealAll} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text3)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>
          Alle zeigen
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
        {words.map((w, i) => (
          <div
            key={i}
            onClick={() => reveal(i)}
            style={{
              borderRadius: 10,
              padding: '12px 14px',
              background: revealed[i] ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${revealed[i] ? 'rgba(124,58,237,0.35)' : 'rgba(255,255,255,0.08)'}`,
              cursor: revealed[i] ? 'default' : 'pointer',
              transition: 'all .2s',
              minHeight: 72,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text1)' }}>{w.de}</span>
            {revealed[i] ? (
              <>
                <span style={{ fontSize: 13, color: '#a78bfa' }}>{w.en}</span>
                {w.example && <span style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.4, marginTop: 2 }}>{w.example}</span>}
              </>
            ) : (
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>Tippen zum Aufdecken</span>
            )}
          </div>
        ))}
      </div>

      {done && (
        <p style={{ color: '#22c55e', fontSize: 13, margin: 0 }}>✓ Alle {words.length} Wörter gesehen</p>
      )}
      {!done && revealedCount > 0 && (
        <p style={{ color: 'var(--text3)', fontSize: 13, margin: 0 }}>
          Noch {words.length - revealedCount} Wörter übrig — tippe auf jede Karte.
        </p>
      )}
    </div>
  );
}
