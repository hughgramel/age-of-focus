'use client';

interface MissionsButtonProps {
  fadeIn: boolean;
  onClick: () => void;
}

export default function MissionsButton({ fadeIn, onClick }: MissionsButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`[font-family:var(--font-mplus-rounded)] p-2 sm:py-4 sm:px-6 rounded-xl text-white hover:opacity-90 transition-all duration-300 ease-in-out flex items-center justify-center ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
      style={{ 
        backgroundColor: '#ca8a04', // Gold/Yellow color (adjust as needed)
        fontWeight: '600',
        boxShadow: '0 4px 0 #854d0e', // Darker gold shadow
        transform: 'translateY(-2px)',
        minWidth: '56px' // Minimum width for icon button
      }}
    >
      <div className="flex items-center justify-center gap-2">
        <span className="text-2xl sm:text-3xl">📜</span> {/* Missions Icon (Scroll) */}
        <span className="hidden sm:inline text-xl sm:text-2xl">Missions</span>
      </div>
    </button>
  );
} 