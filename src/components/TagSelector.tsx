import React, { useState, useRef, useEffect } from 'react';
import { Tag } from '@/types/tag';

interface TagSelectorProps {
  userId: string; // Needed for creating new tags
  availableTags: Tag[]; // Active tags only
  selectedTagId: string | null;
  onTagSelect: (tagId: string | null) => void;
  onTagCreate: (name: string) => Promise<Tag | null>; // Returns the new tag or null on failure
  onColorChangeRequest: (tag: Tag) => void; // Callback to open color picker
  className?: string;
  anchorEl?: HTMLElement | null; // For positioning as a dropdown
  onClose?: () => void; // To close the selector when used as a dropdown
  // isOpenProp?: boolean; // Optional prop to control open state externally
}

const TagSelector: React.FC<TagSelectorProps> = ({
  userId,
  availableTags,
  selectedTagId,
  onTagSelect,
  onTagCreate,
  onColorChangeRequest,
  className = '',
  anchorEl,
  onClose,
  // isOpenProp
}) => {
  const [isOpen, setIsOpen] = useState(false); // Default to false
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [dynamicStyle, setDynamicStyle] = useState<React.CSSProperties>({});

  const selectedTag = availableTags.find(tag => tag.id === selectedTagId);

  // Control isOpen state based on anchorEl or isOpenProp
  useEffect(() => {
    if (anchorEl) {
      setIsOpen(true); // Open if anchored
    } 
    // If you want to use isOpenProp for external control, uncomment below
    // else if (isOpenProp !== undefined) {
    //   setIsOpen(isOpenProp);
    // }
  }, [anchorEl]); // Removed isOpenProp from dependencies for now

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // If also clicking outside the anchorEl (if one exists)
        if (anchorEl && !anchorEl.contains(event.target as Node)) {
            setIsOpen(false);
            setShowCreateInput(false);
            setNewTagName('');
            if (onClose) onClose(); // Call onClose if provided
        } else if (!anchorEl) {
            // Original behavior if not anchored (e.g. in a form)
            setIsOpen(false);
            setShowCreateInput(false);
            setNewTagName('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [anchorEl, onClose]); // Added anchorEl and onClose to dependency array

  useEffect(() => {
    if (showCreateInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showCreateInput]);

  useEffect(() => {
    if (anchorEl && isOpen && dropdownRef.current) {
      const anchorRect = anchorEl.getBoundingClientRect();
      
      // Estimate dropdown height for flipping logic (actual height can be complex with max-height)
      const estimatedDropdownHeight = 250; 
      const gap = 5; // Desired gap between anchor and popover

      const spaceBelow = window.innerHeight - anchorRect.bottom;
      const spaceAbove = anchorRect.top;

      let topPosition = anchorRect.bottom + window.scrollY + gap;
      // If not enough space below and enough space above, position above
      if (spaceBelow < estimatedDropdownHeight && spaceAbove > estimatedDropdownHeight && spaceAbove > spaceBelow) {
        topPosition = anchorRect.top + window.scrollY - estimatedDropdownHeight - gap;
      }

      const popoverWidth = 192; // Approx 12rem (w-48)
      let leftPosition = anchorRect.left + window.scrollX;

      // Adjust left position if it overflows viewport right
      const viewportWidth = document.documentElement.clientWidth;
      if (leftPosition + popoverWidth > viewportWidth - gap) { // gap as buffer from edge
        leftPosition = anchorRect.right + window.scrollX - popoverWidth;
        // Ensure it doesn't go off-screen left after adjustment
        if (leftPosition < gap) {
          leftPosition = gap;
        }
      }

      setDynamicStyle({
        position: 'absolute',
        top: `${topPosition}px`,
        left: `${leftPosition}px`,
        width: `${popoverWidth}px`,
        zIndex: 60,
      });
    } else {
      setDynamicStyle({}); // Clear style if not anchored or not open
    }
  }, [anchorEl, isOpen, availableTags]); // Rerun if anchor, open state, or list content changes


  const handleSelectAndClose = (tagId: string | null) => {
    onTagSelect(tagId);
    setIsOpen(false);
    setShowCreateInput(false);
    if (onClose) onClose();
  }

  const handleCreateAndSelect = async () => {
    if (!newTagName.trim() || isCreating) return;
    setIsCreating(true);
    const createdTag = await onTagCreate(newTagName.trim());
    setIsCreating(false);
    if (createdTag) {
      handleSelectAndClose(createdTag.id);
      setNewTagName('');
    } else {
      console.error("Failed to create tag");
    }
  };

  return (
    <div 
      className={`relative ${className}`} 
      ref={dropdownRef}
      style={anchorEl && isOpen ? dynamicStyle : {}} // Apply dynamic style only if anchored and open
    >
      {/* Trigger Button (only if not already anchored and opened by external element) */}
      {!anchorEl && (
        <button
          type="button"
          className="w-full bg-white text-black px-3 py-2 sm:px-4 sm:py-3 rounded-lg border-2 border-gray-300 cursor-pointer flex items-center justify-between transition-all duration-150 hover:bg-gray-50 hover:translate-y-[-1px] active:translate-y-[0.5px] active:shadow-[0_1px_0px_#d1d5db]"
          onClick={() => setIsOpen(!isOpen)}
          style={{ boxShadow: '0 2px 0px #d1d5db' }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0"> 
            {selectedTag ? (
              <>
                <span 
                  className="w-4 h-4 rounded-full flex-shrink-0 cursor-pointer hover:scale-110 transition-transform" 
                  style={{ backgroundColor: selectedTag.color }}
                  onClick={(e) => {
                      e.stopPropagation(); 
                      onColorChangeRequest(selectedTag);
                      setIsOpen(false); 
                  }}
                  title="Change tag color"
                ></span>
                <span className="truncate text-sm sm:text-base">{selectedTag.name}</span>
              </>
            ) : (
              <span className="text-gray-500 text-sm sm:text-base">Select Tag</span>
            )}
          </div>
          <span className="text-gray-500 transform transition-transform duration-200 ml-2" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
        </button>
      )}

      {/* Dropdown List (always show if isOpen, positioning handled by parent div if anchorEl) */} 
      {isOpen && (
        <div 
          className={`${anchorEl ? '' : 'mt-1'} bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-[250px] overflow-y-auto ${!anchorEl ? 'absolute z-50 w-full' : ''}`}
          // If anchored, parent is absolute. If not, this dropdown list is absolute.
        >
          {/* Create New Tag Input/Button */}
          {showCreateInput ? (
            <div className="p-2 flex gap-1 border-b border-gray-100">
              <input 
                ref={inputRef}
                type="text"
                placeholder="New tag name..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateAndSelect(); }}
                className="flex-1 px-3 py-2 text-sm text-black border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                style={{ boxShadow: '0 2px 0px #d1d5db' }}
              />
              <button 
                onClick={handleCreateAndSelect}
                disabled={isCreating || !newTagName.trim()}
                className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors border-2 border-blue-600 hover:border-blue-700 active:bg-blue-700"
                style={{ boxShadow: '0 2px 0px #2563eb'}} // blue-600 equivalent for shadow
              >
                {isCreating ? '...' : 'Add'}
              </button>
            </div>
          ) : (
            <div
              className="px-3 py-2 sm:px-4 sm:py-3 cursor-pointer flex items-center gap-2 hover:bg-gray-50 transition-colors duration-150 text-blue-600 font-medium text-sm"
              onClick={() => setShowCreateInput(true)}
            >
              <span>➕</span> Create New Tag
            </div>
          )}
          
           {/* None Option */}
           <div
              className={`px-3 py-2 sm:px-4 sm:py-3 cursor-pointer flex items-center gap-2 hover:bg-gray-50 transition-colors duration-150 text-gray-500 italic text-sm
                ${selectedTagId === null ? 'bg-gray-50' : ''}`}
              onClick={() => { handleSelectAndClose(null); }}
            >
             - None -
           </div>

          {/* Existing Tags */}
          {availableTags.map((tag) => (
            <div
              key={tag.id}
              className={`px-3 py-2 sm:px-4 sm:py-3 cursor-pointer flex items-center gap-2 hover:bg-gray-50 transition-colors duration-150 text-black
                ${selectedTagId === tag.id ? 'bg-gray-50' : ''}`}
              onClick={() => { handleSelectAndClose(tag.id); }}
            >
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }}></span>
              <span className="flex-1 truncate text-sm">{tag.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagSelector; 