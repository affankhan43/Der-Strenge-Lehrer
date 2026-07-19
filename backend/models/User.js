const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SocialProfileSchema = new mongoose.Schema({
  platform: { type: String, enum: ['instagram', 'twitter', 'linkedin', 'facebook', 'github', 'other'] },
  handle: String
}, { _id: false });

const UserSchema = new mongoose.Schema({
  email: {
    type: String, required: true, unique: true,
    lowercase: true, trim: true
  },
  password: { type: String, required: true, minlength: 6 },
  mobile: { type: String, trim: true, default: null },
  displayName: { type: String, trim: true, default: null },
  avatar: { type: String, default: null },
  socialProfiles: [SocialProfileSchema],
  // Gamification
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [{ type: String }],
  // Auth
  isVerified: { type: Boolean, default: true },
  refreshTokens: [{ type: String }],
  // Preferences
  audioEnabled: { type: Boolean, default: true },
  dailyReminderTime: { type: String, default: '08:00' },
  timezone: { type: String, default: 'UTC' },
}, { timestamps: true });

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    email: this.email,
    displayName: this.displayName || this.email.split('@')[0],
    mobile: this.mobile,
    avatar: this.avatar,
    socialProfiles: this.socialProfiles,
    xp: this.xp,
    level: this.level,
    badges: this.badges,
    audioEnabled: this.audioEnabled,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', UserSchema);
