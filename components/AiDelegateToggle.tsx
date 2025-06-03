import React from 'react';

interface AiDelegateToggleProps {
  isActive: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const AiDelegateToggle: React.FC<AiDelegateToggleProps> = ({ isActive, onToggle, disabled }) => {
  return (
    <label
      htmlFor="ai-delegate-toggle"
      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-150
                  ${disabled ? 'bg-slate-700 opacity-60 cursor-not-allowed' : isActive ? 'bg-teal-600 hover:bg-teal-700' : 'bg-slate-600 hover:bg-slate-500'}`}
    >
      <span className={`text-sm font-medium ${disabled ? 'text-slate-400' : 'text-white'}`}>
        AI 자동 추천: <span className="font-bold">{isActive ? 'ON' : 'OFF'}</span> 🤖
      </span>
      <div className="relative">
        <input
          type="checkbox"
          id="ai-delegate-toggle"
          className="sr-only" // Hide default checkbox
          checked={isActive}
          onChange={onToggle}
          disabled={disabled}
        />
        <div className={`block w-10 h-6 rounded-full transition-colors ${isActive ? 'bg-green-400' : 'bg-slate-400'}`}></div>
        <div
          className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out 
                      ${isActive ? 'transform translate-x-full' : ''}`}
        ></div>
      </div>
    </label>
  );
};