import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/common/Toast';
import MainLayout from './components/layout/MainLayout';
import VendedorInventoryPage from './pages/vendedor/VendedorInventoryPage';
import VendedorReportsPage from './pages/vendedor/VendedorReportsPage';
import QuoteDetailPage from './pages/QuoteDetailPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/admin/SettingsPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import CatalogPage from './pages/CatalogPage';
import CotizacionesPage from './pages/CotizacionesPage';
import NewQuotePage from './pages/NewQuotePage';
import UsersPage from './pages/admin/UsersPage';
import UserEditPage from './pages/admin/UserEditPage';
import EquipmentPage from './pages/admin/EquipmentPage';
import EquipmentFormPage from './pages/admin/EquipmentFormPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import CategoryFormPage from './pages/admin/CategoryFormPage';
import InventoryDashboardPage from './pages/admin/InventoryDashboardPage';
import ErrorPage from './pages/ErrorPage';
import Loading from './components/common/Loading';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading fullScreen message="Cargando..." />;
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
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
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/perfil"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:id/edit"
        element={
          <ProtectedRoute>
            <UserEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory"
        element={
          <ProtectedRoute>
            <InventoryDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/equipment"
        element={
          <ProtectedRoute>
            <EquipmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/equipment/new"
        element={
          <ProtectedRoute>
            <EquipmentFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/equipment/:id/edit"
        element={
          <ProtectedRoute>
            <EquipmentFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute>
            <CategoriesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories/new"
        element={
          <ProtectedRoute>
            <CategoryFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories/:id/edit"
        element={
          <ProtectedRoute>
            <CategoryFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/catalogo"
        element={
          <ProtectedRoute>
            <CatalogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/cotizaciones"
        element={
          <ProtectedRoute>
            <CotizacionesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/cotizaciones/nueva"
        element={
          <ProtectedRoute>
            <NewQuotePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/cotizaciones/:id"
        element={
          <ProtectedRoute>
            <QuoteDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/configuracion"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Vendedor */}
      <Route
        path="/vendedor/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendedor/perfil"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendedor/catalogo"
        element={
          <ProtectedRoute>
            <CatalogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendedor/cotizaciones"
        element={
          <ProtectedRoute>
            <CotizacionesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendedor/cotizaciones/nueva"
        element={
          <ProtectedRoute>
            <NewQuotePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vendedor/cotizaciones/:id"
        element={
          <ProtectedRoute>
            <QuoteDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendedor/inventario"
        element={
          <ProtectedRoute>
            <VendedorInventoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendedor/reportes"
        element={
          <ProtectedRoute>
            <VendedorReportsPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Cliente */}
      <Route
        path="/cliente/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cliente/perfil"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cliente/catalogo"
        element={
          <ProtectedRoute>
            <CatalogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cliente/cotizaciones"
        element={
          <ProtectedRoute>
            <CotizacionesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cliente/cotizaciones/nueva"
        element={
          <ProtectedRoute>
            <NewQuotePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cliente/cotizaciones/:id"
        element={
          <ProtectedRoute>
            <QuoteDetailPage />
          </ProtectedRoute>
        }
      />

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
