'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ScenarioSelectPage() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleScenarioSelect = (scenarioPath: string) => {
    setIsNavigating(true);
    setTimeout(() => {
      router.push(scenarioPath);
    }, 300);
  };

  const scenarios = [
    {
      id: '1836',
      title: '1836 - The Age of Revolutions',
      description: 'Navigate the turbulent era of industrialization and nationalism.',
      path: '/country_select?scenario=1836',
      implemented: true,
      buttonStyle: 'bg-[#67b9e7] text-white border-[#4792ba] shadow-[#4792ba] hover:bg-[#5aa8d6] active:bg-[#4792ba]',
      icon: '🌍'
    },
    {
      id: '1914',
      title: '1914 - The Great War (Soon)',
      description: 'Lead your nation through the crucible of the First World War.',
      path: '/country_select?scenario=1914',
      implemented: false,
      buttonStyle: 'bg-gray-300 text-gray-500 border-gray-400 shadow-gray-400 cursor-not-allowed',
      icon: '⚔️'
    },
     {
      id: '1936',
      title: '1936 - The Storm Gathers (Soon)',
      description: 'Prepare your nation for the defining conflict of the 20th century.',
      path: '/country_select?scenario=1936',
      implemented: false,
      buttonStyle: 'bg-gray-300 text-gray-500 border-gray-400 shadow-gray-400 cursor-not-allowed',
      icon: '🕊️'
    },
  ];

  return (
    <main className={`flex-1 flex flex-col items-center px-4 py-8 [font-family:var(--font-mplus-rounded)] h-full transition-opacity duration-300 ${isNavigating ? 'opacity-0' : 'opacity-100'}`}>
      <div className="w-full max-w-4xl mb-10 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#0B1423]">
          Select a Scenario
        </h1>
        <button
          onClick={() => router.push('/dashboard')}
          disabled={isNavigating}
          className="px-5 py-2.5 bg-white text-[#0B1423] rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 shadow-[2px_2px_0px_0px_rgba(156,163,175,0.2)] flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => scenario.implemented ? handleScenarioSelect(scenario.path) : alert('This scenario is not yet implemented.')}
            disabled={!scenario.implemented || isNavigating}
            className={`
              p-6 rounded-xl border-2 transition-all duration-200 
              flex flex-col items-start justify-between shadow-[0_4px_0px] hover:translate-y-[-2px] active:translate-y-[1px] active:shadow-[0_2px_0px]
              h-52 // Increased height for scenario cards
              ${isNavigating && scenario.implemented ? 'opacity-50 cursor-default' : scenario.buttonStyle}
              ${!scenario.implemented ? 'opacity-70' : ''} // Slightly dim unimplemented scenarios
            `}
          >
            <div className="w-full">
              <div className="flex items-center gap-3 mb-2">
                <span role="img" aria-label="scenario icon" className="text-3xl">{scenario.icon}</span>
                <h2 className="text-2xl font-semibold">{scenario.title}</h2>
              </div>
              <p className="text-sm opacity-80 text-left leading-relaxed">{scenario.description}</p>
            </div>
            {!scenario.implemented && (
              <span className="mt-auto text-xs font-semibold opacity-70 self-end">(Coming Soon)</span>
            )}
          </button>
        ))}
      </div>
    </main>
  );
} 