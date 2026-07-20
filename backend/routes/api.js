const express  = require('express');
const router   = express.Router();
const Progress = require('../models/Progress');
const User     = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const tasks    = require('../../data/tasks.json');

// ── Constants ──────────────────────────────────────────

const XP_MAP = {
  anki: 10, vocab: 10,
  video: 15, video_embed: 15,
  reading: 20, reading_native: 20,
  grammar: 25, grammar_native: 25,
  speaking: 20,
};

const TOTAL_DAYS = tasks.length > 0 ? Math.max(...tasks.map(t => t.day)) : 112;

const LEVELS = [
  { name: 'A1.1', startDay: 1,   endDay: 28  },
  { name: 'A1.2', startDay: 29,  endDay: 56  },
  { name: 'A2.1', startDay: 57,  endDay: 84  },
  { name: 'A2.2', startDay: 85,  endDay: 112 },
  { name: 'B1.1', startDay: 113, endDay: 140 },
  { name: 'B1.2', startDay: 141, endDay: 168 },
];

function getLevelInfo(day) {
  const lvl = LEVELS.find(l => day >= l.startDay && day <= l.endDay) || LEVELS[0];
  const dayInLevel = day - lvl.startDay + 1;
  const daysInLevel = lvl.endDay - lvl.startDay + 1;
  const pct = Math.round((dayInLevel / daysInLevel) * 100);
  return { level: lvl.name, dayInLevel, daysInLevel, pct, startDay: lvl.startDay, endDay: lvl.endDay };
}

function getNextLevel(levelName) {
  const idx = LEVELS.findIndex(l => l.name === levelName);
  return idx >= 0 && idx < LEVELS.length - 1 ? LEVELS[idx + 1].name : null;
}

function getToday() { return new Date().toISOString().split('T')[0]; }
function daysBetween(d1, d2) {
  return Math.floor((new Date(d2) - new Date(d1)) / 86400000);
}

// ── GET /api/tasks ──────────────────────────────────────
router.get('/tasks', (req, res) => res.json(tasks));

router.get('/tasks/:day', (req, res) => {
  const day = parseInt(req.params.day);
  const dayTasks = tasks.filter(t => t.day === day).sort((a, b) => a.order - b.order);
  if (!dayTasks.length) return res.status(404).json({ error: 'Day not found' });
  res.json(dayTasks);
});

// ── GET /api/levels ─────────────────────────────────────
router.get('/levels', (req, res) => res.json(LEVELS));

// ── GET /api/progress ───────────────────────────────────
router.get('/progress', requireAuth, async (req, res) => {
  try {
    let progress = await Progress.findOne({ userId: req.userId });
    if (!progress) progress = await Progress.create({ userId: req.userId });
    // Sync currentLevel field if missing
    if (!progress.currentLevel) {
      progress.currentLevel = getLevelInfo(progress.currentDay || 1).level;
      await progress.save();
    }
    res.json(progress);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/stats ──────────────────────────────────────
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const progress = await Progress.findOne({ userId: req.userId });
    if (!progress) return res.json({
      totalMinutesSpent: 0, totalTasksCompleted: 0, days: [],
      currentLevel: 'A1.1', dayInLevel: 1, levelPct: 0,
    });

    const lvl = getLevelInfo(progress.currentDay || 1);

    res.json({
      totalMinutesSpent:   progress.totalMinutesSpent   || 0,
      totalTasksCompleted: progress.totalTasksCompleted || 0,
      streakCount:         progress.streakCount         || 0,
      longestStreak:       progress.longestStreak       || 0,
      currentDay:          progress.currentDay          || 1,
      xpEarned:            progress.xpEarned            || 0,
      currentLevel:        lvl.level,
      dayInLevel:          lvl.dayInLevel,
      daysInLevel:         lvl.daysInLevel,
      levelPct:            lvl.pct,
      levelsCompleted:     progress.levelsCompleted || [],
      days: (progress.days || []).map(d => ({
        day:            d.day,
        date:           d.date,
        completed:      d.completed,
        minutesSpent:   d.minutesSpent   || 0,
        tasksCompleted: (d.tasks || []).filter(t => t.completed).length
      }))
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/history ────────────────────────────────────
router.get('/history', requireAuth, async (req, res) => {
  try {
    const progress = await Progress.findOne({ userId: req.userId });
    if (!progress) return res.json([]);

    const history = (progress.days || []).map(d => {
      const dayTasks = tasks.filter(t => t.day === d.day);
      const completedTaskIds = new Set((d.tasks || []).filter(t => t.completed).map(t => t.taskId));
      const lvl = getLevelInfo(d.day);
      return {
        day: d.day, date: d.date, completed: d.completed,
        minutesSpent: d.minutesSpent || 0,
        tasksCompleted: completedTaskIds.size,
        totalTasks: dayTasks.length,
        week: dayTasks[0]?.week || 1,
        level: lvl.level,
        tasks: dayTasks.map(t => ({
          id: t.id, title: t.title, type: t.type,
          duration_minutes: t.duration_minutes,
          completed: completedTaskIds.has(t.id),
          completedAt: (d.tasks || []).find(pt => pt.taskId === t.id)?.completedAt || null,
        }))
      };
    }).sort((a, b) => b.day - a.day);

    res.json(history);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/progress/link-click ───────────────────────
router.post('/progress/link-click', requireAuth, async (req, res) => {
  const { taskId, day } = req.body;
  try {
    let progress = await Progress.findOne({ userId: req.userId });
    if (!progress) progress = await Progress.create({ userId: req.userId });

    let dayEntry = progress.days.find(d => d.day === day);
    if (!dayEntry) {
      const dayTasks = tasks.filter(t => t.day === day);
      progress.days.push({ day, date: getToday(), tasks: dayTasks.map(t => ({ taskId: t.id, completed: false, linkClicked: false })) });
      dayEntry = progress.days[progress.days.length - 1];
    }
    const taskEntry = dayEntry.tasks.find(t => t.taskId === taskId);
    if (taskEntry) taskEntry.linkClicked = true;
    await progress.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/progress/complete-task ────────────────────
router.post('/progress/complete-task', requireAuth, async (req, res) => {
  const { taskId, day } = req.body;
  const today = getToday();
  try {
    let progress = await Progress.findOne({ userId: req.userId });
    if (!progress) progress = await Progress.create({ userId: req.userId });

    let dayEntry = progress.days.find(d => d.day === day);
    if (!dayEntry) {
      const dayTasks = tasks.filter(t => t.day === day);
      progress.days.push({ day, date: today, tasks: dayTasks.map(t => ({ taskId: t.id, completed: false, linkClicked: false })) });
      dayEntry = progress.days[progress.days.length - 1];
    }

    const taskMeta  = tasks.find(t => t.id === taskId);
    const taskEntry = dayEntry.tasks.find(t => t.taskId === taskId);
    let xpGained = 0;

    if (taskEntry && !taskEntry.completed) {
      const mins = taskMeta?.duration_minutes || 0;
      // Support both old and new task type names for XP
      xpGained = XP_MAP[taskMeta?.type] || 15;
      taskEntry.completed   = true;
      taskEntry.completedAt = new Date();
      taskEntry.minutesSpent = mins;
      dayEntry.minutesSpent  = (dayEntry.minutesSpent  || 0) + mins;
      progress.totalMinutesSpent   = (progress.totalMinutesSpent   || 0) + mins;
      progress.totalTasksCompleted += 1;
      progress.xpEarned = (progress.xpEarned || 0) + xpGained;
    }

    // Check day completion
    const dayTasks = tasks.filter(t => t.day === day);
    const completedCount = dayEntry.tasks.filter(t => t.completed).length;
    let levelUp = null;

    if (completedCount >= dayTasks.length && !dayEntry.completed) {
      dayEntry.completed = true;
      dayEntry.date = today;

      // Streak logic
      if (progress.lastCompletedDate) {
        const diff = daysBetween(progress.lastCompletedDate, today);
        if (diff === 1)      progress.streakCount += 1;
        else if (diff > 1)   progress.streakCount  = 1;
      } else {
        progress.streakCount = 1;
      }
      progress.lastCompletedDate = today;
      if (progress.streakCount > (progress.longestStreak || 0))
        progress.longestStreak = progress.streakCount;

      // Advance currentDay
      if (progress.currentDay === day && day < TOTAL_DAYS)
        progress.currentDay = day + 1;

      // Level progression — check if this day completed a level
      const completedLvl = getLevelInfo(day);
      const newLvl = getLevelInfo(progress.currentDay);
      if (newLvl.level !== completedLvl.level) {
        levelUp = newLvl.level;
        progress.currentLevel = newLvl.level;
        if (!progress.levelsCompleted) progress.levelsCompleted = [];
        if (!progress.levelsCompleted.includes(completedLvl.level)) {
          progress.levelsCompleted.push(completedLvl.level);
        }
      } else {
        progress.currentLevel = completedLvl.level;
      }
    }

    await progress.save();

    // Sync XP to User
    if (xpGained > 0) {
      const user = await User.findById(req.userId);
      if (user) {
        user.xp = (user.xp || 0) + xpGained;
        user.level = Math.floor(user.xp / 100) + 1;
        // Badges
        const streak = progress.streakCount;
        const total  = progress.totalTasksCompleted;
        const badges = user.badges || [];
        const addBadge = (b) => { if (!badges.includes(b)) badges.push(b); };
        if (streak >= 7)   addBadge('week_streak');
        if (streak >= 14)  addBadge('2week_streak');
        if (streak >= 28)  addBadge('full_month');
        if (total >= 10)   addBadge('10_tasks');
        if (total >= 50)   addBadge('50_tasks');
        if (total >= 140)  addBadge('all_tasks_a1');
        if (levelUp)       addBadge(`level_${levelUp.replace('.','_').toLowerCase()}`);
        user.badges = badges;
        await user.save();
      }
    }

    const lvl = getLevelInfo(progress.currentDay || 1);
    res.json({ progress, xpGained, levelUp, currentLevel: lvl.level });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/progress/goto-day ─────────────────────────
router.post('/progress/goto-day', requireAuth, async (req, res) => {
  const { day } = req.body;
  try {
    let progress = await Progress.findOne({ userId: req.userId });
    if (!progress) return res.status(404).json({ error: 'No progress found' });
    // Only allow going to a day the user has reached or completed
    if (day > progress.currentDay) return res.status(403).json({ error: 'Day not yet unlocked' });
    res.json({ ok: true, day, level: getLevelInfo(day).level });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/progress/reset ────────────────────────────
router.post('/progress/reset', requireAuth, async (req, res) => {
  try {
    await Progress.deleteOne({ userId: req.userId });
    // Reset user XP
    const user = await User.findById(req.userId);
    if (user) { user.xp = 0; user.level = 1; user.badges = []; await user.save(); }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Legacy deviceId route ────────────────────────────────
router.get('/progress/:deviceId', async (req, res) => {
  try {
    let progress = await Progress.findOne({ deviceId: req.params.deviceId });
    if (!progress) {
      progress = await Progress.create({ userId: new require('mongoose').Types.ObjectId(), deviceId: req.params.deviceId });
    }
    res.json(progress);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
