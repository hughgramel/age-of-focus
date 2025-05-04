'use client';

interface HabitsButtonProps {
  fadeIn: boolean;
  onClick: () => void;
}

export default function HabitsButton({ fadeIn, onClick }: HabitsButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`[font-family:var(--font-mplus-rounded)] p-2 sm:py-4 sm:px-6 rounded-xl text-white hover:opacity-90 transition-all duration-300 ease-in-out flex items-center justify-center ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
      style={{ 
        backgroundColor: '#e28d24',
        fontWeight: '600',
        boxShadow: '0 4px 0 #b36d15',
        transform: 'translateY(-2px)',
        minWidth: '56px'
      }}
    >
      <div className="flex items-center justify-center gap-2">
        <span className="text-2xl sm:text-3xl">🎯</span>
        <span className="hidden sm:inline text-xl sm:text-2xl">Habits</span>
      </div>
    </button>
  );
} 