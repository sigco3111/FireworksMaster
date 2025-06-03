import React from 'react';
import { Material, Synergy } from '../types';
import { MaterialCard } from './MaterialCard';

interface WorkshopProps {
  allMaterials: Material[]; 
  currentLevel: number;
  selectedMaterials: Material[];
  onMaterialSelect: (material: Material) => void;
  maxSelection: number;
  activeSynergy: Synergy | null;
  isAiDelegateActive?: boolean;
}

export const Workshop: React.FC<WorkshopProps> = ({ allMaterials, currentLevel, selectedMaterials, onMaterialSelect, maxSelection, activeSynergy, isAiDelegateActive }) => {
  const types: Material['type'][] = ['color', 'effect', 'shape_modifier', 'sound'];
  
  return (
    <div className="p-4 bg-slate-800/60 rounded-lg shadow-xl space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-3 text-indigo-300">
          재료 선택 (최대 {maxSelection}개)
        </h3>
        <p className="text-sm text-slate-400 mb-1">
          선택된 재료: {selectedMaterials.length} / {maxSelection}
          {isAiDelegateActive && selectedMaterials.length > 0 && (
            <span className="ml-2 text-teal-300 font-semibold">(🤖 AI 추천)</span>
          )}
        </p>
        {activeSynergy && (
          <div className="my-2 p-2 bg-yellow-500/20 border border-yellow-600 rounded-md">
            <p className="text-sm text-yellow-300 font-semibold">
              ✨ 시너지 활성: <span className="text-yellow-200">{activeSynergy.name}</span>
            </p>
            <p className="text-xs text-yellow-400">{activeSynergy.description}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedMaterials.map(m => (
            <span key={`selected-${m.id}`} className="px-2 py-1 text-xs bg-purple-500 text-white rounded-full flex items-center">
              {m.icon} {m.name}
              <button 
                onClick={() => onMaterialSelect(m)} 
                className="ml-2 text-purple-200 hover:text-white"
                aria-label={`${m.name} 선택 해제`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      </div>

      {types.map(type => {
        const materialsForType = allMaterials.filter(m => m.type === type);
        if (materialsForType.length === 0) return null;

        let typeName = '';
        switch(type) {
          case 'color': typeName = '색상 재료'; break;
          case 'effect': typeName = '효과 재료'; break;
          case 'shape_modifier': typeName = '모양 재료'; break;
          case 'sound': typeName = '소리 재료'; break;
        }

        return (
          <div key={type}>
            <h4 className="text-lg font-medium mb-2 text-teal-300">{typeName}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {materialsForType.map(material => {
                const isLocked = material.unlockLevel > currentLevel;
                const isSelected = selectedMaterials.some(m => m.id === material.id);
                const isDisabledByMaxSelection = !isSelected && selectedMaterials.length >= maxSelection;

                return (
                  <MaterialCard
                    key={material.id}
                    material={material}
                    isSelected={isSelected}
                    onSelect={() => onMaterialSelect(material)}
                    isLocked={isLocked}
                    disabled={isDisabledByMaxSelection} 
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};