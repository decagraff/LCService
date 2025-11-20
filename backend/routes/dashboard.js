const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireAuth, requireAdmin, requireVendedor } = require('../middleware/auth');

// Dashboard genérico (redirige según rol)
router.get('/', requireAuth, dashboardController.dashboard);

module.exports = router;