'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const MapView = dynamic(() => import('./MapView'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <div className="text-gray-500">Loading map...</div>
    </div>
  )
});

export default function MapContainer() {
  return (
    <div className="w-full h-full">
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <div className="text-gray-500">Loading map...</div>
        </div>
      }>
        <MapView />
      </Suspense>
    </div>
  );
} 