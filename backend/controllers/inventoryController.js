const Categoria = require('../models/Categoria');
const Equipo = require('../models/Equipo');
const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');

// Configuración de multer para upload de imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'backend/uploads/images/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'equipo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB límite
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif)'));
        }
    }
});

const inventoryController = {
    // ===== GESTIÓN DE INVENTARIO =====

    // Dashboard de inventario
    showInventoryDashboard: async (req, res) => {
        try {
            const stats = await Equipo.getInventoryStats();
            const categorias = await Categoria.findAllWithEquipmentCount();
            const equiposRecientes = await Equipo.findAll();

            res.json({
                success: true,
                stats,
                categorias: categorias.slice(0, 6), // Solo las primeras 6
                equipos: equiposRecientes.slice(0, 10) // Solo los primeros 10
            });
        } catch (error) {
            console.error('Error en dashboard de inventario:', error);
            res.status(500).json({
                success: false,
                message: 'Error cargando el inventario'
            });
        }
    },

    // ===== GESTIÓN DE CATEGORÍAS =====

    // Listar categorías
    listCategories: async (req, res) => {
        try {
            const categorias = await Categoria.findAllWithEquipmentCount();

            res.json({
                success: true,
                categorias
            });
        } catch (error) {
            console.error('Error listando categorías:', error);
            res.status(500).json({
                success: false,
                message: 'Error cargando categorías'
            });
        }
    },

    // Obtener una categoría por ID
    getCategory: async (req, res) => {
        try {
            const categoria = await Categoria.findById(req.params.id);

            if (!categoria) {
                return res.status(404).json({
                    success: false,
                    message: 'La categoría que buscas no existe'
                });
            }

            res.json({
                success: true,
                categoria
            });
        } catch (error) {
            console.error('Error obteniendo categoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error cargando la categoría'
            });
        }
    },

    // Crear categoría
    createCategory: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const nuevaCategoria = await Categoria.create(req.body);

            console.log(`✅ Nueva categoría creada: ${req.body.nombre}`);
            res.status(201).json({
                success: true,
                message: 'Categoría creada correctamente',
                categoria: nuevaCategoria
            });

        } catch (error) {
            console.error('Error creando categoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error creando la categoría'
            });
        }
    },

    // Actualizar categoría
    updateCategory: async (req, res) => {
        try {
            const categoria = await Categoria.findById(req.params.id);
            if (!categoria) {
                return res.status(404).json({
                    success: false,
                    message: 'La categoría que buscas no existe'
                });
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            await categoria.update(req.body);

            console.log(`✅ Categoría actualizada: ${categoria.nombre}`);
            res.json({
                success: true,
                message: 'Categoría actualizada correctamente',
                categoria
            });

        } catch (error) {
            console.error('Error actualizando categoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error actualizando la categoría'
            });
        }
    },

    // Eliminar categoría
    deleteCategory: async (req, res) => {
        try {
            const categoria = await Categoria.findById(req.params.id);
            if (!categoria) {
                return res.status(404).json({ error: 'Categoría no encontrada' });
            }

            const canDelete = await categoria.canDelete();
            if (!canDelete) {
                return res.status(400).json({
                    error: 'No se puede eliminar una categoría que tiene equipos asociados'
                });
            }

            await categoria.delete();

            console.log(`✅ Categoría eliminada: ${categoria.nombre}`);
            res.json({ success: true, message: 'Categoría eliminada correctamente' });

        } catch (error) {
            console.error('Error eliminando categoría:', error);
            res.status(500).json({ error: 'Error eliminando la categoría' });
        }
    },

    // ===== GESTIÓN DE EQUIPOS =====

    // Listar equipos
    listEquipment: async (req, res) => {
        try {
            const filters = {
                categoria_id: req.query.categoria,
                search: req.query.search,
                min_precio: req.query.min_precio,
                max_precio: req.query.max_precio
            };

            const equipos = await Equipo.findAll(filters);
            const categorias = await Categoria.findAll();

            res.json({
                success: true,
                equipos,
                categorias,
                filters
            });
        } catch (error) {
            console.error('Error listando equipos:', error);
            res.status(500).json({
                success: false,
                message: 'Error cargando equipos'
            });
        }
    },

    // Obtener un equipo por ID
    getEquipment: async (req, res) => {
        try {
            const equipo = await Equipo.findById(req.params.id);

            if (!equipo) {
                return res.status(404).json({
                    success: false,
                    message: 'El equipo que buscas no existe'
                });
            }

            const categorias = await Categoria.findAll();

            res.json({
                success: true,
                equipo,
                categorias
            });
        } catch (error) {
            console.error('Error obteniendo equipo:', error);
            res.status(500).json({
                success: false,
                message: 'Error cargando el equipo'
            });
        }
    },

    // Middleware de upload
    uploadImage: upload.single('imagen'),

    // Crear equipo
    createEquipment: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            // Validar imagen URL si se proporciona
            let imagen_url = req.body.imagen_url?.trim();

            if (imagen_url) {
                // Verificar que la URL de imagen sea accesible
                try {
                    const fetch = require('node-fetch');
                    const response = await fetch(imagen_url, { method: 'HEAD', timeout: 5000 });
                    if (!response.ok) {
                        throw new Error('Imagen no accesible');
                    }
                } catch (imageError) {
                    return res.status(400).json({
                        success: false,
                        message: `La imagen no es accesible: ${imageError.message}`
                    });
                }
            }

            // Preparar datos
            const equipoData = {
                categoria_id: parseInt(req.body.categoria_id),
                codigo: req.body.codigo.toUpperCase().trim(),
                nombre: req.body.nombre.trim(),
                descripcion: req.body.descripcion?.trim() || null,
                material: req.body.material?.trim() || null,
                dimensiones: req.body.dimensiones?.trim() || null,
                precio: parseFloat(req.body.precio),
                stock: parseInt(req.body.stock),
                imagen_url: imagen_url || null
            };

            const nuevoEquipo = await Equipo.create(equipoData);

            console.log(`✅ Nuevo equipo creado: ${nuevoEquipo.nombre} (${nuevoEquipo.codigo})`);
            res.status(201).json({
                success: true,
                message: 'Equipo creado correctamente',
                equipo: nuevoEquipo
            });

        } catch (error) {
            console.error('Error creando equipo:', error);
            res.status(500).json({
                success: false,
                message: `Error creando el equipo: ${error.message}`
            });
        }
    },

    // Actualizar equipo
    updateEquipment: async (req, res) => {
        try {
            const equipo = await Equipo.findById(req.params.id);

            if (!equipo) {
                return res.status(404).json({
                    success: false,
                    message: 'El equipo que buscas no existe'
                });
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            // Validar imagen URL si se cambia
            let imagen_url = req.body.imagen_url?.trim();

            if (imagen_url && imagen_url !== equipo.imagen_url) {
                try {
                    const fetch = require('node-fetch');
                    const response = await fetch(imagen_url, { method: 'HEAD', timeout: 5000 });
                    if (!response.ok) {
                        throw new Error('Imagen no accesible');
                    }
                } catch (imageError) {
                    return res.status(400).json({
                        success: false,
                        message: `La imagen no es accesible: ${imageError.message}`
                    });
                }
            }

            // Preparar datos actualizados
            const equipoData = {
                categoria_id: parseInt(req.body.categoria_id),
                codigo: req.body.codigo.toUpperCase().trim(),
                nombre: req.body.nombre.trim(),
                descripcion: req.body.descripcion?.trim() || null,
                material: req.body.material?.trim() || null,
                dimensiones: req.body.dimensiones?.trim() || null,
                precio: parseFloat(req.body.precio),
                stock: parseInt(req.body.stock),
                imagen_url: imagen_url || equipo.imagen_url // Mantener imagen actual si no se proporciona nueva
            };

            await equipo.update(equipoData);

            console.log(`✅ Equipo actualizado: ${equipo.nombre} (${equipo.codigo})`);
            res.json({
                success: true,
                message: 'Equipo actualizado correctamente',
                equipo
            });

        } catch (error) {
            console.error('Error actualizando equipo:', error);
            res.status(500).json({
                success: false,
                message: `Error actualizando el equipo: ${error.message}`
            });
        }
    },

    // Eliminar equipo
    deleteEquipment: async (req, res) => {
        try {
            const equipo = await Equipo.findById(req.params.id);
            if (!equipo) {
                return res.status(404).json({ error: 'Equipo no encontrado' });
            }

            await equipo.delete();

            console.log(`✅ Equipo eliminado: ${equipo.nombre}`);
            res.json({ success: true, message: 'Equipo eliminado correctamente' });

        } catch (error) {
            console.error('Error eliminando equipo:', error);
            res.status(500).json({ error: 'Error eliminando el equipo' });
        }
    },

    // Actualizar stock rápido
    updateStock: async (req, res) => {
        try {
            const { stock } = req.body;
            const equipo = await Equipo.findById(req.params.id);

            if (!equipo) {
                return res.status(404).json({ error: 'Equipo no encontrado' });
            }

            if (stock < 0) {
                return res.status(400).json({ error: 'El stock no puede ser negativo' });
            }

            await equipo.updateStock(stock);

            console.log(`✅ Stock actualizado para ${equipo.nombre}: ${stock} unidades`);
            res.json({
                success: true,
                message: 'Stock actualizado correctamente',
                newStock: stock
            });

        } catch (error) {
            console.error('Error actualizando stock:', error);
            res.status(500).json({ error: 'Error actualizando el stock' });
        }
    }

};


module.exports = inventoryController;
