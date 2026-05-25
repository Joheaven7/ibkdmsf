const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certificateNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ['birth', 'death', 'residency', 'marriage', 'divorce', 'migration'], required: true },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', default: null },
  marriageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Marriage', default: null },
  divorceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Divorce', default: null },
  migrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Migration', default: null },
  residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', default: null },
  residentName: { type: String, required: true },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issuedByName: { type: String, required: true },
  issuedAt: { type: Date, default: Date.now },
  kebele: { type: String, default: '03' },
  status: { type: String, enum: ['valid', 'revoked'], default: 'valid' },
  revokedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  revokedAt: { type: Date, default: null },
  revokeReason: { type: String, default: '' },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  digitalSignature: {
    officerName: { type: String, default: '' },
    officerTitle: { type: String, default: '' },
    licenseId: { type: String, default: '' },
    signedAt: { type: Date, default: null },
  },
}, { timestamps: true });

certificateSchema.index({ type: 1, status: 1 });
certificateSchema.index({ residentId: 1 });
certificateSchema.index({ requestId: 1 });
certificateSchema.index({ issuedAt: -1 });

module.exports = mongoose.model('Certificate', certificateSchema);