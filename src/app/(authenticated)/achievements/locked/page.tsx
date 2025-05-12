'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserService } from '@/services/userService';
import { achievements as allAchievements, Achievement } from '@/data/achievements/achievements_world_states';
import Link from 'next/link';

function getRequirementText(req: Achievement['requirements']) {
  const requirements = [];
  if (req.minGold) requirements.push(`${req.minGold.toLocaleString()} 💰`);
  if (req.minIndustry) requirements.push(`${req.minIndustry.toLocaleString()} 🏭`);
  if (req.minArmy) requirements.push(`${req.minArmy.toLocaleString()} ⚔️`);
  if (req.minPopulation) requirements.push(`${req.minPopulation.toLocaleString()} 👥`);
  if (req.minProvinces) requirements.push(`${req.minProvinces} provinces`);
  if (req.requiredProvinces?.length) requirements.push(`${req.requiredProvinces.length} specific provinces`);
  if (req.tag) requirements.push(`As ${req.tag}`);
  return requirements.join(' • ');
}

export default function LockedAchievementsPage() {
  const { user } = useAuth();
  const [lockedAchievements, setLockedAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocked = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const achievementsCol = (await import('firebase/firestore')).collection;
        const db = (await import('@/lib/firebase')).db;
        const snapshot = await (await import('firebase/firestore')).getDocs(achievementsCol(db, 'users', user.uid, 'achievements'));
        const unlockedIds = new Set(snapshot.docs.map(doc => doc.id));
        setLockedAchievements(allAchievements.filter(a => !unlockedIds.has(a.id)));
      } finally {
        setLoading(false);
      }
    };
    fetchLocked();
  }, [user]);

  return (
    <div className="w-full max-w-6xl [font-family:var(--font-mplus-rounded)] py-8 mx-auto">
      <div className="flex flex-col gap-8">
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0B1423]">Locked Achievements</h1>
            <Link href="/achievements" className="inline-block px-5 py-2 rounded-lg border-2 border-gray-300 bg-white text-[#0B1423] font-semibold shadow-[0_4px_0px] shadow-gray-300 hover:bg-gray-50 transition-all duration-150 ml-4">
              Back to All
            </Link>
          </div>
          <div className="bg-white rounded-lg p-6 border-2 border-gray-300 shadow-[0_4px_0px] shadow-gray-300">
            {loading ? (
              <div className="text-center py-8 text-[#0B1423]/50">Loading locked achievements...</div>
            ) : lockedAchievements.length === 0 ? (
              <p className="text-center text-[#0B1423]/50 py-8">Congratulations! You have unlocked all achievements.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {lockedAchievements.map(ach => (
                  <div key={ach.id} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 opacity-70">
                    <span className="text-2xl select-none">{ach.icon}</span>
                    <div>
                      <div className="font-bold text-[#0B1423] text-base">{ach.name}</div>
                      <div className="text-xs text-gray-700 mb-1">{ach.description}</div>
                      <div className="text-xs text-gray-500">Requirements: {getRequirementText(ach.requirements)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 