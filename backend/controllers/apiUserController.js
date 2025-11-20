const User = require('../models/User');

const apiUserController = {
  // Get all users (admin only)
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll();

      return res.json({
        success: true,
        data: users.map(user => user.toSafeObject())
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener usuarios'
      });
    }
  },

  // Get single user by ID (admin only)
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      return res.json({
        success: true,
        data: user.toSafeObject()
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener usuario'
      });
    }
  },

  // Update user role (admin only)
  updateUserRole: async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      // Validate role
      const validRoles = ['cliente', 'vendedor', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Rol inválido'
        });
      }

      // Prevent admin from changing their own role
      if (parseInt(id) === req.user.id && role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'No puedes cambiar tu propio rol de administrador'
        });
      }

      // Update role
      const updatedUser = await User.updateRole(id, role);

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      console.log(`✅ Admin ${req.user.email} changed role of ${updatedUser.email} to ${role}`);

      return res.json({
        success: true,
        data: updatedUser.toSafeObject(),
        message: 'Rol actualizado correctamente'
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al actualizar rol'
      });
    }
  },

  // Get user statistics (admin only)
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

      return res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting stats:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener estadísticas'
      });
    }
  }
};

module.exports = apiUserController;
