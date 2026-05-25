const bcrypt = require('bcryptjs');
const Resident = require('../models/Resident');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.createResident = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      fullName, fatherName, grandfatherName, motherName, gender, dob,
      placeOfBirth, nationality, region, zone, woreda,
      kebele, houseNo, phone, idNo,
      occupation, maritalStatus,
      emergencyContact,
      spouseId, fatherId, motherId, householdId, isFamilyHead,
      email, password,
    } = req.body;

    // FIX #13 — check duplicate idNo
    if (idNo) {
      const dup = await Resident.findOne({ idNo: idNo.trim(), isDeleted: false });
      if (dup) {
        await session.abortTransaction();
        return res.status(400).json({ message: `ID number ${idNo} is already registered.` });
      }
    }

    let userId = null;
    if (email && password) {
      const exists = await User.findOne({ email: email.toLowerCase() }).session(session);
      if (exists) {
        await session.abortTransaction();
        return res.status(400).json({ message: 'Email already registered.' });
      }
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9.]/g, '');
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      const [newUser] = await User.create([{
        name: fullName, username, email, password: hashed,
        role: 'resident', kebele, phone: phone || '', status: 'active',
      }], { session });
      userId = newUser._id;
    }

    const [resident] = await Resident.create([{
      fullName, fatherName,
      grandfatherName: grandfatherName || '',
      motherName, gender, dob,
      placeOfBirth: placeOfBirth || '',
      nationality: nationality || 'Ethiopian',
      region: region || 'Oromia',
      zone: zone || 'Jimma',
      woreda: woreda || 'Ifa Bula',
      kebele: kebele || '03',
      houseNo: houseNo || '',
      phone: phone || '',
      idNo: idNo || '',
      occupation: occupation || '',
      maritalStatus: maritalStatus || 'Single',
      emergencyContact: emergencyContact || { name: '', phone: '', relationship: '' },
      spouseId: spouseId || null,
      fatherId: fatherId || null,
      motherId: motherId || null,
      householdId: householdId || null,
      isFamilyHead: isFamilyHead || false,
      status: 'active',
      userId,
      registeredBy: req.user._id,
    }], { session });

    await session.commitTransaction();
    res.status(201).json({ success: true, data: resident });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

// GET /api/residents
exports.getResidents = async (req, res) => {
  try {
    const { search, status, kebele, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (kebele) filter.kebele = kebele;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { fatherName: { $regex: search, $options: 'i' } },
        { grandfatherName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { idNo: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Resident.countDocuments(filter);
    const data = await Resident.find(filter)
      .populate('registeredBy', 'name')
      .populate('verifiedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/residents/:id
exports.getResident = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id)
      .populate('registeredBy', 'name')
      .populate('verifiedBy', 'name')
      .populate('userId', 'email username role status')
      .populate('spouseId', 'fullName fatherName')
      .populate('fatherId', 'fullName fatherName')
      .populate('motherId', 'fullName fatherName');
    if (!resident) return res.status(404).json({ message: 'Resident not found.' });
    res.json({ success: true, data: resident });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/residents/:id
exports.updateResident = async (req, res) => {
  try {
    const resident = await Resident.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!resident) return res.status(404).json({ message: 'Resident not found.' });
    res.json({ success: true, data: resident });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/residents/:id (soft delete)
exports.deleteResident = async (req, res) => {
  try {
    const resident = await Resident.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date(), deletedBy: req.user._id },
      { new: true }
    );
    if (!resident) return res.status(404).json({ message: 'Resident not found.' });
    res.json({ success: true, message: 'Resident deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/residents/:id/verify
exports.verifyResident = async (req, res) => {
  try {
    const resident = await Resident.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, verifiedBy: req.user._id, verifiedAt: new Date(), status: 'active' },
      { new: true, runValidators: true }
    );
    if (!resident) return res.status(404).json({ message: 'Resident not found.' });
    res.json({ success: true, data: resident, message: 'Resident verified successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};