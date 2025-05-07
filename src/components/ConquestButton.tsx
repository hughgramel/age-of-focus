'use client';

interface ConquestButtonProps {
  fadeIn: boolean;
  onClick: () => void;
}

export default function ConquestButton({ fadeIn, onClick }: ConquestButtonProps) {
  const bgColor = '#dc2626'; 
  const darkColor = '#991b1b'; 

  return (
    <button
      onClick={onClick}
      className={`
        w-full
        [font-family:var(--font-mplus-rounded)] 
        rounded-xl text-white font-semibold border-2
        flex items-center justify-center 
        transition-all duration-150 ease-in-out
        py-3 px-6
        hover:translate-y-[-1px] active:translate-y-[0.5px]
        ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'} 
      `}
      style={{
        backgroundColor: bgColor,
        borderColor: darkColor,
        boxShadow: `0 3px 0px ${darkColor}`,
        minWidth: 'auto'
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.boxShadow = `0 1px 0px ${darkColor}`;
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.boxShadow = `0 3px 0px ${darkColor}`;
      }}
      onMouseLeave={(e) => { 
        if (e.buttons === 1) {
            e.currentTarget.style.boxShadow = `0 3px 0px ${darkColor}`;
        }
      }}
    >
      <div className="flex items-center justify-center gap-2">
        <span className="text-2xl">⚔️</span>
        <span className="hidden sm:inline text-xl">Conquer</span>
      </div>
    </button>
  );
} 