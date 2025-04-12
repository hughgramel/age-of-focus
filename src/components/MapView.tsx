'use client';

import { useEffect, useRef } from 'react';
import panzoom from 'panzoom';

export default function MapView() {
  const svgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgContainerRef.current) return;

    // Load SVG content directly
    fetch('/MapChart_Map.svg')
      .then(response => response.text())
      .then(svgContent => {
        if (!svgContainerRef.current) return;
        
        // Insert SVG content
        svgContainerRef.current.innerHTML = svgContent;
        
        // Get the SVG element
        const svg = svgContainerRef.current.querySelector('svg');
        if (!svg) return;

        // Set SVG to fill container while maintaining aspect ratio
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.maxHeight = '100vh';

        // Initialize panzoom
        const panzoomInstance = panzoom(svg, {
          maxZoom: 10,
          minZoom: 0.5,
          bounds: true,
          boundsPadding: 0.2,
        });

        return () => {
          panzoomInstance.dispose();
        };
      })
      .catch(error => {
        console.error('Error loading SVG:', error);
        if (svgContainerRef.current) {
          svgContainerRef.current.innerHTML = `
            <div class="text-red-600 bg-red-100 p-4 rounded">
              Failed to load map. Please try refreshing the page.
            </div>
          `;
        }
      });
  }, []);

  return (
    <div className="relative w-full h-full min-h-[600px] bg-white">
      <div 
        ref={svgContainerRef}
        className="absolute inset-0 flex items-center justify-center"
      />
    </div>
  );
} 