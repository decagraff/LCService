import React from 'react';
import { Link } from 'react-router-dom';
import { Factory, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Footer: React.FC = () => {
  const { user } = useAuth();

  return (
    <footer className="bg-white dark:bg-background-dark border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Factory className="w-6 h-6" />
              <h4 className="text-lg font-bold">LC Service</h4>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Equipos de cocina industrial de la más alta calidad
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Enlaces</h4>
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors text-sm"
              >
                Inicio
              </Link>
              {user && (
                <>
                  <Link
                    to={`/${user.role}/catalogo`}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    Catálogo
                  </Link>
                  <Link
                    to={`/${user.role}/cotizaciones`}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors text-sm"
                  >
                    Cotizaciones
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Contacto</h4>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <span>contacto@lcservice.pe</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                <span>+51 987 654 321</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>Lima, Perú</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; 2025 LC Service. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
