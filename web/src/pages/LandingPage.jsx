import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─── tiny util ─────────────────────────────────────────────── */
function useCounter(target, duration = 1800, trigger) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const pct = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(pct * pct * target));
      if (pct < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [trigger]);
  return val;
}

const QUOTES = [
  { de: 'Kein Ausreden.', en: 'No excuses.' },
  { de: 'Kein Mitleid.', en: 'No sympathy.' },
  { de: 'Nur Ergebnisse.', en: 'Only results.' },
  { de: 'Du kannst schlafen, wenn du B2 hast.', en: 'You can sleep when you reach B2.' },
  { de: 'Ich warte.', en: "I'm waiting." },
  { de: 'Schlechter Schüler oder schlechte Ausrede?', en: 'Bad student or bad excuse?' },
];

const FEATURES = [
  {
    icon: '🎯',
    title: 'Eine Aufgabe. Kein Chaos.',
    body: 'No curriculum dump. One task per day, hand-picked. You finish it before you leave.',
  },
  {
    icon: '🔒',
    title: 'Kein Überspringen.',
    body: "The Done button is locked until you open the resource. I check. Always.",
  },
  {
    icon: '🔥',
    title: 'Streak oder Konsequenz.',
    body: 'Miss a day? You catch up before moving forward. Missed two? I am not impressed.',
  },
  {
    icon: '⚡',
    title: 'XP, Level, Abzeichen.',
    body: 'Progress is visible. You earn XP for every task. Levels are a mirror, not a trophy.',
  },
  {
    icon: '🎤',
    title: 'Ich spreche. Du hörst zu.',
    body: 'Audio instructions in German, delivered in my voice. You will learn to listen.',
  },
  {
    icon: '📱',
    title: 'Web & iOS.',
    body: 'Same experience on desktop and phone. No more excuses about "not having my laptop."',
  },
];

const DAYS = [
  { w: 1, label: 'Präsens & Modalverben',   tasks: ['Anki Deck A2', 'Easy German Ep.1', 'DW Nicos Weg', 'Grammatik: haben/sein', 'Shadowing'] },
  { w: 2, label: 'Perfekt & Dativ',          tasks: ['Perfekt Übung', 'Easy German Ep.7', 'Langsam Nachrichten', 'Dativ Sätze', 'Podcast Shadowing'] },
  { w: 3, label: 'Komparativ & Konjunktiv',  tasks: ['Anki Review', 'Jojo Staffel 2', 'DW Artikel', 'Konjunktiv II', 'Roleplay Speaking'] },
  { w: 4, label: 'Formal & Interview',       tasks: ['Business Vocab', 'Interview Übung', 'Bewerbungsbrief', 'Präsentation', 'Prüfungssim.'] },
];

const TICKER_WORDS = [
  'Grammatik','Sprechen','Hören','Lesen','Schreiben','Perfekt','Dativ','Modalverben',
  'Konjunktiv','Nominativ','Akkusativ','Vokabeln','Aussprache','Shadowing','B2','A2→B2',
];

export default function LandingPage() {
  const navigate  = useNavigate();
  const canvasRef = useRef(null);
  const statsRef  = useRef(null);
  const [statsVis, setStatsVis] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [xpDemo,  setXpDemo]   = useState(0);
  const [activeW, setActiveW]  = useState(0);

  const tasks   = useCounter(140, 1600, statsVis);
  const minutes = useCounter(87400, 2200, statsVis);
  const users   = useCounter(2847, 1800, statsVis);
  const streak  = useCounter(28, 1000, statsVis);

  /* canvas starfield */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.4 + 0.2,
      s: Math.random() * 0.4 + 0.1,
      o: Math.random(),
      dir: Math.random() > 0.5 ? 1 : -1,
    }));
    const grid = Array.from({ length: 30 }, (_, i) => i);

    const draw = () => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      /* subtle grid */
      ctx.strokeStyle = 'rgba(138,100,255,0.04)';
      ctx.lineWidth   = 1;
      const sz = 80;
      for (let x = 0; x < w + sz; x += sz) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h + sz; y += sz) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      /* stars */
      stars.forEach(s => {
        s.o += 0.005 * s.dir;
        if (s.o > 1 || s.o < 0) s.dir *= -1;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,200,255,${s.o * 0.8})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  /* quote rotation */
  useEffect(() => {
    const id = setInterval(() => setQuoteIdx(i => (i + 1) % QUOTES.length), 3200);
    return () => clearInterval(id);
  }, []);

  /* xp demo */
  useEffect(() => {
    const id = setInterval(() => setXpDemo(x => x >= 100 ? 0 : x + 1), 60);
    return () => clearInterval(id);
  }, []);

  /* stats intersection */
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVis(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav style={styles.nav}>
        <div style={styles.navLogo}>
          <span style={styles.navDot}/>
          <span>Der <strong style={{ color: '#ffd700' }}>Strenge</strong> Lehrer</span>
        </div>
        <div style={styles.navRight}>
          <a href="#method" style={styles.navLink}>Methode</a>
          <a href="#journey" style={styles.navLink}>28 Tage</a>
          <button className="nav-btn-ghost" onClick={() => navigate('/login')}>Anmelden</button>
          <button className="nav-btn-gold" onClick={() => navigate('/login')}>Jetzt beginnen</button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section style={styles.hero}>
        <canvas ref={canvasRef} style={styles.canvas}/>
        <div style={styles.heroInner}>
          {/* teacher SVG */}
          <div style={styles.teacherWrap} className="hero-teacher">
            <TeacherSVG/>
          </div>

          <div style={styles.heroText}>
            <div style={styles.eyebrow}>
              <span style={styles.eyebrowDot}/>
              A2 → B2 · 28 Tage · 140 Aufgaben
            </div>
            <h1 style={styles.h1}>
              <span className="headline-line">KEIN</span>
              <span className="headline-line gold">AUSREDEN.</span>
              <span className="headline-line">NUR DEUTSCH.</span>
            </h1>
            <p style={styles.heroSub}>
              I am not your tutor. I am not your friend.<br/>
              I am the teacher who will get you to B2 in 28 days —<br/>
              <em>whether you feel like it today or not.</em>
            </p>
            <div style={styles.heroCtas}>
              <button className="cta-gold" onClick={() => navigate('/login')}>
                Loslegen — Kostenlos
              </button>
              <a href="#journey" style={styles.ctaGhost}>Wie es funktioniert ↓</a>
            </div>
            <div style={styles.heroMeta}>
              <span className="meta-pill">🔥 Streak-System</span>
              <span className="meta-pill">⚡ XP & Level</span>
              <span className="meta-pill">📱 iOS App</span>
              <span className="meta-pill">🎤 Audio</span>
            </div>
          </div>
        </div>

        {/* quote ticker */}
        <div style={styles.quoteStrip}>
          <div className="quote-inner">
            {QUOTES.map((q, i) => (
              <span key={i} style={styles.quoteTick}>
                <span style={{ color: '#ffd700' }}>„{q.de}"</span>
                <span style={{ color: '#44446a', margin: '0 28px' }}>—</span>
                <span style={{ color: '#7a7a9e', fontStyle: 'italic' }}>{q.en}</span>
              </span>
            ))}
            {QUOTES.map((q, i) => (
              <span key={`r${i}`} style={styles.quoteTick}>
                <span style={{ color: '#ffd700' }}>„{q.de}"</span>
                <span style={{ color: '#44446a', margin: '0 28px' }}>—</span>
                <span style={{ color: '#7a7a9e', fontStyle: 'italic' }}>{q.en}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORD TICKER ─────────────────────────────────────── */}
      <div style={styles.ticker}>
        <div className="ticker-inner">
          {[...TICKER_WORDS, ...TICKER_WORDS].map((w, i) => (
            <span key={i} style={styles.tickerWord}>
              {w} <span style={{ color: '#b06aff', margin: '0 16px' }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── METHOD ──────────────────────────────────────────── */}
      <section id="method" style={styles.section}>
        <div style={styles.container}>
          <div style={styles.sectionHead}>
            <div style={styles.sectionEye}>METHODE</div>
            <h2 style={styles.h2}>
              Warum so streng?<br/>
              <span style={{ color: '#b06aff' }}>Weil nett nicht funktioniert.</span>
            </h2>
            <p style={styles.sectionSub}>
              Every language app makes learning comfortable. That is precisely why they fail.
              Comfort is the enemy of fluency. This is the uncomfortable truth.
            </p>
          </div>

          <div style={styles.featureGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.08}s` }}>
                <div style={styles.featureIcon}>{f.icon}</div>
                <h3 style={styles.featureTitle}>{f.title}</h3>
                <p style={styles.featureBody}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GAME MECHANICS ──────────────────────────────────── */}
      <section style={{ ...styles.section, background: 'rgba(14,14,40,0.6)' }}>
        <div style={styles.container}>
          <div style={styles.sectionHead}>
            <div style={styles.sectionEye}>GAMIFICATION</div>
            <h2 style={styles.h2}>Lernen wie ein Spiel.<br/><span style={{ color: '#ffd700' }}>Fühlen wie Arbeit.</span></h2>
          </div>

          <div style={styles.mechanicsGrid}>
            {/* XP demo */}
            <div style={styles.mechCard}>
              <div style={styles.mechLabel}>XP & LEVEL</div>
              <div style={styles.xpLevel}>
                <div style={styles.levelBadge}>Lv.{Math.floor(xpDemo / 20) + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={styles.xpBarTrack}>
                    <div className="xp-fill-demo" style={{ width: `${xpDemo % 20 * 5}%` }}/>
                  </div>
                  <div style={styles.xpCaption}>{xpDemo * 5} / 2000 XP</div>
                </div>
              </div>
              <div style={styles.xpTaskRow}>
                {[
                  { t: 'Anki', xp: '+10 XP', c: '#b06aff' },
                  { t: 'Video', xp: '+15 XP', c: '#00e676' },
                  { t: 'Lesen', xp: '+20 XP', c: '#ffd700' },
                  { t: 'Grammatik', xp: '+25 XP', c: '#4d9fff' },
                  { t: 'Sprechen', xp: '+20 XP', c: '#ff4d6a' },
                ].map(x => (
                  <div key={x.t} style={{ ...styles.xpChip, borderColor: x.c + '44', color: x.c }}>
                    <span style={{ fontSize: 11, fontWeight: 700 }}>{x.t}</span>
                    <span style={{ fontSize: 13, fontWeight: 900 }}>{x.xp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Streak */}
            <div style={styles.mechCard}>
              <div style={styles.mechLabel}>STREAK SYSTEM</div>
              <div style={styles.streakDisplay}>
                <div style={styles.streakNum}>🔥 {7}</div>
                <div style={styles.streakSub}>Tage in Folge</div>
              </div>
              <div style={styles.streakDots}>
                {Array.from({ length: 28 }, (_, i) => (
                  <div key={i} className={`streak-dot ${i < 7 ? 'done' : i === 7 ? 'today' : ''}`}/>
                ))}
              </div>
              <p style={styles.mechNote}>Miss a day? You catch up first. No shortcuts.</p>
            </div>

            {/* Task gating */}
            <div style={styles.mechCard}>
              <div style={styles.mechLabel}>TASK GATING</div>
              <div style={styles.gateDemo}>
                <div style={styles.gateStep}>
                  <div style={styles.gateNum}>1</div>
                  <div>
                    <div style={styles.gateTitle}>Aufgabe lesen</div>
                    <div style={styles.gateSub}>Ich erkläre. Du hörst zu.</div>
                  </div>
                </div>
                <div style={styles.gateLine}/>
                <div style={styles.gateStep}>
                  <div style={styles.gateNum}>2</div>
                  <div>
                    <div style={styles.gateTitle}>Ressource öffnen</div>
                    <div style={styles.gateSub}>Link klicken. Pflicht, nicht optional.</div>
                  </div>
                </div>
                <div style={styles.gateLine}/>
                <div style={styles.gateStep}>
                  <div style={{ ...styles.gateNum, background: 'linear-gradient(135deg,#ffd700,#ff9800)', color: '#000' }}>3</div>
                  <div>
                    <div style={styles.gateTitle}>„Erledigt" freischalten</div>
                    <div style={styles.gateSub}>Button entsperrt. Nächste Aufgabe.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 28-DAY JOURNEY ──────────────────────────────────── */}
      <section id="journey" style={styles.section}>
        <div style={styles.container}>
          <div style={styles.sectionHead}>
            <div style={styles.sectionEye}>28 TAGE</div>
            <h2 style={styles.h2}>Vier Wochen.<br/><span style={{ color: '#4d9fff' }}>Vier Schlachten.</span></h2>
            <p style={styles.sectionSub}>
              Each week targets a grammar system. Five tasks per day.
              By day 28, you are not the same student you were on day one.
            </p>
          </div>

          <div style={styles.weekTabs}>
            {DAYS.map((w, i) => (
              <button
                key={i}
                className={`week-tab ${activeW === i ? 'active' : ''}`}
                onClick={() => setActiveW(i)}
              >
                Woche {w.w}
              </button>
            ))}
          </div>

          <div style={styles.weekContent}>
            <div style={styles.weekLabel}>{DAYS[activeW].label}</div>
            <div style={styles.weekTaskGrid}>
              {DAYS[activeW].tasks.map((t, i) => (
                <div key={i} className="week-task">
                  <span style={{ color: ['#b06aff','#00e676','#ffd700','#4d9fff','#ff4d6a'][i], fontSize: 18 }}>
                    {['🃏','📺','📖','✏️','🎤'][i]}
                  </span>
                  <span style={{ flex: 1, fontSize: 14, color: '#eeeeff' }}>{t}</span>
                  <span style={{ fontSize: 11, color: '#44446a' }}>
                    +{[10,15,20,25,20][i]} XP
                  </span>
                </div>
              ))}
            </div>
            <div style={styles.weekProgress}>
              {Array.from({ length: 7 }, (_, d) => (
                <div key={d} style={styles.dayCell} className={d < 3 ? 'day-done' : d === 3 ? 'day-today' : ''}>
                  <div style={styles.dayNum2}>Tag {(activeW * 7) + d + 1}</div>
                  <div style={styles.dayBar} className={d < 3 ? 'bar-done' : d === 3 ? 'bar-active' : ''}/>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TEACHER QUOTE ───────────────────────────────────── */}
      <section style={{ ...styles.section, padding: '60px 0', overflow: 'hidden' }}>
        <div style={styles.quoteBlock}>
          <div style={styles.quoteAvatar}><TeacherSVGSmall/></div>
          <div style={styles.quoteBig}>
            <div className="quote-cycle" key={quoteIdx}>
              „{QUOTES[quoteIdx].de}"
            </div>
            <div style={styles.quoteTrans}>{QUOTES[quoteIdx].en}</div>
            <div style={styles.quoteSource}>— Der Strenge Lehrer</div>
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────── */}
      <section style={{ ...styles.section, background: 'rgba(14,14,40,0.6)' }} ref={statsRef}>
        <div style={styles.container}>
          <div style={styles.sectionHead}>
            <div style={styles.sectionEye}>ZAHLEN</div>
            <h2 style={styles.h2}>Die Zahlen lügen nicht.</h2>
          </div>
          <div style={styles.statsGrid}>
            {[
              { n: tasks,   suf: '',  label: 'Aufgaben',       note: 'across 28 days' },
              { n: minutes, suf: '',  label: 'Lernminuten',    note: 'logged so far' },
              { n: users,   suf: '+', label: 'Schüler',        note: 'currently learning' },
              { n: streak,  suf: '',  label: 'Max Streak',     note: 'days in a row' },
            ].map(({ n, suf, label, note }) => (
              <div key={label} style={styles.statCell}>
                <div style={styles.statNum}>{n.toLocaleString('de-DE')}{suf}</div>
                <div style={styles.statLabel}>{label}</div>
                <div style={styles.statNote}>{note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────── */}
      <section style={styles.ctaSection}>
        <canvas style={{ ...styles.canvas, opacity: 0.4 }}/>
        <div style={styles.ctaInner}>
          <div style={styles.ctaEye}>BEREIT?</div>
          <h2 style={styles.ctaBig}>
            Tag 1 wartet.<br/>
            <span style={{ color: '#ffd700' }}>Du auch?</span>
          </h2>
          <p style={styles.ctaSub}>
            Free to start. No credit card. Just German.<br/>
            The teacher is already disappointed — prove him wrong.
          </p>
          <button className="cta-gold cta-large" onClick={() => navigate('/login')}>
            Jetzt beginnen — Kostenlos
          </button>
          <div style={styles.ctaMeta}>
            28 Tage · 140 Aufgaben · A2 → B2
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerLogo}>
            Der <strong style={{ color: '#ffd700' }}>Strenge</strong> Lehrer
          </div>
          <div style={styles.footerLinks}>
            <button onClick={() => navigate('/login')} style={styles.footerLink}>Anmelden</button>
            <a href="https://github.com" style={styles.footerLink}>Open Source</a>
            <span style={styles.footerLink}>MIT Lizenz</span>
          </div>
          <div style={styles.footerNote}>
            „Schlechte Schüler gibt es nicht — nur schlechte Ausreden."
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Teacher SVG ────────────────────────────────────────────── */
function TeacherSVG() {
  return (
    <svg viewBox="0 0 160 200" width="160" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd700" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#ffd700" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {/* glow */}
      <circle cx="80" cy="80" r="70" fill="url(#glow1)"/>
      {/* body / suit */}
      <rect x="30" y="130" width="100" height="70" rx="8" fill="#1a1a3e"/>
      <rect x="60" y="130" width="40" height="70" fill="#141430"/>
      {/* tie */}
      <polygon points="80,135 75,155 80,165 85,155" fill="#ffd700"/>
      {/* head */}
      <ellipse cx="80" cy="90" rx="38" ry="42" fill="#f0c070"/>
      {/* hair */}
      <ellipse cx="80" cy="52" rx="38" ry="16" fill="#222"/>
      {/* glasses frame */}
      <rect x="48" y="82" width="22" height="14" rx="4" fill="none" stroke="#222" strokeWidth="2.5"/>
      <rect x="90" y="82" width="22" height="14" rx="4" fill="none" stroke="#222" strokeWidth="2.5"/>
      <line x1="70" y1="89" x2="90" y2="89" stroke="#222" strokeWidth="2"/>
      {/* eyes */}
      <ellipse cx="59" cy="89" rx="6" ry="5" fill="#fff"/>
      <ellipse cx="101" cy="89" rx="6" ry="5" fill="#fff"/>
      <circle cx="60" cy="90" r="3" fill="#111"/>
      <circle cx="102" cy="90" r="3" fill="#111"/>
      {/* eyebrows — stern */}
      <line x1="49" y1="78" x2="70" y2="80" stroke="#222" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="90" y1="80" x2="111" y2="78" stroke="#222" strokeWidth="2.5" strokeLinecap="round"/>
      {/* mouth — thin stern line */}
      <path d="M66 108 Q80 105 94 108" fill="none" stroke="#9a7050" strokeWidth="2" strokeLinecap="round"/>
      {/* ear */}
      <ellipse cx="42" cy="92" rx="5" ry="7" fill="#e8b860"/>
      <ellipse cx="118" cy="92" rx="5" ry="7" fill="#e8b860"/>
      {/* pointing arm */}
      <line x1="130" y1="145" x2="158" y2="115" stroke="#1a1a3e" strokeWidth="10" strokeLinecap="round"/>
      <circle cx="158" cy="113" r="6" fill="#f0c070"/>
    </svg>
  );
}

function TeacherSVGSmall() {
  return (
    <svg viewBox="0 0 80 100" width="80" height="100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="40" cy="45" rx="19" ry="21" fill="#f0c070"/>
      <ellipse cx="40" cy="26" rx="19" ry="8" fill="#222"/>
      <rect x="24" y="41" width="11" height="7" rx="2" fill="none" stroke="#222" strokeWidth="1.5"/>
      <rect x="45" y="41" width="11" height="7" rx="2" fill="none" stroke="#222" strokeWidth="1.5"/>
      <line x1="35" y1="44" x2="45" y2="44" stroke="#222" strokeWidth="1.2"/>
      <circle cx="29.5" cy="45" r="2.5" fill="#111"/>
      <circle cx="50.5" cy="45" r="2.5" fill="#111"/>
      <path d="M33 55 Q40 53 47 55" fill="none" stroke="#9a7050" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="15" y="65" width="50" height="35" rx="4" fill="#1a1a3e"/>
      <rect x="30" y="65" width="20" height="35" fill="#141430"/>
      <polygon points="40,68 37.5,78 40,83 42.5,78" fill="#ffd700"/>
    </svg>
  );
}

/* ─── Styles ─────────────────────────────────────────────────── */
const styles = {
  root: {
    background: '#050510',
    color: '#eeeeff',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    overflowX: 'hidden',
    minHeight: '100vh',
  },

  /* NAV */
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 32px',
    background: 'rgba(5,5,16,0.88)',
    backdropFilter: 'blur(18px)',
    borderBottom: '1px solid rgba(138,100,255,0.12)',
  },
  navLogo: {
    display: 'flex', alignItems: 'center', gap: 10,
    fontSize: 17, fontWeight: 800, letterSpacing: '-.01em',
  },
  navDot: {
    width: 8, height: 8, borderRadius: '50%',
    background: '#ffd700', boxShadow: '0 0 10px #ffd700',
    display: 'inline-block',
  },
  navRight: { display: 'flex', alignItems: 'center', gap: 20 },
  navLink: {
    color: '#7a7a9e', fontSize: 13, fontWeight: 600,
    textDecoration: 'none', transition: 'color .2s',
  },

  /* HERO */
  hero: { position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  canvas: { position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' },
  heroInner: {
    position: 'relative', zIndex: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 60, padding: '140px 32px 60px',
    maxWidth: 1100, margin: '0 auto', width: '100%',
    flexWrap: 'wrap',
  },
  teacherWrap: { flexShrink: 0 },
  heroText: { maxWidth: 580 },
  eyebrow: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    fontSize: 11, fontWeight: 800, letterSpacing: '.12em',
    textTransform: 'uppercase', color: '#7a7a9e',
    marginBottom: 20,
    border: '1px solid rgba(138,100,255,.2)',
    borderRadius: 20, padding: '5px 14px',
    background: 'rgba(138,100,255,.06)',
  },
  eyebrowDot: {
    width: 6, height: 6, borderRadius: '50%',
    background: '#00e676', boxShadow: '0 0 8px #00e676',
    display: 'inline-block',
  },
  h1: {
    display: 'flex', flexDirection: 'column',
    margin: '0 0 20px',
    lineHeight: 1,
  },
  heroSub: {
    fontSize: 16, lineHeight: 1.75, color: '#8888bb',
    marginBottom: 32, maxWidth: 480,
  },
  heroCtas: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, flexWrap: 'wrap' },
  ctaGhost: {
    fontSize: 14, fontWeight: 700, color: '#7a7a9e',
    textDecoration: 'none', transition: 'color .2s',
  },
  heroMeta: { display: 'flex', gap: 8, flexWrap: 'wrap' },

  /* QUOTE STRIP */
  quoteStrip: {
    position: 'relative', zIndex: 1,
    borderTop: '1px solid rgba(138,100,255,.1)',
    borderBottom: '1px solid rgba(138,100,255,.1)',
    background: 'rgba(14,14,40,.6)',
    overflow: 'hidden', padding: '14px 0',
  },
  quoteTick: {
    display: 'inline-flex', alignItems: 'center',
    fontSize: 13, fontWeight: 600,
    marginRight: 0, whiteSpace: 'nowrap',
    padding: '0 32px',
  },

  /* TICKER */
  ticker: {
    borderBottom: '1px solid rgba(138,100,255,.08)',
    background: 'rgba(176,106,255,.04)',
    overflow: 'hidden', padding: '10px 0',
  },
  tickerWord: {
    fontSize: 12, fontWeight: 800, letterSpacing: '.1em',
    textTransform: 'uppercase', color: '#44446a',
    whiteSpace: 'nowrap',
  },

  /* SECTION */
  section: { padding: '100px 0', position: 'relative' },
  container: { maxWidth: 1100, margin: '0 auto', padding: '0 32px' },
  sectionHead: { textAlign: 'center', marginBottom: 64 },
  sectionEye: {
    fontSize: 11, fontWeight: 900, letterSpacing: '.16em',
    textTransform: 'uppercase', color: '#b06aff',
    marginBottom: 16,
  },
  h2: {
    fontSize: 'clamp(28px, 5vw, 48px)',
    fontWeight: 900, lineHeight: 1.15,
    margin: '0 0 16px',
    textWrap: 'balance',
  },
  sectionSub: {
    fontSize: 16, color: '#7a7a9e', lineHeight: 1.75,
    maxWidth: 520, margin: '0 auto',
  },

  /* FEATURES */
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 20,
  },
  featureIcon: { fontSize: 32, marginBottom: 14 },
  featureTitle: {
    fontSize: 17, fontWeight: 900, marginBottom: 10,
    color: '#eeeeff', letterSpacing: '-.01em',
  },
  featureBody: { fontSize: 14, color: '#7a7a9e', lineHeight: 1.75 },

  /* MECHANICS */
  mechanicsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 20,
  },
  mechCard: {
    background: 'rgba(14,14,40,.9)',
    border: '1px solid rgba(138,100,255,.18)',
    borderRadius: 20, padding: 24,
  },
  mechLabel: {
    fontSize: 11, fontWeight: 900, letterSpacing: '.14em',
    color: '#44446a', marginBottom: 20, textTransform: 'uppercase',
  },
  xpLevel: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
  levelBadge: {
    background: 'linear-gradient(135deg,#7c3aed,#2979ff)',
    borderRadius: 20, padding: '4px 14px',
    fontSize: 13, fontWeight: 900, color: '#fff',
    whiteSpace: 'nowrap',
  },
  xpBarTrack: {
    height: 8, background: 'rgba(255,255,255,.06)',
    borderRadius: 4, overflow: 'hidden', marginBottom: 6,
  },
  xpCaption: { fontSize: 11, color: '#44446a', fontVariantNumeric: 'tabular-nums' },
  xpTaskRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  xpChip: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '8px 12px', borderRadius: 10, border: '1px solid',
    background: 'rgba(255,255,255,.03)', gap: 2,
  },
  streakDisplay: { textAlign: 'center', margin: '16px 0 20px' },
  streakNum: { fontSize: 48, fontWeight: 900, lineHeight: 1 },
  streakSub: { fontSize: 13, color: '#7a7a9e', marginTop: 4 },
  streakDots: { display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 },
  mechNote: { fontSize: 13, color: '#44446a', fontStyle: 'italic', lineHeight: 1.6 },
  gateDemo: { display: 'flex', flexDirection: 'column', gap: 0 },
  gateStep: { display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 0' },
  gateNum: {
    width: 28, height: 28, borderRadius: '50%',
    background: 'rgba(138,100,255,.15)',
    border: '1px solid rgba(138,100,255,.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 900, color: '#b06aff',
    flexShrink: 0,
  },
  gateTitle: { fontSize: 14, fontWeight: 800, marginBottom: 2 },
  gateSub: { fontSize: 12, color: '#7a7a9e' },
  gateLine: { width: 1, height: 12, background: 'rgba(138,100,255,.2)', marginLeft: 13 },

  /* JOURNEY */
  weekTabs: { display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' },
  weekContent: {
    background: 'rgba(14,14,40,.9)',
    border: '1px solid rgba(138,100,255,.18)',
    borderRadius: 20, padding: 28,
  },
  weekLabel: {
    fontSize: 12, fontWeight: 900, letterSpacing: '.1em',
    textTransform: 'uppercase', color: '#4d9fff', marginBottom: 20,
  },
  weekTaskGrid: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 },
  weekProgress: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  dayCell: { display: 'flex', flexDirection: 'column', gap: 5, flex: 1, minWidth: 60 },
  dayNum2: { fontSize: 10, color: '#44446a', textAlign: 'center' },
  dayBar: { height: 4, borderRadius: 2, background: 'rgba(255,255,255,.08)' },

  /* QUOTE BLOCK */
  quoteBlock: {
    maxWidth: 900, margin: '0 auto', padding: '0 32px',
    display: 'flex', alignItems: 'center', gap: 40,
  },
  quoteAvatar: { flexShrink: 0 },
  quoteBig: { flex: 1 },
  quoteTrans: { fontSize: 16, color: '#7a7a9e', fontStyle: 'italic', marginTop: 12, lineHeight: 1.6 },
  quoteSource: { fontSize: 12, color: '#44446a', marginTop: 12, letterSpacing: '.08em' },

  /* STATS */
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 20,
  },
  statCell: {
    background: 'rgba(14,14,40,.9)',
    border: '1px solid rgba(138,100,255,.18)',
    borderRadius: 20, padding: '28px 20px',
    textAlign: 'center',
  },
  statNum: {
    fontSize: 44, fontWeight: 900, lineHeight: 1,
    background: 'linear-gradient(135deg,#ffd700,#ff9800)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    fontVariantNumeric: 'tabular-nums', marginBottom: 8,
  },
  statLabel: { fontSize: 14, fontWeight: 800, color: '#eeeeff', marginBottom: 4 },
  statNote:  { fontSize: 12, color: '#44446a' },

  /* CTA SECTION */
  ctaSection: {
    position: 'relative', padding: '120px 32px',
    textAlign: 'center', overflow: 'hidden',
    background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(176,106,255,.1) 0%, transparent 70%)',
  },
  ctaInner: { position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' },
  ctaEye: {
    fontSize: 11, fontWeight: 900, letterSpacing: '.16em',
    color: '#b06aff', marginBottom: 20, textTransform: 'uppercase',
  },
  ctaBig: { fontSize: 'clamp(32px,6vw,64px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20 },
  ctaSub: { fontSize: 16, color: '#7a7a9e', lineHeight: 1.75, marginBottom: 40 },
  ctaMeta: { fontSize: 12, color: '#44446a', marginTop: 20, letterSpacing: '.06em' },

  /* FOOTER */
  footer: {
    borderTop: '1px solid rgba(138,100,255,.1)',
    padding: '40px 32px',
    background: '#030308',
  },
  footerInner: {
    maxWidth: 1100, margin: '0 auto',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', flexWrap: 'wrap', gap: 20,
  },
  footerLogo: { fontSize: 16, fontWeight: 800 },
  footerLinks: { display: 'flex', gap: 24, alignItems: 'center' },
  footerLink: {
    fontSize: 13, color: '#44446a', background: 'none', border: 'none',
    cursor: 'pointer', textDecoration: 'none', transition: 'color .2s',
  },
  footerNote: { fontSize: 12, color: '#2a2a4a', fontStyle: 'italic', textAlign: 'right' },
};

/* ─── CSS-in-JS block ─────────────────────────────────────────── */
const css = `
  /* Headline display treatment — condensed compression */
  .headline-line {
    display: block;
    font-family: Impact, 'Arial Black', 'Haettenschweiler', sans-serif;
    font-size: clamp(52px, 9vw, 96px);
    font-weight: 900;
    letter-spacing: .01em;
    color: #eeeeff;
    transform: scaleX(0.84);
    transform-origin: left;
    line-height: 0.95;
  }
  .headline-line.gold {
    color: #ffd700;
    text-shadow: 0 0 40px rgba(255,215,0,.4);
  }

  /* Buttons */
  .nav-btn-ghost {
    background: transparent;
    border: 1px solid rgba(255,255,255,.15);
    border-radius: 8px;
    color: #7a7a9e;
    font-size: 13px;
    font-weight: 700;
    padding: 8px 16px;
    cursor: pointer;
    transition: all .2s;
    font-family: inherit;
  }
  .nav-btn-ghost:hover { border-color: rgba(255,255,255,.35); color: #eeeeff; }

  .nav-btn-gold {
    background: linear-gradient(135deg, #ffd700, #ff9800);
    border: none;
    border-radius: 8px;
    color: #080808;
    font-size: 13px;
    font-weight: 900;
    padding: 9px 18px;
    cursor: pointer;
    transition: all .25s;
    font-family: inherit;
  }
  .nav-btn-gold:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(255,215,0,.35); }

  .cta-gold {
    background: linear-gradient(135deg, #ffd700, #ffaa00, #ff9800);
    border: none;
    border-radius: 14px;
    color: #080808;
    font-size: 16px;
    font-weight: 900;
    padding: 16px 32px;
    cursor: pointer;
    transition: all .25s;
    font-family: inherit;
    letter-spacing: .01em;
    position: relative;
    overflow: hidden;
  }
  .cta-gold::before {
    content: '';
    position: absolute;
    top: -50%; left: -60%; width: 30%; height: 200%;
    background: rgba(255,255,255,.25);
    transform: skewX(-20deg);
    transition: left .45s;
  }
  .cta-gold:hover::before { left: 130%; }
  .cta-gold:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(255,215,0,.4); }
  .cta-large { font-size: 18px; padding: 20px 48px; border-radius: 16px; }

  /* Feature cards */
  .feature-card {
    background: rgba(14,14,40,.9);
    border: 1px solid rgba(138,100,255,.18);
    border-radius: 20px;
    padding: 28px 24px;
    transition: transform .25s, border-color .25s, box-shadow .25s;
  }
  .feature-card:hover {
    transform: translateY(-4px);
    border-color: rgba(176,106,255,.4);
    box-shadow: 0 20px 50px rgba(176,106,255,.1);
  }

  /* XP fill */
  .xp-fill-demo {
    height: 100%;
    background: linear-gradient(90deg, #7c3aed, #b06aff, #00e5ff);
    border-radius: 4px;
    transition: width .3s ease;
    position: relative;
  }
  .xp-fill-demo::after {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 16px; height: 100%;
    background: rgba(255,255,255,.6);
    filter: blur(4px);
  }

  /* Streak dots */
  .streak-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    background: rgba(255,255,255,.08);
    border: 1px solid rgba(138,100,255,.2);
  }
  .streak-dot.done { background: #00e676; border-color: #00e676; box-shadow: 0 0 6px rgba(0,230,118,.5); }
  .streak-dot.today { background: #ffd700; border-color: #ffd700; box-shadow: 0 0 8px rgba(255,215,0,.6); animation: pulse-dot 1.5s ease-in-out infinite; }
  @keyframes pulse-dot { 0%,100%{box-shadow:0 0 6px rgba(255,215,0,.4)} 50%{box-shadow:0 0 16px rgba(255,215,0,.8)} }

  /* Week tasks */
  .week-task {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 16px;
    border-radius: 12px;
    background: rgba(255,255,255,.03);
    border: 1px solid rgba(138,100,255,.1);
    transition: background .2s;
  }
  .week-task:hover { background: rgba(255,255,255,.06); }

  /* Week tabs */
  .week-tab {
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(138,100,255,.18);
    border-radius: 10px;
    padding: 10px 20px;
    color: #7a7a9e;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all .2s;
    font-family: inherit;
  }
  .week-tab:hover { border-color: rgba(138,100,255,.4); color: #eeeeff; }
  .week-tab.active { background: rgba(77,159,255,.12); border-color: rgba(77,159,255,.45); color: #4d9fff; }

  /* Day bars */
  .bar-done   { background: #00e676 !important; }
  .bar-active { background: linear-gradient(90deg,#ffd700,#ff9800) !important; }
  .day-done .day-bar { box-shadow: 0 0 8px rgba(0,230,118,.4); }
  .day-today .day-bar { animation: pulse-dot 2s ease-in-out infinite; }

  /* Quote animation */
  .quote-cycle {
    font-size: clamp(28px, 5vw, 52px);
    font-weight: 900;
    color: #ffd700;
    line-height: 1.2;
    animation: fadeSlide .4s ease both;
    font-family: Impact, 'Arial Black', sans-serif;
    transform: scaleX(0.86);
    transform-origin: left;
  }
  @keyframes fadeSlide { from{opacity:0;transform:scaleX(.86) translateY(10px)} to{opacity:1;transform:scaleX(.86) translateY(0)} }

  /* Scrolling tickers */
  .quote-inner {
    display: inline-flex;
    white-space: nowrap;
    animation: scrollLeft 30s linear infinite;
  }
  .ticker-inner {
    display: inline-flex;
    white-space: nowrap;
    animation: scrollLeft 18s linear infinite;
  }
  @keyframes scrollLeft { from{transform:translateX(0)} to{transform:translateX(-50%)} }

  /* Hero teacher float */
  .hero-teacher { animation: floatTeacher 5s ease-in-out infinite; }
  @keyframes floatTeacher { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }

  /* Meta pills */
  .meta-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(138,100,255,.18);
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    color: #7a7a9e;
  }

  /* Hover links */
  .footerLink:hover, a[style]:hover { color: #eeeeff !important; }
  a:hover { color: #eeeeff; }

  @media (max-width: 700px) {
    .headline-line { font-size: 52px !important; }
    .quote-cycle { font-size: 28px !important; }
  }
  @media (prefers-reduced-motion: reduce) {
    .hero-teacher, .quote-cycle, .quote-inner, .ticker-inner, .streak-dot.today { animation: none !important; }
  }
`;
