'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Statistics() {
  const { user } = useAuth();
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  // Dummy data for statistics
  const focusSessionStats = {
    totalSessions: 42,
    totalFocusMinutes: 1050,
    averageSessionLength: 25,
    longestStreak: 5,
    currentStreak: 3,
  };

  const gameProgressStats = {
    totalActions: 84,
    resourcesGained: 630,
    populationGrowth: 18500,
    militaryStrength: 8250,
    industrialCapacity: 75,
  };

  // Timeframe options
  const timeframes = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
    { id: 'all', label: 'All Time' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#FFD700] mb-8 text-center font-lora">Your Statistics</h1>
      
      {/* Timeframe selector */}
      <div className="flex justify-center mb-8 space-x-4">
        {timeframes.map((timeframe) => (
          <button
            key={timeframe.id}
            onClick={() => setSelectedTimeframe(timeframe.id)}
            className={`px-2 py-2 rounded-lg transition-all duration-200 font-lora tracking-wide text-base 
              ${selectedTimeframe === timeframe.id 
                ? 'bg-[#1C2942] text-[#FFD700] border border-[#FFD700]/60' 
                : 'text-gray-300 border border-[#FFD700]/30 hover:border-[#FFD700]/60 hover:bg-[#1C2942]/70'
              }`}
          >
            {timeframe.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Focus Session Stats */}
        <div className="backdrop-blur-sm bg-[#0B1423]/70 rounded-xl p-6 border border-[#FFD700]/30 shadow-lg">
          <h2 className="text-2xl font-bold text-[#FFD700] mb-6 font-lora">Focus Sessions</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-300">Total Sessions</span>
              <span className="text-white font-semibold text-xl">{focusSessionStats.totalSessions}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-300">Total Focus Minutes</span>
              <span className="text-white font-semibold text-xl">{focusSessionStats.totalFocusMinutes}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-300">Average Session Length</span>
              <span className="text-white font-semibold text-xl">{focusSessionStats.averageSessionLength} min</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-300">Longest Streak</span>
              <span className="text-white font-semibold text-xl">{focusSessionStats.longestStreak} days</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-300">Current Streak</span>
              <span className="text-white font-semibold text-xl">{focusSessionStats.currentStreak} days</span>
            </div>
          </div>
        </div>

        {/* Game Progress Stats */}
        <div className="backdrop-blur-sm bg-[#0B1423]/70 rounded-xl p-6 border border-[#FFD700]/30 shadow-lg">
          <h2 className="text-2xl font-bold text-[#FFD700] mb-6 font-lora">Game Progress</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-300">Total Actions</span>
              <span className="text-white font-semibold text-xl">{gameProgressStats.totalActions}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-300">Resources Gained</span>
              <span className="text-white font-semibold text-xl">{gameProgressStats.resourcesGained}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-300">Population Growth</span>
              <span className="text-white font-semibold text-xl">+{gameProgressStats.populationGrowth.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-300">Military Strength</span>
              <span className="text-white font-semibold text-xl">{gameProgressStats.militaryStrength.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-300">Industrial Capacity</span>
              <span className="text-white font-semibold text-xl">{gameProgressStats.industrialCapacity}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity (Placeholder) */}
      <div className="mt-8 backdrop-blur-sm bg-[#0B1423]/70 rounded-xl p-6 border border-[#FFD700]/30 shadow-lg">
        <h2 className="text-2xl font-bold text-[#FFD700] mb-6 font-lora">Recent Activity</h2>
        <div className="space-y-4">
          <div className="text-center text-gray-400 py-8">
            Your recent focus sessions and game actions will appear here.
          </div>
        </div>
      </div>
    </div>
  );
} 