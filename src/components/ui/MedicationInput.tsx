import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Input } from './Input';
import { medicationService, type Medication } from '../../services/medicationService';
import { cn } from '../../utils/cn';

export interface MedicationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export function MedicationInput({
  value,
  onChange,
  placeholder = 'Search medication...',
  label,
  error,
  className,
  disabled,
}: MedicationInputProps) {
  const [searchQuery, setSearchQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Medication[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update dropdown position
  const updateDropdownPosition = useCallback(() => {
    if (!inputRef.current || !containerRef.current) return;

    const inputRect = inputRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    setDropdownPosition({
      top: inputRect.bottom + window.scrollY + 4,
      left: containerRect.left + window.scrollX,
      width: containerRect.width,
    });
  }, []);

  // Debounced search function
  const performSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const results = await medicationService.search(query);
      setSuggestions(results);
      if (results.length > 0) {
        setShowSuggestions(true);
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          updateDropdownPosition();
        }, 0);
      } else {
        setShowSuggestions(false);
      }
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error searching medications:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  }, [updateDropdownPosition]);

  // Handle input change with debouncing
  const handleInputChange = (newValue: string) => {
    setSearchQuery(newValue);
    onChange(newValue);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debouncing (500ms delay)
    debounceTimerRef.current = setTimeout(() => {
      performSearch(newValue);
    }, 500);
  };

  // Handle medication selection
  const handleSelectMedication = (medication: Medication) => {
    setSearchQuery(medication.full_name);
    onChange(medication.full_name);
    setShowSuggestions(false);
    setSuggestions([]);
    setDropdownPosition(null);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectMedication(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  // Update position on scroll and resize
  useEffect(() => {
    if (!showSuggestions) return;

    const handleUpdatePosition = () => {
      updateDropdownPosition();
    };

    window.addEventListener('scroll', handleUpdatePosition, true);
    window.addEventListener('resize', handleUpdatePosition);
    
    return () => {
      window.removeEventListener('scroll', handleUpdatePosition, true);
      window.removeEventListener('resize', handleUpdatePosition);
    };
  }, [showSuggestions, updateDropdownPosition]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setDropdownPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sync value prop with searchQuery
  useEffect(() => {
    if (value !== searchQuery) {
      setSearchQuery(value);
    }
  }, [value]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          label={label}
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
              updateDropdownPosition();
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          error={error}
          disabled={disabled}
          className="w-full"
        />
        {/* Loading indicator */}
        {loading && (
          <div className="absolute right-3 top-[2.5rem] text-gray-400">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Suggestions dropdown - rendered in portal */}
      {showSuggestions && suggestions.length > 0 && dropdownPosition && typeof document !== 'undefined' && (
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              zIndex: 9999,
            }}
            className="bg-white border border-teal-200 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {suggestions.map((medication, index) => (
              <div
                key={medication.id}
                onClick={() => handleSelectMedication(medication)}
                className={cn(
                  'px-4 py-3 cursor-pointer hover:bg-teal-50 transition-colors',
                  index === selectedIndex && 'bg-teal-50',
                  index === 0 && 'rounded-t-md',
                  index === suggestions.length - 1 && 'rounded-b-md'
                )}
              >
                <div className="font-medium text-gray-900">{medication.full_name}</div>
                {medication.manufacturer && (
                  <div className="text-xs text-gray-500 mt-1">
                    {medication.manufacturer}
                  </div>
                )}
              </div>
            ))}
          </div>,
          document.body
        )
      )}
    </div>
  );
}
