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
import api from '../services/api';

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

  const handleStatusChange = async (nuevoEstado: 'enviada' | 'aprobada' | 'rechazada') => {
    if (!cotizacion || !user) return;

    let confirmMsg = '';
    if (nuevoEstado === 'enviada') confirmMsg = '¿Confirmar y enviar esta cotización? No podrás editarla después.';
    if (nuevoEstado === 'aprobada') confirmMsg = '¿Aprobar esta venta?';
    if (nuevoEstado === 'rechazada') confirmMsg = '¿Rechazar esta cotización?';

    if (!confirm(confirmMsg)) return;

    try {
      setProcessing(true);
      const response = await api.put(`/${user.role}/api/cotizaciones/${cotizacion.id}/estado`, {
        estado: nuevoEstado
      });

      if (response.data.success) {
        showToast(`Cotización actualizada a: ${nuevoEstado.toUpperCase()}`, 'success');
        fetchCotizacion();
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
    <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark-secondary print:bg-white print:h-auto print:min-h-0">

      <div className="print:hidden flex-shrink-0">
        <Sidebar />
      </div>

      {/* FIX: Agregamos 'print:overflow-visible' para que el contenido no se corte ni muestre scroll al imprimir */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden print:overflow-visible">
        <div className="print:hidden">
          <DashboardHeader title={`Cotización #${cotizacion.numero_cotizacion}`} />
        </div>

        <main className="flex-1 p-4 md:p-8 w-full max-w-6xl mx-auto print:p-0 print:w-full print:max-w-none">
          {/* Actions Bar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver
            </Button>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" /> Imprimir / PDF
              </Button>

              {cotizacion.estado === 'borrador' && (
                <Button
                  variant="primary"
                  onClick={() => handleStatusChange('enviada')}
                  disabled={processing}
                >
                  <Send className="w-4 h-4 mr-2" /> Confirmar y Enviar
                </Button>
              )}

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

          {/* Documento de Cotización */}
          <div className="bg-white dark:bg-background-dark shadow-xl rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 print:shadow-none print:border-none print:rounded-none">
            {/* Encabezado */}
            <div className="p-8 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-background-dark-tertiary print:bg-white print:p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-primary mb-1 print:text-black">LC Service</h1>
                  <p className="text-sm text-gray-500">Soluciones Gastronómicas</p>
                  <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <p>RUC: 20123456789</p>
                    <p>Av. Principal 123, Lima</p>
                    <p>contacto@lcservice.pe</p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 print:text-black">COTIZACIÓN</h2>
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{cotizacion.numero_cotizacion}</p>
                  <div className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-bold border print:border-black print:text-black ${getStatusColor(cotizacion.estado)}`}>
                    {cotizacion.estado.toUpperCase()}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Fecha: {new Date(cotizacion.created_at).toLocaleDateString('es-PE')}
                  </p>
                </div>
              </div>
            </div>

            {/* Info Cliente */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 print:p-6 print:gap-6">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 print:text-black">Cliente</h3>
                <div className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-background-dark-tertiary p-4 rounded-lg print:bg-white print:border print:border-gray-300 print:p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-primary print:text-black" />
                    <span className="font-bold">{cotizacion.cliente_nombre}</span>
                  </div>
                  {cotizacion.empresa_cliente && (
                    <div className="flex items-center gap-2 mb-1">
                      <Building className="w-4 h-4 text-primary print:text-black" />
                      <span>{cotizacion.empresa_cliente}</span>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-2 pl-6">
                    {cotizacion.contacto_cliente ? `Contacto: ${cotizacion.contacto_cliente}` : ''}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 print:text-black">Vendedor Asignado</h3>
                <div className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-background-dark-tertiary p-4 rounded-lg print:bg-white print:border print:border-gray-300 print:p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-gray-400 print:text-black" />
                    <span className="font-bold">
                      {cotizacion.vendedor_nombre || 'Sin asignar'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 pl-6">LC Service Staff</p>
                </div>
              </div>
            </div>

            {/* Tabla de Items - FIX: print:overflow-visible en el contenedor */}
            <div className="px-8 py-4 print:px-6">
              <div className="overflow-x-auto print:overflow-visible">
                <table className="w-full mb-8">
                  <thead>
                    <tr className="border-b-2 border-gray-100 dark:border-gray-700 print:border-gray-300">
                      <th className="text-left py-3 text-sm font-bold text-gray-600 dark:text-gray-400 print:text-black">Item</th>
                      <th className="text-center py-3 text-sm font-bold text-gray-600 dark:text-gray-400 print:text-black">Cant.</th>
                      <th className="text-right py-3 text-sm font-bold text-gray-600 dark:text-gray-400 print:text-black">Precio Unit.</th>
                      <th className="text-right py-3 text-sm font-bold text-gray-600 dark:text-gray-400 print:text-black">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 print:divide-gray-300">
                    {cotizacion.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="py-4">
                          <p className="font-medium text-gray-900 dark:text-gray-100 print:text-black">{item.equipo_nombre}</p>
                          <p className="text-xs text-gray-500 print:text-gray-600">{item.equipo_codigo}</p>
                        </td>
                        <td className="text-center py-4 text-gray-700 dark:text-gray-300 print:text-black">{item.cantidad}</td>
                        <td className="text-right py-4 text-gray-700 dark:text-gray-300 print:text-black">
                          S/. {Number(item.precio_unitario).toFixed(2)}
                        </td>
                        <td className="text-right py-4 font-medium text-gray-900 dark:text-gray-100 print:text-black">
                          S/. {Number(item.subtotal).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totales */}
              <div className="flex justify-end border-t border-gray-200 dark:border-gray-700 pt-4 print:border-gray-300">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400 print:text-black">
                    <span>Subtotal:</span>
                    <span>S/. {Number(cotizacion.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400 print:text-black">
                    <span>IGV (18%):</span>
                    <span>S/. {Number(cotizacion.igv).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-primary border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 print:text-black print:border-gray-300">
                    <span>Total:</span>
                    <span>S/. {Number(cotizacion.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Documento */}
            <div className="bg-gray-50 dark:bg-background-dark-tertiary p-8 border-t border-gray-200 dark:border-gray-700 text-sm print:bg-white print:border-gray-300 print:p-6">
              {cotizacion.notas && (
                <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-lg print:border-gray-300 print:bg-gray-50">
                  <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-1 print:text-black">Notas Adicionales:</h4>
                  <p className="text-yellow-700 dark:text-yellow-300 print:text-black">{cotizacion.notas}</p>
                </div>
              )}
              <p className="text-center text-gray-400 text-xs mt-6 print:text-gray-600">
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