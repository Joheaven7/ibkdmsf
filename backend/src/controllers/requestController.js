const Request = require('../models/Request');
const Resident = require('../models/Resident');
const Notification = require('../models/Notification');
const { parsePagination, sendList } = require('../lib/pagination');
// const Resident     = require('../models/Resident');

// GET /api/requests
exports.getRequests = async (req, res) => {
  try {
    const { status, type, residentId, search } = req.query;
    const { hasPage, page, limit, skip } = parsePagination(req.query, { defaultLimit: 25, maxLimit: 100 });
    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (residentId) filter.residentId = residentId;

    if (req.user.role === 'resident') {
      const resident = await Resident.findOne({ userId: req.user._id });
      if (resident) filter.residentId = resident._id;
      else return res.json({ success: true, data: [], pagination: { total: 0, page: 1, limit, pages: 0 } });
    }

    if (search) {
      filter.$or = [
        { residentName: { $regex: search, $options: 'i' } },
        { purpose: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Request.countDocuments(filter);
    let query = Request.find(filter)
      .populate('residentId', 'fullName kebele')
      .populate('processedById', 'name')
      .sort({ createdAt: -1 });

    if (hasPage) query = query.skip(skip).limit(limit);

    const data = await query;
    return sendList(res, { data, total, page, limit, hasPage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getResidentById = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id).populate('registeredBy', 'name');
    if (!resident) {
      return res.status(404).json({ message: 'Resident not found.' });
    }
    res.json({ success: true, data: resident });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/requests/:id
exports.getRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('residentId', 'fullName phone kebele')
      .populate('processedById', 'name');
    if (!request) return res.status(404).json({ message: 'Request not found.' });
    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/requests  (supports file uploads via multer)
exports.createRequest = async (req, res) => {
  try {
    const {
      residentId, residentName, type, purpose,
      preferredAppointmentDate, childName, dateOfBirth, placeOfBirth, childGender,
      deceasedName, dateOfDeath, placeOfDeath, causeOfDeath, additionalInfo,
      fromLocation, toLocation, migrationDate,
    } = req.body;

    // Build documents object from uploaded files
    const documents = {};
    if (req.files) {
      Object.keys(req.files).forEach(field => {
        documents[field] = req.files[field][0].filename;
      });
    }

    const request = await Request.create({
      residentId, residentName, type, purpose,
      preferredAppointmentDate, childName, dateOfBirth, placeOfBirth, childGender,
      deceasedName, dateOfDeath, placeOfDeath, causeOfDeath, additionalInfo,
      fromLocation, toLocation, migrationDate,
      documents,
      status: 'pending',
    });

    res.status(201).json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/requests/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status, reviewNote } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected.' });
    }

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      {
        status,
        reviewNotes: reviewNote || '',
        processedBy: req.user.name || req.user.username || '',
        processedById: req.user._id,
        processedAt: new Date(),
      },
      { new: true }
    );

    if (!request) return res.status(404).json({ message: 'Request not found.' });

    try {
      const resident = await Resident.findById(request.residentId);
      if (resident?.userId) {
        await Notification.create({
          userId: resident.userId,
          title: status === 'approved' ? 'Request Approved!' : 'Request Update',
          message: status === 'approved'
            ? `Your ${request.type} certificate request has been approved. You can now download it.`
            : `Your ${request.type} certificate request has been reviewed. Note: ${reviewNote || 'No note provided.'}`,
          type: status === 'approved' ? 'certificate_ready' : 'request_update',
          link: '/resident/my-requests',
        });
      }
    } catch (e) {
      console.error('Notification error:', e.message);
    }

    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/requests/:id
exports.deleteRequest = async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date(), deletedBy: req.user._id },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: 'Request not found.' });
    res.json({ success: true, message: 'Request deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};