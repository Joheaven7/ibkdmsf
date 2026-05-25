const mongoose = require('mongoose');

const divorceSchema = new mongoose.Schema({
  partner1: { type: String, required: true, trim: true },
  partner2: { type: String, required: true, trim: true },
  partner1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', default: null },
  partner2Id: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', default: null },
  date: { type: String, required: true },
  reason: { type: String, default: '' },
  kebele: { type: String, default: '03' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  note: { type: String, default: '' },
  preferredAppointmentDate: { type: String, default: '' },
  documents: { type: Map, of: String, default: {} },
  registeredBy: { type: String, default: '' },
  registeredById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
  // Add field to each schema
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });
// Add after schema definition, before module.exports
divorceSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

divorceSchema.index({ partner1: 1, partner2: 1, date: 1 });
divorceSchema.index({ status: 1 });

module.exports = mongoose.model('Divorce', divorceSchema);