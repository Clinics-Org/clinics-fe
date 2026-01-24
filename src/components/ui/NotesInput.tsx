import * as React from 'react';
import * as Label from '@radix-ui/react-label';
import { cn } from '../../utils/cn';

export interface NotesInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'list' | 'onChange'> {
  label?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  predefinedOptions?: string[];
}

const DEFAULT_OPTIONS = [
  'Before food',
  'After food',
  'With food',
  'Empty stomach',
  'At bedtime',
  'As needed',
  'With meals',
];

const NotesInput = React.forwardRef<HTMLInputElement, NotesInputProps>(
  ({ className, label, error, id, value, onChange, predefinedOptions = DEFAULT_OPTIONS, ...props }, ref) => {
    const inputId = id || `notes-input-${Math.random().toString(36).substr(2, 9)}`;
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [filteredOptions, setFilteredOptions] = React.useState<string[]>(predefinedOptions);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Combine refs
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    React.useEffect(() => {
      // Filter options based on input value
      if (value.trim() === '') {
        setFilteredOptions(predefinedOptions);
      } else {
        const filtered = predefinedOptions.filter(option =>
          option.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredOptions(filtered);
      }
    }, [value, predefinedOptions]);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setShowSuggestions(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
      setShowSuggestions(true);
    };

    const handleSelectOption = (option: string) => {
      onChange(option);
      setShowSuggestions(false);
      inputRef.current?.blur();
    };

    const handleInputFocus = () => {
      setShowSuggestions(true);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        inputRef.current?.blur();
      } else if (e.key === 'Enter' && filteredOptions.length > 0 && showSuggestions) {
        e.preventDefault();
        handleSelectOption(filteredOptions[0]);
      }
    };

    return (
      <div className="w-full relative" ref={containerRef}>
        {label && (
          <Label.Root
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </Label.Root>
        )}
        <div className="relative">
          <input
            type="text"
            id={inputId}
            ref={inputRef}
            value={value}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleInputKeyDown}
            className={cn(
              'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
              'ring-offset-white placeholder:text-gray-400',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-red-500 focus-visible:ring-red-500',
              className
            )}
            {...props}
          />
          {showSuggestions && filteredOptions.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-48 overflow-auto"
            >
              {filteredOptions.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-teal-50 focus:bg-teal-50 focus:outline-none transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);
NotesInput.displayName = 'NotesInput';

export { NotesInput };
