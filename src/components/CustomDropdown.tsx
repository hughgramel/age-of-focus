import React, { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
  icon?: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  forceLabelVisible?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  className = '',
  placeholder = 'Select an option',
  forceLabelVisible = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className="bg-white text-black px-3 py-2 sm:px-4 sm:py-3 rounded-lg border-2 border-gray-300 cursor-pointer flex items-center justify-between transition-all duration-150 hover:bg-gray-50 hover:translate-y-[-1px] active:translate-y-[0.5px] active:shadow-[0_1px_0px_#d1d5db]"
        onClick={() => setIsOpen(!isOpen)}
        style={{ boxShadow: '0 2px 0px #d1d5db' }}
      >
        <div className="flex items-center gap-2 sm:flex-1">
          {selectedOption?.icon && <span className="text-xl ml-2">{selectedOption.icon}</span>}
          <span className={`${forceLabelVisible ? 'inline' : 'hidden sm:inline'} truncate`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <span className="text-gray-500 transform transition-transform duration-200 ml-2" style={{ 
          transform: isOpen ? 'rotate(180deg)' : 'none'
        }}>
          ▼
        </span>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
             style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {options.map((option) => (
            <div
              key={option.value}
              className={`px-3 py-2 sm:px-4 sm:py-3 cursor-pointer flex items-center gap-2 hover:bg-gray-50 transition-colors duration-150 text-black
                ${value === option.value ? 'bg-gray-50' : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.icon && <span className="text-xl ml-2">{option.icon}</span>}
              <span className={`${forceLabelVisible ? 'inline' : 'hidden sm:inline'} flex-1 truncate`}>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown; 