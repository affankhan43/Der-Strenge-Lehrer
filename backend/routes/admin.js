const express = require('express');
const router  = express.Router();
const User     = require('../models/User');
const Progress = require('../models/Progress');
const { requireAuth } = require('../middleware/auth');

// ── Admin guard: only users whose email is in ADMIN_EMAILS ──
function requireAdmin(req, res, next) {
  const admins = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  const user = req._user;
  if (!user || !admins.includes(user.email.toLowerCase())) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

// Attach full user object to req._user for admin checks
async function loadUser(req, res, next) {
  try {
    req._user = await User.findById(req.userId);
    if (!req._user) return res.status(401).json({ error: 'User not found' });
    next();
  } catch { res.status(500).json({ error: 'Server error' }); }
}

router.use(requireAuth, loadUser, requireAdmin);

// ── GET /api/admin/stats ── overall platform stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalProgress] = await Promise.all([
      User.countDocuments(),
      Progress.countDocuments(),
    ]);

    const pipeline = await Progress.aggregate([
      { $group: {
        _id: null,
        totalTasks:   { $sum: '$totalTasksCompleted' },
        totalMinutes: { $sum: '$totalMinutesSpent' },
        avgStreak:    { $avg: '$streakCount' },
        maxStreak:    { $max: '$longestStreak' },
      }}
    ]);
    const agg = pipeline[0] || {};

    // Active in last 7 days
    const week = new Date(); week.setDate(week.getDate() - 7);
    const activeUsers = await Progress.countDocuments({ updatedAt: { $gte: week } });

    res.json({
      totalUsers, totalProgress, activeUsers,
      totalTasksCompleted: agg.totalTasks    || 0,
      totalMinutesSpent:   agg.totalMinutes  || 0,
      avgStreak:           Math.round(agg.avgStreak || 0),
      maxStreak:           agg.maxStreak     || 0,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/admin/users?page=1&limit=20&search= ──
router.get('/users', async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(50, parseInt(req.query.limit) || 20);
    const search = req.query.search?.trim();

    const filter = search
      ? { $or: [
          { email:       { $regex: search, $options:'i' } },
          { displayName: { $regex: search, $options:'i' } },
        ]}
      : {};

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -refreshTokens')
        .sort({ createdAt: -1 })
        .skip((page-1)*limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    // Attach progress summary
    const ids      = users.map(u => u._id);
    const progList = await Progress.find({ userId: { $in: ids } }).lean();
    const progMap  = Object.fromEntries(progList.map(p => [p.userId.toString(), p]));

    const enriched = users.map(u => ({
      ...u,
      progress: progMap[u._id.toString()] ? {
        currentDay:          progMap[u._id.toString()].currentDay,
        streakCount:         progMap[u._id.toString()].streakCount,
        totalTasksCompleted: progMap[u._id.toString()].totalTasksCompleted,
        totalMinutesSpent:   progMap[u._id.toString()].totalMinutesSpent,
        lastCompletedDate:   progMap[u._id.toString()].lastCompletedDate,
      } : null,
    }));

    res.json({ users: enriched, total, page, pages: Math.ceil(total/limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/admin/users/:id ── full user detail
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshTokens').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    const prog = await Progress.findOne({ userId: user._id }).lean();
    res.json({ user, progress: prog });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PATCH /api/admin/users/:id ── update user (xp, level, badges, audioEnabled)
router.patch('/users/:id', async (req, res) => {
  try {
    const allowed = ['displayName','xp','level','badges','audioEnabled','dailyReminderTime'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true })
      .select('-password -refreshTokens');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── DELETE /api/admin/users/:id ── delete user + progress
router.delete('/users/:id', async (req, res) => {
  try {
    await Promise.all([
      User.findByIdAndDelete(req.params.id),
      Progress.findOneAndDelete({ userId: req.params.id }),
    ]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/admin/users/:id/reset-progress ──
router.post('/users/:id/reset-progress', async (req, res) => {
  try {
    await Progress.findOneAndUpdate(
      { userId: req.params.id },
      { currentDay:1, streakCount:0, longestStreak:0, lastCompletedDate:null,
        totalTasksCompleted:0, totalMinutesSpent:0, xpEarned:0, days:[] },
      { new: true }
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/admin/activity ── recent completions
router.get('/activity', async (req, res) => {
  try {
    const recent = await Progress.find()
      .sort({ updatedAt: -1 })
      .limit(30)
      .populate('userId', 'displayName email')
      .lean();
    res.json({ activity: recent });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
