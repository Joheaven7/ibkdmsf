const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { logAction } = require('../middleware/audit');

router.use(protect);

router.get('/',                authorize('admin', 'superadmin'), ctrl.getUsers);
router.post('/',               authorize('admin', 'superadmin'), logAction('CREATE', 'User'), ctrl.createUser);
router.patch('/me',            ctrl.updateMe);
router.patch('/:id',           authorize('admin', 'superadmin'), logAction('UPDATE', 'User'), ctrl.updateUser);
router.patch('/:id/status',    authorize('admin', 'superadmin'), logAction('UPDATE_STATUS', 'User'), ctrl.toggleStatus);
router.patch('/:id/role',      authorize('admin', 'superadmin'), logAction('UPDATE_ROLE', 'User'), ctrl.changeRole);
router.patch('/:id/permissions', authorize('superadmin'), logAction('UPDATE_PERMISSIONS', 'User'), ctrl.setPermissions);
router.delete('/:id',          authorize('admin', 'superadmin'), logAction('DELETE', 'User'), ctrl.deleteUser);
router.patch('/:id/reset-password', authorize('admin', 'superadmin'), ctrl.resetPassword);
module.exports = router;