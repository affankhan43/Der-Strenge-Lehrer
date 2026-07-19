import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useProgressStore } from '../store/progressStore';
import api from '../lib/api';
import s from './ProfilePage.module.css';

const SOCIAL_ICONS = { instagram:'📸', twitter:'🐦', linkedin:'💼', facebook:'📘', github:'🐙' };

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const { stats, reset } = useProgressStore();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    displayName: user?.displayName || '',
    mobile: user?.mobile || '',
    audioEnabled: user?.audioEnabled !== false,
  });
  const [pwForm, setPwForm]   = useState({ current:'', next:'' });
  const [section, setSection] = useState(null); // 'password' | 'reset'
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState('');

  const save = async () => {
    setSaving(true);
    try {
      const r = await api.patch('/api/auth/profile', form);
      updateUser(r.data.user);
      setEditing(false); setMsg('Gespeichert ✓');
      setTimeout(() => setMsg(''), 2000);
    } catch { setMsg('Fehler beim Speichern.'); }
    setSaving(false);
  };

  const changePw = async () => {
    if (!pwForm.current || !pwForm.next) return;
    setSaving(true);
    try {
      await api.patch('/api/auth/change-password', { currentPassword: pwForm.current, newPassword: pwForm.next });
      setSection(null); setPwForm({current:'',next:''}); setMsg('Passwort geändert ✓');
      setTimeout(() => setMsg(''), 2000);
    } catch(e) { setMsg(e.response?.data?.error || 'Fehler.'); }
    setSaving(false);
  };

  const handleReset = async () => {
    await reset();
    setSection(null);
    navigate('/');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className={s.page}>
      <header className={s.header}>
        <button className={s.backBtn} onClick={() => navigate('/')}>← Zurück</button>
        <h1 className={s.title}>Profil</h1>
        <button className={s.editBtn} onClick={() => setEditing(e => !e)}>
          {editing ? 'Abbrechen' : 'Bearbeiten'}
        </button>
      </header>

      {msg && <div className={s.msgBanner}>{msg}</div>}

      {/* Avatar + name */}
      <div className={s.avatarSection}>
        <div className={s.avatar}>{user?.displayName?.[0]?.toUpperCase() || '👤'}</div>
        <h2 className={s.name}>{user?.displayName || 'Schüler'}</h2>
        <p className={s.email}>{user?.email}</p>
        {user?.badges?.length > 0 && (
          <div className={s.badges}>
            {user.badges.map(b => <span key={b} className={s.badge}>{b}</span>)}
          </div>
        )}
      </div>

      {/* Stats mini */}
      <div className={s.statsRow}>
        <StatCard num={stats?.streakCount||0}        label="🔥 Streak"/>
        <StatCard num={stats?.totalTasksCompleted||0} label="Aufgaben"/>
        <StatCard num={`${user?.xp||0} XP`}          label="XP" small/>
        <StatCard num={`Lv.${user?.level||1}`}        label="Level" small/>
      </div>

      <div className={s.sections}>
        {/* Edit profile */}
        {editing && (
          <motion.div className={s.card} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
            <h3 className={s.cardTitle}>Profil bearbeiten</h3>
            <label className={s.lbl}>Anzeigename</label>
            <input className={s.inp} value={form.displayName}
              onChange={e => setForm(f=>({...f,displayName:e.target.value}))} placeholder="Dein Name"/>
            <label className={s.lbl}>Handynummer</label>
            <input className={s.inp} value={form.mobile} type="tel"
              onChange={e => setForm(f=>({...f,mobile:e.target.value}))} placeholder="+49 …"/>
            <label className={s.toggle}>
              <span>Audio-Anweisungen</span>
              <input type="checkbox" checked={form.audioEnabled}
                onChange={e => setForm(f=>({...f,audioEnabled:e.target.checked}))}/>
              <span className={s.slider}/>
            </label>
            <button className={s.primaryBtn} onClick={save} disabled={saving}>
              {saving ? 'Speichere…' : 'Speichern'}
            </button>
          </motion.div>
        )}

        {/* Social profiles */}
        {user?.socialProfiles?.length > 0 && (
          <div className={s.card}>
            <h3 className={s.cardTitle}>Soziale Profile</h3>
            {user.socialProfiles.map((sp, i) => (
              <div key={i} className={s.socialRow}>
                <span>{SOCIAL_ICONS[sp.platform]||'🔗'} {sp.platform}</span>
                <span className={s.handle}>{sp.handle}</span>
              </div>
            ))}
          </div>
        )}

        {/* Password */}
        <div className={s.card}>
          <button className={s.rowBtn} onClick={() => setSection(section==='password'?null:'password')}>
            🔑 Passwort ändern <span>→</span>
          </button>
          {section === 'password' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{marginTop:12}}>
              <input className={s.inp} type="password" placeholder="Aktuelles Passwort"
                value={pwForm.current} onChange={e => setPwForm(f=>({...f,current:e.target.value}))}/>
              <input className={s.inp} type="password" placeholder="Neues Passwort (mind. 6)"
                value={pwForm.next} onChange={e => setPwForm(f=>({...f,next:e.target.value}))} style={{marginTop:8}}/>
              <button className={s.primaryBtn} onClick={changePw} disabled={saving} style={{marginTop:8}}>
                Ändern
              </button>
            </motion.div>
          )}
        </div>

        {/* Reset */}
        <div className={s.card}>
          <button className={s.rowBtn} style={{color:'var(--red)'}}
            onClick={() => setSection(section==='reset'?null:'reset')}>
            🔄 Fortschritt zurücksetzen <span>→</span>
          </button>
          {section === 'reset' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{marginTop:12}}>
              <p style={{fontSize:13,color:'var(--text2)',marginBottom:10}}>
                Alle Fortschritte werden gelöscht. Das ist nicht rückgängig zu machen.
              </p>
              <button className={s.dangerBtn} onClick={handleReset}>Ja, alles löschen</button>
            </motion.div>
          )}
        </div>

        {/* Logout */}
        <button className={s.logoutBtn} onClick={handleLogout}>Abmelden</button>
      </div>
    </div>
  );
}

function StatCard({ num, label, small }) {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',
      background:'rgba(255,255,255,.04)',border:'1px solid var(--border)',
      borderRadius:12,padding:'12px 10px',flex:1,gap:4}}>
      <span style={{fontSize:small?15:22,fontWeight:900,color:'var(--gold)',lineHeight:1}}>{num}</span>
      <span style={{fontSize:11,color:'var(--text3)'}}>{label}</span>
    </div>
  );
}
