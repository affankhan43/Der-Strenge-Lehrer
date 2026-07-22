import { useEffect, useRef, useState } from 'react';
import api from '../lib/api';
import { useProgressStore } from '../store/progressStore';
import s from './ReelsPage.module.css';

const PLATFORM_META = {
  youtube:   { icon: '▶', label: 'YouTube',   color: '#ff4444' },
  instagram: { icon: '◈', label: 'Instagram', color: '#e1306c' },
  tiktok:    { icon: '♪', label: 'TikTok',    color: '#69c9d0' },
};
const LEVEL_COLORS = {
  'A1.1':'#22c55e','A1.2':'#10b981','A2.1':'#3b82f6','A2.2':'#6366f1',
  'B1.1':'#a855f7','B1.2':'#ec4899','B2.1':'#f59e0b','B2.2':'#ef4444',
};
const LEVEL_MAP = ['A1.1','A1.2','A2.1','A2.2','B1.1','B1.2','B2.1','B2.2'];


function embedUrl(reel, active) {
  if (!active) return null;
  if (reel.platform === 'youtube')
    return `https://www.youtube.com/embed/${reel.videoId}?rel=0&modestbranding=1&playsinline=1&autoplay=1&mute=1&loop=1&playlist=${reel.videoId}`;
  if (reel.platform === 'instagram')
    return `https://www.instagram.com/p/${reel.videoId}/embed/`;
  if (reel.platform === 'tiktok')
    return `https://www.tiktok.com/embed/v2/${reel.videoId}`;
  return null;
}

function ReelCard({ reel, isActive }) {
  const [loaded, setLoaded] = useState(false);
  const [muted, setMuted]   = useState(true);
  const pm = PLATFORM_META[reel.platform] || PLATFORM_META.youtube;
  const lc = LEVEL_COLORS[reel.level] || '#a78bfa';
  const url  = embedUrl(reel, isActive);

  useEffect(() => { if (!isActive) setLoaded(false); }, [isActive]);

  return (
    <div className={s.reel}>
      {/* Ambient glow matches platform */}
      <div className={s.reelGlow} style={{ background: pm.color }} />

      {/* ── Embed wrapper ── */}
      <div className={s.embedWrap}>
        {/* Loader */}
        {isActive && !loaded && (
          <div className={s.embedLoader}><div className={s.spinner} /></div>
        )}

        {url && (
          <iframe
            /* key forces remount on activate → triggers autoplay */
            key={isActive ? `${reel._id}-on` : `${reel._id}-off`}
            src={url}
            title={reel.title || 'Reel'}
            className={s.iframe}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setLoaded(true)}
          />
        )}

        {/* YouTube mute hint + unmute tap zone */}
        {isActive && loaded && (reel.platform === 'youtube' || reel.platform === 'tiktok') && muted && (
          <button className={s.unmuteBtn} onClick={() => setMuted(false)}>
            🔇 Tippen zum Entstummen
          </button>
        )}
      </div>

      {/* ── Top badges ── */}
      <div className={s.reelTop}>
        <span className={s.platformBadge} style={{ background:pm.color+'22', borderColor:pm.color+'55', color:pm.color }}>
          {pm.icon} {pm.label}
        </span>
        <span className={s.levelBadge} style={{ background:lc+'22', borderColor:lc+'55', color:lc }}>
          {reel.level}
        </span>
      </div>

      {/* ── Bottom info ── */}
      {(reel.title || reel.description) && (
        <div className={s.reelBottom}>
          {reel.title       && <div className={s.reelTitle}>{reel.title}</div>}
          {reel.description && <div className={s.reelDesc}>{reel.description}</div>}
        </div>
      )}
    </div>
  );
}

export default function ReelsPage() {
  const { progress }           = useProgressStore();
  const [reels, setReels]      = useState([]);
  const [loading, setLoading]  = useState(true);
  const [activeIdx, setActive] = useState(0);
  const [levelFilter, setLevel]= useState(null);
  const containerRef           = useRef(null);
  const observerRef            = useRef(null);

  const userLevel = progress?.currentLevel || 'A1.1';
  useEffect(() => { setLevel(userLevel); }, [userLevel]);
  useEffect(() => { if (levelFilter) loadReels(levelFilter); }, [levelFilter]);

  const loadReels = async (lv) => {
    setLoading(true); setActive(0);
    try {
      const res = await api.get(`/api/reels?level=${lv}`);
      setReels(res.data.reels || []);
    } catch { setReels([]); }
    setLoading(false);
  };

  useEffect(() => {
    if (!containerRef.current || !reels.length) return;
    observerRef.current?.disconnect();
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idx = parseInt(e.target.dataset.idx);
            if (!isNaN(idx)) setActive(idx);
          }
        });
      },
      { root: containerRef.current, threshold: 0.55 }
    );
    containerRef.current.querySelectorAll('[data-idx]').forEach(el => obs.observe(el));
    observerRef.current = obs;
    return () => obs.disconnect();
  }, [reels]);

  const scrollTo = (idx) => {
    containerRef.current?.querySelector(`[data-idx="${idx}"]`)
      ?.scrollIntoView({ behavior:'smooth', block:'start' });
  };

  return (
    <div className={s.page}>
      {/* Level filter strip */}
      <div className={s.levelStrip}>
        <span className={s.stripLabel}>Level:</span>
        {LEVEL_MAP.map(lv => (
          <button key={lv}
            className={s.lvBtn + (levelFilter===lv ? ' '+s.lvBtnActive : '')}
            style={{ '--lv': LEVEL_COLORS[lv] }}
            onClick={() => setLevel(lv)}>
            {lv}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={s.empty}>
          <div className={s.spinner} style={{ width:36, height:36 }} />
          <span>Lade Reels…</span>
        </div>
      ) : reels.length === 0 ? (
        <div className={s.empty}>
          <div style={{ fontSize:'3rem' }}>🎬</div>
          <div className={s.emptyTitle}>Keine Reels für {levelFilter}</div>
          <div className={s.emptySub}>Der Admin fügt bald Videos für dieses Level hinzu.</div>
        </div>
      ) : (
        <div className={s.feed} ref={containerRef}>
          {reels.map((reel, idx) => (
            <div key={reel._id} data-idx={idx} className={s.reelSlot}>
              <ReelCard reel={reel} isActive={activeIdx === idx} />
            </div>
          ))}

          {/* Dot rail */}
          <div className={s.dots}>
            {reels.map((_, idx) => (
              <button key={idx}
                className={s.dot + (activeIdx===idx ? ' '+s.dotActive : '')}
                onClick={() => scrollTo(idx)} />
            ))}
          </div>

          {/* Arrows */}
          <div className={s.navArrows}>
            <button className={s.arrow} disabled={activeIdx===0} onClick={() => scrollTo(activeIdx-1)}>↑</button>
            <span className={s.arrowCount}>{activeIdx+1}/{reels.length}</span>
            <button className={s.arrow} disabled={activeIdx===reels.length-1} onClick={() => scrollTo(activeIdx+1)}>↓</button>
          </div>
        </div>
      )}
    </div>
  );
}
