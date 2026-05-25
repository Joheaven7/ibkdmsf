const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/marriageController');
const { protect, authorize } = require('../middleware/auth');
const { logAction } = require('../middleware/audit');
const upload = require('../middleware/upload');

const docUpload = upload.fields([
  { name: 'mainDocument', maxCount: 1 },
  { name: 'idDocument', maxCount: 1 },
  { name: 'otherDocument', maxCount: 1 },
]);

router.use(protect);

router.get('/', ctrl.getMarriages);
router.post('/', authorize('clerk', 'admin', 'superadmin'), docUpload, logAction('CREATE', 'Marriage'), ctrl.createMarriage);
router.patch('/:id/status', authorize('admin', 'superadmin'), logAction('UPDATE_STATUS', 'Marriage'), ctrl.updateStatus);
router.delete('/:id', authorize('admin', 'superadmin'), logAction('DELETE', 'Marriage'), ctrl.deleteMarriage);

module.exports = router;