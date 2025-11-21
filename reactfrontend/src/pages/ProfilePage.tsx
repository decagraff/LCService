import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authService } from '../services/authService';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import {
  User,
  Calendar,
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  FileText,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';

interface UserStats {
  cotizaciones_total?: number;
  cotizaciones_aprobadas?: number;
  cotizaciones_pendientes?: number;
  ventas_total?: number;
}

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [stats, setStats] = useState<UserStats>({});
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');

  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    telefono: user?.telefono || '',
    direccion: user?.direccion || '',
    empresa: user?.empresa || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    // Fetch user stats
    const fetchStats = async () => {
      try {
        const response = await fetch(`/${user?.role}/api/profile/stats`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch {
        // Stats are optional, don't show error
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      setLoading(true);
      const updatedUser = await authService.updateProfile(user.id, formData);
      updateUser(updatedUser);
      showToast('Perfil actualizado correctamente', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Error al actualizar perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Las contraseñas no coinciden', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    try {
      setLoadingPassword(true);
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      showToast('Contraseña actualizada correctamente', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Error al cambiar contraseña', 'error');
    } finally {
      setLoadingPassword(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'vendedor':
        return 'Vendedor';
      case 'cliente':
        return 'Cliente';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'vendedor':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cliente':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getInitials = (nombre: string, apellido?: string) => {
    const first = nombre?.charAt(0) || '';
    const second = apellido?.charAt(0) || nombre?.charAt(1) || '';
    return (first + second).toUpperCase();
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto">
      <DashboardHeader title="Mi Perfil" subtitle="Administra tu información personal y seguridad" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Profile Header with Gradient */}
            <div className="h-24 bg-gradient-to-r from-primary-500 to-primary-700 relative">
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {getInitials(user.nombre, user.apellido)}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="pt-14 pb-6 px-6 text-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {user.nombre} {user.apellido || ''}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{user.email}</p>

              <div className="mt-3">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                  <Shield className="w-3.5 h-3.5" />
                  {getRoleLabel(user.role)}
                </span>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  {user.role === 'cliente' && (
                    <>
                      <div className="text-center">
                        <div className="flex items-center justify-center w-10 h-10 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {stats.cotizaciones_total || 0}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Cotizaciones</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center w-10 h-10 mx-auto bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {stats.cotizaciones_aprobadas || 0}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Aprobadas</p>
                      </div>
                    </>
                  )}
                  {(user.role === 'vendedor' || user.role === 'admin') && (
                    <>
                      <div className="text-center">
                        <div className="flex items-center justify-center w-10 h-10 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {stats.cotizaciones_total || 0}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Cotizaciones</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center w-10 h-10 mx-auto bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                          S/. {(stats.ventas_total || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Ventas</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Member Since */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  Miembro desde {user.created_at && new Date(user.created_at).toLocaleDateString('es-PE', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'info'
                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-primary-50/50 dark:bg-primary-900/10'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <User className="w-4 h-4" />
                  Información Personal
                </div>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'security'
                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-primary-50/50 dark:bg-primary-900/10'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" />
                  Seguridad
                </div>
              </button>
            </div>

            {/* Info Tab */}
            {activeTab === 'info' && (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    type="text"
                    name="nombre"
                    label="Nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                  <Input
                    type="text"
                    name="apellido"
                    label="Apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    fullWidth
                  />
                </div>

                <Input
                  type="email"
                  label="Correo Electrónico"
                  value={user.email}
                  disabled
                  fullWidth
                  helperText="El email no se puede modificar"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    type="tel"
                    name="telefono"
                    label="Teléfono"
                    placeholder="+51 987 654 321"
                    value={formData.telefono}
                    onChange={handleChange}
                    fullWidth
                  />

                  {user.role === 'cliente' ? (
                    <Input
                      type="text"
                      name="empresa"
                      label="Empresa / Restaurante"
                      placeholder="Nombre de tu negocio"
                      value={formData.empresa}
                      onChange={handleChange}
                      fullWidth
                    />
                  ) : (
                    <Input
                      type="text"
                      name="direccion"
                      label="Dirección"
                      placeholder="Av. Principal 123, Lima"
                      value={formData.direccion}
                      onChange={handleChange}
                      fullWidth
                    />
                  )}
                </div>

                {user.role === 'cliente' && (
                  <Input
                    type="text"
                    name="direccion"
                    label="Dirección de Entrega"
                    placeholder="Av. Principal 123, Lima"
                    value={formData.direccion}
                    onChange={handleChange}
                    fullWidth
                  />
                )}

                <div className="flex gap-4 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </form>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <form onSubmit={handlePasswordSubmit} className="p-6 space-y-6">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Para cambiar tu contraseña, ingresa tu contraseña actual y luego la nueva contraseña.
                  </p>
                </div>

                <div className="relative">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    label="Contraseña Actual"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    fullWidth
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    label="Nueva Contraseña"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    fullWidth
                    helperText="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <Input
                  type="password"
                  name="confirmPassword"
                  label="Confirmar Nueva Contraseña"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  fullWidth
                />

                <div className="flex gap-4 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button type="submit" variant="primary" disabled={loadingPassword}>
                    {loadingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Account Status Card */}
          <div className="bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Estado de la Cuenta
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-gray-700 dark:text-gray-300">Cuenta activa</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Última actualización: {user.updated_at
                  ? new Date(user.updated_at).toLocaleDateString('es-PE')
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
