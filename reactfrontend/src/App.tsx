import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/common/Toast';
import MainLayout from './components/layout/MainLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import CatalogPage from './pages/CatalogPage';
import CotizacionesPage from './pages/CotizacionesPage';
import NewQuotePage from './pages/NewQuotePage';
import QuoteDetailPage from './pages/QuoteDetailPage';
import EquipmentDetailPage from './pages/EquipmentDetailPage'; // IMPORTADO
import ErrorPage from './pages/ErrorPage';
import Loading from './components/common/Loading';

// Admin Pages
import UsersPage from './pages/admin/UsersPage';
import UserEditPage from './pages/admin/UserEditPage';
import EquipmentPage from './pages/admin/EquipmentPage';
import EquipmentFormPage from './pages/admin/EquipmentFormPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import CategoryFormPage from './pages/admin/CategoryFormPage';
import InventoryDashboardPage from './pages/admin/InventoryDashboardPage';
import ReportsPage from './pages/admin/ReportsPage';
import SettingsPage from './pages/admin/SettingsPage';

// Vendedor Pages
import VendedorInventoryPage from './pages/vendedor/VendedorInventoryPage';
import VendedorReportsPage from './pages/vendedor/VendedorReportsPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading fullScreen message="Cargando..." />;
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return <>{children}</>;
};

// App Routes Component
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      {/* Protected Routes - Admin */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="perfil" element={<ProfilePage />} />

        <Route path="users" element={<UsersPage />} />
        <Route path="users/:id/edit" element={<UserEditPage />} />

        <Route path="inventory" element={<InventoryDashboardPage />} />
        <Route path="equipment" element={<EquipmentPage />} />
        <Route path="equipment/new" element={<EquipmentFormPage />} />
        <Route path="equipment/:id/edit" element={<EquipmentFormPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="categories/new" element={<CategoryFormPage />} />
        <Route path="categories/:id/edit" element={<CategoryFormPage />} />

        <Route path="catalogo" element={<CatalogPage />} />
        {/* RUTA DETALLE (Admin) */}
        <Route path="catalogo/equipo/:id" element={<EquipmentDetailPage />} />

        <Route path="cotizaciones" element={<CotizacionesPage />} />
        <Route path="cotizaciones/nueva" element={<NewQuotePage />} />
        <Route path="cotizaciones/:id" element={<QuoteDetailPage />} />

        <Route path="configuracion" element={<SettingsPage />} />
        <Route path="reportes" element={<ReportsPage />} />
      </Route>

      {/* Protected Routes - Vendedor */}
      <Route path="/vendedor" element={<ProtectedRoute allowedRoles={['vendedor']}><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/vendedor/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="perfil" element={<ProfilePage />} />

        <Route path="catalogo" element={<CatalogPage />} />
        {/* RUTA DETALLE (Vendedor) */}
        <Route path="catalogo/equipo/:id" element={<EquipmentDetailPage />} />

        <Route path="cotizaciones" element={<CotizacionesPage />} />
        <Route path="cotizaciones/nueva" element={<NewQuotePage />} />
        <Route path="cotizaciones/:id" element={<QuoteDetailPage />} />

        <Route path="inventario" element={<VendedorInventoryPage />} />
        <Route path="reportes" element={<VendedorReportsPage />} />
      </Route>

      {/* Protected Routes - Cliente */}
      <Route path="/cliente" element={<ProtectedRoute allowedRoles={['cliente']}><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/cliente/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="perfil" element={<ProfilePage />} />

        <Route path="catalogo" element={<CatalogPage />} />
        {/* RUTA DETALLE (Cliente) */}
        <Route path="catalogo/equipo/:id" element={<EquipmentDetailPage />} />

        <Route path="cotizaciones" element={<CotizacionesPage />} />
        <Route path="cotizaciones/nueva" element={<NewQuotePage />} />
        <Route path="cotizaciones/:id" element={<QuoteDetailPage />} />
      </Route>

      {/* Error Page */}
      <Route path="/error" element={<ErrorPage />} />

      {/* Catch all - 404 */}
      <Route path="*" element={<ErrorPage status={404} />} />
    </Routes>
  );
};

// Main App Component
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