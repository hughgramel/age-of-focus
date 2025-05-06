'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import Image from 'next/image';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import React from 'react';

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
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 ml-64 p-4 sm:p-6 md:p-8">
          {/* Page content goes here */}
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
} 