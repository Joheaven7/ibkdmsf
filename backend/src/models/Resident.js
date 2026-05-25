const mongoose = require('mongoose');

const residentSchema = new mongoose.Schema({
  // ── Core Identity ──
  fullName: { type: String, required: true, trim: true },
  fatherName: { type: String, required: true, trim: true },
  grandfatherName: { type: String, default: '', trim: true },
  motherName: { type: String, required: true, trim: true },
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  dob: { type: String, required: true },

  // ── Location & Address ──
  placeOfBirth: { type: String, default: '' },
  nationality: { type: String, default: 'Ethiopian' },
  region: { type: String, default: 'Oromia' },
  zone: { type: String, default: 'Jimma' },
  woreda: { type: String, default: 'Ifa Bula' },
  kebele: { type: String, default: '03' },
  houseNo: { type: String, default: '' },
  phone: { type: String, default: '' },
  idNo: { type: String, default: '' },

  // ── Socioeconomic ──
  occupation: { type: String, default: '' },
  maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed'], default: 'Single' },

  // ── Emergency Contact ──
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relationship: { type: String, default: '' },
  },

  // ── Family Linkage ──
  spouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', default: null },
  fatherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', default: null },
  motherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', default: null },
  householdId: { type: String, default: null },
  isFamilyHead: { type: Boolean, default: false },

  // ── Verification Workflow ──
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  verifiedAt: { type: Date, default: null },

  // ── System ──
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // ── Soft Delete ──
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

// Soft-delete filter
residentSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

// Indexes
residentSchema.index({ kebele: 1 });
residentSchema.index({ status: 1 });
residentSchema.index({ idNo: 1 }, { sparse: true });
residentSchema.index({ householdId: 1 }, { sparse: true });
residentSchema.index({ isVerified: 1 });
module.exports = mongoose.model('Resident', residentSchema);