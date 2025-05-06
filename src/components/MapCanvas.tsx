'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import panzoom from 'panzoom';

interface MapCanvasProps {
  mapName: string;
  children?: React.ReactNode;
  onStateClick?: (stateId: string | null) => void;
  onMapReady?: (stateMap: Map<string, StateData>) => void;
  disableKeyboardControls?: boolean;
  initialFocusProvinceId?: string;
}

export interface StateData {
  id: string;
  name: string;
  color: string;
  path: SVGPathElement;
  nationId?: string;
}

export default function MapCanvas({ mapName, children, onStateClick, onMapReady, disableKeyboardControls = false, initialFocusProvinceId }: MapCanvasProps) {
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
    console.log('[MapCanvas Debug] Starting initializeZoom...');
    const calculateInitialZoom = () => {
      const svgRect = svg.getBoundingClientRect();
      const containerRect = svgContainerRef.current?.getBoundingClientRect();
      console.log('[MapCanvas Debug] SVG Rect:', svgRect);
      console.log('[MapCanvas Debug] Container Rect:', containerRect);
      if (!containerRect || svgRect.width === 0 || svgRect.height === 0) {
        console.log('[MapCanvas Debug] Invalid rects, defaulting zoom to 1');
        return 1;
      }
      const widthRatio = containerRect.width / svgRect.width;
      const heightRatio = containerRect.height / svgRect.height;
      const initialZoom = Math.min(widthRatio, heightRatio) * 10;
      console.log('[MapCanvas Debug] Width Ratio:', widthRatio, 'Height Ratio:', heightRatio, 'Initial Zoom Calc:', initialZoom);
      return initialZoom;
    };

    const initialZoomLevel = calculateInitialZoom();
    initialZoomRef.current = initialZoomLevel;
    console.log(`[MapCanvas Debug] Calculated Initial Zoom Level: ${initialZoomLevel}`);

    // Initialize panzoom with only the basic fit-zoom options
    const panzoomInstance = panzoom(svg, {
      maxZoom: 40,
      minZoom: initialZoomLevel * 0.8,
      initialZoom: initialZoomLevel,
      smoothScroll: false,
      bounds: true,
      boundsPadding: 0.6
    });

    panzoomInstanceRef.current = panzoomInstance;
    console.log(`[MapCanvas Debug] Panzoom initialized. MinZoom: ${initialZoomLevel * 0.8}, MaxZoom: 40, InitialZoom: ${initialZoomLevel}`);
    return { panzoomInstance, initialZoomLevel };
  }, []);

  // Handle direct zooming based on trackpad/wheel input
  const handleZoom = useCallback((zoomIn: boolean, delta: number) => {
    console.log(`[MapCanvas Debug] handleZoom called. ZoomIn: ${zoomIn}, Delta: ${delta}`);
    if (!panzoomInstanceRef.current) {
      console.log('[MapCanvas Debug] handleZoom skipped: No panzoom instance.');
      return;
    }

    // Use a small base scale factor
    const baseScale = 0.0008;
    const scaleFactor = 1 + (Math.abs(delta) * baseScale);
    console.log(`[MapCanvas Debug] Calculated Scale Factor: ${scaleFactor}`);
    
    const currentTransform = panzoomInstanceRef.current.getTransform();
    const currentScale = currentTransform.scale;
    const nextScale = zoomIn ? currentScale * scaleFactor : currentScale / scaleFactor;
    console.log(`[MapCanvas Debug] Current Scale: ${currentScale}, Proposed Next Scale: ${nextScale}`);

    // Check zoom bounds
    const minZoom = initialZoomRef.current * 0.8;
    const maxZoom = 40;
    if ((zoomIn && nextScale < maxZoom) || (!zoomIn && nextScale > minZoom)) {
      console.log(`[MapCanvas Debug] Zoom within bounds (Min: ${minZoom}, Max: ${maxZoom}). Applying zoom.`);
      // Get viewport center for centered zooming
      const containerRect = svgContainerRef.current?.getBoundingClientRect();
      if (!containerRect) {
        console.log('[MapCanvas Debug] handleZoom skipped: No container rect.');
        return;
      }
      
      const centerX = containerRect.width / 2;
      const centerY = containerRect.height / 2;
      console.log(`[MapCanvas Debug] Zooming towards center: X=${centerX}, Y=${centerY}`);

      // Add log before calling zoomTo

      // Apply zoom directly
      console.log(`[MapCanvas Debug] Calling panzoom.zoomTo with scaleFactor: ${scaleFactor}. Expecting scale near ${nextScale.toFixed(4)}.`);
      console.log("centerX", centerX);
      console.log("centerY", centerY);
      console.log("scaleFactor", scaleFactor);
      panzoomInstanceRef.current.zoomTo(centerX, centerY, scaleFactor);

      const newTransform = panzoomInstanceRef.current.getTransform();
      console.log(`[MapCanvas Debug] Zoom applied. New Scale: ${newTransform.scale}`);
    } else {
      console.log(`[MapCanvas Debug] Zoom outside bounds. Min: ${minZoom}, Max: ${maxZoom}. Scale not applied.`);
    }
  }, []);

  // Handle WASD keyboard controls for smooth panning
  useEffect(() => {
    // If keyboard controls are disabled, don't set up the event listeners
    if (disableKeyboardControls) return;

    const baseSpeed = 45;  // Base movement speed
    const shiftMultiplier = 3;  // Shift key speed multiplier

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keydown if an input element has focus
      if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) {
          console.log('Input focused, ignoring map keydown.');
          return;
      }

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
  }, [disableKeyboardControls]);

  // Function to zoom to a specific province
  const zoomToProvince = useCallback((provinceId: string, targetScale?: number) => {
    console.log(`[MapCanvas Debug] Starting zoomToProvince. Target ID: ${provinceId}, Target Scale: ${targetScale}`);
    if (!panzoomInstanceRef.current || !stateDataRef.current.has(provinceId) || !svgContainerRef.current) {
        console.error('[MapCanvas Debug] Zoom prerequisites not met:', {
            hasInstance: !!panzoomInstanceRef.current,
            hasState: stateDataRef.current.has(provinceId),
            hasContainer: !!svgContainerRef.current
        });
        return;
    }

    const state = stateDataRef.current.get(provinceId)!;
    const bbox = state.path.getBBox();
    console.log(`[MapCanvas Debug] Target Province BBox: x=${bbox.x.toFixed(2)}, y=${bbox.y.toFixed(2)}, w=${bbox.width.toFixed(2)}, h=${bbox.height.toFixed(2)}`);
    // Restore original cx, cy calculation
    const cx = (bbox.x + bbox.width / 2);
    const cy = (bbox.y + bbox.height / 2);
    console.log(`[MapCanvas Debug] Calculated Center (SVG coords): cx=${cx.toFixed(2)}, cy=${cy.toFixed(2)}`);

    // Use known/calculated min/max zoom values directly
    const minZoom = initialZoomRef.current * 0.8;
    const maxZoom = 40;
    // Use the targetScale provided (which should be the initialFit level)
    const desiredScale = targetScale || initialZoomRef.current * 3; // Default zoom-in if no targetScale
    const finalScale = Math.max(minZoom, Math.min(maxZoom, desiredScale));

    console.log(`[MapCanvas Debug] MinZoom: ${minZoom.toFixed(2)}, MaxZoom: ${maxZoom}, Desired Scale: ${desiredScale.toFixed(2)}, Final Scale: ${finalScale.toFixed(2)}`);

    // 1. Apply the zoom centered on the SVG point (this might not center it visually)
    console.log(`[MapCanvas Debug] Applying zoomAbs: cx=${cx.toFixed(2)}, cy=${cy.toFixed(2)}, scale=${finalScale.toFixed(2)}`);
    panzoomInstanceRef.current.zoomAbs(cx, cy, finalScale);
    const postZoomTransform = panzoomInstanceRef.current.getTransform();
    console.log(`[MapCanvas Debug] Transform after zoomAbs: X=${postZoomTransform.x.toFixed(2)}, Y=${postZoomTransform.y.toFixed(2)}, Scale=${postZoomTransform.scale.toFixed(2)}`);

    // 2. Immediately calculate the required pan to center the point visually
    const containerRect = svgContainerRef.current.getBoundingClientRect();
    const containerCenterX = containerRect.width / 2;
    const containerCenterY = containerRect.height / 2;
    console.log(`[MapCanvas Debug] Container Center: X=${containerCenterX.toFixed(2)}, Y=${containerCenterY.toFixed(2)}`);

    // Calculate the desired top-left corner position for the panzoom transform
    const targetX = containerCenterX - (cx * finalScale);
    const targetY = containerCenterY - (cy * finalScale);
    console.log(`[MapCanvas Debug] Calculated target pan: targetX=${targetX.toFixed(2)}, targetY=${targetY.toFixed(2)}`);

    // 3. Move to the calculated position
    panzoomInstanceRef.current.moveTo(targetX, targetY);
    const finalTransform = panzoomInstanceRef.current.getTransform();
    console.log(`[MapCanvas Debug] Moved to target pan. Final Transform: X=${finalTransform.x.toFixed(2)}, Y=${finalTransform.y.toFixed(2)}, Scale=${finalTransform.scale.toFixed(2)}`);

  }, []); // Dependencies: Add any state/refs used inside if needed, e.g., initialZoomRef

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

        // Set up SVG for proper display - FIXED dimensions
        svg.style.display = 'block';
        svg.style.maxWidth = 'none';
        svg.style.maxHeight = 'none';
        svg.style.border = 'none';
        svg.style.outline = 'none';
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        // Process all paths in the SVG BEFORE initializing zoom
        // so stateDataRef is populated
        const paths = svg.querySelectorAll('path');
        paths.forEach((path) => {
          const id = path.id || crypto.randomUUID();
          const name = path.getAttribute('name') || id;
          const computedStyle = window.getComputedStyle(path);
          const color = computedStyle.fill;

          originalColorsRef.current.set(id, color);

          const stateData: StateData = {
            id,
            name,
            color,
            path: path as SVGPathElement
          };
          stateDataRef.current.set(id, stateData);

          const clickHandler = (e: MouseEvent) => {
            e.stopPropagation();
            if (!isDraggingRef.current && onStateClick) {
              onStateClick(id);
            }
          };
          
          path.addEventListener('click', clickHandler);
          path.dataset.clickId = id;
        });

        // Initialize zoom functionality (gets instance and initial level)
        const { initialZoomLevel } = initializeZoom(svg);

        // Add wheel event listener with explicit non-passive option
        svg.addEventListener('wheel', (e: WheelEvent) => {
          e.preventDefault();
          const zoomIn = e.deltaY < 0;
          handleZoom(zoomIn, e.deltaY);
        }, { passive: false }); // Explicitly set passive to false

        // Add mouse event listeners
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

        // Add click handler to SVG for deselection
        svg.addEventListener('click', (e: MouseEvent) => {
          const target = e.target as Element;
          if (target === svg && !isDraggingRef.current && onStateClick) {
            onStateClick(null);
          }
        });

        // Notify parent that map is ready
        if (onMapReady) {
          onMapReady(stateDataRef.current);
        }

        // --- Center on Capital AFTER Init (using setTimeout) ---
        if (initialFocusProvinceId && stateDataRef.current.has(initialFocusProvinceId)) {
          console.log(`Scheduling zoom to capital: ${initialFocusProvinceId} at level ${initialZoomLevel}`);
          setTimeout(() => {
            // Pass the calculated initialZoomLevel to zoomToProvince
            zoomToProvince(initialFocusProvinceId, initialZoomLevel);
          }, 100); // Delay might need adjustment
        } else {
          console.log('No valid initialFocusProvinceId provided, using default fit.');
        }
        // --- End Center on Capital --- 

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
      const svg = svgContainerRef.current?.querySelector('svg');
      if (svg) {
        // It's best practice to store handlers to remove them specifically
        // For now, we'll skip removal as it requires more refactoring
      }
      // Consider panzoom disposal if the component unmounts permanently
      // if (panzoomInstanceRef.current) {
      //    panzoomInstanceRef.current.dispose();
      //    panzoomInstanceRef.current = null;
      // }
    };
  }, [mapName, onStateClick, onMapReady, initialFocusProvinceId, initializeZoom, handleZoom, zoomToProvince]);

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