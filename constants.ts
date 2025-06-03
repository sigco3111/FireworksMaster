
import { Material, Synergy, FireworkEffectType, FireworkShapeType, FireworkSoundType } from './types';

export const INITIAL_MAX_SELECTED_MATERIALS: number = 3;
export const ROUNDS_FOR_LEVEL_UP: number = 5; 
export const BASE_SCORE_FOR_LEVEL_UP: number = 20; 
export const SCORE_INCREASE_PER_LEVEL: number = 7; 
export const MATERIALS_INCREASE_PER_LEVEL: number = 1;

export const SALVO_SIZE: number = 5; 
export const SALVO_SPREAD: number = 0.7; 
export const SALVO_EXPLOSION_MIN_Y_RATIO: number = 0.15; 
export const SALVO_EXPLOSION_MAX_Y_RATIO: number = 0.45; 
export const MAX_SALVO_STAGGER_MS: number = 750; 

export const SAVE_GAME_KEY = 'fireworksMasterSaveData';

export const MATERIALS: Material[] = [
  // Colors
  { id: 'mat-strontium', name: '스트론튬 화합물', type: 'color', color: '#FF4136', description: '선명한 빨간색을 냅니다.', icon: '🔴', unlockLevel: 1 },
  { id: 'mat-sodium', name: '나트륨 화합물', type: 'color', color: '#FFDC00', description: '밝은 노란색을 냅니다.', icon: '🟡', unlockLevel: 1 },
  { id: 'mat-barium', name: '바륨 화합물', type: 'color', color: '#2ECC40', description: '화려한 초록색을 냅니다.', icon: '🟢', unlockLevel: 1 },
  { id: 'mat-copper', name: '구리 화합물', type: 'color', color: '#0074D9', description: '깊은 파란색을 냅니다.', icon: '🔵', unlockLevel: 1 },
  { id: 'mat-calcium', name: '칼슘 화합물', type: 'color', color: '#FF851B', description: '따뜻한 주황색을 냅니다.', icon: '🟠', unlockLevel: 2 },
  { id: 'mat-potassium', name: '칼륨 화합물', type: 'color', color: '#B10DC9', description: '아름다운 보라색을 냅니다.', icon: '🟣', unlockLevel: 2 },
  { id: 'mat-white-spark', name: '마그날륨 합금', type: 'color', color: '#FFFFFF', description: '눈부신 백색 불꽃을 만듭니다.', icon: '⚪', unlockLevel: 2 },
  { id: 'mat-cyan', name: '청록 불꽃 시약', type: 'color', color: '#00FFFF', description: '신비로운 청록색 불꽃을 만듭니다.', icon: '💠', unlockLevel: 3 },
  { id: 'mat-pink-powder', name: '루비 분말', type: 'color', color: '#FFC0CB', description: '사랑스러운 분홍색 불꽃을 냅니다.', icon: '🎀', unlockLevel: 3 },
  { id: 'mat-electric-lime', name: '일렉트릭 라임', type: 'color', color: '#39FF14', description: '짜릿한 형광 라임색 불꽃을 만듭니다.', icon: '❇️', unlockLevel: 4 },
  { id: 'mat-rainbow-agent', name: '무지개 변환제', type: 'color', color: 'rainbow', description: '불꽃 입자가 다채로운 무지개색으로 변합니다.', icon: '🌈', unlockLevel: 5 },
  
  // Effects
  { id: 'mat-titanium', name: '티타늄 가루', type: 'effect', effect: '반짝임', description: '밝고 하얀 불꽃을 흩날립니다.', icon: '✨', unlockLevel: 1 },
  { id: 'mat-magnesium', name: '마그네슘 가루', type: 'effect', effect: '글리터', description: '반짝이는 글리터 효과를 줍니다.', icon: '🎇', unlockLevel: 2 },
  { id: 'mat-charcoal', name: '목탄 가루', type: 'effect', effect: '연기꼬리', description: '긴 연기 꼬리를 만듭니다.', icon: '💨', unlockLevel: 2 },
  { id: 'mat-potassium-perchlorate', name: '과염소산칼륨', type: 'effect', effect: '크랙클링', description: '타닥타닥 터지는 소리와 효과를 냅니다.', icon: '💥', unlockLevel: 3 },
  { id: 'mat-strobe-mix', name: '스트로브 혼합물', type: 'effect', effect: '점멸', description: '깜빡이는 점멸 효과를 만듭니다.', icon: '🌟', unlockLevel: 3 },
  { id: 'mat-whistle-mix', name: '휘슬 혼합물', type: 'effect', effect: '휘슬', description: '날카로운 휘파람 소리를 내며 상승합니다.', icon: '🎶', unlockLevel: 4 },
  { id: 'mat-falling-leaves', name: '낙엽 효과제', type: 'effect', effect: '낙엽', description: '색색의 불꽃잎이 흩날리듯 떨어집니다.', icon: '🍂', unlockLevel: 4 },
  { id: 'mat-swimming-stars', name: '유영별 효과제', type: 'effect', effect: '물고기', description: '작은 불꽃들이 물고기처럼 헤엄칩니다.', icon: '🐠', unlockLevel: 5 },
  { id: 'mat-ghostly-flame', name: '유령 불꽃 시약', type: 'effect', effect: '유령', description: '반투명하고 흔들리는 유령 불꽃을 만듭니다.', icon: '👻', unlockLevel: 5 },
  { id: 'mat-whirlwind-spark', name: '회오리 불꽃 촉매', type: 'effect', effect: '회오리', description: '각 불꽃 입자가 작은 회오리처럼 돕니다.', icon: '💫', unlockLevel: 6 },

  // Shape Modifiers
  { id: 'mat-spherical-charge', name: '구형 폭약', type: 'shape_modifier', shape: '구형', description: '기본적인 구형 폭발을 만듭니다.', icon: '⚽', unlockLevel: 1 },
  { id: 'mat-palm-charge', name: '야자수형 폭약', type: 'shape_modifier', shape: '야자수형', description: '야자수 모양으로 퍼지는 효과를 냅니다.', icon: '🌴', unlockLevel: 2 },
  { id: 'mat-peony-charge', name: '모란형 폭약', type: 'shape_modifier', shape: '국화형', description: '모란(국화) 꽃처럼 풍성하게 퍼집니다.', icon: '🌸', unlockLevel: 3 },
  { id: 'mat-ring-charge', name: '링형 폭약', type: 'shape_modifier', shape: '링형', description: '고리 모양의 불꽃을 만듭니다.', icon: '⭕', unlockLevel: 3 },
  { id: 'mat-willow-charge', name: '버들형 폭약', type: 'shape_modifier', shape: '버들형', description: '버드나무 가지처럼 길게 늘어지는 효과를 냅니다.', icon: '🌿', unlockLevel: 4 },
  { id: 'mat-heart-charge', name: '하트형 폭약', type: 'shape_modifier', shape: '하트형', description: '하트 모양의 불꽃을 만듭니다.', icon: '💖', unlockLevel: 4 },
  { id: 'mat-star-mold', name: '별모양 틀', type: 'shape_modifier', shape: '별형', description: '밤하늘의 별처럼 반짝이는 모양을 만듭니다.', icon: '⭐', unlockLevel: 5 },
  { id: 'mat-butterfly-charge', name: '나비형 폭약', type: 'shape_modifier', shape: '나비형', description: '아름다운 나비 모양으로 퍼집니다.', icon: '🦋', unlockLevel: 5 },
  { id: 'mat-crossette-stars', name: '십자형 성형체', type: 'shape_modifier', shape: '십자형', description: '여러 갈래로 갈라지며 십자 모양을 그립니다.', icon: '✚', unlockLevel: 6 },
  { id: 'mat-spiral-core', name: '나선형 코어', type: 'shape_modifier', shape: '나선형', description: '불꽃이 나선 모양으로 터져나갑니다.', icon: '🌀', unlockLevel: 6 },
  { id: 'mat-dual-burst-charge', name: '이중 폭발 장약', type: 'shape_modifier', shape: '이중폭발', description: '주 폭발 후 작은 2차 폭발들이 일어납니다.', icon: '🎆', unlockLevel: 7 },
  
  // Sound (Simplified)
  { id: 'mat-loud-powder', name: '강력 폭음제', type: 'sound', soundEffect: '펑!', description: '크고 웅장한 폭발음을 냅니다.', icon: '🔊', unlockLevel: 1 },
];

export const PARTICLE_SETTINGS = {
  GRAVITY: 0.03,
  BASE_LIFESPAN: 100, // frames
  EXPLOSION_PARTICLE_COUNT: 100,
  ROCKET_SPEED: -3, // Negative for upward movement
  TERMINAL_VELOCITY: 4,
};

export const SYNERGIES: Synergy[] = [
  {
    id: 'syn-golden-willow',
    name: '황금 낙하산',
    materialIds: ['mat-sodium', 'mat-willow-charge', 'mat-titanium'],
    bonusScore: 3,
    description: '노란색 버들형 불꽃에 반짝임이 더해져 황금빛 낙하산처럼 보입니다.'
  },
  {
    id: 'syn-ghostly-glitter',
    name: '유령 반짝이',
    materialIds: ['mat-ghostly-flame', 'mat-magnesium'],
    bonusScore: 2,
    description: '유령 불꽃에 글리터가 추가되어 신비롭고 아름다운 효과를 냅니다.'
  },
  {
    id: 'syn-rainbow-star',
    name: '무지개 별',
    materialIds: ['mat-rainbow-agent', 'mat-star-mold'],
    bonusScore: 3,
    description: '무지개색으로 변하는 별 모양 불꽃이 밤하늘을 수놓습니다.'
  },
  {
    id: 'syn-crackling-palm',
    name: '타닥이는 야자수',
    materialIds: ['mat-palm-charge', 'mat-potassium-perchlorate', 'mat-barium'],
    bonusScore: 2,
    description: '초록색 야자수 불꽃에 크랙클링 효과가 더해져 생동감을 줍니다.'
  },
  {
    id: 'syn-blue-heart-smoke',
    name: '푸른 심장의 연기',
    materialIds: ['mat-copper', 'mat-heart-charge', 'mat-charcoal'],
    bonusScore: 2,
    description: '푸른 하트 모양 불꽃이 연기 꼬리를 남기며 애틋함을 더합니다.'
  }
];

// For dynamic background and situation-based scoring
export const SITUATION_KEYWORD_MAP: { 
  [key: string]: { 
    hint: string, 
    colors?: string[], 
    effects?: FireworkEffectType[], 
    shapes?: FireworkShapeType[], 
    soundEffect?: FireworkSoundType[],
    bonus: number 
  } 
} = {
  "겨울": { hint: "winter_night", colors: ["#FFFFFF", "#0074D9", "#00FFFF"], effects: ["반짝임", "글리터"], bonus: 1 }, // White, Blue, Cyan
  "눈": { hint: "winter_night", colors: ["#FFFFFF", "#00FFFF"], effects: ["글리터", "낙엽"], bonus: 1 },
  "여름": { hint: "summer_party", colors: ["#FFDC00", "#FF851B", "#FF4136", "#2ECC40"], effects: ["크랙클링"], bonus: 1 }, // Yellow, Orange, Red, Green
  "해변": { hint: "summer_beach", colors: ["#FFDC00", "#0074D9", "#00FFFF"], shapes:["야자수형", "링형"], bonus: 1 },
  "파티": { hint: "summer_party", colors: ["rainbow", "#B10DC9", "#FFC0CB", "#39FF14"], effects: ["글리터", "크랙클링", "점멸"], bonus: 2 }, // Rainbow, Purple, Pink, Lime
  "축하": { hint: "celebration", colors: ["#FFDC00", "rainbow"], effects: ["반짝임", "글리터", "크랙클링"], bonus: 1 },
  "고요한": { hint: "calm_night", colors: ["#FFFFFF", "#0074D9", "#B10DC9"], effects: ["연기꼬리", "유령", "낙엽"], bonus: 1 },
  "로맨틱": { hint: "romantic_night", colors: ["#FFC0CB", "#FF4136", "#B10DC9"], shapes: ["하트형", "버들형"], effects: ["글리터", "유령"], bonus: 1 },
  "신비": { hint: "mystical_night", colors: ["#0074D9", "#B10DC9", "#00FFFF", "rainbow"], effects: ["유령", "연기꼬리", "회오리"], shapes: ["나선형"], bonus: 2 },
  "새해": { hint: "new_year_celebration", colors: ["#FFDC00", "#FFFFFF", "rainbow"], effects: ["반짝임", "글리터", "크랙클링"], bonus: 2},
  "동화": { hint: "fairy_tale_night", colors: ["#FFC0CB", "#B10DC9", "rainbow", "#00FFFF"], effects: ["글리터", "물고기", "유령"], shapes: ["별형", "나비형", "하트형"], bonus: 1},
  "승리": { hint: "victory_celebration", colors: ["#FF4136", "#FFDC00", "#FFFFFF"], effects: ["크랙클링", "반짝임"], soundEffect: ["펑!"], bonus: 1},
  "음악": { hint: "music_festival_night", colors: ["rainbow", "#39FF14", "#B10DC9"], effects: ["점멸", "회오리", "휘슬"], bonus: 1},
  "마법": { hint: "magical_night", colors: ["#B10DC9", "rainbow", "#0074D9"], effects: ["유령", "글리터", "회오리"], shapes: ["별형", "나선형"], bonus: 2},
};
