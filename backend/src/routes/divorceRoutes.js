const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/divorceController');
const { protect, authorize } = require('../middleware/auth');
const { logAction } = require('../middleware/audit');
const upload = require('../middleware/upload');

const docUpload = upload.fields([
  { name: 'mainDocument', maxCount: 1 },
  { name: 'idDocument', maxCount: 1 },
  { name: 'otherDocument', maxCount: 1 },
]);

router.use(protect);

router.get('/', ctrl.getDivorces);
router.post('/', authorize('clerk', 'admin', 'superadmin'), docUpload, logAction('CREATE', 'Divorce'), ctrl.createDivorce);
router.patch('/:id/status', authorize('admin', 'superadmin'), logAction('UPDATE_STATUS', 'Divorce'), ctrl.updateStatus);
router.delete('/:id', authorize('admin', 'superadmin'), logAction('DELETE', 'Divorce'), ctrl.deleteDivorce);

module.exports = router;