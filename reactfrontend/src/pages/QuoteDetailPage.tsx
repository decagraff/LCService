import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, CheckCircle, XCircle, Send, User, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cotizacionesService } from '../services/cotizacionesService';
import { useToast } from '../contexts/ToastContext';
import type { Cotizacion } from '../types';
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
    if (!confirm(`¿Estás seguro de cambiar el estado a ${nuevoEstado.toUpperCase()}?`)) return;

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

  if (loading) return <div className="flex h-full items-center justify-center"><Loading /></div>;
  if (!cotizacion) return null;

  return (
    <div className="flex flex-col h-full print:block">
      <div className="print:hidden">
        <DashboardHeader title={`Cotización #${cotizacion.numero_cotizacion}`} />
      </div>

      <div className="max-w-5xl mx-auto w-full print:max-w-none print:w-full">
        {/* Barra de acciones (No imprimir) */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
          </Button>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" /> Imprimir / PDF
            </Button>

            {cotizacion.estado === 'borrador' && (
              <Button variant="primary" onClick={() => handleStatusChange('enviada')} disabled={processing}>
                <Send className="w-4 h-4 mr-2" /> Enviar
              </Button>
            )}
            {(user?.role === 'admin' || user?.role === 'vendedor') && cotizacion.estado === 'enviada' && (
              <>
                <Button variant="danger" onClick={() => handleStatusChange('rechazada')} disabled={processing}>
                  <XCircle className="w-4 h-4 mr-2" /> Rechazar
                </Button>
                <Button variant="success" onClick={() => handleStatusChange('aprobada')} disabled={processing}>
                  <CheckCircle className="w-4 h-4 mr-2" /> Aprobar
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Hoja de Cotización */}
        <div className="bg-white dark:bg-background-dark shadow-xl rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 
                        print:shadow-none print:border-none print:rounded-none print:m-0">

          {/* Header del Documento */}
          <div className="p-8 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-background-dark-tertiary 
                          print:bg-white print:p-0 print:mb-6 print:border-b-2 print:border-gray-800">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-primary mb-1 print:text-black print:text-4xl">LC Service</h1>
                <p className="text-sm text-gray-500 print:text-gray-600">Soluciones Gastronómicas</p>
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 print:text-gray-800">
                  <p>RUC: 20123456789</p>
                  <p>Av. Principal 123, Lima</p>
                  <p>contacto@lcservice.pe</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 print:text-black">COTIZACIÓN</h2>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 print:text-black">{cotizacion.numero_cotizacion}</p>
                <div className="mt-2 inline-block px-3 py-1 rounded-full text-sm font-bold border border-gray-200 print:border-black print:text-black">
                  {cotizacion.estado.toUpperCase()}
                </div>
                <p className="mt-2 text-sm text-gray-500 print:text-gray-800">
                  Fecha: {new Date(cotizacion.created_at).toLocaleDateString('es-PE')}
                </p>
              </div>
            </div>
          </div>

          {/* Datos del Cliente y Vendedor */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 print:p-0 print:mb-8 print:gap-4 print:grid-cols-2">
            <div className="print:border print:border-gray-300 print:p-3 print:rounded">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 print:text-black print:mb-1">Cliente</h3>
              <div className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-background-dark-tertiary p-4 rounded-lg print:bg-transparent print:p-0">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-primary print:hidden" />
                  <span className="font-bold print:text-lg">{cotizacion.cliente_nombre}</span>
                </div>
                {cotizacion.empresa_cliente && (
                  <div className="flex items-center gap-2 mb-1">
                    <Building className="w-4 h-4 text-primary print:hidden" />
                    <span className="print:text-gray-800">{cotizacion.empresa_cliente}</span>
                  </div>
                )}
                {cotizacion.contacto_cliente && (
                  <p className="text-sm text-gray-500 mt-2 pl-6 print:pl-0 print:text-gray-700">
                    Atención: {cotizacion.contacto_cliente}
                  </p>
                )}
              </div>
            </div>

            <div className="print:border print:border-gray-300 print:p-3 print:rounded">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 print:text-black print:mb-1">Vendedor</h3>
              <div className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-background-dark-tertiary p-4 rounded-lg print:bg-transparent print:p-0">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-gray-400 print:hidden" />
                  <span className="font-bold print:text-lg">
                    {cotizacion.vendedor_nombre || 'Sin asignar'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 pl-6 print:pl-0">LC Service Staff</p>
              </div>
            </div>
          </div>

          {/* Tabla de Productos */}
          <div className="px-8 py-4 print:px-0 print:py-0">
            <table className="w-full mb-8 print:mb-4">
              <thead>
                <tr className="border-b-2 border-gray-100 dark:border-gray-700 print:border-black">
                  <th className="text-left py-3 text-sm font-bold text-gray-600 dark:text-gray-400 print:text-black">Descripción</th>
                  <th className="text-center py-3 text-sm font-bold text-gray-600 dark:text-gray-400 print:text-black w-16">Cant.</th>
                  <th className="text-right py-3 text-sm font-bold text-gray-600 dark:text-gray-400 print:text-black w-24">P. Unit</th>
                  <th className="text-right py-3 text-sm font-bold text-gray-600 dark:text-gray-400 print:text-black w-24">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 print:divide-gray-300">
                {cotizacion.items?.map((item, index) => (
                  <tr key={index} className="print:break-inside-avoid">
                    <td className="py-4 print:py-2">
                      <p className="font-medium text-gray-900 dark:text-gray-100 print:text-black">{item.equipo_nombre}</p>
                      <p className="text-xs text-gray-500 print:text-gray-600">{item.equipo_codigo}</p>
                    </td>
                    <td className="text-center py-4 text-gray-700 dark:text-gray-300 print:text-black print:py-2">{item.cantidad}</td>
                    <td className="text-right py-4 text-gray-700 dark:text-gray-300 print:text-black print:py-2">
                      {Number(item.precio_unitario).toFixed(2)}
                    </td>
                    <td className="text-right py-4 font-medium text-gray-900 dark:text-gray-100 print:text-black print:py-2">
                      {Number(item.subtotal).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totales */}
            <div className="flex justify-end border-t border-gray-200 dark:border-gray-700 pt-4 print:border-black print:pt-2">
              <div className="w-64 space-y-2 print:space-y-1">
                <div className="flex justify-between text-gray-600 dark:text-gray-400 print:text-black">
                  <span>Subtotal:</span>
                  <span>S/. {Number(cotizacion.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400 print:text-black">
                  <span>IGV (18%):</span>
                  <span>S/. {Number(cotizacion.igv).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-primary border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 print:text-black print:border-t print:border-black print:text-lg">
                  <span>Total:</span>
                  <span>S/. {Number(cotizacion.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Documento */}
          <div className="bg-gray-50 dark:bg-background-dark-tertiary p-8 border-t border-gray-200 dark:border-gray-700 text-sm 
                          print:bg-white print:border-none print:p-0 print:mt-8">
            {cotizacion.notas && (
              <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-lg 
                              print:border print:border-gray-400 print:bg-gray-50 print:mb-2">
                <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-1 print:text-black text-xs">Notas:</h4>
                <p className="text-yellow-700 dark:text-yellow-300 print:text-black text-xs">{cotizacion.notas}</p>
              </div>
            )}
            <div className="text-center text-gray-400 text-xs mt-6 print:text-black print:mt-4 print:border-t print:border-gray-300 print:pt-2">
              <p className="font-bold">Condiciones Comerciales</p>
              <p>Validez de la oferta: 15 días calendario. Precios incluyen IGV.</p>
              <p>Forma de pago: 50% adelanto, 50% contra entrega.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default QuoteDetailPage;