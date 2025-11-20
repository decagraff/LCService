const { pool } = require('../config/database');
const Cotizacion = require('../models/Cotizacion'); // IMPORTANTE: Importar el modelo

const apiCotizacionController = {
  // Get all cotizaciones with filters and pagination
  getCotizaciones: async (req, res) => {
    try {
      const { search, estado, page = 1, limit = 10 } = req.query;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Validar y parsear parámetros de paginación
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Máximo 100 por página
      const offset = (pageNum - 1) * limitNum;

      let baseQuery = `
        FROM cotizaciones c
        LEFT JOIN users u ON c.cliente_id = u.id
        LEFT JOIN users v ON c.vendedor_id = v.id
        WHERE 1=1
      `;
      const params = [];

      // Filter by role
      if (userRole === 'cliente') {
        baseQuery += ` AND c.cliente_id = ?`;
        params.push(userId);
      } else if (userRole === 'vendedor') {
        baseQuery += ` AND c.vendedor_id = ?`;
        params.push(userId);
      }
      // admin can see all

      if (search) {
        baseQuery += ` AND c.numero_cotizacion LIKE ?`;
        params.push(`%${search}%`);
      }

      if (estado) {
        baseQuery += ` AND c.estado = ?`;
        params.push(estado);
      }

      // Obtener total de registros
      const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
      const [countResult] = await pool.query(countQuery, params);
      const total = countResult[0].total;

      // Obtener registros paginados
      const dataQuery = `
        SELECT c.*,
               u.nombre as cliente_nombre,
               u.empresa as empresa_cliente,
               v.nombre as vendedor_nombre
        ${baseQuery}
        ORDER BY c.created_at DESC
        LIMIT ? OFFSET ?
      `;
      const [cotizaciones] = await pool.query(dataQuery, [...params, limitNum, offset]);

      res.json({
        success: true,
        data: cotizaciones,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: total,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error('Error en getCotizaciones:', error);
      res.status(500).json({ success: false, error: 'Error al obtener cotizaciones' });
    }
  },

  // Get cotizaciones stats
  getStats: async (req, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      let query = `
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN estado = 'borrador' THEN 1 ELSE 0 END) as borrador,
          SUM(CASE WHEN estado = 'enviada' THEN 1 ELSE 0 END) as enviada,
          SUM(CASE WHEN estado = 'aprobada' THEN 1 ELSE 0 END) as aprobada,
          SUM(CASE WHEN estado = 'rechazada' THEN 1 ELSE 0 END) as rechazada,
          SUM(CASE WHEN estado = 'vencida' THEN 1 ELSE 0 END) as vencida
        FROM cotizaciones
      `;
      const params = [];

      if (userRole === 'cliente') {
        query += ` WHERE cliente_id = ?`;
        params.push(userId);
      } else if (userRole === 'vendedor') {
        query += ` WHERE vendedor_id = ?`;
        params.push(userId);
      }

      const [stats] = await pool.query(query, params);

      res.json({
        success: true,
        data: {
          total: stats[0].total || 0,
          borrador: stats[0].borrador || 0,
          enviada: stats[0].enviada || 0,
          aprobada: stats[0].aprobada || 0,
          rechazada: stats[0].rechazada || 0,
          vencida: stats[0].vencida || 0
        }
      });
    } catch (error) {
      console.error('Error en getStats:', error);
      res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
    }
  },

  // Get cotizacion by ID
  getCotizacionById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      let query = `
        SELECT c.*,
               u.nombre as cliente_nombre,
               u.empresa as empresa_cliente,
               v.nombre as vendedor_nombre
        FROM cotizaciones c
        LEFT JOIN users u ON c.cliente_id = u.id
        LEFT JOIN users v ON c.vendedor_id = v.id
        WHERE c.id = ?
      `;
      const params = [id];

      // Add role-based filter
      if (userRole === 'cliente') {
        query += ` AND c.cliente_id = ?`;
        params.push(userId);
      } else if (userRole === 'vendedor') {
        query += ` AND c.vendedor_id = ?`;
        params.push(userId);
      }

      const [cotizaciones] = await pool.query(query, params);

      if (cotizaciones.length === 0) {
        return res.status(404).json({ success: false, error: 'Cotización no encontrada' });
      }

      // Get items
      const [items] = await pool.query(`
        SELECT ci.*, e.nombre as equipo_nombre, e.codigo as equipo_codigo
        FROM cotizacion_detalles ci
        LEFT JOIN equipos e ON ci.equipo_id = e.id
        WHERE ci.cotizacion_id = ?
      `, [id]);

      const cotizacion = cotizaciones[0];
      cotizacion.items = items;

      res.json({ success: true, data: cotizacion });
    } catch (error) {
      console.error('Error en getCotizacionById:', error);
      res.status(500).json({ success: false, error: 'Error al obtener cotización' });
    }
  },

  // Create cotizacion from cart
  createCotizacion: async (req, res) => {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const { notas, cliente_id, vendedor_id } = req.body;
      const currentUserId = req.user.id;
      const currentUserRole = req.user.role;

      const targetClienteId = (currentUserRole === 'cliente') ? currentUserId : cliente_id;

      if (!targetClienteId) {
        throw new Error('No se ha especificado un cliente válido');
      }

      // Asignar vendedor usando el Modelo
      const assignedVendedorId = await Cotizacion.assignVendedor(currentUserRole, currentUserId, vendedor_id);

      const carrito = req.session.carrito || [];

      if (carrito.length === 0) {
        return res.status(400).json({ success: false, error: 'El carrito está vacío' });
      }

      const subtotal = carrito.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
      const igv = subtotal * 0.18;
      const total = subtotal + igv;

      const numeroCotizacion = await Cotizacion.generateQuoteNumber();

      const [result] = await connection.query(`
        INSERT INTO cotizaciones (numero_cotizacion, cliente_id, vendedor_id, estado, subtotal, igv, total, notas, created_at)
        VALUES (?, ?, ?, 'borrador', ?, ?, ?, ?, NOW())
      `, [numeroCotizacion, targetClienteId, assignedVendedorId, subtotal, igv, total, notas || null]);

      const cotizacionId = result.insertId;

      for (const item of carrito) {
        await connection.query(`
          INSERT INTO cotizacion_detalles (cotizacion_id, equipo_id, cantidad, precio_unitario, subtotal)
          VALUES (?, ?, ?, ?, ?)
        `, [cotizacionId, item.equipo_id, item.cantidad, item.precio_unitario, item.cantidad * item.precio_unitario]);
      }

      req.session.carrito = [];

      await connection.commit();

      res.json({
        success: true,
        data: {
          id: cotizacionId,
          numero_cotizacion: numeroCotizacion
        }
      });
    } catch (error) {
      await connection.rollback();
      console.error('Error en createCotizacion:', error);
      res.status(500).json({ success: false, error: error.message || 'Error al crear cotización' });
    } finally {
      connection.release();
    }
  },

  // Actualizar estado (ESTA ES LA QUE FALTABA)
  updateEstado: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Usamos el modelo para buscar y actualizar, ya que encapsula validaciones
      const cotizacion = await Cotizacion.findById(id);

      if (!cotizacion) {
        return res.status(404).json({ success: false, error: 'Cotización no encontrada' });
      }

      // Delegamos la lógica de negocio al modelo
      await cotizacion.updateEstado(estado, userId, userRole);

      res.json({
        success: true,
        message: 'Estado actualizado correctamente',
        data: { estado }
      });

    } catch (error) {
      console.error('Error en updateEstado:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Delete cotizacion (only drafts)
  deleteCotizacion: async (req, res) => {
    const connection = await pool.getConnection();

    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      let query = `SELECT * FROM cotizaciones WHERE id = ? AND estado = 'borrador'`;
      const params = [id];

      if (userRole === 'cliente') {
        query += ` AND cliente_id = ?`;
        params.push(userId);
      }

      const [cotizaciones] = await connection.query(query, params);

      if (cotizaciones.length === 0) {
        return res.status(404).json({ success: false, error: 'Cotización no encontrada o no se puede eliminar' });
      }

      await connection.beginTransaction();
      //
      await connection.query('DELETE FROM cotizacion_detalles WHERE cotizacion_id = ?', [id]);
      await connection.query('DELETE FROM cotizaciones WHERE id = ?', [id]);
      await connection.commit();

      res.json({ success: true });
    } catch (error) {
      await connection.rollback();
      console.error('Error en deleteCotizacion:', error);
      res.status(500).json({ success: false, error: 'Error al eliminar cotización' });
    } finally {
      connection.release();
    }
  }
};

module.exports = apiCotizacionController;
