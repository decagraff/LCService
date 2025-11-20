import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/dashboard/Sidebar';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import VendedorDashboard from '../components/dashboard/VendedorDashboard';
import ClienteDashboard from '../components/dashboard/ClienteDashboard';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'vendedor':
        return <VendedorDashboard />;
      case 'cliente':
        return <ClienteDashboard />;
      default:
        return <div className="p-8 text-center">Dashboard no disponible para este rol</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark-secondary">
      <Sidebar />
      {renderDashboard()}
    </div>
  );
};

export default DashboardPage;
