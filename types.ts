export interface Material {
  id: string;
  name: string;
  type: 'color' | 'effect' | 'shape_modifier' | 'sound';
  color?: string; // Hex color string like '#FF0000'
  effect?: FireworkEffectType;
  shape?: FireworkShapeType;
  soundEffect?: FireworkSoundType;
  description: string;
  icon: string; // Emoji or SVG path
  unlockLevel: number; // 재료가 해금되는 레벨
}

export type FireworkEffectType = '반짝임' | '글리터' | '크랙클링' | '연기꼬리' | '점멸' | '휘슬' | '낙엽' | '물고기' | '회오리' | '유령';
export type FireworkShapeType = '구형' | '야자수형' | '국화형' | '버들형' | '링형' | '하트형' | '별형' | '나비형' | '십자형' | '나선형' | '이중폭발';
export type FireworkSoundType = '펑!' | '휘이익-' | '타닥타닥';

export interface FireworkSpecification {
  id: string;
  colors: string[];
  effects: FireworkEffectType[];
  shape: FireworkShapeType;
  size: number; // e.g., 50-150
  sound: '약함' | '보통' | '강함';
  description: string; // Auto-generated based on materials
  materialIds: string[]; // Added to check for synergies
  achievedSynergyName?: string; // Optional: name of achieved synergy
}

export interface FireworkLaunch extends FireworkSpecification {
  launchTime: number; // Conceptual launch time of the salvo or individual firework
  effectiveLaunchTime: number; // Actual time this specific firework should start animating
  x: number; // 0 to 1 (percentage of canvas width)
  y: number; // 0 to 1 (percentage of canvas height, for launch destination)
}

export interface Situation {
  id: string;
  description: string;
}

export enum GameState {
  LOADING_SITUATION,
  SELECTING_MATERIALS,
  READY_TO_LAUNCH,
  LAUNCHING,
  SHOWING_SCORE,
  LEVEL_UP,
  GAME_OVER, // 게임 오버 상태 추가
  ERROR,
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  life: number; // 0 to 1 initially, then decrements
  effect?: FireworkEffectType; 
  
  // Enhanced visuals properties
  isGlitter?: boolean;
  isSmoke?: boolean;
  swayFactor?: number; 
  swimCycle?: number;  
  baseSize?: number;   
  initialLife?: number; 
  isCrossettePrimary?: boolean; 
  crossetteSplit?: boolean; 

  // New properties for distinctive materials
  hueShift?: number; // For rainbow effect
  isGhostly?: boolean; // For ghostly flame effect
  whirlAngle?: number; // For whirlwind spark effect
  whirlRadius?: number; // For whirlwind spark effect
  whirlSpeed?: number; // For whirlwind spark effect
  
  isMultiStageParent?: boolean; // For multi-stage explosion shape
  multiStageTriggerRatio?: number; // For multi-stage explosion shape
  multiStageSplit?: boolean; // For multi-stage explosion shape
  secondaryColor?: string; // For distinct secondary bursts in multi-stage
}

export interface Synergy {
  id: string;
  name: string;
  materialIds: string[]; // A set of material IDs that trigger this synergy
  bonusScore: number;
  description: string; // Description of the synergy effect
  // Optionally, specific visual overrides or new effects could be defined here
}

export interface EvaluationResult {
  score: number;
  reason: string;
  achievedSynergyName?: string;
  synergyBonus?: number;
  situationBonus?: number;
}

export interface SkyProps {
  fireworks: FireworkLaunch[];
  backgroundHint?: string; // e.g., "winter_night", "summer_party"
}
