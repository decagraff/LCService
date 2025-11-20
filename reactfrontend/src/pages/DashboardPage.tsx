import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import VendedorDashboard from '../components/dashboard/VendedorDashboard';
import ClienteDashboard from '../components/dashboard/ClienteDashboard';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  // El componente DashboardLayout ya envuelve esto en App.tsx
  // Aquí solo devolvemos el componente específico según el rol
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'vendedor':
      return <VendedorDashboard />;
    case 'cliente':
      return <ClienteDashboard />;
    default:
      return (
        <div className="p-8 text-center text-gray-500">
          Dashboard no disponible para este rol
        </div>
      );
  }
};

export default DashboardPage;