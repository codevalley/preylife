import * as THREE from 'three';

/**
 * Shader configuration for bioluminescent creatures.
 * Creates glowing, organic-looking entities with attribute-driven appearance.
 */
export interface BioluminescentUniforms {
  uTime: { value: number };
  uEnergy: { value: number };        // 0-1, affects brightness
  uStealth: { value: number };       // 0-1, inversely affects glow intensity
  uStrength: { value: number };      // 0-1, affects body color saturation
  uAge: { value: number };           // 0-1, normalized age
  uLongevity: { value: number };     // 0-1, longevity attribute
  uBaseColor: { value: THREE.Color };
  uGlowColor: { value: THREE.Color };
  uPulseSpeed: { value: number };    // Pulse animation speed
  uGlowIntensity: { value: number }; // Base glow intensity
}

/**
 * Creates uniforms for bioluminescent shader with default values
 */
export function createBioluminescentUniforms(
  baseColor: THREE.Color = new THREE.Color(0x00ccff),
  glowColor: THREE.Color = new THREE.Color(0x00ffff)
): BioluminescentUniforms {
  return {
    uTime: { value: 0 },
    uEnergy: { value: 1.0 },
    uStealth: { value: 0.5 },
    uStrength: { value: 0.5 },
    uAge: { value: 0 },
    uLongevity: { value: 0.5 },
    uBaseColor: { value: baseColor },
    uGlowColor: { value: glowColor },
    uPulseSpeed: { value: 2.0 },
    uGlowIntensity: { value: 1.0 },
  };
}

/**
 * Vertex shader for bioluminescent creatures
 * Handles position and passes attributes to fragment shader
 */
export const bioluminescentVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Fragment shader for bioluminescent creatures
 * Creates glowing, pulsing effect based on creature attributes
 */
export const bioluminescentFragmentShader = `
  uniform float uTime;
  uniform float uEnergy;
  uniform float uStealth;
  uniform float uStrength;
  uniform float uAge;
  uniform float uLongevity;
  uniform vec3 uBaseColor;
  uniform vec3 uGlowColor;
  uniform float uPulseSpeed;
  uniform float uGlowIntensity;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    // Base color influenced by strength (saturation) and stealth (brightness)
    vec3 color = uBaseColor;

    // Energy affects overall brightness (30% - 100%)
    float energyBrightness = 0.3 + uEnergy * 0.7;

    // Stealth inversely affects visibility - stealthy creatures are dimmer
    // But they're still visible enough to see, just less vibrant
    float stealthDim = 1.0 - (uStealth * 0.5); // 0.5 - 1.0 range

    // Strength increases color saturation and warmth
    float strengthWarmth = uStrength * 0.3;
    color.r += strengthWarmth * 0.2;
    color.g += strengthWarmth * 0.1;

    // Age desaturation: older creatures lose color vibrancy
    float ageFactor = uAge * 0.5; // Max 50% desaturation at end of life
    float gray = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(color, vec3(gray), ageFactor);

    // Subtle pulse animation - faster when more energy
    float pulseRate = uPulseSpeed * (0.5 + uEnergy * 0.5);
    float pulse = sin(uTime * pulseRate) * 0.5 + 0.5;

    // Glow intensity based on attributes
    // Lower stealth = more glow (more visible)
    // Higher energy = more glow
    float glowAmount = uGlowIntensity * (1.0 - uStealth * 0.6) * (0.5 + uEnergy * 0.5);

    // Add subtle glow variation
    float glowPulse = 1.0 + pulse * 0.15 * glowAmount;

    // Create edge glow effect (Fresnel-like for 2D)
    float edgeDist = length(vUv - vec2(0.5)) * 2.0;
    float edgeGlow = smoothstep(0.3, 1.0, edgeDist) * glowAmount * 0.5;

    // Combine colors
    vec3 finalColor = color * energyBrightness * stealthDim * glowPulse;

    // Add glow color at edges
    finalColor += uGlowColor * edgeGlow * energyBrightness;

    // Slight boost for bloom (subtle, not overwhelming)
    finalColor *= 1.0 + glowAmount * 0.15;

    // Stealth affects transparency: stealthier creatures are more transparent
    float alpha = 1.0 - uStealth * 0.6; // Range 0.4-1.0

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

/**
 * Creates a bioluminescent shader material
 */
export function createBioluminescentMaterial(
  uniforms?: Partial<BioluminescentUniforms>
): THREE.ShaderMaterial {
  const defaultUniforms = createBioluminescentUniforms();

  // Merge provided uniforms with defaults
  const mergedUniforms = { ...defaultUniforms };
  if (uniforms) {
    Object.assign(mergedUniforms, uniforms);
  }

  return new THREE.ShaderMaterial({
    uniforms: mergedUniforms,
    vertexShader: bioluminescentVertexShader,
    fragmentShader: bioluminescentFragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
  });
}

/**
 * Update shader uniforms based on creature state
 */
export function updateBioluminescentUniforms(
  material: THREE.ShaderMaterial,
  time: number,
  energy: number,
  maxEnergy: number,
  stealth: number,
  strength: number,
  age: number = 0,
  longevity: number = 0.5
): void {
  material.uniforms.uTime.value = time;
  material.uniforms.uEnergy.value = energy / maxEnergy;
  material.uniforms.uStealth.value = stealth;
  material.uniforms.uStrength.value = strength;
  material.uniforms.uAge.value = age;
  material.uniforms.uLongevity.value = longevity;
}
