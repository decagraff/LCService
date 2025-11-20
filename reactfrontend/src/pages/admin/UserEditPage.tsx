import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Activity } from 'lucide-react';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import type { User } from '../../types';
import Sidebar from '../../components/dashboard/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Button from '../../components/common/Button';

const UserEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<'cliente' | 'vendedor' | 'admin'>('cliente');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const userData = await userService.getUserById(parseInt(id));
        setUserToEdit(userData);
        setSelectedRole(userData.role as 'cliente' | 'vendedor' | 'admin');
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Error al cargar usuario', 'error');
        navigate('/admin/users');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userToEdit) return;

    // Prevent admin from changing their own role
    if (userToEdit.id === currentUser?.id && selectedRole !== 'admin') {
      showToast('No puedes cambiar tu propio rol de administrador', 'warning');
      return;
    }

    try {
      setSaving(true);
      await userService.updateUserRole(userToEdit.id, { role: selectedRole });
      showToast('Rol actualizado correctamente', 'success');
      navigate('/admin/users');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Error al actualizar rol', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: { emoji: '👑', text: 'Administrador', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      vendedor: { emoji: '💼', text: 'Vendedor', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      cliente: { emoji: '👤', text: 'Cliente', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }
    };
    const badge = badges[role as keyof typeof badges] || badges.cliente;
    return (
      <span className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium ${badge.className}`}>
        <span>{badge.emoji}</span>
        <span>{badge.text}</span>
      </span>
    );
  };

  const getRoleDescription = (role: 'cliente' | 'vendedor' | 'admin') => {
    const descriptions = {
      cliente: {
        title: '👤 Cliente',
        text: 'Permisos: Ver catálogo, solicitar cotizaciones, gestionar su perfil. No tiene acceso administrativo.',
        color: 'green'
      },
      vendedor: {
        title: '💼 Vendedor',
        text: 'Permisos: Gestionar cotizaciones asignadas, ver inventario, acceder a estadísticas de ventas. No puede gestionar usuarios.',
        color: 'blue'
      },
      admin: {
        title: '👑 Administrador',
        text: 'Permisos: Acceso total al sistema, gestión de usuarios, control completo del inventario y reportes.',
        color: 'yellow'
      }
    };
    return descriptions[role];
  };

  const getRoleActivity = (role: string) => {
    const activities = {
      cliente: [
        'Puede ver catálogo de productos',
        'Puede solicitar cotizaciones',
        'Solo ve sus propias cotizaciones'
      ],
      vendedor: [
        'Gestiona cotizaciones asignadas',
        'Ve inventario (solo lectura)',
        'Acceso a sus estadísticas'
      ],
      admin: [
        'Acceso total al sistema',
        'Gestiona todos los usuarios',
        'Control completo del inventario'
      ]
    };
    return activities[role as keyof typeof activities] || activities.cliente;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark-secondary">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!userToEdit) {
    return null;
  }

  const isOwnProfile = userToEdit.id === currentUser?.id;
  const roleInfo = getRoleDescription(selectedRole);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark-secondary">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <DashboardHeader title="Editar Usuario" />

        <main className="flex-1 p-6">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link to="/admin/users" className="text-primary hover:underline">
              Usuarios
            </Link>
            <span>/</span>
            <span>Editar: {userToEdit.nombre} {userToEdit.apellido}</span>
          </div>

          {/* User Information Card */}
          <div className="bg-white dark:bg-background-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Información del Usuario</h2>
              {getRoleBadge(userToEdit.role)}
            </div>

            <div className="p-6">
              {/* Basic Info */}
              <div className="bg-gray-50 dark:bg-background-dark-tertiary rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <span>📋</span> Datos Básicos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <strong className="text-gray-700 dark:text-gray-300">Nombre completo:</strong>
                    <p className="text-gray-600 dark:text-gray-400">{userToEdit.nombre} {userToEdit.apellido}</p>
                  </div>
                  <div>
                    <strong className="text-gray-700 dark:text-gray-300">Email:</strong>
                    <p className="text-gray-600 dark:text-gray-400">{userToEdit.email}</p>
                  </div>
                  <div>
                    <strong className="text-gray-700 dark:text-gray-300">Teléfono:</strong>
                    <p className="text-gray-600 dark:text-gray-400">{userToEdit.telefono || 'No especificado'}</p>
                  </div>
                  <div>
                    <strong className="text-gray-700 dark:text-gray-300">Empresa:</strong>
                    <p className="text-gray-600 dark:text-gray-400">{userToEdit.empresa || 'No especificado'}</p>
                  </div>
                  <div>
                    <strong className="text-gray-700 dark:text-gray-300">Registro:</strong>
                    <p className="text-gray-600 dark:text-gray-400">{new Date(userToEdit.created_at).toLocaleDateString('es-PE')}</p>
                  </div>
                  <div>
                    <strong className="text-gray-700 dark:text-gray-300">Estado:</strong>
                    <p className="text-green-600 dark:text-green-400">● {userToEdit.estado}</p>
                  </div>
                </div>
              </div>

              {/* Role Management Form */}
              <form onSubmit={handleSubmit}>
                <div className="bg-white dark:bg-background-dark border-2 border-primary rounded-lg p-6">
                  <h3 className="text-lg font-medium text-primary mb-4 flex items-center gap-2">
                    <span>🔐</span> Gestión de Roles
                  </h3>

                  {isOwnProfile && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 rounded-lg p-4 mb-4">
                      <p className="flex items-center gap-2">
                        <span>⚠️</span>
                        <strong>Advertencia:</strong> No puedes cambiar tu propio rol de administrador por seguridad.
                      </p>
                    </div>
                  )}

                  <div className="mb-4">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Seleccionar nuevo rol *
                    </label>
                    <select
                      id="role"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as 'cliente' | 'vendedor' | 'admin')}
                      disabled={isOwnProfile}
                      className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-tertiary text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="cliente">👤 Cliente</option>
                      <option value="vendedor">💼 Vendedor</option>
                      <option value="admin">👑 Administrador</option>
                    </select>
                  </div>

                  {/* Role Description */}
                  <div className={`bg-${roleInfo.color}-50 dark:bg-${roleInfo.color}-900/20 rounded-lg p-4`}>
                    <h4 className={`text-${roleInfo.color}-900 dark:text-${roleInfo.color}-200 font-medium mb-2`}>
                      {roleInfo.title}
                    </h4>
                    <p className={`text-${roleInfo.color}-700 dark:text-${roleInfo.color}-300 text-sm`}>
                      {roleInfo.text}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end mt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/admin/users')}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a Usuarios
                  </Button>
                  {!isOwnProfile && (
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={saving}
                    >
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white dark:bg-background-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Información Adicional</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Activity */}
                <div className="bg-gray-50 dark:bg-background-dark-tertiary rounded-lg p-6">
                  <h4 className="text-gray-900 dark:text-gray-100 font-medium mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Actividad
                  </h4>
                  <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-2">
                    {getRoleActivity(userToEdit.role).map((activity, index) => (
                      <li key={index}>• {activity}</li>
                    ))}
                  </ul>
                </div>

                {/* History */}
                <div className="bg-gray-50 dark:bg-background-dark-tertiary rounded-lg p-6">
                  <h4 className="text-gray-900 dark:text-gray-100 font-medium mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Historial
                  </h4>
                  <div className="text-gray-600 dark:text-gray-400 text-sm space-y-2">
                    <p>
                      <strong>Creado:</strong> {new Date(userToEdit.created_at).toLocaleString('es-PE')}
                    </p>
                    <p>
                      <strong>Actualizado:</strong> {new Date(userToEdit.updated_at).toLocaleString('es-PE')}
                    </p>
                    <p>
                      <strong>ID:</strong> #{userToEdit.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserEditPage;