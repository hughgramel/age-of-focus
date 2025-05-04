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

  const emojiStyle = {
    textShadow: `
      -1px -1px 0 rgba(0,0,0,0.2),
      1px -1px 0 rgba(0,0,0,0.2),
      -1px 1px 0 rgba(0,0,0,0.2),
      1px 1px 0 rgba(0,0,0,0.2)
    `
  };

  return (
    <div 
      className={`[font-family:var(--font-mplus-rounded)] flex flex-row items-center justify-center sm:justify-start gap-x-3 sm:gap-x-5 px-3 sm:px-10 py-2 rounded-lg transition-all duration-1000 ease-in-out min-h-[48px] ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
      style={{ 
        backgroundColor: '#ffffff',
        border: '1px solid ',
        boxShadow: '0 4px 0 rgba(229,229,229,255)',
        transform: 'translateY(-2px)',
      }}
    >
      {/* Flag Section */}
      <div className="flex items-center gap-2 pr-3 sm:pr-4 sm:border-r border-black/10 flex-shrink-0">
        <div className="flex items-center">
          <div className="relative" style={{ width: '28px', height: '28px' }}>
            <span 
              className="absolute left-1/2 top-1/2 transform -translate-x-7/12 -translate-y-1/2 text-4xl sm:text-6xl"
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
      </div>
      
      {/* Date Section (hidden on small screens) */}
      <div className="hidden sm:block sm:border-r border-black/10 sm:pr-4 flex-shrink-0">
         <span className="text-black font-bold text-sm sm:text-xl whitespace-nowrap">
          {formatDate(gameDate)}
        </span>
      </div>
      
      {/* Resource Section (No wrap, slightly larger gaps/icons/text) */}
      <div className="flex items-center justify-center gap-3 sm:gap-5 flex-shrink-0">
        {/* Gold */}
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-xl sm:text-4xl" style={emojiStyle}>💰</span>
          <span className="text-black text-xs sm:text-xl font-bold whitespace-nowrap">
            {formatNumber(playerGold)}
          </span>
        </div>
        
        {/* Population */}
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-xl sm:text-4xl" style={emojiStyle}>👥</span>
          <span className="text-black text-xs sm:text-xl font-bold whitespace-nowrap">
            {formatNumber(totalPopulation)}
          </span>
        </div>
        
        {/* Industry */}
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-xl sm:text-4xl" style={emojiStyle}>🏭</span>
          <span className="text-black text-xs sm:text-xl font-bold whitespace-nowrap">
            {formatNumber(totalIndustry)}
          </span>
        </div>
        
        {/* Army */}
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-xl sm:text-4xl" style={emojiStyle}>⚔️</span>
          <span className="text-black text-xs sm:text-xl font-bold whitespace-nowrap">
            {formatNumber(totalArmy)}
          </span>
        </div>
      </div>
    </div>
  );
} 