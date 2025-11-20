import React, { useState } from 'react';
import { Save, Building, Mail, Phone, MapPin, Percent, CreditCard, Globe, Info } from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useToast } from '../../contexts/ToastContext';

const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const [config, setConfig] = useState({
    empresa_nombre: 'LC Service',
    ruc: '20123456789',
    direccion: 'Calle Inca Roca #1027',
    telefono: '987952312',
    email_contacto: 'contacto@lcservice.pe',
    igv_porcentaje: 18,
    moneda: 'PEN',
    website: 'www.lcservice.pe'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('Configuración guardada correctamente', 'success');
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark-secondary">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <DashboardHeader title="Configuración del Sistema" />

        <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Sección 1: Identidad Corporativa */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-primary" /> Identidad Corporativa
              </h3>
              <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Razón Social / Nombre"
                  name="empresa_nombre"
                  value={config.empresa_nombre}
                  onChange={handleChange}
                  fullWidth
                />
                <Input
                  label="RUC"
                  name="ruc"
                  value={config.ruc}
                  onChange={handleChange}
                  fullWidth
                />
                <div className="md:col-span-2">
                  <div className="relative">
                    <Input
                      label="Sitio Web"
                      name="website"
                      value={config.website}
                      onChange={handleChange}
                      fullWidth
                      className="pl-10"
                    />
                    <Globe className="w-5 h-5 text-gray-400 absolute left-3 top-9" />
                  </div>
                </div>
              </div>
            </section>

            {/* Sección 2: Contacto y Ubicación */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Contacto y Ubicación
              </h3>
              <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative md:col-span-2">
                  <Input
                    label="Dirección Fiscal"
                    name="direccion"
                    value={config.direccion}
                    onChange={handleChange}
                    fullWidth
                    className="pl-10"
                  />
                  <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-9" />
                </div>
                <div className="relative">
                  <Input
                    label="Teléfono Principal"
                    name="telefono"
                    value={config.telefono}
                    onChange={handleChange}
                    fullWidth
                    className="pl-10"
                  />
                  <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-9" />
                </div>
                <div className="relative">
                  <Input
                    label="Email de Contacto"
                    name="email_contacto"
                    type="email"
                    value={config.email_contacto}
                    onChange={handleChange}
                    fullWidth
                    className="pl-10"
                  />
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-9" />
                </div>
              </div>
            </section>

            {/* Sección 3: Parámetros Comerciales */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Parámetros Comerciales
              </h3>
              <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="relative">
                  <Input
                    label="IGV Global (%)"
                    name="igv_porcentaje"
                    type="number"
                    value={config.igv_porcentaje}
                    onChange={handleChange}
                    fullWidth
                    className="pl-10"
                  />
                  <Percent className="w-5 h-5 text-gray-400 absolute left-3 top-9" />
                </div>
                
                <div className="col-span-2 flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg">
                  <Info className="w-5 h-5 mr-3 flex-shrink-0" />
                  <p className="text-sm">
                    Cambiar el IGV afectará a todas las <strong>nuevas</strong> cotizaciones. Las cotizaciones antiguas mantendrán su valor histórico.
                  </p>
                </div>
              </div>
            </section>

            {/* Barra de Acción Flotante o Fija */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-background-dark-secondary p-4 -mx-8 -mb-8 border-t border-gray-200 dark:border-gray-700 flex justify-end">
               <Button type="submit" size="lg" disabled={saving} className="shadow-lg">
                  <Save className="w-5 h-5 mr-2" />
                  {saving ? 'Guardando Cambios...' : 'Guardar Configuración'}
                </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;