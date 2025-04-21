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
    <div className="w-full max-w-6xl mx-auto px-4 py-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold text-[#0B1423] mb-8 text-center [font-family:var(--font-mplus-rounded)]">Your Statistics</h1>
      
      {/* Timeframe selector */}
      <div className="flex justify-center mb-8 space-x-4">
        {timeframes.map((timeframe) => (
          <button
            key={timeframe.id}
            onClick={() => setSelectedTimeframe(timeframe.id)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 [font-family:var(--font-mplus-rounded)] tracking-wide text-base 
              ${selectedTimeframe === timeframe.id 
                ? 'bg-[#67b9e7] text-white border-2 border-[#67b9e7] shadow-[0_4px_0_#4792ba]' 
                : 'bg-white text-[#0B1423] border-2 border-[#67b9e7]/30 hover:border-[#67b9e7] hover:bg-gray-50'
              }`}
            style={{ transform: selectedTimeframe === timeframe.id ? 'translateY(-2px)' : 'none' }}
          >
            {timeframe.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Focus Session Stats */}
        <div className="bg-white rounded-xl p-6 border-2 border-[#67b9e7]/30 shadow-[4px_4px_0px_0px_rgba(103,185,231,0.3)]">
          <h2 className="text-2xl font-bold text-[#0B1423] mb-6 [font-family:var(--font-mplus-rounded)]">Focus Sessions</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-[#67b9e7]/20">
              <span className="text-[#0B1423]/70 [font-family:var(--font-mplus-rounded)]">Total Sessions</span>
              <span className="text-[#0B1423] font-semibold text-xl [font-family:var(--font-mplus-rounded)]">{focusSessionStats.totalSessions}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#67b9e7]/20">
              <span className="text-[#0B1423]/70 [font-family:var(--font-mplus-rounded)]">Total Focus Minutes</span>
              <span className="text-[#0B1423] font-semibold text-xl [font-family:var(--font-mplus-rounded)]">{focusSessionStats.totalFocusMinutes}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#67b9e7]/20">
              <span className="text-[#0B1423]/70 [font-family:var(--font-mplus-rounded)]">Average Session Length</span>
              <span className="text-[#0B1423] font-semibold text-xl [font-family:var(--font-mplus-rounded)]">{focusSessionStats.averageSessionLength} min</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#67b9e7]/20">
              <span className="text-[#0B1423]/70 [font-family:var(--font-mplus-rounded)]">Longest Streak</span>
              <span className="text-[#0B1423] font-semibold text-xl [font-family:var(--font-mplus-rounded)]">{focusSessionStats.longestStreak} days</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#0B1423]/70 [font-family:var(--font-mplus-rounded)]">Current Streak</span>
              <span className="text-[#0B1423] font-semibold text-xl [font-family:var(--font-mplus-rounded)]">{focusSessionStats.currentStreak} days</span>
            </div>
          </div>
        </div>

        {/* Game Progress Stats */}
        <div className="bg-white rounded-xl p-6 border-2 border-[#67b9e7]/30 shadow-[4px_4px_0px_0px_rgba(103,185,231,0.3)]">
          <h2 className="text-2xl font-bold text-[#0B1423] mb-6 [font-family:var(--font-mplus-rounded)]">Game Progress</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-[#67b9e7]/20">
              <span className="text-[#0B1423]/70 [font-family:var(--font-mplus-rounded)]">Total Actions</span>
              <span className="text-[#0B1423] font-semibold text-xl [font-family:var(--font-mplus-rounded)]">{gameProgressStats.totalActions}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#67b9e7]/20">
              <span className="text-[#0B1423]/70 [font-family:var(--font-mplus-rounded)]">Resources Gained</span>
              <span className="text-[#0B1423] font-semibold text-xl [font-family:var(--font-mplus-rounded)]">{gameProgressStats.resourcesGained}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#67b9e7]/20">
              <span className="text-[#0B1423]/70 [font-family:var(--font-mplus-rounded)]">Population Growth</span>
              <span className="text-[#0B1423] font-semibold text-xl [font-family:var(--font-mplus-rounded)]">+{gameProgressStats.populationGrowth.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#67b9e7]/20">
              <span className="text-[#0B1423]/70 [font-family:var(--font-mplus-rounded)]">Military Strength</span>
              <span className="text-[#0B1423] font-semibold text-xl [font-family:var(--font-mplus-rounded)]">{gameProgressStats.militaryStrength.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#0B1423]/70 [font-family:var(--font-mplus-rounded)]">Industrial Capacity</span>
              <span className="text-[#0B1423] font-semibold text-xl [font-family:var(--font-mplus-rounded)]">{gameProgressStats.industrialCapacity}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-xl p-6 border-2 border-[#67b9e7]/30 shadow-[4px_4px_0px_0px_rgba(103,185,231,0.3)]">
        <h2 className="text-2xl font-bold text-[#0B1423] mb-6 [font-family:var(--font-mplus-rounded)]">Recent Activity</h2>
        <div className="space-y-4">
          <div className="text-center text-[#0B1423]/50 py-8 [font-family:var(--font-mplus-rounded)]">
            Your recent focus sessions and game actions will appear here.
          </div>
        </div>
      </div>
    </div>
  );
} 