'use client';

import { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer/Footer';
import SupportWidget from './SupportWidget';
import { CartProvider } from '../contexts/CartContext';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <CartProvider>
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
      <SupportWidget />
    </CartProvider>
  );
}