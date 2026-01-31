import * as THREE from 'three';

/**
 * Creates an immersive deep ocean background with:
 * - Vertical gradient from surface blue to abyssal black
 * - Subtle horizontal variation for depth perception
 * - Caustic light patterns from above (optional)
 */
export class OceanBackground {
  private mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  private time: number = 0;

  // Ocean color palette
  private static readonly COLORS = {
    surface: new THREE.Color(0x0a2a4a),      // Deep blue at top
    midDepth: new THREE.Color(0x051525),     // Darker blue-green
    abyss: new THREE.Color(0x010508),        // Near black at bottom
    causticLight: new THREE.Color(0x1a4a6a), // Light ray tint
  };

  constructor(width: number, height: number) {
    // Create a plane that covers the entire view
    const geometry = new THREE.PlaneGeometry(width * 2, height * 2);

    // Custom shader for animated ocean gradient
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSurfaceColor: { value: OceanBackground.COLORS.surface },
        uMidColor: { value: OceanBackground.COLORS.midDepth },
        uAbyssColor: { value: OceanBackground.COLORS.abyss },
        uCausticColor: { value: OceanBackground.COLORS.causticLight },
        uCausticIntensity: { value: 0.15 },
        uResolution: { value: new THREE.Vector2(width, height) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uSurfaceColor;
        uniform vec3 uMidColor;
        uniform vec3 uAbyssColor;
        uniform vec3 uCausticColor;
        uniform float uCausticIntensity;
        uniform vec2 uResolution;
        varying vec2 vUv;

        // Noise function for organic variation
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);

          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));

          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        // Caustic light pattern
        float caustics(vec2 uv, float time) {
          vec2 p = uv * 8.0;
          float c = 0.0;

          // Layer multiple noise octaves for caustic effect
          c += noise(p + time * 0.3) * 0.5;
          c += noise(p * 2.0 - time * 0.2) * 0.25;
          c += noise(p * 4.0 + time * 0.1) * 0.125;

          // Sharpen the caustics
          c = smoothstep(0.3, 0.7, c);

          // Fade caustics toward bottom (deeper = less light)
          c *= smoothstep(0.0, 0.6, vUv.y);

          return c;
        }

        void main() {
          // Base vertical gradient with curve for more dramatic transition
          float depth = 1.0 - vUv.y;
          float depthCurve = pow(depth, 1.5);

          // Add subtle horizontal variation
          float horizontalNoise = noise(vec2(vUv.x * 3.0, uTime * 0.05)) * 0.1;
          depthCurve += horizontalNoise * (1.0 - depth);

          // Three-point gradient: surface -> mid -> abyss
          vec3 color;
          if (depthCurve < 0.4) {
            color = mix(uSurfaceColor, uMidColor, depthCurve / 0.4);
          } else {
            color = mix(uMidColor, uAbyssColor, (depthCurve - 0.4) / 0.6);
          }

          // Add caustic light patterns
          float causticPattern = caustics(vUv, uTime);
          color += uCausticColor * causticPattern * uCausticIntensity;

          // Subtle vignette effect
          float vignette = 1.0 - length((vUv - 0.5) * 1.2);
          vignette = smoothstep(0.0, 1.0, vignette);
          color *= 0.85 + vignette * 0.15;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      depthWrite: false,
      depthTest: false,
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.z = -100; // Behind all entities
  }

  /**
   * Update the background animation
   * @param deltaTime Time since last frame in seconds
   */
  update(deltaTime: number): void {
    this.time += deltaTime;
    this.material.uniforms.uTime.value = this.time;
  }

  /**
   * Get the mesh to add to the scene
   */
  getMesh(): THREE.Mesh {
    return this.mesh;
  }

  /**
   * Update resolution on window resize
   */
  setResolution(width: number, height: number): void {
    this.material.uniforms.uResolution.value.set(width, height);
    this.mesh.geometry.dispose();
    this.mesh.geometry = new THREE.PlaneGeometry(width * 2, height * 2);
  }

  /**
   * Set caustic light intensity (0-1)
   */
  setCausticIntensity(intensity: number): void {
    this.material.uniforms.uCausticIntensity.value = Math.max(0, Math.min(1, intensity));
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
