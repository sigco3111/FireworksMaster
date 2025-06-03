
import React from 'react';

interface SituationDisplayProps {
  situation: string | null;
  isLoading: boolean;
}

export const SituationDisplay: React.FC<SituationDisplayProps> = ({ situation, isLoading }) => {
  return (
    <div className="p-4 bg-slate-700/50 rounded-lg shadow-inner min-h-[80px]">
      <h3 className="text-lg font-semibold mb-2 text-yellow-300">현재 상황</h3>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-300"></div>
          <p className="ml-2 text-slate-300">상황을 불러오는 중...</p>
        </div>
      ) : (
        <p className="text-slate-200 leading-relaxed">{situation || "상황 정보를 기다리는 중입니다..."}</p>
      )}
    </div>
  );
};
    