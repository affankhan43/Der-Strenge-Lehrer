import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgressStore } from '../store/progressStore';
import { useAuthStore } from '../store/authStore';
import { useReferralStore } from '../store/referralStore';
import {
  IconHistory, IconFlame, IconTrophy, IconUser,
  IconLogOut, IconChevronRight, IconSun,
} from '../components/Icons';
import s from './HistoryPage.module.css';

/* ── helpers ── */
function fmt(m) {
  if (!m) return '0 min';
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60), mm = m % 60;
  return mm ? `${h}h ${mm}m` : `${h}h`;
}
function pct(done, total) { return total ? Math.round((done / total) * 100) : 0; }

const TASK_ICONS = { anki: '🃏', video: '📺', reading: '📖', grammar: '✏️', speaking: '🎤' };
const LEVEL_COLORS = {
  A1: '#22c55e', A2: '#3b82f6', B1: '#8b5cf6', B2: '#ec4899', C1: '#f97316',
};
function lvlColor(lvl) {
  if (typeof lvl !== 'string') return '#8b5cf6';
  return LEVEL_COLORS[lvl.slice(0, 2)] || '#8b5cf6';
}

/* ── Referral Panel ── */
function ReferralPanel({ user }) {
  const { code, referrals, totalBonus, init, addReferral } = useReferralStore();
  const [copied, setCopied] = useState(false);
  const [demoName, setDemoName] = useState('');

  useEffect(() => { if (user) init(user); }, [user]);

  const link = `https://strenge-lehrer.de/join?ref=${code}`;

  const copy = useCallback(() => {
    navigator.clipboard?.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [link]);

  const shareMsg = encodeURIComponent(
    `Ich lerne Deutsch mit Der Strenge Lehrer — A1 bis B2 kostenlos! Mach mit: ${link}`
  );

  return (
    <div className={s.referralCard}>
      {/* Header */}
      <div className={s.refHeader}>
        <div className={s.refHeaderLeft}>
          <div className={s.refIconWrap}>
            <span className={s.refIconEmoji}>🎁</span>
          </div>
          <div>
            <h2 className={s.refTitle}>Freunde einladen</h2>
            <p className={s.refSub}>+50 XP für dich und deinen Freund für jede Einladung</p>
          </div>
        </div>
        <div className={s.refBonusPill}>
          <span className={s.refBonusXP}>+{totalBonus}</span>
          <span className={s.refBonusLabel}>XP verdient</span>
        </div>
      </div>

      {/* Code block */}
      <div className={s.refCodeBlock}>
        <div className={s.refCodeWrap}>
          <span className={s.refCodeLabel}>Dein Einladungslink</span>
          <span className={s.refCodeText}>{link}</span>
        </div>
        <button className={`${s.refCopyBtn} ${copied ? s.refCopyBtnDone : ''}`} onClick={copy}>
          {copied ? '✓ Kopiert!' : '📋 Kopieren'}
        </button>
      </div>

      {/* Share row */}
      <div className={s.refShareRow}>
        <span className={s.refShareLabel}>Teilen via:</span>
        <a
          href={`https://wa.me/?text=${shareMsg}`}
          target="_blank" rel="noopener noreferrer"
          className={s.refShareBtn}
          style={{ '--sc': '#25d366' }}
        >
          <span>💬</span> WhatsApp
        </a>
        <a
          href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${shareMsg}`}
          target="_blank" rel="noopener noreferrer"
          className={s.refShareBtn}
          style={{ '--sc': '#0088cc' }}
        >
          <span>✈️</span> Telegram
        </a>
        <a
          href={`mailto:?subject=Deutsch lernen - kostenlos!&body=${decodeURIComponent(shareMsg)}`}
          className={s.refShareBtn}
          style={{ '--sc': '#6366f1' }}
        >
          <span>✉️</span> E-Mail
        </a>
      </div>

      {/* How it works */}
      <div className={s.refSteps}>
        {[
          { n: '1', icon: '🔗', text: 'Link kopieren & teilen' },
          { n: '2', icon: '👤', text: 'Freund registriert sich' },
          { n: '3', icon: '⭐', text: 'Beide erhalten 50 XP' },
        ].map(step => (
          <div key={step.n} className={s.refStep}>
            <div className={s.refStepNum}>{step.n}</div>
            <div className={s.refStepIcon}>{step.icon}</div>
            <div className={s.refStepText}>{step.text}</div>
          </div>
        ))}
      </div>

      {/* Referrals list */}
      {referrals.length > 0 && (
        <div className={s.refList}>
          <div className={s.refListHeader}>
            <span className={s.refListTitle}>Eingeladene Freunde ({referrals.length})</span>
          </div>
          {referrals.map((r, i) => (
            <motion.div key={i} className={s.refListItem}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className={s.refListAvatar}>{r.name[0].toUpperCase()}</div>
              <div className={s.refListInfo}>
                <span className={s.refListName}>{r.name}</span>
                <span className={s.refListDate}>Beigetreten {r.joinedAt}</span>
              </div>
              <span className={s.refListXP}>+{r.xpEarned} XP</span>
            </motion.div>
          ))}
        </div>
      )}

      {referrals.length === 0 && (
        <div className={s.refEmpty}>
          <span className={s.refEmptyIcon}>👥</span>
          <p>Noch keine Freunde eingeladen. Teile deinen Link und verdiene XP!</p>
        </div>
      )}
    </div>
  );
}

/* ── Day card ── */
function DayCard({ day, index }) {
  const [open, setOpen] = useState(false);
  const done = (day.tasks || []).filter(t => t.completed).length;
  const total = (day.tasks || []).length;
  const completion = pct(done, total);

  return (
    <motion.div
      className={s.dayCard}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, ease: [.22, 1, .36, 1] }}
    >
      <button className={s.daySummary} onClick={() => setOpen(o => !o)}>
        {/* Left */}
        <div className={s.dayLeft}>
          <div className={s.dayNumBadge}>
            <span className={s.dayNumLabel}>Tag</span>
            <span className={s.dayNumVal}>{day.day}</span>
          </div>
          <div className={s.dayMeta}>
            <span className={s.dayDate}>{day.date}</span>
            <div className={s.dayProgressBar}>
              <div className={s.dayProgressFill} style={{ width: `${completion}%` }} />
            </div>
            <span className={s.dayTaskCount}>{done}/{total} Aufgaben</span>
          </div>
        </div>

        {/* Right */}
        <div className={s.dayRight}>
          <div className={s.dayTime}>
            <span className={s.dayTimeVal}>{fmt(day.minutesSpent)}</span>
            <span className={s.dayTimeLbl}>Zeit</span>
          </div>
          <div className={`${s.dayStatus} ${completion === 100 ? s.dayStatusDone : s.dayStatusPartial}`}>
            {completion === 100 ? '✓' : `${completion}%`}
          </div>
          <motion.div
            className={s.dayChevron}
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: .2 }}
          >
            <IconChevronRight size={15} />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: .24, ease: [.22, 1, .36, 1] }}
            className={s.dayBody}
          >
            <div className={s.dayBodyInner}>
              {(day.tasks || []).map((t, i) => (
                <div key={t.taskId || i} className={`${s.taskRow} ${t.completed ? s.taskDone : s.taskSkip}`}>
                  <span className={s.taskIcon}>{TASK_ICONS[t.type] || '📌'}</span>
                  <span className={s.taskTitle}>{t.title || t.taskId}</span>
                  <span className={s.taskTime}>{fmt(t.minutesSpent)}</span>
                  <span className={s.taskCheck}>{t.completed ? '✓' : '—'}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Stat tile ── */
function StatTile({ value, label, icon, color, sub }) {
  return (
    <motion.div
      className={s.statTile}
      style={{ '--tc': color }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .4, ease: [.22, 1, .36, 1] }}
    >
      <div className={s.statIconWrap}>{icon}</div>
      <div className={s.statVal}>{value}</div>
      <div className={s.statLabel}>{label}</div>
      {sub && <div className={s.statSub}>{sub}</div>}
    </motion.div>
  );
}

/* ── Main ── */
export default function HistoryPage() {
  const { history, stats, progress, fetchHistory, fetchAll, loading } = useProgressStore();
  const { user } = useAuthStore();
  const [tab, setTab] = useState('history'); // 'history' | 'referral'

  useEffect(() => { fetchHistory(); fetchAll(); }, []);

  const lvl = progress?.currentLevel || user?.level || 'A1.1';
  const color = lvlColor(lvl);
  const totalDays = (history || []).length;
  const completedDays = (history || []).filter(d => {
    const tasks = d.tasks || [];
    return tasks.length > 0 && tasks.every(t => t.completed);
  }).length;

  return (
    <div className={s.page}>

      {/* ── Hero header ── */}
      <div className={s.hero}>
        <div className={s.heroBg} />
        <div className={s.heroContent}>
          <div className={s.heroLeft}>
            <div className={s.heroIcon}>
              <IconHistory size={26} />
            </div>
            <div>
              <h1 className={s.heroTitle}>Lernverlauf</h1>
              <p className={s.heroSub}>Dein Fortschritt auf einen Blick</p>
            </div>
          </div>
          <div className={s.levelChip} style={{ '--lc': color }}>
            <span className={s.levelChipBadge} style={{ background: color }}>{lvl}</span>
            <span className={s.levelChipLabel}>Aktuelles Level</span>
          </div>
        </div>

        {/* Stat tiles */}
        <div className={s.statsGrid}>
          <StatTile
            value={stats?.streakCount || 0}
            label="Aktueller Streak"
            icon={<IconFlame size={18} />}
            color="#f97316"
            sub={`Best: ${stats?.longestStreak || 0}`}
          />
          <StatTile
            value={stats?.totalTasksCompleted || 0}
            label="Aufgaben gesamt"
            icon="📌"
            color="#8b5cf6"
          />
          <StatTile
            value={fmt(stats?.totalMinutesSpent)}
            label="Lernzeit gesamt"
            icon={<IconSun size={18} />}
            color="#3b82f6"
          />
          <StatTile
            value={`${completedDays}/${totalDays}`}
            label="Tage abgeschlossen"
            icon={<IconTrophy size={18} />}
            color="#22c55e"
            sub={totalDays > 0 ? `${pct(completedDays, totalDays)}% Abschlussrate` : null}
          />
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className={s.tabs}>
        <button
          className={`${s.tab} ${tab === 'history' ? s.tabActive : ''}`}
          onClick={() => setTab('history')}
        >
          <IconHistory size={15} /> Verlauf
        </button>
        <button
          className={`${s.tab} ${tab === 'referral' ? s.tabActive : ''}`}
          onClick={() => setTab('referral')}
        >
          🎁 Freunde einladen
        </button>
      </div>

      {/* ── Content ── */}
      <div className={s.content}>
        <AnimatePresence mode="wait">
          {tab === 'history' && (
            <motion.div key="history"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }} transition={{ duration: .18 }}
            >
              {loading && (
                <div className={s.loadingRow}>
                  {[1, 2, 3].map(i => <div key={i} className={s.skeleton} />)}
                </div>
              )}

              {!loading && (!history || history.length === 0) && (
                <motion.div className={s.empty}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                >
                  <div className={s.emptyIcon}>📅</div>
                  <h3 className={s.emptyTitle}>Noch kein Verlauf</h3>
                  <p className={s.emptySub}>Schließe deinen ersten Tag ab,<br />um hier deinen Fortschritt zu sehen.</p>
                </motion.div>
              )}

              <div className={s.dayList}>
                {(history || []).slice().reverse().map((day, i) => (
                  <DayCard key={day.day} day={day} index={i} />
                ))}
              </div>
            </motion.div>
          )}

          {tab === 'referral' && (
            <motion.div key="referral"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }} transition={{ duration: .18 }}
            >
              <ReferralPanel user={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
