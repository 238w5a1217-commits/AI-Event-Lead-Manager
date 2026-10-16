'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface StatusOption {
  value: string;
  label: string;
  dotClass: string;
  badgeClass: string;
}

export const STATUS_OPTIONS: Record<string, StatusOption> = {
  'pending': {
    value: 'pending',
    label: 'Needs Follow-Up',
    dotClass: 'bg-amber-500',
    badgeClass: 'bg-amber-50/90 text-amber-900 border-amber-300/80 hover:bg-amber-100/90 shadow-2xs',
  },
  'in-progress': {
    value: 'in-progress',
    label: 'In Conversation',
    dotClass: 'bg-sky-500',
    badgeClass: 'bg-sky-50/90 text-sky-900 border-sky-300/80 hover:bg-sky-100/90 shadow-2xs',
  },
  'completed': {
    value: 'completed',
    label: 'Followed Up',
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-50/90 text-emerald-900 border-emerald-300/80 hover:bg-emerald-100/90 shadow-2xs',
  },
  'not-needed': {
    value: 'not-needed',
    label: 'Not Needed',
    dotClass: 'bg-slate-400',
    badgeClass: 'bg-slate-100/90 text-slate-800 border-slate-300/80 hover:bg-slate-200/90 shadow-2xs',
  },
};

interface StatusDropdownProps {
  value: string;
  onChange: (newValue: string) => void;
  align?: 'left' | 'right';
  className?: string;
}

export default function StatusDropdown({
  value,
  onChange,
  align = 'right',
  className = '',
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = STATUS_OPTIONS[value] || STATUS_OPTIONS['pending'];

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-block flex-shrink-0 ${className}`}>
      {/* Trigger Button - Small, compact, neat, single-line */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium whitespace-nowrap transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-slate-300/60 leading-none ${current.badgeClass}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${current.dotClass} flex-shrink-0`} />
        <span className="whitespace-nowrap">{current.label}</span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-150 opacity-60 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Neat, Compact Popover Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute top-full mt-1.5 ${
            align === 'right' ? 'right-0' : 'left-0'
          } z-50 min-w-[170px] bg-white rounded-lg border border-slate-200/90 shadow-lg shadow-slate-900/5 p-1 animate-in fade-in duration-100`}
        >
          <div className="space-y-0.5">
            {Object.values(STATUS_OPTIONS).map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left whitespace-nowrap ${
                    isSelected
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full ${opt.dotClass} flex-shrink-0`} />
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {isSelected && (
                    <Check size={12} className="text-slate-900 flex-shrink-0 ml-1.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
