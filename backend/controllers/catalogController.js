const Categoria = require('../models/Categoria');
const Equipo = require('../models/Equipo');

const catalogController = {
    // Obtener catálogo con filtros
    showCatalog: async (req, res) => {
        try {
            const filters = {
                categoria_id: req.query.categoria,
                search: req.query.search,
                min_precio: req.query.min_precio,
                max_precio: req.query.max_precio
            };

            const equipos = await Equipo.findAll(filters);
            const categorias = await Categoria.findAll();

            // Estadísticas básicas
            const stats = {
                total_equipos: equipos.length,
                total_categorias: categorias.length,
                precio_min: equipos.length > 0 ? Math.min(...equipos.map(e => e.precio)) : 0,
                precio_max: equipos.length > 0 ? Math.max(...equipos.map(e => e.precio)) : 0
            };

            res.json({
                success: true,
                equipos,
                categorias,
                filters,
                stats,
                userRole: req.user.role
            });
        } catch (error) {
            console.error('Error mostrando catálogo:', error);
            res.status(500).json({
                success: false,
                message: 'Error cargando el catálogo'
            });
        }
    },

    // Ver detalles de un equipo
    showEquipmentDetail: async (req, res) => {
        try {
            const equipo = await Equipo.findById(req.params.id);

            if (!equipo) {
                return res.status(404).json({
                    success: false,
                    message: 'El equipo que buscas no existe'
                });
            }

            // Equipos relacionados de la misma categoría
            const equiposRelacionados = await Equipo.findByCategory(equipo.categoria_id);
            const relacionados = equiposRelacionados
                .filter(e => e.id !== equipo.id)
                .slice(0, 4);

            res.json({
                success: true,
                equipo,
                relacionados,
                userRole: req.user.role
            });
        } catch (error) {
            console.error('Error mostrando detalle de equipo:', error);
            res.status(500).json({
                success: false,
                message: 'Error cargando el equipo'
            });
        }
    },

    // Catálogo por categoría
    showCategoryEquipment: async (req, res) => {
        try {
            const categoria = await Categoria.findById(req.params.id);

            if (!categoria) {
                return res.status(404).json({
                    success: false,
                    message: 'La categoría que buscas no existe'
                });
            }

            const equipos = await Equipo.findByCategory(categoria.id);
            const todasCategorias = await Categoria.findAll();

            res.json({
                success: true,
                categoria,
                equipos,
                categorias: todasCategorias,
                userRole: req.user.role
            });
        } catch (error) {
            console.error('Error mostrando categoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error cargando la categoría'
            });
        }
    },

    // API para búsqueda rápida
    searchEquipment: async (req, res) => {
        try {
            const { q } = req.query;

            if (!q || q.length < 2) {
                return res.json([]);
            }

            const equipos = await Equipo.findAll({ search: q });

            const results = equipos.slice(0, 8).map(equipo => ({
                id: equipo.id,
                nombre: equipo.nombre,
                codigo: equipo.codigo,
                precio: equipo.precio,
                categoria: equipo.categoria_nombre,
                imagen: equipo.imagen_url,
                stock: equipo.stock
            }));

            res.json(results);
        } catch (error) {
            console.error('Error en búsqueda:', error);
            res.status(500).json({ error: 'Error en la búsqueda' });
        }
    }
};

module.exports = catalogController;
