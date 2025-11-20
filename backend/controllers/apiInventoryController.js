const Categoria = require('../models/Categoria');
const Equipo = require('../models/Equipo');
const { validationResult } = require('express-validator');

const apiInventoryController = {
  // ===== GESTIÓN DE EQUIPOS =====

  // Get all equipment with optional filters
  getAllEquipment: async (req, res) => {
    try {
      const filters = {
        categoria_id: req.query.categoria,
        search: req.query.search,
        min_precio: req.query.min_precio,
        max_precio: req.query.max_precio
      };

      const equipos = await Equipo.findAll(filters);

      return res.json({
        success: true,
        data: equipos
      });
    } catch (error) {
      console.error('Error fetching equipment:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener equipos'
      });
    }
  },

  // Get equipment by ID
  getEquipmentById: async (req, res) => {
    try {
      const { id } = req.params;
      const equipo = await Equipo.findById(id);

      if (!equipo) {
        return res.status(404).json({
          success: false,
          error: 'Equipo no encontrado'
        });
      }

      return res.json({
        success: true,
        data: equipo
      });
    } catch (error) {
      console.error('Error fetching equipment:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener equipo'
      });
    }
  },

  // Create equipment
  createEquipment: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          details: errors.array()
        });
      }

      // Validate image URL if provided
      let imagen_url = req.body.imagen_url?.trim();

      if (imagen_url) {
        try {
          const fetch = require('node-fetch');
          const response = await fetch(imagen_url, { method: 'HEAD', timeout: 5000 });
          if (!response.ok) {
            throw new Error('Imagen no accesible');
          }
        } catch (imageError) {
          return res.status(400).json({
            success: false,
            error: `La imagen no es accesible: ${imageError.message}`
          });
        }
      }

      // Prepare data
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

      console.log(`✅ New equipment created: ${nuevoEquipo.nombre} (${nuevoEquipo.codigo})`);

      return res.status(201).json({
        success: true,
        data: nuevoEquipo,
        message: 'Equipo creado correctamente'
      });
    } catch (error) {
      console.error('Error creating equipment:', error);
      return res.status(500).json({
        success: false,
        error: `Error creando el equipo: ${error.message}`
      });
    }
  },

  // Update equipment
  updateEquipment: async (req, res) => {
    try {
      const { id } = req.params;
      const equipo = await Equipo.findById(id);

      if (!equipo) {
        return res.status(404).json({
          success: false,
          error: 'Equipo no encontrado'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          details: errors.array()
        });
      }

      // Validate image URL if changed
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
            error: `La imagen no es accesible: ${imageError.message}`
          });
        }
      }

      // Prepare updated data
      const equipoData = {
        categoria_id: parseInt(req.body.categoria_id),
        codigo: req.body.codigo.toUpperCase().trim(),
        nombre: req.body.nombre.trim(),
        descripcion: req.body.descripcion?.trim() || null,
        material: req.body.material?.trim() || null,
        dimensiones: req.body.dimensiones?.trim() || null,
        precio: parseFloat(req.body.precio),
        stock: parseInt(req.body.stock),
        imagen_url: imagen_url || equipo.imagen_url
      };

      await equipo.update(equipoData);

      console.log(`✅ Equipment updated: ${equipo.nombre} (${equipo.codigo})`);

      return res.json({
        success: true,
        data: equipo,
        message: 'Equipo actualizado correctamente'
      });
    } catch (error) {
      console.error('Error updating equipment:', error);
      return res.status(500).json({
        success: false,
        error: `Error actualizando el equipo: ${error.message}`
      });
    }
  },

  // Delete equipment
  deleteEquipment: async (req, res) => {
    try {
      const { id } = req.params;
      const equipo = await Equipo.findById(id);

      if (!equipo) {
        return res.status(404).json({
          success: false,
          error: 'Equipo no encontrado'
        });
      }

      await equipo.delete();

      console.log(`✅ Equipment deleted: ${equipo.nombre}`);

      return res.json({
        success: true,
        message: 'Equipo eliminado correctamente'
      });
    } catch (error) {
      console.error('Error deleting equipment:', error);
      return res.status(500).json({
        success: false,
        error: 'Error eliminando el equipo'
      });
    }
  },

  // Update stock quickly
  updateStock: async (req, res) => {
    try {
      const { id } = req.params;
      const { stock } = req.body;
      const equipo = await Equipo.findById(id);

      if (!equipo) {
        return res.status(404).json({
          success: false,
          error: 'Equipo no encontrado'
        });
      }

      if (stock < 0) {
        return res.status(400).json({
          success: false,
          error: 'El stock no puede ser negativo'
        });
      }

      await equipo.updateStock(stock);

      console.log(`✅ Stock updated for ${equipo.nombre}: ${stock} units`);

      return res.json({
        success: true,
        message: 'Stock actualizado correctamente',
        data: { newStock: stock }
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      return res.status(500).json({
        success: false,
        error: 'Error actualizando el stock'
      });
    }
  },

  // Get inventory statistics
  getInventoryStats: async (req, res) => {
    try {
      const stats = await Equipo.getInventoryStats();

      return res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting inventory stats:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener estadísticas'
      });
    }
  },

  // ===== GESTIÓN DE CATEGORÍAS =====

  // Get all categories
  getAllCategories: async (req, res) => {
    try {
      const categorias = await Categoria.findAllWithEquipmentCount();

      return res.json({
        success: true,
        data: categorias
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener categorías'
      });
    }
  },

  // Get category by ID
  getCategoryById: async (req, res) => {
    try {
      const { id } = req.params;
      const categoria = await Categoria.findById(id);

      if (!categoria) {
        return res.status(404).json({
          success: false,
          error: 'Categoría no encontrada'
        });
      }

      return res.json({
        success: true,
        data: categoria
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener categoría'
      });
    }
  },

  // Create category
  createCategory: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          details: errors.array()
        });
      }

      const nuevaCategoria = await Categoria.create(req.body);

      console.log(`✅ New category created: ${req.body.nombre}`);

      return res.status(201).json({
        success: true,
        data: nuevaCategoria,
        message: 'Categoría creada correctamente'
      });
    } catch (error) {
      console.error('Error creating category:', error);
      return res.status(500).json({
        success: false,
        error: 'Error creando la categoría'
      });
    }
  },

  // Update category
  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const categoria = await Categoria.findById(id);

      if (!categoria) {
        return res.status(404).json({
          success: false,
          error: 'Categoría no encontrada'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          details: errors.array()
        });
      }

      await categoria.update(req.body);

      console.log(`✅ Category updated: ${categoria.nombre}`);

      return res.json({
        success: true,
        data: categoria,
        message: 'Categoría actualizada correctamente'
      });
    } catch (error) {
      console.error('Error updating category:', error);
      return res.status(500).json({
        success: false,
        error: 'Error actualizando la categoría'
      });
    }
  },

  // Delete category
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const categoria = await Categoria.findById(id);

      if (!categoria) {
        return res.status(404).json({
          success: false,
          error: 'Categoría no encontrada'
        });
      }

      const canDelete = await categoria.canDelete();
      if (!canDelete) {
        return res.status(400).json({
          success: false,
          error: 'No se puede eliminar una categoría que tiene equipos asociados'
        });
      }

      await categoria.delete();

      console.log(`✅ Category deleted: ${categoria.nombre}`);

      return res.json({
        success: true,
        message: 'Categoría eliminada correctamente'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      return res.status(500).json({
        success: false,
        error: 'Error eliminando la categoría'
      });
    }
  }
};

module.exports = apiInventoryController;
