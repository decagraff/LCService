import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import Button from '../components/common/Button';

interface ErrorPageProps {
  status?: number;
  title?: string;
  message?: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  status = 404,
  title,
  message
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Try to get error details from location state
  const errorState = location.state as { status?: number; title?: string; message?: string } | null;
  const errorStatus = errorState?.status || status;
  const errorTitle = errorState?.title || title || getDefaultTitle(errorStatus);
  const errorMessage = errorState?.message || message || getDefaultMessage(errorStatus);

  function getDefaultTitle(statusCode: number): string {
    switch (statusCode) {
      case 404:
        return 'Página no encontrada';
      case 403:
        return 'Acceso denegado';
      case 500:
        return 'Error del servidor';
      default:
        return 'Error';
    }
  }

  function getDefaultMessage(statusCode: number): string {
    switch (statusCode) {
      case 404:
        return 'Lo sentimos, la página que buscas no existe o ha sido movida.';
      case 403:
        return 'No tienes permisos para acceder a esta página.';
      case 500:
        return 'Algo salió mal en nuestro servidor. Por favor, intenta nuevamente más tarde.';
      default:
        return 'Ha ocurrido un error inesperado.';
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background-dark-secondary px-4">
      <div className="text-center max-w-md w-full bg-white dark:bg-background-dark rounded-lg shadow-lg p-8">
        {/* Error Icon */}
        <div className="mb-6">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto" />
        </div>

        {/* Error Status */}
        <h1 className="text-6xl font-bold text-red-500 dark:text-red-400 mb-4">
          {errorStatus}
        </h1>

        {/* Error Title */}
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {errorTitle}
        </h2>

        {/* Error Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {errorMessage}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="secondary"
            className="flex items-center justify-center gap-2"
          >
            Volver atrás
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Si el problema persiste, por favor contacta a soporte.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
