import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import type { Equipo } from '../../types';
import Button from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';

interface EquipmentCardProps {
  equipo: Equipo;
  viewMode: 'grid' | 'list';
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipo, viewMode }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    await addToCart(equipo.id, 1);
  };

  const handleViewDetail = () => {
     navigate(`/${user?.role}/catalogo/equipo/${equipo.id}`);
  };

  // Helper para asegurar que el precio sea número antes de formatear
  const formatPrice = (precio: number | string) => {
      return Number(precio).toFixed(2);
  };

  if (viewMode === 'list') {
    return (
      <div 
        onClick={handleViewDetail}
        className="group bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex gap-6 hover:shadow-md transition-all cursor-pointer"
      >
        <div className="w-48 h-48 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
           <img
            src={equipo.imagen_url}
            alt={equipo.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="flex h-full items-center justify-center text-gray-400"><span class="text-4xl">📦</span></div>';
            }}
          />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">{equipo.codigo}</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary transition-colors">
                {equipo.nombre}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 max-w-2xl">
                {equipo.descripcion}
              </p>
            </div>
            <div className="text-right">
              {/* CORRECCIÓN AQUÍ: Usamos formatPrice */}
              <p className="text-2xl font-bold text-primary">S/. {formatPrice(equipo.precio)}</p>
              <p className={`text-xs font-medium mt-1 ${equipo.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {equipo.stock > 0 ? `Stock: ${equipo.stock}` : 'Agotado'}
              </p>
            </div>
          </div>
          
          <div className="mt-auto flex gap-3">
             <Button 
                size="sm" 
                onClick={handleAddToCart}
                disabled={equipo.stock === 0}
                className="flex items-center gap-2"
             >
               <ShoppingCart className="w-4 h-4" /> Agregar
             </Button>
             <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); handleViewDetail(); }}>
               Ver Detalles
             </Button>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div 
      onClick={handleViewDetail}
      className="group bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={equipo.imagen_url}
          alt={equipo.nombre}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="flex h-full items-center justify-center text-gray-400"><span class="text-4xl">📦</span></div>';
          }}
        />
        {equipo.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              AGOTADO
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
           <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
             {equipo.codigo}
           </span>
           {equipo.categoria_nombre && (
             <span className="text-xs text-primary font-medium truncate max-w-[50%]">
               {equipo.categoria_nombre}
             </span>
           )}
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-primary transition-colors" title={equipo.nombre}>
          {equipo.nombre}
        </h3>

        <div className="mt-auto pt-4 flex items-end justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Precio Unitario</p>
            {/* CORRECCIÓN AQUÍ: Usamos formatPrice */}
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              S/. {formatPrice(equipo.precio)}
            </p>
          </div>
          <Button 
            size="sm" 
            onClick={handleAddToCart}
            disabled={equipo.stock === 0}
            className="shadow-md shadow-blue-500/20 rounded-full w-10 h-10 p-0 flex items-center justify-center"
            title="Agregar al carrito"
          >
            <ShoppingCart className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentCard;