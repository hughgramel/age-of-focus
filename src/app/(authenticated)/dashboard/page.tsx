'use client';

import { useRouter } from 'next/navigation';
import FirebaseTest from '@/components/FirebaseTest';

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="w-full h-screen bg-[#0B1423] flex flex-col items-center justify-center">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-[#FFD700] mb-4 font-serif">Age of Focus</h1>
        <p className="text-gray-400 text-lg">Shape your nation's destiny</p>
      </div>
      
      <div className="flex flex-col gap-4 w-64">
        <button
          onClick={() => router.push('/game')}
          className="w-full px-8 py-3 bg-[#162033] text-[#FFD700] rounded-lg border border-[#FFD700]/25 hover:bg-[#1C2942] transition-colors duration-200"
        >
          Start Game
        </button>
        
        <button
          onClick={() => router.push('/demo')}
          className="w-full px-8 py-3 bg-transparent text-[#FFD700] rounded-lg border border-[#FFD700]/25 hover:bg-[#162033] transition-colors duration-200"
        >
          View Demo
        </button>
      </div>
      
      {/* Temporary Firebase connection test */}
      <div className="mt-8">
        <FirebaseTest />
      </div>
    </div>
  );
} 