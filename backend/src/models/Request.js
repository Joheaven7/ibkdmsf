const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
  residentName: { type: String, required: true },
  type: { type: String, enum: ['birth', 'death', 'residency', 'marriage', 'divorce', 'migration'], required: true },
  purpose: { type: String, default: '' },
  preferredDate: { type: String, default: '' },
  preferredAppointmentDate: { type: String, default: '' },
  childName: { type: String, default: '' },
  dateOfBirth: { type: String, default: '' },
  placeOfBirth: { type: String, default: '' },
  childGender: { type: String, default: '' },
  deceasedName: { type: String, default: '' },
  dateOfDeath: { type: String, default: '' },
  placeOfDeath: { type: String, default: '' },
  causeOfDeath: { type: String, default: '' },
  additionalInfo: { type: String, default: '' },
  fromLocation: { type: String, default: '' },
  toLocation: { type: String, default: '' },
  migrationDate: { type: String, default: '' },
  documents: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewNotes: { type: String, default: '' },
  processedBy: { type: String, default: null },
  processedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  processedAt: { type: Date, default: null },
  certificateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate', default: null },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

requestSchema.index({ residentId: 1, status: 1 });
requestSchema.index({ type: 1, status: 1, createdAt: -1 });
requestSchema.index({ status: 1, createdAt: 1 });
requestSchema.index({ processedBy: 1, status: 1 });

requestSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeDeleted) this.where({ isDeleted: false });
  next();
});

module.exports = mongoose.model('Request', requestSchema);