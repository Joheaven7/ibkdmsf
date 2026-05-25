const mongoose = require('mongoose');

const vitalEventSchema = new mongoose.Schema({
  type: { type: String, enum: ['birth', 'death', 'marriage', 'divorce'], required: true },
  name: { type: String, required: true, trim: true },
  fatherName: { type: String, default: '' },
  motherName: { type: String, default: '' },
  dob: { type: String, default: '' },
  dod: { type: String, default: '' },
  gender: { type: String, default: '' },
  age: { type: String, default: '' },
  cause: { type: String, default: '' },
  place: { type: String, default: '' },
  kebele: { type: String, default: '03' },
  husbandName: { type: String, default: '' },
  wifeName: { type: String, default: '' },
  dateOfMarriage: { type: String, default: '' },
  dateOfDivorce: { type: String, default: '' },
  reason: { type: String, default: '' },
  recordedBy: { type: String, default: '' },
  recordedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  // Witness Information
  witnessName: { type: String, default: '' },
  witnessPhone: { type: String, default: '' },
  witnessRelation: { type: String, default: '' },
  witnessAddress: { type: String, default: '' },
  // Soft Delete
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });
// Add after schema definition, before module.exports
vitalEventSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

vitalEventSchema.index({ type: 1 });
vitalEventSchema.index({ kebele: 1 });
vitalEventSchema.index({ createdAt: -1 });

module.exports = mongoose.model('VitalEvent', vitalEventSchema);