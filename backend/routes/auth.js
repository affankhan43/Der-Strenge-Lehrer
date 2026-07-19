const express  = require('express');
const router   = express.Router();
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const User     = require('../models/User');
const { signAccess, signRefresh, verifyRefresh, requireAuth } = require('../middleware/auth');

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many requests' } });

function validationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array()[0].msg });
    return true;
  }
  return false;
}

// POST /api/auth/signup
router.post('/signup', limiter, [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('displayName').optional().trim().isLength({ min: 1, max: 40 }).withMessage('Name too long'),
  body('mobile').optional().trim(),
], async (req, res) => {
  if (validationErrors(req, res)) return;
  const { email, password, displayName, mobile, socialProfiles } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const user = await User.create({
      email, password,
      displayName: displayName || null,
      mobile: mobile || null,
      socialProfiles: socialProfiles || [],
    });

    const accessToken  = signAccess(user._id.toString());
    const refreshToken = signRefresh(user._id.toString());
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.status(201).json({ user: user.toPublicJSON(), accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', limiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  if (validationErrors(req, res)) return;
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const accessToken  = signAccess(user._id.toString());
    const refreshToken = signRefresh(user._id.toString());
    user.refreshTokens.push(refreshToken);
    // keep max 5 refresh tokens (multi-device)
    if (user.refreshTokens.length > 5) user.refreshTokens = user.refreshTokens.slice(-5);
    await user.save();
    res.json({ user: user.toPublicJSON(), accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
  try {
    const payload = verifyRefresh(refreshToken);
    const user = await User.findById(payload.sub);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    const newAccess  = signAccess(user._id.toString());
    const newRefresh = signRefresh(user._id.toString());
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    user.refreshTokens.push(newRefresh);
    await user.save();
    res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// POST /api/auth/logout
router.post('/logout', requireAuth, async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (user && refreshToken) {
      user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
      await user.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.toPublicJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/auth/profile
router.patch('/profile', requireAuth, [
  body('displayName').optional().trim().isLength({ min: 1, max: 40 }),
  body('mobile').optional().trim(),
  body('audioEnabled').optional().isBoolean(),
], async (req, res) => {
  if (validationErrors(req, res)) return;
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { displayName, mobile, socialProfiles, audioEnabled, dailyReminderTime, timezone } = req.body;
    if (displayName  !== undefined) user.displayName  = displayName;
    if (mobile       !== undefined) user.mobile       = mobile;
    if (socialProfiles !== undefined) user.socialProfiles = socialProfiles;
    if (audioEnabled !== undefined) user.audioEnabled = audioEnabled;
    if (dailyReminderTime !== undefined) user.dailyReminderTime = dailyReminderTime;
    if (timezone     !== undefined) user.timezone     = timezone;
    await user.save();
    res.json(user.toPublicJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/auth/change-password
router.patch('/change-password', requireAuth, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], async (req, res) => {
  if (validationErrors(req, res)) return;
  try {
    const user = await User.findById(req.userId);
    if (!user || !(await user.comparePassword(req.body.currentPassword))) {
      return res.status(401).json({ error: 'Current password incorrect' });
    }
    user.password = req.body.newPassword;
    user.refreshTokens = []; // invalidate all sessions on password change
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
