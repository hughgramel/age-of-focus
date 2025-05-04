'use client';

interface ConquestButtonProps {
  fadeIn: boolean;
  onClick: () => void;
}

export default function ConquestButton({ fadeIn, onClick }: ConquestButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`[font-family:var(--font-mplus-rounded)] p-2 sm:py-4 sm:px-6 rounded-xl text-white hover:opacity-90 transition-all duration-300 ease-in-out flex items-center justify-center ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
      style={{ 
        backgroundColor: '#dc2626', // Red color
        fontWeight: '600',
        boxShadow: '0 4px 0 #991b1b', // Darker red shadow
        transform: 'translateY(-2px)',
        minWidth: '56px' // Minimum width for icon button
      }}
    >
      <div className="flex items-center justify-center gap-2">
        <span className="text-2xl sm:text-3xl">⚔️</span> {/* Conquest Icon */}
        <span className="hidden sm:inline text-xl sm:text-2xl">Conquest</span>
      </div>
    </button>
  );
} 