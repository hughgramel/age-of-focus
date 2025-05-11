'use client';

interface TaskListButtonProps {
  fadeIn: boolean;
  onClick: () => void;
}

export default function TaskListButton({ fadeIn, onClick }: TaskListButtonProps) {
  const bgColor = '#67b9e7';
  const darkColor = '#4792ba';

  return (
    <button
      onClick={onClick}
      className={`
        w-full
        [font-family:var(--font-mplus-rounded)] 
        rounded-xl text-white font-semibold border-2
        flex items-center justify-center 
        transition-all duration-150 ease-in-out
        py-3.5 px-7
        hover:translate-y-[-1px] active:translate-y-[0.5px]
        ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      style={{
        backgroundColor: bgColor,
        borderColor: darkColor,
        boxShadow: `0 3px 0px ${darkColor}`,
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.boxShadow = `0 1px 0px ${darkColor}`;
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.boxShadow = `0 3px 0px ${darkColor}`;
      }}
      onMouseLeave={(e) => { // Reset shadow if mouse leaves while pressed
        if (e.buttons === 1) { // Check if mouse button is still pressed
            e.currentTarget.style.boxShadow = `0 3px 0px ${darkColor}`;
        }
      }}
    >
      <div className="flex items-center justify-center gap-2">
        <span className="text-2xl sm:text-3xl">📝</span>
        <span className="hidden sm:inline text-xl sm:text-2xl">Tasks</span>
      </div>
    </button>
  );
} 