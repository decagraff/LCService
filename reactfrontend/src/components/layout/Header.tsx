import React from 'react';
import { ShoppingCart, Moon, Sun, LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  onCartToggle: () => void;
  onSidebarToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCartToggle, onSidebarToggle }) => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  if (!user) return null;

  return (
    <header className="bg-white dark:bg-background-dark border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-sm flex-shrink-0">
      {/* Izquierda: Toggle Sidebar (Móvil) */}
      <div className="flex items-center gap-4">
        <button
          onClick={onSidebarToggle}
          className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Derecha: Acciones */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Carrito */}
        <button
          onClick={onCartToggle}
          className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="Carrito de compras"
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ring-2 ring-white dark:ring-background-dark">
              {cartCount}
            </span>
          )}
        </button>

        {/* Tema */}
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden md:block"></div>

        {/* Usuario */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-none">
              {user.nombre}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-1">
              {user.role}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;