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
    surface: new THREE.Color(0x0c3055),      // Deep blue at top
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

        float caustics(vec2 uv, float time) {
          float c = 0.0;
          c += sin(uv.x * 6.0 + time * 0.4 + sin(uv.y * 4.0 + time * 0.3)) * 0.3;
          c += sin(uv.y * 5.0 - time * 0.35 + sin(uv.x * 3.0 - time * 0.2)) * 0.25;
          c += sin((uv.x + uv.y) * 8.0 + time * 0.25) * 0.15;
          c += sin((uv.x - uv.y) * 7.0 - time * 0.3) * 0.1;
          c = c * 0.5 + 0.5;
          c = c * c;
          c *= smoothstep(0.0, 0.4, uv.y);
          c *= smoothstep(1.0, 0.85, uv.y);
          return c;
        }

        void main() {
          float depth = 1.0 - vUv.y;
          float depthCurve = pow(depth, 1.3);

          float midBlend = smoothstep(0.0, 0.5, depthCurve);
          float abyssBlend = smoothstep(0.4, 1.0, depthCurve);
          vec3 color = mix(
            mix(uSurfaceColor, uMidColor, midBlend),
            uAbyssColor,
            abyssBlend
          );

          float causticPattern = caustics(vUv, uTime);
          color += uCausticColor * causticPattern * uCausticIntensity;

          float fogAmount = smoothstep(0.5, 1.0, depthCurve) * 0.15;
          vec3 fogColor = vec3(0.02, 0.05, 0.1);
          color = mix(color, fogColor, fogAmount);

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
