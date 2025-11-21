const User = require('../models/User');
const { pool } = require('../config/database');
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
    },

    // Obtener estadísticas del perfil
    getStats: async (req, res) => {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;

            let stats = {};

            if (userRole === 'cliente') {
                // Stats para cliente
                const [cotizacionesTotal] = await pool.execute(
                    'SELECT COUNT(*) as total FROM cotizaciones WHERE cliente_id = ?',
                    [userId]
                );
                const [cotizacionesAprobadas] = await pool.execute(
                    'SELECT COUNT(*) as total FROM cotizaciones WHERE cliente_id = ? AND estado = "aprobada"',
                    [userId]
                );
                const [cotizacionesPendientes] = await pool.execute(
                    'SELECT COUNT(*) as total FROM cotizaciones WHERE cliente_id = ? AND estado IN ("borrador", "enviada")',
                    [userId]
                );

                stats = {
                    cotizaciones_total: cotizacionesTotal[0].total,
                    cotizaciones_aprobadas: cotizacionesAprobadas[0].total,
                    cotizaciones_pendientes: cotizacionesPendientes[0].total
                };
            } else if (userRole === 'vendedor') {
                // Stats para vendedor
                const [cotizacionesTotal] = await pool.execute(
                    'SELECT COUNT(*) as total FROM cotizaciones WHERE vendedor_id = ?',
                    [userId]
                );
                const [ventasTotal] = await pool.execute(
                    'SELECT COALESCE(SUM(total), 0) as total FROM cotizaciones WHERE vendedor_id = ? AND estado = "aprobada"',
                    [userId]
                );

                stats = {
                    cotizaciones_total: cotizacionesTotal[0].total,
                    ventas_total: Number(ventasTotal[0].total) || 0
                };
            } else if (userRole === 'admin') {
                // Stats para admin (todas las cotizaciones)
                const [cotizacionesTotal] = await pool.execute(
                    'SELECT COUNT(*) as total FROM cotizaciones'
                );
                const [ventasTotal] = await pool.execute(
                    'SELECT COALESCE(SUM(total), 0) as total FROM cotizaciones WHERE estado = "aprobada"'
                );

                stats = {
                    cotizaciones_total: cotizacionesTotal[0].total,
                    ventas_total: Number(ventasTotal[0].total) || 0
                };
            }

            res.json(stats);
        } catch (error) {
            console.error('Error obteniendo stats del perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo estadísticas'
            });
        }
    }
};

module.exports = profileController;
