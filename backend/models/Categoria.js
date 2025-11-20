const { pool } = require('../config/database');

class Categoria {
    constructor(data) {
        this.id = data.id;
        this.nombre = data.nombre;
        this.descripcion = data.descripcion;
        this.estado = data.estado;
        this.created_at = data.created_at;
    }

    // Crear nueva categoría
    static async create(data) {
        try {
            const { nombre, descripcion } = data;
            const [result] = await pool.execute(
                'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
                [nombre, descripcion]
            );
            return await this.findById(result.insertId);
        } catch (error) {
            throw error;
        }
    }

    // Buscar por ID
    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM categorias WHERE id = ?',
                [id]
            );
            return rows[0] ? new Categoria(rows[0]) : null;
        } catch (error) {
            throw error;
        }
    }

    // Obtener todas las categorías activas
    static async findAll() {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM categorias WHERE estado = "activo" ORDER BY nombre ASC'
            );
            return rows.map(row => new Categoria(row));
        } catch (error) {
            throw error;
        }
    }

    // Obtener categorías con conteo de equipos
    static async findAllWithEquipmentCount() {
        try {
            const [rows] = await pool.execute(`
                SELECT 
                    c.*,
                    COUNT(e.id) as equipos_count,
                    SUM(CASE WHEN e.estado = 'activo' THEN 1 ELSE 0 END) as equipos_activos
                FROM categorias c
                LEFT JOIN equipos e ON c.id = e.categoria_id
                WHERE c.estado = 'activo'
                GROUP BY c.id
                ORDER BY c.nombre ASC
            `);

            return rows.map(row => ({
                ...new Categoria(row),
                equipment_count: row.equipos_count,
                equipment_active_count: row.equipos_activos
            }));
        } catch (error) {
            throw error;
        }
    }

    // Actualizar categoría
    async update(data) {
        try {
            const { nombre, descripcion } = data;
            await pool.execute(
                'UPDATE categorias SET nombre = ?, descripcion = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [nombre, descripcion, this.id]
            );
            this.nombre = nombre;
            this.descripcion = descripcion;
            return this;
        } catch (error) {
            throw error;
        }
    }

    // Eliminar categoría 
    async delete() {
        try {
            await pool.execute(
                'UPDATE categorias SET estado = "inactivo" WHERE id = ?',
                [this.id]
            );
            this.estado = 'inactivo';
            return this;
        } catch (error) {
            throw error;
        }
    }

    // Verificar si se puede eliminar
    async canDelete() {
        try {
            const [rows] = await pool.execute(
                'SELECT COUNT(*) as count FROM equipos WHERE categoria_id = ? AND estado = "activo"',
                [this.id]
            );
            return rows[0].count === 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Categoria;