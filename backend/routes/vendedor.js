const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const profileController = require('../controllers/profileController');
const catalogController = require('../controllers/catalogController');
const apiCatalogController = require('../controllers/apiCatalogController');
const apiCotizacionController = require('../controllers/apiCotizacionController');
const { requireAuth, requireVendedor } = require('../middleware/auth');
const { profileValidation } = require('../middleware/validators');
const cotizacionController = require('../controllers/cotizacionController');
const { cotizacionValidation } = require('../middleware/validators');

// Dashboard de vendedor
router.get('/dashboard', requireAuth, requireVendedor, dashboardController.vendedorDashboard);

// Perfil de vendedor
router.get('/perfil', requireAuth, requireVendedor, profileController.showProfile);
router.post('/perfil', requireAuth, requireVendedor, profileValidation, profileController.updateProfile);

// CATÁLOGO PARA VENDEDORES (solo lectura)
router.get('/catalogo', requireAuth, requireVendedor, catalogController.showCatalog);
router.get('/catalogo/equipo/:id', requireAuth, requireVendedor, catalogController.showEquipmentDetail);
router.get('/catalogo/categoria/:id', requireAuth, requireVendedor, catalogController.showCategoryEquipment);


// Rutas de cotizaciones
router.get('/cotizaciones', requireAuth, requireVendedor, cotizacionController.listCotizaciones);
router.post('/cotizaciones', requireAuth, requireVendedor, cotizacionValidation, cotizacionController.createCotizacion);
router.get('/cotizaciones/:id', requireAuth, requireVendedor, cotizacionController.showCotizacion);
router.put('/cotizaciones/:id/estado', requireAuth, requireVendedor, cotizacionController.updateEstado);

// API del carrito
router.post('/api/carrito/agregar', requireAuth, requireVendedor, cotizacionController.addToCart);
router.get('/api/carrito', requireAuth, requireVendedor, cotizacionController.getCart);
router.put('/api/carrito/:equipoId', requireAuth, requireVendedor, cotizacionController.updateCartItem);
router.delete('/api/carrito', requireAuth, requireVendedor, cotizacionController.clearCart);

// ==========================================
// API ROUTES FOR REACT FRONTEND
// ==========================================

// Catálogo API
router.get('/api/catalogo', requireAuth, requireVendedor, apiCatalogController.getEquipos);
router.get('/api/categorias', requireAuth, requireVendedor, apiCatalogController.getCategorias);
router.get('/api/catalogo/stats', requireAuth, requireVendedor, apiCatalogController.getStats);
router.get('/api/catalogo/:id', requireAuth, requireVendedor, apiCatalogController.getEquipoById);

// Cotizaciones API
router.get('/api/cotizaciones', requireAuth, requireVendedor, apiCotizacionController.getCotizaciones);
router.get('/api/cotizaciones/stats', requireAuth, requireVendedor, apiCotizacionController.getStats);
router.get('/api/cotizaciones/:id', requireAuth, requireVendedor, apiCotizacionController.getCotizacionById);
router.post('/api/cotizaciones/nueva', requireAuth, requireVendedor, apiCotizacionController.createCotizacion);
router.put('/api/cotizaciones/:id/estado', requireAuth, requireVendedor, apiCotizacionController.updateEstado);
router.delete('/api/cotizaciones/:id', requireAuth, requireVendedor, apiCotizacionController.deleteCotizacion);

module.exports = router;