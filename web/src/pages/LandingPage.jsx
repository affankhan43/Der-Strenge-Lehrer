import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

/* ── data ─────────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: '🎯', title: 'Eine Aufgabe. Kein Chaos.', body: 'No curriculum dump. One task per day, hand-picked. You finish it before you leave.' },
  { icon: '🔒', title: 'Kein Überspringen.', body: 'The Done button is locked until you open the resource. I check. Always.' },
  { icon: '🔥', title: 'Streak oder Konsequenz.', body: "Miss a day? You catch up before moving forward. Missed two? I am not impressed." },
  { icon: '⚡', title: 'XP, Level, Abzeichen.', body: 'Progress is visible. You earn XP for every task. Levels are a mirror, not a trophy.' },
  { icon: '🎤', title: 'Ich spreche. Du hörst zu.', body: 'Audio instructions in German, delivered in my voice. You will learn to listen.' },
  { icon: '📱', title: 'Web & iOS.', body: 'Same experience on desktop and phone. No more excuses about "not having my laptop."' },
];

const STREAK_DOTS = Array.from({ length: 28 }, (_, i) => {
  const green = i < 6, cur = i === 6, filled = green || cur;
  return {
    color: green ? '#22e08a' : cur ? '#ffd60a' : 'rgba(148,163,255,0.16)',
    glow: cur ? '0 0 13px #ffd60a' : green ? '0 0 8px rgba(34,224,138,0.55)' : 'none',
    anim: filled ? `dotPulse 2s ease-in-out ${(i * 0.13).toFixed(2)}s infinite` : 'none',
  };
});

const WEEK_DATA = [
  { label: 'Woche 1', focus: 'PRÄSENS & MODALVERBEN', tasks: [
    { icon: '🃏', name: 'Anki Deck A2', xp: '+10 XP' },
    { icon: '📺', name: 'Easy German Ep.1', xp: '+15 XP' },
    { icon: '📖', name: 'DW Nicos Weg', xp: '+20 XP' },
    { icon: '✏️', name: 'Grammatik: haben/sein', xp: '+25 XP' },
    { icon: '🎤', name: 'Sprechen: Vorstellung', xp: '+20 XP' },
  ]},
  { label: 'Woche 2', focus: 'PERFEKT & VERGANGENHEIT', tasks: [
    { icon: '🃏', name: 'Anki Deck B1', xp: '+10 XP' },
    { icon: '📺', name: 'Video: Perfekt-Bildung', xp: '+15 XP' },
    { icon: '📖', name: 'Lesen: Kurzgeschichte', xp: '+20 XP' },
    { icon: '✏️', name: 'Grammatik: Perfekt', xp: '+25 XP' },
    { icon: '🎤', name: 'Sprechen: Mein Tag', xp: '+20 XP' },
  ]},
  { label: 'Woche 3', focus: 'DATIV & AKKUSATIV', tasks: [
    { icon: '🃏', name: 'Anki Wechselpräpositionen', xp: '+10 XP' },
    { icon: '📺', name: 'Video: Dativ vs. Akkusativ', xp: '+15 XP' },
    { icon: '📖', name: 'DW Jojo sucht das Glück', xp: '+20 XP' },
    { icon: '✏️', name: 'Grammatik: Kasus-Drill', xp: '+25 XP' },
    { icon: '🎤', name: 'Sprechen: Wegbeschreibung', xp: '+20 XP' },
  ]},
  { label: 'Woche 4', focus: 'KONJUNKTIV & B2-FINALE', tasks: [
    { icon: '🃏', name: 'Anki Deck B2', xp: '+10 XP' },
    { icon: '📺', name: 'Video: Konjunktiv II', xp: '+15 XP' },
    { icon: '📖', name: 'Lesen: Zeitungsartikel', xp: '+20 XP' },
    { icon: '✏️', name: 'Grammatik: Passiv', xp: '+25 XP' },
    { icon: '🎤', name: 'Sprechen: Debatte B2', xp: '+20 XP' },
  ]},
];

const STATS = [
  { display: '140', label: 'Aufgaben', sub: 'across 28 days', target: 140, suffix: '' },
  { display: '87.400', label: 'Lernminuten', sub: 'logged so far', target: 87400, suffix: '' },
  { display: '2.847+', label: 'Schüler', sub: 'currently learning', target: 2847, suffix: '+' },
  { display: '28', label: 'Max Streak', sub: 'days in a row', target: 28, suffix: '' },
];

const COMPARISON = [
  { label: 'Tempo', others: 'Du entscheidest. Irgendwann.', ours: 'Ich entscheide. Heute.' },
  { label: 'Fehler', others: 'Wir sagen lieber nichts.', ours: 'Ich korrigiere jeden einzelnen.' },
  { label: 'Motivation', others: 'Konfetti und niedliche Badges.', ours: 'Fortschritt oder Konsequenz.' },
  { label: 'Tag verpasst', others: 'Kein Problem, mach weiter!', ours: 'Erst nachholen. Dann weiter.' },
  { label: 'Ergebnis', others: 'Vielleicht A2. Vielleicht.', ours: 'B2. In 28 Tagen.' },
];

const TIMELINE = [
  { day: 'Tag 01', title: 'Der Schock', level: 'A2', desc: 'Kein Aufwärmen. Wir starten sofort mit Präsens und Modalverben.', color: '#a855f7' },
  { day: 'Tag 07', title: 'Erste Streak', level: 'A2+', desc: 'Sieben Tage in Folge. Die Modalverben sitzen. Kein Zurück mehr.', color: '#6366f1' },
  { day: 'Tag 14', title: 'Halbzeit', level: 'B1', desc: 'Perfekt und Dativ. Du denkst zum ersten Mal auf Deutsch.', color: '#22d3ee' },
  { day: 'Tag 21', title: 'Der Druck', level: 'B1+', desc: 'Konjunktiv. Die Woche, in der die meisten aufgeben. Du nicht.', color: '#4d9fff' },
  { day: 'Tag 28', title: 'B2.', level: 'B2', desc: 'Du sprichst. Ich nicke. Einmal. Das ist mein höchstes Lob.', color: '#ffd60a' },
];

const EXCUSES = [
  { q: '„Ich habe keine Zeit."', a: 'Fünf Aufgaben. Fünfzehn Minuten. Du hast Zeit für dein Handy — du hast Zeit für Deutsch.' },
  { q: '„Ich bin kein Sprachtalent."', a: 'Talent ist eine Ausrede. Wiederholung ist eine Methode. Wir machen Methode.' },
  { q: '„Was, wenn ich einen Tag verpasse?"', a: 'Dann holst du ihn nach. Vor der nächsten Aufgabe. Es gibt kein Überspringen.' },
  { q: '„Ist das nicht zu hart?"', a: 'Nett hat dich auf A2 gebracht. Streng bringt dich auf B2. Entscheide dich.' },
  { q: '„Kostet das etwas?"', a: 'Der Anfang ist kostenlos. Deine Ausreden kosten dich nur Zeit.' },
];

const TESTIMONIALS = [
  { name: 'L. Rossi', initials: 'LR', tag: 'A2 → B2 in 26 Tagen', quote: 'Ich habe ihn gehasst. An Tag 28 habe ich ihm gedankt.', color: '#a855f7' },
  { name: 'M. Okafor', initials: 'MO', tag: '34 Tage Streak', quote: 'Kein anderes System hat mich zum Reden gebracht. Dieses schon.', color: '#22d3ee' },
  { name: 'S. Kim', initials: 'SK', tag: 'Bestanden: telc B2', quote: 'Unbequem von Tag eins. Genau deshalb hat es funktioniert.', color: '#ffd60a' },
];

const XP_CHIPS = [
  { color: '#c084fc', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.3)', name: 'Anki', xp: '+10 XP', delay: '0s' },
  { color: '#34d399', bg: 'rgba(34,224,138,0.08)', border: 'rgba(34,224,138,0.3)', name: 'Video', xp: '+15 XP', delay: '.5s' },
  { color: '#ffd60a', bg: 'rgba(255,214,10,0.07)', border: 'rgba(255,214,10,0.3)', name: 'Lesen', xp: '+20 XP', delay: '.8s' },
  { color: '#22d3ee', bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.3)', name: 'Grammatik', xp: '+25 XP', delay: '1.1s' },
];

const GATE_TASKS = [
  { icon: '📺', name: 'Easy German Ep.42', xp: '+15 XP', done: true, color: '#22d3ee', locked: false },
  { icon: '📖', name: 'Artikel: Dativ-Kasus', xp: '+20 XP', done: true, color: '#ffd60a', locked: false },
  { icon: '🔒', name: 'Grammatik-Übung', xp: '+25 XP', done: false, color: '#6b7396', locked: true },
  { icon: '🔒', name: 'Sprechen: Meinungen', xp: '+20 XP', done: false, color: '#6b7396', locked: true },
];

/* ── component ─────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [week, setWeek] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const id = 'sora-font-link';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'none';
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

    const co = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        co.unobserve(el);
        const target = parseInt(el.dataset.countTarget, 10);
        const suffix = el.dataset.countSuffix || '';
        const dur = 1400, start = performance.now();
        const fmt = (n) => n.toLocaleString('de-DE');
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(Math.round(target * eased)) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-count-target]').forEach((el) => co.observe(el));

    return () => { io.disconnect(); co.disconnect(); };
  }, []);

  const handleCTA = () => navigate(user ? '/app' : '/login');
  const ctaLabel = user ? 'Zum Dashboard →' : 'Loslegen — Kostenlos';

  return (
    <>
      <style>{CSS}</style>
      <div className="lp-root">
        <BG />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Nav user={user} onCTA={handleCTA} />
          <Hero ctaLabel={ctaLabel} onCTA={handleCTA} />
          <Marquee />
          <Methode />
          <Vergleich />
          <Gamification />
          <Journey week={week} setWeek={setWeek} />
          <StatsSection />
          <Faq openFaq={openFaq} setOpenFaq={setOpenFaq} />
          <Testimonials />
          <FinalCTA ctaLabel={ctaLabel} onCTA={handleCTA} />
          <HelpUsSection onFeedback={() => setShowFeedback(true)} />
          <Footer onFeedback={() => setShowFeedback(true)} />
          {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
        </div>
      </div>
    </>
  );
}

/* ── sub-components ─────────────────────────────────────────────────────── */

function BG() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', background: 'radial-gradient(120% 90% at 50% -10%, #10131f 0%, #060811 45%, #04050a 100%)' }}>
      <div style={{ position: 'absolute', width: '55vw', height: '55vw', left: '-10vw', top: '-8vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.28), transparent 62%)', filter: 'blur(30px)', animation: 'floatA 20s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: '48vw', height: '48vw', right: '-8vw', top: '12vh', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,214,10,0.14), transparent 62%)', filter: 'blur(30px)', animation: 'floatB 26s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: '44vw', height: '44vw', left: '22vw', bottom: '-12vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.16), transparent 62%)', filter: 'blur(34px)', animation: 'floatC 30s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', inset: '-20%', backgroundImage: 'linear-gradient(rgba(148,163,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,255,0.06) 1px, transparent 1px)', backgroundSize: '120px 120px', animation: 'gridPan 16s linear infinite', WebkitMaskImage: 'radial-gradient(120% 80% at 50% 20%, #000 0%, transparent 78%)', maskImage: 'radial-gradient(120% 80% at 50% 20%, #000 0%, transparent 78%)' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(1.4px 1.4px at 20% 30%, #fff, transparent), radial-gradient(1.2px 1.2px at 70% 60%, #cdd6ff, transparent), radial-gradient(1px 1px at 40% 80%, #fff, transparent), radial-gradient(1.5px 1.5px at 85% 20%, #fff, transparent)', backgroundSize: '100% 100%', opacity: 0.7, animation: 'twinkle 5s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: '100%', height: 3, top: 0, background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.35), transparent)', filter: 'blur(1px)', animation: 'scan 9s linear infinite' }} />
    </div>
  );
}

function Nav({ user, onCTA }) {
  const [open, setOpen] = useState(false);
  const links = [['#methode','Methode'],['#gamification','Gamification'],['#journey','28 Tage'],['#cta','Anfangen']];
  return (
    <>
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', background: 'rgba(6,8,15,0.72)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(148,163,255,0.09)' }}>
        <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 17, letterSpacing: '-0.01em', textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ display: 'inline-flex', animation: 'badgeGlow 3s ease-in-out infinite', borderRadius: 10 }}>
            <LogoSVG size={32} gid="lgNav" />
          </span>
          Der <span style={{ color: '#ffd60a', marginLeft: 4 }}>Strenge</span> Lehrer
        </a>
        {/* Desktop links */}
        <div className="lp-nav-links">
          {links.map(([href, label]) => (
            <a key={href} className="lp-link" href={href} style={{ color: '#9aa2bf', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>{label}</a>
          ))}
        </div>
        {/* Desktop CTA */}
        <button onClick={onCTA} className="lp-btn-nav lp-nav-cta-desktop">{user ? 'Dashboard' : 'Anmelden'}</button>
        {/* Hamburger — mobile only */}
        <button onClick={() => setOpen(o => !o)} className="lp-hamburger" aria-label="Menu">
          <span className={open ? 'lp-ham-line lp-ham-top open' : 'lp-ham-line lp-ham-top'} />
          <span className={open ? 'lp-ham-line lp-ham-mid open' : 'lp-ham-line lp-ham-mid'} />
          <span className={open ? 'lp-ham-line lp-ham-bot open' : 'lp-ham-line lp-ham-bot'} />
        </button>
      </nav>
      {/* Mobile drawer */}
      <div className={open ? 'lp-drawer open' : 'lp-drawer'}>
        {links.map(([href, label]) => (
          <a key={href} href={href} onClick={() => setOpen(false)} style={{ display: 'block', padding: '16px 24px', color: '#eef0f7', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 17, textDecoration: 'none', borderBottom: '1px solid rgba(148,163,255,0.08)' }}>{label}</a>
        ))}
        <div style={{ padding: '20px 24px' }}>
          <button onClick={() => { setOpen(false); onCTA(); }} style={{ width: '100%', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16, color: '#06070c', padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg,#ffe66b,#ffb300)', border: 'none', cursor: 'pointer' }}>
            {user ? 'Zum Dashboard →' : 'Kostenlos starten'}
          </button>
        </div>
      </div>
    </>
  );
}

function Hero({ ctaLabel, onCTA }) {
  return (
    <section id="top" className="lp-hero-grid" style={{ position: 'relative', minHeight: '92vh', display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', alignItems: 'center', gap: 20, maxWidth: 1240, margin: '0 auto', padding: '60px 40px 40px' }}>
      {/* Teacher card — always rendered, hidden via CSS on mobile and replaced by mini version */}
      <div className="lp-hero-teacher" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,214,10,0.22), transparent 65%)', filter: 'blur(20px)', animation: 'glowPulse 4s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', border: '1px dashed rgba(255,214,10,0.28)', animation: 'ringSpin 26s linear infinite' }} />
        <div style={{ position: 'relative', width: 260, height: 300, borderRadius: 28, background: 'linear-gradient(160deg, rgba(20,24,40,0.9), rgba(10,12,22,0.9))', border: '1px solid rgba(148,163,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 30px 80px -30px rgba(124,58,237,0.5)', animation: 'floatY 6s ease-in-out infinite', overflow: 'hidden' }}>
          <TeacherSVG />
          <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', fontFamily: "'Space Grotesk',sans-serif", fontSize: 11, letterSpacing: '0.22em', color: '#7c86a8', whiteSpace: 'nowrap' }}>DER STRENGE LEHRER</div>
        </div>
      </div>
      {/* Mini teacher — only shown on mobile above the text */}
      <div className="lp-hero-teacher-mobile" style={{ display: 'none', justifyContent: 'center', marginBottom: 24 }}>
        <div style={{ position: 'relative', width: 140, height: 160, borderRadius: 22, background: 'linear-gradient(160deg,rgba(20,24,40,0.9),rgba(10,12,22,0.9))', border: '1px solid rgba(148,163,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 50px -20px rgba(124,58,237,0.5)', animation: 'floatY 6s ease-in-out infinite', overflow: 'hidden' }}>
          <svg viewBox="0 0 120 130" width="100" height="108" style={{ filter: 'drop-shadow(0 6px 16px rgba(255,179,0,0.3))' }}>
            <defs><linearGradient id="face1m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffe66b"/><stop offset="1" stopColor="#ffb300"/></linearGradient></defs>
            <g style={{ transformBox:'fill-box', transformOrigin:'60px 60px', animation:'headTilt 5.5s ease-in-out infinite' }}>
              <rect x="42" y="96" width="36" height="30" rx="8" fill="#161a2e"/>
              <path d="M45 100 L60 108 L75 100" fill="none" stroke="#ffd60a" strokeWidth="3"/>
              <circle cx="60" cy="58" r="40" fill="url(#face1m)"/>
              <path d="M22 46 Q60 8 98 46 L98 34 Q60 4 22 34 Z" fill="#0b0e18"/>
              <circle cx="46" cy="60" r="12" fill="#0b0e18" fillOpacity="0.14" stroke="#0b0e18" strokeWidth="3.2"/>
              <circle cx="74" cy="60" r="12" fill="#0b0e18" fillOpacity="0.14" stroke="#0b0e18" strokeWidth="3.2"/>
              <line x1="58" y1="60" x2="62" y2="60" stroke="#0b0e18" strokeWidth="3.2"/>
              <g style={{ transformBox:'fill-box', transformOrigin:'center', animation:'blink 4.2s ease-in-out infinite' }}>
                <circle cx="46" cy="60" r="3.4" fill="#0b0e18"/>
                <circle cx="74" cy="60" r="3.4" fill="#0b0e18"/>
              </g>
              <g style={{ transformBox:'fill-box', transformOrigin:'center', animation:'browAngry 3.2s ease-in-out infinite' }}>
                <line x1="34" y1="44" x2="55" y2="50" stroke="#0b0e18" strokeWidth="3.4" strokeLinecap="round"/>
                <line x1="86" y1="44" x2="65" y2="50" stroke="#0b0e18" strokeWidth="3.4" strokeLinecap="round"/>
              </g>
              <path d="M48 84 Q60 76 72 84" fill="none" stroke="#0b0e18" strokeWidth="3.2" strokeLinecap="round"/>
            </g>
          </svg>
        </div>
      </div>
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '9px 16px', border: '1px solid rgba(148,163,255,0.18)', borderRadius: 999, background: 'rgba(10,13,24,0.5)', fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, letterSpacing: '0.14em', color: '#cfd5ea', marginBottom: 26 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22e08a', boxShadow: '0 0 10px #22e08a', animation: 'glowPulse 2s ease-in-out infinite' }} />
          A1 → B2 · 112 TAGE · 560 AUFGABEN
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(56px, 8vw, 118px)', lineHeight: 0.88, letterSpacing: '-0.035em', margin: 0, textTransform: 'uppercase' }}>
          <span style={{ display: 'block', background: 'linear-gradient(100deg, #c9cede, #ffffff 45%, #c9cede)', backgroundSize: '220% auto', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', animation: 'heroIn .85s cubic-bezier(.2,.8,.2,1) .1s both, sheen 6s linear infinite' }}>Kein</span>
          <span style={{ display: 'block', background: 'linear-gradient(100deg, #ffe66b, #ffb300, #ffd60a)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', animation: 'heroIn .85s cubic-bezier(.2,.8,.2,1) .28s both, sheen 5s linear infinite, yellowThrob 3.5s ease-in-out infinite' }}>Ausreden.</span>
          <span style={{ display: 'block', background: 'linear-gradient(100deg, #c9cede, #ffffff 45%, #c9cede)', backgroundSize: '220% auto', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', animation: 'heroIn .85s cubic-bezier(.2,.8,.2,1) .46s both, sheen 6s linear infinite .8s' }}>Nur Deutsch.</span>
        </h1>
        <p style={{ maxWidth: 480, margin: '30px 0 0', fontSize: 19, lineHeight: 1.55, color: '#aeb6d0' }}>
          I am not your tutor. I am not your friend.<br />
          I am the teacher who will get you to B2 in 28 days —{' '}
          <span style={{ fontStyle: 'italic', color: '#cfd5ea' }}>whether you feel like it today or not.</span>
        </p>
        <div className="lp-hero-btns" style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 36, flexWrap: 'wrap' }}>
          <button className="lp-btn-gold lp-hover-lift" onClick={onCTA} style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, color: '#06070c', padding: '17px 34px', borderRadius: 16, background: 'linear-gradient(135deg, #ffe66b, #ffb300)', boxShadow: '0 16px 44px -10px rgba(255,179,0,0.65)', border: 'none', cursor: 'pointer' }}>
            {ctaLabel}
          </button>
          <a className="lp-link-ghost" href="#methode" style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 17, color: '#eef0f7', textDecoration: 'none' }}>Wie es funktioniert ↓</a>
        </div>
        <div className="lp-hero-chips" style={{ display: 'flex', gap: 12, marginTop: 34, flexWrap: 'wrap' }}>
          {['🔥 Streak-System', '⚡ XP & Level', '📱 iOS App', '🎤 Audio'].map((chip) => (
            <span key={chip} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 999, border: '1px solid rgba(148,163,255,0.16)', background: 'rgba(10,13,24,0.5)', fontSize: 14, color: '#cfd5ea' }}>{chip}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const txt = 'Schreiben • Perfekt • Dativ • Modalverben • Konjunktiv • Nominativ • Akkusativ • Vokabeln • Aussprache • Shadowing • B2 • A2→B2 • Grammatik • ';
  return (
    <div style={{ position: 'relative', padding: '20px 0', borderTop: '1px solid rgba(148,163,255,0.09)', borderBottom: '1px solid rgba(148,163,255,0.09)', background: 'rgba(8,10,20,0.4)', overflow: 'hidden', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)', maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)' }}>
      <div style={{ display: 'flex', width: 'max-content', gap: 46, animation: 'marquee 26s linear infinite', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 20, letterSpacing: '0.08em', color: '#6b7396', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        <span>{txt}</span><span>{txt}</span>
      </div>
    </div>
  );
}

const FEATURE_COLORS = ['#a78bfa','#34d399','#fbbf24','#60a5fa','#f472b6','#fb923c'];

function Methode() {
  return (
    <section id="methode" style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 40px 56px' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div data-reveal="" style={{...revealStyle(), ...labelStyle}}>METHODE</div>
        <h2 data-reveal="" style={revealStyle('delay:.08s', { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(30px,3.8vw,52px)', lineHeight: 1.08, letterSpacing: '-0.03em', margin: 0 })}>
          Warum so streng?<br /><span style={{ color: '#a78bfa' }}>Weil nett nicht funktioniert.</span>
        </h2>
        <p data-reveal="" style={revealStyle('delay:.16s', { maxWidth: 560, margin: '20px auto 0', fontSize: 16, lineHeight: 1.65, color: '#9aa2bf' })}>
          Every language app makes learning comfortable. That is precisely why they fail. Comfort is the enemy of fluency.
        </p>
      </div>
      <div className="lp-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {FEATURES.map((f, i) => (
          <div key={f.title} className="lp-card-feat lp-hover-feat" data-reveal="" style={revealStyle('', {
            position: 'relative', padding: '24px 22px', borderRadius: 18,
            background: 'linear-gradient(160deg,rgba(16,18,36,0.85),rgba(8,10,20,0.75))',
            border: '1px solid rgba(148,163,255,0.1)',
            borderTop: `2px solid ${FEATURE_COLORS[i]}33`,
            overflow: 'hidden',
          })}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${FEATURE_COLORS[i]}, ${FEATURE_COLORS[i]}66)`, opacity: .6 }} />
            <div style={{ position: 'absolute', top: -30, right: -30, width: 90, height: 90, borderRadius: '50%', background: `radial-gradient(circle,${FEATURE_COLORS[i]}22,transparent 70%)`, filter: 'blur(8px)' }} />
            <div style={{ fontSize: 30, marginBottom: 14, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))', display: 'inline-block', animation: 'floatIcon 5s ease-in-out infinite' }}>{f.icon}</div>
            <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 17, margin: '0 0 9px', color: '#f4f6ff', lineHeight: 1.2 }}>{f.title}</h3>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: '#8a93b0' }}>{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Vergleich() {
  return (
    <section style={{ maxWidth: 1120, margin: '0 auto', padding: '90px 40px 60px' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div data-reveal="" style={{...revealStyle(), ...labelStyle}}></div>
        <h2 data-reveal="" style={revealStyle('delay:.08s', { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(38px,5vw,66px)', letterSpacing: '-0.03em', margin: 0 })}>
          Nett vs. <span style={{ color: '#ffd60a' }}>Streng.</span>
        </h2>
      </div>
      {/* Desktop table */}
      <div data-reveal="" className="lp-comp-grid lp-comp-desktop" style={{ ...revealStyle(), display: 'grid', gridTemplateColumns: '1fr 1.1fr 1.1fr', borderRadius: 22, overflow: 'hidden', border: '1px solid rgba(148,163,255,0.12)' }}>
        <div style={{ padding: '22px 26px', background: 'rgba(10,13,24,0.6)' }} />
        <div style={{ padding: '22px 26px', background: 'rgba(10,13,24,0.6)', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 17, color: '#7c86a8', textAlign: 'center' }}>Andere Apps</div>
        <div style={{ padding: '22px 26px', background: 'linear-gradient(180deg,rgba(255,214,10,0.14),rgba(255,214,10,0.04))', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 17, color: '#ffd60a', textAlign: 'center', borderLeft: '1px solid rgba(255,214,10,0.25)', borderRight: '1px solid rgba(255,214,10,0.25)' }}>Der Strenge Lehrer</div>
        {COMPARISON.map((c) => (
          <div key={c.label} style={{ display: 'contents' }}>
            <div style={{ padding: '22px 26px', borderTop: '1px solid rgba(148,163,255,0.08)', fontWeight: 600, color: '#cfd5ea' }}>{c.label}</div>
            <div style={{ padding: '22px 26px', borderTop: '1px solid rgba(148,163,255,0.08)', color: '#7c86a8', textAlign: 'center' }}>{c.others}</div>
            <div style={{ padding: '22px 26px', borderTop: '1px solid rgba(255,214,10,0.14)', color: '#f4f6ff', textAlign: 'center', background: 'rgba(255,214,10,0.05)', borderLeft: '1px solid rgba(255,214,10,0.18)', borderRight: '1px solid rgba(255,214,10,0.18)', fontWeight: 600 }}>{c.ours}</div>
          </div>
        ))}
      </div>
      {/* Mobile cards */}
      <div className="lp-comp-mobile" style={{ display: 'none', flexDirection: 'column', gap: 10 }}>
        {COMPARISON.map((c) => (
          <div key={c.label} style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(148,163,255,0.12)' }}>
            <div style={{ padding: '10px 14px', background: 'rgba(10,13,24,0.8)', fontWeight: 700, fontSize: 13, color: '#a78bfa', letterSpacing: '0.1em' }}>{c.label}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <div style={{ padding: '12px 14px', background: 'rgba(10,13,24,0.5)', fontSize: 13, color: '#7c86a8', borderRight: '1px solid rgba(148,163,255,0.08)' }}><span style={{ fontSize: 11, color: '#6b7396', display: 'block', marginBottom: 4 }}>Andere Apps</span>{c.others}</div>
              <div style={{ padding: '12px 14px', background: 'rgba(255,214,10,0.06)', fontSize: 13, color: '#f4f6ff', fontWeight: 600 }}><span style={{ fontSize: 11, color: '#ffd60a', display: 'block', marginBottom: 4 }}>Wir</span>{c.ours}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Gamification() {
  return (
    <section id="gamification" style={{ maxWidth: 1240, margin: '0 auto', padding: '90px 40px 60px' }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <div data-reveal="" style={{...revealStyle(), ...labelStyle}}></div>
        <h2 data-reveal="" style={revealStyle('delay:.08s', { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(38px,5vw,68px)', lineHeight: 1.02, letterSpacing: '-0.03em', margin: 0 })}>
          Lernen wie ein Spiel.<br /><span style={{ color: '#ffd60a' }}>Fühlen wie Arbeit.</span>
        </h2>
      </div>
      <div className="lp-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
        {/* XP */}
        <div className="lp-hover-xp" data-reveal="" style={revealStyle('', { padding: 30, borderRadius: 22, background: 'linear-gradient(165deg,rgba(20,24,40,0.7),rgba(10,12,22,0.55))', border: '1px solid rgba(148,163,255,0.12)' })}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, letterSpacing: '0.22em', color: '#7c86a8', marginBottom: 22 }}>XP & LEVEL</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, color: '#fff', padding: '7px 15px', borderRadius: 999, background: 'linear-gradient(135deg,#a855f7,#6366f1)', animation: 'lvGlow 2.6s ease-in-out infinite' }}>Lv.4</span>
            <div style={{ flex: 1, height: 10, borderRadius: 999, background: 'rgba(148,163,255,0.14)', overflow: 'hidden' }}>
              <div style={{ position: 'relative', width: '62%', height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#a855f7,#22d3ee)', boxShadow: '0 0 12px rgba(34,211,238,0.5)', animation: 'fillBar 1.8s cubic-bezier(.2,.8,.2,1) both', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, bottom: 0, width: '35%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)', animation: 'barShimmer 2.6s ease-in-out infinite' }} />
              </div>
            </div>
          </div>
          <div style={{ fontSize: 14, color: '#7c86a8', marginBottom: 22 }}>395 / 2000 XP</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {XP_CHIPS.map((c) => (
              <div key={c.name} style={{ padding: 14, borderRadius: 14, textAlign: 'center', border: `1px solid ${c.border}`, background: c.bg, animation: `chipFloat 4s ease-in-out ${c.delay} infinite` }}>
                <div style={{ color: c.color, fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: '#fff' }}>{c.xp}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Streak */}
        <div className="lp-hover-streak" data-reveal="" style={revealStyle('delay:.1s', { padding: 30, borderRadius: 22, background: 'linear-gradient(165deg,rgba(20,24,40,0.7),rgba(10,12,22,0.55))', border: '1px solid rgba(148,163,255,0.12)', textAlign: 'center' })}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, letterSpacing: '0.22em', color: '#7c86a8', marginBottom: 22, textAlign: 'left' }}>STREAK SYSTEM</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span style={{ fontSize: 52, display: 'inline-block', animation: 'flamePulse 1.8s ease-in-out infinite' }}>🔥</span>
            <span data-count-target="7" data-count-suffix="" style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 72, color: '#fff', lineHeight: 1, textShadow: '0 0 30px rgba(255,120,0,0.5)' }}>7</span>
          </div>
          <div style={{ color: '#9aa2bf', fontSize: 16, margin: '6px 0 22px' }}>Tage in Folge</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center', marginBottom: 22 }}>
            {STREAK_DOTS.map((d, i) => (
              <span key={i} style={{ width: 15, height: 15, borderRadius: '50%', background: d.color, boxShadow: d.glow !== 'none' ? d.glow : undefined, animation: d.anim !== 'none' ? d.anim : undefined }} />
            ))}
          </div>
          <div style={{ fontStyle: 'italic', color: '#7c86a8', fontSize: 15 }}>Miss a day? You catch up first. No shortcuts.</div>
        </div>
        {/* Task Gating */}
        <div className="lp-hover-gate" data-reveal="" style={revealStyle('delay:.2s', { padding: 30, borderRadius: 22, background: 'linear-gradient(165deg,rgba(20,24,40,0.7),rgba(10,12,22,0.55))', border: '1px solid rgba(148,163,255,0.12)' })}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, letterSpacing: '0.22em', color: '#7c86a8', marginBottom: 26 }}>TASK GATING</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {GATE_TASKS.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14, background: t.locked ? 'rgba(10,13,24,0.4)' : 'rgba(20,24,40,0.6)', border: `1px solid ${t.done ? 'rgba(34,224,138,0.3)' : t.locked ? 'rgba(148,163,255,0.1)' : 'rgba(255,214,10,0.3)'}`, opacity: t.locked ? 0.55 : 1 }}>
                <span style={{ fontSize: 22 }}>{t.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: t.locked ? '#7c86a8' : '#f4f6ff' }}>{t.name}</div>
                  <div style={{ fontSize: 13, color: t.color }}>{t.xp}</div>
                </div>
                {t.done && <span style={{ fontSize: 18 }}>✅</span>}
                {t.locked && <span style={{ fontSize: 16 }}>🔒</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Journey({ week, setWeek }) {
  return (
    <section id="journey" style={{ maxWidth: 1240, margin: '0 auto', padding: '90px 40px 60px' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <div data-reveal="" style={revealStyle()}>28-TAGE-REISE</div>
        <h2 data-reveal="" style={revealStyle('delay:.08s', { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(38px,5vw,68px)', lineHeight: 1.02, letterSpacing: '-0.03em', margin: 0 })}>
          Jede Woche<br /><span style={{ color: '#4d9fff' }}>ein neues Level.</span>
        </h2>
      </div>
      <div data-reveal="" style={{ ...revealStyle(), display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
        {WEEK_DATA.map((w, i) => (
          <button key={i} onClick={() => setWeek(i)} style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 16, padding: '12px 24px', borderRadius: 14, border: `1px solid ${week === i ? 'rgba(77,159,255,0.6)' : 'rgba(148,163,255,0.16)'}`, background: week === i ? 'rgba(77,159,255,0.14)' : 'rgba(10,13,24,0.5)', color: week === i ? '#4d9fff' : '#aeb6d0', cursor: 'pointer', transition: 'all .2s' }}>{w.label}</button>
        ))}
      </div>
      <div data-reveal="" style={{ ...revealStyle('delay:.1s'), borderRadius: 24, background: 'linear-gradient(165deg,rgba(20,24,40,0.7),rgba(10,12,22,0.55))', border: '1px solid rgba(77,159,255,0.22)', padding: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }} className="lp-journey-inner">
        <div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, letterSpacing: '0.26em', color: '#4d9fff', marginBottom: 16 }}>{WEEK_DATA[week].focus}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {WEEK_DATA[week].tasks.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 14, background: 'rgba(10,13,24,0.6)', border: '1px solid rgba(148,163,255,0.1)' }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{t.icon}</span>
                <span style={{ flex: 1, fontWeight: 600, color: '#f4f6ff' }}>{t.name}</span>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color: '#4d9fff', padding: '4px 10px', borderRadius: 8, background: 'rgba(77,159,255,0.12)', border: '1px solid rgba(77,159,255,0.2)' }}>{t.xp}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {TIMELINE.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${s.color}22`, border: `2px solid ${s.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 12, color: s.color, animation: `nodeBob 4s ease-in-out ${(i * 0.3).toFixed(2)}s infinite` }}>{s.level}</div>
                {i < TIMELINE.length - 1 && <div style={{ position: 'absolute', left: '50%', top: '100%', width: 2, height: 20, background: `linear-gradient(${s.color},${TIMELINE[i + 1].color}55)`, transform: 'translateX(-50%)' }} />}
              </div>
              <div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16, color: s.color }}>{s.day} — {s.title}</div>
                <div style={{ fontSize: 14, color: '#9aa2bf', lineHeight: 1.5, marginTop: 4 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section style={{ maxWidth: 1240, margin: '0 auto', padding: '90px 40px 60px' }}>
      <div className="lp-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 22 }}>
        {STATS.map((s) => (
          <div key={s.label} className="lp-stat-card" data-reveal="" style={revealStyle('', { textAlign: 'center', padding: '40px 20px', borderRadius: 22, background: 'linear-gradient(165deg,rgba(20,24,40,0.7),rgba(10,12,22,0.55))', border: '1px solid rgba(148,163,255,0.12)' })}>
            <div data-count-target={s.target} data-count-suffix={s.suffix} style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 54, lineHeight: 1, color: '#fff', letterSpacing: '-0.03em' }}>{s.display}</div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, color: '#ffd60a', margin: '10px 0 6px' }}>{s.label}</div>
            <div style={{ fontSize: 14, color: '#7c86a8' }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Faq({ openFaq, setOpenFaq }) {
  return (
    <section style={{ maxWidth: 800, margin: '0 auto', padding: '90px 40px 60px' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div data-reveal="" style={{...revealStyle(), ...labelStyle}}></div>
        <h2 data-reveal="" style={revealStyle('delay:.08s', { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(38px,5vw,66px)', letterSpacing: '-0.03em', margin: 0 })}>
          Ich kenne<br /><span style={{ color: '#a78bfa' }}>deine Ausreden.</span>
        </h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {EXCUSES.map((e, i) => (
          <div key={i} data-reveal="" onClick={() => setOpenFaq(openFaq === i ? -1 : i)} className="lp-faq-row" style={{ ...revealStyle(), borderRadius: 18, background: 'rgba(10,13,24,0.6)', border: `1px solid ${openFaq === i ? 'rgba(255,214,10,0.45)' : 'rgba(148,163,255,0.12)'}`, cursor: 'pointer', overflow: 'hidden', transition: 'border-color .2s, opacity .8s, transform .8s' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 26px' }}>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 18, color: '#f4f6ff', fontStyle: 'italic' }}>{e.q}</span>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, color: '#ffd60a', flexShrink: 0, marginLeft: 16 }}>{openFaq === i ? '−' : '+'}</span>
            </div>
            <div style={{ maxHeight: openFaq === i ? 220 : 0, overflow: 'hidden', transition: 'max-height .35s cubic-bezier(.2,.8,.2,1)' }}>
              <p style={{ padding: '0 26px 24px', margin: 0, fontSize: 16, lineHeight: 1.65, color: '#aeb6d0', opacity: openFaq === i ? 1 : 0, transition: 'opacity .3s' }}>{e.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const STAR_PALETTE = ['#a855f7','#22d3ee','#ffd60a','#34d399','#f87171','#60a5fa'];
const STAR_COLORS_LP = ['#ef4444','#f97316','#eab308','#22c55e','#7c3aed'];

function StarRow({ value }) {
  return (
    <span style={{ display:'inline-flex', gap:2 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} style={{ fontSize:14, color: value >= n ? STAR_COLORS_LP[Math.min(n-1,4)] : 'rgba(255,255,255,0.15)' }}>★</span>
      ))}
    </span>
  );
}

function Testimonials() {
  const [liveReviews, setLiveReviews] = useState([]);
  const [avg, setAvg] = useState(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.get('/api/reviews')
      .then(res => {
        const d = res.data;
        if (d?.reviews?.length) {
          setLiveReviews(d.reviews);
          setAvg(d.avg);
          setTotal(d.total);
        }
      })
      .catch(() => {});
  }, []);

  /* Merge: live approved reviews first, then fallback hardcoded ones to fill gaps */
  const liveCards = liveReviews.map((r, i) => ({
    name: r.displayName,
    initials: r.initials || r.displayName?.slice(0,2).toUpperCase() || '??',
    tag: r.levelTag || 'Schüler',
    quote: r.message,
    color: STAR_PALETTE[i % STAR_PALETTE.length],
    rating: r.rating,
    isLive: true,
  }));
  const fallback = TESTIMONIALS.map(t => ({ ...t, rating: 5, isLive: false }));
  const cards = liveCards.length >= 3 ? liveCards.slice(0, 6) : [...liveCards, ...fallback].slice(0, Math.max(3, liveCards.length + fallback.length));

  return (
    <section style={{ maxWidth: 1240, margin: '0 auto', padding: '90px 40px 60px' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div data-reveal="" style={{...revealStyle(), ...labelStyle}}></div>
        <h2 data-reveal="" style={revealStyle('delay:.08s', { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(38px,5vw,66px)', letterSpacing: '-0.03em', margin: 0 })}>
          Sie hassten ihn.<br /><span style={{ color: '#ffd60a' }}>Am Ende dankten.</span>
        </h2>
        {avg && (
          <div data-reveal="" style={revealStyle('delay:.16s', { marginTop: 20, display:'flex', alignItems:'center', justifyContent:'center', gap:10 })}>
            <span style={{ fontSize:28, fontWeight:900, color:'#ffd60a', fontFamily:"'Space Grotesk',sans-serif" }}>{avg}</span>
            <div style={{ display:'flex', gap:2 }}>
              {[1,2,3,4,5].map(n => (
                <span key={n} style={{ fontSize:22, color: parseFloat(avg) >= n ? '#ffd60a' : 'rgba(255,255,255,0.15)' }}>★</span>
              ))}
            </div>
            <span style={{ fontSize:14, color:'#6b7396' }}>({total} Bewertungen)</span>
          </div>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(cards.length, 3)}, 1fr)`,
        gap: 22,
      }}>
        {cards.map((t, i) => (
          <div key={i} className="lp-hover-test" data-reveal="" style={revealStyle('', {
            position: 'relative', padding: '34px 30px', borderRadius: 22,
            background: 'linear-gradient(165deg,rgba(20,24,40,0.7),rgba(10,12,22,0.55))',
            border: `1px solid ${t.isLive ? 'rgba(124,58,237,0.3)' : 'rgba(148,163,255,0.12)'}`,
            overflow: 'hidden',
          })}>
            {t.isLive && (
              <div style={{ position:'absolute', top:14, right:14 }}>
                <span style={{ fontSize:10, fontWeight:800, color:'#7c3aed', background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.3)', borderRadius:20, padding:'2px 8px', letterSpacing:'.06em', textTransform:'uppercase' }}>
                  Echte Bewertung
                </span>
              </div>
            )}
            <div style={{ marginBottom:10 }}><StarRow value={t.rating} /></div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 64, lineHeight: 0.6, color: t.color, opacity: 0.5 }}>"</div>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: '#eef0f7', margin: '8px 0 26px', fontWeight: 500 }}>{t.quote}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'grid', placeItems: 'center', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, color: '#06070c', background: t.color, flexShrink: 0 }}>{t.initials}</div>
              <div>
                <div style={{ fontWeight: 700, color: '#f4f6ff' }}>{t.name}</div>
                <div style={{ fontSize: 14, color: t.color }}>{t.tag}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCTA({ ctaLabel, onCTA }) {
  return (
    <section id="cta" style={{ maxWidth: 900, margin: '0 auto', padding: '100px 40px 90px', textAlign: 'center' }}>
      <div data-reveal="" style={{...revealStyle(), ...labelStyle}}></div>
      <h2 data-reveal="" style={revealStyle('delay:.08s', { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(50px,8vw,96px)', lineHeight: 0.98, letterSpacing: '-0.035em', margin: 0 })}>
        Tag 1 wartet.<br /><span style={{ color: '#ffd60a', textShadow: '0 0 60px rgba(255,214,10,0.35)' }}>Du auch?</span>
      </h2>
      <p data-reveal="" style={revealStyle('delay:.16s', { fontSize: 19, lineHeight: 1.6, color: '#aeb6d0', margin: '28px 0 40px' })}>
        Free to start. No credit card. Just German.<br />The teacher is already disappointed — prove him wrong.
      </p>
      <button className="lp-btn-gold lp-hover-lift" data-reveal="" onClick={onCTA} style={{ ...revealStyle('delay:.24s'), display: 'inline-block', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: '#06070c', padding: '20px 44px', borderRadius: 18, background: 'linear-gradient(135deg,#ffe66b,#ffb300)', boxShadow: '0 20px 56px -12px rgba(255,179,0,0.7)', border: 'none', cursor: 'pointer' }}>
        {ctaLabel}
      </button>
      <div style={{ color: '#7c86a8', fontSize: 15, marginTop: 22 }}>112 Tage · 560 Aufgaben · A1 → B2</div>
    </section>
  );
}

function HelpUsSection({ onFeedback }) {
  const ways = [
    { icon: '💬', title: 'Share Feedback', desc: 'Tell us what works, what doesn\'t, and what you wish existed.' },
    { icon: '🐛', title: 'Report a Bug', desc: 'Found something broken? We want to fix it immediately.' },
    { icon: '💡', title: 'Suggest a Feature', desc: 'Have an idea that would help German learners? We\'re listening.' },
    { icon: '📢', title: 'Spread the Word', desc: 'Share with someone learning German — help them find us.' },
  ];

  return (
    <section style={{
      padding: '100px 40px',
      position: 'relative',
      overflow: 'hidden',
      textAlign: 'center',
    }}>
      {/* Animated background blobs */}
      <motion.div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(124,58,237,.12) 0%, transparent 70%)',
      }} animate={{ scale:[1,1.08,1], opacity:[0.7,1,0.7] }} transition={{ duration:6, repeat:Infinity, ease:'easeInOut' }}/>
      <motion.div style={{
        position:'absolute', top:'-10%', left:'-5%', width:400, height:400, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(255,214,10,.07) 0%, transparent 70%)',
        pointerEvents:'none',
      }} animate={{ x:[0,30,-20,0], y:[0,-20,15,0] }} transition={{ duration:12, repeat:Infinity, ease:'easeInOut' }}/>
      <motion.div style={{
        position:'absolute', bottom:'-15%', right:'-5%', width:360, height:360, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(6,182,212,.07) 0%, transparent 70%)',
        pointerEvents:'none',
      }} animate={{ x:[0,-25,18,0], y:[0,20,-12,0] }} transition={{ duration:10, repeat:Infinity, ease:'easeInOut', delay:2 }}/>

      {/* Grid dots */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        backgroundImage:'radial-gradient(circle, rgba(148,163,255,.18) 1px, transparent 1px)',
        backgroundSize:'28px 28px',
        maskImage:'radial-gradient(ellipse 80% 90% at 50% 50%, black 30%, transparent 100%)',
        WebkitMaskImage:'radial-gradient(ellipse 80% 90% at 50% 50%, black 30%, transparent 100%)',
        opacity:.5,
      }}/>

      <div style={{ position:'relative', zIndex:1, maxWidth:900, margin:'0 auto' }}>
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          transition={{ duration:.6 }}
          style={{
            display:'inline-flex', alignItems:'center', gap:8,
            background:'rgba(255,214,10,.1)', border:'1px solid rgba(255,214,10,.25)',
            borderRadius:20, padding:'6px 16px', marginBottom:24,
            fontSize:12, fontWeight:700, color:'#ffd60a', letterSpacing:'.08em', textTransform:'uppercase',
          }}
        >
          <motion.span animate={{ scale:[1,1.3,1] }} transition={{ duration:1.5, repeat:Infinity }}>🌍</motion.span>
          Open Mission
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          transition={{ duration:.7, delay:.1 }}
          style={{
            fontFamily:"'Space Grotesk',sans-serif", fontWeight:900,
            fontSize:'clamp(28px, 5vw, 52px)', lineHeight:1.1, margin:'0 0 20px',
            letterSpacing:'-.03em',
          }}
        >
          Help Us{' '}
          <span style={{
            background:'linear-gradient(135deg, #ffd60a 0%, #ff9f0a 50%, #ff6b6b 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>
            Shape the Future
          </span>
          {' '}of German Learning
        </motion.h2>

        <motion.p
          initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          transition={{ duration:.6, delay:.2 }}
          style={{ fontSize:17, color:'#9aa2bf', lineHeight:1.7, maxWidth:620, margin:'0 auto 52px' }}
        >
          We're on a mission to make German accessible to every learner on earth —
          completely free, forever. Your input directly shapes what we build next.
        </motion.p>

        {/* Ways to help */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:52 }}>
          {ways.map((w, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              transition={{ duration:.5, delay:.1 + i*.08 }}
              whileHover={{ y:-6, scale:1.02 }}
              style={{
                background:'rgba(255,255,255,.03)', border:'1px solid rgba(148,163,255,.12)',
                borderRadius:18, padding:'24px 18px', textAlign:'center',
                transition:'border-color .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor='rgba(255,214,10,.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='rgba(148,163,255,.12)'}
            >
              <motion.div style={{ fontSize:32, marginBottom:12 }}
                animate={{ scale:[1,1.1,1], rotate:[0,5,-5,0] }}
                transition={{ duration:3+i*0.5, repeat:Infinity, ease:'easeInOut', delay:i*0.6 }}>
                {w.icon}
              </motion.div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:15, color:'#eef0f7', marginBottom:8 }}>{w.title}</div>
              <div style={{ fontSize:13, color:'#6b7280', lineHeight:1.6 }}>{w.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity:0, scale:.95 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }}
          transition={{ duration:.5, delay:.4 }}
          style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', alignItems:'center' }}
        >
          <motion.button
            onClick={onFeedback}
            whileHover={{ scale:1.04, y:-2 }}
            whileTap={{ scale:.97 }}
            style={{
              background:'linear-gradient(135deg, #ffd60a, #ff9f0a)',
              border:'none', borderRadius:14, padding:'15px 32px',
              fontSize:16, fontWeight:800, color:'#06070c',
              cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif",
              boxShadow:'0 12px 36px -8px rgba(255,214,10,.5)',
              letterSpacing:'.01em',
            }}
          >
            💬 Feedback geben
          </motion.button>

          <motion.a
            href="mailto:help@derstrengelehrer.de"
            whileHover={{ scale:1.04, y:-2 }}
            style={{
              background:'rgba(148,163,255,.08)', border:'1px solid rgba(148,163,255,.2)',
              borderRadius:14, padding:'15px 32px', fontSize:16, fontWeight:700,
              color:'#c4b5fd', cursor:'pointer', display:'inline-block',
              fontFamily:"'Space Grotesk',sans-serif", letterSpacing:'.01em',
              textDecoration:'none',
            }}
          >
            ✉️ E-Mail schreiben
          </motion.a>
        </motion.div>

        {/* Pulse ring decoration */}
        <motion.div style={{
          position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)',
          width:600, height:600, borderRadius:'50%', pointerEvents:'none',
          border:'1px solid rgba(255,214,10,.06)',
        }} animate={{ scale:[0.8,1.1,0.8], opacity:[0.3,0.6,0.3] }} transition={{ duration:5, repeat:Infinity }}/>
      </div>
    </section>
  );
}

function Footer({ onFeedback }) {
  return (
    <footer style={{ borderTop: '1px solid rgba(148,163,255,0.1)', background: 'rgba(6,8,15,0.5)', padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, color: '#fff' }}>
        <LogoSVG size={28} gid="lgFoot" />
        Der <span style={{ color: '#ffd60a', marginLeft: 4 }}>Strenge</span> Lehrer
      </div>
      <div style={{ display: 'flex', gap: 26, alignItems: 'center' }}>
        {[['#cta','Anmelden'],['#top','Open Source'],['#top','MIT Lizenz']].map(([href, label]) => (
          <a key={label} className="lp-link" href={href} style={{ color: '#9aa2bf', textDecoration: 'none' }}>{label}</a>
        ))}
        <button onClick={onFeedback} style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)', color: '#c4b5fd', borderRadius: 10, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(124,58,237,0.28)'; }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(124,58,237,0.15)'; }}>
          💬 Feedback geben
        </button>
      </div>
      <div style={{ fontStyle: 'italic', color: '#6b7396', fontSize: 15 }}>„Schlechte Schüler gibt es nicht — nur schlechte Ausreden."</div>
    </footer>
  );
}

function FeedbackModal({ onClose }) {
  const [form, setForm] = useState({ name: '', email: '', type: 'suggestion', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim() || form.message.trim().length < 10) {
      setError('Bitte schreibe mindestens 10 Zeichen.'); return;
    }
    setSending(true); setError('');
    try {
      await api.post('/api/feedback', form);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Senden. Bitte versuche es erneut.');
    }
    setSending(false);
  };

  const TYPES = [
    { value: 'suggestion', label: '💡 Vorschlag' },
    { value: 'feature',    label: '✨ Feature Request' },
    { value: 'bug',        label: '🐛 Bug melden' },
    { value: 'other',      label: '💬 Sonstiges' },
  ];

  const overlay = { position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 };
  const card = { background:'linear-gradient(145deg,#0f1120,#151830)', border:'1px solid rgba(124,58,237,0.3)', borderRadius:24, padding:'36px 32px', width:'100%', maxWidth:520, position:'relative', boxShadow:'0 40px 100px rgba(0,0,0,0.7)' };
  const inp = { width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'11px 14px', color:'#eef0f7', fontSize:14, outline:'none', boxSizing:'border-box' };

  return (
    <div style={overlay} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={card}>
        <button onClick={onClose} style={{ position:'absolute', top:16, right:16, background:'rgba(255,255,255,0.07)', border:'none', color:'#9aa2bf', borderRadius:8, width:32, height:32, cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>

        {sent ? (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ fontSize:52, marginBottom:16 }}>🎉</div>
            <h2 style={{ color:'#fff', fontSize:22, fontWeight:900, margin:'0 0 10px' }}>Danke!</h2>
            <p style={{ color:'#9aa2bf', fontSize:15, lineHeight:1.6, margin:'0 0 24px' }}>Dein Feedback wurde erhalten. Ich werde es persönlich lesen.</p>
            <button onClick={onClose} style={{ background:'linear-gradient(135deg,#7c3aed,#4f46e5)', border:'none', color:'#fff', borderRadius:12, padding:'11px 28px', fontSize:14, fontWeight:700, cursor:'pointer' }}>Schließen</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 style={{ color:'#fff', fontSize:20, fontWeight:900, margin:'0 0 6px', fontFamily:"'Space Grotesk',sans-serif" }}>💬 Feedback geben</h2>
            <p style={{ color:'#6b7396', fontSize:13, margin:'0 0 24px' }}>Feature-Wünsche, Bugs, Verbesserungsideen — alles willkommen.</p>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#6b7396', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Name (optional)</label>
                <input style={inp} placeholder="Dein Name" value={form.name} onChange={e => set('name',e.target.value)} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#6b7396', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>E-Mail (optional)</label>
                <input style={inp} type="email" placeholder="für Rückfragen" value={form.email} onChange={e => set('email',e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#6b7396', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Typ</label>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {TYPES.map(t => (
                  <button type="button" key={t.value} onClick={() => set('type',t.value)}
                    style={{ padding:'7px 13px', borderRadius:9, fontSize:12, fontWeight:700, cursor:'pointer', transition:'all .18s',
                      background: form.type===t.value ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.05)',
                      border: form.type===t.value ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.09)',
                      color: form.type===t.value ? '#c4b5fd' : '#9aa2bf' }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:error?8:20 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#6b7396', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Nachricht *</label>
              <textarea style={{ ...inp, minHeight:110, resize:'vertical', fontFamily:'inherit', lineHeight:1.6 }}
                placeholder="Beschreibe deinen Vorschlag, Bug oder deine Idee…"
                value={form.message} onChange={e => set('message',e.target.value)} />
            </div>

            {error && <p style={{ color:'#f87171', fontSize:12, margin:'0 0 14px' }}>{error}</p>}

            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button type="button" onClick={onClose} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'#9aa2bf', borderRadius:11, padding:'10px 20px', fontSize:13, fontWeight:600, cursor:'pointer' }}>Abbrechen</button>
              <button type="submit" disabled={sending} style={{ background:'linear-gradient(135deg,#7c3aed,#4f46e5)', border:'none', color:'#fff', borderRadius:11, padding:'10px 24px', fontSize:13, fontWeight:700, cursor:'pointer', opacity:sending?0.7:1 }}>
                {sending ? '⏳ Senden…' : '📨 Senden'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ── SVG helpers ────────────────────────────────────────────────────────── */
function LogoSVG({ size, gid }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} style={{ display: 'block' }}>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffe66b" /><stop offset="1" stopColor="#ffb300" /></linearGradient></defs>
      <rect x="2" y="2" width="44" height="44" rx="13" fill={`url(#${gid})`} />
      <rect x="8.5" y="20" width="13" height="10" rx="4.5" fill="none" stroke="#0b0e18" strokeWidth="2.8" />
      <rect x="26.5" y="20" width="13" height="10" rx="4.5" fill="none" stroke="#0b0e18" strokeWidth="2.8" />
      <line x1="21.5" y1="24" x2="26.5" y2="24" stroke="#0b0e18" strokeWidth="2.8" />
      <line x1="9" y1="15" x2="20" y2="18.5" stroke="#0b0e18" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="39" y1="15" x2="28" y2="18.5" stroke="#0b0e18" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M17 37 Q24 33 31 37" fill="none" stroke="#0b0e18" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

function TeacherSVG() {
  return (
    <svg viewBox="0 0 120 130" width="190" height="206" style={{ filter: 'drop-shadow(0 10px 30px rgba(255,179,0,0.3))', marginTop: -8 }}>
      <defs><linearGradient id="face1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffe66b" /><stop offset="1" stopColor="#ffb300" /></linearGradient></defs>
      <g style={{ transformBox: 'fill-box', transformOrigin: '60px 60px', animation: 'headTilt 5.5s ease-in-out infinite' }}>
        <rect x="42" y="96" width="36" height="30" rx="8" fill="#161a2e" />
        <path d="M45 100 L60 108 L75 100" fill="none" stroke="#ffd60a" strokeWidth="3" />
        <circle cx="60" cy="58" r="40" fill="url(#face1)" />
        <path d="M22 46 Q60 8 98 46 L98 34 Q60 4 22 34 Z" fill="#0b0e18" />
        <circle cx="46" cy="60" r="12" fill="#0b0e18" fillOpacity="0.14" stroke="#0b0e18" strokeWidth="3.2" />
        <circle cx="74" cy="60" r="12" fill="#0b0e18" fillOpacity="0.14" stroke="#0b0e18" strokeWidth="3.2" />
        <line x1="58" y1="60" x2="62" y2="60" stroke="#0b0e18" strokeWidth="3.2" />
        <ellipse cx="46" cy="56" rx="5" ry="2.4" fill="#ffffff" style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'glint 4.5s ease-in-out infinite' }} />
        <ellipse cx="74" cy="56" rx="5" ry="2.4" fill="#ffffff" style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'glint 4.5s ease-in-out infinite' }} />
        <g style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'blink 4.2s ease-in-out infinite' }}>
          <circle cx="46" cy="60" r="3.4" fill="#0b0e18" />
          <circle cx="74" cy="60" r="3.4" fill="#0b0e18" />
        </g>
        <g style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'browAngry 3.2s ease-in-out infinite' }}>
          <line x1="34" y1="44" x2="55" y2="50" stroke="#0b0e18" strokeWidth="3.4" strokeLinecap="round" />
          <line x1="86" y1="44" x2="65" y2="50" stroke="#0b0e18" strokeWidth="3.4" strokeLinecap="round" />
        </g>
        <path d="M48 84 Q60 76 72 84" fill="none" stroke="#0b0e18" strokeWidth="3.2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/* ── helpers ────────────────────────────────────────────────────────────── */
/* label style — only for the small "METHODE" / "BEREIT?" labels */
const labelStyle = { fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, letterSpacing: '0.32em', color: '#a78bfa', marginBottom: 18 };
/* reveal-only — animation state, no typography */
function revealStyle(delay = '', overrides = {}) {
  return { opacity: 0, transform: 'translateY(24px)', transition: `all .8s cubic-bezier(.2,.7,.2,1)${delay ? ` ${delay}` : ''}`, ...overrides };
}

/* ── CSS string ─────────────────────────────────────────────────────────── */
const CSS = `
  @keyframes gridPan { from{background-position:0 0,0 0} to{background-position:0 120px,120px 0} }
  @keyframes floatA { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(6vw,4vh) scale(1.15)} }
  @keyframes floatB { 0%,100%{transform:translate(0,0) scale(1.1)} 50%{transform:translate(-5vw,-6vh) scale(0.95)} }
  @keyframes floatC { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-4vw,5vh) scale(1.2)} }
  @keyframes twinkle { 0%,100%{opacity:0.35} 50%{opacity:0.9} }
  @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes glowPulse { 0%,100%{opacity:0.55;transform:scale(1)} 50%{opacity:1;transform:scale(1.06)} }
  @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  @keyframes scan { from{transform:translateY(-100%)} to{transform:translateY(100vh)} }
  @keyframes sheen { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
  @keyframes flamePulse { 0%,100%{transform:scale(1) rotate(-2deg)} 50%{transform:scale(1.12) rotate(2deg)} }
  @keyframes fillBar { from{width:0} }
  @keyframes floatIcon { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-7px) rotate(3deg)} }
  @keyframes badgeGlow { 0%,100%{box-shadow:0 0 0 0 rgba(255,214,10,0)} 50%{box-shadow:0 0 26px 4px rgba(255,214,10,0.35)} }
  @keyframes ringSpin { to{transform:rotate(360deg)} }
  @keyframes blink { 0%,93%,100%{transform:scaleY(1)} 96%{transform:scaleY(0.12)} }
  @keyframes browAngry { 0%,100%{transform:translateY(0) rotate(0deg)} 45%{transform:translateY(-2px) rotate(-1deg)} 55%{transform:translateY(-2px) rotate(1deg)} }
  @keyframes glint { 0%,100%{opacity:0;transform:translateX(-4px)} 50%{opacity:0.55;transform:translateX(4px)} }
  @keyframes headTilt { 0%,100%{transform:rotate(-1.4deg)} 50%{transform:rotate(1.4deg)} }
  @keyframes heroIn { from{opacity:0;transform:translateY(46px) skewY(5deg);filter:blur(8px)} to{opacity:1;transform:none;filter:blur(0)} }
  @keyframes yellowThrob { 0%,100%{text-shadow:0 0 50px rgba(255,179,0,0.28)} 50%{text-shadow:0 0 80px rgba(255,179,0,0.55)} }
  @keyframes dotPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.32)} }
  @keyframes barShimmer { from{transform:translateX(-140%)} to{transform:translateX(360%)} }
  @keyframes lvGlow { 0%,100%{box-shadow:0 0 0 0 rgba(168,85,247,0)} 50%{box-shadow:0 0 22px 2px rgba(168,85,247,0.65)} }
  @keyframes chipFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
  @keyframes nodeBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }

  .lp-root * { box-sizing: border-box; }
  .lp-root { font-family: 'Sora', sans-serif; background: #04050a; color: #eef0f7; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
  .lp-root a { text-decoration: none; }
  .lp-link:hover { color: #fff !important; }
  .lp-link-ghost:hover { color: #ffd60a !important; }
  .lp-btn-nav { font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:15px; color:#06070c; padding:10px 22px; border-radius:12px; background:linear-gradient(135deg,#ffe66b,#ffb300); border:none; cursor:pointer; box-shadow:0 8px 24px -6px rgba(255,179,0,0.55); transition:transform .2s,box-shadow .2s; }
  .lp-btn-nav:hover { transform:translateY(-2px); box-shadow:0 14px 34px -6px rgba(255,179,0,0.8); }
  .lp-btn-gold { transition: transform .2s, box-shadow .2s; }
  .lp-hover-lift:hover { transform:translateY(-2px) !important; box-shadow:0 26px 66px -10px rgba(255,179,0,0.9) !important; }
  .lp-hover-feat:hover { border-color:rgba(167,139,250,0.5) !important; transform:translateY(-6px) !important; box-shadow:0 26px 60px -30px rgba(124,58,237,0.65) !important; transition:border-color .2s,transform .2s,box-shadow .2s !important; }
  .lp-hover-xp:hover { transform:translateY(-6px) !important; border-color:rgba(168,85,247,0.5) !important; box-shadow:0 30px 66px -30px rgba(124,58,237,0.7) !important; transition:all .2s !important; }
  .lp-hover-streak:hover { transform:translateY(-6px) !important; border-color:rgba(255,120,0,0.5) !important; box-shadow:0 30px 66px -30px rgba(255,120,0,0.55) !important; transition:all .2s !important; }
  .lp-hover-gate:hover { transform:translateY(-6px) !important; border-color:rgba(255,214,10,0.45) !important; box-shadow:0 30px 66px -30px rgba(255,214,10,0.4) !important; transition:all .2s !important; }
  .lp-hover-test:hover { transform:translateY(-6px) !important; border-color:rgba(255,214,10,0.4) !important; box-shadow:0 26px 60px -30px rgba(0,0,0,0.8) !important; transition:all .2s !important; }
  .lp-stat-card:hover { border-color:rgba(255,214,10,0.35) !important; box-shadow:0 20px 54px -24px rgba(255,214,10,0.25) !important; transition:all .2s !important; }
  .lp-faq-row:hover { border-color:rgba(255,214,10,0.3) !important; }
  .lp-nav-links { display:flex; gap:28px; }
  .lp-nav-cta-desktop { display:block; }
  .lp-hamburger { display:none; flex-direction:column; justify-content:center; align-items:center; gap:5px; width:40px; height:40px; background:rgba(148,163,255,0.08); border:1px solid rgba(148,163,255,0.15); border-radius:10px; cursor:pointer; padding:0; }
  .lp-ham-line { display:block; width:18px; height:2px; background:#eef0f7; border-radius:2px; transition:transform .25s, opacity .25s; }
  .lp-ham-top.open { transform:translateY(7px) rotate(45deg); }
  .lp-ham-mid.open { opacity:0; }
  .lp-ham-bot.open { transform:translateY(-7px) rotate(-45deg); }
  .lp-drawer { position:fixed; top:61px; left:0; right:0; z-index:49; background:rgba(6,8,15,0.97); backdrop-filter:blur(20px); border-bottom:1px solid rgba(148,163,255,0.1); transform:translateY(-110%); transition:transform .3s cubic-bezier(.2,.8,.2,1); }
  .lp-drawer.open { transform:translateY(0); }
  .lp-hero-teacher-mobile { display:none; }

  /* ── tablet ── */
  @media (max-width:900px) {
    .lp-hero-grid { grid-template-columns:1fr !important; text-align:center; padding:32px 24px 24px !important; min-height:auto !important; }
    .lp-hero-teacher { display:none !important; }
    .lp-hero-teacher-mobile { display:flex !important; }
    .lp-grid-3 { grid-template-columns:1fr 1fr !important; }
    .lp-grid-4 { grid-template-columns:1fr 1fr !important; }
    .lp-journey-inner { grid-template-columns:1fr !important; gap:24px !important; padding:24px !important; }
    .lp-hero-btns { justify-content:center !important; }
    .lp-hero-chips { justify-content:center !important; }
    section { padding-top:64px !important; padding-bottom:40px !important; }
  }

  /* ── tablet: hide links, show hamburger ── */
  @media (max-width:768px) {
    .lp-nav-links { display:none !important; }
    .lp-nav-cta-desktop { display:none !important; }
    .lp-hamburger { display:flex !important; }
  }

  /* ── mobile ── */
  @media (max-width:600px) {
    nav { padding:12px 16px !important; }
    .lp-hero-grid { padding:20px 16px 20px !important; }
    .lp-grid-3 { grid-template-columns:1fr !important; }
    .lp-grid-4 { grid-template-columns:1fr 1fr !important; }
    section { padding-left:16px !important; padding-right:16px !important; padding-top:56px !important; padding-bottom:32px !important; }
    .lp-drawer { top:57px; }

    /* comparison: hide desktop table, show mobile cards */
    .lp-comp-desktop { display:none !important; }
    .lp-comp-mobile { display:flex !important; }

    footer { flex-direction:column !important; align-items:flex-start !important; gap:16px !important; padding:24px 16px !important; }
    footer > div:last-child { display:none !important; }
  }
`;
