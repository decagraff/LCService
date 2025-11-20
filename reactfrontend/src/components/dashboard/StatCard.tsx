import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'orange' | 'red' | 'gray'; // Agregado orange
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  subtitle,
  change,
  changeType
}) => {

  // Mapa de colores extendido
  const colorStyles = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500', // Nuevo
    red: 'bg-red-500',       // Nuevo
    gray: 'bg-gray-500'
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-green-600 dark:text-green-400';
      case 'negative': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive': return <TrendingUp className="w-4 h-4" />;
      case 'negative': return <TrendingDown className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</h3>
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${colorStyles[color]} shadow-lg shadow-${color}-500/30`}>
            {icon}
          </div>
        )}
      </div>

      {(subtitle || change) && (
        <div className="mt-4 flex items-center justify-between">
          {subtitle && (
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              {subtitle}
            </span>
          )}

          {change && (
            <div className={`flex items-center gap-1 text-xs font-medium ${getChangeColor()}`}>
              {getChangeIcon()}
              <span>{change}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;