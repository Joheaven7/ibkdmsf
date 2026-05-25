const mongoose = require('mongoose');

const marriageSchema = new mongoose.Schema({
  husbandName: { type: String, required: true, trim: true },
  wifeName: { type: String, required: true, trim: true },
  husbandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', default: null },
  wifeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', default: null },
  date: { type: String, required: true },
  witnessName: { type: String, default: '' },
  witnessPhone: { type: String, default: '' },
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
marriageSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

// FIX #14 — prevent duplicate marriages
marriageSchema.index({ husbandName: 1, wifeName: 1, date: 1 }, { unique: true });
marriageSchema.index({ status: 1 });

module.exports = mongoose.model('Marriage', marriageSchema);