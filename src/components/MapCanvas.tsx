'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import panzoom from 'panzoom';

interface MapCanvasProps {
  mapName: string;
  children?: React.ReactNode;
  onStateClick?: (stateId: string | null) => void;
  onMapReady?: (stateMap: Map<string, StateData>) => void;
}

export interface StateData {
  id: string;
  name: string;
  color: string;
  path: SVGPathElement;
  nationId?: string;
}

export default function MapCanvas({ mapName, children, onStateClick, onMapReady }: MapCanvasProps) {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const panzoomInstanceRef = useRef<ReturnType<typeof panzoom> | null>(null);
  const keysPressed = useRef<Set<string>>(new Set<string>());
  const animationFrameId = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1);
  const stateDataRef = useRef<Map<string, StateData>>(new Map());
  const originalColorsRef = useRef<Map<string, string>>(new Map());
  const mouseStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Function to highlight a state (province)
  const highlightState = useCallback((stateId: string | null, color?: string) => {
    if (!stateDataRef.current) return;
    
    // Find the state data
    if (stateId && stateDataRef.current.has(stateId)) {
      const state = stateDataRef.current.get(stateId)!;
      
      // Store original color if not provided
      const originalColor = originalColorsRef.current.get(stateId) || state.path.style.fill;
      
      // Set highlight color
      state.path.style.transition = 'fill 0.2s ease';
      state.path.style.fill = color || adjustColor(originalColor, 40);
      
      return originalColor;
    }
    
    return null;
  }, []);
  
  // Function to reset a state's color
  const resetStateColor = useCallback((stateId: string | null, originalColor?: string) => {
    if (!stateDataRef.current || !stateId) return;
    
    if (stateDataRef.current.has(stateId)) {
      const state = stateDataRef.current.get(stateId)!;
      const colorToUse = originalColor || originalColorsRef.current.get(stateId) || state.color;
      
      state.path.style.transition = 'fill 0.2s ease';
      state.path.style.fill = colorToUse;
    }
  }, []);

  // Expose method to get state data
  const getStateData = useCallback((stateId: string) => {
    return stateDataRef.current.get(stateId);
  }, []);
  
  // Expose method to get all state data
  const getAllStateData = useCallback(() => {
    return stateDataRef.current;
  }, []);

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

  // Initialize panzoom with proper bounds and zoom constraints
  const initializeZoom = useCallback((svg: SVGElement) => {
    // Calculate initial zoom to fit SVG to screen while maintaining aspect ratio
    const calculateInitialZoom = () => {
      const svgRect = svg.getBoundingClientRect();
      const containerRect = svgContainerRef.current?.getBoundingClientRect();
      if (!containerRect) return 1;

      const widthRatio = containerRect.width / svgRect.width;
      const heightRatio = containerRect.height / svgRect.height;

      // Use the smaller ratio to ensure the entire map fits, with a slight padding
      return Math.min(widthRatio, heightRatio) * 1.2;
    };

    const initialZoom = calculateInitialZoom();
    initialZoomRef.current = initialZoom;

    // Initialize panzoom with constraints
    const panzoomInstance = panzoom(svg, {
      maxZoom: 40,                    // Maximum zoom level
      minZoom: initialZoom * 0.8,     // Minimum zoom level based on initial fit
      initialZoom: initialZoom,       // Start with the calculated fit zoom
      smoothScroll: false,            // Disable smooth scroll for better control
      bounds: true,                   // Enable bounds to prevent dragging outside
      boundsPadding: 0.1              // Add slight padding to bounds
    });

    panzoomInstanceRef.current = panzoomInstance;
    return panzoomInstance;
  }, []);

  // Handle direct zooming based on trackpad/wheel input
  const handleZoom = useCallback((zoomIn: boolean, delta: number) => {
    if (!panzoomInstanceRef.current) return;

    // Use a small base scale factor
    const baseScale = 0.0008;
    const scaleFactor = 1 + (Math.abs(delta) * baseScale);
    
    const currentScale = panzoomInstanceRef.current.getTransform().scale;
    const nextScale = zoomIn ? currentScale * scaleFactor : currentScale / scaleFactor;

    // Check zoom bounds
    if ((zoomIn && nextScale < 20) || (!zoomIn && nextScale > initialZoomRef.current * 0.8)) {
      // Get viewport center for centered zooming
      const containerRect = svgContainerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      
      const centerX = containerRect.width / 2;
      const centerY = containerRect.height / 2;

      // Apply zoom directly
      panzoomInstanceRef.current.zoomTo(centerX, centerY, scaleFactor);
    }
  }, []);

  // Handle WASD keyboard controls for smooth panning
  useEffect(() => {
    const baseSpeed = 45;  // Base movement speed
    const shiftMultiplier = 3;  // Shift key speed multiplier

    const handleKeyDown = (e: KeyboardEvent) => {
      // Add pressed key to tracking set
      keysPressed.current.add(e.key.toLowerCase());
      
      // Start movement animation if not already running
      if (!animationFrameId.current) {
        moveWithKeys();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Remove released key from tracking set
      keysPressed.current.delete(e.key.toLowerCase());
      
      // Stop animation if no keys are pressed
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
      
      // Apply speed modifier if shift is held
      const moveSpeed = keysPressed.current.has('shift') ? baseSpeed * shiftMultiplier : baseSpeed;
      
      // Calculate movement based on pressed keys
      if (keysPressed.current.has('w')) dy += moveSpeed;
      if (keysPressed.current.has('s')) dy -= moveSpeed;
      if (keysPressed.current.has('a')) dx += moveSpeed;
      if (keysPressed.current.has('d')) dx -= moveSpeed;

      // Apply diagonal movement normalization
      if (dx !== 0 && dy !== 0) {
        // Normalize diagonal movement to maintain consistent speed
        const normalizer = 1 / Math.sqrt(2);
        dx *= normalizer;
        dy *= normalizer;
      }

      // Apply movement if there's any change
      if (dx !== 0 || dy !== 0) {
        const nextX = transform.x + dx;
        const nextY = transform.y + dy;
        panzoomInstanceRef.current.moveTo(nextX, nextY);
      }

      // Continue animation if keys are still pressed
      if (keysPressed.current.size > 0) {
        animationFrameId.current = requestAnimationFrame(moveWithKeys);
      }
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Initialize map and state data
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let isInitialized = false;
    setIsLoading(true);

    const loadMap = async () => {
      try {
        const response = await fetch(`/svg_maps/${mapName}.svg`);
        if (!response.ok) throw new Error('Failed to load map');
        const svgText = await response.text();
        
        if (!svgContainerRef.current || isInitialized) return;
        isInitialized = true;
        
        svgContainerRef.current.innerHTML = svgText;
        
        const svg = svgContainerRef.current.querySelector('svg');
        if (!svg) return;

        // Set up SVG for proper display
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.border = 'none';
        svg.style.outline = 'none';
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        // Initialize zoom functionality
        const panzoomInstance = initializeZoom(svg);

        // Add wheel event listener for direct zooming
        svg.addEventListener('wheel', (e: WheelEvent) => {
          e.preventDefault();
          const zoomIn = e.deltaY < 0;
          handleZoom(zoomIn, e.deltaY);
        });

        // Add mouse event listeners to track dragging
        const handleMouseDown = (e: MouseEvent) => {
          mouseStartPosRef.current = { x: e.clientX, y: e.clientY };
          isDraggingRef.current = false;
        };

        const handleMouseMove = (e: MouseEvent) => {
          if (!mouseStartPosRef.current) return;
          
          const deltaX = Math.abs(e.clientX - mouseStartPosRef.current.x);
          const deltaY = Math.abs(e.clientY - mouseStartPosRef.current.y);
          
          if (deltaX > 5 || deltaY > 5) {
            isDraggingRef.current = true;
          }
        };

        const handleMouseUp = () => {
          mouseStartPosRef.current = null;
        };

        svg.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        // Process all paths in the SVG
        const paths = svg.querySelectorAll('path');
        
        paths.forEach((path) => {
          const id = path.id || crypto.randomUUID();
          const name = path.getAttribute('name') || id;
          const computedStyle = window.getComputedStyle(path);
          const color = computedStyle.fill;

          // Store original colors
          originalColorsRef.current.set(id, color);

          const stateData: StateData = {
            id,
            name,
            color,
            path: path as SVGPathElement
          };
          stateDataRef.current.set(id, stateData);

          // Add click handler
          const clickHandler = (e: MouseEvent) => {
            e.stopPropagation();
            if (!isDraggingRef.current && onStateClick) {
              onStateClick(id);
            }
          };
          
          path.addEventListener('click', clickHandler);
          path.dataset.clickId = id;
        });

        // Add click handler to SVG for deselection
        svg.addEventListener('click', (e: MouseEvent) => {
          const target = e.target as Element;
          // Only deselect if clicking the SVG background, not a province
          if (target === svg && !isDraggingRef.current && onStateClick) {
            onStateClick(null);
          }
        });

        // Notify parent that map is ready
        if (onMapReady) {
          onMapReady(stateDataRef.current);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading map:', error);
        setIsLoading(false);
        if (svgContainerRef.current) {
          svgContainerRef.current.innerHTML = `
            <div class="text-red-600 bg-red-100 p-4 rounded">
              Failed to load map. Please try refreshing the page.
            </div>
          `;
        }
      }
    };

    loadMap();

    // Cleanup
    return () => {
      // Do not dispose of panzoom on unmount to prevent reset
      // This is intentional to keep the map state
    };
  }, [mapName, initializeZoom, onStateClick, onMapReady]);

  return (
    <div className="w-full h-full bg-white relative overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
          <div className="text-lg text-gray-600">Loading map...</div>
        </div>
      )}

      <div 
        ref={svgContainerRef}
        className="w-full h-full overflow-hidden border-0"
        style={{ border: 'none !important' }}
      />
      
      {/* Render any additional UI elements passed as children */}
      {children}
    </div>
  );
} 