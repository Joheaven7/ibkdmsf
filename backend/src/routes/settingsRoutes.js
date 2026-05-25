const express = require('express');
const router = express.Router();
const Settings = require('../models/SystemSettings');
const { protect, authorize } = require('../middleware/auth');

// GET /api/settings — public read (so certificates can use registrar name)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/settings — superadmin only
router.patch('/', protect, authorize('superadmin'), async (req, res) => {
  try {
    const whitelist = [
      'kebele', 'woreda', 'zone', 'region',
      'registrarName', 'registrarLicense', 'contactPhone',
      'contactEmail', 'maintenanceMode', 'allowResidentSelfRegister',
      'maxFileUploadMB'
    ];
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});

    whitelist.forEach(field => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;