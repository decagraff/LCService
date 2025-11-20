import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authService } from '../services/authService';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    telefono: user?.telefono || '',
    direccion: user?.direccion || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
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

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <DashboardHeader title="Mi Perfil" subtitle="Administra tu información personal" />

      <div className="space-y-6">
        {/* Profile Form */}
        <div className="bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Información Personal
            </h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Rol: <strong>{getRoleLabel(user.role)}</strong>
            </span>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="text"
                name="nombre"
                label="Nombre Completo *"
                value={formData.nombre}
                onChange={handleChange}
                required
                fullWidth
              />

              <Input
                type="email"
                label="Correo Electrónico"
                value={user.email}
                disabled
                fullWidth
                helperText="El email no se puede modificar"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="tel"
                name="telefono"
                label="Teléfono (Opcional)"
                placeholder="+51 987 654 321"
                value={formData.telefono}
                onChange={handleChange}
                fullWidth
              />

              <Input
                type="text"
                name="direccion"
                label={user.role === 'cliente' ? 'Empresa/Restaurante' : 'Dirección'}
                placeholder={
                  user.role === 'cliente'
                    ? 'Nombre de tu restaurante/empresa'
                    : 'Av. Principal 123, Lima'
                }
                value={formData.direccion}
                onChange={handleChange}
                fullWidth
              />
            </div>

            <div className="flex gap-4 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="secondary"
                onClick={() => window.history.back()}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </div>

        {/* Account Information */}
        <div className="bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Información de la Cuenta
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <strong className="text-gray-900 dark:text-gray-100">Tipo de cuenta:</strong>
                <br />
                <span className="text-gray-600 dark:text-gray-400">
                  {getRoleLabel(user.role)}
                </span>
              </div>

              {user.created_at && (
                <div>
                  <strong className="text-gray-900 dark:text-gray-100">Miembro desde:</strong>
                  <br />
                  <span className="text-gray-600 dark:text-gray-400">
                    {new Date(user.created_at).toLocaleDateString('es-PE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}

              <div>
                <strong className="text-gray-900 dark:text-gray-100">Estado:</strong>
                <br />
                <span className="text-green-600 dark:text-green-400">● Activo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;