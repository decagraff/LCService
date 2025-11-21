const User = require('../models/User');
const { validationResult } = require('express-validator');

const authController = {
    // Procesar login
    processLogin: async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Buscar usuario
        const userData = await User.findByEmail(email);
        if (!userData) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }

        // Verificar que existe la contraseña
        if (!userData.password) {
            console.error('❌ Password no encontrado para usuario:', email);
            return res.status(500).json({
                success: false,
                message: 'Error de configuración de usuario'
            });
        }

        // Verificar contraseña
        const isValidPassword = await User.verifyPassword(password, userData.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }

        // Crear sesión
        req.session.userId = userData.id;
        req.session.userRole = userData.role;

        console.log(`✅ Usuario autenticado: ${userData.email} (${userData.role})`);

        // Retornar datos del usuario (sin password)
        const { password: _, ...userWithoutPassword } = userData;

        res.json({
            success: true,
            message: 'Login exitoso',
            data: userWithoutPassword,
            redirectUrl: userData.role === 'vendedor' ? '/vendedor/dashboard' : '/cliente/dashboard'
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
},


    // Procesar registro
    processRegister: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { email, password, nombre, apellido, telefono, empresa } = req.body;

            // Crear usuario
            const newUser = await User.create({
                email,
                password,
                nombre,
                apellido,
                telefono: telefono || null,
                empresa: empresa || null
            });

            console.log(`✅ Nuevo usuario registrado: ${newUser.email}`);

            // Auto-login después del registro
            req.session.userId = newUser.id;
            req.session.userRole = newUser.role;

            // Retornar datos del usuario (sin password)
            const { password: _, ...userWithoutPassword } = newUser;

            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                user: userWithoutPassword,
                data: userWithoutPassword,
                redirectTo: '/cliente/dashboard'
            });

        } catch (error) {
            console.error('Error en registro:', error);

            let errorMessage = 'Error interno del servidor';
            let statusCode = 500;

            if (error.message === 'El email ya está registrado') {
                errorMessage = error.message;
                statusCode = 409; // Conflict
            }

            res.status(statusCode).json({
                success: false,
                message: errorMessage
            });
        }
    },

    // Cerrar sesión
    logout: (req, res) => {
        const userEmail = req.user ? req.user.email : 'Usuario desconocido';

        req.session.destroy((err) => {
            if (err) {
                console.error('Error cerrando sesión:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error al cerrar sesión'
                });
            }

            console.log(`👋 Usuario desconectado: ${userEmail}`);
            res.json({
                success: true,
                message: 'Sesión cerrada exitosamente'
            });
        });
		 },

 
    // Obtener usuario actual
    getCurrentUser: async (req, res) => {
        try {
            if (!req.session.userId) {
                return res.status(401).json({
                    success: false,
                    error: 'No autenticado'
                });
            }

            const user = await User.findById(req.session.userId);
            if (!user) {
                req.session.destroy();
                return res.status(401).json({
                    success: false,
                    error: 'Usuario no encontrado'
                });
            }

            res.json({
                success: true,
                data: user.toSafeObject()
            });
        } catch (error) {
            console.error('Error obteniendo usuario actual:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    },

    // Cambiar contraseña
    changePassword: async (req, res) => {
        try {
            if (!req.session.userId) {
                return res.status(401).json({
                    success: false,
                    error: 'No autenticado'
                });
            }

            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Contraseña actual y nueva son requeridas'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    error: 'La nueva contraseña debe tener al menos 6 caracteres'
                });
            }

            // Get user with password
            const userData = await User.findById(req.session.userId);
            if (!userData) {
                return res.status(404).json({
                    success: false,
                    error: 'Usuario no encontrado'
                });
            }

            // Get full user data including password
            const fullUserData = await User.findByEmail(userData.email);

            // Verify current password
            const isValidPassword = await User.verifyPassword(currentPassword, fullUserData.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    error: 'La contraseña actual es incorrecta'
                });
            }

            // Update password
            await User.updatePassword(req.session.userId, newPassword);

            console.log(`✅ Contraseña cambiada para usuario ID: ${req.session.userId}`);

            res.json({
                success: true,
                message: 'Contraseña actualizada correctamente'
            });
        } catch (error) {
            console.error('Error cambiando contraseña:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
};

module.exports = authController;
