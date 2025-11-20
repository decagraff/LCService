import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, FolderOpen } from 'lucide-react';
import { inventoryService, type CreateCategoryData } from '../../services/inventoryService';
import { useToast } from '../../contexts/ToastContext';
import type { Categoria } from '../../types';
import Sidebar from '../../components/dashboard/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

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

    // Validation
    if (!formData.nombre.trim()) {
      showToast('El nombre de la categoría es requerido', 'warning');
      return;
    }

    if (formData.nombre.length > 100) {
      showToast('El nombre no puede exceder 100 caracteres', 'warning');
      return;
    }

    if (formData.descripcion && formData.descripcion.length > 500) {
      showToast('La descripción no puede exceder 500 caracteres', 'warning');
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
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark-secondary">
        <Sidebar role="admin" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">Cargando...</div>
        </div>
      </div>
    );
  }

  const charCount = formData.descripcion?.length || 0;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark-secondary">
      <Sidebar role="admin" />

      <div className="flex-1 flex flex-col">
        <DashboardHeader title={isEdit ? 'Editar Categoría' : 'Nueva Categoría'} role="admin" />

        <main className="flex-1 p-6">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link to="/admin/equipment" className="text-primary hover:underline">
              Inventario
            </Link>
            <span>/</span>
            <Link to="/admin/categories" className="text-primary hover:underline">
              Categorías
            </Link>
            <span>/</span>
            <span>{isEdit ? 'Editar' : 'Nueva'}</span>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Form */}
            <div className="bg-white dark:bg-background-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  {isEdit ? (
                    <>
                      <FolderOpen className="w-6 h-6" />
                      Editar Categoría: {formData.nombre}
                    </>
                  ) : (
                    <>
                      <FolderOpen className="w-6 h-6" />
                      Nueva Categoría
                    </>
                  )}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Nombre */}
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre de la Categoría *
                  </label>
                  <Input
                    type="text"
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    placeholder="Ej: Mesas de Trabajo, Estantes, Fregaderos..."
                    required
                    maxLength={100}
                  />
                  <small className="text-xs text-gray-500 dark:text-gray-400">
                    Máximo 100 caracteres
                  </small>
                </div>

                {/* Descripción */}
                <div>
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => handleChange('descripcion', e.target.value)}
                    placeholder="Descripción opcional de la categoría..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
                  />
                  <small className="text-xs text-gray-500 dark:text-gray-400">
                    Máximo 500 caracteres. {charCount}/500
                  </small>
                </div>

                {/* Preview */}
                <div className="bg-gray-50 dark:bg-background-dark-tertiary border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                    <span>👁️</span> Vista Previa
                  </h4>
                  <div className="bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
                      <FolderOpen className="w-5 h-5 text-primary" />
                      {formData.nombre || 'Nombre de la categoría'}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formData.descripcion || 'Sin descripción'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/admin/categories')}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Categoría'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Additional Info (edit only) */}
            {isEdit && id && (
              <div className="bg-white dark:bg-background-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Información Adicional
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Esta categoría fue creada en el sistema. Puedes editar su nombre y descripción en cualquier momento.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <strong>Nota:</strong> No se puede eliminar una categoría que tiene equipos asociados.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CategoryFormPage;
