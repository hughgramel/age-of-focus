'use client';

interface BackButtonProps {
  onClick: () => void;
}

export default function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed top-6 left-4 z-50 p-3 rounded-full backdrop-blur-sm border border-[#FFD700]/40 transition-colors duration-200 hover:bg-[#162033] bg-[#0B1423]/70"
      aria-label="Back to home"
    >
      <span className="text-3xl leading-none">🏠</span>
    </button>
  );
} 