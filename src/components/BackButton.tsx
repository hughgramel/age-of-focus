'use client';

interface BackButtonProps {
  onClick: () => void;
}

export default function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="p-2 sm:pt-4 sm:pb-3 sm:pl-4 sm:pr-4 rounded-lg backdrop-blur-sm transition-colors duration-200 hover:bg-gray-100 bg-white flex items-center justify-center"
      aria-label="Back to home"
      style={{
        boxShadow: '0 4px 0 rgba(229,229,229,255)',
        minWidth: '48px',
        minHeight: '48px'
      }}
    >
      <span className="text-2xl sm:text-3xl leading-none">🏠</span>
    </button>
  );
} 