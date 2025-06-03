
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sky } from './components/Sky';
import { Workshop } from './components/Workshop';
import { SituationDisplay } from './components/SituationDisplay';
import { ScoreDisplay } from './components/ScoreDisplay';
import { LaunchButton } from './components/LaunchButton';
import { LoadingSpinner } from './components/LoadingSpinner';
import { AiDelegateToggle } from './components/AiDelegateToggle';
import { Material, FireworkSpecification, GameState, Situation, FireworkEffectType, FireworkLaunch, EvaluationResult, Synergy } from './types';
import { 
  MATERIALS, 
  INITIAL_MAX_SELECTED_MATERIALS, 
  ROUNDS_FOR_LEVEL_UP, 
  BASE_SCORE_FOR_LEVEL_UP, 
  SCORE_INCREASE_PER_LEVEL, 
  MATERIALS_INCREASE_PER_LEVEL,
  SALVO_SIZE,
  SALVO_SPREAD,
  SALVO_EXPLOSION_MIN_Y_RATIO,
  SALVO_EXPLOSION_MAX_Y_RATIO,
  MAX_SALVO_STAGGER_MS,
  SAVE_GAME_KEY,
  SYNERGIES,
  SITUATION_KEYWORD_MAP
} from './constants';
import { generateSituation, evaluateFirework, generateRecommendedMaterialNames } from './services/geminiService';

const AUTO_PROCEED_DELAY = 4500; 

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.LOADING_SITUATION);
  const [currentSituation, setCurrentSituation] = useState<Situation | null>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<Material[]>([]);
  const [craftedFirework, setCraftedFirework] = useState<FireworkSpecification | null>(null);
  const [launchedFireworks, setLaunchedFireworks] = useState<FireworkLaunch[]>([]);
  const [score, setScore] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [level, setLevel] = useState<number>(1);
  const [feedback, setFeedback] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isGeminiLoading, setIsGeminiLoading] = useState<boolean>(false); // Renaming to isProcessing for clarity
  const [processingMessage, setProcessingMessage] = useState<string>(''); // Renaming for clarity
  const [isAiDelegateActive, setIsAiDelegateActive] = useState<boolean>(false);
  const [achievedSynergy, setAchievedSynergy] = useState<Synergy | null>(null);

  const currentMaxMaterials = INITIAL_MAX_SELECTED_MATERIALS + (level - 1) * MATERIALS_INCREASE_PER_LEVEL;
  const currentScoreForLevelUp = BASE_SCORE_FOR_LEVEL_UP + (level - 1) * SCORE_INCREASE_PER_LEVEL;

  const availableMaterials = useMemo(() => {
    return MATERIALS.filter(material => material.unlockLevel <= level);
  }, [level]);

  const backgroundHint = useMemo(() => {
    if (!currentSituation?.description) return undefined;
    const description = currentSituation.description.toLowerCase();
    for (const keyword in SITUATION_KEYWORD_MAP) {
      if (description.includes(keyword.toLowerCase())) {
        return SITUATION_KEYWORD_MAP[keyword].hint;
      }
    }
    return undefined;
  }, [currentSituation]);

  useEffect(() => {
    const savedDataString = localStorage.getItem(SAVE_GAME_KEY);
    if (savedDataString) {
      try {
        const savedData = JSON.parse(savedDataString);
        if (savedData && typeof savedData.level === 'number') {
          setLevel(savedData.level);
          setScore(savedData.score !== undefined ? savedData.score : 0);
          setRound(savedData.round !== undefined ? savedData.round : 1);
          console.log('불러온 게임 상태:', savedData);
        }
      } catch (e) {
        console.error("저장된 게임 상태를 불러오는 데 실패했습니다:", e);
        localStorage.removeItem(SAVE_GAME_KEY); 
      }
    }
  }, []);


  const performAiMaterialSuggestion = useCallback(async (situationDesc: string) => {
    if (!situationDesc) {
        setError("상황 정보가 없어 AI 추천을 진행할 수 없습니다.");
        return;
    }
    if (availableMaterials.length === 0) {
        setError("현재 레벨에서 사용 가능한 재료가 없습니다. 레벨을 올려 더 많은 재료를 해금하세요.");
        setSelectedMaterials([]);
        return;
    }
    setIsGeminiLoading(true); 
    setProcessingMessage("AI가 최적의 불꽃 조합 구상 중...");
    let recommendedMaterials: Material[] = [];
    try {
        const recommendedNames = await generateRecommendedMaterialNames(situationDesc, availableMaterials, currentMaxMaterials);
        recommendedMaterials = recommendedNames
            .map(name => availableMaterials.find(m => m.name === name))
            .filter(Boolean) as Material[];
        
        if (recommendedMaterials.length === 0 && recommendedNames.length > 0) {
            console.warn("AI가 추천한 재료를 찾을 수 없습니다 (사용 가능 목록 기준):", recommendedNames);
            setError("AI가 유효한 재료를 추천하지 못했습니다. 직접 선택해주세요.");
             setSelectedMaterials([]); 
        } else if (recommendedMaterials.length === 0) {
             setError("AI가 재료를 추천하지 못했습니다. 직접 선택해주세요.");
             setSelectedMaterials([]);
        } else {
          setSelectedMaterials(recommendedMaterials.slice(0, currentMaxMaterials));
        }
    } catch (err) {
        console.error("AI 추천 생성 실패:", err);
        setError("AI 추천을 받는 데 실패했습니다. 직접 재료를 선택해주세요.");
        setSelectedMaterials([]);
    } finally {
        setIsGeminiLoading(false);
        setProcessingMessage('');
    }
  }, [currentMaxMaterials, availableMaterials]); 

  const fetchNewSituation = useCallback(async () => {
    setIsGeminiLoading(true);
    setProcessingMessage("새로운 상황 구상 중...");
    setError(null);
    setSelectedMaterials([]);
    setCurrentSituation(null); 
    setCraftedFirework(null);
    setAchievedSynergy(null);

    try {
      const situationDescription = await generateSituation(round, level);
      setCurrentSituation({ id: `sit-${Date.now()}`, description: situationDescription });
      setGameState(GameState.SELECTING_MATERIALS);
    } catch (err) {
      console.error("상황 생성 실패:", err);
      setError("새로운 게임 상황을 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
      setGameState(GameState.ERROR);
    } finally {
      setIsGeminiLoading(false);
      setProcessingMessage('');
    }
  }, [round, level]);

  useEffect(() => {
    if (gameState === GameState.LOADING_SITUATION) {
     fetchNewSituation();
    }
  }, [gameState, fetchNewSituation]);

  useEffect(() => {
    if (
        gameState === GameState.SELECTING_MATERIALS && 
        isAiDelegateActive && 
        currentSituation && 
        selectedMaterials.length === 0 && 
        !error &&
        !isGeminiLoading &&
        availableMaterials.length > 0 
        ) {
         performAiMaterialSuggestion(currentSituation.description);
    }
  }, [gameState, isAiDelegateActive, currentSituation, performAiMaterialSuggestion, selectedMaterials.length, error, isGeminiLoading, availableMaterials.length]);


  const handleMaterialSelect = (material: Material) => {
    if (gameState !== GameState.SELECTING_MATERIALS) return;
    if (material.unlockLevel > level) return;
    
    setSelectedMaterials(prev => {
      let newSelected;
      if (prev.find(m => m.id === material.id)) {
        newSelected = prev.filter(m => m.id !== material.id);
      } else {
        if (prev.length < currentMaxMaterials) {
          newSelected = [...prev, material];
        } else {
          newSelected = prev;
        }
      }
      return newSelected;
    });
  };
  
  const checkForSynergies = useCallback((currentSelectedMaterials: Material[]): Synergy | null => {
    const selectedIds = new Set(currentSelectedMaterials.map(m => m.id));
    for (const synergy of SYNERGIES) {
      const synergyMaterialIds = new Set(synergy.materialIds);
      if (synergyMaterialIds.size <= selectedIds.size) { // Optimization
        let match = true;
        for (const synId of synergyMaterialIds) {
          if (!selectedIds.has(synId)) {
            match = false;
            break;
          }
        }
        if (match) return synergy;
      }
    }
    return null;
  }, []);

  const craftFirework = useCallback(() => {
    if (selectedMaterials.length === 0) {
      setCraftedFirework(null);
      setAchievedSynergy(null);
      return;
    }

    const currentSynergy = checkForSynergies(selectedMaterials);
    setAchievedSynergy(currentSynergy);

    const newCraftedFirework: FireworkSpecification = {
      id: `fw-spec-${Date.now()}`,
      colors: selectedMaterials.map(m => m.color).filter(Boolean) as string[],
      effects: selectedMaterials.map(m => m.effect).filter(Boolean) as FireworkEffectType[],
      shape: selectedMaterials.find(m => m.shape)?.shape || '구형',
      size: selectedMaterials.length * 20 + 30,
      sound: selectedMaterials.some(m => m.soundEffect === '펑!') ? '강함' : '보통',
      description: selectedMaterials.map(m => m.name).join(', ') + '으로 만든 불꽃',
      materialIds: selectedMaterials.map(m => m.id),
      achievedSynergyName: currentSynergy?.name,
    };
    setCraftedFirework(newCraftedFirework);
  }, [selectedMaterials, checkForSynergies]);

  useEffect(() => {
    if (gameState === GameState.SELECTING_MATERIALS) {
      if (selectedMaterials.length > 0) {
        craftFirework();
      } else {
        setCraftedFirework(null);
        setAchievedSynergy(null);
      }
    } else if (selectedMaterials.length === 0 && craftedFirework !== null) {
      setCraftedFirework(null); 
      setAchievedSynergy(null);
    }
  }, [selectedMaterials, gameState, craftFirework]);

  const handleLaunchFirework = useCallback(async () => {
    if (!craftedFirework || !currentSituation) return;
    
    const newSalvo: FireworkLaunch[] = [];
    const baseLaunchTime = Date.now();
    
    const salvoStartX = SALVO_SIZE === 1 ? 0.5 : (1 - SALVO_SPREAD) / 2;
    const xIncrement = SALVO_SIZE <= 1 ? 0 : SALVO_SPREAD / (SALVO_SIZE - 1);

    for (let i = 0; i < SALVO_SIZE; i++) {
      newSalvo.push({
        ...craftedFirework, 
        id: `fw-launch-${baseLaunchTime}-${i}`, 
        launchTime: baseLaunchTime, 
        effectiveLaunchTime: baseLaunchTime + (SALVO_SIZE > 1 ? (Math.random() * MAX_SALVO_STAGGER_MS) : 0),
        x: salvoStartX + i * xIncrement, 
        y: Math.random() * (SALVO_EXPLOSION_MAX_Y_RATIO - SALVO_EXPLOSION_MIN_Y_RATIO) + SALVO_EXPLOSION_MIN_Y_RATIO,
      });
    }
    setLaunchedFireworks(prev => [...prev, ...newSalvo]);
    setGameState(GameState.LAUNCHING); 
    
    setIsGeminiLoading(true);
    setProcessingMessage("불꽃 평가 중...");
    setError(null);
    setFeedback('');

    try {
      // Pass selectedMaterials to evaluateFirework for synergy and situation checks
      const result: EvaluationResult = await evaluateFirework(currentSituation.description, craftedFirework, selectedMaterials);
      setScore(prev => prev + result.score);
      
      let fullFeedback = result.reason;
      if (result.achievedSynergyName) {
        fullFeedback += ` (✨ 시너지: ${result.achievedSynergyName} +${result.synergyBonus || 0}점!)`;
      }
      if (result.situationBonus && result.situationBonus > 0) {
         fullFeedback += ` (🌟 상황 보너스 +${result.situationBonus}점!)`;
      }
      setFeedback(fullFeedback);
      setGameState(GameState.SHOWING_SCORE);
    } catch (err) {
      console.error("점수 평가 실패:", err);
      setError("점수를 평가하는 데 실패했습니다. 기본 점수 1점을 부여합니다.");
      setScore(prev => prev + 1); 
      setFeedback("AI 평가 중 오류가 발생했습니다.");
      setGameState(GameState.SHOWING_SCORE);
    } finally {
      setIsGeminiLoading(false);
      setProcessingMessage('');
    }
  }, [craftedFirework, currentSituation, selectedMaterials]); 

  useEffect(() => {
    if (
      isAiDelegateActive &&
      gameState === GameState.SELECTING_MATERIALS &&
      craftedFirework &&
      !isGeminiLoading 
    ) {
      handleLaunchFirework();
    }
  }, [isAiDelegateActive, gameState, craftedFirework, isGeminiLoading, handleLaunchFirework]);


  const handleNextRound = useCallback(() => {
    setError(null); 
    setLaunchedFireworks([]); 
    setFeedback('');
    setCraftedFirework(null); 
    setSelectedMaterials([]); 
    setAchievedSynergy(null);
        
    if (round >= ROUNDS_FOR_LEVEL_UP && score >= currentScoreForLevelUp) {
      setGameState(GameState.LEVEL_UP);
    } 
    else if (round >= ROUNDS_FOR_LEVEL_UP && score < currentScoreForLevelUp) {
      setGameState(GameState.GAME_OVER);
    } 
    else {
      setRound(prev => prev + 1);
      setGameState(GameState.LOADING_SITUATION);
    }
  }, [round, score, currentScoreForLevelUp]); 

  const handleStartNextLevel = useCallback(() => {
    const newLevel = level + 1;
    setLevel(newLevel);
    setRound(1);
    setScore(0);
    setLaunchedFireworks([]);
    setFeedback('');
    setError(null);
    setCraftedFirework(null);
    setSelectedMaterials([]);
    setAchievedSynergy(null);
    setGameState(GameState.LOADING_SITUATION);

    try {
      const saveData = JSON.stringify({ level: newLevel, score: 0, round: 1 });
      localStorage.setItem(SAVE_GAME_KEY, saveData);
      console.log('게임 저장됨. 레벨:', newLevel);
    } catch (e) {
      console.error("게임 상태 저장 실패:", e);
    }
  }, [level]);

  useEffect(() => {
    let timerId: number | null = null;
    if (isAiDelegateActive && !isGeminiLoading) {
      const currentGameState: GameState = gameState; 
      switch (currentGameState) { 
        case GameState.SHOWING_SCORE:
          timerId = setTimeout(() => {
            handleNextRound();
          }, AUTO_PROCEED_DELAY);
          break;
        case GameState.LEVEL_UP:
          timerId = setTimeout(() => {
            handleStartNextLevel();
          }, AUTO_PROCEED_DELAY);
          break;
        default:
          break;
      }
    }
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [isAiDelegateActive, gameState, isGeminiLoading, handleNextRound, handleStartNextLevel]);


  const handleRestartGame = () => {
    const initialLevel = 1;
    const initialScore = 0;
    const initialRound = 1;

    setLevel(initialLevel);
    setRound(initialRound);
    setScore(initialScore);
    setLaunchedFireworks([]);
    setFeedback('');
    setError(null);
    setCraftedFirework(null);
    setSelectedMaterials([]);
    setAchievedSynergy(null);
    setGameState(GameState.LOADING_SITUATION);
    try {
      const saveData = JSON.stringify({ level: initialLevel, score: initialScore, round: initialRound });
      localStorage.setItem(SAVE_GAME_KEY, saveData);
      console.log('게임 재시작 및 저장됨.');
    } catch (e) {
      console.error("게임 재시작 상태 저장 실패:", e);
    }
  };
  
  const handleToggleAiDelegate = () => {
    const newAiState = !isAiDelegateActive;
    setIsAiDelegateActive(newAiState);
     if (newAiState && gameState === GameState.SELECTING_MATERIALS && currentSituation && selectedMaterials.length === 0 && !error && !isGeminiLoading && availableMaterials.length > 0) {
      performAiMaterialSuggestion(currentSituation.description);
    }
  };

  const canLaunch = gameState === GameState.SELECTING_MATERIALS && !!craftedFirework && !isGeminiLoading;

  const getNextRoundButtonText = () => {
    if (round >= ROUNDS_FOR_LEVEL_UP) {
      if (score >= currentScoreForLevelUp) {
        return '레벨 업 확인!';
      } else {
        return '최종 결과 보기';
      }
    }
    return `다음 라운드 (${round + 1})`;
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-900">
      <header className="p-4 text-center bg-slate-900/70 backdrop-blur-md shadow-xl">
        <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
          파이어웍스 마스터
        </h1>
      </header>

      <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-2/3 h-1/2 md:h-full relative order-1 md:order-2">
          <Sky fireworks={launchedFireworks} backgroundHint={backgroundHint} />
          {isGeminiLoading && <LoadingSpinner message={processingMessage} />}
        </div>

        <aside className="w-full md:w-1/3 p-4 bg-slate-800/70 backdrop-blur-md shadow-lg flex flex-col space-y-4 overflow-y-auto order-2 md:order-1">
          <ScoreDisplay score={score} round={round} level={level} roundsForLevelUp={ROUNDS_FOR_LEVEL_UP} scoreForLevelUp={currentScoreForLevelUp} />
          
          <AiDelegateToggle
            isActive={isAiDelegateActive}
            onToggle={handleToggleAiDelegate}
            disabled={isGeminiLoading && (processingMessage.includes("조합 구상 중") || processingMessage.includes("상황 구상 중") || processingMessage.includes("평가 중")) || (availableMaterials.length === 0 && gameState === GameState.SELECTING_MATERIALS) }
          />

          <SituationDisplay 
            situation={currentSituation?.description || (gameState === GameState.LOADING_SITUATION && isGeminiLoading ? "새로운 상황 생성 중..." : "상황 정보 없음")} 
            isLoading={gameState === GameState.LOADING_SITUATION && isGeminiLoading && processingMessage.includes("상황")} 
          />
          
          {error && <div className="p-3 bg-red-500/20 text-red-300 border border-red-500 rounded-md animate-pulse">{error}</div>}

          {gameState === GameState.SELECTING_MATERIALS ? (
            <Workshop
              allMaterials={MATERIALS} 
              currentLevel={level} 
              selectedMaterials={selectedMaterials}
              onMaterialSelect={handleMaterialSelect}
              maxSelection={currentMaxMaterials}
              activeSynergy={achievedSynergy}
              isAiDelegateActive={isAiDelegateActive}
            />
          ) : gameState === GameState.SHOWING_SCORE ? (
            <div className="text-center p-4 bg-slate-700/50 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-yellow-400">라운드 결과</h3>
              <p className="text-lg whitespace-pre-wrap">{feedback || "결과를 기다리는 중..."}</p>
              
              {craftedFirework && (
                <div className="mt-3 pt-3 border-t border-slate-600/80">
                  <h4 className="text-md font-semibold mb-1 text-purple-300">사용한 재료:</h4>
                  <p className="text-sm text-slate-300">{craftedFirework.description || "정보 없음"}</p>
                </div>
              )}

              {isAiDelegateActive && !isGeminiLoading ? (
                 <p className="mt-4 text-md text-sky-300 animate-pulse">AI가 자동으로 다음 단계를 진행합니다...</p>
              ) : (
                <button
                  onClick={handleNextRound}
                  disabled={isGeminiLoading}
                  className={`mt-4 px-6 py-2 text-white font-semibold rounded-lg shadow-md transition-colors duration-150 ${isGeminiLoading ? 'bg-slate-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                >
                  {getNextRoundButtonText()}
                </button>
              )}
            </div>
          ) : gameState === GameState.LEVEL_UP ? (
            <div className="text-center p-6 bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-600 rounded-lg shadow-2xl">
              <h3 className="text-3xl font-bold mb-3 text-yellow-300">🎉 레벨 업! 🎉</h3>
              <p className="text-xl text-slate-100 mb-2">축하합니다! 레벨 <span className="font-bold text-green-300">{level + 1}</span>에 도달했습니다!</p>
              <p className="text-md text-slate-200 mb-4">이제 최대 <span className="font-semibold text-teal-300">{INITIAL_MAX_SELECTED_MATERIALS + level * MATERIALS_INCREASE_PER_LEVEL}</span>개의 재료를 선택할 수 있습니다.</p>
              {isAiDelegateActive && !isGeminiLoading ? (
                <p className="mt-4 text-md text-sky-300 animate-pulse">AI가 자동으로 다음 레벨을 시작합니다...</p>
              ) : (
                <button
                  onClick={handleStartNextLevel}
                  disabled={isGeminiLoading}
                  className={`mt-4 px-8 py-3 text-lg rounded-lg shadow-xl transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 ${isGeminiLoading ? 'bg-slate-500 text-slate-900 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold'}`}
                >
                  레벨 {level + 1} 시작!
                </button>
              )}
            </div>
          ) : gameState === GameState.GAME_OVER ? (
            <div className="text-center p-6 bg-gradient-to-br from-red-600 via-red-700 to-pink-700 rounded-lg shadow-2xl">
              <h3 className="text-3xl font-bold mb-3 text-slate-100">GAME OVER</h3>
              <p className="text-xl text-slate-200 mb-2">레벨 <span className="font-bold text-yellow-300">{level}</span>에서 목표 점수 <span className="font-bold text-yellow-300">{currentScoreForLevelUp}</span>점을 달성하지 못했습니다.</p>
              <p className="text-lg text-slate-200 mb-4">최종 점수: <span className="font-bold text-yellow-300">{score}</span>점</p>
              <button
                onClick={handleRestartGame}
                className="mt-4 px-8 py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold text-lg rounded-lg shadow-xl transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
              >
                다시 시작
              </button>
            </div>
          ) : null}


          {craftedFirework && gameState === GameState.SELECTING_MATERIALS && (
            <div className="p-3 bg-slate-700/50 rounded-lg mt-2">
              <h4 className="text-md font-semibold mb-1 text-purple-300">조합된 불꽃:</h4>
              <p className="text-sm text-slate-300">{craftedFirework.description}</p>
              <p className="text-sm text-slate-300">색상: {craftedFirework.colors.join(', ') || '기본'}, 효과: {craftedFirework.effects.join(', ') || '기본'}, 모양: {craftedFirework.shape}</p>
              {craftedFirework.achievedSynergyName && (
                <p className="text-sm text-yellow-400 font-semibold mt-1">✨ 시너지: {craftedFirework.achievedSynergyName}</p>
              )}
            </div>
          )}
          
          { (gameState === GameState.SELECTING_MATERIALS && craftedFirework && !isAiDelegateActive && availableMaterials.length > 0 ) &&
            <LaunchButton onClick={handleLaunchFirework} disabled={!canLaunch} />
          }
        </aside>
      </main>
    </div>
  );
};

export default App;