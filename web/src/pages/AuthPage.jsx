import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import TeacherAvatar from '../components/TeacherAvatar';
import s from './AuthPage.module.css';

const PLATFORMS = [
  { id: 'instagram', icon: '📸', label: 'Instagram' },
  { id: 'twitter',   icon: '🐦', label: 'X / Twitter' },
  { id: 'linkedin',  icon: '💼', label: 'LinkedIn' },
  { id: 'tiktok',    icon: '🎵', label: 'TikTok' },
  { id: 'github',    icon: '🐙', label: 'GitHub' },
];

const QUIPS_LOGIN  = ['Willkommen zurück. Ich hoffe, du hast geübt.', 'Du bist spät. Los geht\'s.', 'Kein Deutsch ohne Disziplin.'];
const QUIPS_STEP1  = ['Ein neuer Schüler. Mal sehen, was du drauf hast.', 'Der Weg zu B2 beginnt hier.', 'Kein Ausreden. Nur Deutsch.'];
const QUIPS_STEP2  = ['Fast fertig. Noch ein paar Angaben — alles optional.', 'Persönliche Details? Nur wenn du willst.'];

function pickQuip(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/* ── Animated background orbs (static positions, seeded) ── */
const ORBS = [
  { w:600, h:600, x:'68%',  y:'-15%', c:'rgba(124,58,237,.09)',  dur:20 },
  { w:450, h:450, x:'-10%', y:'55%',  c:'rgba(232,197,71,.06)',  dur:26 },
  { w:380, h:380, x:'40%',  y:'75%',  c:'rgba(91,141,238,.07)',  dur:18 },
  { w:300, h:300, x:'15%',  y:'5%',   c:'rgba(236,72,153,.055)', dur:30 },
];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export default function AuthPage() {
  const [mode, setMode]   = useState('login');
  const [step, setStep]   = useState(1);
  const [dir,  setDir]    = useState(1);
  const [form, setForm]   = useState({ email:'', password:'', displayName:'', mobile:'', socialProfiles:[] });
  const [socialInput, setSocialInput] = useState({ platform:'instagram', handle:'' });
  const [showPass, setShowPass] = useState(false);
  const { login, signup, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const quipRef = useRef({
    login: pickQuip(QUIPS_LOGIN),
    step1: pickQuip(QUIPS_STEP1),
    step2: pickQuip(QUIPS_STEP2),
  });

  const set = (k, v) => { clearError(); setForm(f => ({ ...f, [k]: v })); };

  const goStep = (n) => { setDir(n > step ? 1 : -1); setStep(n); };
  const goMode = (m) => { setDir(m === 'signup' ? 1 : -1); setMode(m); setStep(1); clearError(); };

  const handleLogin = async (e) => {
    e.preventDefault();
    const r = await login(form.email, form.password);
    if (r.ok) navigate('/');
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return;
    goStep(2);
  };

  const handleFinish = async () => {
    const r = await signup(form);
    if (r.ok) navigate('/');
  };

  const addSocial = () => {
    if (!socialInput.handle.trim()) return;
    set('socialProfiles', [...form.socialProfiles, { ...socialInput }]);
    setSocialInput({ platform: 'instagram', handle: '' });
  };
  const removeSocial = (i) => set('socialProfiles', form.socialProfiles.filter((_, idx) => idx !== i));

  const teacherMood = mode === 'signup' && step === 2 ? 'happy' : 'normal';
  const currentQuip = mode === 'login' ? quipRef.current.login
    : step === 1 ? quipRef.current.step1
    : quipRef.current.step2;

  return (
    <div className={s.page}>
      {/* ── Animated background ── */}
      <div className={s.bgLayer} aria-hidden>
        {ORBS.map((o, i) => (
          <motion.div key={i} className={s.orb}
            style={{ width:o.w, height:o.h, left:o.x, top:o.y, background:`radial-gradient(circle, ${o.c} 0%, transparent 70%)` }}
            animate={{ x:[0,25,-18,12,0], y:[0,-20,16,-8,0], scale:[1,1.06,0.97,1.03,1] }}
            transition={{ duration:o.dur, repeat:Infinity, ease:'easeInOut', delay:i*2.5 }}
          />
        ))}
        <div className={s.grid} />
        <div className={s.beamLeft} />
        <div className={s.beamRight} />
      </div>

      {/* ── Main split layout ── */}
      <div className={s.layout}>

        {/* Left brand panel */}
        <div className={s.brand}>
          <motion.div
            initial={{ opacity:0, x:-40 }}
            animate={{ opacity:1, x:0 }}
            transition={{ duration:.8, ease:[.22,1,.36,1] }}
            className={s.brandInner}
          >
            <div className={s.avatarRing}>
              <div className="anim-breathe">
                <TeacherAvatar mood={teacherMood} size={100} />
              </div>
            </div>
            <h1 className={s.brandTitle}>Der Strenge<br/>Lehrer</h1>
            <p className={s.brandSub}>Kein Ausreden. Nur Deutsch.</p>
            <div className={s.stats}>
              {[['A1→B2','Level'], ['112','Tage'], ['560','Aufgaben']].map(([n,l]) => (
                <div key={l} className={s.stat}>
                  <span className={s.statNum}>{n}</span>
                  <span className={s.statLab}>{l}</span>
                </div>
              ))}
            </div>
            <div className={s.testimonial}>
              <span className={s.stars}>★★★★★</span>
              <p className={s.testimonialText}>"In 28 Tagen von Null auf A1. Keine App hat das je geschafft."</p>
            </div>
          </motion.div>
        </div>

        {/* Right form panel */}
        <div className={s.formPanel}>
          <motion.div
            className={s.card}
            initial={{ opacity:0, y:40, scale:.97 }}
            animate={{ opacity:1, y:0, scale:1 }}
            transition={{ duration:.7, ease:[.22,1,.36,1], delay:.1 }}
          >
            {/* Teacher quip header */}
            <div className={s.cardHeader}>
              <div className={s.quipBubble}>
                <span className={s.quipEmoji}>
                  {mode === 'login' ? '😤' : step === 2 ? '🎓' : '🤨'}
                </span>
                <p className={s.quipText}>{currentQuip}</p>
              </div>
            </div>

            {/* Step indicator (signup only) */}
            {mode === 'signup' && (
              <div className={s.stepBar}>
                <div className={`${s.stepItem} ${step >= 1 ? s.stepDone : ''}`}>
                  <div className={s.stepCircle}>{step > 1 ? '✓' : '1'}</div>
                  <span>Konto</span>
                </div>
                <div className={`${s.stepLine} ${step >= 2 ? s.stepLineDone : ''}`} />
                <div className={`${s.stepItem} ${step >= 2 ? s.stepDone : ''}`}>
                  <div className={s.stepCircle}>2</div>
                  <span>Profil</span>
                </div>
              </div>
            )}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className={s.errorBanner}
                  initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  onClick={clearError}
                >
                  ⚠️ {error} <span className={s.errClose}>✕</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Forms ── */}
            <AnimatePresence mode="wait" custom={dir}>
              {mode === 'login' && (
                <motion.form key="login" custom={dir}
                  variants={slideVariants} initial="enter" animate="center" exit="exit"
                  transition={{ duration:.28, ease:'easeInOut' }}
                  onSubmit={handleLogin} className={s.form}
                >
                  <h2 className={s.formTitle}>Anmelden</h2>

                  <div className={s.field}>
                    <label className={s.label}>E-Mail</label>
                    <div className={s.inputWrap}>
                      <span className={s.inputIcon}>✉</span>
                      <input className={s.input} type="email" autoComplete="email"
                        placeholder="du@beispiel.de"
                        value={form.email} onChange={e => set('email', e.target.value)} required />
                    </div>
                  </div>

                  <div className={s.field}>
                    <label className={s.label}>Passwort</label>
                    <div className={s.inputWrap}>
                      <span className={s.inputIcon}>🔒</span>
                      <input className={s.input} type={showPass ? 'text' : 'password'} autoComplete="current-password"
                        placeholder="••••••••"
                        value={form.password} onChange={e => set('password', e.target.value)} required />
                      <button type="button" className={s.eyeBtn} onClick={() => setShowPass(p=>!p)}>
                        {showPass ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>

                  <button className={s.primaryBtn} disabled={loading} type="submit">
                    {loading
                      ? <span className={s.btnSpinner}/>
                      : <><span>Anmelden</span><span className={s.btnArrow}>→</span></>}
                  </button>

                  <p className={s.switchText}>
                    Noch kein Konto?{' '}
                    <button type="button" className={s.linkBtn} onClick={() => goMode('signup')}>
                      Jetzt registrieren
                    </button>
                  </p>
                </motion.form>
              )}

              {mode === 'signup' && step === 1 && (
                <motion.form key="s1" custom={dir}
                  variants={slideVariants} initial="enter" animate="center" exit="exit"
                  transition={{ duration:.28, ease:'easeInOut' }}
                  onSubmit={handleStep1} className={s.form}
                >
                  <h2 className={s.formTitle}>Konto erstellen</h2>

                  <div className={s.field}>
                    <label className={s.label}>E-Mail <span className={s.req}>*</span></label>
                    <div className={s.inputWrap}>
                      <span className={s.inputIcon}>✉</span>
                      <input className={s.input} type="email" autoComplete="email"
                        placeholder="du@beispiel.de"
                        value={form.email} onChange={e => set('email', e.target.value)} required />
                    </div>
                  </div>

                  <div className={s.field}>
                    <label className={s.label}>Passwort <span className={s.req}>*</span> <span className={s.hint}>(mind. 6 Zeichen)</span></label>
                    <div className={s.inputWrap}>
                      <span className={s.inputIcon}>🔒</span>
                      <input className={s.input} type={showPass ? 'text' : 'password'} autoComplete="new-password"
                        placeholder="Sicher und unvergesslich"
                        value={form.password} onChange={e => set('password', e.target.value)} minLength={6} required />
                      <button type="button" className={s.eyeBtn} onClick={() => setShowPass(p=>!p)}>
                        {showPass ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>

                  <div className={s.field}>
                    <label className={s.label}>Anzeigename <span className={s.optional}>(optional)</span></label>
                    <div className={s.inputWrap}>
                      <span className={s.inputIcon}>👤</span>
                      <input className={s.input} type="text"
                        placeholder="Dein Name"
                        value={form.displayName} onChange={e => set('displayName', e.target.value)} />
                    </div>
                  </div>

                  <button className={s.primaryBtn} type="submit">
                    <span>Weiter</span><span className={s.btnArrow}>→</span>
                  </button>

                  <p className={s.switchText}>
                    Schon ein Konto?{' '}
                    <button type="button" className={s.linkBtn} onClick={() => goMode('login')}>
                      Anmelden
                    </button>
                  </p>
                </motion.form>
              )}

              {mode === 'signup' && step === 2 && (
                <motion.div key="s2" custom={dir}
                  variants={slideVariants} initial="enter" animate="center" exit="exit"
                  transition={{ duration:.28, ease:'easeInOut' }}
                  className={s.form}
                >
                  <h2 className={s.formTitle}>Profil vervollständigen</h2>
                  <p className={s.optionalNote}>Alles auf dieser Seite ist optional — du kannst es jederzeit in den Einstellungen ändern.</p>

                  <div className={s.field}>
                    <label className={s.label}>Handynummer <span className={s.optional}>(optional)</span></label>
                    <div className={s.inputWrap}>
                      <span className={s.inputIcon}>📱</span>
                      <input className={s.input} type="tel"
                        placeholder="+49 123 456 7890"
                        value={form.mobile} onChange={e => set('mobile', e.target.value)} />
                    </div>
                  </div>

                  <div className={s.field}>
                    <label className={s.label}>Social Handles <span className={s.optional}>(optional)</span></label>
                    <div className={s.socialRow}>
                      <select className={s.select}
                        value={socialInput.platform}
                        onChange={e => setSocialInput(p => ({ ...p, platform: e.target.value }))}>
                        {PLATFORMS.map(p => (
                          <option key={p.id} value={p.id}>{p.icon} {p.label}</option>
                        ))}
                      </select>
                      <input className={`${s.input} ${s.flex1}`} type="text"
                        placeholder="@handle"
                        value={socialInput.handle}
                        onChange={e => setSocialInput(p => ({ ...p, handle: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSocial())} />
                      <button type="button" className={s.addBtn} onClick={addSocial}>+</button>
                    </div>
                    {form.socialProfiles.length > 0 && (
                      <div className={s.chips}>
                        {form.socialProfiles.map((sp, i) => {
                          const pm = PLATFORMS.find(p => p.id === sp.platform);
                          return (
                            <div key={i} className={s.chip}>
                              <span>{pm?.icon}</span>
                              <span className={s.chipHandle}>{sp.handle}</span>
                              <button onClick={() => removeSocial(i)} className={s.chipRemove}>✕</button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className={s.btnRow}>
                    <button className={s.secondaryBtn} onClick={() => goStep(1)}>← Zurück</button>
                    <button className={s.primaryBtn} onClick={handleFinish} disabled={loading} style={{flex:1}}>
                      {loading
                        ? <span className={s.btnSpinner}/>
                        : <><span>Loslegen</span><span className={s.btnArrow}>🎓</span></>}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <p className={s.footer}>A1 → B2 · 112 Tage · 560 Aufgaben · Kein Ausreden.</p>
        </div>
      </div>
    </div>
  );
}
