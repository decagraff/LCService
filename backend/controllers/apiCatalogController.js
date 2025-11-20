const { pool } = require('../config/database');

const apiCatalogController = {
  // Get all equipos with filters
  getEquipos: async (req, res) => {
    try {
      const { search, categoria, min_precio, max_precio } = req.query;

      let query = `
        SELECT e.*, c.nombre as categoria_nombre
        FROM equipos e
        LEFT JOIN categorias c ON e.categoria_id = c.id
        WHERE 1=1
      `;
      const params = [];

      if (search) {
        query += ` AND (e.nombre LIKE ? OR e.codigo LIKE ? OR e.descripcion LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (categoria) {
        query += ` AND e.categoria_id = ?`;
        params.push(categoria);
      }

      if (min_precio) {
        query += ` AND e.precio >= ?`;
        params.push(parseFloat(min_precio));
      }

      if (max_precio) {
        query += ` AND e.precio <= ?`;
        params.push(parseFloat(max_precio));
      }

      query += ` ORDER BY e.created_at DESC`;

      const [equipos] = await pool.query(query, params);
      res.json(equipos);
    } catch (error) {
      console.error('Error en getEquipos:', error);
      res.status(500).json({ success: false, error: 'Error al obtener equipos' });
    }
  },

  // Get categorias
  getCategorias: async (req, res) => {
    try {
      const [categorias] = await pool.query(`
        SELECT c.*, COUNT(e.id) as equipment_count
        FROM categorias c
        LEFT JOIN equipos e ON c.id = e.categoria_id
        GROUP BY c.id
        ORDER BY c.nombre
      `);
      res.json(categorias);
    } catch (error) {
      console.error('Error en getCategorias:', error);
      res.status(500).json({ success: false, error: 'Error al obtener categorías' });
    }
  },

  // Get catalog stats
  getStats: async (req, res) => {
    try {
      const [equiposCount] = await pool.query('SELECT COUNT(*) as total FROM equipos');
      const [categoriasCount] = await pool.query('SELECT COUNT(*) as total FROM categorias');
      const [precioRange] = await pool.query('SELECT MIN(precio) as min, MAX(precio) as max FROM equipos');

      res.json({
        success: true,
        data: {
          total_equipos: equiposCount[0].total,
          total_categorias: categoriasCount[0].total,
          precio_min: precioRange[0].min || 0,
          precio_max: precioRange[0].max || 0
        }
      });
    } catch (error) {
      console.error('Error en getStats:', error);
      res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
    }
  },

  // Get equipo by ID
  getEquipoById: async (req, res) => {
    try {
      const { id } = req.params;
      const [equipos] = await pool.query(`
        SELECT e.*, c.nombre as categoria_nombre
        FROM equipos e
        LEFT JOIN categorias c ON e.categoria_id = c.id
        WHERE e.id = ?
      `, [id]);

      if (equipos.length === 0) {
        return res.status(404).json({ success: false, error: 'Equipo no encontrado' });
      }

      res.json({ success: true, data: equipos[0] });
    } catch (error) {
      console.error('Error en getEquipoById:', error);
      res.status(500).json({ success: false, error: 'Error al obtener equipo' });
    }
  }
};

module.exports = apiCatalogController;
