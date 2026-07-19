import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProgressStore } from '../store/progressStore';
import s from './HistoryPage.module.css';

const ICONS = { anki:'🃏', video:'📺', reading:'📖', grammar:'✏️', speaking:'🎤' };
function fmt(m) { return !m ? '0 min' : m < 60 ? `${m} min` : `${Math.floor(m/60)}h ${m%60?m%60+'m':''}`.trim(); }

export default function HistoryPage() {
  const navigate = useNavigate();
  const { history, stats, fetchHistory, fetchAll, loading } = useProgressStore();

  useEffect(() => { fetchHistory(); fetchAll(); }, []);

  return (
    <div className={s.page}>
      <header className={s.header}>
        <button className={s.backBtn} onClick={() => navigate('/')}>← Zurück</button>
        <h1 className={s.title}>Verlauf</h1>
        <div/>
      </header>

      {/* Summary */}
      <div className={s.summaryRow}>
        <div className={s.summaryCard}>
          <span className={s.sNum}>{stats?.streakCount||0}</span>
          <span className={s.sLabel}>🔥 Streak</span>
        </div>
        <div className={s.summaryCard}>
          <span className={s.sNum}>{stats?.totalTasksCompleted||0}</span>
          <span className={s.sLabel}>Aufgaben</span>
        </div>
        <div className={s.summaryCard}>
          <span className={s.sNum} style={{fontSize:15}}>{fmt(stats?.totalMinutesSpent)}</span>
          <span className={s.sLabel}>⏱ Gesamt</span>
        </div>
        <div className={s.summaryCard}>
          <span className={s.sNum}>{stats?.longestStreak||0}</span>
          <span className={s.sLabel}>Best Streak</span>
        </div>
      </div>

      {loading && <p className={s.empty}>Lade…</p>}
      {!loading && (!history || history.length === 0) && (
        <p className={s.empty}>Noch keine abgeschlossenen Tage.</p>
      )}

      <div className={s.list}>
        {(history || []).map((day, i) => (
          <motion.details
            key={day.day}
            className={s.dayCard}
            initial={{opacity:0, y:20}}
            animate={{opacity:1, y:0}}
            transition={{delay: i * 0.04}}
          >
            <summary className={s.daySummary}>
              <span className={s.dayNum}>Tag {day.day}</span>
              <span className={s.dayDate}>{day.date}</span>
              <span className={s.dayTime}>{fmt(day.minutesSpent)}</span>
              <span className={s.dayMark}>✅</span>
            </summary>
            <div className={s.taskList}>
              {(day.tasks||[]).map(t => (
                <div key={t.taskId} className={`${s.taskRow} ${t.completed ? s.done : s.skip}`}>
                  <span>{ICONS[t.type]||'📌'}</span>
                  <span className={s.tTitle}>{t.title || t.taskId}</span>
                  <span className={s.tTime}>{fmt(t.minutesSpent)}</span>
                </div>
              ))}
            </div>
          </motion.details>
        ))}
      </div>
    </div>
  );
}
