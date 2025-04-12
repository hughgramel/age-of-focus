'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import panzoom, { PanZoomOptions } from 'panzoom';

interface StateData {
  id: string;
  name: string;
  color: string;
  path: SVGPathElement;
}

export default function MapView() {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const panzoomInstanceRef = useRef<ReturnType<typeof panzoom> | null>(null);
  const keysPressed = useRef<Set<string>>(new Set<string>());
  const animationFrameId = useRef<number | null>(null);
  const zoomAnimationId = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const stateDataRef = useRef<Map<string, StateData>>(new Map());
  const originalColorsRef = useRef<Map<string, string>>(new Map());

  // Function to handle state selection
  const handleStateClick = useCallback((stateId: string | null) => {
    if (!stateDataRef.current) return;

    // Reset all states to their original colors first
    stateDataRef.current.forEach((state, id) => {
      const originalColor = originalColorsRef.current.get(id);
      if (originalColor) {
        state.path.style.fill = originalColor;
        state.path.style.transition = 'fill 0.2s ease';
      }
    });

    // If clicking the same state or clicking outside, just deselect
    if (!stateId || stateId === selectedState) {
      setSelectedState(null);
      return;
    }

    // Select new state
    const newState = stateDataRef.current.get(stateId);
    if (newState) {
      // Store original color if not already stored
      if (!originalColorsRef.current.has(stateId)) {
        const currentFill = newState.path.style.fill || window.getComputedStyle(newState.path).fill;
        originalColorsRef.current.set(stateId, currentFill);
      }
      
      // Apply highlight with transition
      const originalColor = originalColorsRef.current.get(stateId);
      if (originalColor) {
        newState.path.style.transition = 'fill 0.2s ease';
        newState.path.style.fill = adjustColor(originalColor, 20);
      }
    }

    setSelectedState(stateId);
  }, [selectedState]);

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
      
      const transform = panzoomInstanceRef.current.getTransform();
      let dx = 0;
      let dy = 0;
      
      const moveSpeed = keysPressed.current.has('shift') ? baseSpeed * shiftMultiplier : baseSpeed;
      
      if (keysPressed.current.has('w')) dy += moveSpeed;
      if (keysPressed.current.has('s')) dy -= moveSpeed;
      if (keysPressed.current.has('a')) dx += moveSpeed;
      if (keysPressed.current.has('d')) dx -= moveSpeed;

      if (dx !== 0 || dy !== 0) {
        const nextX = transform.x + dx;
        const nextY = transform.y + dy;
        panzoomInstanceRef.current.moveTo(nextX, nextY);
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

    const zoomSpeed = 0.03;
    let lastTime = performance.now();

    const zoom = () => {
      if (!panzoomInstanceRef.current) return;
      
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTime) / 16.67; // Normalize to 60fps
      lastTime = currentTime;

      const currentScale = panzoomInstanceRef.current.getTransform().scale;
      const zoomFactor = zoomIn ? (1 + zoomSpeed) : (1 - zoomSpeed);
      
      // Get the center point of the viewport
      const containerRect = svgContainerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      
      const centerX = containerRect.width / 2;
      const centerY = containerRect.height / 2;

      // Check zoom bounds
      const nextScale = currentScale * zoomFactor;
      if ((zoomIn && nextScale < 20) || (!zoomIn && nextScale > initialZoomRef.current * 0.8)) {
        panzoomInstanceRef.current.zoomTo(centerX, centerY, zoomFactor);
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

  // Helper function to adjust color brightness
  const adjustColor = (color: string, amount: number): string => {
    // Handle named colors
    if (!color.startsWith('#')) {
      const ctx = document.createElement('canvas').getContext('2d');
      if (!ctx) return color;
      ctx.fillStyle = color;
      color = ctx.fillStyle;
    }

    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Adjust brightness
    const newR = Math.min(255, Math.max(0, r + amount));
    const newG = Math.min(255, Math.max(0, g + amount));
    const newB = Math.min(255, Math.max(0, b + amount));

    // Convert back to hex
    return `#${(newR).toString(16).padStart(2, '0')}${
      (newG).toString(16).padStart(2, '0')}${
      (newB).toString(16).padStart(2, '0')}`;
  };

  // Initialize map and state data
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!svgContainerRef.current) return;

    let isInitialized = false;

    fetch('/MapChart_Map_no_border.svg')
      .then(response => response.text())
      .then(svgContent => {
        if (!svgContainerRef.current || isInitialized) return;
        isInitialized = true;
        
        svgContainerRef.current.innerHTML = svgContent;
        
        const svg = svgContainerRef.current.querySelector('svg');
        if (!svg) return;

        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.style.border = '2px solid #d1d5db';

        // Process all paths in the SVG
        const paths = svg.querySelectorAll('path');
        console.log(`Found ${paths.length} provinces in the SVG:`);
        console.log('----------------------------------------');
        
        paths.forEach((path) => {
          const id = path.id || crypto.randomUUID();
          const name = path.getAttribute('name') || id;
          const computedStyle = window.getComputedStyle(path);
          const color = computedStyle.fill;
          const bbox = path.getBBox();

          // Store state data
          const stateData: StateData = {
            id,
            name,
            color,
            path: path as SVGPathElement
          };
          stateDataRef.current.set(id, stateData);
          originalColorsRef.current.set(id, color);

          // Log detailed province data
          console.log(`Province: ${name}`);
          console.log(`  ID: ${id}`);
          console.log(`  Color: ${color}`);
          console.log(`  Position: x=${bbox.x.toFixed(2)}, y=${bbox.y.toFixed(2)}`);
          console.log(`  Size: width=${bbox.width.toFixed(2)}, height=${bbox.height.toFixed(2)}`);
          console.log(`  Path Data: ${path.getAttribute('d')?.substring(0, 50)}...`);
          console.log('----------------------------------------');

          // Add click listener
          const clickHandler = (e: MouseEvent) => {
            e.stopPropagation();
            handleStateClick(id);
          };
          
          path.addEventListener('click', clickHandler);
          path.dataset.clickId = id;
        });

        // Add click listener to SVG to deselect when clicking outside states
        svg.addEventListener('click', () => handleStateClick(null));

        // Calculate initial zoom to fit the SVG to screen
        const calculateInitialZoom = () => {
          const svgRect = svg.getBoundingClientRect();
          const containerRect = svgContainerRef.current?.getBoundingClientRect();
          if (!containerRect) return 1;

          const widthRatio = containerRect.width / svgRect.width;
          const heightRatio = containerRect.height / svgRect.height;

          return Math.min(widthRatio, heightRatio) * 1.2;
        };

        const initialZoom = calculateInitialZoom();
        initialZoomRef.current = initialZoom;

        // Initialize panzoom
        const panzoomInstance = panzoom(svg, {
          maxZoom: 20,
          minZoom: initialZoom * 0.8,
          initialZoom: initialZoom,
          smoothScroll: false,
          bounds: true,
          boundsPadding: 0.1
        });

        panzoomInstanceRef.current = panzoomInstance;

        return () => {
          paths.forEach((path) => {
            const id = path.dataset.clickId;
            if (id) {
              path.removeEventListener('click', (e) => {
                e.stopPropagation();
                handleStateClick(id);
              });
            }
          });
          svg.removeEventListener('click', () => handleStateClick(null));
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
    <div className="w-full h-full bg-white relative">
      <div 
        ref={svgContainerRef}
        className="w-full h-full border-[6px] border-blue-500"
      />
      {selectedState && stateDataRef.current.get(selectedState) && (
        <div className="absolute top-4 left-4 bg-white p-2 rounded shadow">
          {stateDataRef.current.get(selectedState)?.name}
        </div>
      )}
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