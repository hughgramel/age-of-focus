'use client';

import { useRouter } from 'next/navigation';
import GameView from '@/components/GameView';
import { world_1836 } from '@/data/world_1836';

export default function GamePage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  return <GameView game={world_1836} onBack={handleBack} />;
} 