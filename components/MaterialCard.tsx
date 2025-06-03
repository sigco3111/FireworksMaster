
import React from 'react';
import { Material } from '../types';

interface MaterialCardProps {
  material: Material;
  isSelected: boolean;
  onSelect: () => void;
  isLocked: boolean;
  disabled?: boolean; // Disabled due to other reasons like max selection
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ material, isSelected, onSelect, isLocked, disabled }) => {
  const baseClasses = "p-3 rounded-lg shadow-md transition-all duration-150 ease-in-out transform relative overflow-hidden text-center";
  
  const activeUnselectedClasses = "bg-slate-700 hover:bg-slate-600 border-2 border-slate-600 hover:scale-105 cursor-pointer";
  const activeSelectedClasses = "bg-indigo-500 border-2 border-indigo-300 ring-2 ring-indigo-400 hover:scale-105 cursor-pointer";
  const generalDisabledStyling = "cursor-not-allowed hover:scale-100";

  let cardSpecificClasses = "";

  if (isLocked) {
    cardSpecificClasses = `bg-slate-700 border-2 border-slate-600 ${generalDisabledStyling} opacity-50 filter grayscale`;
  } else if (disabled) { // Not locked, but disabled (e.g., max items selected)
    // Apply selected or unselected style but make it appear disabled
    cardSpecificClasses = `${isSelected ? activeSelectedClasses : activeUnselectedClasses} ${generalDisabledStyling} opacity-60`;
  } else { // Active and selectable
    cardSpecificClasses = isSelected ? activeSelectedClasses : activeUnselectedClasses;
  }

  const effectivelyDisabled = isLocked || disabled;

  return (
    <button
      onClick={onSelect}
      disabled={effectivelyDisabled}
      className={`${baseClasses} ${cardSpecificClasses}`}
      aria-pressed={isSelected && !isLocked}
      aria-label={`재료 ${material.name}. ${isLocked ? `레벨 ${material.unlockLevel}에 해금됩니다.` : material.description}${isSelected ? ' 선택됨.' : ''}${disabled && !isLocked ? ' 최대 선택 개수에 도달하여 비활성화됨.' : ''}`}
      title={isLocked ? `레벨 ${material.unlockLevel}에 해금됩니다.` : material.description}
    >
      {isLocked && (
        <span className="absolute top-1 right-1 text-lg z-10" role="img" aria-label="잠김">🔒</span>
      )}
      <div className={`flex flex-col items-center ${isLocked ? 'opacity-75' : ''}`}> {/* Content slightly less opaque for locked items if needed */}
        <span className="text-3xl mb-1" role="img" aria-label={material.type}>{material.icon}</span>
        <h5 className="text-sm font-semibold text-slate-100 truncate w-full" title={material.name}>{material.name}</h5>
        <p className="text-xs text-slate-300" style={{ color: material.color && isSelected && !isLocked ? material.color : undefined }}>
          {material.type === 'color' && material.color ? material.color : material.effect || material.shape || material.soundEffect}
        </p>
        {isLocked && <p className="text-xs text-yellow-400 mt-1 font-semibold">Lv. {material.unlockLevel}</p>}
      </div>
    </button>
  );
};