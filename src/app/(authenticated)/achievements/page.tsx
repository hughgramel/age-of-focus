'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserService } from '@/services/userService';
import { achievements as allAchievements } from '@/data/achievements/achievements_world_states';
import Link from 'next/link';

export default function AchievementsPage() {
  const { user } = useAuth();
  const [userAchievements, setUserAchievements] = useState<{ id: string; unlockedAt: Date }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const achievementsCol = (await import('firebase/firestore')).collection;
        const db = (await import('@/lib/firebase')).db;
        const snapshot = await (await import('firebase/firestore')).getDocs(achievementsCol(db, 'users', user.uid, 'achievements'));
        const unlocked = snapshot.docs.map(doc => ({
          id: doc.id,
          unlockedAt: doc.data().unlockedAt?.toDate ? doc.data().unlockedAt.toDate() : null
        })).sort((a, b) => b.unlockedAt - a.unlockedAt);
        setUserAchievements(unlocked);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, [user]);

  return (
    <div className="w-full max-w-6xl [font-family:var(--font-mplus-rounded)] py-8 mx-auto">
      <div className="flex flex-col gap-8">
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0B1423]">All Achievements</h1>
            <div className="flex gap-2 ml-4">
              <Link href="/achievements/locked" className="inline-block px-5 py-2 rounded-lg border-2 border-gray-300 bg-white text-[#0B1423] font-semibold shadow-[0_4px_0px] shadow-gray-300 hover:bg-gray-50 transition-all duration-150">
                View Locked
              </Link>
              <Link href="/profile" className="inline-block px-5 py-2 rounded-lg border-2 border-gray-300 bg-white text-[#0B1423] font-semibold shadow-[0_4px_0px] shadow-gray-300 hover:bg-gray-50 transition-all duration-150">
                Back to Profile
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border-2 border-gray-300 shadow-[0_4px_0px] shadow-gray-300">
            {loading ? (
              <div className="text-center py-8 text-[#0B1423]/50">Loading achievements...</div>
            ) : userAchievements.length === 0 ? (
              <p className="text-center text-[#0B1423]/50 py-8">No achievements unlocked yet. Play to earn your first achievement!</p>
            ) : (
              <div className="flex flex-col gap-4">
                {userAchievements.map(({ id, unlockedAt }) => {
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 