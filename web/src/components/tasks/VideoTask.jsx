import { useState } from 'react';

export default function VideoTask({ content, onReady }) {
  const [watched, setWatched] = useState(false);
  const [checklist, setChecklist] = useState({});

  const playlistId = content?.youtube_playlist;
  if (!playlistId) return <p style={{ color: 'var(--text3)' }}>Kein Video verfügbar.</p>;

  const embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}&rel=0&modestbranding=1`;

  const tasks = content.tasks_after || [];
  const allChecked = tasks.length === 0 || tasks.every((_, i) => checklist[i]);

  const toggle = (i) => {
    const next = { ...checklist, [i]: !checklist[i] };
    setChecklist(next);
    const done = tasks.every((_, idx) => next[idx]);
    if (done && !watched) { setWatched(true); onReady?.(true); }
    if (!done) onReady?.(false);
  };

  const handleWatched = () => {
    setWatched(true);
    if (tasks.length === 0) onReady?.(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {content.notes && (
        <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          📌 {content.notes}
        </p>
      )}

      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 12, overflow: 'hidden', background: '#000' }}>
        <iframe
          src={embedUrl}
          title={content.title || 'Video'}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          onLoad={handleWatched}
        />
      </div>

      {tasks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ color: 'var(--text3)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', margin: 0, textTransform: 'uppercase' }}>
            Nach dem Video:
          </p>
          {tasks.map((t, i) => (
            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 12px', borderRadius: 8, background: checklist[i] ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${checklist[i] ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'}`, transition: 'all .2s' }}>
              <input type="checkbox" checked={!!checklist[i]} onChange={() => toggle(i)} style={{ width: 16, height: 16, accentColor: '#7c3aed', cursor: 'pointer' }} />
              <span style={{ color: checklist[i] ? 'var(--text1)' : 'var(--text2)', fontSize: 14 }}>{t}</span>
            </label>
          ))}
        </div>
      )}

      {!watched && tasks.length === 0 && (
        <button
          onClick={handleWatched}
          style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontSize: 14 }}
        >
          ✓ Video geschaut
        </button>
      )}

      {(watched && tasks.length === 0) && (
        <p style={{ color: '#22c55e', fontSize: 13, margin: 0 }}>✓ Video abgeschlossen</p>
      )}
      {allChecked && tasks.length > 0 && (
        <p style={{ color: '#22c55e', fontSize: 13, margin: 0 }}>✓ Alle Aufgaben erledigt</p>
      )}
    </div>
  );
}
