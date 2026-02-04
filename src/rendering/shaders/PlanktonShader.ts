import * as THREE from 'three';

/**
 * Shader configuration for bioluminescent plankton resources.
 * Creates soft, glowing organic particles.
 */
export interface PlanktonUniforms {
  uTime: { value: number };
  uEnergy: { value: number };        // 0-1, affects brightness and size
  uBaseColor: { value: THREE.Color };
  uGlowColor: { value: THREE.Color };
  uPulseSpeed: { value: number };    // Pulse animation speed
  uGlowIntensity: { value: number }; // Base glow intensity
}

/**
 * Creates uniforms for plankton shader with default values
 */
export function createPlanktonUniforms(
  baseColor: THREE.Color = new THREE.Color(0x22aa66),
  glowColor: THREE.Color = new THREE.Color(0x44ffaa)
): PlanktonUniforms {
  return {
    uTime: { value: 0 },
    uEnergy: { value: 1.0 },
    uBaseColor: { value: baseColor },
    uGlowColor: { value: glowColor },
    uPulseSpeed: { value: 1.5 },
    uGlowIntensity: { value: 0.8 },
  };
}

/**
 * Vertex shader for plankton
 */
export const planktonVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Fragment shader for plankton
 * Creates soft, organic glowing particles
 */
export const planktonFragmentShader = `
  uniform float uTime;
  uniform float uEnergy;
  uniform vec3 uBaseColor;
  uniform vec3 uGlowColor;
  uniform float uPulseSpeed;
  uniform float uGlowIntensity;

  varying vec2 vUv;

  void main() {
    // Create circular, soft-edged particle
    vec2 center = vUv - vec2(0.5);
    float dist = length(center);

    // Soft circular falloff
    float alpha = smoothstep(0.5, 0.0, dist);

    // Energy affects brightness (40% - 100%)
    float energyBrightness = 0.5 + uEnergy * 0.6;

    // Gentle pulse animation
    float pulse = sin(uTime * uPulseSpeed) * 0.1 + 0.9;

    // Base color with energy-based brightness
    vec3 color = uBaseColor * energyBrightness * pulse;

    // Add glow at edges for bloom effect
    float glowRing = smoothstep(0.2, 0.4, dist) * smoothstep(0.5, 0.35, dist);
    color += uGlowColor * glowRing * uGlowIntensity * energyBrightness * 1.1;

    // Inner bright core
    float core = smoothstep(0.15, 0.0, dist);
    color += uGlowColor * core * 0.6 * energyBrightness;

    // Slight boost for bloom (subtle)
    color *= 1.0 + uGlowIntensity * 0.1;

    // Discard pixels outside the circle
    if (alpha < 0.01) discard;

    gl_FragColor = vec4(color, alpha);
  }
`;

/**
 * Creates a plankton shader material
 */
export function createPlanktonMaterial(
  uniforms?: Partial<PlanktonUniforms>
): THREE.ShaderMaterial {
  const defaultUniforms = createPlanktonUniforms();

  // Merge provided uniforms with defaults
  const mergedUniforms = { ...defaultUniforms };
  if (uniforms) {
    Object.assign(mergedUniforms, uniforms);
  }

  return new THREE.ShaderMaterial({
    uniforms: mergedUniforms,
    vertexShader: planktonVertexShader,
    fragmentShader: planktonFragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}

/**
 * Update shader uniforms based on resource state
 */
export function updatePlanktonUniforms(
  material: THREE.ShaderMaterial,
  time: number,
  energy: number,
  maxEnergy: number
): void {
  material.uniforms.uTime.value = time;
  material.uniforms.uEnergy.value = energy / maxEnergy;
}
