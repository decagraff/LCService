const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginValidation, registerValidation } = require('../middleware/validators');
const { requireGuest, requireAuth } = require('../middleware/auth');

// Rutas públicas (solo para usuarios no autenticados)
router.post('/login', requireGuest, loginValidation, authController.processLogin);
router.post('/register', requireGuest, registerValidation, authController.processRegister);

// Ruta para obtener usuario actual (API)
router.get('/me', authController.getCurrentUser);

// Rutas protegidas (solo para usuarios autenticados)
router.post('/logout', requireAuth, authController.logout);
router.post('/change-password', requireAuth, authController.changePassword);

module.exports = router;