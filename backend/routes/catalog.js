const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');

// Rutas públicas del catálogo
router.get('/', catalogController.showCatalog);
router.get('/equipo/:id', catalogController.showEquipmentDetail);
router.get('/categoria/:id', catalogController.showCategoryEquipment);

// API para búsqueda rápida
router.get('/api/buscar', catalogController.searchEquipment);

module.exports = router;