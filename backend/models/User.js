const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    constructor(data) {
        this.id = data.id;
        this.email = data.email;
        this.nombre = data.nombre;
        this.apellido = data.apellido;
        this.telefono = data.telefono;
        this.empresa = data.empresa;
        this.role = data.role;
        this.estado = data.estado;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    // Crear nuevo usuario
    static async create(userData) {
        try {
            const { email, password, nombre, apellido, telefono, empresa } = userData;
            
            // Verificar si el email ya existe
            const existingUser = await this.findByEmail(email);
            if (existingUser) {
                throw new Error('El email ya está registrado');
            }

            // Encriptar contraseña
            const hashedPassword = await bcrypt.hash(password, 12);

            // Insertar usuario
            const [result] = await pool.execute(
                `INSERT INTO users (email, password, nombre, apellido, telefono, empresa, role) 
                 VALUES (?, ?, ?, ?, ?, ?, 'cliente')`,
                [email, hashedPassword, nombre, apellido, telefono, empresa]
            );

            // Obtener el usuario creado
            return await this.findById(result.insertId);
        } catch (error) {
            throw error;
        }
    }

    // Buscar usuario por ID
    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE id = ? AND estado = "activo"',
                [id]
            );
            return rows[0] ? new User(rows[0]) : null;
        } catch (error) {
            throw error;
        }
    }

    // Buscar usuario por email (INCLUIR password para login)
static async findByEmail(email) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ? AND estado = "activo"',
            [email]
        );
        
        if (rows[0]) {
            // Crear usuario pero mantener password para verificación
            const userData = rows[0];
            return {
                id: userData.id,
                email: userData.email,
                password: userData.password, // ← IMPORTANTE: incluir password
                nombre: userData.nombre,
                apellido: userData.apellido,
                telefono: userData.telefono,
                empresa: userData.empresa,
                role: userData.role,
                estado: userData.estado,
                created_at: userData.created_at,
                updated_at: userData.updated_at
            };
        }
        return null;
    } catch (error) {
        throw error;
    }
}

    // Verificar contraseña
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Actualizar rol de usuario (solo admin)
    static async updateRole(userId, newRole) {
    try {
        // Validar que el rol sea válido
        const validRoles = ['admin', 'vendedor', 'cliente'];
        if (!validRoles.includes(newRole)) {
            throw new Error('Rol inválido');
        }

        await pool.execute(
            'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newRole, userId]
        );
        
        return await this.findById(userId);
    } catch (error) {
        throw error;
    }
}
static async getUserStats() {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                role,
                COUNT(*) as count,
                COUNT(CASE WHEN estado = 'activo' THEN 1 END) as activos
            FROM users 
            GROUP BY role
        `);
        
        return rows;
    } catch (error) {
        throw error;
    }
}
    // Obtener todos los usuarios (solo admin)
    static async findAll() {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE estado = "activo" ORDER BY created_at DESC'
            );
            return rows.map(row => new User(row));
        } catch (error) {
            throw error;
        }
    }

    // Actualizar perfil de usuario
    async updateProfile(updateData) {
        try {
            const { nombre, apellido, telefono, empresa } = updateData;
            
            await pool.execute(
                'UPDATE users SET nombre = ?, apellido = ?, telefono = ?, empresa = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [nombre, apellido, telefono, empresa, this.id]
            );

            // Actualizar propiedades del objeto actual
            this.nombre = nombre;
            this.apellido = apellido;
            this.telefono = telefono;
            this.empresa = empresa;

            return this;
        } catch (error) {
            throw error;
        }
    }

    // Obtener datos seguros (sin contraseña)
    toSafeObject() {
        return {
            id: this.id,
            email: this.email,
            nombre: this.nombre,
            apellido: this.apellido,
            telefono: this.telefono,
            empresa: this.empresa,
            role: this.role,
            estado: this.estado,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }

    // Verificar si es admin
    isAdmin() {
        return this.role === 'admin';
    }

    // Verificar si es vendedor
    isVendedor() {
        return this.role === 'vendedor';
    }

    // Verificar si es cliente
    isCliente() {
        return this.role === 'cliente';
    }
}

module.exports = User;