const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/residentController');
const { protect, authorize } = require('../middleware/auth');
const { logAction } = require('../middleware/audit');

router.use(protect);

router.get('/', ctrl.getResidents);
router.get('/:id', ctrl.getResident);
router.post('/',
  authorize('clerk', 'admin', 'superadmin'),
  logAction('CREATE', 'Resident'),
  ctrl.createResident
);
router.patch('/:id', authorize('clerk', 'admin', 'superadmin'), logAction('UPDATE', 'Resident'), ctrl.updateResident);
router.patch('/:id/verify', authorize('clerk', 'admin', 'superadmin'), logAction('VERIFY', 'Resident'), ctrl.verifyResident);
router.delete('/:id', authorize('admin', 'superadmin'), logAction('DELETE', 'Resident'), ctrl.deleteResident);

module.exports = router;