'use client';

interface TaskListButtonProps {
  fadeIn: boolean;
  onClick: () => void;
}

export default function TaskListButton({ fadeIn, onClick }: TaskListButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`[font-family:var(--font-mplus-rounded)] py-3 sm:py-4 w-full sm:w-1/3 rounded-xl text-white hover:opacity-90 transition-all duration-300 ease-in-out ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
      style={{ 
        backgroundColor: '#67b9e7',
        fontSize: '22px',
        fontWeight: '700',
        boxShadow: '0 4px 0 #4792ba',
        transform: 'translateY(-2px)'
      }}
    >
      <div className="flex items-center justify-center gap-1">
        <span className="text-2xl sm:text-3xl">📋</span>
        <span className="text-xl sm:text-2xl">Tasks</span>
      </div>
    </button>
  );
} 