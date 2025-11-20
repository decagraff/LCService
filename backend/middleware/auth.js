const User = require('../models/User');

// Middleware para verificar autenticación
const requireAuth = async (req, res, next) => {
    try {
        if (!req.session.userId) {
            return res.redirect('/auth/login');
        }

        // Verificar que el usuario aún existe y está activo
        const user = await User.findById(req.session.userId);
        if (!user) {
            req.session.destroy();
            return res.redirect('/auth/login');
        }

        // Agregar usuario a la request
        req.user = user;
        res.locals.user = user.toSafeObject();
        
        next();
    } catch (error) {
        console.error('Error en middleware de autenticación:', error);
        req.session.destroy();
        res.redirect('/auth/login');
    }
};

// Middleware para verificar que NO esté autenticado (para login/register)
const requireGuest = (req, res, next) => {
    if (req.session.userId) {
        return res.redirect('/dashboard');
    }
    next();
};

// Middleware para verificar roles específicos
const requireRole = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'No autenticado' });
            }

            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({ error: 'No tienes permisos para acceder a esta sección' });
            }

            next();
        } catch (error) {
            console.error('Error en middleware de roles:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    };
};

// Middleware para verificar que sea admin
const requireAdmin = requireRole('admin');

// Middleware para verificar que sea vendedor o admin
const requireVendedor = requireRole('vendedor', 'admin');

module.exports = {
    requireAuth,
    requireGuest,
    requireRole,
    requireAdmin,
    requireVendedor
};