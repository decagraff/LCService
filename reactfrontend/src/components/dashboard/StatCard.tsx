import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number; 
  change?: string; 
  subtitle?: string; 
  changeType?: 'positive' | 'negative' | 'neutral' | 'warning'; 
  icon?: React.ReactNode; 
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'; 
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  subtitle,
  changeType = 'neutral', // Por defecto 'neutral' si no se pasa
  icon,
  color = 'blue', // Por defecto 'blue' si no se pasa
}) => {
  // Mapa de clases de color basado en el color elegido
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    gray: 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };

  // Función para obtener el color adecuado del texto del cambio
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-green-600 dark:text-green-400';
      case 'negative': return 'text-red-600 dark:text-red-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400'; // Si no se especifica, 'neutral'
    }
  };

  return (
    <div className="bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:-translate-y-1 transition-transform duration-300">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {value}
          </p>
          
          {/* Mostrar change o subtitle dependiendo de lo que esté presente */}
          {(change || subtitle) && (
            <span className={`text-xs font-medium ${getChangeColor()}`}>
              {change || subtitle}
            </span>
          )}
        </div>
        
        {/* Si hay un icono, se muestra en un div con clases de color */}
        {icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
