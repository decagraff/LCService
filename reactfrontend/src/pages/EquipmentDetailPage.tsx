import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Package, Check, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { catalogService } from '../services/catalogService';
import type { Equipo } from '../types';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import { useToast } from '../contexts/ToastContext';

const EquipmentDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const { addToCart } = useCart(); // addToCart espera (id, cantidad)
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [equipo, setEquipo] = useState<Equipo | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        const fetchEquipo = async () => {
            if (!user || !id) return;
            try {
                setLoading(true);
                const data = await catalogService.getEquipoById(user.role, parseInt(id));
                setEquipo(data);
            } catch (error) {
                console.error(error);
                showToast('Equipo no encontrado', 'error');
                navigate(`/${user?.role}/catalogo`);
            } finally {
                setLoading(false);
            }
        };

        fetchEquipo();
    }, [id, user, navigate, showToast]);

    const handleAddToCart = async () => {
        if (!equipo) return;

        setAdding(true);

        try {
            await addToCart(equipo.id, quantity);

            showToast(`Agregado: ${quantity} x ${equipo.nombre}`, 'success');
        } catch (error) {
            showToast('No se pudo agregar al carrito', 'error');
        } finally {
            setAdding(false);
        }
    };

    const getStockStatus = (stock: number) => {
        if (stock === 0) return { text: 'Agotado', color: 'text-red-500', icon: <X className="w-4 h-4" /> };
        if (stock <= 5) return { text: `Últimas ${stock} unidades`, color: 'text-orange-500', icon: <AlertTriangle className="w-4 h-4" /> };
        return { text: 'En Stock', color: 'text-green-500', icon: <Check className="w-4 h-4" /> };
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loading /></div>;
    if (!equipo) return null;

    const stockInfo = getStockStatus(equipo.stock);

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-background-dark-secondary">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 p-6 overflow-y-auto">
                    <DashboardHeader title="Detalle del Producto" />

                    <div className="max-w-6xl mx-auto">
                        <Button
                            variant="secondary"
                            onClick={() => navigate(-1)}
                            className="mb-6 flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> Volver al Catálogo
                        </Button>

                        <div className="bg-white dark:bg-background-dark rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">

                                {/* Columna Izquierda: Imagen */}
                                <div className="bg-gray-100 dark:bg-gray-800 p-8 flex items-center justify-center min-h-[400px]">
                                    {equipo.imagen_url ? (
                                        <img
                                            src={equipo.imagen_url}
                                            alt={equipo.nombre}
                                            className="w-full h-auto max-h-[500px] object-contain drop-shadow-xl rounded-lg"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                (e.target as HTMLImageElement).parentElement!.innerHTML =
                                                    '<div class="text-gray-300 flex flex-col items-center"><span class="text-6xl mb-2">📦</span><span class="text-lg font-medium">Sin imagen</span></div>';
                                            }}
                                        />
                                    ) : (
                                        <div className="text-gray-300 flex flex-col items-center">
                                            <Package className="w-32 h-32 mb-4" />
                                            <span className="text-lg font-medium">Sin imagen disponible</span>
                                        </div>
                                    )}
                                </div>

                                {/* Columna Derecha: Info */}
                                <div className="p-8 flex flex-col">
                                    <div className="mb-auto">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider rounded-full">
                                                {equipo.categoria_nombre || 'General'}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                                COD: {equipo.codigo}
                                            </span>
                                        </div>

                                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                            {equipo.nombre}
                                        </h1>

                                        <div className="flex items-center gap-4 mb-6">
                                            <span className="text-3xl font-bold text-primary">
                                                S/. {Number(equipo.precio).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                            </span>
                                            <div className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full border ${stockInfo.color.replace('text-', 'border-').replace('500', '200')} bg-opacity-10`}>
                                                {stockInfo.icon}
                                                <span className={stockInfo.color}>{stockInfo.text}</span>
                                            </div>
                                        </div>

                                        <div className="prose dark:prose-invert max-w-none mb-8 text-gray-600 dark:text-gray-300">
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">Descripción</h3>
                                            <p className="leading-relaxed">
                                                {equipo.descripcion || "Este equipo no cuenta con una descripción detallada por el momento."}
                                            </p>
                                        </div>

                                        {/* Detalles adicionales si existen */}
                                        {(equipo.material || equipo.dimensiones) && (
                                            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                                                {equipo.material && (
                                                    <div>
                                                        <span className="block text-gray-500 dark:text-gray-400 font-medium">Material</span>
                                                        <span className="text-gray-900 dark:text-gray-200">{equipo.material}</span>
                                                    </div>
                                                )}
                                                {equipo.dimensiones && (
                                                    <div>
                                                        <span className="block text-gray-500 dark:text-gray-400 font-medium">Dimensiones</span>
                                                        <span className="text-gray-900 dark:text-gray-200">{equipo.dimensiones}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Sección de Compra */}
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
                                        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">

                                            {/* Selector Cantidad */}
                                            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-background-dark-tertiary">
                                                <button
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    className="px-4 py-3 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-l-lg transition-colors"
                                                    disabled={equipo.stock === 0}
                                                >
                                                    -
                                                </button>
                                                <span className="w-12 text-center font-bold text-gray-900 dark:text-gray-100">{quantity}</span>
                                                <button
                                                    onClick={() => setQuantity(Math.min(equipo.stock, quantity + 1))}
                                                    className="px-4 py-3 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-r-lg transition-colors"
                                                    disabled={equipo.stock === 0 || quantity >= equipo.stock}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {/* Botón Agregar */}
                                            <Button
                                                variant="primary"
                                                fullWidth
                                                size="lg"
                                                onClick={handleAddToCart}
                                                disabled={equipo.stock === 0 || adding}
                                                className="flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                            >
                                                {adding ? (
                                                    <span className="animate-pulse">Agregando...</span>
                                                ) : (
                                                    <>
                                                        <ShoppingCart className="w-5 h-5" />
                                                        {equipo.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-3 text-center sm:text-left">
                                            * Los precios incluyen IGV. Envío calculado en la cotización final.
                                        </p>
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

export default EquipmentDetailPage;