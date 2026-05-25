const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getStats, getDashboardStats } = require('../controllers/statsController');

router.use(protect);

// All authenticated users can view stats
router.get('/', getStats);

// Dashboard-specific lightweight stats
router.get('/dashboard', getDashboardStats);

module.exports = router;