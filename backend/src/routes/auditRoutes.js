const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.get('/summary', ctrl.getAuditSummary);
router.get('/', ctrl.getAuditLogs);

module.exports = router;
