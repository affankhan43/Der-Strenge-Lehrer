import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgressStore } from '../store/progressStore';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import s from './DashboardPage.module.css';

const LEVELS = [
  { name:'A1.1', startDay:1,   color:'#22c55e', emoji:'🌱', label:'Absolute Beginner' },
  { name:'A1.2', startDay:29,  color:'#10b981', emoji:'🌿', label:'Grundkenntnisse'   },
  { name:'A2.1', startDay:57,  color:'#3b82f6', emoji:'💧', label:'Grundstufe'        },
  { name:'A2.2', startDay:85,  color:'#6366f1', emoji:'⚡', label:'Elementar'         },
  { name:'B1.1', startDay:113, color:'#a855f7', emoji:'🔥', label:'Fortgeschritten'   },
  { name:'B1.2', startDay:141, color:'#ec4899', emoji:'💎', label:'Mittelstufe'       },
];

const TASK_ICONS = {
  vocab:'🃏', vocab_native:'🃏',
  video_embed:'📺', video:'📺',
  reading_native:'📖', reading:'📖',
  grammar_native:'✏️', grammar:'✏️',
  speaking:'🎤',
};
const TASK_LABELS = {
  vocab:'Vokabeln', vocab_native:'Vokabeln',
  video_embed:'Video', video:'Video',
  reading_native:'Lesen', reading:'Lesen',
  grammar_native:'Grammatik', grammar:'Grammatik',
  speaking:'Sprechen',
};
const TYPE_REMAP = {
  anki:'vocab', video:'video_embed', reading:'reading_native',
  grammar:'grammar_native', speaking:'video_embed',
};

function resolveType(raw) { return TYPE_REMAP[raw] || raw; }

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Guten Morgen';
  if (h < 18) return 'Guten Tag';
  return 'Guten Abend';
}

function LevelPickerModal({ onClose, onPick }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await api.post('/api/progress/set-level', { levelName: selected });
      onPick();
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  return (
    <motion.div
      className={s.modalOverlay}
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={onClose}
    >
      <motion.div
        className={s.modalBox}
        initial={{ opacity:0, y:60, scale:.95 }}
        animate={{ opacity:1, y:0, scale:1 }}
        exit={{ opacity:0, y:40, scale:.95 }}
        transition={{ type:'spring', stiffness:300, damping:28 }}
        onClick={e => e.stopPropagation()}
      >
        <div className={s.modalHeader}>
          <div>
            <h2 className={s.modalTitle}>Level wählen</h2>
            <p className={s.modalSub}>Wo möchtest du starten? Dein bisheriger Fortschritt wird zurückgesetzt.</p>
          </div>
          <button className={s.modalClose} onClick={onClose}>✕</button>
        </div>

        <div className={s.levelGrid}>
          {LEVELS.map(lv => (
            <button
              key={lv.name}
              className={`${s.levelCard} ${selected === lv.name ? s.levelCardSelected : ''}`}
              style={{ '--lv-color': lv.color }}
              onClick={() => setSelected(lv.name)}
            >
              <span className={s.levelEmoji}>{lv.emoji}</span>
              <span className={s.levelName}>{lv.name}</span>
              <span className={s.levelLabel}>{lv.label}</span>
              <span className={s.levelDay}>ab Tag {['A1.1','A1.2','A2.1','A2.2','B1.1','B1.2'].indexOf(lv.name)*28+1}</span>
              {selected === lv.name && (
                <motion.div className={s.levelCheck} initial={{scale:0}} animate={{scale:1}}>✓</motion.div>
              )}
            </button>
          ))}
        </div>

        <div className={s.modalFooter}>
          <button className={s.modalCancel} onClick={onClose}>Abbrechen</button>
          <button
            className={s.modalConfirm}
            disabled={!selected || loading}
            onClick={confirm}
            style={{ opacity: selected ? 1 : .5 }}
          >
            {loading ? '⏳ Wird gesetzt…' : `${selected || '…'} starten →`}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { progress, tasks, stats, fetchAll } = useProgressStore();
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const confettiRef = useRef(null);

  useEffect(() => { fetchAll(); }, []);

  const currentDay   = progress?.currentDay   || 1;
  const currentLevel = progress?.currentLevel || 'A1.1';
  const lvlInfo      = LEVELS.find(l => l.name === currentLevel) || LEVELS[0];
  const levelPct     = progress?.levelPct     || 0;

  const dayTasks = (tasks || [])
    .filter(t => t.day === currentDay)
    .sort((a, b) => a.order - b.order);

  const dayProgress = progress?.days?.find(d => d.day === currentDay);
  const completedIds = new Set(
    (dayProgress?.tasks || []).filter(t => t.completed).map(t => t.taskId)
  );
  const doneCount   = completedIds.size;
  const totalCount  = dayTasks.length;
  const dayPct      = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Schüler';

  const handleTaskClick = (task) => {
    const type = resolveType(task.type);
    navigate(`/app/task/${currentDay}/${task.order}`, { state: { task, type } });
  };

  const handleLevelPicked = () => {
    setShowLevelPicker(false);
    fetchAll();
  };

  // Stats derived
  const streak      = stats?.streak       || 0;
  const totalXP     = stats?.totalXP      || 0;
  const wordsLearned = stats?.wordsLearned || 0;
  const totalMins   = stats?.totalMinutes || 0;

  return (
    <div className={s.page}>

      {/* ── Header ── */}
      <header className={s.header}>
        <div className={s.headerGreeting}>
          <h1 className={s.greeting}>{getGreeting()}, {firstName}! 👋</h1>
          <p className={s.greetingSub}>Heute ist der perfekte Tag, um Deutsch zu meistern.</p>
        </div>
        <div className={s.headerRight}>
          <div className={s.streakChip}>
            <span>🔥</span>
            <span>{streak} Tage</span>
          </div>
          <button className={s.levelPickBtn} onClick={() => setShowLevelPicker(true)}>
            <span style={{ color: lvlInfo.color }}>{lvlInfo.emoji} {currentLevel}</span>
            <span className={s.levelPickArrow}>▾</span>
          </button>
        </div>
      </header>

      {/* ── Main grid ── */}
      <div className={s.grid}>

        {/* ── Left: Mission + Tasks ── */}
        <div className={s.mainCol}>

          {/* Mission card */}
          <motion.div
            className={s.missionCard}
            initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:.05 }}
          >
            <div className={s.missionBadge}>HEUTIGE MISSION</div>
            <div className={s.missionContent}>
              <div className={s.missionInfo}>
                <h2 className={s.missionTitle}>Tag {currentDay}</h2>
                <p className={s.missionLevel} style={{ color: lvlInfo.color }}>
                  {lvlInfo.emoji} {currentLevel} — {lvlInfo.label}
                </p>
                <p className={s.missionTime}>Ca. 30–45 Minuten</p>

                {/* Day progress ring */}
                <div className={s.progressRow}>
                  <div className={s.progressRing}>
                    <svg width="72" height="72" viewBox="0 0 72 72">
                      <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="5"/>
                      <motion.circle
                        cx="36" cy="36" r="30" fill="none"
                        stroke={lvlInfo.color}
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 30}`}
                        strokeDashoffset={`${2 * Math.PI * 30 * (1 - dayPct/100)}`}
                        style={{ transformOrigin:'center', rotate:'-90deg' }}
                        initial={{ strokeDashoffset: 2 * Math.PI * 30 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 30 * (1 - dayPct/100) }}
                        transition={{ duration:1.2, ease:'easeOut', delay:.3 }}
                      />
                    </svg>
                    <div className={s.ringLabel}>
                      <span className={s.ringPct}>{dayPct}%</span>
                      <span className={s.ringText}>heute</span>
                    </div>
                  </div>
                  <div className={s.progressText}>
                    <div className={s.progressFraction}>{doneCount}/{totalCount} Aufgaben</div>
                    <div className={s.progressSub}>erledigt</div>
                  </div>
                </div>

                {doneCount < totalCount ? (
                  <motion.button
                    className={s.startBtn}
                    style={{ '--btn-color': lvlInfo.color }}
                    whileHover={{ scale:1.03, y:-2 }}
                    whileTap={{ scale:.97 }}
                    onClick={() => {
                      const next = dayTasks.find(t => !completedIds.has(t.id));
                      if (next) handleTaskClick(next);
                    }}
                  >
                    ▶ {doneCount === 0 ? 'Mission starten' : 'Mission fortsetzen'}
                  </motion.button>
                ) : (
                  <div className={s.completedBanner}>
                    ✅ Tag {currentDay} abgeschlossen — Ausgezeichnet!
                  </div>
                )}
              </div>

              {/* Level path visual */}
              <div className={s.missionArt}>
                <div className={s.artEmoji}>{lvlInfo.emoji}</div>
                <div className={s.artLevel}>{currentLevel}</div>
                <div className={s.artBar}>
                  <div className={s.artBarTrack}>
                    <motion.div
                      className={s.artBarFill}
                      style={{ background: lvlInfo.color }}
                      initial={{ width:0 }}
                      animate={{ width: `${levelPct}%` }}
                      transition={{ duration:1.4, ease:'easeOut', delay:.4 }}
                    />
                  </div>
                  <span className={s.artBarLabel}>Level {levelPct}%</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Task list */}
          <div className={s.taskListHeader}>
            <span>Deine Aufgaben für heute</span>
            <span className={s.taskCount} style={{ color: doneCount===totalCount ? '#4ade80' : lvlInfo.color }}>
              {doneCount === totalCount ? '✓ Alle erledigt' : `${doneCount}/${totalCount} erledigt`}
            </span>
          </div>

          <div className={s.taskList}>
            {dayTasks.map((task, idx) => {
              const type    = resolveType(task.type);
              const done    = completedIds.has(task.id);
              const isNext  = !done && dayTasks.slice(0, idx).every(t => completedIds.has(t.id));
              return (
                <motion.button
                  key={task.id}
                  className={`${s.taskItem} ${done ? s.taskDone : ''} ${isNext ? s.taskNext : ''}`}
                  initial={{ opacity:0, x:-20 }}
                  animate={{ opacity:1, x:0 }}
                  transition={{ delay: .08 + idx*.05 }}
                  whileHover={!done ? { x:4 } : {}}
                  onClick={() => handleTaskClick(task)}
                >
                  <div className={s.taskIcon} style={{ background: done ? 'rgba(74,222,128,.15)' : 'rgba(255,255,255,.07)' }}>
                    <span>{done ? '✓' : TASK_ICONS[type] || '📝'}</span>
                  </div>
                  <div className={s.taskMeta}>
                    <span className={s.taskName}>{TASK_LABELS[type] || type}</span>
                    <span className={s.taskSub}>Quest {idx+1} von {totalCount}</span>
                  </div>
                  {isNext && <span className={s.taskBadge}>Jetzt starten →</span>}
                  {done && <span className={s.taskCheck}>✓</span>}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Right: Stats + Level path ── */}
        <div className={s.sideCol}>

          {/* Level path */}
          <motion.div
            className={s.card}
            initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }}
            transition={{ delay:.1 }}
          >
            <div className={s.cardTitle}>Dein Lernweg</div>
            <div className={s.levelPath}>
              {LEVELS.map((lv, i) => {
                const isCurrent  = lv.name === currentLevel;
                const isPast     = LEVELS.findIndex(l=>l.name===currentLevel) > i;
                return (
                  <div key={lv.name} className={s.pathStep}>
                    <div
                      className={`${s.pathDot} ${isCurrent ? s.pathDotCurrent : ''} ${isPast ? s.pathDotDone : ''}`}
                      style={{ '--dot-color': lv.color }}
                    >
                      {isPast ? '✓' : isCurrent ? lv.emoji : '🔒'}
                    </div>
                    <span className={s.pathLabel} style={{ color: isCurrent ? lv.color : isPast ? '#4ade80' : '#44446a' }}>
                      {lv.name}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className={s.currentPosLabel}>
              Aktuelle Position · {currentLevel} · Tag {progress?.levelInfo?.dayInLevel || ((currentDay - lvlInfo.startDay) + 1)}/28
            </div>
            <div className={s.levelBarWrap}>
              <div className={s.levelBarTrack}>
                <motion.div
                  className={s.levelBarFill}
                  style={{ background: `linear-gradient(90deg, ${lvlInfo.color}, ${lvlInfo.color}aa)` }}
                  initial={{ width:0 }}
                  animate={{ width:`${levelPct}%` }}
                  transition={{ duration:1.2, delay:.5 }}
                />
              </div>
              <span className={s.levelBarLabel}>{levelPct}%</span>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className={s.card}
            initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }}
            transition={{ delay:.18 }}
          >
            <div className={s.cardTitle}>Deine Statistik</div>
            <div className={s.statsGrid}>
              {[
                { icon:'🚀', val: stats?.missionsDone || 0,     label:'Missionen erledigt' },
                { icon:'📚', val: wordsLearned,                  label:'Wörter gelernt'     },
                { icon:'⏱',  val: `${Math.floor(totalMins/60)}h ${totalMins%60}m`, label:'Lernzeit' },
                { icon:'🔥', val: streak,                        label:'Tage Streak'        },
                { icon:'📈', val: `${stats?.grammarPct||0}%`,    label:'Grammatik'          },
                { icon:'⭐', val: currentLevel,                  label:'Aktuelles Level'    },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className={s.statTile}
                  initial={{ opacity:0, scale:.8 }} animate={{ opacity:1, scale:1 }}
                  transition={{ delay:.2 + i*.04 }}
                >
                  <span className={s.statIcon}>{stat.icon}</span>
                  <span className={s.statVal}>{stat.val}</span>
                  <span className={s.statLabel}>{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Teacher message */}
          <motion.div
            className={s.teacherCard}
            initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }}
            transition={{ delay:.25 }}
          >
            <div className={s.teacherAvatar}>😤</div>
            <div>
              <div className={s.teacherName}>Der Strenge Lehrer</div>
              <div className={s.teacherMsg}>
                {doneCount === totalCount
                  ? 'Gut. Morgen machst du weiter. Keine Pausen.'
                  : doneCount > 0
                  ? `${totalCount - doneCount} Aufgaben noch. Nicht aufhören.`
                  : 'Kein Ausreden. Fang jetzt an.'}
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Level picker modal */}
      <AnimatePresence>
        {showLevelPicker && (
          <LevelPickerModal
            onClose={() => setShowLevelPicker(false)}
            onPick={handleLevelPicked}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
