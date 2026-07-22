const mongoose = require('mongoose');

const ReelSchema = new mongoose.Schema({
  url:         { type: String, required: true, trim: true },
  platform:    { type: String, enum: ['youtube', 'instagram', 'tiktok'], required: true },
  videoId:     { type: String, required: true, trim: true },
  level:       { type: String, required: true },
  title:       { type: String, trim: true, default: '' },
  description: { type: String, trim: true, default: '' },
  order:       { type: Number, default: 0 },
  active:      { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Reel', ReelSchema);
