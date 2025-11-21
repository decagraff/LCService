import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Factory, Moon, Sun, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles: UserRole[];
}

const navigationItems: NavItem[] = [
  // Admin
  { label: 'Dashboard', path: '/admin/dashboard', icon: '📊', roles: ['admin'] },
  { label: 'Usuarios', path: '/admin/users', icon: '👥', roles: ['admin'] },
  { label: 'Inventario', path: '/admin/inventario', icon: '📦', roles: ['admin'] },
  { label: 'Cotizaciones', path: '/admin/cotizaciones', icon: '💰', roles: ['admin'] },
  { label: 'Reportes', path: '/admin/reportes', icon: '📈', roles: ['admin'] },
  { label: 'Configuración', path: '/admin/configuracion', icon: '⚙️', roles: ['admin'] },

  // Vendedor
  { label: 'Dashboard', path: '/vendedor/dashboard', icon: '📊', roles: ['vendedor'] },
  { label: 'Mis Cotizaciones', path: '/vendedor/cotizaciones', icon: '💰', roles: ['vendedor'] },
  { label: 'Inventario', path: '/vendedor/inventario', icon: '📦', roles: ['vendedor'] },
  { label: 'Mis Ventas', path: '/vendedor/reportes', icon: '📈', roles: ['vendedor'] },
  { label: 'Mi Perfil', path: '/vendedor/perfil', icon: '👤', roles: ['vendedor'] },

  // Cliente
  { label: 'Dashboard', path: '/cliente/dashboard', icon: '📊', roles: ['cliente'] },
  { label: 'Catálogo', path: '/cliente/catalogo', icon: '📦', roles: ['cliente'] },
  { label: 'Mis Cotizaciones', path: '/cliente/cotizaciones', icon: '💰', roles: ['cliente'] },
  { label: 'Mi Perfil', path: '/cliente/perfil', icon: '👤', roles: ['cliente'] },
];

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const filteredNav = navigationItems.filter(item =>
    user && item.roles.includes(user.role)
  );

  return (
    <aside
      className={`
        bg-white dark:bg-background-dark border-r border-gray-200 dark:border-gray-700
        transition-all duration-300 relative z-20
        h-screen sticky top-0 flex flex-col flex-shrink-0
        ${collapsed ? 'w-[70px]' : 'w-[260px]'}
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-[12px] top-8 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 
                   text-gray-500 dark:text-gray-400 rounded-full flex items-center justify-center 
                   hover:text-primary transition-colors shadow-sm z-30"
        title={collapsed ? 'Expandir' : 'Contraer'}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Header */}
      <div className="flex flex-col justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700 mb-2 flex-shrink-0">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Factory className="w-6 h-6 text-primary" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">LC Service</h2>
            </div>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Factory className="w-6 h-6 text-primary" />
          </div>
        )}
      </div>

      {/* Navigation (Scrollable) */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin">
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group
                ${collapsed ? 'justify-center' : ''}
                ${isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-primary'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                }
              `}
              title={collapsed ? item.label : undefined}
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
              {!collapsed && <span className="font-medium text-sm truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer (User Info Mini) */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        {!collapsed && (
          <div className="text-xs text-center text-gray-400">
            v1.0.0
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;