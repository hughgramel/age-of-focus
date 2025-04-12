'use client';

import { useEffect, useRef } from 'react';
import panzoom, { PanZoomOptions } from 'panzoom';

export default function MapView() {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const panzoomInstanceRef = useRef<ReturnType<typeof panzoom> | null>(null);
  const keysPressed = useRef<Set<string>>(new Set<string>());
  const animationFrameId = useRef<number | null>(null);
  const zoomAnimationId = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1);

  // Handle smooth keyboard controls
  useEffect(() => {
    const baseSpeed = 8;
    const shiftMultiplier = 3;

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
      if (!animationFrameId.current) {
        moveWithKeys();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
      if (keysPressed.current.size === 0 && animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };

    const moveWithKeys = () => {
      if (!panzoomInstanceRef.current) return;
      
      const currentTransform = panzoomInstanceRef.current.getTransform();
      let dx = 0;
      let dy = 0;
      
      const moveSpeed = keysPressed.current.has('shift') ? baseSpeed * shiftMultiplier : baseSpeed;
      
      if (keysPressed.current.has('w')) dy += moveSpeed;
      if (keysPressed.current.has('s')) dy -= moveSpeed;
      if (keysPressed.current.has('a')) dx += moveSpeed;
      if (keysPressed.current.has('d')) dx -= moveSpeed;

      if (dx !== 0 || dy !== 0) {
        panzoomInstanceRef.current.moveTo(currentTransform.x + dx, currentTransform.y + dy);
      }

      if (keysPressed.current.size > 0) {
        animationFrameId.current = requestAnimationFrame(moveWithKeys);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Handle smooth zooming
  const startZooming = (zoomIn: boolean) => {
    if (zoomAnimationId.current) return;

    const zoom = () => {
      if (!panzoomInstanceRef.current) return;
      
      const currentScale = panzoomInstanceRef.current.getTransform().scale;
      const zoomFactor = zoomIn ? 1.03 : 0.97;
      
      // Check zoom bounds
      if (zoomIn && currentScale < 10) {
        panzoomInstanceRef.current.smoothZoom(0, 0, zoomFactor);
        zoomAnimationId.current = requestAnimationFrame(zoom);
      } else if (!zoomIn && currentScale > initialZoomRef.current * 0.8) {
        panzoomInstanceRef.current.smoothZoom(0, 0, zoomFactor);
        zoomAnimationId.current = requestAnimationFrame(zoom);
      } else {
        stopZooming();
      }
    };
    
    zoom();
  };

  const stopZooming = () => {
    if (zoomAnimationId.current) {
      cancelAnimationFrame(zoomAnimationId.current);
      zoomAnimationId.current = null;
    }
  };

  useEffect(() => {
    if (!svgContainerRef.current) return;

    fetch('/MapChart_Map.svg')
      .then(response => response.text())
      .then(svgContent => {
        if (!svgContainerRef.current) return;
        
        svgContainerRef.current.innerHTML = svgContent;
        
        const svg = svgContainerRef.current.querySelector('svg');
        if (!svg) return;

        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.style.border = '2px solid #d1d5db';

        // Calculate initial zoom to fit the SVG to screen
        const calculateInitialZoom = () => {
          const svgRect = svg.getBoundingClientRect();
          const containerRect = svgContainerRef.current?.getBoundingClientRect();
          if (!containerRect) return 1;

          // Calculate zoom ratios for both width and height
          const widthRatio = containerRect.width / svgRect.width;
          const heightRatio = containerRect.height / svgRect.height;

          // Use the smaller ratio and reduce it slightly to show more of the map
          return Math.min(widthRatio, heightRatio) * 1.0;
        };


        const initialZoom = calculateInitialZoom();
        initialZoomRef.current = initialZoom;

        const panzoomInstance = panzoom(svg, {
          maxZoom: 10,
          minZoom: initialZoom, // Allow slightly more zoom out
          initialZoom: initialZoom,
          bounds: true,
          boundsPadding: 0.4,
          beforeWheel: (e: WheelEvent) => {
            const delta = e.deltaY;
            const transform = panzoomInstance.getTransform();
            if (delta > 0 && transform.scale <= initialZoom * 0.8) {
              return false;
            }
            return true;
          },
          beforePan: (e: { dx: number; dy: number }) => {
            const transform = panzoomInstance.getTransform();
            
            const svg = svgContainerRef.current?.querySelector('svg');
            if (!svg) return true;
            
            const svgRect = svg.getBoundingClientRect();
            const containerRect = svgContainerRef.current?.getBoundingClientRect();
            if (!containerRect) return true;

            // Calculate the maximum allowed positions
            const maxX = containerRect.width - (svgRect.width * transform.scale * 0.1);
            const minX = -(svgRect.width * transform.scale - containerRect.width * 0.9);
            const maxY = 0; // Top of SVG
            const minY = -(svgRect.height * transform.scale - containerRect.height); // Bottom of SVG

            // Predict next position
            const nextX = transform.x + e.dx;
            const nextY = transform.y + e.dy;

            // Clamp the movement within bounds
            const clampedX = Math.min(Math.max(nextX, minX), maxX);
            const clampedY = Math.min(Math.max(nextY, minY), maxY);

            // If the position would be out of bounds, move to the clamped position instead
            if (clampedX !== nextX || clampedY !== nextY) {
              panzoomInstanceRef.current?.moveTo(clampedX, clampedY);
              return false;
            }

            return true;
          }
        } as PanZoomOptions);

        panzoomInstanceRef.current = panzoomInstance;

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

  useEffect(() => {
    return () => {
      if (zoomAnimationId.current) {
        cancelAnimationFrame(zoomAnimationId.current);
      }
    };
  }, []);

  return (
    <div className="w-full h-full bg-white relative">
      <div 
        ref={svgContainerRef}
        className="w-full h-full border-[6px] border-blue-500"
      />
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          className="bg-white border border-gray-300 rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-50"
          onMouseDown={() => startZooming(true)}
          onMouseUp={stopZooming}
          onMouseLeave={stopZooming}
        >
          +
        </button>
        <button
          className="bg-white border border-gray-300 rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-50"
          onMouseDown={() => startZooming(false)}
          onMouseUp={stopZooming}
          onMouseLeave={stopZooming}
        >
          -
        </button>
      </div>
    </div>
  );
} 