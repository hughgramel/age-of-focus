'use client';

import React, { useState, useEffect } from 'react';
import { getNationFlag } from '@/utils/nationFlags';
import { achievements, Achievement } from '@/data/achievements/achievements_world_states';
import { UserService } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';

interface MissionsModalProps {
  onClose: () => void;
  playerNationName: string;
  playerNationTag: string;
}

const AchievementUnlockedPopup = ({ achievementName, nationFlag, nationName, onClose, style }: { achievementName: string; nationFlag: string; nationName: string; onClose: () => void; style?: React.CSSProperties }) => (
  <div className="fixed z-50 bg-white border-2 border-gray-800 shadow-[0_8px_24px_4px_rgba(30,41,59,0.25)] rounded-lg px-5 py-3 flex items-center gap-3 animate-fade-in" style={style}>
    <span className="text-2xl">🏆</span>
    <div>
      <div className="font-bold text-gray-800">Achievement Unlocked</div>
      <div className="text-gray-700">{achievementName}</div>
      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">{nationFlag} {nationName}</div>
    </div>
    <button onClick={onClose} className="ml-3 text-gray-400 hover:text-gray-700 text-lg">✕</button>
  </div>
);

const AchievementCard = ({ achievement, isAvailable, unlocked }: { achievement: Achievement; isAvailable: boolean; unlocked: boolean }) => {
  const getRequirementText = (req: Achievement['requirements']) => {
    const requirements = [];
    if (req.minGold) requirements.push(`${req.minGold.toLocaleString()} 💰`);
    if (req.minIndustry) requirements.push(`${req.minIndustry.toLocaleString()} 🏭`);
    if (req.minArmy) requirements.push(`${req.minArmy.toLocaleString()} ⚔️`);
    if (req.minPopulation) requirements.push(`${req.minPopulation.toLocaleString()} 👥`);
    if (req.minProvinces) requirements.push(`${req.minProvinces} provinces`);
    if (req.requiredProvinces?.length) requirements.push(`${req.requiredProvinces.length} specific provinces`);
    if (req.tag) requirements.push(`As ${req.tag}`);
    return requirements.join(' • ');
  };

  return (
    <div
      className={`py-2 px-3 rounded-lg border-2 ${unlocked ? 'border-green-600 bg-green-50' : isAvailable ? 'border-gray-800 bg-white' : 'border-gray-300 bg-gray-50'} transition-all duration-200 flex items-start gap-3 relative`}
      style={{ boxShadow: unlocked ? '0 8px 24px 4px rgba(34,197,94,0.18)' : isAvailable ? undefined : '0 3px 0px #d1d5db', minHeight: 'unset' }}
    >
      <div className="text-2xl select-none mt-1">{achievement.icon}</div>
      <div className="flex-1">
        <h3 className={`font-bold text-base mb-1 ${unlocked ? 'text-green-700' : isAvailable ? 'text-gray-800' : 'text-gray-500'}`}>{achievement.name}</h3>
        <p className={`text-xs mb-2 ${unlocked ? 'text-green-600' : isAvailable ? 'text-gray-600' : 'text-gray-400'}`}>{achievement.description}</p>
        <div className={`text-xs ${unlocked ? 'text-green-700' : isAvailable ? 'text-gray-500' : 'text-gray-400'} bg-[#e6f4fa] p-1.5 rounded inline-block`}>{getRequirementText(achievement.requirements)}</div>
      </div>
    </div>
  );
};

export default function MissionsModal({ onClose, playerNationName, playerNationTag }: MissionsModalProps) {
  const [activeTab, setActiveTab] = useState<'missions' | 'achievements'>('missions');
  const [unlocked, setUnlocked] = useState<string[]>([]); // achievement ids
  const [popups, setPopups] = useState<{ name: string; nationFlag: string; nationName: string }[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    // Fetch unlocked achievements on mount
    UserService.getUserAchievements(user.uid).then(setUnlocked);
  }, [user]);

  // Simulate requirements check (replace with real game state check)
  const checkAndUnlockAchievements = async () => {
    if (!user) return;
    const newlyUnlocked: string[] = [];
    for (const achievement of achievements) {
      // Only check if not already unlocked and available for this natio
      console.log(achievement)
      const isAvailable = !achievement.requirements.tag || achievement.requirements.tag === playerNationTag;
      if (!isAvailable) continue;
      if (unlocked.includes(achievement.id)) continue;
      // TODO: Replace this with real requirements check
      const meetsRequirements = false; // <-- Replace with real logic
      if (meetsRequirements) {
        await UserService.unlockAchievement(user.uid, achievement.id);
        newlyUnlocked.push(achievement.id);
        setPopups(prev => [{
          name: achievement.name,
          nationFlag: getNationFlag(playerNationTag),
          nationName: playerNationName,
        }, ...prev]);
      }
    }
    if (newlyUnlocked.length > 0) {
      setUnlocked(prev => [...prev, ...newlyUnlocked]);
    }
  };

  useEffect(() => {
    // Call this function when you want to check achievements (e.g., after a game event)
    // checkAndUnlockAchievements();
  }, []);

  const isAchievementAvailable = (achievement: Achievement) => {
    const req = achievement.requirements;
    if (req.tag && req.tag !== playerNationTag) return false;
    return true;
  };

  // Remove popup after 3.5s
  useEffect(() => {
    if (popups.length === 0) return;
    const timer = setTimeout(() => {
      setPopups(prev => prev.slice(0, -1));
    }, 3500);
    return () => clearTimeout(timer);
  }, [popups]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ease-in-out opacity-100"
    >
      {/* Transparent Backdrop for closing */} 
      <div 
        className="absolute inset-0 z-0"
        onClick={onClose}
      ></div>

      {/* Modal Content Container - Match HabitsModal/TaskModal dimensions */} 
      <div 
        className="relative z-10 bg-white rounded-lg p-5 sm:p-7 w-full max-w-md sm:max-w-4xl [font-family:var(--font-mplus-rounded)] transition-transform duration-300 ease-in-out transform scale-100 mx-6 sm:mx-auto border-2 border-gray-300"
        style={{ boxShadow: '0 3px 0px #d1d5db' }}
      >
        {/* Header */} 
        <div className="flex justify-between items-center mb-2 sm:mb-3"> 
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-3xl sm:text-4xl">📜</span>
            Missions & Achievements
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl">
            ✕
          </button>
        </div>

        {/* Tabs */} 
        <div className="border-b border-gray-200 mb-5 sm:mb-7">
          <nav className="-mb-px flex gap-5 sm:gap-7" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('missions')}
              className={`whitespace-nowrap py-3.5 px-2 border-b-2 font-semibold text-sm sm:text-base transition-colors duration-200
                ${activeTab === 'missions' 
                  ? 'border-[#67b9e7] text-[#67b9e7]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <span className="mr-2.5">{getNationFlag(playerNationTag)}</span> 
              {playerNationName} Missions
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`whitespace-nowrap py-3.5 px-2 border-b-2 font-semibold text-sm sm:text-base transition-colors duration-200
                ${activeTab === 'achievements' 
                  ? 'border-[#67b9e7] text-[#67b9e7]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              Achievements
            </button>
          </nav>
        </div>

        {/* Conditional Content */} 
        <div className="max-h-[44vh] overflow-y-auto">
          {activeTab === 'missions' && (
            <div className="text-center py-11">
              <p className="text-xl sm:text-2xl text-gray-600">
                {playerNationName} Missions coming soon!
              </p>
            </div>
          )}
          {activeTab === 'achievements' && (
            <div className="space-y-4 p-1">
              {achievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isAvailable={isAchievementAvailable(achievement)}
                  unlocked={unlocked.includes(achievement.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Stacked popups, newest on top */}
      {popups.map((popup, idx) => (
        <AchievementUnlockedPopup
          key={popup.name + idx}
          achievementName={popup.name}
          nationFlag={popup.nationFlag}
          nationName={popup.nationName}
          onClose={() => setPopups(prev => prev.filter((_, i) => i !== idx))}
          style={{ bottom: `${1.5 + idx * 4}rem`, right: '1.5rem' }}
        />
      ))}
    </div>
  );
} 