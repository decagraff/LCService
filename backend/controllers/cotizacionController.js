const Cotizacion = require('../models/Cotizacion');
const Equipo = require('../models/Equipo');
const User = require('../models/User');
const { validationResult } = require('express-validator');

const cotizacionController = {
    // CARRITO TEMPORAL (usando sesión en lugar de localStorage)

    // Agregar producto al carrito
    addToCart: async (req, res) => {
        try {
            const { equipoId, cantidad } = req.body;
            const cantidadNum = parseInt(cantidad) || 1;

            // Verificar que el equipo existe y tiene stock
            const equipo = await Equipo.findById(equipoId);
            if (!equipo) {
                return res.status(404).json({ error: 'Equipo no encontrado' });
            }

            if (equipo.stock < cantidadNum) {
                return res.status(400).json({ error: 'Stock insuficiente' });
            }

            // Inicializar carrito si no existe
            if (!req.session.carrito) {
                req.session.carrito = [];
            }

            // Buscar si el producto ya está en el carrito
            const itemExistente = req.session.carrito.find(item => item.equipo_id == equipoId);

            if (itemExistente) {
                const nuevaCantidad = itemExistente.cantidad + cantidadNum;

                if (nuevaCantidad > equipo.stock) {
                    return res.status(400).json({
                        error: `Solo hay ${equipo.stock} unidades disponibles`
                    });
                }

                itemExistente.cantidad = nuevaCantidad;
            } else {
                req.session.carrito.push({
                    equipo_id: equipoId,
                    nombre: equipo.nombre,
                    codigo: equipo.codigo,
                    precio_unitario: equipo.precio,
                    cantidad: cantidadNum,
                    imagen_url: equipo.imagen_url,
                    stock_disponible: equipo.stock
                });
            }

            // Calcular totales del carrito
            const stats = calculateCartStats(req.session.carrito);

            res.json({
                success: true,
                message: 'Producto agregado al carrito',
                carrito: req.session.carrito,
                stats
            });

        } catch (error) {
            console.error('Error agregando al carrito:', error);
            res.status(500).json({ error: 'Error agregando producto al carrito' });
        }
    },

    // Obtener carrito actual
    getCart: (req, res) => {
        try {
            const carrito = req.session.carrito || [];
            const stats = calculateCartStats(carrito);

            res.json({
                success: true,
                carrito,
                stats
            });
        } catch (error) {
            console.error('Error obteniendo carrito:', error);
            res.status(500).json({ error: 'Error obteniendo carrito' });
        }
    },

    // Actualizar cantidad en carrito
    updateCartItem: async (req, res) => {
        try {
            const { equipoId } = req.params;
            const { cantidad } = req.body;
            const cantidadNum = parseInt(cantidad);

            if (!req.session.carrito) {
                return res.status(404).json({ error: 'Carrito vacío' });
            }

            // Verificar stock disponible
            const equipo = await Equipo.findById(equipoId);
            if (!equipo) {
                return res.status(404).json({ error: 'Equipo no encontrado' });
            }

            if (cantidadNum > equipo.stock) {
                return res.status(400).json({
                    error: `Solo hay ${equipo.stock} unidades disponibles`
                });
            }

            const item = req.session.carrito.find(item => item.equipo_id == equipoId);

            if (item) {
                if (cantidadNum <= 0) {
                    // Remover item
                    req.session.carrito = req.session.carrito.filter(item => item.equipo_id != equipoId);
                } else {
                    item.cantidad = cantidadNum;
                }
            }

            const stats = calculateCartStats(req.session.carrito);

            res.json({
                success: true,
                message: 'Carrito actualizado',
                carrito: req.session.carrito,
                stats
            });

        } catch (error) {
            console.error('Error actualizando carrito:', error);
            res.status(500).json({ error: 'Error actualizando carrito' });
        }
    },

    // Limpiar carrito
    clearCart: (req, res) => {
        try {
            req.session.carrito = [];

            res.json({
                success: true,
                message: 'Carrito limpiado',
                carrito: [],
                stats: { items: 0, subtotal: 0, total: 0 }
            });
        } catch (error) {
            console.error('Error limpiando carrito:', error);
            res.status(500).json({ error: 'Error limpiando carrito' });
        }
    },

    // GESTIÓN DE COTIZACIONES

    // Lista de cotizaciones según rol
    listCotizaciones: async (req, res) => {
        try {
            const filters = {
                estado: req.query.estado,
                search: req.query.search,
                limit: req.query.limit
            };

            const cotizaciones = await Cotizacion.findByRole(req.user.role, req.user.id, filters);
            const stats = await Cotizacion.getStats(req.user.role, req.user.id);

            // Verificar cotizaciones vencidas
            await Cotizacion.checkVencidas();

            res.json({
                success: true,
                cotizaciones,
                stats,
                filters,
                userRole: req.user.role
            });

        } catch (error) {
            console.error('Error listando cotizaciones:', error);
            res.status(500).json({
                success: false,
                message: 'Error cargando las cotizaciones'
            });
        }
    },

    // Crear nueva cotización
    createCotizacion: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const carrito = req.session.carrito || [];
            if (carrito.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El carrito está vacío'
                });
            }

            // Preparar datos de la cotización
            const cotizacionData = {
                cliente_id: req.user.role === 'cliente' ? req.user.id : req.body.cliente_id,
                empresa_cliente: req.body.empresa_cliente || req.user.empresa,
                contacto_cliente: req.body.contacto_cliente || `${req.user.nombre} ${req.user.apellido}`,
                notas: req.body.notas,
                vendedor_id: req.body.vendedor_id // Solo para admin
            };

            // Preparar detalles desde el carrito
            const detalles = carrito.map(item => ({
                equipo_id: item.equipo_id,
                cantidad: item.cantidad,
                precio_unitario: item.precio_unitario
            }));

            // Crear la cotización
            const nuevaCotizacion = await Cotizacion.create(
                cotizacionData,
                detalles,
                req.user.role,
                req.user.id
            );

            // Limpiar carrito después de crear la cotización
            req.session.carrito = [];

            console.log(`Nueva cotización creada: ${nuevaCotizacion.numero_cotizacion} por ${req.user.email}`);

            res.status(201).json({
                success: true,
                message: 'Cotización creada correctamente',
                cotizacion: nuevaCotizacion
            });

        } catch (error) {
            console.error('Error creando cotización:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error creando la cotización'
            });
        }
    },

    // Ver detalles de cotización
    showCotizacion: async (req, res) => {
        try {
            const cotizacion = await Cotizacion.findById(req.params.id);

            if (!cotizacion) {
                return res.status(404).json({
                    success: false,
                    message: 'La cotización que buscas no existe'
                });
            }

            // Verificar permisos
            if (req.user.role === 'cliente' && cotizacion.cliente_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver esta cotización'
                });
            }

            if (req.user.role === 'vendedor' && cotizacion.vendedor_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver esta cotización'
                });
            }

            res.json({
                success: true,
                cotizacion,
                userRole: req.user.role
            });

        } catch (error) {
            console.error('Error mostrando cotización:', error);
            res.status(500).json({
                success: false,
                message: 'Error cargando la cotización'
            });
        }
    },

    // Actualizar estado de cotización
    updateEstado: async (req, res) => {
        try {
            const { estado } = req.body;
            const cotizacion = await Cotizacion.findById(req.params.id);

            if (!cotizacion) {
                return res.status(404).json({ error: 'Cotización no encontrada' });
            }

            await cotizacion.updateEstado(estado, req.user.id, req.user.role);

            console.log(`Estado de cotización ${cotizacion.numero_cotizacion} cambiado a ${estado} por ${req.user.email}`);

            res.json({
                success: true,
                message: 'Estado actualizado correctamente',
                nuevo_estado: estado
            });

        } catch (error) {
            console.error('Error actualizando estado:', error);
            res.status(500).json({ error: error.message });
        }
    }
};

// Función auxiliar para calcular estadísticas del carrito
function calculateCartStats(carrito) {
    if (!carrito || carrito.length === 0) {
        return {
            items: 0,
            subtotal: 0,
            igv: 0,
            total: 0
        };
    }

    const subtotal = carrito.reduce((total, item) => {
        return total + (item.cantidad * item.precio_unitario);
    }, 0);

    const igv = subtotal * 0.18; // 18% IGV
    const total = subtotal + igv;

    return {
        items: carrito.reduce((total, item) => total + item.cantidad, 0),
        subtotal: subtotal,
        igv: igv,
        total: total
    };
}

module.exports = cotizacionController;
