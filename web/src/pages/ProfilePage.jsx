import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useProgressStore } from '../store/progressStore';
import api from '../lib/api';
import s from './ProfilePage.module.css';

const SOCIAL_ICONS = { instagram:'📸', twitter:'🐦', linkedin:'💼', facebook:'📘', github:'🐙', tiktok:'🎵' };

const LEVEL_ORDER = ['A1.1','A1.2','A2.1','A2.2','B1.1','B1.2','B2.1','B2.2','C1.1','C1.2'];

function AvatarRing({ letter, size = 96 }) {
  return (
    <div className={s.avatarOuter} style={{ width: size + 16, height: size + 16 }}>
      <motion.div className={s.avatarRingAnim}
        animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        style={{ width: size + 16, height: size + 16 }}
      />
      <div className={s.avatarInner} style={{ width: size, height: size, fontSize: size * 0.38 }}>
        {letter}
      </div>
    </div>
  );
}

function StatTile({ icon, value, label, accent }) {
  return (
    <motion.div className={s.statTile}
      whileHover={{ y: -3, scale: 1.02 }}
      style={{ '--accent': accent }}
    >
      <div className={s.statIcon}>{icon}</div>
      <div className={s.statValue}>{value}</div>
      <div className={s.statLabel}>{label}</div>
    </motion.div>
  );
}

function LevelBar({ currentLevel }) {
  const idx = LEVEL_ORDER.indexOf(currentLevel);
  const pct = idx < 0 ? 0 : Math.round(((idx + 1) / LEVEL_ORDER.length) * 100);
  return (
    <div className={s.levelBarWrap}>
      <div className={s.levelBarLabels}>
        <span>A1.1</span>
        <span style={{ color: 'var(--text)', fontWeight: 800 }}>{currentLevel || 'A1.1'}</span>
        <span>C1.2</span>
      </div>
      <div className={s.levelBarTrack}>
        <motion.div className={s.levelBarFill}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: [.22, 1, .36, 1] }}
        />
        <motion.div className={s.levelBarDot}
          initial={{ left: 0 }}
          animate={{ left: `${pct}%` }}
          transition={{ duration: 1.2, ease: [.22, 1, .36, 1] }}
        />
      </div>
      <div className={s.levelBarMilestones}>
        {['A1', 'A2', 'B1', 'B2', 'C1'].map((lv, i) => (
          <div key={lv} className={s.milestone}>
            <div className={`${s.milestoneDot} ${pct >= (i + 1) * 20 ? s.milestoneDone : ''}`} />
            <span>{lv}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({ title, icon, children, collapsible = false, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={s.section}>
      <button className={s.sectionHeader} onClick={() => collapsible && setOpen(o => !o)}>
        <div className={s.sectionTitle}>
          <span className={s.sectionIcon}>{icon}</span>
          <span>{title}</span>
        </div>
        {collapsible && (
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: .25 }} style={{ display:'inline-block', color:'var(--text3)', fontSize:12 }}>▼</motion.span>
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: .28, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className={s.sectionBody}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const { stats, progress, reset } = useProgressStore();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm]         = useState({
    displayName: user?.displayName || '',
    mobile: user?.mobile || '',
    audioEnabled: user?.audioEnabled !== false,
  });
  const [pwForm, setPwForm]   = useState({ current: '', next: '' });
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState({ text: '', ok: true });
  const [confirmReset, setConfirmReset] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const flash = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text:'', ok:true }), 3000); };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const r = await api.patch('/api/auth/profile', form);
      updateUser(r.data.user);
      setEditMode(false);
      flash('Profil gespeichert ✓');
    } catch { flash('Fehler beim Speichern.', false); }
    setSaving(false);
  };

  const changePw = async () => {
    if (!pwForm.current || !pwForm.next) return;
    setSaving(true);
    try {
      await api.patch('/api/auth/change-password', { currentPassword: pwForm.current, newPassword: pwForm.next });
      setShowPw(false);
      setPwForm({ current: '', next: '' });
      flash('Passwort erfolgreich geändert ✓');
    } catch (e) { flash(e.response?.data?.error || 'Fehler.', false); }
    setSaving(false);
  };

  const handleReset = async () => {
    await reset();
    setConfirmReset(false);
    navigate('/');
  };

  const letter = user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Schüler';
  const currentLevel = progress?.currentLevel || user?.level || 'A1.1';
  const levelIdx = LEVEL_ORDER.indexOf(currentLevel);
  const levelPct = levelIdx < 0 ? 0 : Math.round(((levelIdx + 1) / LEVEL_ORDER.length) * 100);

  const streak      = stats?.streakCount       || stats?.streak       || 0;
  const tasksDone   = stats?.totalTasksCompleted || 0;
  const xp          = user?.xp || 0;
  const wordsLearned = stats?.wordsLearned || 0;
  const studyMins   = stats?.totalMinutes  || 0;
  const joinDate    = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }) : null;

  return (
    <div className={s.page}>

      {/* ── Flash message ── */}
      <AnimatePresence>
        {msg.text && (
          <motion.div className={`${s.flash} ${msg.ok ? s.flashOk : s.flashErr}`}
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {msg.ok ? '✓' : '⚠'} {msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero ── */}
      <div className={s.hero}>
        <div className={s.heroBg} />

        <div className={s.heroContent}>
          <AvatarRing letter={letter} size={88} />

          <div className={s.heroInfo}>
            <div className={s.heroName}>{displayName}</div>
            <div className={s.heroEmail}>{user?.email}</div>
            <div className={s.heroBadges}>
              <span className={s.levelBadge}>⚡ {currentLevel}</span>
              {streak >= 7 && <span className={s.streakBadge}>🔥 {streak} Tage Streak</span>}
              {joinDate && <span className={s.joinBadge}>📅 Seit {joinDate}</span>}
            </div>
          </div>

          <button className={s.editToggle} onClick={() => setEditMode(e => !e)}>
            {editMode ? '✕ Abbrechen' : '✏️ Bearbeiten'}
          </button>
        </div>
      </div>

      <div className={s.body}>

        {/* ── Level progress ── */}
        <Section title="Lernfortschritt" icon="📈">
          <LevelBar currentLevel={currentLevel} />
          <div className={s.levelCaption}>
            Du bist auf Level <strong>{currentLevel}</strong> — {levelPct}% des gesamten Weges bis C1.2 erreicht.
          </div>
        </Section>

        {/* ── Stats grid ── */}
        <Section title="Deine Statistiken" icon="📊">
          <div className={s.statsGrid}>
            <StatTile icon="🔥" value={streak} label="Tage Streak" accent="#f97316" />
            <StatTile icon="✅" value={tasksDone} label="Aufgaben" accent="#22c55e" />
            <StatTile icon="⭐" value={`${xp} XP`} label="Erfahrung" accent="#eab308" />
            <StatTile icon="📖" value={wordsLearned} label="Wörter" accent="#8b5cf6" />
            <StatTile icon="⏱️" value={`${Math.floor(studyMins / 60)}h ${studyMins % 60}m`} label="Lernzeit" accent="#06b6d4" />
            <StatTile icon="🎯" value={currentLevel} label="Aktuelles Level" accent="#ec4899" />
          </div>
        </Section>

        {/* ── Edit profile ── */}
        <AnimatePresence>
          {editMode && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
              <Section title="Profil bearbeiten" icon="👤">
                <div className={s.fieldGroup}>
                  <label className={s.fieldLabel}>Anzeigename</label>
                  <input className={s.fieldInput} value={form.displayName}
                    onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                    placeholder="Dein Name" />
                </div>
                <div className={s.fieldGroup}>
                  <label className={s.fieldLabel}>Handynummer</label>
                  <input className={s.fieldInput} value={form.mobile} type="tel"
                    onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
                    placeholder="+49 …" />
                </div>
                <label className={s.toggleRow}>
                  <div>
                    <div className={s.toggleLabel}>Audio-Anweisungen</div>
                    <div className={s.toggleSub}>Aussprache-Beispiele automatisch abspielen</div>
                  </div>
                  <div className={`${s.toggleSwitch} ${form.audioEnabled ? s.toggleOn : ''}`}
                    onClick={() => setForm(f => ({ ...f, audioEnabled: !f.audioEnabled }))}>
                    <motion.div className={s.toggleThumb} animate={{ x: form.audioEnabled ? 20 : 2 }} transition={{ duration: .2 }} />
                  </div>
                </label>
                <button className={s.primaryBtn} onClick={saveProfile} disabled={saving}>
                  {saving ? <span className={s.spinner} /> : '💾 Speichern'}
                </button>
              </Section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Social profiles ── */}
        {user?.socialProfiles?.length > 0 && (
          <Section title="Soziale Profile" icon="🌐" collapsible defaultOpen={false}>
            <div className={s.socialList}>
              {user.socialProfiles.map((sp, i) => (
                <div key={i} className={s.socialItem}>
                  <span className={s.socialIcon}>{SOCIAL_ICONS[sp.platform] || '🔗'}</span>
                  <span className={s.socialPlatform}>{sp.platform}</span>
                  <span className={s.socialHandle}>{sp.handle}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Security ── */}
        <Section title="Sicherheit" icon="🔐" collapsible defaultOpen={false}>
          <button className={s.actionRow} onClick={() => setShowPw(p => !p)}>
            <div className={s.actionRowLeft}>
              <span className={s.actionIcon}>🔑</span>
              <div>
                <div className={s.actionTitle}>Passwort ändern</div>
                <div className={s.actionSub}>Letztes Update unbekannt</div>
              </div>
            </div>
            <motion.span animate={{ rotate: showPw ? 90 : 0 }} style={{ color: 'var(--text3)', fontSize: 18 }}>›</motion.span>
          </button>

          <AnimatePresence>
            {showPw && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}>
                <div className={s.pwForm}>
                  <input className={s.fieldInput} type="password" placeholder="Aktuelles Passwort"
                    value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} />
                  <input className={s.fieldInput} type="password" placeholder="Neues Passwort (mind. 6 Zeichen)"
                    value={pwForm.next} onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))} />
                  <button className={s.primaryBtn} onClick={changePw} disabled={saving || !pwForm.current || !pwForm.next}>
                    {saving ? <span className={s.spinner} /> : 'Passwort ändern'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        {/* ── Danger zone ── */}
        <Section title="Gefahrenzone" icon="⚠️" collapsible defaultOpen={false}>
          {!confirmReset ? (
            <button className={s.dangerRow} onClick={() => setConfirmReset(true)}>
              <div className={s.actionRowLeft}>
                <span className={s.actionIcon}>🔄</span>
                <div>
                  <div className={s.actionTitle} style={{ color: 'var(--red, #ef4444)' }}>Fortschritt zurücksetzen</div>
                  <div className={s.actionSub}>Alle Fortschritte dauerhaft löschen</div>
                </div>
              </div>
              <span style={{ color: 'var(--text3)', fontSize: 18 }}>›</span>
            </button>
          ) : (
            <motion.div className={s.confirmBox} initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }}>
              <p className={s.confirmText}>⚠️ Alle Fortschritte werden unwiderruflich gelöscht. Bist du sicher?</p>
              <div className={s.confirmBtns}>
                <button className={s.confirmCancel} onClick={() => setConfirmReset(false)}>Abbrechen</button>
                <button className={s.confirmDelete} onClick={handleReset}>Ja, alles löschen</button>
              </div>
            </motion.div>
          )}
        </Section>

        {/* ── Logout ── */}
        <motion.button className={s.logoutBtn} whileHover={{ scale: 1.01 }} whileTap={{ scale: .98 }}
          onClick={async () => { await logout(); navigate('/login'); }}>
          <span>🚪</span> Abmelden
        </motion.button>

      </div>
    </div>
  );
}
