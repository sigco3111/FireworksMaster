import { FireworkSpecification, Material, EvaluationResult, Synergy } from '../types';
import { SYNERGIES, SITUATION_KEYWORD_MAP } from '../constants';


const mockSituations: string[] = [
  "고요한 겨울밤, 눈 덮인 산 위로 쏘아 올리는 불꽃",
  "해변에서의 신나는 여름 파티 클라이맥스!",
  "오랜 친구와의 재회를 축하하는 감동적인 순간",
  "새해 첫날, 희망찬 시작을 알리는 카운트다운",
  "동화 속 공주님의 생일 파티 피날레",
  "승리를 자축하는 스포츠 경기의 마지막 밤",
  "가을 밤하늘 아래 열리는 로맨틱한 음악 축제",
  "용감한 기사의 개선 행진을 축하하는 불꽃",
  "신비로운 마법 학교의 졸업식 밤하늘",
  "미지의 행성 탐사를 기념하는 우주 정거장의 축제"
];

const mockReasons: string[] = [
  "색상과 효과의 조화가 현재 상황과 아주 잘 어울립니다! 완벽해요!",
  "선택한 재료들이 분위기를 한층 끌어올리는군요. 정말 훌륭합니다!",
  "인상적인 불꽃입니다! 상황에 잘 맞는 선택이었어요.",
  "상황을 고려한 섬세한 선택이 돋보입니다. 아주 좋아요!",
  "독창적인 조합이네요! AI 심사위원의 마음을 사로잡았습니다!",
  "AI 심사위원의 마음을 사로잡았습니다! 최고의 불꽃!",
  "기대 이상의 멋진 불꽃입니다! 축하합니다!",
];

export async function generateSituation(round: number, level: number): Promise<string> {
  console.log(`목업 데이터: 레벨 ${level}, ${round}번째 라운드 상황 생성`);
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400)); 
  const situationIndex = (round + level * 3 + Math.floor(Math.random() * mockSituations.length)) % mockSituations.length;
  return Promise.resolve(mockSituations[situationIndex] || "기본 목업 상황: 멋진 불꽃을 만들어보세요!");
}


export async function evaluateFirework(
  situation: string, 
  firework: FireworkSpecification,
  selectedMaterials: Material[] // Pass selected materials to check for synergies and situation matching
): Promise<EvaluationResult> {
  console.log(`목업 데이터: 상황 "${situation}"에 대한 불꽃 "${firework.description}" 평가`);
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
  
  let baseScore = Math.floor(Math.random() * 3) + 4; // Base score 4-6
  const complexity = firework.colors.length + firework.effects.length + (firework.shape !== '구형' ? 1 : 0) + (firework.sound !== '보통' ? 1 : 0);

  if (complexity === 0 && Math.random() < 0.7) { 
    baseScore = Math.floor(Math.random() * 2) + 1; // 1-2점
  } else if (complexity > 0) {
    baseScore += Math.floor(Math.random() * (complexity * 0.8)) + 1; // 복잡도 보너스 (최대 10점 도달 가능하도록)
  }

  let finalScore = Math.min(10, Math.max(1, baseScore));
  let reason = mockReasons[Math.floor(Math.random() * mockReasons.length)] || "목업 평가: 좋은 시도입니다!";
  
  const result: EvaluationResult = {
    score: 0, // Will be calculated
    reason: "",
  };

  // Check for Synergies
  const selectedMaterialIds = new Set(selectedMaterials.map(m => m.id));
  let achievedSynergy: Synergy | null = null;

  for (const synergy of SYNERGIES) {
    const synergyMaterialIds = new Set(synergy.materialIds);
    let match = true;
    if (synergyMaterialIds.size > selectedMaterialIds.size) continue; // Quick check
    for (const synId of synergyMaterialIds) {
      if (!selectedMaterialIds.has(synId)) {
        match = false;
        break;
      }
    }
    if (match) {
      achievedSynergy = synergy;
      break; 
    }
  }

  if (achievedSynergy) {
    finalScore += achievedSynergy.bonusScore;
    result.achievedSynergyName = achievedSynergy.name;
    result.synergyBonus = achievedSynergy.bonusScore;
    reason += `\n시너지 '${achievedSynergy.name}' 달성! (${achievedSynergy.description})`;
  }

  // Check for Situation Match (Mock)
  const situationLower = situation.toLowerCase();
  let situationBonusPoints = 0;
  for (const keyword in SITUATION_KEYWORD_MAP) {
    if (situationLower.includes(keyword.toLowerCase())) {
      const matchInfo = SITUATION_KEYWORD_MAP[keyword];
      let criteriaMet = 0;
      let maxCriteria = 0;

      if (matchInfo.colors) {
        maxCriteria++;
        if (firework.colors.some(c => matchInfo.colors?.includes(c) || (c === 'rainbow' && matchInfo.colors?.includes('rainbow')))) criteriaMet++;
      }
      if (matchInfo.effects) {
        maxCriteria++;
        if (firework.effects.some(e => matchInfo.effects?.includes(e))) criteriaMet++;
      }
      if (matchInfo.shapes) {
        maxCriteria++;
        if (matchInfo.shapes.includes(firework.shape)) criteriaMet++;
      }
      // Basic sound check for specific keywords like "승리"
      if (matchInfo.soundEffect && firework.sound === '강함') {
          maxCriteria++;
          criteriaMet++;
      }


      if (criteriaMet > 0) { // Grant bonus if at least one criterion is somewhat met
         const partialBonus = Math.ceil(matchInfo.bonus * (criteriaMet / (maxCriteria || 1)));
         situationBonusPoints += partialBonus;
         if (partialBonus > 0) {
            reason += `\n상황 키워드 '${keyword}'와 잘 어울립니다!`;
         }
      }
    }
  }
  
  if (situationBonusPoints > 0) {
    finalScore += situationBonusPoints;
    result.situationBonus = situationBonusPoints;
  }
  
  result.score = Math.min(10, Math.max(1, Math.round(finalScore))); // Ensure score is between 1-10
  result.reason = reason;
  
  return Promise.resolve(result);
}

export async function generateRecommendedMaterialNames(
  situationDescription: string,
  allMaterials: Material[],
  maxSelection: number
): Promise<string[]> {
  console.log(`목업 데이터: 상황 "${situationDescription}"에 대한 재료 추천 (최대 ${maxSelection}개)`);
  await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 600));

  // Basic mock: try to pick synergistic materials if possible, or situation-matching
  let recommendedNames: string[] = [];
  const shuffledMaterials = [...allMaterials].sort(() => 0.5 - Math.random());

  // Try to find a synergy
  for (const synergy of SYNERGIES.sort(() => 0.5 - Math.random())) {
    if (synergy.materialIds.length <= maxSelection) {
      const availableSynergyMaterials = synergy.materialIds
        .map(id => allMaterials.find(m => m.id === id))
        .filter(Boolean) as Material[];
      if (availableSynergyMaterials.length === synergy.materialIds.length) {
        recommendedNames = availableSynergyMaterials.map(m => m.name);
        break;
      }
    }
  }
  
  // If no synergy, or synergy doesn't fill maxSelection, try situation keywords
  if (recommendedNames.length < maxSelection) {
      const situationLower = situationDescription.toLowerCase();
      for (const keyword in SITUATION_KEYWORD_MAP) {
          if (situationLower.includes(keyword)) {
              const matchInfo = SITUATION_KEYWORD_MAP[keyword];
              const candidates: string[] = [];
              if(matchInfo.colors) candidates.push(...(matchInfo.colors.map(c => allMaterials.find(m => m.color === c || (c === 'rainbow' && m.color === 'rainbow'))?.name).filter(Boolean) as string[]));
              if(matchInfo.effects) candidates.push(...(matchInfo.effects.map(e => allMaterials.find(m => m.effect === e)?.name).filter(Boolean) as string[]));
              if(matchInfo.shapes) candidates.push(...(matchInfo.shapes.map(s => allMaterials.find(m => m.shape === s)?.name).filter(Boolean) as string[]));
              
              const uniqueCandidates = Array.from(new Set(candidates));
              for(const cand of uniqueCandidates) {
                  if (recommendedNames.length < maxSelection && !recommendedNames.includes(cand)) {
                      recommendedNames.push(cand);
                  }
              }
              if (recommendedNames.length >= maxSelection) break;
          }
      }
  }


  // Fill remaining with random if needed
  if (recommendedNames.length < Math.min(maxSelection, 1 + Math.floor(Math.random() * Math.min(maxSelection, shuffledMaterials.length)))) {
      for (const mat of shuffledMaterials) {
          if (recommendedNames.length >= maxSelection) break;
          if (!recommendedNames.includes(mat.name)) {
              recommendedNames.push(mat.name);
          }
      }
  }
  
  console.log("AI 추천 (목업):", recommendedNames.slice(0, maxSelection));
  return Promise.resolve(recommendedNames.slice(0, maxSelection));
}
