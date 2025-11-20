import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

interface DashboardHeaderProps {
  title: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title }) => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Sesión cerrada exitosamente', 'success');
      navigate('/auth/login');
    } catch (error) {
      showToast('Error al cerrar sesión', 'error');
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

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4
                       mb-8 pb-5 border-b border-gray-200 dark:border-gray-700">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        {title}
      </h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Bienvenido, <strong className="text-gray-900 dark:text-gray-100">{user?.nombre}</strong>
          {' '}({getRoleLabel(user?.role || '')})
        </span>
        <Button variant="secondary" size="sm" onClick={handleLogout}>
          Cerrar Sesión
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
