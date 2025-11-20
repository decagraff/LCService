import React from 'react';
import { Link } from 'react-router-dom';
import { Factory, Package, Zap, Target, Gem, Wrench, BarChart3, Moon, Sun, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/common/Button';

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-background-dark-secondary">
      {/* Theme toggle button - top right */}
      <button
        className="fixed top-4 right-4 z-50 p-3 rounded-lg bg-white dark:bg-background-dark-tertiary shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-gray-700" />
        )}
      </button>

      {/* Hero Section */}
      <div className="bg-white dark:bg-background-dark border-b border-gray-200 dark:border-gray-700 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Factory className="w-16 h-16 text-primary" />
            <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100">LC Service</h1>
          </div>
          <p className="text-2xl text-gray-700 dark:text-gray-300 mb-4 font-semibold">
            Sistema de Gestión de Cotizaciones para Equipos de Cocina Industrial
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            Fabricamos equipos de cocina industrial en acero inoxidable AISI 304 de la más alta calidad.
            Optimiza tu proceso de cotización con nuestra plataforma digital.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {user ? (
              <>
                <Link to={`/${user.role}/dashboard`}>
                  <Button variant="primary" size="lg">Ir al Dashboard</Button>
                </Link>
                <Link to={`/${user.role}/catalogo`}>
                  <Button variant="secondary" size="lg">Ver Catálogo</Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth/login">
                  <Button variant="primary" size="lg">Iniciar Sesión</Button>
                </Link>
                <Link to="/auth/register">
                  <Button variant="secondary" size="lg">Registrarse</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50 dark:bg-background-dark">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
            ¿Por qué elegir LC Service?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-background-dark-tertiary p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <Package className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Catálogo Digital</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Explora nuestro amplio catálogo de equipos de cocina industrial con información
                detallada de cada producto.
              </p>
            </div>

            <div className="bg-white dark:bg-background-dark-tertiary p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <Zap className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Cotización Rápida</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Genera cotizaciones en minutos. Agrega productos a tu carrito y solicita una
                cotización instantánea.
              </p>
            </div>

            <div className="bg-white dark:bg-background-dark-tertiary p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <Target className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Seguimiento en Tiempo Real</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Monitorea el estado de tus cotizaciones y pedidos desde cualquier dispositivo,
                en cualquier momento.
              </p>
            </div>

            <div className="bg-white dark:bg-background-dark-tertiary p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <Gem className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Calidad Garantizada</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Todos nuestros equipos están fabricados en acero inoxidable AISI 304,
                garantizando durabilidad y calidad.
              </p>
            </div>

            <div className="bg-white dark:bg-background-dark-tertiary p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <Wrench className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Mantenimiento</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Ofrecemos servicio de mantenimiento preventivo y correctivo para todos nuestros
                equipos.
              </p>
            </div>

            <div className="bg-white dark:bg-background-dark-tertiary p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <BarChart3 className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Reportes y Estadísticas</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Accede a reportes detallados de tus compras y cotizaciones para una mejor gestión.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-white dark:bg-background-dark border-y border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            ¿Listo para optimizar tu gestión de cotizaciones?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Únete a LC Service y transforma tu proceso de compra
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/auth/register">
              <Button variant="primary" size="lg">Comenzar Ahora</Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="secondary" size="lg">Ya tengo cuenta</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="py-12 bg-gray-50 dark:bg-background-dark">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <Factory className="w-6 h-6" />
                <h4 className="text-lg font-bold">LC Service</h4>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Equipos de cocina industrial de la más alta calidad
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">Contacto</h4>
              <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>contacto@lcservice.pe</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+51 987 654 321</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Lima, Perú</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">Horario de Atención</h4>
              <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Lunes a Viernes: 8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Sábados: 9:00 AM - 1:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              &copy; 2025 LC Service. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
