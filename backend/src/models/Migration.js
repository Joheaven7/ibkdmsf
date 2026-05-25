const mongoose = require('mongoose');

const migrationSchema = new mongoose.Schema({
  fullName:       { type: String, required: true, trim: true },
  gender:         { type: String, enum: ['Male', 'Female', ''], default: '' },
  dob:            { type: String, default: '' },
  idNo:           { type: String, default: '' },
  phone:          { type: String, default: '' },
  migrationType:  { type: String, enum: ['incoming', 'outgoing'], required: true },
  fromKebele:     { type: String, default: '' },
  toKebele:       { type: String, default: '' },
  fromWoreda:     { type: String, default: '' },
  toWoreda:       { type: String, default: '' },
  date:           { type: String, required: true },
  reason:         { type: String, default: '' },
  kebele:         { type: String, default: '03' },
  residentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', default: null },
  status:         { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  note:           { type: String, default: '' },
  documents:      { type: Map, of: String, default: {} },
  registeredBy:   { type: String, default: '' },
  registeredById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt:     { type: Date, default: null },
  isDeleted:      { type: Boolean, default: false },
  deletedAt:      { type: Date, default: null },
  deletedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

migrationSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

migrationSchema.index({ status: 1 });
migrationSchema.index({ migrationType: 1 });
migrationSchema.index({ kebele: 1 });
migrationSchema.index({ createdAt: -1 });
migrationSchema.index({ fullName: 1, date: 1, migrationType: 1 });

module.exports = mongoose.model('Migration', migrationSchema);
