'use client';

import { useRouter } from 'next/navigation';
import GameView from '@/components/GameView';
import { dummyGame } from '@/data/dummyGame';

export default function GamePage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  return <GameView game={dummyGame} onBack={handleBack} />;
} 