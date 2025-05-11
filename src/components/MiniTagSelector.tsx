'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Tag } from '@/types/tag';

interface MiniTagSelectorProps {
  availableTags: Tag[];
  selectedTagId: string | null;
  onTagSelect: (tagId: string | null) => void;
  onTriggerColorEditor: (tag: Tag, anchorEl: HTMLElement) => void;
  buttonClassName?: string;
  dropdownWidth?: string; // e.g., 'w-40'
}

const MiniTagSelector: React.FC<MiniTagSelectorProps> = ({
  availableTags,
  selectedTagId,
  onTagSelect,
  onTriggerColorEditor,
  buttonClassName = '',
  dropdownWidth = 'w-48', // Default width for the dropdown
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedTag = useMemo(() => {
    return availableTags.find(tag => tag.id === selectedTagId) || null;
  }, [selectedTagId, availableTags]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleSelect = (tagId: string | null, e: React.MouseEvent) => {
    e.stopPropagation();
    onTagSelect(tagId);
    setIsOpen(false);
  };

  const handleColorDotClick = (e: React.MouseEvent, tag: Tag) => {
    e.stopPropagation(); // Prevent dropdown from toggling if it's part of the button
    if (buttonRef.current) {
      onTriggerColorEditor(tag, buttonRef.current);
    }
    setIsOpen(false); // Close dropdown if it was open
  };

  return (
    <div className={`relative inline-block text-left ${buttonClassName}`} ref={wrapperRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggleDropdown}
        className={`
          flex items-center justify-between gap-1 px-1.5 py-0.5 rounded 
          border border-transparent 
          hover:border-gray-300 
          transition-colors text-xs
          ${selectedTag ? '' : 'text-gray-400 hover:text-blue-600'}
        `}
        title={selectedTag ? "Change tag / Edit color" : "Add tag"}
      >
        {selectedTag ? (
          <>
            <span
              className="w-2.5 h-2.5 rounded-full cursor-pointer hover:scale-110 transition-transform flex-shrink-0"
              style={{ backgroundColor: selectedTag.color }}
              onClick={(e) => handleColorDotClick(e, selectedTag)}
              title={`Edit color for ${selectedTag.name}`}
            ></span>
            <span className="truncate leading-none text-black" style={{ fontSize: '0.7rem', fontWeight: 500 }}>
              {selectedTag.name}
            </span>
          </>
        ) : (
          <span className="leading-none text-xs">+ Add Tag</span>
        )}
        <span 
            className="transform transition-transform duration-150 text-gray-400" 
            style={{ transform: isOpen ? 'rotate(180deg)' : 'none', fontSize: '0.6rem' }}
        >
            ▼
        </span>
      </button>

      {isOpen && (
        <div
          className={`
            absolute z-20 mt-1 ${dropdownWidth} rounded-md shadow-lg bg-white 
            ring-1 ring-black ring-opacity-5 focus:outline-none
            max-h-48 overflow-y-auto py-1 text-xs
          `}
          // Position it above if it's near the bottom, simplified for now
          // More complex positioning might be needed depending on scroll context
          style={{ top: '100%', right: 0 }} // Default to below and right-aligned
        >
          <div
            onClick={(e) => handleSelect(null, e)}
            className="px-2 py-1.5 cursor-pointer hover:bg-gray-100 text-gray-500 italic"
          >
            - None -
          </div>
          {availableTags.map((tag) => (
            <div
              key={tag.id}
              onClick={(e) => handleSelect(tag.id, e)}
              className="px-2 py-1.5 cursor-pointer hover:bg-gray-100 flex items-center gap-1.5"
            >
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }}></span>
              <span className="text-gray-700 truncate">{tag.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MiniTagSelector; 