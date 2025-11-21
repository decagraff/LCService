const User = require('../models/User');
const { validationResult } = require('express-validator');

const apiAuthController = {
    login: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: errors.array()[0].msg,
                    errors: errors.array()
                });
            }

            const { email, password } = req.body;

            // Buscar usuario
            const userData = await User.findByEmail(email);
            if (!userData) {
                return res.status(401).json({
                    success: false,
                    error: 'Credenciales incorrectas'
                });
            }

            // Verificar password
            if (!userData.password) {
                console.error('❌ Password no encontrado para usuario:', email);
                return res.status(500).json({
                    success: false,
                    error: 'Error de configuración de usuario'
                });
            }

            const isValidPassword = await User.verifyPassword(password, userData.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    error: 'Credenciales incorrectas'
                });
            }

            req.session.userId = userData.id;
            req.session.userRole = userData.role;

            console.log(`✅ Usuario autenticado (API): ${userData.email} (${userData.role})`);

            const { password: _, ...userWithoutPassword } = userData;

            return res.json({
                success: true,
                data: userWithoutPassword,
                message: 'Login exitoso'
            });

        } catch (error) {
            console.error('Error en API login:', error);
            return res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    },

    // --- CORRECCIÓN PRINCIPAL AQUÍ ---
    register: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: errors.array()[0].msg,
                    errors: errors.array()
                });
            }

            const { email, password, nombre, apellido, telefono, direccion, empresa } = req.body;

            const newUser = await User.create({
                email,
                password,
                nombre,
                apellido: apellido || '',
                telefono: telefono || null,
                direccion: direccion || null,
                empresa: empresa || null
            });

            console.log(`✅ Nuevo usuario registrado (API): ${newUser.email}`);

            const { password: _, ...userWithoutPassword } = newUser;

            return res.status(201).json({
                success: true,
                data: userWithoutPassword,
                message: 'Usuario registrado exitosamente'
            });

        } catch (error) {
            console.error('Error en API register:', error);

            let errorMessage = 'Error interno del servidor';
            let statusCode = 500;

            if (error.message === 'El email ya está registrado') {
                errorMessage = error.message;
                statusCode = 409; // Conflict
            }

            return res.status(statusCode).json({
                success: false,
                error: errorMessage
            });
        }
    },

    logout: async (req, res) => {
        try {
            const userEmail = req.user ? req.user.email : 'Usuario desconocido';

            req.session.destroy((err) => {
                if (err) {
                    console.error('Error cerrando sesión:', err);
                    return res.status(500).json({
                        success: false,
                        error: 'Error al cerrar sesión'
                    });
                }
                console.log(`👋 Usuario desconectado (API): ${userEmail}`);
                return res.json({
                    success: true,
                    message: 'Sesión cerrada exitosamente'
                });
            });
        } catch (error) {
            console.error('Error en API logout:', error);
            return res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    },

    getCurrentUser: async (req, res) => {
        try {
            if (!req.session.userId) {
                return res.status(401).json({
                    success: false,
                    error: 'No hay sesión activa'
                });
            }

            const userData = await User.findById(req.session.userId);

            if (!userData) {
                req.session.destroy();
                return res.status(401).json({
                    success: false,
                    error: 'Usuario no encontrado'
                });
            }

            const { password: _, ...userWithoutPassword } = userData;

            return res.json({
                success: true,
                data: userWithoutPassword
            });

        } catch (error) {
            console.error('Error en API getCurrentUser:', error);
            return res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
};

module.exports = apiAuthController;