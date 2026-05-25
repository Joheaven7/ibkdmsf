const VitalEvent = require('../models/VitalEvent');
const { parsePagination, sendList } = require('../lib/pagination');

// GET /api/vital-events
exports.getVitalEvents = async (req, res) => {
  try {
    const { type, kebele, search } = req.query;
    const { hasPage, page, limit, skip } = parsePagination(req.query, { defaultLimit: 25, maxLimit: 100 });
    const filter = {};
    if (type) filter.type = type;
    if (kebele) filter.kebele = kebele;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { fatherName: { $regex: search, $options: 'i' } },
        { motherName: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await VitalEvent.countDocuments(filter);
    let query = VitalEvent.find(filter).sort({ createdAt: -1 });
    if (hasPage) query = query.skip(skip).limit(limit);

    const data = await query;
    return sendList(res, { data, total, page, limit, hasPage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/vital-events
exports.createVitalEvent = async (req, res) => {
  try {
    const { type, name, fatherName, motherName, dob, dod, place } = req.body;

    // ── Duplicate Detection ──
    if (type === 'birth') {
      const existing = await VitalEvent.findOne({
        type: 'birth',
        name: { $regex: `^${name.trim()}$`, $options: 'i' },
        fatherName: { $regex: `^${(fatherName || '').trim()}$`, $options: 'i' },
        motherName: { $regex: `^${(motherName || '').trim()}$`, $options: 'i' },
        dob: dob,
        isDeleted: false,
      });
      if (existing) {
        return res.status(400).json({
          message: `A birth record for "${name}" with the same parents and date of birth already exists.`,
        });
      }
    }

    if (type === 'death') {
      const existing = await VitalEvent.findOne({
        type: 'death',
        name: { $regex: `^${name.trim()}$`, $options: 'i' },
        dod: dod,
        place: { $regex: `^${(place || '').trim()}$`, $options: 'i' },
        isDeleted: false,
      });
      if (existing) {
        return res.status(400).json({
          message: `A death record for "${name}" on the same date and place already exists.`,
        });
      }
    }

    const event = await VitalEvent.create({
      ...req.body,
      recordedBy: req.user.name,
      recordedById: req.user._id,
    });
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/vital-events/:id
exports.deleteVitalEvent = async (req, res) => {
  try {
    const event = await VitalEvent.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date(), deletedBy: req.user._id },
      { new: true }
    );
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json({ success: true, message: 'Vital event deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};