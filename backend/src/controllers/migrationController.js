const Migration = require('../models/Migration');
const { parsePagination, sendList } = require('../lib/pagination');

exports.getMigrations = async (req, res) => {
  try {
    const { status, kebele, migrationType, search } = req.query;
    const { hasPage, page, limit, skip } = parsePagination(req.query, { defaultLimit: 25, maxLimit: 100 });

    const filter = {};
    if (status) filter.status = status;
    if (kebele) filter.kebele = kebele;
    if (migrationType) filter.migrationType = migrationType;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { idNo: { $regex: search, $options: 'i' } },
        { fromKebele: { $regex: search, $options: 'i' } },
        { toKebele: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Migration.countDocuments(filter);
    let query = Migration.find(filter)
      .populate('residentId', 'fullName kebele')
      .sort({ createdAt: -1 });

    if (hasPage) query = query.skip(skip).limit(limit);

    const data = await query.lean();
    return sendList(res, { data, total, page, limit, hasPage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMigration = async (req, res) => {
  try {
    const record = await Migration.findById(req.params.id).populate('residentId', 'fullName kebele phone');
    if (!record) return res.status(404).json({ message: 'Migration record not found.' });
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createMigration = async (req, res) => {
  try {
    const documents = {};
    if (req.files) {
      Object.keys(req.files).forEach((f) => {
        documents[f] = req.files[f][0].filename;
      });
    }

    const record = await Migration.create({
      ...req.body,
      documents,
      registeredBy: req.user.name,
      registeredById: req.user._id,
      status: 'pending',
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected.' });
    }

    const record = await Migration.findByIdAndUpdate(
      req.params.id,
      { status, note: note || '', reviewedBy: req.user._id, reviewedAt: new Date() },
      { new: true }
    );

    if (!record) return res.status(404).json({ message: 'Migration record not found.' });
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteMigration = async (req, res) => {
  try {
    const record = await Migration.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date(), deletedBy: req.user._id },
      { new: true }
    );
    if (!record) return res.status(404).json({ message: 'Migration record not found.' });
    res.json({ success: true, message: 'Migration record deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
