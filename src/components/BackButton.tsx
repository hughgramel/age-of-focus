'use client';

interface BackButtonProps {
  onClick: () => void;
}

export default function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 right-4 z-50 p-2 rounded-full backdrop-blur-sm border border-[#FFD78C20] transition-colors duration-200 group"
      aria-label="Back to home"
    >
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        className="text-[#FFD78C] opacity-70 group-hover:opacity-100 transition-opacity duration-200"
      >
        <path 
          d="M15 18L9 12L15 6" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
} 