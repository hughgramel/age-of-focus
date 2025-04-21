'use client';

interface NationalPathButtonProps {
  fadeIn: boolean;
  onClick: () => void;
}

export default function NationalPathButton({ fadeIn, onClick }: NationalPathButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`[font-family:var(--font-mplus-rounded)] px-2 py-3 sm:py-4 w-full sm:w-4/10 rounded-xl text-white hover:opacity-90 transition-all duration-300 ease-in-out ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
      style={{ 
        backgroundColor: '#e28d24',
        fontSize: '22px',
        fontWeight: '600',
        boxShadow: '0 4px 0 #b36d15',
        transform: 'translateY(-2px)'
      }}
    >
      <div className="flex items-center justify-center gap-2">
        <span className="text-2xl sm:text-3xl">🎯</span>
        <span className="text-xl sm:text-2xl">National Focus</span>
      </div>
    </button>
  );
} 