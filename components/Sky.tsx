
import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { FireworkLaunch, Particle, FireworkEffectType, SkyProps } from '../types';
import { PARTICLE_SETTINGS } from '../constants';

interface AnimatedFirework {
  id: string;
  x: number; // explosion center x
  y: number; // explosion center y (target for rocket)
  particles: Particle[];
  colors: string[];
  effects: FireworkEffectType[];
  shape: string; 
  rocketState: 'pending' | 'flying' | 'exploded';
  rocketY: number; // current rocket Y position
  rocketTargetY: number; // Y position where rocket should explode
  effectiveLaunchTime: number; // Actual time this firework should start animating
}

const defaultBackgroundColors = {
  top: 'rgba(15, 23, 42, 0.2)', // slate-900 with opacity
  bottom: 'rgba(49, 46, 129, 0.2)' // indigo-900 with opacity
};

const backgroundHintsMap: {[key:string]: {top: string, bottom: string}} = {
  "winter_night": { top: 'rgba(23, 37, 84, 0.3)', bottom: 'rgba(30, 58, 138, 0.3)' }, // darker blues
  "summer_party": { top: 'rgba(74, 20, 140, 0.25)', bottom: 'rgba(255, 109, 0, 0.25)' }, // purple to orange
  "summer_beach": { top: 'rgba(37, 99, 235, 0.2)', bottom: 'rgba(253, 224, 71, 0.2)' }, // blue to yellow
  "calm_night": { top: 'rgba(15, 23, 42, 0.25)', bottom: 'rgba(55, 48, 163, 0.25)' }, // deep slate to violet
  "romantic_night": { top: 'rgba(76, 29, 149, 0.25)', bottom: 'rgba(219, 39, 119, 0.25)' }, // deep purple to pink
  "mystical_night": { top: 'rgba(30, 27, 75, 0.3)', bottom: 'rgba(0, 100, 0, 0.3)' }, // indigo to dark green
  "celebration": { top: 'rgba(126, 34, 206, 0.2)', bottom: 'rgba(227, 100, 20, 0.2)'}, // purple to orange
  "new_year_celebration": {top: 'rgba(217, 119, 6, 0.25)', bottom: 'rgba(168, 85, 247, 0.25)'}, // gold to purple
  "fairy_tale_night": {top: 'rgba(120, 50, 220, 0.25)', bottom: 'rgba(0, 128, 128, 0.25)'}, // pink/purple to teal
  "victory_celebration": {top: 'rgba(190, 24, 93, 0.3)', bottom: 'rgba(252, 211, 77, 0.3)'}, // crimson to gold
  "music_festival_night": {top: 'rgba(29, 78, 216, 0.3)', bottom: 'rgba(217, 70, 239, 0.3)'}, // blue to fuchsia
  "magical_night": {top: 'rgba(56, 189, 248, 0.2)', bottom: 'rgba(109, 40, 217, 0.3)'} // sky blue to deep violet
}

export const Sky: React.FC<SkyProps> = ({ fireworks, backgroundHint }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeFireworksRef = useRef<AnimatedFirework[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);

  const currentBackground = useMemo(() => {
    return backgroundHint && backgroundHintsMap[backgroundHint] 
      ? backgroundHintsMap[backgroundHint] 
      : defaultBackgroundColors;
  }, [backgroundHint]);


  const createParticles = useCallback((fw: AnimatedFirework): Particle[] => {
    const particles: Particle[] = [];
    let numParticles = PARTICLE_SETTINGS.EXPLOSION_PARTICLE_COUNT;
    const baseColor = fw.colors[0] || '#FFFFFF'; 
    const hasGlitter = fw.effects.includes('글리터');
    const hasSmokeTrail = fw.effects.includes('연기꼬리');
    const hasFallingLeaves = fw.effects.includes('낙엽');
    const hasFish = fw.effects.includes('물고기');
    const hasGhostly = fw.effects.includes('유령');
    const hasWhirlwind = fw.effects.includes('회오리');
    const isRainbow = fw.colors.includes('rainbow');

    if (hasGlitter) numParticles *= 1.8;
    if (hasGhostly) numParticles *= 0.7; 


    for (let i = 0; i < numParticles; i++) {
      let angle = Math.random() * Math.PI * 2;
      let speed = Math.random() * 2.5 + 2.0; 
      
      let particleLife = PARTICLE_SETTINGS.BASE_LIFESPAN * (Math.random() * 0.4 + 0.8);
      let particleSize = Math.random() * 2 + 1.5;
      let currentOpacity = 1.0;
      let particleColor = baseColor;
       if (fw.colors.length > 1 && !isRainbow) {
          const nonRainbowColors = fw.colors.filter(c => c !== 'rainbow');
          if (nonRainbowColors.length > 0) {
            particleColor = nonRainbowColors[Math.floor(Math.random() * nonRainbowColors.length)];
          } else if (isRainbow) {
             // Handled by hueShift later
          } else {
            particleColor = '#FFFFFF'; 
          }
      } else if (fw.colors.length === 1 && !isRainbow) {
          particleColor = fw.colors[0];
      }


      let p: Partial<Particle> = {
        isGlitter: hasGlitter,
        isSmoke: hasSmokeTrail,
        isGhostly: hasGhostly,
      };
      
      if (isRainbow) {
        p.hueShift = Math.random() * 360;
      }

      if (hasGlitter) {
        particleSize = Math.random() * 1.5 + 0.5; 
        p.baseSize = particleSize;
      }

      if (hasSmokeTrail) {
        particleLife *= 1.8; 
        if (fw.colors.length === 0 || Math.random() < 0.7 || (fw.colors.length === 1 && fw.colors[0] === 'rainbow')) { 
             const greyTone = Math.floor(Math.random() * 55) + 100; 
             particleColor = `rgb(${greyTone},${greyTone},${greyTone})`;
        }
        currentOpacity = 0.6; 
      }
      
      if (hasFallingLeaves) {
        particleLife *= 1.5;
        speed *= 0.7; 
        p.swayFactor = (Math.random() - 0.5) * 2; 
      }

      if (hasFish) {
        particleLife *= 1.3;
        speed *= 0.8;
        p.swimCycle = Math.random() * Math.PI * 2; 
      }

      if (hasGhostly) {
        particleLife *= 2.0; 
        speed *= 0.4; 
        currentOpacity = 0.3 + Math.random() * 0.2; 
      }

      if (hasWhirlwind) {
        p.whirlAngle = Math.random() * Math.PI * 2;
        p.whirlRadius = 0;
        p.whirlSpeed = (Math.random() * 0.03 + 0.02); 
      }

      let vx = Math.cos(angle) * speed;
      let vy = Math.sin(angle) * speed;

      switch (fw.shape) {
          case '야자수형': 
              vy = Math.sin(angle) * speed * (Math.random() * 0.3 + 0.3) - (Math.random() * 1.2 + 1.0); 
              vx = Math.cos(angle) * speed * (Math.random() * 0.3 + 0.5); 
              particleLife *= 1.5; 
              if (i < numParticles * 0.1) { 
                vy = -speed * (Math.random() * 0.5 + 1.5); 
                vx = (Math.random() - 0.5) * speed * 0.3;
              }
              break;
          case '국화형': 
              speed = (Math.random() * 0.6 + 0.9) * 3.8; 
              particleLife *= 1.45; 
              vx = Math.cos(angle) * speed;
              vy = Math.sin(angle) * speed;
              break;
          case '버들형': 
              speed = Math.random() * 1.0 + 0.8; 
              vx = Math.cos(angle) * speed * (Math.random() * 0.2 + 0.3); 
              vy = Math.sin(angle) * speed * (Math.random() * 0.4 + 0.2) + (Math.random() * 0.5 + 0.6); 
              particleLife *= 3.8; 
              if (fw.colors.length === 0 || (fw.colors.length === 1 && (fw.colors[0] === '#FFFFFF' || fw.colors[0] === 'rainbow'))) {
                const goldShades = ['#FFD700', '#FFA500', '#FFC300', '#FFBF00'];
                particleColor = goldShades[Math.floor(Math.random() * goldShades.length)];
              }
              break;
          case '링형': 
              const ringOuterSpeed = 3.5 + Math.random() * 0.8; 
              const ringInnerSpeed = 2.5 + Math.random() * 0.6; 
              speed = ringInnerSpeed + Math.random() * (ringOuterSpeed - ringInnerSpeed);
              vx = Math.cos(angle) * speed;
              vy = Math.sin(angle) * speed;
              particleLife *= 0.95;
              break;
          case '하트형': 
              const tHeart = angle; 
              const heartScaleFactor = speed / 13; 
              vx = heartScaleFactor * (16 * Math.pow(Math.sin(tHeart), 3));
              vy = -heartScaleFactor * (13 * Math.cos(tHeart) - 5 * Math.cos(2 * tHeart) - 2 * Math.cos(3 * tHeart) - Math.cos(4 * tHeart));
              vy -= speed * (Math.random() * 0.2 + 0.3); 
              break;
          case '별형': 
              const numPoints = 5;
              const pointAngle = (Math.PI * 2) / numPoints;
              const currentPoint = Math.floor(i / (numParticles / numPoints));
              angle = currentPoint * pointAngle + (Math.random() - 0.5) * (pointAngle * 0.6); 
              speed *= 1.2; 
              if (Math.random() < 0.3 && !isRainbow) particleColor = '#FFFF00'; 
              vx = Math.cos(angle) * speed;
              vy = Math.sin(angle) * speed;
              particleLife *= 0.9;
              break;
         case '나비형': 
              const tButterfly = angle;
              const butterflySpeedFactor = speed * 1.1;
              const R = (Math.exp(Math.cos(tButterfly)) - 2 * Math.cos(4 * tButterfly) + Math.pow(Math.sin(tButterfly / 12), 5));
              vx = Math.sin(tButterfly) * R * butterflySpeedFactor * 0.3;
              vy = -Math.cos(tButterfly) * R * butterflySpeedFactor * 0.3 - speed * 0.2; 
              particleLife *= 1.1;
              particleSize *= 0.8;
              break;
          case '십자형': 
              const crossetteArms = 4; 
              const armBaseAngle = (Math.PI * 2) / crossetteArms;
              const assignedArm = i % crossetteArms;
              angle = assignedArm * armBaseAngle + (Math.random() - 0.5) * (armBaseAngle * 0.2); 
              vx = Math.cos(angle) * speed * 1.3; 
              vy = Math.sin(angle) * speed * 1.3;
              particleLife *= 0.8;
              p.isCrossettePrimary = true; 
              p.crossetteSplit = false;
              break;
          case '나선형': 
              const spiralTheta = Math.sqrt(i / numParticles) * 4 * Math.PI; 
              const spiralRadiusFactor = speed * 1.8; 
              const currentRadius = (spiralTheta / (4 * Math.PI)) * spiralRadiusFactor * (0.5 + Math.random() * 0.5) ;
              vx = Math.cos(spiralTheta) * currentRadius * 0.7 - Math.sin(spiralTheta) * currentRadius * 0.2; 
              vy = Math.sin(spiralTheta) * currentRadius * 0.7 + Math.cos(spiralTheta) * currentRadius * 0.2;
              particleLife *= 1.2;
              particleSize *= 0.8;
              break;
          case '이중폭발': 
              vx = Math.cos(angle) * speed;
              vy = Math.sin(angle) * speed;
              if (i % (hasGhostly ? 8:5) === 0) { 
                  p.isMultiStageParent = true;
                  p.multiStageTriggerRatio = 0.35 + Math.random() * 0.3; 
                  p.multiStageSplit = false;
                  particleLife *= 0.8; 
                  if (fw.colors.length > 1 && !isRainbow) {
                     const parentColorIndex = fw.colors.indexOf(particleColor);
                     const availableSecondaryColors = fw.colors.filter((c, idx) => c !== 'rainbow' && idx !== parentColorIndex);
                     if (availableSecondaryColors.length > 0) {
                       p.secondaryColor = availableSecondaryColors[Math.floor(Math.random() * availableSecondaryColors.length)];
                     }
                  }
              }
              break;
      }
      
      const initialLife = particleLife; 

      if (particleLife > 0) { 
          particles.push({
              id: `p-${fw.id}-${i}-${Date.now()}`,
              x: fw.x,
              y: fw.y,
              vx,
              vy,
              size: particleSize,
              color: particleColor, 
              opacity: currentOpacity,
              life: particleLife,
              initialLife: initialLife,
              ...p 
          });
      }
    }
    return particles;
  }, []);

  const updateAndDraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentTime = Date.now();

    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, currentBackground.top);
    grad.addColorStop(1, currentBackground.bottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    activeFireworksRef.current.forEach((fw, fwIndex) => {
      if (fw.rocketState === 'pending') {
        if (currentTime >= fw.effectiveLaunchTime) {
          fw.rocketState = 'flying';
        } else {
          return;
        }
      }
      
      if (fw.rocketState === 'flying') {
        ctx.fillStyle = '#FFFFFF'; 
        ctx.beginPath();
        ctx.arc(fw.x, fw.rocketY, 2.5, 0, Math.PI * 2); 
        ctx.fill();
        
        if (Math.random() < 0.6) { 
             fw.particles.push({
                id: `trail-${fw.id}-${Date.now()}`,
                x: fw.x + (Math.random() - 0.5) * 6, 
                y: fw.rocketY + Math.random() * 12, 
                vx: (Math.random() - 0.5) * 0.3,
                vy: Math.random() * 0.6 + 0.3, 
                size: Math.random() * 1.8 + 0.8,
                color: '#FFD700', 
                opacity: 0.7,
                life: 15 + Math.random() * 10, 
                initialLife: 25, 
            });
        }

        fw.rocketY += PARTICLE_SETTINGS.ROCKET_SPEED;
        if (fw.rocketY <= fw.rocketTargetY) {
          fw.rocketState = 'exploded';
          const newParticles = createParticles(fw);
          fw.particles.push(...newParticles);
        }
      }
      
      const particlesToAdd: Particle[] = [];

      fw.particles = fw.particles.filter(p => {
        p.vx *= (p.isSmoke || p.isGhostly ? 0.995 : 0.985); 
        p.vy += (p.isSmoke && p.vy < 0.5) ? PARTICLE_SETTINGS.GRAVITY * 0.5 : PARTICLE_SETTINGS.GRAVITY; 
        
        if (fw.shape === '버들형') {
           p.vy += PARTICLE_SETTINGS.GRAVITY * 0.3; 
        }

        if (p.isGhostly) {
          p.vy += PARTICLE_SETTINGS.GRAVITY * (Math.random() * 0.4 - 0.2); 
          p.vx += (Math.random() - 0.5) * 0.05; 
        }

         if (p.swayFactor && fw.effects.includes('낙엽')) { 
            p.vx += Math.sin(p.life * 0.05 + (parseInt(p.id.slice(-5),16) % 100 )) * 0.03 * p.swayFactor; 
            p.vy *= 0.98; 
        }
        if (p.swimCycle && fw.effects.includes('물고기')) { 
            const swimSpeed = 0.06;
            p.vx += Math.cos(p.life * 0.15 + p.swimCycle) * swimSpeed * (Math.sin(p.life * 0.05) + 0.5);
            p.vy += Math.sin(p.life * 0.1 + p.swimCycle) * swimSpeed * 0.6 * (Math.cos(p.life * 0.05) + 0.5);
            p.vx *= 0.96; 
            p.vy *= 0.96;
        }

        if (p.whirlAngle !== undefined && p.whirlRadius !== undefined && p.whirlSpeed !== undefined && p.initialLife) {
           const lifeProgress = 1 - (p.life / p.initialLife);
           p.whirlRadius += p.whirlSpeed * (1-lifeProgress*0.5); 
           const offsetX = Math.cos(p.whirlAngle) * p.whirlRadius * (0.5 + Math.sin(p.life * 0.2)*0.5);
           const offsetY = Math.sin(p.whirlAngle) * p.whirlRadius * (0.5 + Math.sin(p.life * 0.2)*0.5);
           p.x += offsetX;
           p.y += offsetY;
           p.whirlAngle += 0.15 + (Math.random() -0.5) * 0.1 + lifeProgress * 0.1; 
        }


        p.vy = Math.min(p.vy, PARTICLE_SETTINGS.TERMINAL_VELOCITY);

        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
        
        const lifeRatio = Math.max(0, p.life / (p.initialLife || PARTICLE_SETTINGS.BASE_LIFESPAN));
        
        if (p.isSmoke) {
           p.opacity = lifeRatio * 0.6; 
        } else if (p.isGhostly) {
           p.opacity = lifeRatio * (0.2 + Math.sin(p.life * 0.05 + (parseInt(p.id.slice(-2),16))) * 0.15); 
        }
        else {
           p.opacity = lifeRatio;
        }
        
        if (p.isGlitter && p.baseSize) {
            const shimmer = Math.sin(p.life * 0.3 + (parseInt(p.id.slice(-3),16) % 100)) ; 
            p.opacity = Math.max(0.1, lifeRatio * (0.6 + shimmer * 0.4));
            p.size = p.baseSize + shimmer * 0.5;
        }

        if (p.hueShift !== undefined && p.initialLife) {
            p.color = `hsl(${(p.hueShift + (p.initialLife - p.life) * 3) % 360}, 100%, 65%)`;
        }


        if (fw.effects.includes('크랙클링') && p.life < (p.initialLife || PARTICLE_SETTINGS.BASE_LIFESPAN) * 0.3 && p.life > 0 && Math.random() < 0.15) {
          // Further reduce particle count for crackling to 1/10th:
          // Original avg per trigger: 2.5 particles. New avg: 0.25 particles (1 particle with 25% chance)
          if (Math.random() < 0.25) { 
            particlesToAdd.push({
              id: `crackle-${p.id}-0`, // Single particle
              x: p.x, y: p.y,
              vx: (Math.random() - 0.5) * 1.5, // Reduced velocity/spread
              vy: (Math.random() - 0.5) * 1.5,
              size: Math.random() * 0.8 + 0.4, // Smaller size
              color: ['#FFA500', '#FFB000', '#FFC000'][Math.floor(Math.random()*3)], // Lighter orange
              opacity: 0.9, // Slightly less opaque
              life: 5 + Math.random() * 5, // Shorter life
              initialLife: 10,
            });
          }
        }

        if (p.isCrossettePrimary && !p.crossetteSplit && p.initialLife && p.life < p.initialLife * 0.7) {
            p.crossetteSplit = true; 
            const splitCount = 3 + Math.floor(Math.random() * 2); 
            for (let k = 0; k < splitCount; k++) {
                const angleOffset = (Math.PI * 2 / splitCount) * k;
                const splitSpeed = 1 + Math.random();
                 particlesToAdd.push({
                    id: `crossette-split-${p.id}-${k}`,
                    x: p.x, y: p.y,
                    vx: p.vx * 0.1 + Math.cos(Math.atan2(p.vy,p.vx) + angleOffset) * splitSpeed, 
                    vy: p.vy * 0.1 + Math.sin(Math.atan2(p.vy,p.vx) + angleOffset) * splitSpeed,
                    size: p.size * 0.6,
                    color: p.color, 
                    opacity: 1,
                    life: p.life * 0.5,
                    initialLife: p.life * 0.5,
                    hueShift: p.hueShift !== undefined ? (p.hueShift + Math.random() * 60) % 360 : undefined, 
                });
            }
            p.life = 0; 
        }

        if (p.isMultiStageParent && !p.multiStageSplit && p.initialLife && p.multiStageTriggerRatio && p.life < (p.initialLife * p.multiStageTriggerRatio)) {
            p.multiStageSplit = true;
            const numSecondary = 5 + Math.floor(Math.random() * (p.isGhostly ? 3 : 5)); 
            const secondaryParticleSize = p.size * (p.isGhostly ? 0.7 : 0.4); 
            const secondaryLife = (p.initialLife || PARTICLE_SETTINGS.BASE_LIFESPAN) * (p.isGhostly ? 0.5 : 0.35); 
            
            for (let k=0; k < numSecondary; k++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = (p.isGhostly ? 0.5 : 1.2) + Math.random() * (p.isGhostly ? 0.6 : 1.8); 
                let secondaryColorToUse = p.secondaryColor || p.color; 
                 if (fw.colors.length === 0 && !fw.colors.includes('rainbow')) {
                     secondaryColorToUse = '#FFFFFF';   
                }

                particlesToAdd.push({
                    id: `ms-${p.id}-${k}`,
                    x: p.x, y: p.y,
                    vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                    size: Math.max(0.5, secondaryParticleSize * (0.7 + Math.random() * 0.5)),
                    color: secondaryColorToUse,
                    opacity: p.isGhostly ? 0.25 : 0.9, 
                    life: secondaryLife * (0.7 + Math.random() * 0.5),
                    initialLife: secondaryLife,
                    isGlitter: p.isGlitter && Math.random() < 0.5, 
                    baseSize: p.isGlitter && p.baseSize ? p.baseSize * 0.5 : undefined,
                    isGhostly: p.isGhostly, 
                    hueShift: p.hueShift !== undefined ? (p.hueShift + 90 + Math.random() * 90) % 360 : undefined, 
                    whirlAngle: p.whirlAngle !== undefined && Math.random() < 0.3 ? Math.random() * Math.PI * 2 : undefined, 
                    whirlRadius: p.whirlRadius !== undefined && Math.random() < 0.3 ? 0 : undefined,
                    whirlSpeed: p.whirlSpeed !== undefined && Math.random() < 0.3 ? p.whirlSpeed * (0.4 + Math.random()*0.4) : undefined,
                });
            }
            p.life = p.isGhostly ? p.life * 0.1 : 0; 
        }
        
        let finalOpacity = p.opacity;
        if (fw.effects.includes('점멸') && p.life > 0 && !p.isGhostly) { 
            finalOpacity = (Math.floor(p.life / (p.isSmoke ? 20 : 8)) % 2 === 0) ? p.opacity * 0.1 : p.opacity; 
        }
        
        ctx.globalAlpha = Math.max(0, Math.min(1, finalOpacity));
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.1, p.size), 0, Math.PI * 2); 
        ctx.fill();
        

        return p.life > 0 && p.y < canvas.height + p.size && p.x > -p.size && p.x < canvas.width + p.size;
      });
      
      fw.particles.push(...particlesToAdd); 
      ctx.globalAlpha = 1; 

      if (fw.rocketState === 'exploded' && fw.particles.length === 0) {
        activeFireworksRef.current.splice(fwIndex, 1);
      }
    });

    animationFrameIdRef.current = requestAnimationFrame(updateAndDraw);
  }, [createParticles, currentBackground]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const parent = canvas.parentElement;
    if (parent) { 
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
    }

    fireworks.forEach(newFwSpec => {
      if (!activeFireworksRef.current.find(afw => afw.id === newFwSpec.id)) {
        activeFireworksRef.current.push({
          id: newFwSpec.id,
          x: newFwSpec.x * canvas.width,
          y: newFwSpec.y * canvas.height, 
          particles: [],
          colors: newFwSpec.colors.length > 0 ? newFwSpec.colors : ['#FFFFFF'],
          effects: newFwSpec.effects,
          shape: newFwSpec.shape,
          rocketState: 'pending', 
          rocketY: canvas.height, 
          rocketTargetY: newFwSpec.y * canvas.height,
          effectiveLaunchTime: newFwSpec.effectiveLaunchTime, 
        });
      }
    });
    
    if (!animationFrameIdRef.current) {
        animationFrameIdRef.current = requestAnimationFrame(updateAndDraw);
    }

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [fireworks, updateAndDraw]);
  
   useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    let resizeFrameId: number | null = null;

    const observer = new ResizeObserver(entries => {
      if (resizeFrameId) {
        cancelAnimationFrame(resizeFrameId);
      }
      resizeFrameId = requestAnimationFrame(() => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          if (canvasRef.current) { 
            if (canvasRef.current.width !== width || canvasRef.current.height !== height) {
                const oldCanvasWidth = canvasRef.current.width;
                const oldCanvasHeight = canvasRef.current.height;
                canvasRef.current.width = width;
                canvasRef.current.height = height;

                 // Adjust active fireworks positions based on new canvas size
                activeFireworksRef.current.forEach(fw => {
                    fw.x = (fw.x / oldCanvasWidth) * width;
                    if (fw.rocketState === 'flying') {
                        fw.rocketY = (fw.rocketY / oldCanvasHeight) * height;
                        fw.rocketTargetY = (fw.rocketTargetY / oldCanvasHeight) * height;
                    } else if (fw.rocketState === 'exploded') {
                        fw.y = (fw.y / oldCanvasHeight) * height; // Explosion center
                        fw.particles.forEach(p => {
                            p.x = (p.x / oldCanvasWidth) * width;
                            p.y = (p.y / oldCanvasHeight) * height;
                        });
                    } else { // PENDING
                         fw.rocketTargetY = (fw.rocketTargetY / oldCanvasHeight) * height;
                         fw.rocketY = height; // Reset rocketY to new bottom if pending
                    }
                });
            }
          }
        }
        resizeFrameId = null;
      });
    });

    observer.observe(parent);

    return () => {
      if (resizeFrameId) {
        cancelAnimationFrame(resizeFrameId);
      }
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};
