const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  kebele:           { type: String, default: 'Ifa Bula' },
  woreda:           { type: String, default: 'Woreda 03' },
  zone:             { type: String, default: 'Jimma Zone' },
  region:           { type: String, default: 'Oromia' },
  registrarName:    { type: String, default: 'Kebele Registrar' },
  registrarLicense: { type: String, default: 'VE-001' },
  contactPhone:     { type: String, default: '' },
  contactEmail:     { type: String, default: '' },
  maintenanceMode:  { type: Boolean, default: false },
  allowResidentSelfRegister: { type: Boolean, default: false },
  maxFileUploadMB:  { type: Number, default: 5 },
}, { timestamps: true });

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);