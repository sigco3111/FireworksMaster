
import React from 'react';

interface LaunchButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export const LaunchButton: React.FC<LaunchButtonProps> = ({ onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 px-6 font-bold text-lg rounded-lg shadow-xl transition-all duration-200 ease-in-out
                  ${disabled ? 'bg-slate-500 text-slate-400 cursor-not-allowed' 
                             : 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white hover:from-pink-600 hover:via-red-600 hover:to-yellow-600 active:scale-95 transform'}`}
    >
      {disabled ? '재료를 선택하거나 기다려주세요' : '🚀 불꽃 발사!'}
    </button>
  );
};
    