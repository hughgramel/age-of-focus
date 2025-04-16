'use client';

import { useRouter } from 'next/navigation';
import GameView from '@/components/GameView';

export default function DemoPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  return <GameView isDemo onBack={handleBack} />;
} 