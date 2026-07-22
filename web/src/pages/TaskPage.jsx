import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgressStore } from '../store/progressStore';
import { useAuthStore } from '../store/authStore';
import TeacherAvatar from '../components/TeacherAvatar';
import SpeechBubble from '../components/SpeechBubble';
import { useAudio } from '../hooks/useAudio';
import VideoTask from '../components/tasks/VideoTask';
import VocabTask from '../components/tasks/VocabTask';
import ReadingTask from '../components/tasks/ReadingTask';
import GrammarTask from '../components/tasks/GrammarTask';
import WritingTask from '../components/tasks/WritingTask';
import s from './TaskPage.module.css';

const TOTAL_DAYS = 112; // 4 levels × 28 days

// Map backend's old task types → new native types
const TYPE_REMAP = {
  anki: 'vocab',
  video: 'video_embed',
  reading: 'reading_native',
  grammar: 'grammar_native',
  speaking: 'video_embed',
  writing: 'writing',
};
const CONTENT_FILE = {
  anki: 'vocab', vocab: 'vocab',
  video: 'video', video_embed: 'video',
  reading: 'reading', reading_native: 'reading',
  grammar: 'grammar', grammar_native: 'grammar',
  speaking: 'speaking',
  writing: 'schreiben',
};

function resolveTask(task) {
  if (!task) return null;
  const rawType = task.type || 'video';
  const type = TYPE_REMAP[rawType] || rawType;
  const dayStr = String(task.day || 1).padStart(2, '0');
  const fileKey = CONTENT_FILE[rawType] || 'video';
  const content_ref = task.content_ref || `/content/missions/day-${dayStr}/${fileKey}.json`;
  return { ...task, type, content_ref };
}

const isNativeType = (type) =>
  ['vocab', 'video_embed', 'reading_native', 'grammar_native', 'writing'].includes(type);

const ICONS = {
  vocab: '🃏', video_embed: '📺', reading_native: '📖',
  grammar_native: '✏️', writing: '✍️', video: '📺', reading: '📖', grammar: '✏️', speaking: '🎤',
};
const LABELS = {
  vocab: 'Vokabeln', video_embed: 'Video', reading_native: 'Lesen',
  grammar_native: 'Grammatik', writing: 'Schreiben', video: 'Video', reading: 'Lesen',
  grammar: 'Grammatik', speaking: 'Sprechen',
};
const TYPE_XP = {
  vocab: 10, video_embed: 15, reading_native: 20, grammar_native: 25,
  writing: 20, video: 15, reading: 20, grammar: 25, speaking: 20,
};
const TYPE_COLOR = {
  vocab: '#b06aff', video_embed: '#00e676', reading_native: '#ffd700',
  grammar_native: '#4d9fff', writing: '#fb923c', video: '#00e676', reading: '#ffd700',
  grammar: '#4d9fff', speaking: '#ff4d6a',
};

const STERN_LINES = [
  { emoji: '😤', msg: 'Die Aufgabe ist noch nicht fertig. Ich sehe das.' },
  { emoji: '🧐', msg: 'Ich warte. Erst die Aufgabe, dann weiter.' },
  { emoji: '📌', msg: 'Schließ die Aufgabe ab — dann darfst du klicken.' },
  { emoji: '🇩🇪', msg: 'Deutsch lernt sich nicht durch Knopfdrücken.' },
  { emoji: '😒', msg: 'Kein Fortschritt ohne Leistung. Das ist die Regel.' },
];

const COMPLETE_MSGS = [
  'Gut gemacht. Ich bin… leicht beeindruckt.',
  'Alle Aufgaben. Nicht schlecht für heute.',
  'Das hätte ich nicht erwartet. Aber gut.',
  'Ordentlich. Morgen wird es schwerer.',
  'Beeindruckend. Fast.',
];

const TEACHER_LINES = {
  vocab:    ['Vokabeln zuerst. Täglich. Ohne Ausnahme.', 'Decke alle Karten auf. Jetzt.'],
  video_embed: ['Augen auf. Kein Multitasking.', 'Schau das Video bis zum Ende.'],
  reading_native: ['Lies langsam. Hover über unbekannte Wörter.', 'Lesen bildet. Tu es.'],
  grammar_native: ['Grammatik durch Übungen. Nicht durch Lesen.', 'Mach alle Übungen. Kein Überspringen.'],
  video:    ['Augen auf. Kein Multitasking.', 'Schau bis zum Ende.'],
  reading:  ['Lies langsam. Schreib neue Wörter auf.', 'Lesen bildet.'],
  grammar:  ['Grammatik verstehen, nicht auswendig lernen.', 'Übe jeden Satz.'],
  writing:  ['Schreiben übt man durch Schreiben. Fang an.', 'Vollständige Sätze. Kein Stichwort-Stil.'],
  speaking: ['Mund auf. Laut sprechen. Jetzt.', 'Shadowing: gleichzeitig mit dem Audio.'],
};

const WEEK_FOCUS = {
  1: 'Präsens & Modalverben',
  2: 'Perfekt & Dativ',
  3: 'Komparativ & Konjunktiv II',
  4: 'Formal & Interview',
};

const LEVEL_RANGES = [
  { level: 'A1.1', days: [1,   28],  color: '#22c55e',  label: 'Anfänger'      },
  { level: 'A1.2', days: [29,  56],  color: '#10b981',  label: 'Grundkenntnisse' },
  { level: 'A2.1', days: [57,  84],  color: '#3b82f6',  label: 'Grundstufe'    },
  { level: 'A2.2', days: [85,  112], color: '#6366f1',  label: 'Elementar'     },
  { level: 'B1.1', days: [113, 140], color: '#a855f7',  label: 'Fortgeschritten' },
  { level: 'B1.2', days: [141, 168], color: '#ec4899',  label: 'Mittelstufe'   },
];

function getCurrentLevel(day) {
  return LEVEL_RANGES.find(l => day >= l.days[0] && day <= l.days[1]) || LEVEL_RANGES[0];
}

function getDayInLevel(day) {
  const lvl = getCurrentLevel(day);
  return { ...lvl, dayInLevel: day - lvl.days[0] + 1, daysInLevel: lvl.days[1] - lvl.days[0] + 1 };
}

function fmt(m) {
  if (!m) return '0m';
  return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h${m % 60 ? m % 60 + 'm' : ''}`;
}

const XP_PER_LEVEL = 100;
function xpInfo(xp) {
  return { level: Math.floor(xp / XP_PER_LEVEL) + 1, pct: ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100 };
}

export default function TaskPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { progress, tasks, stats, fetchAll, recordLinkClick, completeTask, reset } = useProgressStore();
  const { say } = useAudio(user?.audioEnabled !== false);

  const [view, setView]           = useState('loading');
  const [currentDay, setDay]      = useState(1);
  const [taskIndex, setIdx]       = useState(0);
  const [dayTasks, setDTasks]     = useState([]);
  const [task, setTask]           = useState(null);
  const [linkClicked, setLink]    = useState({});
  const [mood, setMood]           = useState('normal');
  const [speech, setSpeech]       = useState('');
  const [stern, setStern]         = useState(null);
  const [xpPop, setXpPop]         = useState(null);
  const [achieve, setAchieve]     = useState(null);
  const [isCatchUp, setCatchUp]   = useState(false);
  const [catchUpDay, setCatchUpDay] = useState(null);
  const [nativeContent, setContent] = useState(null);
  const [nativeReady, setReady]   = useState(false);
  const [showDayPicker, setDayPicker] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const sternTimer = useRef(null);

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (progress && tasks.length) compute(progress, tasks);
  }, [progress, tasks]);

  const compute = (prog, all) => {
    const today = new Date().toISOString().split('T')[0];
    const day   = prog.currentDay || 1;
    if (day > TOTAL_DAYS) { setView('finished'); return; }

    const byDay = (d) => all.filter(t => t.day === d).sort((a, b) => a.order - b.order);

    if (prog.lastCompletedDate) {
      const diff = Math.floor((new Date(today) - new Date(prog.lastCompletedDate)) / 86400000);
      const de   = (prog.days || []).find(e => e.day === day);
      if (diff >= 2 && !(de?.completed && de.date === today)) {
        for (let d = 1; d < day; d++) {
          const entry = (prog.days || []).find(e => e.day === d);
          if (!entry?.completed) {
            const dt  = byDay(d);
            const done = new Set((entry?.tasks || []).filter(t => t.completed).map(t => t.taskId));
            const idx  = dt.findIndex(t => !done.has(t.id));
            setCatchUp(true); setCatchUpDay(d);
            setDay(d); setDTasks(dt); setIdx(idx < 0 ? 0 : idx);
            setTask(resolveTask(dt[idx < 0 ? 0 : idx]));
            setView('task'); return;
          }
        }
      }
    }
    setCatchUp(false);

    const dayEntry = (prog.days || []).find(e => e.day === day);
    if (dayEntry?.completed && dayEntry.date === today) { setView('locked'); return; }

    const dt   = byDay(day);
    const done = new Set((dayEntry?.tasks || []).filter(t => t.completed).map(t => t.taskId));
    let idx    = dt.findIndex(t => !done.has(t.id));
    if (idx === -1) { setView('locked'); return; }

    setDay(day); setDTasks(dt); setIdx(idx); setTask(resolveTask(dt[idx]));
    setView('task');
  };

  useEffect(() => {
    if (!task) return;
    const lines = TEACHER_LINES[task.type] || TEACHER_LINES.video;
    const msg   = task.teacher_intro || lines[Math.floor(Math.random() * lines.length)];
    setSpeech(msg); setMood('normal'); setLink({}); setReady(false); setContent(null);
    const baseType = task.type.replace('_native', '').replace('_embed', '').replace('vocab', 'anki');
    const t = setTimeout(() => say(baseType, msg), 400);
    if (task.content_ref) {
      fetch(task.content_ref)
        .then(r => r.ok ? r.json() : null)
        .then(data => setContent(data))
        .catch(() => setContent(null));
    }
    return () => clearTimeout(t);
  }, [task?.id]);

  const goToDay = (day) => {
    const all = tasks;
    const dt  = all.filter(t => t.day === day).sort((a, b) => a.order - b.order);
    if (!dt.length) return;
    const entry = (progress?.days || []).find(e => e.day === day);
    const done  = new Set((entry?.tasks || []).filter(t => t.completed).map(t => t.taskId));
    let idx     = dt.findIndex(t => !done.has(t.id));
    if (idx === -1) idx = 0;
    setDay(day); setDTasks(dt); setIdx(idx); setTask(resolveTask(dt[idx]));
    setCatchUp(false); setView('task'); setDayPicker(false);
  };

  const handleLinkClick = useCallback((taskId, day) => {
    setLink(prev => ({ ...prev, [taskId]: true }));
    recordLinkClick(taskId, day);
  }, []);

  const handleDone = async () => {
    if (!task) return;
    const res = await completeTask(task.id, currentDay);
    if (!res?.ok) { showSternFn(); return; }

    const gain = res.xpGained || TYPE_XP[task.type] || 10;
    setXpPop(`+${gain} XP`);
    setTimeout(() => setXpPop(null), 1400);
    if (res.levelUp) { setAchieve(`🎓 Level ${res.levelUp} erreicht!`); setTimeout(() => setAchieve(null), 5000); }
    else if (res.newBadge) { setAchieve(`🏅 ${res.newBadge} freigeschaltet!`); setTimeout(() => setAchieve(null), 3500); }

    const next = taskIndex + 1;
    if (next >= dayTasks.length) {
      if (isCatchUp) { say('done', 'Nachholaufgaben erledigt!'); setTimeout(() => fetchAll(), 600); return; }
      setMood('happy');
      say('complete');
      setSpeech(COMPLETE_MSGS[Math.floor(Math.random() * COMPLETE_MSGS.length)]);
      fireConfetti();
      await fetchAll();
      setView('complete');
    } else {
      setIdx(next); setTask(resolveTask(dayTasks[next]));
    }
  };

  const showSternFn = () => {
    const sData = STERN_LINES[Math.floor(Math.random() * STERN_LINES.length)];
    setStern(sData); setMood('stern');
    say('skip', sData.msg);
    clearTimeout(sternTimer.current);
    sternTimer.current = setTimeout(() => { setStern(null); setMood('normal'); }, 3000);
  };

  const tryDone = () => {
    if (isNativeType(task?.type) && !nativeReady) { showSternFn(); return; }
    if (task?.requires_link_click && task.resource_url && !linkClicked[task.id]) { showSternFn(); return; }
    handleDone();
  };

  const handleReset = async () => {
    setResetting(true);
    await reset();
    setResetting(false);
    setShowReset(false);
    await fetchAll();
  };

  const fireConfetti = () => {
    const colors = ['#ffd700', '#4d9fff', '#00e676', '#ff4d6a', '#b06aff', '#00e5ff', '#ff9800'];
    for (let i = 0; i < 80; i++) {
      const el = document.createElement('div');
      const sz = 5 + Math.random() * 10;
      el.style.cssText = `position:fixed;width:${sz}px;height:${sz}px;background:${colors[Math.floor(Math.random() * colors.length)]};top:-20px;left:${Math.random() * 100}vw;border-radius:${Math.random() > .5 ? '50%' : '2px'};animation:confettiFall ${1.5 + Math.random() * 2.5}s linear ${Math.random() * .8}s forwards;z-index:9999;pointer-events:none;`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 5000);
    }
  };

  const doneable = task && (
    isNativeType(task.type) ? nativeReady :
    (!task.requires_link_click || !task.resource_url || linkClicked[task.id])
  );

  const { level, pct } = xpInfo(user?.xp || 0);
  const resolvedTask = task;
  const currentLevelInfo = getDayInLevel(currentDay);
  const completedDays = (progress?.days || []).filter(d => d.completed).map(d => d.day);
  const levelPct = Math.round((currentLevelInfo.dayInLevel / currentLevelInfo.daysInLevel) * 100);

  // ── VIEWS ──────────────────────────────────────────────

  if (view === 'loading') return (
    <div className={s.loadingScreen}>
      <div className={s.loadingTeacher}>🎓</div>
      <div className={s.loadingText}>Der Lehrer bereitet sich vor…</div>
      <div className={s.loadingBar}><div className={s.loadingFill} /></div>
    </div>
  );

  const sharedHeader = (
    <GameHeader level={level} pct={pct} stats={stats} currentDay={currentDay}
      navigate={navigate} user={user} onDayPicker={() => setDayPicker(true)} onReset={() => setShowReset(true)} />
  );

  if (view === 'finished') return (
    <div className={s.page}>
      {sharedHeader}
      <div className={s.finishedView}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }}>
          <div style={{ fontSize: 80 }}>🏆</div>
        </motion.div>
        <h2 className={s.finishedTitle}>28 Tage. Geschafft.</h2>
        <p style={{ color: 'var(--text2)', maxWidth: 340, textAlign: 'center', lineHeight: 1.8, fontSize: 15 }}>
          Ich gebe es zu — ich hätte nicht damit gerechnet. A1 ist Geschichte. Du bist auf dem Weg zu B2.
        </p>
        <div className={s.statsGrid} style={{ width: '100%', maxWidth: 320 }}>
          <StatCell num={stats?.totalTasksCompleted || 0} label="Aufgaben" />
          <StatCell num={fmt(stats?.totalMinutesSpent || 0)} label="⏱ Lernzeit" />
          <StatCell num={stats?.longestStreak || 0} label="Best Streak" />
          <StatCell num={`Lv.${level}`} label="Level" />
        </div>
        <button className={s.resetBtn} onClick={() => setShowReset(true)}>↺ Neustart</button>
      </div>
      <ResetModal show={showReset} onClose={() => setShowReset(false)} onConfirm={handleReset} loading={resetting} />
    </div>
  );

  if (view === 'locked') return (
    <div className={s.page}>
      {sharedHeader}
      <div className={s.lockedView}>
        <motion.div className={s.lockedIcon} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>🔒</motion.div>
        <div className={s.lockedTitle}>Fertig für heute.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: `${currentLevelInfo.color}18`, border: `1px solid ${currentLevelInfo.color}44` }}>
          <span style={{ color: currentLevelInfo.color, fontSize: 12, fontWeight: 800 }}>{currentLevelInfo.level}</span>
          <span style={{ color: 'var(--text3)', fontSize: 12 }}>Tag {currentLevelInfo.dayInLevel}/28</span>
        </div>
        <div className={s.lockedSub}>Morgen öffnet Tag {currentLevelInfo.dayInLevel < 28 ? currentLevelInfo.dayInLevel + 1 : 1} von {currentLevelInfo.level}.<br />Dein Fortschritt ist gesichert.</div>
        <Countdown />
        <div className={s.statsGrid} style={{ width: '100%', maxWidth: 360 }}>
          <StatCell num={stats?.streakCount || 0} label="🔥 Streak" />
          <StatCell num={stats?.totalTasksCompleted || 0} label="Aufgaben" />
          <StatCell num={fmt(stats?.totalMinutesSpent || 0)} label="⏱ Gesamt" />
          <StatCell num={`Lv.${level}`} label="Level" />
        </div>
        <button className={s.prevDayBtn} onClick={() => setDayPicker(true)}>📅 Vorherige Tage</button>
        <button className={s.resetBtn} onClick={() => setShowReset(true)}>↺ Fortschritt zurücksetzen</button>
      </div>
      <DayPickerModal show={showDayPicker} onClose={() => setDayPicker(false)} completedDays={completedDays} currentDay={currentDay} onSelect={goToDay} totalDays={TOTAL_DAYS} />
      <ResetModal show={showReset} onClose={() => setShowReset(false)} onConfirm={handleReset} loading={resetting} />
    </div>
  );

  if (view === 'complete') return (
    <div className={s.page}>
      {sharedHeader}
      <div className={s.teacherRow}>
        <TeacherAvatar mood="happy" size={76} />
        <SpeechBubble text={speech} />
      </div>
      <motion.div className={`${s.card} ${s.completeCard}`}
        initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }}>
        <div className={s.completeEmoji}>🎓</div>
        <div className={s.completeTitle}>Tag {currentDay} abgeschlossen!</div>
        <div className={s.completeSub}>Alle {dayTasks.length} Aufgaben erledigt.<br />Morgen öffnet Tag {Math.min(currentDay + 1, 28)}.</div>
        <div className={s.statsGrid}>
          <StatCell num={stats?.streakCount || 0} label="🔥 Streak" />
          <StatCell num={stats?.totalTasksCompleted || 0} label="Aufgaben" />
          <StatCell num={fmt(stats?.totalMinutesSpent)} label="⏱ Gesamt" />
          <StatCell num={`Lv.${level}`} label="Level" />
        </div>
      </motion.div>
      <button className={s.prevDayBtn} style={{ margin: '12px 12px 0' }} onClick={() => setDayPicker(true)}>📅 Vorherige Tage anschauen</button>
      <DayPickerModal show={showDayPicker} onClose={() => setDayPicker(false)} completedDays={completedDays} currentDay={currentDay} onSelect={goToDay} totalDays={TOTAL_DAYS} />
    </div>
  );

  if (!resolvedTask) return null;

  const resources = [];
  if (resolvedTask.resource_url) resources.push({ url: resolvedTask.resource_url, label: resolvedTask.resource_label || 'Ressource öffnen' });
  if (resolvedTask.resource_url_2) resources.push({ url: resolvedTask.resource_url_2, label: resolvedTask.resource_label_2 || 'Zweite Ressource' });

  const typeColor = TYPE_COLOR[resolvedTask.type] || '#b06aff';

  return (
    <div className={s.page}>
      {sharedHeader}

      {/* GPS Breadcrumb + Level Progress */}
      <div className={s.gpsBlock}>
        <div className={s.gps}>
          <span className={s.gpsLevel} style={{ color: currentLevelInfo.color }}>{currentLevelInfo.level}</span>
          <span className={s.gpsSep}>›</span>
          <span className={s.gpsItem}>Tag {currentLevelInfo.dayInLevel}/28</span>
          <span className={s.gpsSep}>›</span>
          <span className={s.gpsItem}>Woche {resolvedTask.week || 1}</span>
          <span className={s.gpsSep}>›</span>
          <span className={s.gpsItem} style={{ color: typeColor }}>Quest {taskIndex + 1}/{dayTasks.length}</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600 }}>{levelPct}%</span>
        </div>
        {/* Level progress bar */}
        <div className={s.levelBar}>
          <div className={s.levelFill} style={{ width: `${levelPct}%`, background: currentLevelInfo.color }} />
        </div>
      </div>

      {/* XP Bar */}
      <div className={s.xpBarWrap}>
        <span className={s.xpBarLabel}>Lv.{level}</span>
        <div className="xp-bar-track" style={{ flex: 1 }}>
          <div className="xp-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className={s.xpBarLabel}>{user?.xp || 0} XP</span>
      </div>

      {/* Catch-up banner */}
      {isCatchUp && (
        <div className={s.catchupBanner}>⚠️ <strong>Nachholaufgabe — Tag {catchUpDay}</strong> zuerst abschließen.</div>
      )}

      {/* Teacher */}
      <div className={s.teacherRow}>
        <TeacherAvatar mood={mood} size={72} />
        <SpeechBubble text={speech} />
      </div>

      {/* XP pop */}
      <AnimatePresence>
        {xpPop && (
          <motion.div className={s.xpPop}
            initial={{ opacity: 0, y: 0, scale: .5 }} animate={{ opacity: 1, y: -60, scale: 1.2 }} exit={{ opacity: 0, y: -100, scale: .8 }}
            transition={{ duration: .8 }}>{xpPop}</motion.div>
        )}
      </AnimatePresence>

      {/* Achievement */}
      <AnimatePresence>
        {achieve && (
          <motion.div className={s.achieveToast}
            initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }}>
            <span className={s.achieveIcon}>🏅</span><span>{achieve}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task dots */}
      <div className={s.dotsRow}>
        {dayTasks.map((t, i) => {
          const done = (progress?.days || []).find(d => d.day === currentDay)?.tasks?.find(pt => pt.taskId === t.id)?.completed;
          const tc = TYPE_COLOR[TYPE_REMAP[t.type] || t.type] || '#b06aff';
          return (
            <div key={t.id} className={`${s.dot}${done ? ' ' + s.dotDone : i === taskIndex ? ' ' + s.dotActive : ''}`}
              style={done ? { background: tc, borderColor: tc, boxShadow: `0 0 8px ${tc}80` } : i === taskIndex ? { background: tc, borderColor: tc, boxShadow: `0 0 12px ${tc}99`, transform: 'scale(1.5)' } : {}} />
          );
        })}
      </div>

      {/* Main Task Card */}
      <AnimatePresence mode="wait">
        <motion.div key={resolvedTask.id} className={s.card}
          style={{ '--type-color': typeColor }}
          initial={{ opacity: 0, x: 40, scale: .96 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -30, scale: .96 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}>

          <div className={s.cardHeader}>
            <div className={s.typeBadge} style={{ background: `${typeColor}18`, borderColor: `${typeColor}44`, color: typeColor }}>
              <span>{ICONS[resolvedTask.type]}</span>
              <span>{LABELS[resolvedTask.type]}</span>
            </div>
            <div className={s.duration}>⏱ {resolvedTask.duration_minutes}m · <span style={{ color: '#ffd700' }}>+{TYPE_XP[resolvedTask.type] || 10} XP</span></div>
          </div>

          <h2 className={s.taskTitle}>{resolvedTask.title}</h2>
          <p className={s.taskInstr}>{resolvedTask.instruction}</p>

          {/* Native task components */}
          {resolvedTask.type === 'vocab' && nativeContent && (
            <VocabTask content={nativeContent} onReady={setReady} />
          )}
          {resolvedTask.type === 'video_embed' && nativeContent && (
            <VideoTask content={nativeContent} onReady={setReady} />
          )}
          {resolvedTask.type === 'reading_native' && nativeContent && (
            <ReadingTask content={nativeContent} onReady={setReady} />
          )}
          {resolvedTask.type === 'grammar_native' && nativeContent && (
            <GrammarTask content={nativeContent} onReady={setReady} />
          )}
          {resolvedTask.type === 'writing' && nativeContent && (
            <WritingTask content={nativeContent} onReady={setReady} />
          )}
          {isNativeType(resolvedTask.type) && !nativeContent && (
            <div className={s.contentLoading}>
              <div className={s.contentSpinner} />
              <span>Lade Inhalt…</span>
            </div>
          )}

          {/* Legacy resource links */}
          {!isNativeType(resolvedTask.type) && resources.map(({ url, label }) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer"
              className={`${s.resourceBtn}${linkClicked[resolvedTask.id] ? ' ' + s.clicked : ''}`}
              onClick={() => handleLinkClick(resolvedTask.id, currentDay)}>
              <span>{linkClicked[resolvedTask.id] ? `✓ ${label}` : `↗ ${label}`}</span>
              <span className={s.resourceIcon}>{linkClicked[resolvedTask.id] ? '✅' : '🔗'}</span>
            </a>
          ))}

          <button className={`${s.doneBtn}${!doneable ? ' ' + s.locked : ''}`} onClick={tryDone}>
            {doneable
              ? '✓ Erledigt — Nächste Aufgabe'
              : isNativeType(resolvedTask.type)
                ? '🔒 Aufgabe zuerst abschließen'
                : '🔒 Ressource zuerst öffnen'}
          </button>
          {!doneable && (
            <p className={s.doneHint}>
              {isNativeType(resolvedTask.type)
                ? 'Schließ die Aufgabe oben ab.'
                : 'Klicke den Link oben.'}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Progress bar */}
      <div className={s.progressSection}>
        <div className={s.progressBar}>
          <div className={s.progressFill} style={{ width: `${(taskIndex / dayTasks.length) * 100}%` }} />
        </div>
        <p className={s.progressLabel}>Tag {currentDay} / {TOTAL_DAYS} · Quest {taskIndex + 1} von {dayTasks.length}</p>
      </div>

      {/* Bottom nav */}
      <div className={s.bottomNav}>
        <button className={s.bottomBtn} onClick={() => setDayPicker(true)}>
          📅 Tage
        </button>
        <button className={s.bottomBtn} onClick={() => navigate('/history')}>
          📋 Verlauf
        </button>
        <button className={s.bottomBtnDanger} onClick={() => setShowReset(true)}>
          ↺ Reset
        </button>
      </div>

      {/* Stern overlay */}
      <AnimatePresence>
        {stern && (
          <motion.div className={s.sternOverlay}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setStern(null); setMood('normal'); }}>
            <div className={s.sternBox}>
              <div className={s.sternEmoji}>{stern.emoji}</div>
              <div className={s.sternMsg}>{stern.msg}</div>
              <div className={s.sternHint}>Tippe irgendwo zum Weitermachen.</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Day picker modal */}
      <DayPickerModal show={showDayPicker} onClose={() => setDayPicker(false)} completedDays={completedDays} currentDay={currentDay} onSelect={goToDay} totalDays={TOTAL_DAYS} />

      {/* Reset modal */}
      <ResetModal show={showReset} onClose={() => setShowReset(false)} onConfirm={handleReset} loading={resetting} />
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────

function GameHeader({ level, pct, stats, currentDay, navigate, user, onDayPicker, onReset }) {
  return (
    <header className={s.header}>
      <div className={s.logo}>Der <span className={s.logoAccent}>Strenge</span> Lehrer</div>
      <div className={s.headerRight}>
        <div className={`${s.hpill} ${s.streakPill}`}>
          <span style={{ animation: 'fireFlick .7s ease-in-out infinite alternate' }}>🔥</span>
          {stats?.streakCount || 0}
        </div>
        <div className={`${s.hpill} ${s.xpPill}`}>⚡ Lv.{level}</div>
        <div className={`${s.hpill} ${s.dayPill}`}>Tag {Math.min(currentDay, 28)}</div>
        <button className={s.iconBtn} onClick={() => navigate('/profile')} title="Profil">
          {user?.displayName?.[0]?.toUpperCase() || '👤'}
        </button>
      </div>
    </header>
  );
}

function DayPickerModal({ show, onClose, completedDays, currentDay, onSelect, totalDays }) {
  if (!show) return null;
  const completedSet = new Set(completedDays);
  return (
    <motion.div className={s.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className={s.modal} initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onClick={e => e.stopPropagation()}>
        <div className={s.modalHeader}>
          <h3 className={s.modalTitle}>📅 Curriculum</h3>
          <button className={s.modalClose} onClick={onClose}>✕</button>
        </div>
        <p className={s.modalSub}>Grüne Tage = abgeschlossen · Lila = aktuell · Grau = gesperrt</p>

        {LEVEL_RANGES.filter(lr => lr.days[0] <= totalDays).map(lr => {
          const lvlDays = Array.from({ length: lr.days[1] - lr.days[0] + 1 }, (_, i) => lr.days[0] + i).filter(d => d <= totalDays);
          const done = lvlDays.filter(d => completedSet.has(d)).length;
          const pct = Math.round((done / lvlDays.length) * 100);
          const unlocked = lr.days[0] <= currentDay;
          return (
            <div key={lr.level} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 900, fontSize: 13, color: unlocked ? lr.color : 'var(--text3)' }}>{lr.level}</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>{lr.label}</span>
                </div>
                <span style={{ fontSize: 11, color: unlocked ? lr.color : 'var(--text3)', fontWeight: 600 }}>{done}/{lvlDays.length} Tage · {pct}%</span>
              </div>
              <div style={{ height: 2, background: 'rgba(255,255,255,.06)', borderRadius: 1, marginBottom: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: lr.color, borderRadius: 1, transition: 'width .6s' }} />
              </div>
              {unlocked && (
                <div className={s.dayGrid}>
                  {lvlDays.map(d => {
                    const isDone = completedSet.has(d);
                    const isCur = d === currentDay;
                    const isLocked = d > currentDay;
                    const dayInLevel = d - lr.days[0] + 1;
                    return (
                      <button key={d}
                        className={`${s.dayCell}${isDone ? ' ' + s.dayCellDone : isCur ? ' ' + s.dayCellCurrent : isLocked ? ' ' + s.dayCellLocked : ''}`}
                        style={isDone ? { borderColor: `${lr.color}55`, background: `${lr.color}15` } : isCur ? { borderColor: `${lr.color}88`, background: `${lr.color}25` } : {}}
                        onClick={() => !isLocked && onSelect(d)} disabled={isLocked}>
                        <span className={s.dayCellNum}>{dayInLevel}</span>
                        {isDone && <span className={s.dayCellCheck}>✓</span>}
                        {isCur && !isDone && <span className={s.dayCellNow}>●</span>}
                      </button>
                    );
                  })}
                </div>
              )}
              {!unlocked && (
                <div style={{ padding: '8px 0', color: 'var(--text3)', fontSize: 12, textAlign: 'center' }}>
                  🔒 Schließe {lr.level === 'A1.2' ? 'A1.1' : lr.level === 'A2.1' ? 'A1.2' : lr.level === 'A2.2' ? 'A2.1' : 'vorheriges Level'} ab
                </div>
              )}
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

function ResetModal({ show, onClose, onConfirm, loading }) {
  if (!show) return null;
  return (
    <motion.div className={s.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className={s.modal} style={{ maxWidth: 340 }} initial={{ scale: .9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>😤</div>
          <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Fortschritt zurücksetzen?</h3>
          <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            Alle Tage, XP und Streak werden gelöscht. Das ist nicht rückgängig zu machen.
            <br /><strong style={{ color: 'var(--red)' }}>Bist du sicher?</strong>
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className={s.cancelBtn} onClick={onClose}>Abbrechen</button>
            <button className={s.confirmResetBtn} onClick={onConfirm} disabled={loading}>
              {loading ? 'Zurücksetzen…' : '✓ Ja, zurücksetzen'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCell({ num, label }) {
  return (
    <div className={s.statCell}>
      <span className={s.statNum}>{num}</span>
      <span className={s.statLabel}>{label}</span>
    </div>
  );
}

function Countdown() {
  const [t, setT] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date(), mid = new Date(now);
      mid.setHours(24, 0, 0, 0);
      const d = mid - now;
      setT(`${String(Math.floor(d / 3.6e6)).padStart(2, '0')}:${String(Math.floor((d % 3.6e6) / 6e4)).padStart(2, '0')}:${String(Math.floor((d % 6e4) / 1e3)).padStart(2, '0')}`);
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);
  return <div className={s.countdown}>{t}</div>;
}
