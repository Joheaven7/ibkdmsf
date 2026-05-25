const Divorce = require('../models/Divorce');
const Resident = require('../models/Resident');
const mongoose = require('mongoose');
const { parsePagination, sendList } = require('../lib/pagination');

exports.getDivorces = async (req, res) => {
  try {
    const { status, kebele, search } = req.query;
    const { hasPage, page, limit, skip } = parsePagination(req.query, { defaultLimit: 25, maxLimit: 100 });
    const filter = {};
    if (status) filter.status = status;
    if (kebele) filter.kebele = kebele;
    if (search) {
      filter.$or = [
        { partner1: { $regex: search, $options: 'i' } },
        { partner2: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Divorce.countDocuments(filter);
    let query = Divorce.find(filter)
      .populate('partner1Id', 'fullName fatherName idNo')
      .populate('partner2Id', 'fullName fatherName idNo')
      .sort({ createdAt: -1 });
    if (hasPage) query = query.skip(skip).limit(limit);

    const data = await query;
    return sendList(res, { data, total, page, limit, hasPage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createDivorce = async (req, res) => {
  try {
    const documents = {};
    if (req.files) {
      Object.keys(req.files).forEach(f => { documents[f] = req.files[f][0].filename; });
    }

    // ── Best-effort relational linking ──
    let { partner1Id, partner2Id } = req.body;
    if (partner1Id && mongoose.Types.ObjectId.isValid(partner1Id)) {
      const found = await Resident.findById(partner1Id);
      partner1Id = found ? found._id : null;
    } else {
      partner1Id = null;
    }
    if (partner2Id && mongoose.Types.ObjectId.isValid(partner2Id)) {
      const found = await Resident.findById(partner2Id);
      partner2Id = found ? found._id : null;
    } else {
      partner2Id = null;
    }

    const divorce = await Divorce.create({
      ...req.body,
      partner1Id,
      partner2Id,
      documents,
      registeredBy:   req.user.name,
      registeredById: req.user._id,
      status: 'pending',
    });
    res.status(201).json({ success: true, data: divorce });
  } catch (err) {
    // ── Duplicate key error (code 11000) ──
    if (err.code === 11000) {
      return res.status(400).json({
        message: 'A divorce record with the same partners and date already exists.',
      });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected.' });
    }
    const divorce = await Divorce.findByIdAndUpdate(
      req.params.id,
      { status, note: note || '', reviewedBy: req.user._id, reviewedAt: new Date() },
      { new: true }
    );
    if (!divorce) return res.status(404).json({ message: 'Divorce record not found.' });
    res.json({ success: true, data: divorce });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteDivorce = async (req, res) => {
  try {
    const divorce = await Divorce.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date(), deletedBy: req.user._id },
      { new: true }
    );
    if (!divorce) return res.status(404).json({ message: 'Divorce record not found.' });
    res.json({ success: true, message: 'Divorce record deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};