'use client';

import { getNationFlag } from '@/utils/nationFlags';

interface ResourceBarProps {
  playerGold: number;
  totalPopulation: number;
  totalIndustry: number;
  totalArmy: number;
  playerNationTag: string;
  gameDate: string;
  fadeIn?: boolean;
}

export default function ResourceBar({
  playerGold,
  totalPopulation,
  totalIndustry,
  totalArmy,
  playerNationTag,
  gameDate,
  fadeIn = true
}: ResourceBarProps) {
  // Format number with appropriate suffix (k for thousands, M for millions)
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (Math.floor(num / 10000) / 100).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (Math.floor(num / 10) / 100).toFixed(2) + 'K';
    } else {
      return num.toString();
    }
  };
  
  // Format date from YYYY-MM-DD to "Month Day, Year"
  const formatDate = (dateString: string): string => {
    const [year, month, day] = dateString.split('-').map(part => parseInt(part, 10));
    const date = new Date(year, month - 1, day);
    
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  return (
    <div 
      className={`fixed top-4 left-20 z-50 flex items-center gap-5 px-6 py-4 rounded-lg transition-all duration-1000 ease-in-out ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`} 
      style={{ 
        backgroundColor: 'rgba(11, 20, 35, 0.95)',
        border: '2px solid rgba(255, 215, 0, 0.4)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      }}
    >
      <div className="flex items-center gap-4 pr-4 border-r border-[#FFD700]/30">
        <div className="flex items-center border-r border-[#FFD700]/30 pr-4">
          <div className="relative" style={{ width: '40px', height: '40px' }}>
            <span 
              className="absolute left-1/2 top-1/2 transform -translate-x-7/12 -translate-y-1/2 text-6xl" 
              style={{ 
                textShadow: `
                  -1.5px -1.5px 0px rgba(255, 255, 255, 1),
                  1.5px -1.5px 0px rgba(255, 255, 255, 1),
                  -1.5px 1.5px 0px rgba(255, 255, 255, 1),
                  1.5px 1.5px 0px rgba(255, 255, 255, 1),
                  1.5px 1.5px 0px rgba(255, 255, 255, 1)
                `
              }}
            >
              {getNationFlag(playerNationTag)}
            </span>
          </div>
        </div>
        <span className="text-[#FFD700] font-semibold text-xl historical-game-title">
          {formatDate(gameDate)}
        </span>
      </div>
      
      <div className="flex items-center gap-8">
        {/* Gold */}
        <div className="flex items-center gap-3">
          <span className="text-4xl">💰</span>
          <span className="text-[#FFD700] text-xl historical-game-title">
            {formatNumber(playerGold)}
          </span>
        </div>
        
        {/* Population */}
        <div className="flex items-center gap-3">
          <span className="text-4xl">👥</span>
          <span className="text-[#FFD700] text-xl historical-game-title">
            {formatNumber(totalPopulation)}
          </span>
        </div>
        
        {/* Industry */}
        <div className="flex items-center gap-3">
          <span className="text-4xl">🏭</span>
          <span className="text-[#FFD700] text-xl historical-game-title">
            {formatNumber(totalIndustry)}
          </span>
        </div>
        
        {/* Army */}
        <div className="flex items-center gap-3">
          <span className="text-4xl">⚔️</span>
          <span className="text-[#FFD700] text-xl historical-game-title">
            {formatNumber(totalArmy)}
          </span>
        </div>
      </div>
    </div>
  );
} 