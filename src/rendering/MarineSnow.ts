import * as THREE from 'three';

interface Particle {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  drift: number;
  alpha: number;
  phase: number; // For subtle pulsing
}

/**
 * Marine snow particle system - creates the atmospheric effect
 * of organic particles floating in deep ocean water.
 *
 * Particles drift slowly downward with gentle horizontal movement,
 * creating depth and ambiance without distracting from entities.
 */
export class MarineSnow {
  private particles: Particle[] = [];
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private points: THREE.Points;
  private time: number = 0;

  private width: number;
  private height: number;

  // Configurable parameters
  private readonly particleCount: number;
  private readonly baseSpeed: number = 8; // Slow drift
  private readonly driftRange: number = 15; // Horizontal movement range
  private readonly sizeRange: { min: number; max: number } = { min: 0.5, max: 2.5 };

  constructor(width: number, height: number, particleCount: number = 200) {
    this.width = width;
    this.height = height;
    this.particleCount = particleCount;

    // Initialize particles
    this.initParticles();

    // Create geometry with positions, sizes, and alphas
    this.geometry = new THREE.BufferGeometry();
    this.updateGeometry();

    // Custom shader material for soft glowing particles
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x8ec8e8) }, // Soft blue-white
        uGlowColor: { value: new THREE.Color(0x4a90a4) }, // Subtle cyan glow
      },
      vertexShader: `
        attribute float aSize;
        attribute float aAlpha;
        attribute float aPhase;

        varying float vAlpha;
        varying float vPhase;

        uniform float uTime;

        void main() {
          vAlpha = aAlpha;
          vPhase = aPhase;

          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

          // Subtle size pulsing
          float pulse = 1.0 + sin(uTime * 2.0 + aPhase) * 0.15;

          gl_PointSize = aSize * pulse * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform vec3 uGlowColor;
        uniform float uTime;

        varying float vAlpha;
        varying float vPhase;

        void main() {
          // Circular particle with soft edges
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);

          if (dist > 0.5) discard;

          // Soft falloff from center
          float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;

          // Subtle color variation based on phase
          float colorMix = sin(vPhase + uTime * 0.5) * 0.5 + 0.5;
          vec3 color = mix(uColor, uGlowColor, colorMix * 0.3);

          // Inner glow
          float glow = smoothstep(0.3, 0.0, dist);
          color += uGlowColor * glow * 0.3;

          gl_FragColor = vec4(color, alpha * 0.6);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.position.z = -50; // Between background and entities
  }

  private initParticles(): void {
    this.particles = [];

    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push(this.createParticle(true));
    }
  }

  private createParticle(randomY: boolean = false): Particle {
    // Distribute across the view with some margin
    const margin = 100;

    return {
      x: (Math.random() - 0.5) * (this.width + margin * 2),
      y: randomY
        ? (Math.random() - 0.5) * (this.height + margin * 2)
        : this.height / 2 + margin, // Start above view
      z: Math.random() * 50 - 75, // Depth variation (behind entities)
      size: this.sizeRange.min + Math.random() * (this.sizeRange.max - this.sizeRange.min),
      speed: this.baseSpeed * (0.5 + Math.random() * 0.5),
      drift: (Math.random() - 0.5) * this.driftRange,
      alpha: 0.3 + Math.random() * 0.4, // Varied transparency
      phase: Math.random() * Math.PI * 2, // Random phase for pulsing
    };
  }

  private updateGeometry(): void {
    const positions = new Float32Array(this.particleCount * 3);
    const sizes = new Float32Array(this.particleCount);
    const alphas = new Float32Array(this.particleCount);
    const phases = new Float32Array(this.particleCount);

    for (let i = 0; i < this.particleCount; i++) {
      const p = this.particles[i];
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
      sizes[i] = p.size;
      alphas[i] = p.alpha;
      phases[i] = p.phase;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    this.geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
    this.geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  }

  /**
   * Update particle positions
   * @param deltaTime Time since last frame in seconds
   */
  update(deltaTime: number): void {
    this.time += deltaTime;
    this.material.uniforms.uTime.value = this.time;

    const positions = this.geometry.attributes.position.array as Float32Array;
    const bottomBound = -this.height / 2 - 50;
    const margin = 100;

    for (let i = 0; i < this.particleCount; i++) {
      const p = this.particles[i];

      // Gentle downward drift
      p.y -= p.speed * deltaTime;

      // Subtle horizontal drift with sine wave
      p.x += Math.sin(this.time * 0.5 + p.phase) * p.drift * deltaTime * 0.1;

      // Wrap around when particle goes below view
      if (p.y < bottomBound) {
        p.y = this.height / 2 + margin;
        p.x = (Math.random() - 0.5) * (this.width + margin * 2);
      }

      // Wrap horizontally
      if (p.x > this.width / 2 + margin) {
        p.x = -this.width / 2 - margin;
      } else if (p.x < -this.width / 2 - margin) {
        p.x = this.width / 2 + margin;
      }

      // Update buffer
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
    }

    this.geometry.attributes.position.needsUpdate = true;
  }

  /**
   * Get the points object to add to scene
   */
  getPoints(): THREE.Points {
    return this.points;
  }

  /**
   * Update bounds on window resize
   */
  setBounds(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  /**
   * Set particle color
   */
  setColor(color: THREE.Color): void {
    this.material.uniforms.uColor.value = color;
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
