const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');
const apiAuthController = require('../controllers/apiAuthController');
const apiUserController = require('../controllers/apiUserController');
const apiInventoryController = require('../controllers/apiInventoryController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { loginValidation, registerValidation, categoryValidation, equipmentValidation } = require('../middleware/validators');

// ==========================================
// RUTAS DE AUTENTICACIÓN (API REST)
// ==========================================

// Login - POST /api/auth/login
router.post('/auth/login', loginValidation, apiAuthController.login);

// Register - POST /api/auth/register
router.post('/auth/register', registerValidation, apiAuthController.register);

// Logout - POST /api/auth/logout
router.post('/auth/logout', apiAuthController.logout);

// Get current user - GET /api/auth/me
router.get('/auth/me', apiAuthController.getCurrentUser);

// ==========================================
// RUTAS DE ADMINISTRACIÓN DE USUARIOS
// ==========================================

// Get all users - GET /api/admin/users
router.get('/admin/users', requireAuth, requireAdmin, apiUserController.getAllUsers);

// Get user stats - GET /api/admin/users/stats
router.get('/admin/users/stats', requireAuth, requireAdmin, apiUserController.getUserStats);

// Get user by ID - GET /api/admin/users/:id
router.get('/admin/users/:id', requireAuth, requireAdmin, apiUserController.getUserById);

// Update user role - PUT /api/admin/users/:id
router.put('/admin/users/:id', requireAuth, requireAdmin, apiUserController.updateUserRole);

// ==========================================
// RUTAS DE INVENTARIO - EQUIPOS
// ==========================================

// Get all equipment - GET /api/admin/equipment
router.get('/admin/equipment', requireAuth, requireAdmin, apiInventoryController.getAllEquipment);

// Get inventory stats - GET /api/admin/equipment/stats
router.get('/admin/equipment/stats', requireAuth, requireAdmin, apiInventoryController.getInventoryStats);

// Get equipment by ID - GET /api/admin/equipment/:id
router.get('/admin/equipment/:id', requireAuth, requireAdmin, apiInventoryController.getEquipmentById);

// Create equipment - POST /api/admin/equipment
router.post('/admin/equipment', requireAuth, requireAdmin, equipmentValidation, apiInventoryController.createEquipment);

// Update equipment - PUT /api/admin/equipment/:id
router.put('/admin/equipment/:id', requireAuth, requireAdmin, equipmentValidation, apiInventoryController.updateEquipment);

// Update stock - PATCH /api/admin/equipment/:id/stock
router.patch('/admin/equipment/:id/stock', requireAuth, requireAdmin, apiInventoryController.updateStock);

// Delete equipment - DELETE /api/admin/equipment/:id
router.delete('/admin/equipment/:id', requireAuth, requireAdmin, apiInventoryController.deleteEquipment);

// ==========================================
// RUTAS DE INVENTARIO - CATEGORÍAS
// ==========================================

// Get all categories - GET /api/admin/categories
router.get('/admin/categories', requireAuth, requireAdmin, apiInventoryController.getAllCategories);

// Get category by ID - GET /api/admin/categories/:id
router.get('/admin/categories/:id', requireAuth, requireAdmin, apiInventoryController.getCategoryById);

// Create category - POST /api/admin/categories
router.post('/admin/categories', requireAuth, requireAdmin, categoryValidation, apiInventoryController.createCategory);

// Update category - PUT /api/admin/categories/:id
router.put('/admin/categories/:id', requireAuth, requireAdmin, categoryValidation, apiInventoryController.updateCategory);

// Delete category - DELETE /api/admin/categories/:id
router.delete('/admin/categories/:id', requireAuth, requireAdmin, apiInventoryController.deleteCategory);

// ==========================================
// RUTAS DE CATÁLOGO
// ==========================================

// API para búsqueda rápida (requiere autenticación)
router.get('/catalogo/buscar', requireAuth, catalogController.searchEquipment);

module.exports = router;