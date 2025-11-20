import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/common/Toast';
import DashboardLayout from './components/layout/DashboardLayout';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import CatalogPage from './pages/CatalogPage';
import EquipmentDetailPage from './pages/EquipmentDetailPage'; // IMPORTADO
import CotizacionesPage from './pages/CotizacionesPage';
import NewQuotePage from './pages/NewQuotePage';
import QuoteDetailPage from './pages/QuoteDetailPage';
import ErrorPage from './pages/ErrorPage';
import Loading from './components/common/Loading';

// Imports Admin/Vendedor
import UsersPage from './pages/admin/UsersPage';
import UserEditPage from './pages/admin/UserEditPage';
import EquipmentPage from './pages/admin/EquipmentPage';
import EquipmentFormPage from './pages/admin/EquipmentFormPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import CategoryFormPage from './pages/admin/CategoryFormPage';
import InventoryDashboardPage from './pages/admin/InventoryDashboardPage';
import SettingsPage from './pages/admin/SettingsPage';
import ReportsPage from './pages/admin/ReportsPage';
import VendedorInventoryPage from './pages/vendedor/VendedorInventoryPage';
import VendedorReportsPage from './pages/vendedor/VendedorReportsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading fullScreen message="Cargando..." />;
  if (!user) return <Navigate to="/auth/login" state={{ from: location }} replace />;

  return <DashboardLayout>{children}</DashboardLayout>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      {/* Rutas Protegidas */}

      {/* Comunes / Dashboard */}
      <Route path="/:role/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/:role/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* Catálogo y Productos - AHORA SÍ FUNCIONA EL CLIC */}
      <Route path="/:role/catalogo" element={<ProtectedRoute><CatalogPage /></ProtectedRoute>} />
      <Route path="/:role/catalogo/equipo/:id" element={<ProtectedRoute><EquipmentDetailPage /></ProtectedRoute>} />

      {/* Cotizaciones */}
      <Route path="/:role/cotizaciones" element={<ProtectedRoute><CotizacionesPage /></ProtectedRoute>} />
      <Route path="/:role/cotizaciones/nueva" element={<ProtectedRoute><NewQuotePage /></ProtectedRoute>} />
      <Route path="/:role/cotizaciones/:id" element={<ProtectedRoute><QuoteDetailPage /></ProtectedRoute>} />

      {/* Rutas Admin */}
      <Route path="/admin/usuarios" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
      <Route path="/admin/users/:id/edit" element={<ProtectedRoute><UserEditPage /></ProtectedRoute>} />

      <Route path="/admin/inventario" element={<ProtectedRoute><InventoryDashboardPage /></ProtectedRoute>} />
      <Route path="/admin/equipment" element={<ProtectedRoute><EquipmentPage /></ProtectedRoute>} />
      <Route path="/admin/equipment/new" element={<ProtectedRoute><EquipmentFormPage /></ProtectedRoute>} />
      <Route path="/admin/equipment/:id/edit" element={<ProtectedRoute><EquipmentFormPage /></ProtectedRoute>} />

      <Route path="/admin/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
      <Route path="/admin/categories/new" element={<ProtectedRoute><CategoryFormPage /></ProtectedRoute>} />
      <Route path="/admin/categories/:id/edit" element={<ProtectedRoute><CategoryFormPage /></ProtectedRoute>} />

      <Route path="/admin/reportes" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
      <Route path="/admin/configuracion" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

      {/* Rutas Vendedor */}
      <Route path="/vendedor/inventario" element={<ProtectedRoute><VendedorInventoryPage /></ProtectedRoute>} />
      <Route path="/vendedor/reportes" element={<ProtectedRoute><VendedorReportsPage /></ProtectedRoute>} />

      {/* Error */}
      <Route path="/error" element={<ErrorPage />} />
      <Route path="*" element={<ErrorPage status={404} />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <AppRoutes />
              <ToastContainer />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;