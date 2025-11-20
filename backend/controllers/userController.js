const User = require('../models/User');
const { validationResult } = require('express-validator');

const userController = {
    // Listar todos los usuarios
    listUsers: async (req, res) => {
        try {
            const users = await User.findAll();

            res.json({
                success: true,
                users: users.map(user => user.toSafeObject())
            });
        } catch (error) {
            console.error('Error listando usuarios:', error);
            res.status(500).json({
                success: false,
                message: 'Error cargando usuarios'
            });
        }
    },

    // Obtener un usuario por ID
    getUser: async (req, res) => {
        try {
            const { id } = req.params;
            const userToGet = await User.findById(id);

            if (!userToGet) {
                return res.status(404).json({
                    success: false,
                    message: 'El usuario que buscas no existe'
                });
            }

            res.json({
                success: true,
                user: userToGet.toSafeObject()
            });
        } catch (error) {
            console.error('Error obteniendo usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error cargando usuario'
            });
        }
    },

    // Actualizar usuario (incluyendo rol)
    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { role } = req.body;

            // No permitir que el admin se cambie el rol a sí mismo
            if (parseInt(id) === req.user.id && role !== 'admin') {
                return res.status(400).json({
                    success: false,
                    message: 'No puedes cambiar tu propio rol de administrador'
                });
            }

            // Actualizar rol
            const updatedUser = await User.updateRole(id, role);

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'El usuario que intentas actualizar no existe'
                });
            }

            console.log(`✅ Admin ${req.user.email} cambió rol de ${updatedUser.email} a ${role}`);

            res.json({
                success: true,
                message: 'Usuario actualizado correctamente',
                user: updatedUser.toSafeObject()
            });

        } catch (error) {
            console.error('Error actualizando usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error actualizando usuario'
            });
        }
    },

    // Estadísticas de usuarios
    getUserStats: async (req, res) => {
        try {
            const users = await User.findAll();

            const stats = {
                total: users.length,
                admins: users.filter(u => u.role === 'admin').length,
                vendedores: users.filter(u => u.role === 'vendedor').length,
                clientes: users.filter(u => u.role === 'cliente').length,
                activos: users.filter(u => u.estado === 'activo').length
            };

            res.json(stats);
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            res.status(500).json({ error: 'Error obteniendo estadísticas' });
        }
    }
};

module.exports = userController;
