'use client';

interface TaskListButtonProps {
  fadeIn: boolean;
  onClick: () => void;
}

export default function TaskListButton({ fadeIn, onClick }: TaskListButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-8 py-4 rounded-xl text-[#FFD700] hover:bg-[#0F1C2F] transition-all duration-300 ease-in-out ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
      style={{ 
        backgroundColor: 'rgba(11, 20, 35, 0.95)',
        border: '2px solid rgba(255, 215, 0, 0.4)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        minWidth: '220px'
      }}
    >
      <div className="flex items-center gap-4">
        <span className="text-3xl">📋</span>
        <span className="text-xl font-semibold historical-game-title">Task List</span>
      </div>
    </button>
  );
} 