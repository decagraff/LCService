import React, { useState, useEffect } from 'react';
import { Filter, Search, X, ChevronDown, ChevronUp, DollarSign, Layers } from 'lucide-react';
import type { Categoria, CatalogFilters as FilterType } from '../../types';
import Input from '../common/Input';
import Button from '../common/Button';

interface CatalogFiltersProps {
  categorias: Categoria[];
  onFilterChange: (filters: FilterType) => void;
  initialFilters: FilterType;
  stats?: { // Añadimos prop opcional para recibir los límites reales
    precio_min: number;
    precio_max: number;
  };
}

const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  categorias,
  onFilterChange,
  initialFilters,
  stats
}) => {
  // Filtros locales
  const [search, setSearch] = useState(initialFilters.search || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialFilters.categoria_id?.toString() || '');
  const [minPrice, setMinPrice] = useState<string>(initialFilters.min_precio?.toString() || '');
  const [maxPrice, setMaxPrice] = useState<string>(initialFilters.max_precio?.toString() || '');

  // Estado para controlar colapso en móvil
  const [isOpen, setIsOpen] = useState(false);

  // Sincronizar si cambian los filtros externos o los stats iniciales
  useEffect(() => {
    setSearch(initialFilters.search || '');
    setSelectedCategory(initialFilters.categoria_id?.toString() || '');
    setMinPrice(initialFilters.min_precio?.toString() || '');
    setMaxPrice(initialFilters.max_precio?.toString() || '');
  }, [initialFilters]);

  const handleApplyFilters = () => {
    onFilterChange({
      search: search || undefined,
      categoria_id: selectedCategory ? parseInt(selectedCategory) : undefined,
      min_precio: minPrice ? parseFloat(minPrice) : undefined,
      max_precio: maxPrice ? parseFloat(maxPrice) : undefined,
    });
    setIsOpen(false); // Cerrar en móvil al aplicar
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    onFilterChange({});
    setIsOpen(false);
  };

  const globalMin = stats?.precio_min || 0;
  const globalMax = stats?.precio_max || 10000;

  return (
    <div className="bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-4 lg:self-start">

      {/* Header Móvil */}
      <div
        className="p-4 flex items-center justify-between lg:hidden cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filtros
        </h3>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>

      {/* Contenido de Filtros */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block p-5 border-t lg:border-t-0 border-gray-200 dark:border-gray-700 space-y-6`}>

        {/* Búsqueda */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Búsqueda</label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Nombre, código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
              className="pl-9"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Categorías */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
            <Layers className="w-3 h-3" /> Categorías
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors">
              <input
                type="radio"
                name="category"
                value=""
                checked={selectedCategory === ''}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-primary focus:ring-primary rounded-full border-gray-300"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Todas</span>
            </label>
            {categorias.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors">
                <input
                  type="radio"
                  name="category"
                  value={cat.id}
                  checked={selectedCategory === cat.id.toString()}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-primary focus:ring-primary rounded-full border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{cat.nombre}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rango de Precios */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
            <DollarSign className="w-3 h-3" /> Precio (S/.)
          </label>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <span className="text-[10px] text-gray-400 mb-1 block">Mínimo</span>
              <Input
                type="number"
                placeholder={globalMin.toString()}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min={0}
                className="text-sm"
              />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 mb-1 block">Máximo</span>
              <Input
                type="number"
                placeholder={globalMax.toString()}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min={0}
                className="text-sm"
              />
            </div>
          </div>

          {/* Slider visual simple (Opcional, solo indicativo) */}
          <div className="px-1">
            <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full relative">
              <div className="absolute left-0 top-0 h-full bg-primary rounded-full opacity-50 w-full"></div>
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-gray-400">
              <span>S/. {globalMin}</span>
              <span>S/. {globalMax}</span>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={handleApplyFilters} fullWidth>
            Aplicar Filtros
          </Button>
          <Button onClick={handleClearFilters} variant="secondary" fullWidth className="flex items-center justify-center gap-2">
            <X className="w-3 h-3" /> Limpiar
          </Button>
        </div>

      </div>
    </div>
  );
};

export default CatalogFilters;