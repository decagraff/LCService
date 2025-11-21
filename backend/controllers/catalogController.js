const Equipo = require('../models/Equipo');
const Categoria = require('../models/Categoria');

const catalogController = {
    // Obtener catálogo con filtros y paginación
    getEquipos: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;
            const offset = (page - 1) * limit;

            // Capturar filtros de la URL
            const filters = {
                search: req.query.search,
                categoria_id: req.query.categoria, // El frontend envía 'categoria'
                min_precio: req.query.min_precio,
                max_precio: req.query.max_precio
            };

            // Obtener todos los equipos filtrados
            const allEquipos = await Equipo.findAll(filters);

            // Calcular paginación manual
            const total = allEquipos.length;
            const totalPages = Math.ceil(total / limit);
            const paginatedEquipos = allEquipos.slice(offset, offset + limit);

            res.json({
                success: true,
                data: paginatedEquipos,
                pagination: {
                    total,
                    page,
                    totalPages,
                    limit
                }
            });
        } catch (error) {
            console.error('Error en getEquipos:', error);
            res.status(500).json({ success: false, message: 'Error al obtener el catálogo' });
        }
    },

    // Obtener estadísticas (Precios MIN/MAX reales)
    getStats: async (req, res) => {
        try {
            const stats = await Equipo.getInventoryStats();
            res.json({
                success: true,
                data: {
                    total_equipos: stats.total_equipos,
                    precio_min: stats.precio_minimo || 0,
                    precio_max: stats.precio_maximo || 10000,
                    total_categorias: stats.total_categorias
                }
            });
        } catch (error) {
            console.error('Error en getStats:', error);
            res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
        }
    },

    // Detalle de equipo
    getEquipoById: async (req, res) => {
        try {
            const equipo = await Equipo.findById(req.params.id);
            if (!equipo) {
                return res.status(404).json({ success: false, message: 'Equipo no encontrado' });
            }
            res.json({ success: true, data: equipo });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error al obtener el equipo' });
        }
    },

    // Búsqueda rápida (Para el autocompletado de nueva cotización)
    search: async (req, res) => {
        try {
            const { q } = req.query;
            if (!q) return res.json({ success: true, data: [] });

            const equipos = await Equipo.findAll({ search: q });
            res.json(equipos.slice(0, 8)); // Retornar top 8
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error en búsqueda' });
        }
    }
};

module.exports = catalogController;