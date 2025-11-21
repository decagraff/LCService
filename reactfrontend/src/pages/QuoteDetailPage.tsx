import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, CheckCircle, XCircle, Send, Building, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cotizacionesService } from '../services/cotizacionesService';
import { useToast } from '../contexts/ToastContext';
import type { Cotizacion } from '../types';
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
    <div className="flex flex-col h-full">
      {/* Estilos de impresión dedicados */}
      <style>{`
        @media print {
          @page { margin: 1cm; size: auto; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; }
          /* Ocultar elementos de la interfaz */
          nav, header, aside, .no-print, button { display: none !important; }
          /* Resetear contenedores */
          #root, .main-content { width: 100% !important; margin: 0 !important; padding: 0 !important; max-width: none !important; }
          .print-container { 
            box-shadow: none !important; 
            border: none !important; 
            width: 100% !important; 
            margin: 0 !important; 
            padding: 0 !important;
          }
          /* Forzar layout horizontal */
          .print-row { display: flex !important; flex-direction: row !important; width: 100% !important; }
          .print-col-6 { width: 50% !important; flex: 0 0 50% !important; }
          
          /* Evitar cortes */
          tr, td, th { page-break-inside: avoid; }
        }
      `}</style>

      <div className="max-w-5xl mx-auto w-full">

        {/* Barra de acciones (No imprimir) */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 no-print">
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

        {/* Hoja de Cotización (Contenedor Principal) */}
        <div className="print-container bg-white dark:bg-background-dark shadow-xl rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">

          {/* HEADER: Logo y Datos Empresa */}
          <div className="p-8 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-background-dark-tertiary print:bg-white print:border-b-2 print:border-gray-800">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {/* Logo Simulado */}
                  <div className="w-10 h-10 bg-primary text-white rounded flex items-center justify-center font-bold text-xl print:bg-black">LC</div>
                  <h1 className="text-2xl font-bold text-primary print:text-black uppercase tracking-tight">LC Service</h1>
                </div>
                <p className="text-sm text-gray-500 print:text-gray-600 font-medium">Soluciones Gastronómicas en Acero</p>
                <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 print:text-gray-600 space-y-0.5">
                  <p><strong>RUC:</strong> 20123456789</p>
                  <p><strong>Dirección:</strong> Av. Industrial 123, Lima</p>
                  <p><strong>Email:</strong> ventas@lcservice.pe</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1 print:text-black">COTIZACIÓN</h2>
                <p className="text-xl font-mono font-medium text-gray-700 dark:text-gray-300 print:text-black">{cotizacion.numero_cotizacion}</p>

                <div className="mt-4 space-y-1 text-sm text-right">
                  <p className="text-gray-500 print:text-gray-800">
                    <span className="font-bold">Fecha:</span> {new Date(cotizacion.created_at).toLocaleDateString('es-PE')}
                  </p>
                  <p className="text-gray-500 print:text-gray-800">
                    <span className="font-bold">Vencimiento:</span> {cotizacion.fecha_vencimiento ? new Date(cotizacion.fecha_vencimiento).toLocaleDateString('es-PE') : '15 días'}
                  </p>
                </div>

                <div className="mt-2 no-print inline-block px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
                  {cotizacion.estado.toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* INFORMACIÓN: Cliente y Vendedor (Uso de 'print-row' para forzar horizontalidad) */}
          <div className="p-8 print:p-0 print:mt-6 print:mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print-row">

              {/* Columna Cliente */}
              <div className="print-col-6 print:pr-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 print:text-black print:border-b print:border-gray-300 print:pb-1">
                  Facturar a:
                </h3>
                <div className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-background-dark-tertiary p-4 rounded-lg print:bg-transparent print:p-0">
                  <p className="font-bold text-lg text-gray-900 dark:text-white print:text-black">
                    {cotizacion.cliente_nombre} {cotizacion.cliente_apellido}
                  </p>
                  {(cotizacion.empresa_cliente || cotizacion.cliente_empresa) && (
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 print:text-black mt-1 flex items-center gap-2">
                      <Building className="w-3 h-3 no-print" />
                      {cotizacion.empresa_cliente || cotizacion.cliente_empresa}
                    </p>
                  )}
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 print:text-gray-700 space-y-1">
                    {cotizacion.cliente_email && <p>{cotizacion.cliente_email}</p>}
                    {cotizacion.cliente_telefono && <p>{cotizacion.cliente_telefono}</p>}
                  </div>
                </div>
              </div>

              {/* Columna Vendedor */}
              <div className="print-col-6 print:pl-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 print:text-black print:border-b print:border-gray-300 print:pb-1">
                  Atendido por:
                </h3>
                <div className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-background-dark-tertiary p-4 rounded-lg print:bg-transparent print:p-0">
                  <p className="font-bold text-gray-900 dark:text-white print:text-black">
                    {cotizacion.vendedor_nombre ? `${cotizacion.vendedor_nombre} ${cotizacion.vendedor_apellido || ''}` : 'Asesor de Ventas'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-700 mt-1">
                    Departamento Comercial
                  </p>
                  {cotizacion.vendedor_email && (
                    <p className="text-sm text-gray-600 mt-1">{cotizacion.vendedor_email}</p>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* TABLA DE ITEMS */}
          <div className="px-8 py-4 print:px-0 print:py-0">
            <table className="w-full mb-8 print:mb-4">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700 print:border-black bg-gray-50 dark:bg-background-dark-tertiary/50 print:bg-transparent">
                  <th className="text-left py-3 pl-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase print:text-black print:pl-0">Descripción</th>
                  <th className="text-center py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase print:text-black w-20">Cant.</th>
                  <th className="text-right py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase print:text-black w-32">Precio Unit.</th>
                  <th className="text-right py-3 pr-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase print:text-black w-32 print:pr-0">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 print:divide-gray-300">
                {cotizacion.items?.map((item, index) => (
                  <tr key={index} className="print:break-inside-avoid">
                    <td className="py-4 pl-4 print:pl-0">
                      <p className="font-bold text-gray-900 dark:text-gray-100 print:text-black text-sm">{item.equipo_nombre}</p>
                      <p className="text-xs text-gray-500 print:text-gray-600 font-mono mt-0.5">{item.equipo_codigo}</p>
                    </td>
                    <td className="text-center py-4 text-gray-700 dark:text-gray-300 print:text-black text-sm">{item.cantidad}</td>
                    <td className="text-right py-4 text-gray-700 dark:text-gray-300 print:text-black text-sm">
                      {Number(item.precio_unitario).toFixed(2)}
                    </td>
                    <td className="text-right py-4 pr-4 font-bold text-gray-900 dark:text-gray-100 print:text-black print:pr-0 text-sm">
                      {Number(item.subtotal).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* TOTALES */}
            <div className="flex justify-end pt-2 print:pt-0">
              <div className="w-72 print:w-64">
                <div className="space-y-2 print:space-y-1 border-t border-gray-200 dark:border-gray-700 print:border-none pt-4 print:pt-0">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400 print:text-black text-sm">
                    <span>Subtotal:</span>
                    <span>S/. {Number(cotizacion.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400 print:text-black text-sm">
                    <span>IGV (18%):</span>
                    <span>S/. {Number(cotizacion.igv).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-primary border-t-2 border-gray-100 dark:border-gray-700 pt-2 mt-2 print:text-black print:border-t print:border-black print:text-lg">
                    <span>Total:</span>
                    <span>S/. {Number(cotizacion.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER DOCUMENTO: Notas y Firma */}
          <div className="bg-gray-50 dark:bg-background-dark-tertiary p-8 border-t border-gray-200 dark:border-gray-700 text-sm print:bg-white print:border-none print:p-0 print:mt-8">

            {cotizacion.notas && (
              <div className="mb-6">
                <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-1 print:text-black text-xs uppercase flex items-center gap-2">
                  <FileText className="w-3 h-3 no-print" /> Notas / Observaciones:
                </h4>
                <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-gray-600 dark:text-gray-400 print:text-black print:border-gray-300 text-sm italic">
                  {cotizacion.notas}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-8 mt-12 print:mt-16 opacity-0 print:opacity-100">
              <div className="text-center border-t border-gray-400 pt-2">
                <p className="font-bold text-black text-sm">LC Service</p>
                <p className="text-xs text-gray-600">Firma Autorizada</p>
              </div>
              <div className="text-center border-t border-gray-400 pt-2">
                <p className="font-bold text-black text-sm">Cliente</p>
                <p className="text-xs text-gray-600">Aceptación y Firma</p>
              </div>
            </div>

            <div className="text-center text-gray-400 text-xs mt-8 print:mt-8 print:text-gray-500">
              <p>Gracias por su preferencia.</p>
              <p>Cuentas Bancarias: BCP Soles 193-xxxxxxxx-0-xx | CCI: 002-193-xxxxxxxxxxxx-xx</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default QuoteDetailPage;