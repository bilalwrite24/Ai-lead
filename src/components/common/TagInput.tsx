import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface TagInputProps {
  label: string;
  helperText?: string;
  tags: string[];
  onChange: (newTags: string[]) => void;
  placeholder?: string;
  suggestedTags?: string[];
}

export const TagInput: React.FC<TagInputProps> = ({
  label,
  helperText,
  tags,
  onChange,
  placeholder = 'Type and press Enter...',
  suggestedTags = [],
}) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...tags, trimmed]);
    }
    setInputValue('');
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const availableSuggestions = suggestedTags.filter(
    (s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase())
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
          {label}
        </label>
        <span className="text-xs text-slate-400 font-medium">{tags.length} selected</span>
      </div>

      <div className="min-h-[46px] p-2 bg-white border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all flex flex-wrap gap-1.5 items-center">
        {tags.map((tag, idx) => (
          <span
            key={`${tag}-${idx}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium rounded-md shadow-2xs"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="text-blue-500 hover:text-blue-800 focus:outline-none p-0.5 rounded hover:bg-blue-100 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        <div className="flex items-center flex-1 min-w-[140px]">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (inputValue) addTag(inputValue);
            }}
            placeholder={tags.length === 0 ? placeholder : 'Add more...'}
            className="w-full px-2 py-1 text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400"
          />
          {inputValue.trim() && (
            <button
              type="button"
              onClick={() => addTag(inputValue)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 mr-1"
            >
              Add
            </button>
          )}
        </div>
      </div>

      {helperText && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}

      {availableSuggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1 items-center">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Suggestions:</span>
          {availableSuggestions.slice(0, 6).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md transition-colors"
            >
              <Plus className="w-2.5 h-2.5" />
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
