import React, { useState, useRef, useEffect } from 'react';
import { Tag } from '@/types/tag';

// Define a predefined palette of colors (Tailwind classes or hex codes)
const COLOR_PALETTE = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#84cc16', // lime-500
  '#22c55e', // green-500
  '#14b8a6', // teal-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#78716c', // stone-500
  '#a1a1aa', // zinc-400 (lighter gray)
];

interface ColorPalettePickerProps {
  tagToEdit: Tag;
  onColorSelect: (tagId: string, newColor: string) => void;
  onClose: () => void;
  triggerElement: HTMLElement | null; // Changed from triggerRef
}

const ColorPalettePicker: React.FC<ColorPalettePickerProps> = ({
  tagToEdit,
  onColorSelect,
  onClose,
  triggerElement, // Changed from triggerRef
}) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Calculate position based on trigger element
  useEffect(() => {
    if (triggerElement) { // Changed from triggerRef.current
      const triggerRect = triggerElement.getBoundingClientRect();
      // Position below the trigger element
      setPosition({
        top: triggerRect.bottom + window.scrollY + 5, // 5px gap
        left: triggerRect.left + window.scrollX,
      });
    }
  }, [triggerElement]); // Changed from triggerRef

  // Close picker if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node) && 
          triggerElement && !triggerElement.contains(event.target as Node)) { // Changed from triggerRef.current
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, triggerElement]); // Changed from triggerRef

  return (
    <div
      ref={pickerRef}
      className="absolute z-[60] bg-white border border-gray-300 rounded-lg shadow-xl p-3"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="grid grid-cols-6 gap-2">
        {COLOR_PALETTE.map((color) => (
          <button
            key={color}
            type="button"
            className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 ${tagToEdit.color === color ? 'ring-2 ring-offset-1 ring-blue-500' : 'border-gray-200'}`}
            style={{ backgroundColor: color }}
            onClick={() => {
              onColorSelect(tagToEdit.id, color);
              onClose();
            }}
            title={`Set color to ${color}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPalettePicker; 