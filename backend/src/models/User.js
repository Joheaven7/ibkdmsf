const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  username: { type: String, required: true, lowercase: true, trim: true },
  email:    { type: String, required: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  role:     { type: String, enum: ['superadmin', 'admin', 'clerk', 'resident'], default: 'resident' },
  phone:    { type: String, default: '' },
  kebele:   { type: String, default: '03' },
  status:   { type: String, enum: ['active', 'inactive'], default: 'active' },
  isDeleted:  { type: Boolean, default: false },
  deletedAt:  { type: Date,    default: null  },
  deletedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  permissions: [{ type: String }],
  refreshTokens: [{ token: String, expiresAt: Date }],
  lastLogin: { type: Date, default: null },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },
  passwordChangedAt: { type: Date, default: null },
}, { timestamps: true });
// Add after schema definition, before module.exports
userSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

// Never return password in JSON responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);