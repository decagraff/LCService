import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FolderOpen, Type, AlignLeft, AlertCircle } from 'lucide-react';
import { inventoryService, type CreateCategoryData } from '../../services/inventoryService';
import { useToast } from '../../contexts/ToastContext';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';

const CategoryFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CreateCategoryData>({
    nombre: '',
    descripcion: ''
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchCategory = async () => {
        try {
          setLoading(true);
          const categoryData = await inventoryService.getCategoryById(parseInt(id));
          setFormData({
            nombre: categoryData.nombre,
            descripcion: categoryData.descripcion || ''
          });
        } catch (error) {
          showToast(error instanceof Error ? error.message : 'Error al cargar categoría', 'error');
          navigate('/admin/categories');
        } finally {
          setLoading(false);
        }
      };
      fetchCategory();
    }
  }, [id, isEdit, navigate, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      showToast('El nombre de la categoría es requerido', 'warning');
      return;
    }

    try {
      setSaving(true);
      if (isEdit && id) {
        await inventoryService.updateCategory(parseInt(id), formData);
        showToast('Categoría actualizada correctamente', 'success');
      } else {
        await inventoryService.createCategory(formData);
        showToast('Categoría creada correctamente', 'success');
      }
      navigate('/admin/categories');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Error al guardar categoría', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof CreateCategoryData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loading message="Cargando formulario..." /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <DashboardHeader
          title={isEdit ? 'Editar Categoría' : 'Nueva Categoría'}
          subtitle={isEdit ? `Modificando: ${formData.nombre}` : 'Crear una nueva agrupación para productos'}
        />
        <Button
          variant="secondary"
          onClick={() => navigate('/admin/categories')}
          className="self-start md:self-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Formulario */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-primary" />
                Datos de la Categoría
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre *
                </label>
                <div className="relative">
                  <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    placeholder="Ej: Mesas de Trabajo"
                    required
                    maxLength={100}
                    className="pl-10"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 text-right">{formData.nombre.length}/100</p>
              </div>

              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <div className="relative">
                  <AlignLeft className="absolute left-3 top-4 w-4 h-4 text-gray-400" />
                  <textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => handleChange('descripcion', e.target.value)}
                    placeholder="Descripción breve de la categoría..."
                    rows={4}
                    maxLength={500}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-tertiary text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 text-right">{formData.descripcion?.length || 0}/500</p>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/admin/categories')}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Categoría'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Vista Previa & Info */}
        <div className="lg:col-span-1 space-y-6">

          {/* Preview Card */}
          <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-4">
              Vista Previa
            </h3>

            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-background-dark-tertiary/50">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-lg">
                  <FolderOpen className="w-6 h-6" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                {formData.nombre || 'Nombre de Categoría'}
              </h3>

              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                {formData.descripcion || 'Descripción de la categoría...'}
              </p>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500">
                <span>0 productos</span>
                <span className="text-primary cursor-pointer hover:underline">Ver Inventario</span>
              </div>
            </div>
          </div>

          {/* Info Box */}
          {isEdit && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Información</p>
                <p className="opacity-90">
                  Si eliminas esta categoría, asegúrate de que no tenga productos asociados, o no podrás completarla acción.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CategoryFormPage;