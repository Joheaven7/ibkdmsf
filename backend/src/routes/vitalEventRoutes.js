const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/vitalEventController');
const { protect, authorize } = require('../middleware/auth');
const { logAction } = require('../middleware/audit');

router.use(protect);

router.get('/',    ctrl.getVitalEvents);
router.post('/',   authorize('clerk', 'admin', 'superadmin'), logAction('CREATE', 'VitalEvent'), ctrl.createVitalEvent);
router.delete('/:id', authorize('admin', 'superadmin'), logAction('DELETE', 'VitalEvent'), ctrl.deleteVitalEvent);

module.exports = router;