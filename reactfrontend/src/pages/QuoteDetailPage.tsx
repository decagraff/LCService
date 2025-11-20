import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, CheckCircle, XCircle, Send, User, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cotizacionesService } from '../services/cotizacionesService';
import { useToast } from '../contexts/ToastContext';
import type { Cotizacion } from '../types';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import api from '../services/api'; // Importamos api directamente para los updates de estado

const QuoteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchCotizacion = async () => {
    if (!id || !user) return;
    try {
      setLoading(true);
      const data = await cotizacionesService.getCotizacionById(user.role, parseInt(id));
      setCotizacion(data);
    } catch (error) {
      showToast('Error al cargar la cotización', 'error');
      navigate(`/${user?.role}/cotizaciones`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCotizacion();
  }, [id, user]);

  // Función genérica para cambiar estados
  const handleStatusChange = async (nuevoEstado: 'enviada' | 'aprobada' | 'rechazada') => {
    if (!cotizacion || !user) return;
    
    // Mensajes de confirmación según la acción
    let confirmMsg = '';
    if (nuevoEstado === 'enviada') confirmMsg = '¿Confirmar y enviar esta cotización? No podrás editarla después.';
    if (nuevoEstado === 'aprobada') confirmMsg = '¿Aprobar esta venta?';
    if (nuevoEstado === 'rechazada') confirmMsg = '¿Rechazar esta cotización?';

    if (!confirm(confirmMsg)) return;

    try {
      setProcessing(true);
      // Usamos axios (api) directamente para el PUT
      const response = await api.put(`/${user.role}/api/cotizaciones/${cotizacion.id}/estado`, { 
        estado: nuevoEstado 
      });

      if (response.data.success) {
        showToast(`Cotización actualizada a: ${nuevoEstado.toUpperCase()}`, 'success');
        fetchCotizacion(); // Recargar datos para ver el nuevo estado
      }
    } catch (error) {
      showToast('No se pudo actualizar el estado', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loading /></div>;
  if (!cotizacion) return null;

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'aprobada': return 'bg-green-100 text-green-800 border-green-200';
      case 'rechazada': return 'bg-red-100 text-red-800 border-red-200';
      case 'enviada': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'borrador': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'vencida': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    // FIX: Usamos h-full y min-h-screen en el contenedor principal
    <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark-secondary print:bg-white">
      
      {/* FIX: El sidebar necesita estar en un contenedor que no se encoja (flex-shrink-0) */}
      <div className="print:hidden flex-shrink-0">
        <Sidebar />
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <div className="print:hidden">
          {/* Pasamos props opcionales si el componente lo soporta, o lo dejamos limpio */}
          <DashboardHeader title={`Cotización #${cotizacion.numero_cotizacion}`} />
        </div>

        <main className="flex-1 p-4 md:p-8 w-full max-w-6xl mx-auto">
          {/* Actions Bar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
             {/* ... (botones igual que antes) ... */}
             <Button variant="secondary" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver
            </Button>
            
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" /> Imprimir / PDF
              </Button>

              {/* Botón Enviar */}
              {cotizacion.estado === 'borrador' && (
                <Button 
                  variant="primary" 
                  onClick={() => handleStatusChange('enviada')}
                  disabled={processing}
                >
                  <Send className="w-4 h-4 mr-2" /> Confirmar y Enviar
                </Button>
              )}

              {/* Botones Admin/Vendedor */}
              {(user?.role === 'admin' || user?.role === 'vendedor') && 
               cotizacion.estado === 'enviada' && (
                <>
                  <Button 
                    variant="danger" 
                    onClick={() => handleStatusChange('rechazada')}
                    disabled={processing}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Rechazar
                  </Button>
                  <Button 
                    variant="success" 
                    onClick={() => handleStatusChange('aprobada')}
                    disabled={processing}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Aprobar Venta
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Documento de Cotización (Resto del contenido igual) */}
          <div className="bg-white dark:bg-background-dark shadow-xl rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 print:shadow-none print:border-none">
            {/* ... Aquí va todo el contenido de la cotización que ya teníamos ... */}
             {/* Encabezado */}
            <div className="p-8 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-background-dark-tertiary">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-primary mb-1">LC Service</h1>
                  <p className="text-sm text-gray-500">Soluciones Gastronómicas</p>
                  <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <p>RUC: 20123456789</p>
                    <p>Av. Principal 123, Lima</p>
                    <p>contacto@lcservice.pe</p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">COTIZACIÓN</h2>
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{cotizacion.numero_cotizacion}</p>
                  <div className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(cotizacion.estado)}`}>
                    {cotizacion.estado.toUpperCase()}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Fecha: {new Date(cotizacion.created_at).toLocaleDateString('es-PE')}
                  </p>
                </div>
              </div>
            </div>

            {/* Info Cliente y Vendedor */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Cliente</h3>
                <div className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-background-dark-tertiary p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-primary" />
                    <span className="font-bold">{cotizacion.cliente_nombre}</span>
                  </div>
                  {cotizacion.empresa_cliente && (
                    <div className="flex items-center gap-2 mb-1">
                      <Building className="w-4 h-4 text-primary" />
                      <span>{cotizacion.empresa_cliente}</span>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-2 pl-6">
                    {cotizacion.contacto_cliente ? `Contacto: ${cotizacion.contacto_cliente}` : ''}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Vendedor Asignado</h3>
                <div className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-background-dark-tertiary p-4 rounded-lg">
                   <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-bold">
                      {cotizacion.vendedor_nombre || 'Sin asignar'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 pl-6">LC Service Staff</p>
                </div>
              </div>
            </div>

            {/* Tabla de Items */}
            <div className="px-8 py-4">
              <div className="overflow-x-auto">
                <table className="w-full mb-8">
                  <thead>
                    <tr className="border-b-2 border-gray-100 dark:border-gray-700">
                      <th className="text-left py-3 text-sm font-bold text-gray-600 dark:text-gray-400">Item</th>
                      <th className="text-center py-3 text-sm font-bold text-gray-600 dark:text-gray-400">Cant.</th>
                      <th className="text-right py-3 text-sm font-bold text-gray-600 dark:text-gray-400">Precio Unit.</th>
                      <th className="text-right py-3 text-sm font-bold text-gray-600 dark:text-gray-400">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {cotizacion.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="py-4">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{item.equipo_nombre}</p>
                          <p className="text-xs text-gray-500">{item.equipo_codigo}</p>
                        </td>
                        <td className="text-center py-4 text-gray-700 dark:text-gray-300">{item.cantidad}</td>
                        <td className="text-right py-4 text-gray-700 dark:text-gray-300">
                          S/. {Number(item.precio_unitario).toFixed(2)}
                        </td>
                        <td className="text-right py-4 font-medium text-gray-900 dark:text-gray-100">
                          S/. {Number(item.subtotal).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totales */}
              <div className="flex justify-end border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal:</span>
                    <span>S/. {Number(cotizacion.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>IGV (18%):</span>
                    <span>S/. {Number(cotizacion.igv).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-primary border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                    <span>Total:</span>
                    <span>S/. {Number(cotizacion.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Documento */}
            <div className="bg-gray-50 dark:bg-background-dark-tertiary p-8 border-t border-gray-200 dark:border-gray-700 text-sm">
              {cotizacion.notas && (
                <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-lg">
                  <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-1">Notas Adicionales:</h4>
                  <p className="text-yellow-700 dark:text-yellow-300">{cotizacion.notas}</p>
                </div>
              )}
              <p className="text-center text-gray-400 text-xs mt-6">
                Esta cotización tiene una validez de 15 días. Precios sujetos a cambios sin previo aviso.
                <br />Generado por Sistema LC Service
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuoteDetailPage;