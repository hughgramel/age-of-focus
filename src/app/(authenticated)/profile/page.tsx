'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { TaskService } from '@/services/taskService';
import { Task } from '@/types/task';
import { GameService, SaveGame } from '@/services/gameService';
import { getNationFlag } from '@/utils/nationFlags';
import { getNationName } from '@/data/nationTags';
import { UserService } from '@/services/userService';
import { achievements as allAchievements } from '@/data/achievements/achievements_world_states';
import Link from 'next/link';

// Helper to format the date
const formatJoinDate = (date: Date | undefined): string => {
  if (!date) return 'Unknown';
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

// Helper to format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (Math.floor(num / 10000) / 100).toFixed(2) + 'M';
  } else if (num >= 1000) {
    return (Math.floor(num / 10) / 100).toFixed(2) + 'K';
  } else {
    return num.toString();
  }
};

// Helper function to format game date
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
  const [error, setError] = useState<string | null>(null);
  const [saveGames, setSaveGames] = useState<SaveGame[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [userAchievements, setUserAchievements] = useState<{ id: string; unlockedAt: Date }[]>([]);
  const [loadingAchievements, setLoadingAchievements] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setLoadingStats(true);
        setLoadingGames(true);
        setLoadingAchievements(true);
        try {
          const [userTasks, userGamesData, userAchievementDocs] = await Promise.all([
            TaskService.getUserTasks(user.uid),
            GameService.getSaveGames(user.uid),
            UserService.getUserAchievements(user.uid)
          ]);
          
          setTasks(userTasks);

          const gamesArray = Object.values(userGamesData)
            .filter((game): game is SaveGame => game !== null)
            .sort((a, b) => 
              new Date(b.metadata.savedAt).getTime() - new Date(a.metadata.savedAt).getTime()
            );
          setSaveGames(gamesArray);

          // Fetch achievement unlock dates
          const achievementsCol = (await import('firebase/firestore')).collection;
          const db = (await import('@/lib/firebase')).db;
          const snapshot = await (await import('firebase/firestore')).getDocs(achievementsCol(db, 'users', user.uid, 'achievements'));
          const unlocked = snapshot.docs.map(doc => ({
            id: doc.id,
            unlockedAt: doc.data().unlockedAt?.toDate ? doc.data().unlockedAt.toDate() : null
          })).sort((a, b) => b.unlockedAt - a.unlockedAt);
          setUserAchievements(unlocked);
        } catch (error) {
          console.error('Error loading profile data:', error);
          setError('Failed to load profile data.');
        } finally {
          setLoadingStats(false);
          setLoadingGames(false);
          setLoadingAchievements(false);
        }
      }
    };

    loadData();
  }, [user]);

  const completedTasks = tasks.filter(task => task.completed);
  const profileStats: ProfileStats = {
    totalSessions: completedTasks.length,
    totalFocusMinutes: completedTasks.length * 25,
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
      <div className="flex items-center justify-center pt-16">
        <div className="text-[#0B1423] text-xl [font-family:var(--font-mplus-rounded)]">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl [font-family:var(--font-mplus-rounded)] py-8">
      <div className="flex flex-col gap-8">
        <div className="w-full">
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0B1423]">
              {user.displayName || 'User'}
            </h1>
            <p className="text-sm text-[#0B1423]/70 mt-1">
              Joined {formatJoinDate(user.createdAt)}
            </p>
          </div>
          
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#0B1423] mb-4">Statistics</h2>
            {loadingStats ? (
              <div className="text-center py-8 text-[#0B1423]/50">Loading stats...</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard label="Total Sessions" value={formatNumber(profileStats.totalSessions)} icon="🎯" />
                <StatCard label="Focus Minutes" value={formatNumber(profileStats.totalFocusMinutes)} icon="⏱️" />
                <StatCard label="Tasks Done" value={formatNumber(profileStats.tasksCompleted)} icon="✅" />
              </div>
            )}
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-[#0B1423] mb-4">Recent Nations</h2>
            {loadingGames ? (
              <div className="text-center py-8 text-[#0B1423]/50">Loading nations...</div>
            ) : saveGames.length > 0 ? (
              <div className="space-y-3">
                {saveGames.slice(0, 5).map((gameData) => (
                  <RecentNationCard key={gameData.game.id} gameData={gameData} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6 border-2 border-gray-300 shadow-[0_4px_0px] shadow-gray-300">
                <p className="text-center text-[#0B1423]/50 py-4">
                  No saved nations found.
                </p>
              </div>
            )}
          </section>

          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#0B1423]">Recent Achievements</h2>
              <div className="flex gap-2 ml-4">
                {userAchievements.length > 0 && (
                  <>
                    <Link href="/achievements" className="inline-block px-5 py-2 rounded-lg border-2 border-gray-300 bg-white text-[#0B1423] font-semibold shadow-[0_4px_0px] shadow-gray-300 hover:bg-gray-50 transition-all duration-150">
                      View All
                    </Link>
                    <Link href="/achievements/locked" className="inline-block px-5 py-2 rounded-lg border-2 border-gray-300 bg-white text-[#0B1423] font-semibold shadow-[0_4px_0px] shadow-gray-300 hover:bg-gray-50 transition-all duration-150">
                      View Locked
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 border-2 border-gray-300 shadow-[0_4px_0px] shadow-gray-300">
              {loadingAchievements ? (
                <div className="text-center py-8 text-[#0B1423]/50">Loading achievements...</div>
              ) : userAchievements.length === 0 ? (
                <p className="text-center text-[#0B1423]/50 py-8">No achievements unlocked yet. Play to earn your first achievement!</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {userAchievements.slice(0, 10).map(({ id, unlockedAt }) => {
                      const ach = allAchievements.find(a => a.id === id);
                      if (!ach) return null;
                      return (
                        <div key={id} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <span className="text-2xl select-none">{ach.icon}</span>
                          <div>
                            <div className="font-bold text-[#0B1423] text-base">{ach.name}</div>
                            <div className="text-xs text-gray-700">{ach.description}</div>
                            <div className="text-xs text-gray-500 mt-1">{unlockedAt ? `Unlocked ${unlockedAt.toLocaleDateString()}` : ''}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </section>

          {error && (
            <div className="bg-red-50 border-2 border-red-300 text-red-700 px-6 py-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/profile/manage"
              className="inline-block px-6 py-3 font-semibold rounded-lg border-2 border-gray-300 bg-white text-[#0B1423] shadow-[0_4px_0px] shadow-gray-300 hover:bg-gray-50 active:translate-y-[1px] active:shadow-[0_2px_0px] shadow-gray-300/50 transition-all duration-150 mr-4"
            >
              Manage Account
            </Link>
            <button
              onClick={handleLogout}
              className="px-6 py-3 font-semibold rounded-lg border-2 border-gray-300 bg-white text-[#0B1423] shadow-[0_4px_0px] shadow-gray-300 hover:bg-gray-50 active:translate-y-[1px] active:shadow-[0_2px_0px] shadow-gray-300/50 transition-all duration-150"
            >
              Sign Out
            </button>
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
  icon: string;
}
const StatCard: React.FC<StatCardProps> = ({ label, value, icon }) => (
  <div className="bg-white rounded-lg p-4 border-2 border-gray-300 shadow-[0_4px_0px] shadow-gray-300 flex items-center">
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

  const playerNation = gameData.game.nations.find(n => n.nationTag === playerNationTag);
  const playerProvinces = gameData.game.provinces.filter(p => p.ownerTag === playerNationTag);

  const playerResources = {
    gold: playerNation?.gold ?? 0,
    population: playerProvinces.reduce((sum, p) => sum + p.population, 0),
    industry: playerProvinces.reduce((sum, p) => sum + p.industry, 0),
    army: playerProvinces.reduce((sum, p) => sum + p.army, 0),
  };

  const emojiStyle = {
    textShadow: `
      -0.5px -0.5px 0 rgba(0,0,0,0.1),
      0.5px -0.5px 0 rgba(0,0,0,0.1),
      -0.5px 0.5px 0 rgba(0,0,0,0.1),
      0.5px 0.5px 0 rgba(0,0,0,0.1)
    `
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 shadow-sm flex items-center justify-between gap-4 hover:bg-gray-100 transition duration-150">
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-3xl" style={emojiStyle}>{nationFlag}</span>
        <div>
          <h3 className="text-md font-bold text-[#0B1423]">
            {nationName}
          </h3>
          <p className="text-xs text-[#0B1423]/70">
            {gameDate}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-end gap-4 sm:gap-6 flex-wrap flex-shrink-0 ml-auto pl-2">
        <div className="flex items-center gap-1">
          <span className="text-base sm:text-lg" style={emojiStyle}>💰</span>
          <span className="text-[#0B1423] text-sm sm:text-base font-semibold whitespace-nowrap">
            {formatNumber(playerResources.gold)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-base sm:text-lg" style={emojiStyle}>👥</span>
          <span className="text-[#0B1423] text-sm sm:text-base font-semibold whitespace-nowrap">
            {formatNumber(playerResources.population)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-base sm:text-lg" style={emojiStyle}>🏭</span>
          <span className="text-[#0B1423] text-sm sm:text-base font-semibold whitespace-nowrap">
            {formatNumber(playerResources.industry)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-base sm:text-lg" style={emojiStyle}>⚔️</span>
          <span className="text-[#0B1423] text-sm sm:text-base font-semibold whitespace-nowrap">
            {formatNumber(playerResources.army)}
          </span>
        </div>
      </div>
    </div>
  );
}; 