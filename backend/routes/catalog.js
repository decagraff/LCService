const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');

// === CORRECCIÓN: Actualizar nombres de métodos ===

// Antes: showCatalog -> Ahora: getEquipos
router.get('/', catalogController.getEquipos);

// Antes: showEquipmentDetail -> Ahora: getEquipoById
router.get('/equipo/:id', catalogController.getEquipoById);

// La ruta de categoría específica ya no es necesaria porque se filtra por URL query (?categoria=X)
// router.get('/categoria/:id', ...); 

// API para búsqueda rápida
// Antes: searchEquipment -> Ahora: search
router.get('/api/buscar', catalogController.search);

module.exports = router;