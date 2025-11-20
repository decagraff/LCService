import React, { useState, type ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import Cart from '../catalog/Cart';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <div className="app-layout">
      <Header onCartToggle={toggleCart} />
      <main className="main-content">{children}</main>
      <Footer />
      <Cart isOpen={isCartOpen} onClose={toggleCart} />
    </div>
  );
};

export default MainLayout;
