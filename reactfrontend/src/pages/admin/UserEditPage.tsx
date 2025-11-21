import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Shield, Briefcase, User as UserIcon, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import type { User } from '../../types';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

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

  const getRoleDescription = (role: 'cliente' | 'vendedor' | 'admin') => {
    const descriptions = {
      cliente: {
        title: '👤 Cliente',
        text: 'Permisos: Ver catálogo, solicitar cotizaciones, gestionar su perfil. No tiene acceso administrativo.',
        color: 'green',
        icon: <UserIcon className="w-5 h-5" />
      },
      vendedor: {
        title: '💼 Vendedor',
        text: 'Permisos: Gestionar cotizaciones asignadas, ver inventario, acceder a estadísticas de ventas. No puede gestionar usuarios.',
        color: 'blue',
        icon: <Briefcase className="w-5 h-5" />
      },
      admin: {
        title: '👑 Administrador',
        text: 'Permisos: Acceso total al sistema, gestión de usuarios, control completo del inventario y reportes.',
        color: 'purple',
        icon: <Shield className="w-5 h-5" />
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
      <div className="flex h-96 items-center justify-center">
        <Loading message="Cargando información del usuario..." />
      </div>
    );
  }

  if (!userToEdit) return null;

  const isOwnProfile = userToEdit.id === currentUser?.id;
  const roleInfo = getRoleDescription(selectedRole);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <DashboardHeader
          title="Editar Usuario"
          subtitle={`Gestión de permisos para ${userToEdit.nombre} ${userToEdit.apellido || ''}`}
        />
        <Button
          variant="secondary"
          onClick={() => navigate('/admin/users')}
          className="self-start md:self-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Directorio
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Columna Izquierda: Formulario y Datos Principales */}
        <div className="lg:col-span-2 space-y-6">

          {/* Tarjeta de Información */}
          <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-primary" />
                Información Personal
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Nombre Completo</label>
                <p className="text-gray-900 dark:text-gray-100 font-medium mt-1">{userToEdit.nombre} {userToEdit.apellido}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Correo Electrónico</label>
                <p className="text-gray-900 dark:text-gray-100 font-medium mt-1">{userToEdit.email}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Teléfono</label>
                <p className="text-gray-900 dark:text-gray-100 font-medium mt-1">{userToEdit.telefono || 'No registrado'}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Empresa</label>
                <p className="text-gray-900 dark:text-gray-100 font-medium mt-1">{userToEdit.empresa || 'No registrada'}</p>
              </div>
            </div>
          </div>

          {/* Tarjeta de Gestión de Roles */}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Permisos y Roles
              </h2>
            </div>

            <div className="p-6">
              {isOwnProfile && (
                <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-yellow-800 dark:text-yellow-200 text-sm">Acción Restringida</h4>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                      Por seguridad, no puedes modificar tu propio rol de administrador desde esta pantalla.
                    </p>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Asignar Rol
                </label>
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'cliente' | 'vendedor' | 'admin')}
                  disabled={isOwnProfile}
                  className="block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-background-dark-tertiary text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <option value="cliente">👤 Cliente</option>
                  <option value="vendedor">💼 Vendedor</option>
                  <option value="admin">👑 Administrador</option>
                </select>
              </div>

              {/* Descripción Dinámica del Rol */}
              <div className={`rounded-lg p-4 border transition-colors duration-300 flex gap-4
                ${selectedRole === 'admin' ? 'bg-purple-50 border-purple-200 text-purple-900 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-100' :
                  selectedRole === 'vendedor' ? 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100' :
                    'bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-100'
                }`}>
                <div className="mt-1">{roleInfo.icon}</div>
                <div>
                  <h4 className="font-bold mb-1">{roleInfo.title}</h4>
                  <p className="text-sm opacity-90">{roleInfo.text}</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-background-dark-tertiary border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/admin/users')}
              >
                Cancelar
              </Button>
              {!isOwnProfile && (
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Columna Derecha: Historial y Estado */}
        <div className="space-y-6">

          {/* Estado de Cuenta */}
          <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Estado de Cuenta
            </h3>

            <div className="flex items-center gap-3 mb-4">
              <div className={`w-3 h-3 rounded-full ${userToEdit.estado === 'activo' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                {userToEdit.estado || 'Activo'}
              </span>
            </div>

            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex justify-between">
                <span>ID Usuario:</span>
                <span className="font-mono">#{userToEdit.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Registrado:</span>
                <span>{new Date(userToEdit.created_at).toLocaleDateString('es-PE')}</span>
              </div>
              <div className="flex justify-between">
                <span>Actualizado:</span>
                <span>{new Date(userToEdit.updated_at).toLocaleDateString('es-PE')}</span>
              </div>
            </div>
          </div>

          {/* Capacidades del Rol */}
          <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Capacidades Actuales
            </h3>
            <ul className="space-y-2">
              {getRoleActivity(userToEdit.role).map((activity, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className="text-primary mt-1">•</span>
                  {activity}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserEditPage;