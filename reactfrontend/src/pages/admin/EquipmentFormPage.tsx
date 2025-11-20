import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { inventoryService, type CreateEquipmentData } from '../../services/inventoryService';
import { useToast } from '../../contexts/ToastContext';
import type { Equipo, Categoria } from '../../types';
import Sidebar from '../../components/dashboard/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

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
        const categoriesData = await inventoryService.getAllCategories();
        setCategories(categoriesData);

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

    // Validation
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
      <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark-secondary">
        <Sidebar role="admin" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark-secondary">
      <Sidebar role="admin" />

      <div className="flex-1 flex flex-col">
        <DashboardHeader title={isEdit ? 'Editar Equipo' : 'Nuevo Equipo'} role="admin" />

        <main className="flex-1 p-6">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link to="/admin/equipment" className="text-primary hover:underline">
              Equipos
            </Link>
            <span>/</span>
            <span>{isEdit ? 'Editar' : 'Nuevo'}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-background-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    {isEdit ? (
                      <>
                        <Package className="w-6 h-6" />
                        Editar Equipo: {formData.nombre}
                      </>
                    ) : (
                      <>
                        <Package className="w-6 h-6" />
                        Nuevo Equipo
                      </>
                    )}
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="categoria_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Categoría *
                      </label>
                      <select
                        id="categoria_id"
                        value={formData.categoria_id}
                        onChange={(e) => handleChange('categoria_id', parseInt(e.target.value))}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="0">Seleccionar categoría</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Código *
                      </label>
                      <input
                        type="text"
                        id="codigo"
                        value={formData.codigo}
                        onChange={(e) => handleChange('codigo', e.target.value.toUpperCase())}
                        placeholder="Ej: ALA-100x40, MT-120x60"
                        required
                        maxLength={50}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent uppercase"
                      />
                      <small className="text-xs text-gray-500 dark:text-gray-400">
                        Letras, números, guiones (-), guiones bajos (_), puntos (.) y x
                      </small>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre del Equipo *
                    </label>
                    <Input
                      type="text"
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => handleChange('nombre', e.target.value)}
                      placeholder="Ej: Mesón de Trabajo Industrial 100x40"
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
                      placeholder="Descripción detallada del equipo..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="material" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Material
                      </label>
                      <Input
                        type="text"
                        id="material"
                        value={formData.material}
                        onChange={(e) => handleChange('material', e.target.value)}
                        placeholder="Ej: Acero inoxidable 304"
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <label htmlFor="dimensiones" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Dimensiones
                      </label>
                      <Input
                        type="text"
                        id="dimensiones"
                        value={formData.dimensiones}
                        onChange={(e) => handleChange('dimensiones', e.target.value)}
                        placeholder="Ej: 100cm x 40cm x 90cm"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="precio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Precio (S/.) *
                      </label>
                      <Input
                        type="number"
                        id="precio"
                        value={formData.precio}
                        onChange={(e) => handleChange('precio', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Stock (unidades) *
                      </label>
                      <Input
                        type="number"
                        id="stock"
                        value={formData.stock}
                        onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="imagen_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL de Imagen
                    </label>
                    <Input
                      type="url"
                      id="imagen_url"
                      value={formData.imagen_url}
                      onChange={(e) => handleChange('imagen_url', e.target.value)}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                    <small className="text-xs text-gray-500 dark:text-gray-400">
                      URL pública de la imagen del equipo
                    </small>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => navigate('/admin/equipment')}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Guardando...' : isEdit ? 'Actualizar Equipo' : 'Crear Equipo'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Preview */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-background-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 sticky top-6">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Vista Previa</h3>
                </div>
                <div className="p-6">
                  <div className="bg-gray-50 dark:bg-background-dark-tertiary rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                    {/* Image Preview */}
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      {formData.imagen_url ? (
                        <img
                          src={formData.imagen_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="text-gray-400 text-4xl">📦</div>';
                          }}
                        />
                      ) : (
                        <Package className="w-16 h-16 text-gray-400" />
                      )}
                    </div>

                    {/* Content Preview */}
                    <div className="p-4">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{formData.codigo || 'CÓDIGO'}</span>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {formData.nombre || 'Nombre del equipo'}
                      </h4>
                      {formData.descripcion && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                          {formData.descripcion}
                        </p>
                      )}
                      <div className="text-2xl font-bold text-primary mb-2">
                        S/. {formData.precio.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Stock: {formData.stock} unidades
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EquipmentFormPage;
