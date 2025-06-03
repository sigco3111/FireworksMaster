import React from 'react';

interface ScoreDisplayProps {
  score: number;
  round: number;
  level: number;
  roundsForLevelUp: number;
  scoreForLevelUp: number;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, round, level, roundsForLevelUp, scoreForLevelUp }) => {
  const isLevelUpConditionMet = round >= roundsForLevelUp && score >= scoreForLevelUp;
  return (
    <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg">
      <div className="flex justify-around items-center text-center mb-2">
        <div>
          <span className="block text-xs sm:text-sm uppercase font-semibold tracking-wider text-purple-200">레벨</span>
          <span className="block text-2xl sm:text-3xl font-bold">{level}</span>
        </div>
        <div>
          <span className="block text-xs sm:text-sm uppercase font-semibold tracking-wider text-purple-300">라운드</span>
          <span className="block text-2xl sm:text-3xl font-bold">{round}</span>
        </div>
        <div>
          <span className="block text-xs sm:text-sm uppercase font-semibold tracking-wider text-indigo-200">총 점수</span>
          <span className="block text-2xl sm:text-3xl font-bold">{score}</span>
        </div>
      </div>
      <div className="text-center mt-1">
        {isLevelUpConditionMet ? (
          <p className="text-xs text-green-300 font-semibold">🎉 레벨 업 조건 달성! 🎉</p>
        ) : (
          <p className="text-xs text-indigo-100">
            다음 레벨: {roundsForLevelUp}라운드 &amp; {scoreForLevelUp}점 (현재 {round}/{roundsForLevelUp} 라운드, {score}/{scoreForLevelUp} 점)
          </p>
        )}
      </div>
    </div>
  );
};