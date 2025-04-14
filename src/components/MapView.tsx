'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import panzoom, { PanZoomOptions } from 'panzoom';
import Terminal from './Terminal';

interface StateData {
  id: string;
  name: string;
  color: string;
  path: SVGPathElement;
  nationId?: string; // Track which nation this province belongs to
}

interface Nation {
  nationTag: string;
  name: string;
  color: string;
  hexColor: string;
  provinces: {
    id: string;
    name: string;
    path: string;
    population: number;
    goldIncome: number;
    industry: number;
    buildings: any[];
    resourceType: string;
    army: number;
  }[];
  borderProvinces: any[] | null;
  gold: number;
  industry: number;
  researchPoints: number;
  currentResearchId: string | null;
  currentResearchProgress: number;
  buildQueue: any[] | null;
  isAI: boolean;
}

interface ResourceStats {
  gold: number;
  population: number;
  industry: number;
  research: number;
  buildings: number;
  military: number;
}

// SVG Icon Components
const GoldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(22, 28, 21, 0.95)" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#FFD78C" strokeWidth="2"/>
    <path d="M8 12h8M12 8v8" stroke="#FFD78C" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const PopulationIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(22, 28, 21, 0.95)" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="7" r="4" stroke="#FFD78C" strokeWidth="2"/>
    <path d="M4 19c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#FFD78C" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const IndustryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(22, 28, 21, 0.95)" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 19V9l6-4v4l6-4v4l4-2v12H4z" stroke="#FFD78C" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);

const ResearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(22, 28, 21, 0.95)" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="7" stroke="#FFD78C" strokeWidth="2"/>
    <path d="M16 16l4 4" stroke="#FFD78C" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const BuildingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(22, 28, 21, 0.95)" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 21h18M6 21V11l6-4 6 4v10" stroke="#FFD78C" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);

const MilitaryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(22, 28, 21, 0.95)" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4v16M4 12h16" stroke="#FFD78C" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="8" stroke="#FFD78C" strokeWidth="2"/>
  </svg>
);

// Flag component
const FranceFlag = () => (
  <svg width="48" height="32" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" width="16" height="32" fill="#002395"/>
    <rect x="16" width="16" height="32" fill="#FFFFFF"/>
    <rect x="32" width="16" height="32" fill="#ED2939"/>
  </svg>
);

// Modified resource display components
const ResourceDisplay = ({ 
  icon: Icon, 
  value, 
  change, 
  isPositive, 
  unit = '',
  showDivider = false 
}: { 
  icon: React.FC, 
  value: number, 
  change?: string, 
  isPositive?: boolean,
  unit?: string,
  showDivider?: boolean 
}) => (
  <div className="flex items-center gap-3">
    <div className="flex items-center gap-2">
      <Icon />
      <div className="flex flex-col">
        <span className="text-[#FFD78C] text-lg font-semibold leading-tight">
          {value}{unit}
        </span>
        {change && (
          <span className={`text-sm leading-tight ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : '-'}{change}
          </span>
        )}
      </div>
    </div>
    {showDivider && (
      <div className="h-10 w-px bg-[#FFD78C] opacity-30 mx-1" />
    )}
  </div>
);

// Sidebar section header with star rating
const SidebarHeader = ({ 
  title, 
  stars, 
  isOpen, 
  onToggle 
}: { 
  title: string, 
  stars: number, 
  isOpen: boolean,
  onToggle: () => void
}) => (
  <div 
    className="flex items-center justify-between px-3 py-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] cursor-pointer border-b border-[#444444]"
    onClick={onToggle}
  >
    <div className="flex items-center gap-2">
      <span className={`transform transition-transform ${isOpen ? 'rotate-90' : ''}`}>▶</span>
      <span className="text-[#D4B36F] font-semibold">{title}</span>
    </div>
    <div className="flex items-center gap-1">
      <span className="text-[#888888]">{stars}</span>
      <span className="text-[#FFD700]">★</span>
    </div>
  </div>
);

// Market item component
const MarketItem = ({ 
  name, 
  values 
}: { 
  name: string, 
  values: { value: number, isNegative: boolean }[] 
}) => (
  <div className="flex items-center justify-between px-3 py-1.5 hover:bg-[#3A3A3A]">
    <span className="text-[#CCCCCC] text-sm">{name}</span>
    <div className="flex gap-4">
      {values.map((v, i) => (
        <span 
          key={i} 
          className={v.isNegative ? 'text-red-400' : 'text-[#CCCCCC]'}
        >
          {v.isNegative ? '-' : ''}{v.value}
        </span>
      ))}
    </div>
  </div>
);

// Army item component
const ArmyItem = ({ 
  name, 
  current, 
  max 
}: { 
  name: string, 
  current: number, 
  max: number 
}) => (
  <div className="flex items-center justify-between px-3 py-1.5 hover:bg-[#3A3A3A]">
    <span className="text-[#CCCCCC] text-sm">{name}</span>
    <div className="flex items-center gap-1">
      <span className="text-[#CCCCCC]">{current}</span>
      <span className="text-[#666666]">/</span>
      <span className="text-[#666666]">{max}</span>
    </div>
  </div>
);

interface MapViewProps {
  mapName?: string;
  isDemo?: boolean;
  nations?: Nation[];
  onProvinceSelect?: (provinceId: string | null) => void;
}

export default function MapView({ mapName = 'world_states', isDemo = false, nations, onProvinceSelect }: MapViewProps) {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const panzoomInstanceRef = useRef<ReturnType<typeof panzoom> | null>(null);
  const keysPressed = useRef<Set<string>>(new Set<string>());
  const animationFrameId = useRef<number | null>(null);
  const zoomAnimationId = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1);
  const stateDataRef = useRef<Map<string, StateData>>(new Map());
  const originalColorsRef = useRef<Map<string, string>>(new Map());
  const nationsRef = useRef<Map<string, Nation>>(new Map());
  const mouseStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const [openSections, setOpenSections] = useState({
    markets: true,
    army: true,
    research: true,
    industry: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const originalProvinceColorsRef = useRef<Map<string, string>>(new Map());
  const selectedProvinceRef = useRef<string | null>(null);
  const selectedOriginalColorRef = useRef<string | null>(null);

  // Example resource stats - in a real app these would be dynamic
  const [resources] = useState<ResourceStats>({
    gold: 145,
    population: 32.5,
    industry: 62,
    research: 321,
    buildings: 68,
    military: 55
  });

  // Track zoom velocity and state
  const zoomVelocityRef = useRef<number>(0);
  const isZoomingRef = useRef<boolean>(false);
  const lastZoomTimeRef = useRef<number>(0);
  const zoomDirectionRef = useRef<boolean | null>(null);

  // Function to create a nation from provinces
  const createNation = useCallback((provinceIds: string[], color: string) => {
    // Find matching provinces
    const matchingProvinces: string[] = [];
    stateDataRef.current.forEach((state, id) => {
      if (provinceIds.includes(state.name)) {
        matchingProvinces.push(id);
        
        // Update province color and store nation association
        state.path.style.fill = color;
        state.path.style.transition = 'fill 0.2s ease';
        state.nationId = matchingProvinces.join('-'); // Store nation association
      }
    });

    if (matchingProvinces.length > 0) {
      const nationId = matchingProvinces.join('-');
      const nation: Nation = {
        nationTag: nationId,
        name: nationId,
        color: color,
        hexColor: color,
        provinces: matchingProvinces.map(id => ({
          id,
          name: stateDataRef.current.get(id)?.name || id,
          path: '',
          population: 0,
          goldIncome: 0,
          industry: 0,
          buildings: [],
          resourceType: 'gold',
          army: 0
        })),
        borderProvinces: null,
        gold: 0,
        industry: 0,
        researchPoints: 0,
        currentResearchId: null,
        currentResearchProgress: 0,
        buildQueue: null,
        isAI: false
      };
      
      nationsRef.current.set(nationId, nation);
      console.log(`Created nation with ID ${nationId}:`, nation);
      return nation;
    } else {
      console.warn('No matching provinces found for nation creation');
      return null;
    }
  }, []);

  // Function to handle state selection
  const handleStateClick = useCallback((stateId: string | null) => {
    if (!stateDataRef.current) return;

    // If we have a currently selected province, reset its color
    if (selectedProvinceRef.current && stateDataRef.current.has(selectedProvinceRef.current)) {
      const currentState = stateDataRef.current.get(selectedProvinceRef.current)!;
      if (selectedOriginalColorRef.current) {
        currentState.path.style.fill = selectedOriginalColorRef.current;
        currentState.path.style.transition = 'fill 0.2s ease';
      }
    }

    // If clicking the same province or clicking outside, just deselect
    if (!stateId || stateId === selectedProvinceRef.current) {
      selectedProvinceRef.current = null;
      selectedOriginalColorRef.current = null;
      onProvinceSelect?.(null);
      return;
    }

    const newState = stateDataRef.current.get(stateId);
    if (!newState) return;

    // Check if this province belongs to a nation
    const belongsToNation = nations?.some(nation => 
      nation.provinces.some(province => province.id === stateId)
    );

    // Only allow selection of provinces that belong to nations
    if (!belongsToNation) {
      return;
    }

    // Store the current color before modifying
    const currentFill = newState.path.style.fill || window.getComputedStyle(newState.path).fill;
    selectedOriginalColorRef.current = currentFill;

    // Apply highlight to the new selection
    newState.path.style.transition = 'fill 0.2s ease';
    newState.path.style.fill = adjustColor(currentFill, 40);

    // Update selection refs and notify parent
    selectedProvinceRef.current = stateId;
    onProvinceSelect?.(stateId);
  }, [nations, onProvinceSelect]);

  /**
   * Initialize panzoom with proper bounds and zoom constraints
   * @param svg - The SVG element to initialize panzoom on
   * @returns Initialized panzoom instance
   */
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

  /**
   * Handle direct zooming based on trackpad/wheel input
   * @param zoomIn - Boolean indicating zoom direction (true = in, false = out)
   * @param delta - The zoom delta from the wheel event
   */
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

  /**
   * Handle WASD keyboard controls for smooth panning
   */
  useEffect(() => {
    const baseSpeed = 45;  // Increased from 8 to 24 for faster base movement
    const shiftMultiplier = 3;  // Increased from 3 to 4 for even faster shift-movement

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

  // Function to print state details
  const printStateDetails = (stateNames: string[]) => {
    console.log('\nState Details Report:');
    console.log('===================');
    
    const lowerStateNames = stateNames.map(name => name.toLowerCase());
    let foundStates = 0;
    
    stateDataRef.current.forEach((state) => {
      if (lowerStateNames.includes(state.name.toLowerCase())) {
        foundStates++;
        const bbox = state.path.getBBox();
        console.log(`\nState: ${state.name}`);
        console.log(`ID: ${state.id}`);
        console.log(`Color: ${state.color}`);
        console.log(`Position: x=${bbox.x.toFixed(2)}, y=${bbox.y.toFixed(2)}`);
        console.log(`Size: width=${bbox.width.toFixed(2)}, height=${bbox.height.toFixed(2)}`);
        console.log(`Path Data: ${state.path.getAttribute('d')?.substring(0, 50)}...`);
        console.log(`Nation ID: ${state.nationId || 'None'}`);
        console.log('-----------------');
      }
    });
    
    console.log(`\nFound ${foundStates} out of ${stateNames.length} requested states.`);
    if (foundStates < stateNames.length) {
      const found = Array.from(stateDataRef.current.values())
        .filter(state => lowerStateNames.includes(state.name.toLowerCase()))
        .map(state => state.name);
      const missing = stateNames.filter(name => 
        !found.some(foundName => foundName.toLowerCase() === name.toLowerCase())
      );
      console.log('Missing states:', missing.join(', '));
    }
    console.log('===================\n');
  };

  // Function to color provinces based on nation ownership
  const colorNations = useCallback(() => {
    if (!nations || !svgContainerRef.current) return;

    console.log('Coloring nations:', nations);
    
    nations.forEach(nation => {
      console.log(`Processing nation ${nation.name} with color ${nation.color}`);
      nation.provinces.forEach(province => {
        const provinceId = province.id;
        console.log(`Looking for province path with id: ${provinceId}`);
        
        const path = svgContainerRef.current?.querySelector(`path#${provinceId}`) as SVGPathElement | null;
        
        if (path) {
          console.log(`Found path for province ${province.name}, applying color ${nation.color}`);
          // Store original color if not already stored
          if (!originalColorsRef.current.has(provinceId)) {
            originalColorsRef.current.set(provinceId, path.style.fill);
          }
          
          // Apply nation color
          path.style.fill = nation.color;
          
          // Store state data
          const stateData: StateData = {
            id: provinceId,
            name: province.name,
            color: nation.color,
            path: path,
            nationId: nation.nationTag
          };
          stateDataRef.current.set(provinceId, stateData);
        } else {
          console.warn(`Province path not found for ID: ${province.id}`);
        }
      });
    });
  }, [nations]);

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
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.style.border = '2px solid #d1d5db';

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
          originalProvinceColorsRef.current.set(id, color);

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
            if (!isDraggingRef.current) {
              handleStateClick(id);
            }
          };
          
          path.addEventListener('click', clickHandler);
          path.dataset.clickId = id;
        });

        // Color nations if provided
        if (nations) {
          colorNations();
        }

        // Add click handler to SVG for deselection
        svg.addEventListener('click', (e: MouseEvent) => {
          const target = e.target as Element;
          // Only deselect if clicking the SVG background, not a province
          if (target === svg && !isDraggingRef.current) {
            handleStateClick(null);
          }
        });

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
      // Reset selection on unmount
      if (selectedProvinceRef.current && stateDataRef.current.has(selectedProvinceRef.current)) {
        const currentState = stateDataRef.current.get(selectedProvinceRef.current)!;
        if (selectedOriginalColorRef.current) {
          currentState.path.style.fill = selectedOriginalColorRef.current;
        }
      }
      if (panzoomInstanceRef.current) {
        panzoomInstanceRef.current.dispose();
      }
    };
  }, [mapName, isDemo, createNation, colorNations, nations, initializeZoom, handleStateClick]);

  useEffect(() => {
    // Add Victorian-style font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="w-full h-full bg-white relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
          <div className="text-lg text-gray-600">Loading map...</div>
        </div>
      )}

      {/* Status Bar - only show in demo mode */}
      {isDemo && (
        <div className="fixed top-4 left-6 z-50 flex items-center gap-4 px-4 py-2 rounded" 
             style={{ 
               backgroundColor: 'rgba(20, 20, 20, 0.95)',
               border: '1px solid rgba(255, 215, 140, 0.3)',
               boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
               fontFamily: '"Playfair Display", serif'
             }}>
          <div className="flex items-center gap-4 pr-2">
            <FranceFlag />
          </div>
          <ResourceDisplay 
            icon={GoldIcon} 
            value={89.1} 
            change="5.75K" 
            isPositive={true}
            unit="M"
            showDivider={true}
          />
          <ResourceDisplay 
            icon={PopulationIcon} 
            value={91.6} 
            change="1487" 
            isPositive={true}
            unit="%"
            showDivider={true}
          />
          <ResourceDisplay 
            icon={IndustryIcon} 
            value={21.6} 
            change="1.34K" 
            isPositive={true}
            showDivider={true}
          />
          <ResourceDisplay 
            icon={BuildingsIcon} 
            value={34.8} 
            change="192" 
            isPositive={true}
            unit="M"
            showDivider={true}
          />
          <ResourceDisplay 
            icon={MilitaryIcon} 
            value={460} 
            change="273K" 
            isPositive={false}
            unit="K"
            showDivider={true}
          />
          <ResourceDisplay 
            icon={ResearchIcon} 
            value={16.2} 
            change="0" 
            unit="M"
          />
        </div>
      )}

      {/* Right Sidebar - only show in demo mode */}
      {isDemo && (
        <div 
          className="fixed right-4 top-1/2 -translate-y-1/2 w-72 bg-[#1F1F1F] rounded-lg overflow-hidden z-50"
          style={{
            border: '1px solid rgba(255, 215, 140, 0.3)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            fontFamily: '"Playfair Display", serif',
            maxHeight: 'min-content'
          }}
        >
          {/* Markets Section */}
          <div>
            <SidebarHeader 
              title="Markets" 
              stars={1} 
              isOpen={openSections.markets}
              onToggle={() => toggleSection('markets')}
            />
            {openSections.markets && (
              <div className="bg-[#1F1F1F]">
                <MarketItem 
                  name="New Englander Market" 
                  values={[
                    { value: 10601, isNegative: true },
                    { value: 3543, isNegative: true },
                    { value: 3464, isNegative: true },
                    { value: 3339, isNegative: true }
                  ]} 
                />
              </div>
            )}
          </div>

          {/* Army Section */}
          <div>
            <SidebarHeader 
              title="Army (152)" 
              stars={3} 
              isOpen={openSections.army}
              onToggle={() => toggleSection('army')}
            />
            {openSections.army && (
              <div className="bg-[#1F1F1F]">
                <ArmyItem name="1st New Englander Army" current={100} max={325} />
                <ArmyItem name="2nd New Englander Army" current={50} max={60} />
                <ArmyItem name="3rd New Englander Army" current={2} max={96} />
              </div>
            )}
          </div>

          {/* Research Section */}
          <div>
            <SidebarHeader 
              title="Research" 
              stars={4} 
              isOpen={openSections.research}
              onToggle={() => toggleSection('research')}
            />
            {openSections.research && (
              <div className="bg-[#1F1F1F] px-3 py-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#CCCCCC] text-sm">Current Progress</span>
                  <span className="text-[#4CAF50]">+11</span>
                </div>
                <div className="w-full h-2 bg-[#333333] rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-[#4CAF50]" />
                </div>
              </div>
            )}
          </div>

          {/* Industry Section */}
          <div>
            <SidebarHeader 
              title="Industry" 
              stars={3} 
              isOpen={openSections.industry}
              onToggle={() => toggleSection('industry')}
            />
            {openSections.industry && (
              <div className="bg-[#1F1F1F]">
                <div className="px-3 py-1.5 hover:bg-[#3A3A3A]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#CCCCCC] text-sm">New Englander Foods Inc.</span>
                    <span className="text-[#FFD78C]">£ 18.1</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#333333] mt-1 rounded-full overflow-hidden">
                    <div className="w-1/2 h-full bg-[#4CAF50]" />
                  </div>
                </div>
                <div className="px-3 py-1.5 hover:bg-[#3A3A3A]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#CCCCCC] text-sm">New Englander Oil Inc.</span>
                    <span className="text-[#FFD78C]">£ 60.6</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#333333] mt-1 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-[#4CAF50]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div 
        ref={svgContainerRef}
        className="w-full h-full border-[6px] border-blue-500"
      />

      {/* Terminal */}
      <Terminal />
    </div>
  );
} 