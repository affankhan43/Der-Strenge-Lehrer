const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  name:    { type: String, trim: true, default: 'Anonym' },
  email:   { type: String, trim: true, lowercase: true, default: null },
  type:    { type: String, enum: ['bug','feature','suggestion','other'], default: 'other' },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  status:  { type: String, enum: ['new','read','resolved'], default: 'new' },
  adminNote: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);
