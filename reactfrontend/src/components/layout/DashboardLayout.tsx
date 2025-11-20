import React, { useState } from 'react';
import Sidebar from '../dashboard/Sidebar';
import Header from './Header';
import Cart from '../catalog/Cart';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        // CLAVE: print:h-auto print:overflow-visible elimina el scroll al imprimir
        <div className="flex h-screen bg-gray-50 dark:bg-background-dark-secondary overflow-hidden print:overflow-visible print:h-auto print:bg-white">

            {/* Sidebar oculto al imprimir */}
            <div className={`
        fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 print:hidden
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <Sidebar />
            </div>

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden print:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Área Principal */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative transition-all duration-300 print:overflow-visible print:h-auto">

                {/* Header oculto al imprimir */}
                <div className="print:hidden">
                    <Header
                        onCartToggle={() => setIsCartOpen(true)}
                        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                    />
                </div>

                {/* Contenido: Reseteamos padding y márgenes al imprimir */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth print:p-0 print:m-0 print:overflow-visible print:h-auto">
                    {children}
                </main>
            </div>

            <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
    );
};

export default DashboardLayout;