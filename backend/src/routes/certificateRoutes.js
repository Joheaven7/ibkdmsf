const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const { protect, authorize } = require('../middleware/auth');
const { parsePagination, sendList } = require('../lib/pagination');
const { logAction } = require('../middleware/audit');

// GET /api/certificates/verify/:certificateNumber — public
router.get('/verify/:certificateNumber', async (req, res) => {
  try {
    const cert = await Certificate.findOne({
      certificateNumber: req.params.certificateNumber,
    }).populate('residentId', 'fullName fatherName kebele');
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found.' });
    res.json({ success: true, data: cert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// All routes below require authentication
router.use(protect);

// GET /api/certificates
router.get('/', async (req, res) => {
  try {
    const { type, status, search } = req.query;
    const { hasPage, page, limit, skip } = parsePagination(req.query, { defaultLimit: 25, maxLimit: 100 });
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { certificateNumber: { $regex: search, $options: 'i' } },
        { residentName: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Certificate.countDocuments(filter);
    let query = Certificate.find(filter)
      .populate('residentId', 'fullName fatherName kebele')
      .populate('issuedBy', 'name')
      .sort({ createdAt: -1 });
    if (hasPage) query = query.skip(skip).limit(limit);

    const data = await query;
    return sendList(res, { data, total, page, limit, hasPage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/certificates
router.post('/', authorize('clerk', 'admin'), logAction('create', 'Certificate'), async (req, res) => {
  try {
    const cert = await Certificate.create({
      ...req.body,
      issuedBy: req.user._id,
      issuedByName: req.user.name,
    });
    res.status(201).json({ success: true, data: cert });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Certificate number already exists.' });
    }
    res.status(500).json({ message: err.message });
  }
});

// GET /api/certificates/:id
router.get('/:id', async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id)
      .populate('residentId', 'fullName fatherName kebele')
      .populate('issuedBy', 'name');
    if (!cert) return res.status(404).json({ message: 'Certificate not found.' });
    res.json({ success: true, data: cert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/certificates/:id/revoke
router.patch('/:id/revoke', authorize('admin', 'superadmin'), logAction('revoke', 'Certificate'), async (req, res) => {
  try {
    const cert = await Certificate.findByIdAndUpdate(
      req.params.id,
      {
        status: 'revoked',
        revokedBy: req.user._id,
        revokedAt: new Date(),
        revokeReason: req.body.reason || '',
      },
      { new: true }
    );
    if (!cert) return res.status(404).json({ message: 'Certificate not found.' });
    res.json({ success: true, data: cert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
