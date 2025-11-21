import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Package, Image as ImageIcon, DollarSign, Layers, Ruler, Box } from 'lucide-react';
import { inventoryService, type CreateEquipmentData } from '../../services/inventoryService';
import { useToast } from '../../contexts/ToastContext';
import type { Categoria } from '../../types';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';

const EquipmentFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [formData, setFormData] = useState<CreateEquipmentData>({
    categoria_id: 0,
    codigo: '',
    nombre: '',
    descripcion: '',
    material: '',
    dimensiones: '',
    precio: 0,
    stock: 0,
    imagen_url: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar categorías primero
        const categoriesData = await inventoryService.getAllCategories();
        setCategories(categoriesData);

        // Si es edición, cargar datos del equipo
        if (isEdit && id) {
          const equipmentData = await inventoryService.getEquipmentById(parseInt(id));
          setFormData({
            categoria_id: equipmentData.categoria_id || 0,
            codigo: equipmentData.codigo,
            nombre: equipmentData.nombre,
            descripcion: equipmentData.descripcion || '',
            material: equipmentData.material || '',
            dimensiones: equipmentData.dimensiones || '',
            precio: equipmentData.precio,
            stock: equipmentData.stock,
            imagen_url: equipmentData.imagen_url || ''
          });
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Error al cargar datos', 'error');
        navigate('/admin/equipment');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEdit, navigate, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.categoria_id || formData.categoria_id === 0) {
      showToast('Debe seleccionar una categoría', 'warning');
      return;
    }
    if (!formData.codigo.trim()) {
      showToast('El código es requerido', 'warning');
      return;
    }
    if (!formData.nombre.trim()) {
      showToast('El nombre es requerido', 'warning');
      return;
    }
    if (formData.precio <= 0) {
      showToast('El precio debe ser mayor a 0', 'warning');
      return;
    }
    if (formData.stock < 0) {
      showToast('El stock no puede ser negativo', 'warning');
      return;
    }

    try {
      setSaving(true);
      if (isEdit && id) {
        await inventoryService.updateEquipment(parseInt(id), formData);
        showToast('Equipo actualizado correctamente', 'success');
      } else {
        await inventoryService.createEquipment(formData);
        showToast('Equipo creado correctamente', 'success');
      }
      navigate('/admin/equipment');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Error al guardar equipo', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof CreateEquipmentData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loading message="Cargando formulario..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con navegación */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <DashboardHeader
          title={isEdit ? 'Editar Equipo' : 'Nuevo Equipo'}
          subtitle={isEdit ? `Editando: ${formData.nombre}` : 'Registrar un nuevo producto en el catálogo'}
        />
        <Button
          variant="secondary"
          onClick={() => navigate('/admin/equipment')}
          className="self-start md:self-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Catálogo
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Columna Izquierda: Formulario */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Información del Producto
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              {/* Identificación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="categoria_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoría *
                  </label>
                  <div className="relative">
                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      id="categoria_id"
                      value={formData.categoria_id}
                      onChange={(e) => handleChange('categoria_id', parseInt(e.target.value))}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-tertiary text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="0">Seleccionar categoría</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Código SKU *
                  </label>
                  <Input
                    type="text"
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => handleChange('codigo', e.target.value.toUpperCase())}
                    placeholder="Ej: MT-120X60"
                    required
                    maxLength={50}
                    className="uppercase font-mono"
                  />
                </div>
              </div>

              {/* Detalles Básicos */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Equipo *
                </label>
                <Input
                  type="text"
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  placeholder="Ej: Mesa de Trabajo Industrial"
                  required
                  maxLength={200}
                />
              </div>

              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => handleChange('descripcion', e.target.value)}
                  placeholder="Detalles técnicos, características principales..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-tertiary text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>

              {/* Especificaciones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="material" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Material
                  </label>
                  <Input
                    type="text"
                    id="material"
                    value={formData.material || ''}
                    onChange={(e) => handleChange('material', e.target.value)}
                    placeholder="Ej: Acero Inoxidable 304"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label htmlFor="dimensiones" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dimensiones
                  </label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      id="dimensiones"
                      value={formData.dimensiones || ''}
                      onChange={(e) => handleChange('dimensiones', e.target.value)}
                      placeholder="Ej: 120 x 60 x 90 cm"
                      maxLength={100}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Inventario y Precio */}
              <div className="p-4 bg-gray-50 dark:bg-background-dark-tertiary/50 rounded-lg border border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="precio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Precio Unitario (S/.) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="number"
                      id="precio"
                      value={formData.precio}
                      onChange={(e) => handleChange('precio', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                      className="pl-10 font-bold text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stock Inicial *
                  </label>
                  <div className="relative">
                    <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="number"
                      id="stock"
                      value={formData.stock}
                      onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Imagen */}
              <div>
                <label htmlFor="imagen_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL de Imagen
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="url"
                    id="imagen_url"
                    value={formData.imagen_url || ''}
                    onChange={(e) => handleChange('imagen_url', e.target.value)}
                    placeholder="https://ejemplo.com/imagen-equipo.jpg"
                    className="pl-10"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Recomendado: Imágenes cuadradas de al menos 500x500px.
                </p>
              </div>

              {/* Botones de Acción */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/admin/equipment')}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Equipo'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Columna Derecha: Vista Previa */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-background-dark-tertiary">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wide">
                  Vista Previa
                </h3>
              </div>

              <div className="p-6">
                <div className="bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md">
                  {/* Preview Imagen */}
                  <div className="h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative overflow-hidden group">
                    {formData.imagen_url ? (
                      <img
                        src={formData.imagen_url}
                        alt="Preview"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="flex flex-col items-center text-gray-400"><span class="text-4xl mb-2">📦</span><span class="text-xs">Error al cargar imagen</span></div>';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <Package className="w-12 h-12 mb-2 opacity-50" />
                        <span className="text-xs">Sin imagen</span>
                      </div>
                    )}

                    {/* Badge de Stock */}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold shadow-sm ${formData.stock > 0
                          ? 'bg-white/90 text-green-700 dark:bg-black/60 dark:text-green-400 backdrop-blur-sm'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/80 dark:text-white'
                        }`}>
                        {formData.stock > 0 ? `${formData.stock} unid.` : 'Agotado'}
                      </span>
                    </div>
                  </div>

                  {/* Preview Contenido */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded uppercase">
                        {formData.codigo || 'SKU'}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                      {formData.nombre || 'Nombre del Producto'}
                    </h4>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      {categories.find(c => c.id === formData.categoria_id)?.nombre || 'Categoría'}
                    </p>

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-xl font-bold text-primary">
                        S/. {formData.precio.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-4">
                  Así se verá el producto en el catálogo
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EquipmentFormPage;