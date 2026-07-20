import { useState } from 'react';

function buildEmbedUrl(content) {
  const params = 'rel=0&modestbranding=1&cc_load_policy=1';
  if (content?.youtube_video_id) {
    const start = content.start_at ? `&start=${content.start_at}` : '';
    return `https://www.youtube.com/embed/${content.youtube_video_id}?${params}${start}`;
  }
  if (content?.youtube_playlist) {
    return `https://www.youtube.com/embed/videoseries?list=${content.youtube_playlist}&${params}`;
  }
  return null;
}

export default function VideoTask({ content, onReady }) {
  const [watched, setWatched] = useState(false);
  const [checklist, setChecklist] = useState({});

  const embedUrl = buildEmbedUrl(content);
  if (!embedUrl) return <p style={{ color: 'var(--text3)' }}>Kein Video verfügbar.</p>;

  const tasks = content?.tasks_after || [];
  const allChecked = tasks.length === 0 || tasks.every((_, i) => checklist[i]);

  const toggle = (i) => {
    const next = { ...checklist, [i]: !checklist[i] };
    setChecklist(next);
    const done = tasks.every((_, idx) => next[idx]);
    if (done) { setWatched(true); onReady?.(true); }
    else onReady?.(false);
  };

  const handleWatched = () => {
    setWatched(true);
    if (tasks.length === 0) onReady?.(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {content?.channel && (
        <div style={{ display: 'flex', align: 'center', gap: 6, fontSize: 12, color: 'var(--text3)' }}>
          📺 <span style={{ color: 'var(--text2)', fontWeight: 600 }}>{content.channel}</span>
          {content.series && <span>· {content.series}</span>}
        </div>
      )}
      {content?.notes && (
        <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.6, margin: 0, padding: '8px 12px', background: 'rgba(255,255,255,.03)', borderRadius: 8, borderLeft: '3px solid rgba(124,58,237,.4)' }}>
          📌 {content.notes}
        </p>
      )}

      {/* Video embed */}
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 12, overflow: 'hidden', background: '#000', border: '1px solid rgba(255,255,255,.08)' }}>
        <iframe
          src={embedUrl}
          title={content?.title || 'Video'}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          onLoad={handleWatched}
        />
      </div>

      {/* Post-watch checklist */}
      {tasks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <p style={{ color: 'var(--text3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', margin: 0, textTransform: 'uppercase' }}>
            Nach dem Video:
          </p>
          {tasks.map((t, i) => (
            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 12px', borderRadius: 8, background: checklist[i] ? 'rgba(124,58,237,.12)' : 'rgba(255,255,255,.04)', border: `1px solid ${checklist[i] ? 'rgba(124,58,237,.35)' : 'rgba(255,255,255,.08)'}`, transition: 'all .2s' }}>
              <input type="checkbox" checked={!!checklist[i]} onChange={() => toggle(i)} style={{ width: 16, height: 16, accentColor: '#7c3aed', cursor: 'pointer', flexShrink: 0 }} />
              <span style={{ color: checklist[i] ? 'var(--text1)' : 'var(--text2)', fontSize: 13 }}>{t}</span>
            </label>
          ))}
        </div>
      )}

      {/* Simple watched confirm if no checklist */}
      {tasks.length === 0 && !watched && (
        <button onClick={handleWatched} style={{ background: 'rgba(124,58,237,.15)', border: '1px solid rgba(124,58,237,.3)', color: '#a78bfa', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontSize: 14 }}>
          ✓ Video gesehen
        </button>
      )}

      {(watched && tasks.length === 0) && (
        <p style={{ color: '#22c55e', fontSize: 13, margin: 0 }}>✓ Video abgeschlossen</p>
      )}
      {(allChecked && tasks.length > 0) && (
        <p style={{ color: '#22c55e', fontSize: 13, margin: 0 }}>✓ Alle Aufgaben erledigt</p>
      )}
    </div>
  );
}
