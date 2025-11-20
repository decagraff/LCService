const { pool } = require('../config/database');

class Equipo {
    constructor(data) {
        this.id = data.id;
        this.categoria_id = data.categoria_id;
        this.codigo = data.codigo;
        this.nombre = data.nombre;
        this.descripcion = data.descripcion;
        this.material = data.material;
        this.dimensiones = data.dimensiones;
        this.precio = parseFloat(data.precio);
        this.stock = parseInt(data.stock);
        this.imagen_url = data.imagen_url;
        this.estado = data.estado;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        
        // Datos de la categoría si están disponibles
        this.categoria_nombre = data.categoria_nombre;
    }

    // Crear nuevo equipo
    static async create(data) {
        try {
            const { categoria_id, codigo, nombre, descripcion, material, dimensiones, precio, stock, imagen_url } = data;
            
            const [result] = await pool.execute(
                `INSERT INTO equipos (categoria_id, codigo, nombre, descripcion, material, dimensiones, precio, stock, imagen_url) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [categoria_id, codigo, nombre, descripcion, material, dimensiones, precio, stock, imagen_url]
            );

            return await this.findById(result.insertId);
        } catch (error) {
            throw error;
        }
    }

    // Buscar por ID con información de categoría
    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                `SELECT e.*, c.nombre as categoria_nombre 
                 FROM equipos e 
                 LEFT JOIN categorias c ON e.categoria_id = c.id 
                 WHERE e.id = ?`,
                [id]
            );
            return rows[0] ? new Equipo(rows[0]) : null;
        } catch (error) {
            throw error;
        }
    }

    // Obtener todos los equipos con categoría
    static async findAll(filters = {}) {
        try {
            let query = `
                SELECT e.*, c.nombre as categoria_nombre 
                FROM equipos e 
                LEFT JOIN categorias c ON e.categoria_id = c.id 
                WHERE e.estado = 'activo'
            `;
            let params = [];

            // Filtros opcionales
            if (filters.categoria_id) {
                query += ' AND e.categoria_id = ?';
                params.push(filters.categoria_id);
            }

            if (filters.search) {
                query += ' AND (e.nombre LIKE ? OR e.codigo LIKE ? OR e.descripcion LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            if (filters.min_precio) {
                query += ' AND e.precio >= ?';
                params.push(filters.min_precio);
            }

            if (filters.max_precio) {
                query += ' AND e.precio <= ?';
                params.push(filters.max_precio);
            }

            query += ' ORDER BY e.nombre ASC';

            const [rows] = await pool.execute(query, params);
            return rows.map(row => new Equipo(row));
        } catch (error) {
            throw error;
        }
    }

    // Obtener equipos por categoría
    static async findByCategory(categoria_id) {
        try {
            const [rows] = await pool.execute(
                `SELECT e.*, c.nombre as categoria_nombre 
                 FROM equipos e 
                 LEFT JOIN categorias c ON e.categoria_id = c.id 
                 WHERE e.categoria_id = ? AND e.estado = 'activo'
                 ORDER BY e.nombre ASC`,
                [categoria_id]
            );
            return rows.map(row => new Equipo(row));
        } catch (error) {
            throw error;
        }
    }

    // Verificar si código existe
    static async codeExists(codigo, excludeId = null) {
        try {
            let query = 'SELECT id FROM equipos WHERE codigo = ?';
            let params = [codigo];
            
            if (excludeId) {
                query += ' AND id != ?';
                params.push(excludeId);
            }
            
            const [rows] = await pool.execute(query, params);
            return rows.length > 0;
        } catch (error) {
            throw error;
        }
    }

    // Actualizar equipo
    async update(data) {
        try {
            const { categoria_id, codigo, nombre, descripcion, material, dimensiones, precio, stock, imagen_url } = data;
            
            await pool.execute(
                `UPDATE equipos SET 
                 categoria_id = ?, codigo = ?, nombre = ?, descripcion = ?, 
                 material = ?, dimensiones = ?, precio = ?, stock = ?, imagen_url = ?,
                 updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`,
                [categoria_id, codigo, nombre, descripcion, material, dimensiones, precio, stock, imagen_url, this.id]
            );

            // Actualizar propiedades del objeto
            this.categoria_id = categoria_id;
            this.codigo = codigo;
            this.nombre = nombre;
            this.descripcion = descripcion;
            this.material = material;
            this.dimensiones = dimensiones;
            this.precio = parseFloat(precio);
            this.stock = parseInt(stock);
            this.imagen_url = imagen_url;
            
            return this;
        } catch (error) {
            throw error;
        }
    }

    // Actualizar stock
    async updateStock(newStock) {
        try {
            await pool.execute(
                'UPDATE equipos SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [newStock, this.id]
            );
            this.stock = parseInt(newStock);
            return this;
        } catch (error) {
            throw error;
        }
    }

    // Eliminar equipo (soft delete)
    async delete() {
        try {
            await pool.execute(
                'UPDATE equipos SET estado = "inactivo" WHERE id = ?',
                [this.id]
            );
            this.estado = 'inactivo';
            return this;
        } catch (error) {
            throw error;
        }
    }

    // Obtener estadísticas del inventario
    static async getInventoryStats() {
        try {
            const [rows] = await pool.execute(`
                SELECT 
                    COUNT(*) as total_equipos,
                    SUM(stock) as total_stock,
                    COUNT(CASE WHEN stock = 0 THEN 1 END) as sin_stock,
                    COUNT(CASE WHEN stock <= 5 THEN 1 END) as stock_bajo,
                    AVG(precio) as precio_promedio,
                    MIN(precio) as precio_minimo,
                    MAX(precio) as precio_maximo
                FROM equipos 
                WHERE estado = 'activo'
            `);
            
            return {
                total_equipos: rows[0].total_equipos,
                total_stock: rows[0].total_stock,
                sin_stock: rows[0].sin_stock,
                stock_bajo: rows[0].stock_bajo,
                precio_promedio: parseFloat(rows[0].precio_promedio || 0),
                precio_minimo: parseFloat(rows[0].precio_minimo || 0),
                precio_maximo: parseFloat(rows[0].precio_maximo || 0)
            };
        } catch (error) {
            throw error;
        }
    }

    // Formatear precio
    getPrecioFormateado() {
        return `S/. ${this.precio.toFixed(2)}`;
    }

    // Verificar si está en stock
    isInStock() {
        return this.stock > 0;
    }

    // Verificar si tiene stock bajo
    isLowStock() {
        return this.stock <= 5 && this.stock > 0;
    }
}

module.exports = Equipo;