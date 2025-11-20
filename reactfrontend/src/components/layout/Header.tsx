import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Factory, ShoppingCart, User, Moon, Sun, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../common/Button';

interface HeaderProps {
  onCartToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCartToggle }) => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (!user) return null;

  const getNavLinks = () => {
    const baseLinks = [
      { to: `/${user.role}/dashboard`, label: 'Dashboard' },
      { to: `/${user.role}/catalogo`, label: 'Catálogo' },
    ];

    if (user.role === 'admin') {
      return [
        ...baseLinks,
        { to: '/admin/inventario', label: 'Inventario' },
        { to: '/admin/usuarios', label: 'Usuarios' },
        { to: '/admin/cotizaciones', label: 'Cotizaciones' },
      ];
    }

    if (user.role === 'vendedor') {
      return [
        ...baseLinks,
        { to: '/vendedor/cotizaciones', label: 'Mis Cotizaciones' },
        { to: '/vendedor/reportes', label: 'Mis Ventas' },
      ];
    }

    if (user.role === 'cliente') {
      return [
        ...baseLinks,
        { to: '/cliente/cotizaciones', label: 'Mis Cotizaciones' },
      ];
    }

    return baseLinks;
  };

  return (
    <header className="bg-white dark:bg-background-dark border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to={`/${user.role}/dashboard`}
            className="flex items-center gap-2 text-primary hover:text-blue-700 transition-colors"
          >
            <Factory className="w-6 h-6" />
            <h2 className="text-xl font-bold">LC Service</h2>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            {/* Nav Links */}
            {getNavLinks().map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}

            {/* Cart button */}
            <button
              onClick={onCartToggle}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Carrito de compras"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User info */}
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <User className="w-4 h-4" />
              <span className="text-sm">
                {user.nombre} <span className="text-gray-500">({user.role})</span>
              </span>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            {/* Logout */}
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" />
              Cerrar Sesión
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
