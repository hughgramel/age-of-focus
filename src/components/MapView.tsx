'use client';

import React from 'react';
import { useEffect, useRef, useState } from 'react';
import MapCanvas, { StateData } from './MapCanvas';
import panzoom from 'panzoom';

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
  researchPoints: number;
  currentResearchId: string | null;
  currentResearchProgress: number;
  buildQueue: any[] | null;
  isAI: boolean;
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
  selectedProvinceRef: React.RefObject<string | null>;
  onMapReady?: (stateMap: Map<string, StateData>) => void;
  disableKeyboardControls?: boolean;
  initialFocusProvinceId?: string;
  panzoomInstanceRef: React.RefObject<ReturnType<typeof panzoom> | null>;
}

const MapView = ({ 
  mapName = 'world_states', 
  isDemo = false, 
  nations, 
  onProvinceSelect,
  selectedProvinceRef,
  onMapReady,
  disableKeyboardControls = false,
  initialFocusProvinceId,
  panzoomInstanceRef
}: MapViewProps) => {
  const [openSections, setOpenSections] = useState({
    markets: true,
    army: true,
    research: true,
    industry: true
  });

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
    <MapCanvas 
      mapName={mapName}
      onStateClick={onProvinceSelect}
      onMapReady={onMapReady}
      disableKeyboardControls={disableKeyboardControls}
      initialFocusProvinceId={initialFocusProvinceId}
      panzoomInstanceRef={panzoomInstanceRef}
    >
    </MapCanvas >
  );
};

export default React.memo(MapView); 