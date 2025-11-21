const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { requireAuth } = require('../middleware/auth');

// Ruta protegida: Solo usuarios logueados pueden gastar tus tokens
router.post('/', requireAuth, chatController.sendMessage);

module.exports = router;