const User = require('../models/User');

// Helper para detectar si es una petición de API
const isApiRequest = (req) => {
    return req.xhr ||
           req.headers.accept?.includes('application/json') ||
           req.path.startsWith('/api/') ||
           req.path.includes('/api/') ||
           req.headers['content-type']?.includes('application/json');
};

// Middleware para verificar autenticación
const requireAuth = async (req, res, next) => {
    try {
        if (!req.session.userId) {
            // Para APIs, devolver JSON con 401
            if (isApiRequest(req)) {
                return res.status(401).json({
                    success: false,
                    error: 'No autenticado',
                    message: 'Debe iniciar sesión para acceder a este recurso'
                });
            }
            return res.redirect('/auth/login');
        }

        // Verificar que el usuario aún existe y está activo
        const user = await User.findById(req.session.userId);
        if (!user) {
            req.session.destroy();
            // Para APIs, devolver JSON con 401
            if (isApiRequest(req)) {
                return res.status(401).json({
                    success: false,
                    error: 'Sesión inválida',
                    message: 'Su sesión ha expirado, por favor inicie sesión nuevamente'
                });
            }
            return res.redirect('/auth/login');
        }

        // Agregar usuario a la request
        req.user = user;
        res.locals.user = user.toSafeObject();

        next();
    } catch (error) {
        console.error('Error en middleware de autenticación:', error);
        req.session.destroy();
        // Para APIs, devolver JSON con 500
        if (isApiRequest(req)) {
            return res.status(500).json({
                success: false,
                error: 'Error de autenticación',
                message: 'Error interno del servidor'
            });
        }
        res.redirect('/auth/login');
    }
};

// Middleware para verificar que NO esté autenticado (para login/register)
const requireGuest = (req, res, next) => {
    if (req.session.userId) {
        // Para APIs, permitir el acceso (o devolver info del usuario)
        if (isApiRequest(req)) {
            // En APIs de login/register, si ya está autenticado, devolver error
            return res.status(400).json({
                success: false,
                error: 'Ya autenticado',
                message: 'Ya tiene una sesión activa'
            });
        }
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

// Middleware para API - retorna JSON en lugar de redirect
const requireAuthApi = async (req, res, next) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                error: 'No autenticado'
            });
        }

        // Verificar que el usuario aún existe y está activo
        const user = await User.findById(req.session.userId);
        if (!user) {
            req.session.destroy();
            return res.status(401).json({
                success: false,
                error: 'Sesión inválida'
            });
        }

        // Agregar usuario a la request
        req.user = user;
        next();
    } catch (error) {
        console.error('Error en middleware de autenticación API:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};


// Middleware para verificar si hay sesión activa (no falla si no hay)
const checkAuth = async (req, res, next) => {
    try {
        if (req.session.userId) {
            const user = await User.findById(req.session.userId);
            if (user) {
                req.user = user;
            }
        }
        next();
    } catch (error) {
        console.error('Error en checkAuth:', error);
        next();
    }
};

module.exports = {
    requireAuth,
    requireGuest,
    requireRole,
    requireAdmin,
    requireVendedor,
    requireAuthApi,
    checkAuth
};
