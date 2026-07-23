const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  displayName: { type: String, trim: true, default: 'Anonymer Schüler' },
  initials:    { type: String, trim: true, default: '?' },
  rating:      { type: Number, required: true, min: 1, max: 5 },
  message:     { type: String, required: true, trim: true, maxlength: 500 },
  levelTag:    { type: String, trim: true, default: '' }, // e.g. "A1 → B2"
  approved:    { type: Boolean, default: false }, // admin must approve before showing on landing
  featured:    { type: Boolean, default: false }, // pinned to top of carousel
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
