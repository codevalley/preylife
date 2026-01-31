import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

/**
 * Post-processing pipeline for underwater atmosphere.
 * Includes:
 * - Bloom for bioluminescent glow effects
 * - Color correction for underwater tint
 * - Subtle vignette
 */
export class PostProcessing {
  private composer: EffectComposer;
  private bloomPass: UnrealBloomPass;
  private colorCorrectionPass: ShaderPass;

  // Bloom configuration
  private readonly bloomConfig = {
    strength: 0.35,     // Bloom intensity (subtle glow, not overwhelming)
    radius: 0.4,        // Bloom spread
    threshold: 0.6,     // Brightness threshold for bloom (higher = less bloom)
  };

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    width: number,
    height: number
  ) {
    // Create effect composer
    this.composer = new EffectComposer(renderer);

    // Render pass - renders the scene normally
    const renderPass = new RenderPass(scene, camera);
    this.composer.addPass(renderPass);

    // Bloom pass for glowing effects
    const resolution = new THREE.Vector2(width, height);
    this.bloomPass = new UnrealBloomPass(
      resolution,
      this.bloomConfig.strength,
      this.bloomConfig.radius,
      this.bloomConfig.threshold
    );
    this.composer.addPass(this.bloomPass);

    // Custom underwater color correction
    this.colorCorrectionPass = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        uUnderwaterTint: { value: new THREE.Color(0x88ccff) },
        uTintStrength: { value: 0.08 },
        uVignetteStrength: { value: 0.3 },
        uVignetteRadius: { value: 0.8 },
        uContrast: { value: 1.05 },
        uBrightness: { value: 0.02 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec3 uUnderwaterTint;
        uniform float uTintStrength;
        uniform float uVignetteStrength;
        uniform float uVignetteRadius;
        uniform float uContrast;
        uniform float uBrightness;

        varying vec2 vUv;

        void main() {
          vec4 color = texture2D(tDiffuse, vUv);

          // Apply subtle underwater tint
          color.rgb = mix(color.rgb, color.rgb * uUnderwaterTint, uTintStrength);

          // Contrast and brightness adjustment
          color.rgb = (color.rgb - 0.5) * uContrast + 0.5;
          color.rgb += uBrightness;

          // Vignette effect
          vec2 center = vUv - vec2(0.5);
          float dist = length(center);
          float vignette = smoothstep(uVignetteRadius, uVignetteRadius - uVignetteStrength, dist);
          color.rgb *= mix(0.7, 1.0, vignette);

          gl_FragColor = color;
        }
      `,
    });
    this.composer.addPass(this.colorCorrectionPass);
  }

  /**
   * Render the scene with post-processing
   */
  render(): void {
    this.composer.render();
  }

  /**
   * Update resolution on window resize
   */
  setSize(width: number, height: number): void {
    this.composer.setSize(width, height);
    this.bloomPass.resolution.set(width, height);
  }

  /**
   * Set bloom intensity (0-2)
   */
  setBloomStrength(strength: number): void {
    this.bloomPass.strength = Math.max(0, Math.min(2, strength));
  }

  /**
   * Set bloom threshold (0-1) - lower = more things bloom
   */
  setBloomThreshold(threshold: number): void {
    this.bloomPass.threshold = Math.max(0, Math.min(1, threshold));
  }

  /**
   * Set bloom radius/spread (0-2)
   */
  setBloomRadius(radius: number): void {
    this.bloomPass.radius = Math.max(0, Math.min(2, radius));
  }

  /**
   * Set underwater tint color
   */
  setUnderwaterTint(color: THREE.Color, strength: number = 0.08): void {
    this.colorCorrectionPass.uniforms.uUnderwaterTint.value = color;
    this.colorCorrectionPass.uniforms.uTintStrength.value = strength;
  }

  /**
   * Set vignette parameters
   */
  setVignette(strength: number, radius: number): void {
    this.colorCorrectionPass.uniforms.uVignetteStrength.value = strength;
    this.colorCorrectionPass.uniforms.uVignetteRadius.value = radius;
  }

  /**
   * Enable/disable bloom
   */
  setBloomEnabled(enabled: boolean): void {
    this.bloomPass.enabled = enabled;
  }

  /**
   * Get the composer for advanced usage
   */
  getComposer(): EffectComposer {
    return this.composer;
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.composer.dispose();
  }
}
