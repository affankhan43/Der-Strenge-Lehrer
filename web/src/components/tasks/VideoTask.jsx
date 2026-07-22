import { useState } from 'react';

function EmbedUrl(id) {
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&cc_load_policy=1`;
}

function SingleVideo({ video, onDone }) {
  const [watched, setWatched] = useState(false);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ position:'relative', paddingBottom:'56.25%', height:0, borderRadius:12, overflow:'hidden', background:'#000', border:'1px solid rgba(255,255,255,.08)' }}>
        <iframe
          src={EmbedUrl(video.id)}
          title={video.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%' }}
          onLoad={() => setWatched(true)}
        />
      </div>
      {!watched && (
        <button onClick={() => { setWatched(true); onDone?.(); }}
          style={{ background:'rgba(124,58,237,.15)', border:'1px solid rgba(124,58,237,.3)', color:'#a78bfa', borderRadius:8, padding:'10px 16px', cursor:'pointer', fontSize:14 }}>
          ✓ Video gesehen
        </button>
      )}
      {watched && (
        <p style={{ color:'#22c55e', fontSize:13, margin:0, display:'flex', alignItems:'center', gap:6 }}>
          ✓ Video abgeschlossen
          {onDone && <button onClick={onDone} style={{ marginLeft:8, background:'rgba(74,222,128,.15)', border:'1px solid rgba(74,222,128,.3)', color:'#4ade80', borderRadius:6, padding:'4px 12px', cursor:'pointer', fontSize:12, fontWeight:700 }}>Weiter →</button>}
        </p>
      )}
    </div>
  );
}

export default function VideoTask({ content, onReady }) {
  const videos = content?.videos || (content?.youtube_video_id ? [{ id: content.youtube_video_id, title: content.title || 'Video' }] : []);
  const tasks  = content?.tasks_after || [];

  const [vidIdx, setVidIdx]     = useState(0);
  const [allWatched, setAllWatched] = useState(false);
  const [checklist, setChecklist]   = useState({});

  if (!videos.length) return <p style={{ color:'var(--text3)' }}>Kein Video verfügbar.</p>;

  const allChecked = tasks.length === 0 || tasks.every((_, i) => checklist[i]);

  const handleVidDone = () => {
    if (vidIdx < videos.length - 1) {
      setVidIdx(vidIdx + 1);
    } else {
      setAllWatched(true);
      if (tasks.length === 0) onReady?.(true);
    }
  };

  const toggle = (i) => {
    const next = { ...checklist, [i]: !checklist[i] };
    setChecklist(next);
    if (tasks.every((_, idx) => next[idx])) onReady?.(true);
    else onReady?.(false);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* Channel / series info */}
      {content?.channel && (
        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text3)' }}>
          📺 <span style={{ color:'var(--text2)', fontWeight:600 }}>{content.channel}</span>
          {videos.length > 1 && (
            <span style={{ marginLeft:'auto', fontSize:11, color:'var(--text3)' }}>
              Video {vidIdx + 1} / {videos.length}
            </span>
          )}
        </div>
      )}

      {/* Video title */}
      {videos[vidIdx]?.title && (
        <div style={{ fontSize:13, fontWeight:700, color:'var(--text2)' }}>
          {videos[vidIdx].title}
        </div>
      )}

      {/* Notes */}
      {content?.notes && (
        <p style={{ color:'var(--text2)', fontSize:13, lineHeight:1.6, margin:0, padding:'8px 12px', background:'rgba(255,255,255,.03)', borderRadius:8, borderLeft:'3px solid rgba(124,58,237,.4)' }}>
          📌 {content.notes}
        </p>
      )}

      {/* Video player */}
      {!allWatched ? (
        <SingleVideo key={vidIdx} video={videos[vidIdx]} onDone={handleVidDone} />
      ) : (
        <>
          {/* Progress dots */}
          {videos.length > 1 && (
            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
              {videos.map((v, i) => (
                <span key={i} style={{ width:8, height:8, borderRadius:'50%', background:'#4ade80', display:'inline-block' }} />
              ))}
              <span style={{ fontSize:12, color:'#4ade80', marginLeft:4 }}>Alle Videos abgeschlossen ✓</span>
            </div>
          )}

          {/* Post-watch checklist */}
          {tasks.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              <p style={{ color:'var(--text3)', fontSize:11, fontWeight:700, letterSpacing:'0.08em', margin:0, textTransform:'uppercase' }}>
                Nach dem Video:
              </p>
              {tasks.map((t, i) => (
                <label key={i} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', padding:'8px 12px', borderRadius:8, background:checklist[i]?'rgba(124,58,237,.12)':'rgba(255,255,255,.04)', border:`1px solid ${checklist[i]?'rgba(124,58,237,.35)':'rgba(255,255,255,.08)'}`, transition:'all .2s' }}>
                  <input type="checkbox" checked={!!checklist[i]} onChange={() => toggle(i)} style={{ width:16, height:16, accentColor:'#7c3aed', cursor:'pointer', flexShrink:0 }} />
                  <span style={{ color:checklist[i]?'var(--text1)':'var(--text2)', fontSize:13 }}>{t}</span>
                </label>
              ))}
            </div>
          )}

          {tasks.length === 0 && (
            <p style={{ color:'#22c55e', fontSize:13, margin:0 }}>✓ Video abgeschlossen</p>
          )}
          {allChecked && tasks.length > 0 && (
            <p style={{ color:'#22c55e', fontSize:13, margin:0 }}>✓ Alle Aufgaben erledigt</p>
          )}
        </>
      )}
    </div>
  );
}
