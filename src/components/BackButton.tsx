'use client';

interface BackButtonProps {
  onClick: () => void;
}

export default function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="pt-4 pb-3 pl-4 pr-4 rounded-lg backdrop-blur-sm transition-colors duration-200 hover:bg-gray-100 bg-white"
      aria-label="Back to home"
      style={{
        boxShadow: '0 4px 0 rgba(229,229,229,255)',
      }}
    >
      <span className="text-3xl leading-none">🏠</span>
    </button>
  );
} 