import { useState, useEffect, useRef, type FC, type ChangeEvent } from "react";

interface AutocompleteOption {
  value: string;
  label: string;
  data?: any;
}

interface AutocompleteInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSelect?: (data: any) => void;
  suggestions: AutocompleteOption[];
  required?: boolean;
  autoFocus?: boolean;
  errors?: string[];
  type?: string;
}

const AutocompleteInput: FC<AutocompleteInputProps> = ({
  label,
  name,
  value,
  onChange,
  onSelect,
  suggestions,
  required = false,
  autoFocus = false,
  errors,
  type = "text",
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<AutocompleteOption[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length > 0) {
      const filtered = suggestions.filter((suggestion) =>
        suggestion.label.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value, suggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: AutocompleteOption) => {
    onChange({ target: { name, value: suggestion.value } } as ChangeEvent<HTMLInputElement>);
    setShowSuggestions(false);
    if (onSelect && suggestion.data) {
      onSelect(suggestion.data);
    }
  };

  const getGenderDisplay = (data: any) => {
    if (!data) return 'N/A';

    if (typeof data.gender === 'object' && data.gender !== null) {
      return data.gender.gender || 'N/A';
    }
    
    return data.gender || 'N/A';
  };

  const getIdDisplay = (data: any) => {
    return data.school_id || data.staff_id || data.user_id || 'N/A';
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => value.length > 0 && setShowSuggestions(filteredSuggestions.length > 0)}
          required={required}
          autoFocus={autoFocus}
          autoComplete="off"
          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border ${
            errors && errors.length > 0
              ? "border-red-500 focus:border-red-500"
              : "border-gray-300 focus:border-blue-600"
          } appearance-none focus:outline-none focus:ring-0 peer`}
          placeholder=" "
        />
        <label
          htmlFor={name}
          className={`absolute text-sm ${
            errors && errors.length > 0 ? "text-red-500" : "text-gray-500"
          } duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-[10000] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
            >
              <p className="text-sm font-medium text-gray-900">{suggestion.label}</p>
              {suggestion.data && (
                <p className="text-xs text-gray-500 mt-0.5">
                  ID: {getIdDisplay(suggestion.data)} • Gender: {getGenderDisplay(suggestion.data)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {errors && errors.length > 0 && (
        <div className="mt-1">
          {errors.map((error, index) => (
            <p key={index} className="text-xs text-red-500">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;