import React, { useState } from 'react';
import { Save, Settings as SettingsIcon, Database } from 'lucide-react';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useToast } from '../../contexts/ToastContext';

const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [config, setConfig] = useState({
    empresaNombre: 'LC Service',
    igv: '18',
    moneda: 'PEN',
    emailContacto: 'contacto@lcservice.pe'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí conectarías con un endpoint real si tu backend soportara tabla de configuración
    // Por ahora simulamos el guardado
    setTimeout(() => {
      showToast('Configuración actualizada correctamente', 'success');
    }, 500);
  };

  return (
    <div className="max-w-4xl">
      <DashboardHeader title="Configuración del Sistema" />

      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white dark:bg-background-dark rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 bg-gray-50 dark:bg-background-dark-tertiary">
            <SettingsIcon className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Parámetros Generales</h2>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nombre de la Empresa"
                name="empresaNombre"
                value={config.empresaNombre}
                onChange={handleChange}
              />
              <Input
                label="Email de Contacto (Sistema)"
                name="emailContacto"
                value={config.emailContacto}
                onChange={handleChange}
              />
              <Input
                label="Impuesto (IGV %)"
                name="igv"
                type="number"
                value={config.igv}
                onChange={handleChange}
              />
              <Input
                label="Moneda Principal"
                name="moneda"
                value={config.moneda}
                disabled
                helperText="La moneda no se puede cambiar una vez iniciadas las operaciones."
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
              <Button type="submit" variant="primary">
                <Save className="w-4 h-4 mr-2" /> Guardar Cambios
              </Button>
            </div>
          </form>
        </div>

        {/* System Maintenance (Placeholder) */}
        <div className="bg-white dark:bg-background-dark rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden opacity-75">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 bg-gray-50 dark:bg-background-dark-tertiary">
            <Database className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Mantenimiento (Próximamente)</h2>
          </div>
          <div className="p-6 text-sm text-gray-500">
            <p>Las opciones de backup y restauración de base de datos estarán disponibles en futuras actualizaciones.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;