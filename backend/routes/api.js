const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');
const apiAuthController = require('../controllers/apiAuthController');
const apiUserController = require('../controllers/apiUserController');
const apiInventoryController = require('../controllers/apiInventoryController');
const { requireAuth, requireAdmin, requireVendedor } = require('../middleware/auth');
const { loginValidation, registerValidation, categoryValidation, equipmentValidation } = require('../middleware/validators');

// ==========================================
// RUTAS DE AUTENTICACIÓN (API REST)
// ==========================================

router.post('/auth/login', loginValidation, apiAuthController.login);
router.post('/auth/register', registerValidation, apiAuthController.register);
router.post('/auth/logout', apiAuthController.logout);
router.get('/auth/me', apiAuthController.getCurrentUser);

// ==========================================
// RUTAS DE ADMINISTRACIÓN DE USUARIOS
// ==========================================

router.get('/admin/users', requireAuth, requireVendedor, apiUserController.getAllUsers);
router.get('/admin/users/stats', requireAuth, requireAdmin, apiUserController.getUserStats);
router.get('/admin/users/:id', requireAuth, requireAdmin, apiUserController.getUserById);
router.put('/admin/users/:id', requireAuth, requireAdmin, apiUserController.updateUserRole);

// ==========================================
// RUTAS DE INVENTARIO - EQUIPOS
// ==========================================

router.get('/admin/equipment', requireAuth, requireAdmin, apiInventoryController.getAllEquipment);
router.get('/admin/equipment/stats', requireAuth, requireAdmin, apiInventoryController.getInventoryStats);
router.get('/admin/equipment/:id', requireAuth, requireAdmin, apiInventoryController.getEquipmentById);
router.post('/admin/equipment', requireAuth, requireAdmin, equipmentValidation, apiInventoryController.createEquipment);
router.put('/admin/equipment/:id', requireAuth, requireAdmin, equipmentValidation, apiInventoryController.updateEquipment);
router.patch('/admin/equipment/:id/stock', requireAuth, requireAdmin, apiInventoryController.updateStock);
router.delete('/admin/equipment/:id', requireAuth, requireAdmin, apiInventoryController.deleteEquipment);

// ==========================================
// RUTAS DE INVENTARIO - CATEGORÍAS
// ==========================================

router.get('/admin/categories', requireAuth, requireAdmin, apiInventoryController.getAllCategories);
router.get('/admin/categories/:id', requireAuth, requireAdmin, apiInventoryController.getCategoryById);
router.post('/admin/categories', requireAuth, requireAdmin, categoryValidation, apiInventoryController.createCategory);
router.put('/admin/categories/:id', requireAuth, requireAdmin, categoryValidation, apiInventoryController.updateCategory);
router.delete('/admin/categories/:id', requireAuth, requireAdmin, apiInventoryController.deleteCategory);

// ==========================================
// RUTAS DE CATÁLOGO
// ==========================================

// CORRECCIÓN AQUÍ: searchEquipment -> search
router.get('/catalogo/buscar', requireAuth, catalogController.search);

module.exports = router;