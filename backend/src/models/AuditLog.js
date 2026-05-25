const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action:         { type: String, required: true },
  performedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  performedByName:{ type: String, required: true },
  targetModel:    { type: String, required: true },
  targetId:       { type: mongoose.Schema.Types.ObjectId },
  description:    { type: String, default: '' },
  previousStatus: { type: String, default: '' },
  newStatus:      { type: String, default: '' },
  ip:             { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);