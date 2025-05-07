'use client';

interface BackButtonProps {
  onClick: () => void;
}

export default function BackButton({ onClick }: BackButtonProps) {
  const borderColor = '#d1d5db'; // gray-300
  const shadowColor = '#d1d5db'; // gray-300
  const activeShadowColor = '#e5e7eb'; // gray-200

  return (
    <button
      onClick={onClick}
      className={`
        p-2.5 rounded-lg 
        bg-white 
        border-2 
        transition-all duration-150 ease-in-out 
        flex items-center justify-center
        hover:border-gray-400 hover:translate-y-[-1px]
        active:translate-y-[0.5px]
      `}
      aria-label="Back to home"
      style={{
        borderColor: borderColor,
        boxShadow: `0 3px 0px ${shadowColor}`,
        transform: 'translateY(-2px)', // Initial lift
        minWidth: '44px', // Adjusted for new padding
        minHeight: '44px' // Adjusted for new padding
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.boxShadow = `0 1px 0px ${activeShadowColor}`;
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.boxShadow = `0 3px 0px ${shadowColor}`;
      }}
      onMouseLeave={(e) => {
        if (e.buttons === 1) {
          e.currentTarget.style.boxShadow = `0 3px 0px ${shadowColor}`;
        }
      }}
    >
      <span className="text-2xl leading-none">🏠</span> {/* Icon size adjusted if needed, text-2xl seems okay */}
    </button>
  );
} 