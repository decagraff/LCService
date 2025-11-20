const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const profileController = require('../controllers/profileController');
const userController = require('../controllers/userController');
const inventoryController = require('../controllers/inventoryController');
const catalogController = require('../controllers/catalogController');
const apiCatalogController = require('../controllers/apiCatalogController');
const apiCotizacionController = require('../controllers/apiCotizacionController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { profileValidation, categoryValidation, equipmentValidation } = require('../middleware/validators');
const cotizacionController = require('../controllers/cotizacionController');
const { cotizacionValidation } = require('../middleware/validators');

// Dashboard administrativo
router.get('/dashboard', requireAuth, requireAdmin, dashboardController.adminDashboard);

// Perfil de admin
router.get('/perfil', requireAuth, requireAdmin, profileController.showProfile);
router.post('/perfil', requireAuth, requireAdmin, profileValidation, profileController.updateProfile);

// Gestión de usuarios
router.get('/usuarios', requireAuth, requireAdmin, userController.listUsers);
router.get('/usuarios/:id', requireAuth, requireAdmin, userController.getUser);
router.put('/usuarios/:id', requireAuth, requireAdmin, userController.updateUser);

// INVENTARIO - Dashboard
router.get('/inventario', requireAuth, requireAdmin, inventoryController.showInventoryDashboard);

// INVENTARIO - Categorías
router.get('/inventario/categorias', requireAuth, requireAdmin, inventoryController.listCategories);
router.get('/inventario/categorias/:id', requireAuth, requireAdmin, inventoryController.getCategory);
router.post('/inventario/categorias', requireAuth, requireAdmin, categoryValidation, inventoryController.createCategory);
router.put('/inventario/categorias/:id', requireAuth, requireAdmin, categoryValidation, inventoryController.updateCategory);
router.delete('/inventario/categorias/:id', requireAuth, requireAdmin, inventoryController.deleteCategory);

// INVENTARIO - Equipos
router.get('/inventario/equipos', requireAuth, requireAdmin, inventoryController.listEquipment);
router.get('/inventario/equipos/:id', requireAuth, requireAdmin, inventoryController.getEquipment);
router.post('/inventario/equipos', requireAuth, requireAdmin, inventoryController.uploadImage, equipmentValidation, inventoryController.createEquipment);
router.put('/inventario/equipos/:id', requireAuth, requireAdmin, inventoryController.uploadImage, equipmentValidation, inventoryController.updateEquipment);
router.delete('/inventario/equipos/:id', requireAuth, requireAdmin, inventoryController.deleteEquipment);
router.put('/inventario/equipos/:id/stock', requireAuth, requireAdmin, inventoryController.updateStock);

// CATÁLOGO PARA ADMIN
router.get('/catalogo', requireAuth, requireAdmin, catalogController.showCatalog);
router.get('/catalogo/equipo/:id', requireAuth, requireAdmin, catalogController.showEquipmentDetail);
router.get('/catalogo/categoria/:id', requireAuth, requireAdmin, catalogController.showCategoryEquipment);

// API para estadísticas
router.get('/api/usuarios/stats', requireAuth, requireAdmin, userController.getUserStats);


// Rutas de cotizaciones
router.get('/cotizaciones', requireAuth, requireAdmin, cotizacionController.listCotizaciones);
router.post('/cotizaciones', requireAuth, requireAdmin, cotizacionValidation, cotizacionController.createCotizacion);
router.get('/cotizaciones/:id', requireAuth, requireAdmin, cotizacionController.showCotizacion);
router.put('/cotizaciones/:id/estado', requireAuth, requireAdmin, cotizacionController.updateEstado);

// API del carrito
router.post('/api/carrito/agregar', requireAuth, requireAdmin, cotizacionController.addToCart);
router.get('/api/carrito', requireAuth, requireAdmin, cotizacionController.getCart);
router.put('/api/carrito/:equipoId', requireAuth, requireAdmin, cotizacionController.updateCartItem);
router.delete('/api/carrito', requireAuth, requireAdmin, cotizacionController.clearCart);

// ==========================================
// API ROUTES FOR REACT FRONTEND
// ==========================================

// Catálogo API
router.get('/api/catalogo', requireAuth, requireAdmin, apiCatalogController.getEquipos);
router.get('/api/categorias', requireAuth, requireAdmin, apiCatalogController.getCategorias);
router.get('/api/catalogo/stats', requireAuth, requireAdmin, apiCatalogController.getStats);
router.get('/api/catalogo/:id', requireAuth, requireAdmin, apiCatalogController.getEquipoById);

// Cotizaciones API
router.get('/api/cotizaciones', requireAuth, requireAdmin, apiCotizacionController.getCotizaciones);
router.get('/api/cotizaciones/stats', requireAuth, requireAdmin, apiCotizacionController.getStats);
router.get('/api/cotizaciones/:id', requireAuth, requireAdmin, apiCotizacionController.getCotizacionById);
router.post('/api/cotizaciones/nueva', requireAuth, requireAdmin, apiCotizacionController.createCotizacion);
router.put('/api/cotizaciones/:id/estado', requireAuth, requireAdmin, apiCotizacionController.updateEstado);
router.delete('/api/cotizaciones/:id', requireAuth, requireAdmin, apiCotizacionController.deleteCotizacion);

// Reportes API
const apiReportsController = require('../controllers/apiReportsController');

router.get('/api/reports/kpis', requireAuth, requireAdmin, apiReportsController.getKPIs);
router.get('/api/reports/sales-by-month', requireAuth, requireAdmin, apiReportsController.getSalesByMonth);
router.get('/api/reports/sales-by-seller', requireAuth, requireAdmin, apiReportsController.getSalesBySeller);
router.get('/api/reports/sales-status', requireAuth, requireAdmin, apiReportsController.getSalesStatus);
router.get('/api/reports/thesis-kpis', requireAuth, requireAdmin, apiReportsController.getThesisKPIs);
router.get('/api/reports/sales-by-category', requireAuth, requireAdmin, apiReportsController.getSalesByCategory);
router.get('/api/reports/pre-test-detailed', requireAuth, requireAdmin, apiReportsController.getPreTestDetailed);
router.get('/api/reports/post-test-detailed', requireAuth, requireAdmin, apiReportsController.getPostTestDetailed);

module.exports = router;