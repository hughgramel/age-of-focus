'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { TaskService } from '@/services/taskService';
import { Task } from '@/types/task';
import { FaEdit } from 'react-icons/fa'; // Using react-icons for the edit icon
import { GameService, SaveGame } from '@/services/gameService'; // Import GameService and SaveGame
import { getNationFlag } from '@/utils/nationFlags'; // Import nation flag utility
import { getNationName } from '@/data/nationTags'; // Import nation name utility

// Helper to format the date
const formatJoinDate = (date: Date | undefined): string => {
  if (!date) return 'Unknown';
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

// Helper to format large numbers (from statistics page)
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (Math.floor(num / 10000) / 100).toFixed(2) + 'M';
  } else if (num >= 1000) {
    return (Math.floor(num / 10) / 100).toFixed(2) + 'K';
  } else {
    return num.toString();
  }
};

// Helper function to format game date (similar to ResourceBar)
const formatGameDate = (dateString: string): string => {
  if (!dateString || !dateString.includes('-')) return 'Invalid Date';
  try {
    const [year, month, day] = dateString.split('-').map(part => parseInt(part, 10));
    const date = new Date(year, month - 1, day);
    
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return 'Invalid Date';
  }
};

interface ProfileStats {
  totalSessions: number;
  totalFocusMinutes: number;
  tasksCompleted: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null); // Keep error state for logout
  const [activeTab, setActiveTab] = useState('following'); // For right column tabs
  const [saveGames, setSaveGames] = useState<SaveGame[]>([]); // State for save games
  const [loadingGames, setLoadingGames] = useState(true); // Loading state for games

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setLoadingStats(true);
        setLoadingGames(true);
        try {
          // Fetch tasks and games concurrently
          const [userTasks, userGamesData] = await Promise.all([
            TaskService.getUserTasks(user.uid),
            GameService.getSaveGames(user.uid)
          ]);
          
          setTasks(userTasks);

          // Process and sort games
          const gamesArray = Object.values(userGamesData)
            .filter((game): game is SaveGame => game !== null) // Type guard
            .sort((a, b) => 
              new Date(b.metadata.savedAt).getTime() - new Date(a.metadata.savedAt).getTime()
            );
          setSaveGames(gamesArray);

        } catch (error) {
          console.error('Error loading profile data:', error);
          setError('Failed to load profile data.');
        } finally {
          setLoadingStats(false);
          setLoadingGames(false);
        }
      }
    };

    loadData();
  }, [user]);

  // Calculate Stats
  const completedTasks = tasks.filter(task => task.completed);
  const profileStats: ProfileStats = {
    totalSessions: completedTasks.length,
    totalFocusMinutes: completedTasks.length * 25, // Assuming 25 min per session
    tasksCompleted: completedTasks.length,
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/signin');
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Failed to sign out. Please try again.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-[#0B1423] text-xl [font-family:var(--font-mplus-rounded)]">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 bg-white min-h-screen [font-family:var(--font-mplus-rounded)]">
      {/* Optional: Background Banner Placeholder */} 
      <div className="h-32 sm:h-48 bg-gradient-to-r from-[#a2d2ff]/50 to-[#bde0fe]/50 rounded-t-xl relative mb-[-64px] sm:mb-[-80px]">
        {/* Banner Content can go here if needed */}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* --- Left Column --- */}
        <div className="w-full lg:w-2/3">
          {/* Profile Picture and Basic Info */}
          <div className="flex items-end mb-6">
            {/* Profile Picture Placeholder */} 
            <div className="relative mr-4 flex-shrink-0">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-300 border-4 border-white shadow-md flex items-center justify-center">
                <span className="text-6xl text-gray-500">👤</span> {/* Placeholder Icon */}
              </div>
              <button className="absolute bottom-2 right-2 bg-[#67b9e7] text-white rounded-full p-2 hover:bg-[#4792ba] transition duration-200 shadow-md">
                <FaEdit size={16} />
              </button>
            </div>
            {/* Name and Joined Date */} 
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#0B1423]">
                {user.displayName || 'User'}
              </h1>
              <p className="text-sm text-[#0B1423]/70 mt-1">
                Joined {formatJoinDate(user.createdAt)}
              </p>
            </div>
          </div>
          
          {/* Statistics Section */} 
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#0B1423] mb-4">Statistics</h2>
            {loadingStats ? (
              <div className="text-center py-8 text-[#0B1423]/50">Loading stats...</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard label="Total Sessions" value={formatNumber(profileStats.totalSessions)} icon="🎯" />
                <StatCard label="Focus Minutes" value={formatNumber(profileStats.totalFocusMinutes)} icon="⏱️" />
                <StatCard label="Tasks Done" value={formatNumber(profileStats.tasksCompleted)} icon="✅" />
                {/* Add more stat cards if needed */}
              </div>
            )}
          </section>

          {/* Recent Nations Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#0B1423] mb-4">Recent Nations</h2>
            {loadingGames ? (
              <div className="text-center py-8 text-[#0B1423]/50">Loading nations...</div>
            ) : saveGames.length > 0 ? (
              <div className="space-y-3">
                {saveGames.slice(0, 3).map((gameData) => (
                  <RecentNationCard key={gameData.game.id} gameData={gameData} />
                ))}
                {/* Optional: Link to see all saved games if needed */}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 border-2 border-[#67b9e7]/30 shadow-[4px_4px_0px_0px_rgba(103,185,231,0.3)]">
                <p className="text-center text-[#0B1423]/50 py-4">
                  No saved nations found.
                </p>
              </div>
            )}
          </section>

          {/* Achievements Section Placeholder */} 
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#0B1423] mb-4">Achievements</h2>
            <div className="bg-white rounded-xl p-6 border-2 border-[#67b9e7]/30 shadow-[4px_4px_0px_0px_rgba(103,185,231,0.3)]">
              <p className="text-center text-[#0B1423]/50 py-8">
                Achievements coming soon!
              </p>
              {/* Achievement items will go here */}
            </div>
          </section>

          {/* Error Message Display */} 
          {error && (
            <div className="bg-red-50 border-2 border-red-300 text-red-700 px-6 py-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          {/* Sign Out Button */} 
          <div className="mt-8 text-center">
            <button
              onClick={handleLogout}
              className="px-8 py-3 bg-white text-[#0B1423] rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 tracking-wide shadow-[2px_2px_0px_0px_rgba(156,163,175,0.2)]"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* --- Right Column --- */}
        <div className="w-full lg:w-1/3 lg:mt-[120px]"> {/* Increased top margin */}
          <div className="bg-white rounded-xl p-6 border-2 border-[#67b9e7]/30 shadow-[4px_4px_0px_0px_rgba(103,185,231,0.3)]">
            {/* Tabs */} 
            <div className="flex border-b border-[#67b9e7]/30 mb-4">
              <button 
                onClick={() => setActiveTab('following')}
                className={`flex-1 py-2 text-center font-semibold transition-colors duration-200 ${activeTab === 'following' ? 'text-[#67b9e7] border-b-2 border-[#67b9e7]' : 'text-[#0B1423]/60 hover:text-[#0B1423]'}`}
              >
                Following
              </button>
              <button 
                onClick={() => setActiveTab('followers')}
                className={`flex-1 py-2 text-center font-semibold transition-colors duration-200 ${activeTab === 'followers' ? 'text-[#67b9e7] border-b-2 border-[#67b9e7]' : 'text-[#0B1423]/60 hover:text-[#0B1423]'}`}
              >
                Followers
              </button>
            </div>
            
            {/* Tab Content */} 
            <div>
              {activeTab === 'following' && (
                <div className="text-center text-[#0B1423]/50 py-8">
                  Following list coming soon...
                  {/* Following user list will go here */}
                </div>
              )}
              {activeTab === 'followers' && (
                <div className="text-center text-[#0B1423]/50 py-8">
                  Followers list coming soon...
                  {/* Followers user list will go here */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for Statistic Cards
interface StatCardProps {
  label: string;
  value: string | number;
  icon: string; // Emoji icon
}
const StatCard: React.FC<StatCardProps> = ({ label, value, icon }) => (
  <div className="bg-white rounded-lg p-4 border-2 border-[#67b9e7]/30 shadow-[4px_4px_0px_0px_rgba(103,185,231,0.3)] flex items-center">
    <span className="text-3xl mr-3">{icon}</span>
    <div>
      <div className="text-[#0B1423] font-bold text-xl">{value}</div>
      <div className="text-[#0B1423]/70 text-sm">{label}</div>
    </div>
  </div>
);

// Helper component for Recent Nation Cards (Compact Version)
interface RecentNationCardProps {
  gameData: SaveGame;
}
const RecentNationCard: React.FC<RecentNationCardProps> = ({ gameData }) => {
  const playerNationTag = gameData.game.playerNationTag;
  const nationName = getNationName(playerNationTag);
  const nationFlag = getNationFlag(playerNationTag);
  const gameDate = formatGameDate(gameData.game.date);

  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 shadow-sm flex items-center justify-between hover:bg-gray-100 transition duration-150">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{nationFlag}</span>
        <div>
          <h3 className="text-md font-bold text-[#0B1423]">
            {nationName}
          </h3>
          <p className="text-xs text-[#0B1423]/70">
            {gameDate}
          </p>
        </div>
      </div>
      {/* Optional: Add a small indicator or button if needed */}
      {/* <span className="text-xs text-[#67b9e7]">Load</span> */}
    </div>
  );
}; 