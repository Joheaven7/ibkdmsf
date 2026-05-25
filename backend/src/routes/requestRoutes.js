const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { logAction } = require('../middleware/audit');

const docUpload = upload.fields([
  { name: 'mainDocument', maxCount: 1 },
  { name: 'parentOrApplicantId', maxCount: 1 },
  { name: 'marriageCertificate', maxCount: 1 },
  { name: 'otherDocument', maxCount: 1 },
]);

router.use(protect);

router.get('/', ctrl.getRequests);
router.get('/:id', ctrl.getRequest);
router.post('/', docUpload, logAction('CREATE', 'Request'), ctrl.createRequest);
router.patch('/:id/status', authorize('clerk', 'admin', 'superadmin'), logAction('UPDATE_STATUS', 'Request'), ctrl.updateStatus);
router.delete('/:id', authorize('admin', 'superadmin'), logAction('DELETE', 'Request'), ctrl.deleteRequest);
// PATCH /api/requests/:id/upload-document
router.patch('/:id/upload-document',
  protect,
  authorize('clerk', 'admin', 'superadmin'),
  upload.fields([{ name: 'mainDocument', maxCount: 1 }]),
  async (req, res) => {
    try {
      const update = {};
      if (req.files?.mainDocument) {
        update['documents.mainDocument'] = req.files.mainDocument[0].filename;
      }
      const request = await require('../models/Request')
        .findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
      if (!request) return res.status(404).json({ message: 'Request not found.' });
      res.json({ success: true, data: request });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);
module.exports = router;