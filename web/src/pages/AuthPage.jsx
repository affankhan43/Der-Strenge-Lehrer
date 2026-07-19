import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import TeacherAvatar from '../components/TeacherAvatar';
import s from './AuthPage.module.css';

const SOCIAL_PLATFORMS = ['instagram','twitter','linkedin','facebook','github'];

export default function AuthPage() {
  const [mode, setMode]     = useState('login'); // 'login' | 'signup'
  const [step, setStep]     = useState(1);       // signup multi-step
  const [form, setForm]     = useState({ email:'', password:'', displayName:'', mobile:'', socialProfiles:[] });
  const [socialInput, setSocialInput] = useState({ platform:'instagram', handle:'' });
  const [showPass, setShowPass] = useState(false);
  const { login, signup, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const set = (k, v) => { clearError(); setForm(f => ({ ...f, [k]: v })); };

  const handleLogin = async (e) => {
    e.preventDefault();
    const r = await login(form.email, form.password);
    if (r.ok) navigate('/');
  };

  const handleSignupStep1 = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return;
    setStep(2);
  };

  const handleSignupFinish = async () => {
    const r = await signup(form);
    if (r.ok) navigate('/');
  };

  const addSocial = () => {
    if (!socialInput.handle.trim()) return;
    set('socialProfiles', [...form.socialProfiles, { ...socialInput }]);
    setSocialInput({ platform: 'instagram', handle: '' });
  };

  const removeSocial = (i) => {
    set('socialProfiles', form.socialProfiles.filter((_, idx) => idx !== i));
  };

  return (
    <div className={s.page}>
      {/* Particles */}
      <div className={s.particles} aria-hidden>
        {Array.from({length:20}).map((_,i) => (
          <div key={i} className={s.particle} style={{
            left: `${Math.random()*100}%`,
            animationDuration: `${8+Math.random()*10}s`,
            animationDelay: `${Math.random()*8}s`,
            width: `${1+Math.random()*3}px`,
            height: `${1+Math.random()*3}px`,
          }}/>
        ))}
      </div>

      <div className={s.wrap}>
        {/* Teacher + title */}
        <div className={s.hero}>
          <div className="anim-breathe">
            <TeacherAvatar mood={mode === 'signup' && step === 2 ? 'happy' : 'normal'} size={90}/>
          </div>
          <div>
            <h1 className={s.title}>Der Strenge Lehrer</h1>
            <p className={s.sub}>
              {mode === 'login'
                ? 'Willkommen zurück. Ich hoffe, du hast geübt.'
                : step === 1
                ? 'Ein neuer Schüler. Mal sehen, was du drauf hast.'
                : 'Fast fertig. Noch ein paar Angaben.'}
            </p>
          </div>
        </div>

        {/* Card */}
        <motion.div
          className={s.card}
          key={mode + step}
          initial={{ opacity:0, y:30 }}
          animate={{ opacity:1, y:0 }}
          transition={{ type:'spring', stiffness:260, damping:22 }}
        >
          {error && (
            <div className={s.errorBanner} onClick={clearError}>
              ⚠️ {error}
            </div>
          )}

          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className={s.form}>
              <h2 className={s.formTitle}>Anmelden</h2>
              <label className={s.label}>E-Mail</label>
              <input
                className={s.input}
                type="email" autoComplete="email"
                placeholder="du@beispiel.de"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                required
              />
              <label className={s.label}>Passwort</label>
              <div className={s.passWrap}>
                <input
                  className={s.input}
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  required
                />
                <button type="button" className={s.eyeBtn} onClick={() => setShowPass(p=>!p)}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              <button className={s.primaryBtn} disabled={loading} type="submit">
                {loading ? <span className="spinner" style={{width:20,height:20,margin:'0 auto'}}/> : 'Anmelden →'}
              </button>
              <p className={s.switchText}>
                Noch kein Konto?{' '}
                <button type="button" className={s.linkBtn} onClick={() => { setMode('signup'); setStep(1); clearError(); }}>
                  Registrieren
                </button>
              </p>
            </form>
          )}

          {/* ── SIGNUP STEP 1 ── */}
          {mode === 'signup' && step === 1 && (
            <form onSubmit={handleSignupStep1} className={s.form}>
              <h2 className={s.formTitle}>Konto erstellen</h2>
              <div className={s.stepDots}>
                <div className={`${s.dot} ${s.dotActive}`}/>
                <div className={s.dot}/>
              </div>
              <label className={s.label}>E-Mail *</label>
              <input
                className={s.input}
                type="email" autoComplete="email"
                placeholder="du@beispiel.de"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                required
              />
              <label className={s.label}>Passwort * (mind. 6 Zeichen)</label>
              <div className={s.passWrap}>
                <input
                  className={s.input}
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Sicher und unvergesslich"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  minLength={6}
                  required
                />
                <button type="button" className={s.eyeBtn} onClick={() => setShowPass(p=>!p)}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              <label className={s.label}>Anzeigename</label>
              <input
                className={s.input}
                type="text"
                placeholder="Dein Name (optional)"
                value={form.displayName}
                onChange={e => set('displayName', e.target.value)}
              />
              <button className={s.primaryBtn} type="submit">
                Weiter →
              </button>
              <p className={s.switchText}>
                Schon ein Konto?{' '}
                <button type="button" className={s.linkBtn} onClick={() => { setMode('login'); clearError(); }}>
                  Anmelden
                </button>
              </p>
            </form>
          )}

          {/* ── SIGNUP STEP 2 ── */}
          {mode === 'signup' && step === 2 && (
            <div className={s.form}>
              <h2 className={s.formTitle}>Profil vervollständigen</h2>
              <div className={s.stepDots}>
                <div className={s.dot}/>
                <div className={`${s.dot} ${s.dotActive}`}/>
              </div>
              <p className={s.optionalNote}>Alles optional — du kannst das später ausfüllen.</p>

              <label className={s.label}>Handynummer</label>
              <input
                className={s.input}
                type="tel"
                placeholder="+49 123 456 7890"
                value={form.mobile}
                onChange={e => set('mobile', e.target.value)}
              />

              <label className={s.label}>Soziale Profile</label>
              <div className={s.socialRow}>
                <select
                  className={s.select}
                  value={socialInput.platform}
                  onChange={e => setSocialInput(p => ({ ...p, platform: e.target.value }))}
                >
                  {SOCIAL_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <input
                  className={`${s.input} ${s.flex1}`}
                  type="text"
                  placeholder="@handle"
                  value={socialInput.handle}
                  onChange={e => setSocialInput(p => ({ ...p, handle: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSocial())}
                />
                <button type="button" className={s.addBtn} onClick={addSocial}>+</button>
              </div>
              {form.socialProfiles.map((sp, i) => (
                <div key={i} className={s.socialChip}>
                  <span>{sp.platform}</span>
                  <span className={s.handle}>{sp.handle}</span>
                  <button onClick={() => removeSocial(i)} className={s.removeBtn}>✕</button>
                </div>
              ))}

              <div className={s.btnRow}>
                <button
                  className={s.secondaryBtn}
                  onClick={() => setStep(1)}
                >← Zurück</button>
                <button
                  className={s.primaryBtn}
                  onClick={handleSignupFinish}
                  disabled={loading}
                  style={{flex:1}}
                >
                  {loading ? <span className="spinner" style={{width:20,height:20,margin:'0 auto'}}/> : 'Loslegen 🎓'}
                </button>
              </div>
            </div>
          )}
        </motion.div>

        <p className={s.footer}>A2 → B2 · 28 Tage · 140 Aufgaben · Kein Ausreden.</p>
      </div>
    </div>
  );
}
