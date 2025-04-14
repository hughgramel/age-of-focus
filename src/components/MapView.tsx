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
  id: string;
  provinceIds: string[];
  color: string;
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
  const nationsRef = useRef<Map<string, Nation>>(new Map());
  const mouseStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const [openSections, setOpenSections] = useState({
    markets: true,
    army: true,
    research: true,
    industry: true
  });

  // Example resource stats - in a real app these would be dynamic
  const [resources] = useState<ResourceStats>({
    gold: 145,
    population: 32.5,
    industry: 62,
    research: 321,
    buildings: 68,
    military: 55
  });

  // Function to create a nation from provinces
  const createNation = useCallback((provinceIds: string[], color: string) => {
    // Convert province names to lowercase for case-insensitive matching
    const lowerProvinceIds = provinceIds.map(id => id.toLowerCase());
    
    // Find matching provinces
    const matchingProvinces: string[] = [];
    stateDataRef.current.forEach((state, id) => {
      if (lowerProvinceIds.includes(state.name.toLowerCase())) {
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
        id: nationId,
        provinceIds: matchingProvinces,
        color: color
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

    // Reset all states to their original colors first
    stateDataRef.current.forEach((state, id) => {
      const originalColor = originalColorsRef.current.get(id);
      // Only reset color if the state isn't part of a nation
      if (originalColor && !state.nationId) {
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
      // Only highlight if not part of a nation
      if (!newState.nationId) {
        const currentFill = newState.path.style.fill || window.getComputedStyle(newState.path).fill;
        if (!originalColorsRef.current.has(stateId)) {
          originalColorsRef.current.set(stateId, currentFill);
        }
        
        newState.path.style.transition = 'fill 0.2s ease';
        newState.path.style.fill = adjustColor(currentFill, 20);
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

  // Initialize map and state data
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!svgContainerRef.current) return;

    let isInitialized = false;

    fetch('/svg_maps/MapChart_Map_europe_colored.svg')
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

        // Add mouse event listeners to track dragging
        const handleMouseDown = (e: MouseEvent) => {
          mouseStartPosRef.current = { x: e.clientX, y: e.clientY };
          isDraggingRef.current = false;
        };

        const handleMouseMove = (e: MouseEvent) => {
          if (!mouseStartPosRef.current) return;
          
          const deltaX = Math.abs(e.clientX - mouseStartPosRef.current.x);
          const deltaY = Math.abs(e.clientY - mouseStartPosRef.current.y);
          
          // If moved more than 5 pixels, consider it a drag
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

          // Modified click handler
          const clickHandler = (e: MouseEvent) => {
            e.stopPropagation();
            if (!isDraggingRef.current) {
              handleStateClick(id);
            }
          };
          
          path.addEventListener('click', clickHandler);
          path.dataset.clickId = id;
        });

        // Create west coast nation immediately after loading provinces
        createNation(
          ['Washington', 'Oregon', 'California', 'Nevada'],
          '#6C7483'
        );

        // Print details for the specified states
        printStateDetails(['Washington', 'Oregon', 'California', 'Nevada', 'Idaho']);

        // Modify SVG click handler to check for dragging
        svg.addEventListener('click', () => {
          if (!isDraggingRef.current) {
            handleStateClick(null);
          }
        });

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
          maxZoom: 40,
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
                if (!isDraggingRef.current) {
                  handleStateClick(id);
                }
              });
            }
          });
          svg.removeEventListener('click', () => {
            if (!isDraggingRef.current) {
              handleStateClick(null);
            }
          });
          svg.removeEventListener('mousedown', handleMouseDown);
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
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
  }, [createNation]);

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
      {/* Status Bar */}
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

      {/* Right Sidebar */}
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

      <div 
        ref={svgContainerRef}
        className="w-full h-full border-[6px] border-blue-500"
      />

      {/* Terminal */}
      <Terminal />
    </div>
  );
} 