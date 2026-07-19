const express  = require('express');
const router   = express.Router();
const Progress = require('../models/Progress');
const User     = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const tasks    = require('../../data/tasks.json');

// XP per task type
const XP_MAP = { anki: 10, video: 15, reading: 20, grammar: 25, speaking: 20 };

function getToday() { return new Date().toISOString().split('T')[0]; }
function daysBetween(d1, d2) {
  return Math.floor((new Date(d2) - new Date(d1)) / 86400000);
}

// ── GET /api/tasks (all)
router.get('/tasks', (req, res) => res.json(tasks));

// ── GET /api/tasks/:day
router.get('/tasks/:day', (req, res) => {
  const day = parseInt(req.params.day);
  const dayTasks = tasks.filter(t => t.day === day).sort((a, b) => a.order - b.order);
  if (!dayTasks.length) return res.status(404).json({ error: 'Day not found' });
  res.json(dayTasks);
});

// ── GET /api/progress  (requires auth)
router.get('/progress', requireAuth, async (req, res) => {
  try {
    let progress = await Progress.findOne({ userId: req.userId });
    if (!progress) progress = await Progress.create({ userId: req.userId });
    res.json(progress);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/stats  (requires auth)
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const progress = await Progress.findOne({ userId: req.userId });
    if (!progress) return res.json({ totalMinutesSpent: 0, totalTasksCompleted: 0, days: [] });
    res.json({
      totalMinutesSpent:   progress.totalMinutesSpent   || 0,
      totalTasksCompleted: progress.totalTasksCompleted || 0,
      streakCount:         progress.streakCount         || 0,
      longestStreak:       progress.longestStreak       || 0,
      currentDay:          progress.currentDay          || 1,
      xpEarned:            progress.xpEarned            || 0,
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

// ── GET /api/history  (requires auth)
router.get('/history', requireAuth, async (req, res) => {
  try {
    const progress = await Progress.findOne({ userId: req.userId });
    if (!progress) return res.json([]);

    const history = (progress.days || []).map(d => {
      const dayTasks = tasks.filter(t => t.day === d.day);
      const completedTaskIds = new Set((d.tasks || []).filter(t => t.completed).map(t => t.taskId));
      return {
        day: d.day,
        date: d.date,
        completed: d.completed,
        minutesSpent: d.minutesSpent || 0,
        tasksCompleted: completedTaskIds.size,
        totalTasks: dayTasks.length,
        week: dayTasks[0]?.week || 1,
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

// ── POST /api/progress/link-click
router.post('/progress/link-click', requireAuth, async (req, res) => {
  const { taskId, day } = req.body;
  try {
    let progress = await Progress.findOne({ userId: req.userId });
    if (!progress) progress = await Progress.create({ userId: req.userId });

    let dayEntry = progress.days.find(d => d.day === day);
    if (!dayEntry) {
      const dayTasks = tasks.filter(t => t.day === day);
      progress.days.push({
        day, date: getToday(),
        tasks: dayTasks.map(t => ({ taskId: t.id, completed: false, linkClicked: false }))
      });
      dayEntry = progress.days[progress.days.length - 1];
    }
    const taskEntry = dayEntry.tasks.find(t => t.taskId === taskId);
    if (taskEntry) taskEntry.linkClicked = true;
    await progress.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/progress/complete-task
router.post('/progress/complete-task', requireAuth, async (req, res) => {
  const { taskId, day } = req.body;
  const today = getToday();
  try {
    let progress = await Progress.findOne({ userId: req.userId });
    if (!progress) progress = await Progress.create({ userId: req.userId });

    let dayEntry = progress.days.find(d => d.day === day);
    if (!dayEntry) {
      const dayTasks = tasks.filter(t => t.day === day);
      progress.days.push({
        day, date: today,
        tasks: dayTasks.map(t => ({ taskId: t.id, completed: false, linkClicked: false }))
      });
      dayEntry = progress.days[progress.days.length - 1];
    }

    const taskMeta  = tasks.find(t => t.id === taskId);
    const taskEntry = dayEntry.tasks.find(t => t.taskId === taskId);
    let xpGained = 0;

    if (taskEntry && !taskEntry.completed) {
      const mins = taskMeta?.duration_minutes || 0;
      xpGained = XP_MAP[taskMeta?.type] || 10;
      taskEntry.completed  = true;
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
    if (completedCount >= dayTasks.length && !dayEntry.completed) {
      dayEntry.completed = true;
      if (progress.lastCompletedDate) {
        const diff = daysBetween(progress.lastCompletedDate, today);
        if (diff === 1)      progress.streakCount += 1;
        else if (diff > 1)   progress.streakCount  = 1;
      } else {
        progress.streakCount = 1;
      }
      progress.lastCompletedDate = today;
      if (progress.streakCount > progress.longestStreak)
        progress.longestStreak = progress.streakCount;
      if (progress.currentDay === day && day < 28)
        progress.currentDay = day + 1;
    }

    await progress.save();

    // Sync XP to User model
    if (xpGained > 0) {
      const user = await User.findById(req.userId);
      if (user) {
        user.xp += xpGained;
        user.level = Math.floor(user.xp / 100) + 1;
        // Award badges
        if (progress.streakCount === 7  && !user.badges.includes('week_streak'))  user.badges.push('week_streak');
        if (progress.streakCount === 14 && !user.badges.includes('2week_streak')) user.badges.push('2week_streak');
        if (progress.streakCount === 28 && !user.badges.includes('full_month'))   user.badges.push('full_month');
        if (progress.totalTasksCompleted === 10  && !user.badges.includes('10_tasks'))  user.badges.push('10_tasks');
        if (progress.totalTasksCompleted === 50  && !user.badges.includes('50_tasks'))  user.badges.push('50_tasks');
        if (progress.totalTasksCompleted === 140 && !user.badges.includes('all_tasks')) user.badges.push('all_tasks');
        await user.save();
      }
    }

    res.json({ progress, xpGained });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/progress/reset  (dev/testing)
router.post('/progress/reset', requireAuth, async (req, res) => {
  try {
    await Progress.deleteOne({ userId: req.userId });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Legacy: deviceId-based progress (for old clients still using plain HTML)
router.get('/progress/:deviceId', async (req, res) => {
  try {
    let progress = await Progress.findOne({ deviceId: req.params.deviceId });
    if (!progress) {
      // create orphan progress for unauthenticated legacy clients
      progress = await Progress.create({ userId: new require('mongoose').Types.ObjectId(), deviceId: req.params.deviceId });
    }
    res.json(progress);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
