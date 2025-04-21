'use client';

import { useEffect, useRef, useState } from 'react';
import MapCanvas, { StateData } from './MapCanvas';

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
}

export default function MapView({ 
  mapName = 'world_states', 
  isDemo = false, 
  nations, 
  onProvinceSelect,
  selectedProvinceRef,
  onMapReady,
  disableKeyboardControls = false
}: MapViewProps) {
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
    >
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
    </MapCanvas>
  );
} 