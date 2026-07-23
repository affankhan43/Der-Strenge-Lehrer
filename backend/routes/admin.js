const express  = require('express');
const router   = express.Router();
const User     = require('../models/User');
const Progress = require('../models/Progress');
const Feedback = require('../models/Feedback');
const Review   = require('../models/Review');
const Reel     = require('../models/Reel');
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

// ── GET /api/admin/ping ── used by frontend to detect admin status
router.get('/ping', (req, res) => {
  res.json({ isAdmin: true, email: req._user.email });
});

// ── GET /api/admin/feedback ── list feedback
router.get('/feedback', async (req, res) => {
  try {
    const status = req.query.status;
    const filter = status ? { status } : {};
    const items = await Feedback.find(filter).sort({ createdAt: -1 }).limit(200).lean();
    const counts = {
      new:      await Feedback.countDocuments({ status:'new' }),
      read:     await Feedback.countDocuments({ status:'read' }),
      resolved: await Feedback.countDocuments({ status:'resolved' }),
    };
    res.json({ feedback: items, counts });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PATCH /api/admin/feedback/:id ── update status / admin note
router.patch('/feedback/:id', async (req, res) => {
  try {
    const allowed = ['status','adminNote'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const item = await Feedback.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ feedback: item });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── DELETE /api/admin/feedback/:id ──
router.delete('/feedback/:id', async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ══════════════════════════════════════════════
// CONTENT MANAGEMENT
// ══════════════════════════════════════════════
const path = require('path');
const fs   = require('fs');

const CONTENT_BASE = path.join(__dirname, '../../web/public/content/missions');
const TYPES = ['vocab', 'course_video', 'reading', 'grammar', 'schreiben', 'easygerman', 'speaking'];
const LEVEL_MAP = {
  'A1.1': [1,28], 'A1.2': [29,56], 'A2.1': [57,84], 'A2.2': [85,112],
  'B1.1': [113,140], 'B1.2': [141,168], 'B2.1': [169,196], 'B2.2': [197,224],
};

function dayDir(day) {
  return path.join(CONTENT_BASE, 'day-' + String(day).padStart(2,'0'));
}
function contentFile(day, type) {
  return path.join(dayDir(day), type + '.json');
}
function validateDay(d) {
  const n = parseInt(d);
  return Number.isInteger(n) && n >= 1 && n <= 224 ? n : null;
}

// GET /api/admin/content/index — list all days and which files exist
router.get('/content/index', (req, res) => {
  try {
    const result = {};
    for (const [level, [start, end]] of Object.entries(LEVEL_MAP)) {
      result[level] = [];
      for (let d = start; d <= end; d++) {
        const dir = dayDir(d);
        const files = {};
        for (const t of TYPES) {
          files[t] = fs.existsSync(path.join(dir, t + '.json'));
        }
        result[level].push({ day: d, files });
      }
    }
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/content/:day/:type — read a content file
router.get('/content/:day/:type', (req, res) => {
  const day = validateDay(req.params.day);
  if (!day) return res.status(400).json({ error: 'Invalid day' });
  if (!TYPES.includes(req.params.type)) return res.status(400).json({ error: 'Invalid type' });
  const file = contentFile(day, req.params.type);
  if (!fs.existsSync(file)) return res.json({ exists: false, content: null });
  try {
    const raw = fs.readFileSync(file, 'utf8');
    res.json({ exists: true, content: JSON.parse(raw) });
  } catch (err) { res.status(500).json({ error: 'Parse error: ' + err.message }); }
});

// PUT /api/admin/content/:day/:type — write a content file
router.put('/content/:day/:type', (req, res) => {
  const day = validateDay(req.params.day);
  if (!day) return res.status(400).json({ error: 'Invalid day' });
  if (!TYPES.includes(req.params.type)) return res.status(400).json({ error: 'Invalid type' });
  const { content } = req.body;
  if (content === undefined || content === null) return res.status(400).json({ error: 'content required' });
  try {
    const dir = dayDir(day);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(contentFile(day, req.params.type), JSON.stringify(content, null, 2));
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

// ══════════════════════════════════════════════
// REELS MANAGEMENT
// ══════════════════════════════════════════════
function parseReelUrl(url) {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (yt) return { platform: 'youtube', videoId: yt[1] };
  const ig = url.match(/instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/);
  if (ig) return { platform: 'instagram', videoId: ig[1] };
  const tt = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  if (tt) return { platform: 'tiktok', videoId: tt[1] };
  const ttShort = url.match(/vm\.tiktok\.com\/([a-zA-Z0-9]+)/);
  if (ttShort) return { platform: 'tiktok', videoId: ttShort[1] };
  return null;
}

router.get('/reels', async (req, res) => {
  try {
    const filter = {};
    if (req.query.level) filter.level = req.query.level;
    const reels = await Reel.find(filter).sort({ level: 1, order: 1, createdAt: -1 });
    res.json({ reels });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/reels', async (req, res) => {
  try {
    const { url, level, title, description, order } = req.body;
    if (!url || !level) return res.status(400).json({ error: 'url and level required' });
    const parsed = parseReelUrl(url.trim());
    if (!parsed) return res.status(400).json({ error: 'Unbekannte URL. Unterstützt: YouTube, Instagram, TikTok.' });
    const reel = await Reel.create({ url: url.trim(), ...parsed, level, title: title || '', description: description || '', order: order || 0 });
    res.json({ reel });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/reels/:id', async (req, res) => {
  try {
    const allowed = ['level','title','description','order','active'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const reel = await Reel.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!reel) return res.status(404).json({ error: 'Not found' });
    res.json({ reel });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/reels/:id', async (req, res) => {
  try {
    await Reel.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/admin/reviews ── list all (pending first)
router.get('/reviews', requireAdmin, async (req, res) => {
  try {
    const filter = {};
    if (req.query.approved === 'true')  filter.approved = true;
    if (req.query.approved === 'false') filter.approved = false;
    const reviews = await Review.find(filter).sort({ approved: 1, createdAt: -1 }).lean();
    const counts = {
      pending:  await Review.countDocuments({ approved: false }),
      approved: await Review.countDocuments({ approved: true }),
      featured: await Review.countDocuments({ featured: true }),
    };
    res.json({ reviews, counts });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PATCH /api/admin/reviews/:id ── approve / feature / reject
router.patch('/reviews/:id', requireAdmin, async (req, res) => {
  try {
    const allowed = ['approved', 'featured', 'displayName', 'levelTag'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const review = await Review.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!review) return res.status(404).json({ error: 'Not found' });
    res.json({ review });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── DELETE /api/admin/reviews/:id
router.delete('/reviews/:id', requireAdmin, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
