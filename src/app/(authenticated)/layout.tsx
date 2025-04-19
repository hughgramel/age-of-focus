'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import Image from 'next/image';
import { useEffect } from 'react';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Prevent scrolling on authenticated pages
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen relative overflow-hidden">
        {/* Full-screen background with gradient overlay */}
        <div className="fixed inset-0 w-full h-full z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B1423] via-[#1C2942] to-[#0B1423] opacity-90"></div>
          
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10" 
               style={{ backgroundImage: 'radial-gradient(#FFD700 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          
          {/* Optional: Keep the image but with much lower opacity */}
          <Image 
            src="/backgrounds/civil_war_background.png" 
            alt="Background"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.15 }}
            priority
            quality={100}
          />
          
          {/* Extra atmospheric elements */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1423] via-transparent to-transparent opacity-60"></div>
        </div>

        {/* Header and content */}
        <div className="relative z-10 min-h-screen">
          <Header />
          <main className="h-[calc(100vh-5rem)] overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
} 