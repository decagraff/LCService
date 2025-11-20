const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const profileController = require('../controllers/profileController');
const catalogController = require('../controllers/catalogController');
const apiCatalogController = require('../controllers/apiCatalogController');
const apiCotizacionController = require('../controllers/apiCotizacionController');
const { requireAuth } = require('../middleware/auth');
const { profileValidation } = require('../middleware/validators');
const cotizacionController = require('../controllers/cotizacionController');
const { cotizacionValidation } = require('../middleware/validators');

// Dashboard de cliente
router.get('/dashboard', requireAuth, dashboardController.clienteDashboard);

// Perfil de cliente
router.get('/perfil', requireAuth, profileController.showProfile);
router.post('/perfil', requireAuth, profileValidation, profileController.updateProfile);

// CATÁLOGO PARA CLIENTES
router.get('/catalogo', requireAuth, catalogController.showCatalog);
router.get('/catalogo/equipo/:id', requireAuth, catalogController.showEquipmentDetail);
router.get('/catalogo/categoria/:id', requireAuth, catalogController.showCategoryEquipment);

// Rutas de cotizaciones
router.get('/cotizaciones', requireAuth, cotizacionController.listCotizaciones);
router.post('/cotizaciones', requireAuth, cotizacionValidation, cotizacionController.createCotizacion);
router.get('/cotizaciones/:id', requireAuth, cotizacionController.showCotizacion);
router.put('/cotizaciones/:id/estado', requireAuth, cotizacionController.updateEstado);

// API del carrito
router.post('/api/carrito/agregar', requireAuth, cotizacionController.addToCart);
router.get('/api/carrito', requireAuth, cotizacionController.getCart);
router.put('/api/carrito/:equipoId', requireAuth, cotizacionController.updateCartItem);
router.delete('/api/carrito', requireAuth, cotizacionController.clearCart);

// ==========================================
// API ROUTES FOR REACT FRONTEND
// ==========================================

// Catálogo API
router.get('/api/catalogo', requireAuth, apiCatalogController.getEquipos);
router.get('/api/categorias', requireAuth, apiCatalogController.getCategorias);
router.get('/api/catalogo/stats', requireAuth, apiCatalogController.getStats);
router.get('/api/catalogo/:id', requireAuth, apiCatalogController.getEquipoById);

// Cotizaciones API
router.get('/api/cotizaciones', requireAuth, apiCotizacionController.getCotizaciones);
router.get('/api/cotizaciones/stats', requireAuth, apiCotizacionController.getStats);
router.get('/api/cotizaciones/:id', requireAuth, apiCotizacionController.getCotizacionById);
router.post('/api/cotizaciones/nueva', requireAuth, apiCotizacionController.createCotizacion);
router.put('/api/cotizaciones/:id/estado', requireAuth, apiCotizacionController.updateEstado); 
router.delete('/api/cotizaciones/:id', requireAuth, apiCotizacionController.deleteCotizacion);

module.exports = router;