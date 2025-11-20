const { pool } = require('../config/database');

class Cotizacion {
    constructor(data) {
        this.id = data.id;
        this.numero_cotizacion = data.numero_cotizacion;
        this.cliente_id = data.cliente_id;
        this.vendedor_id = data.vendedor_id;
        this.empresa_cliente = data.empresa_cliente;
        this.contacto_cliente = data.contacto_cliente;
        this.subtotal = parseFloat(data.subtotal);
        this.igv = parseFloat(data.igv);
        this.total = parseFloat(data.total);
        this.estado = data.estado;
        this.fecha_vencimiento = data.fecha_vencimiento;
        this.notas = data.notas;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        
        // Datos relacionados si están disponibles
        this.cliente_nombre = data.cliente_nombre;
        this.cliente_email = data.cliente_email;
        this.vendedor_nombre = data.vendedor_nombre;
        this.vendedor_email = data.vendedor_email;
    }

    // Generar número de cotización único
    static async generateQuoteNumber() {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        
        const [rows] = await pool.execute(
            'SELECT COUNT(*) as count FROM cotizaciones WHERE YEAR(created_at) = ?',
            [year]
        );
        
        const sequence = (rows[0].count + 1).toString().padStart(4, '0');
        return `COT-${year}${month}-${sequence}`;
    }

    // Asignar vendedor según rol del usuario que crea la cotización
    static async assignVendedor(userRole, userId = null, selectedVendedorId = null) {
        if (userRole === 'vendedor') {
            return userId; // El vendedor se asigna a sí mismo
        }
        
        if (userRole === 'admin' && selectedVendedorId) {
            return selectedVendedorId; // Admin selecciona vendedor específico
        }
        
        // Cliente o admin sin selección específica: vendedor aleatorio
        const [vendedores] = await pool.execute(
            'SELECT id FROM users WHERE role = "vendedor" AND estado = "activo" ORDER BY RAND() LIMIT 1'
        );
        
        return vendedores.length > 0 ? vendedores[0].id : null;
    }

    // Crear nueva cotización
    static async create(cotizacionData, detalles, userRole, userId) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            const numero_cotizacion = await this.generateQuoteNumber();
            const vendedor_id = await this.assignVendedor(userRole, userId, cotizacionData.vendedor_id);
            
            if (!vendedor_id) {
                throw new Error('No hay vendedores disponibles para asignar la cotización');
            }

            // Calcular totales
            let subtotal = 0;
            for (const detalle of detalles) {
                subtotal += detalle.cantidad * detalle.precio_unitario;
            }
            
            const igv = subtotal * 0.18; // 18% IGV
            const total = subtotal + igv;

            // Crear fecha de vencimiento (30 días por defecto)
            const fecha_vencimiento = new Date();
            fecha_vencimiento.setDate(fecha_vencimiento.getDate() + 30);

            // Insertar cotización
            const [result] = await connection.execute(
                `INSERT INTO cotizaciones 
                 (numero_cotizacion, cliente_id, vendedor_id, empresa_cliente, contacto_cliente, 
                  subtotal, igv, total, fecha_vencimiento, notas) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    numero_cotizacion,
                    cotizacionData.cliente_id,
                    vendedor_id,
                    cotizacionData.empresa_cliente || null,
                    cotizacionData.contacto_cliente || null,
                    subtotal,
                    igv,
                    total,
                    fecha_vencimiento,
                    cotizacionData.notas || null
                ]
            );

            const cotizacionId = result.insertId;

            // Insertar detalles
            for (const detalle of detalles) {
                const subtotalDetalle = detalle.cantidad * detalle.precio_unitario;
                
                await connection.execute(
                    `INSERT INTO cotizacion_detalles 
                     (cotizacion_id, equipo_id, cantidad, precio_unitario, subtotal) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [cotizacionId, detalle.equipo_id, detalle.cantidad, detalle.precio_unitario, subtotalDetalle]
                );
            }

            await connection.commit();
            return await this.findById(cotizacionId);

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Buscar cotización por ID con datos relacionados
    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                `SELECT c.*, 
                        cliente.nombre as cliente_nombre, cliente.apellido as cliente_apellido, cliente.email as cliente_email,
                        vendedor.nombre as vendedor_nombre, vendedor.apellido as vendedor_apellido, vendedor.email as vendedor_email
                 FROM cotizaciones c
                 LEFT JOIN users cliente ON c.cliente_id = cliente.id
                 LEFT JOIN users vendedor ON c.vendedor_id = vendedor.id
                 WHERE c.id = ?`,
                [id]
            );
            
            if (rows.length === 0) return null;
            
            const cotizacion = new Cotizacion({
                ...rows[0],
                cliente_nombre: `${rows[0].cliente_nombre} ${rows[0].cliente_apellido}`,
                vendedor_nombre: `${rows[0].vendedor_nombre} ${rows[0].vendedor_apellido}`
            });
            
            // Obtener detalles
            cotizacion.detalles = await this.getDetalles(id);
            
            return cotizacion;
        } catch (error) {
            throw error;
        }
    }

    // Obtener detalles de una cotización
    static async getDetalles(cotizacionId) {
        try {
            const [rows] = await pool.execute(
                `SELECT cd.*, e.nombre as equipo_nombre, e.codigo as equipo_codigo, e.imagen_url
                 FROM cotizacion_detalles cd
                 LEFT JOIN equipos e ON cd.equipo_id = e.id
                 WHERE cd.cotizacion_id = ?
                 ORDER BY cd.id`,
                [cotizacionId]
            );
            
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener cotizaciones según rol del usuario
    static async findByRole(userRole, userId, filters = {}) {
        try {
            let query = `
                SELECT c.*, 
                       cliente.nombre as cliente_nombre, cliente.apellido as cliente_apellido,
                       vendedor.nombre as vendedor_nombre, vendedor.apellido as vendedor_apellido
                FROM cotizaciones c
                LEFT JOIN users cliente ON c.cliente_id = cliente.id
                LEFT JOIN users vendedor ON c.vendedor_id = vendedor.id
                WHERE 1=1
            `;
            const params = [];

            // Filtro según rol
            if (userRole === 'cliente') {
                query += ' AND c.cliente_id = ?';
                params.push(userId);
            } else if (userRole === 'vendedor') {
                query += ' AND c.vendedor_id = ?';
                params.push(userId);
            }
            // Admin ve todas las cotizaciones

            // Filtros adicionales
            if (filters.estado) {
                query += ' AND c.estado = ?';
                params.push(filters.estado);
            }

            if (filters.search) {
                query += ' AND (c.numero_cotizacion LIKE ? OR cliente.nombre LIKE ? OR cliente.apellido LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            query += ' ORDER BY c.created_at DESC';

            if (filters.limit) {
                query += ' LIMIT ?';
                params.push(parseInt(filters.limit));
            }

            const [rows] = await pool.execute(query, params);
            
            return rows.map(row => new Cotizacion({
                ...row,
                cliente_nombre: `${row.cliente_nombre} ${row.cliente_apellido}`,
                vendedor_nombre: `${row.vendedor_nombre} ${row.vendedor_apellido}`
            }));
        } catch (error) {
            throw error;
        }
    }

    // Actualizar estado de cotización
    async updateEstado(nuevoEstado, userId, userRole) {
        try {
            // Validar transiciones de estado
            const transicionesValidas = {
                'borrador': ['enviada'],
                'enviada': ['aprobada', 'rechazada', 'borrador'],
                'aprobada': ['enviada'], // Solo admin puede revertir
                'rechazada': ['enviada'], // Solo admin puede revertir
                'vencida': []
            };

            if (!transicionesValidas[this.estado].includes(nuevoEstado)) {
                throw new Error(`No se puede cambiar de ${this.estado} a ${nuevoEstado}`);
            }

            // Verificar permisos
            if (userRole === 'cliente' && this.cliente_id !== userId) {
                throw new Error('No tienes permisos para modificar esta cotización');
            }
            
            if (userRole === 'vendedor' && this.vendedor_id !== userId) {
                throw new Error('No tienes permisos para modificar esta cotización');
            }

            await pool.execute(
                'UPDATE cotizaciones SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [nuevoEstado, this.id]
            );

            this.estado = nuevoEstado;
            return this;
        } catch (error) {
            throw error;
        }
    }

    // Obtener estadísticas de cotizaciones
    static async getStats(userRole = null, userId = null) {
        try {
            let query = 'SELECT estado, COUNT(*) as count FROM cotizaciones';
            const params = [];

            if (userRole === 'cliente') {
                query += ' WHERE cliente_id = ?';
                params.push(userId);
            } else if (userRole === 'vendedor') {
                query += ' WHERE vendedor_id = ?';
                params.push(userId);
            }

            query += ' GROUP BY estado';

            const [rows] = await pool.execute(query, params);
            
            const stats = {
                total: 0,
                borrador: 0,
                enviada: 0,
                aprobada: 0,
                rechazada: 0,
                vencida: 0
            };

            rows.forEach(row => {
                stats[row.estado] = row.count;
                stats.total += row.count;
            });

            return stats;
        } catch (error) {
            throw error;
        }
    }

    // Verificar y marcar cotizaciones vencidas
    static async checkVencidas() {
        try {
            await pool.execute(
                `UPDATE cotizaciones 
                 SET estado = 'vencida' 
                 WHERE estado = 'enviada' 
                 AND fecha_vencimiento < CURDATE()`
            );
        } catch (error) {
            throw error;
        }
    }

    // Métodos de utilidad
    isEditable() {
        return this.estado === 'borrador' || this.estado === 'rechazada';
    }

    isPending() {
        return this.estado === 'enviada';
    }

    isApproved() {
        return this.estado === 'aprobada';
    }

    isExpired() {
        return this.estado === 'vencida' || new Date(this.fecha_vencimiento) < new Date();
    }

    getFormattedTotal() {
        return `S/. ${this.total.toFixed(2)}`;
    }

    getFormattedDate() {
        return new Date(this.created_at).toLocaleDateString('es-PE');
    }
}

module.exports = Cotizacion;