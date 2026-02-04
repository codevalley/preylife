import * as THREE from 'three';

/**
 * Shader configuration for deep sea predator/hunter creatures.
 * Creates menacing, glowing hunters with lure-like eye effects.
 */
export interface PredatorUniforms {
  uTime: { value: number };
  uEnergy: { value: number };        // 0-1, affects eye glow and saturation
  uStealth: { value: number };       // 0-1, affects body darkness vs lure contrast
  uStrength: { value: number };      // 0-1, affects color intensity
  uBaseColor: { value: THREE.Color };
  uEyeColor: { value: THREE.Color };
  uHunting: { value: number };       // 0-1, hunting intensity
  uGlowIntensity: { value: number }; // Base glow intensity
  uAge: { value: number };           // 0-1, normalized age ratio
  uLongevity: { value: number };     // 0-1, longevity trait
  uLearnability: { value: number };  // 0-1, learnability trait
}

/**
 * Creates uniforms for predator shader with default values
 */
export function createPredatorUniforms(
  baseColor: THREE.Color = new THREE.Color(0xcc4400),
  eyeColor: THREE.Color = new THREE.Color(0xff6600)
): PredatorUniforms {
  return {
    uTime: { value: 0 },
    uEnergy: { value: 1.0 },
    uStealth: { value: 0.5 },
    uStrength: { value: 0.5 },
    uBaseColor: { value: baseColor },
    uEyeColor: { value: eyeColor },
    uHunting: { value: 0 },
    uGlowIntensity: { value: 1.2 },
    uAge: { value: 0 },
    uLongevity: { value: 0.5 },
    uLearnability: { value: 0.5 },
  };
}

/**
 * Vertex shader for predator creatures
 */
export const predatorVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Fragment shader for predator creatures
 * Creates menacing glow with hunting-state intensification
 */
export const predatorFragmentShader = `
  uniform float uTime;
  uniform float uEnergy;
  uniform float uStealth;
  uniform float uStrength;
  uniform vec3 uBaseColor;
  uniform vec3 uEyeColor;
  uniform float uHunting;
  uniform float uGlowIntensity;
  uniform float uAge;
  uniform float uLongevity;
  uniform float uLearnability;

  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    // Base color with strength affecting intensity
    vec3 color = uBaseColor * (0.6 + uStrength * 0.4);

    // Energy affects overall brightness (40% - 100%)
    float energyBrightness = 0.5 + uEnergy * 0.5;

    // Stealth creates contrast: dark body with brighter highlights
    // High stealth = darker base, more contrast
    float bodyDarkness = 1.0 - (uStealth * 0.25);
    color *= bodyDarkness;

    // Age desaturation and scarring
    float ageFactor = uAge * 0.4;
    float gray = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(color, vec3(gray), ageFactor);

    // Scarring noise for old creatures
    if (uAge > 0.5) {
      float scar = sin(vUv.x * 30.0 + vUv.y * 20.0) * sin(vUv.x * 15.0 - vUv.y * 25.0);
      scar = smoothstep(0.3, 0.8, scar) * (uAge - 0.5) * 0.3;
      color += vec3(scar * 0.2, scar * 0.1, 0.0);
    }

    // Hunting intensification
    float huntPulse = sin(uTime * 4.0) * 0.5 + 0.5;
    float huntIntensity = uHunting * huntPulse * 0.3;

    // Eye glow effect - positioned at front of predator
    // UV x > 0.6 is the "front" of the creature
    float eyeZone = smoothstep(0.5, 0.7, vUv.x);

    // Eye glow intensity based on energy and hunting state
    float eyeGlow = eyeZone * (0.6 + uEnergy * 0.5 + uHunting * 0.6);

    // Pulse the eye glow
    float eyePulse = sin(uTime * 3.0 + uHunting * 2.0) * 0.3 + 0.7;
    eyeGlow *= eyePulse;

    // Add eye color to the base
    vec3 finalColor = color * energyBrightness;
    finalColor += uEyeColor * eyeGlow * uGlowIntensity;

    // Lateral line sensor dots (learnability)
    float dotPattern = 0.0;
    if (uLearnability > 0.2) {
      float dotCount = 3.0 + uLearnability * 4.0;
      float dotX = fract(vUv.x * dotCount);
      float dotY = abs(vUv.y - 0.5);
      float dot = smoothstep(0.15, 0.05, length(vec2(dotX - 0.5, dotY)));
      dotPattern = dot * uLearnability;
    }
    finalColor += uEyeColor * dotPattern * 0.5;

    // Add hunting glow over entire body
    finalColor += uEyeColor * huntIntensity;

    // Edge glow for bloom effect
    float edgeDist = length(vUv - vec2(0.5)) * 2.0;
    float edgeGlow = smoothstep(0.4, 1.0, edgeDist);
    finalColor += uEyeColor * edgeGlow * 0.4 * uGlowIntensity * energyBrightness;

    // Slight boost for bloom (subtle)
    finalColor *= 1.0 + uGlowIntensity * 0.1;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

/**
 * Creates a predator shader material
 */
export function createPredatorMaterial(
  uniforms?: Partial<PredatorUniforms>
): THREE.ShaderMaterial {
  const defaultUniforms = createPredatorUniforms();

  // Merge provided uniforms with defaults
  const mergedUniforms = { ...defaultUniforms };
  if (uniforms) {
    Object.assign(mergedUniforms, uniforms);
  }

  return new THREE.ShaderMaterial({
    uniforms: mergedUniforms,
    vertexShader: predatorVertexShader,
    fragmentShader: predatorFragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
  });
}

/**
 * Update shader uniforms based on predator state
 */
export function updatePredatorUniforms(
  material: THREE.ShaderMaterial,
  time: number,
  energy: number,
  maxEnergy: number,
  stealth: number,
  strength: number,
  isHunting: boolean = false,
  age: number = 0,
  longevity: number = 0.5,
  learnability: number = 0.5
): void {
  material.uniforms.uTime.value = time;
  material.uniforms.uEnergy.value = energy / maxEnergy;
  material.uniforms.uStealth.value = stealth;
  material.uniforms.uStrength.value = strength;
  material.uniforms.uHunting.value = isHunting ? 1.0 : 0.0;
  material.uniforms.uAge.value = age;
  material.uniforms.uLongevity.value = longevity;
  material.uniforms.uLearnability.value = learnability;
}
