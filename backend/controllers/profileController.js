const User = require('../models/User');
const { validationResult } = require('express-validator');

const profileController = {
    // Obtener perfil del usuario
    showProfile: async (req, res) => {
        try {
            res.json({
                success: true,
                user: req.user.toSafeObject()
            });
        } catch (error) {
            console.error('Error mostrando perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Error cargando el perfil'
            });
        }
    },

    // Actualizar perfil
    updateProfile: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { nombre, apellido, telefono, empresa } = req.body;

            // Actualizar usuario
            await req.user.updateProfile({
                nombre,
                apellido,
                telefono: telefono || null,
                empresa: empresa || null
            });

            console.log(`✅ Perfil actualizado: ${req.user.email}`);

            res.json({
                success: true,
                message: 'Perfil actualizado correctamente',
                user: req.user.toSafeObject()
            });

        } catch (error) {
            console.error('Error actualizando perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Error actualizando el perfil'
            });
        }
    }
};

module.exports = profileController;
