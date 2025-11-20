const User = require('../models/User');
const { validationResult } = require('express-validator');

/**
 * Controlador de autenticación para API (React)
 * Devuelve respuestas JSON en lugar de vistas EJS
 */
const apiAuthController = {
    /**
     * API Login - POST /auth/login
     * Autentica usuario y devuelve datos en JSON
     */
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

            // Verificar que existe la contraseña
            if (!userData.password) {
                console.error('❌ Password no encontrado para usuario:', email);
                return res.status(500).json({
                    success: false,
                    error: 'Error de configuración de usuario'
                });
            }

            // Verificar contraseña
            const isValidPassword = await User.verifyPassword(password, userData.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    error: 'Credenciales incorrectas'
                });
            }

            // Crear sesión
            req.session.userId = userData.id;
            req.session.userRole = userData.role;

            console.log(`✅ Usuario autenticado (API): ${userData.email} (${userData.role})`);

            // Devolver datos del usuario (sin password)
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

    /**
     * API Register - POST /auth/register
     * Registra nuevo usuario y devuelve datos en JSON
     */
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

            const { email, password, nombre, telefono, direccion } = req.body;

            // Crear usuario (sin apellido para React)
            const newUser = await User.create({
                email,
                password,
                nombre,
                apellido: '', // Campo requerido en BD pero vacío para React
                telefono: telefono || null,
                empresa: direccion || null // Usar direccion como empresa temporalmente
            });

            console.log(`✅ Nuevo usuario registrado (API): ${newUser.email}`);

            // NO hacer auto-login en el registro desde React
            // El usuario debe ir al login después de registrarse

            // Devolver datos del usuario (sin password)
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
                statusCode = 400;
            }

            return res.status(statusCode).json({
                success: false,
                error: errorMessage
            });
        }
    },

    /**
     * API Logout - POST /auth/logout
     * Cierra sesión y devuelve JSON
     */
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

    /**
     * API Get Current User - GET /auth/me
     * Obtiene datos del usuario actual desde la sesión
     */
    getCurrentUser: async (req, res) => {
        try {
            // Si no hay sesión activa
            if (!req.session.userId) {
                return res.status(401).json({
                    success: false,
                    error: 'No hay sesión activa'
                });
            }

            // Buscar usuario por ID de sesión
            const userData = await User.findById(req.session.userId);

            if (!userData) {
                // Si el usuario no existe, destruir sesión
                req.session.destroy();
                return res.status(401).json({
                    success: false,
                    error: 'Usuario no encontrado'
                });
            }

            // Devolver datos del usuario (sin password)
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
