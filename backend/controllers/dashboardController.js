const dashboardController = {
    // Dashboard para administradores
    adminDashboard: async (req, res) => {
        try {
            res.json({
                success: true,
                user: req.user.toSafeObject(),
                role: 'admin'
            });
        } catch (error) {
            console.error('Error en dashboard admin:', error);
            res.status(500).json({
                success: false,
                message: 'Error cargando el dashboard'
            });
        }
    },

    // Dashboard para vendedores
    vendedorDashboard: async (req, res) => {
        try {
            res.json({
                success: true,
                user: req.user.toSafeObject(),
                role: 'vendedor'
            });
        } catch (error) {
            console.error('Error en dashboard vendedor:', error);
            res.status(500).json({
                success: false,
                message: 'Error cargando el dashboard'
            });
        }
    },

    // Dashboard para clientes
    clienteDashboard: async (req, res) => {
        try {
            res.json({
                success: true,
                user: req.user.toSafeObject(),
                role: 'cliente'
            });
        } catch (error) {
            console.error('Error en dashboard cliente:', error);
            res.status(500).json({
                success: false,
                message: 'Error cargando el dashboard'
            });
        }
    },

    // Dashboard genérico (retorna info según rol)
    dashboard: async (req, res) => {
        try {
            const userRole = req.user.role;

            res.json({
                success: true,
                user: req.user.toSafeObject(),
                role: userRole,
                redirectTo: userRole === 'admin' ? '/admin/dashboard'
                    : userRole === 'vendedor' ? '/vendedor/dashboard'
                    : '/cliente/dashboard'
            });
        } catch (error) {
            console.error('Error en dashboard:', error);
            res.status(500).json({
                success: false,
                message: 'Error cargando el dashboard'
            });
        }
    }
};

module.exports = dashboardController;
