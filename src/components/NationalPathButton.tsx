'use client';

interface NationalPathButtonProps {
  fadeIn: boolean;
  onClick: () => void;
}

export default function NationalPathButton({ fadeIn, onClick }: NationalPathButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`[font-family:var(--font-mplus-rounded)] px-8 py-3 rounded-2xl text-white hover:opacity-90 transition-all duration-300 ease-in-out ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
      style={{ 
        backgroundColor: '#e28d24',
        fontSize: '18px',
        fontWeight: '600',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      Set national focus
    </button>
  );
} 