import * as THREE from 'three';
import { EventBus } from '../events/EventBus';
import { OceanicColors } from '../ui/DashboardPanel';

/**
 * Effect types for different interactions
 */
interface Effect {
  mesh: THREE.Object3D;
  startTime: number;
  duration: number;
  update: (progress: number) => void;
}

/**
 * InteractionEffects - Visual feedback for ecosystem interactions
 *
 * Subscribes to EventBus events and creates particle/line effects
 * for predation, reproduction, learning, and death.
 */
export class InteractionEffects {
  private scene: THREE.Scene;
  private effects: Effect[] = [];
  private subscriptionIds: number[] = [];

  // Shared geometries and materials for pooling
  private ringGeometry: THREE.RingGeometry;
  private circleGeometry: THREE.CircleGeometry;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // Create shared geometries
    this.ringGeometry = new THREE.RingGeometry(1, 1.2, 32);
    this.circleGeometry = new THREE.CircleGeometry(1, 16);

    // Subscribe to events
    this.subscribeToEvents();
  }

  private subscribeToEvents(): void {
    const eventBus = EventBus.getInstance();

    // Predation success - prey consumed
    this.subscriptionIds.push(
      eventBus.subscribe('PREY_CONSUMED', (event) => {
        this.createPredationEffect(event.preyPosition.x, event.preyPosition.y);
      })
    );

    // Predation failure - prey escaped with a burst effect
    this.subscriptionIds.push(
      eventBus.subscribe('PREY_ESCAPED', (event) => {
        this.createEscapeEffect(event.preyPosition.x, event.preyPosition.y);
      })
    );

    // Reproduction - mitosis-like split effect at parent position
    this.subscriptionIds.push(
      eventBus.subscribe('REPRODUCTION', (event) => {
        const color = event.entityType === 'prey' ? OceanicColors.prey : OceanicColors.predator;
        this.createReproductionEffect(event.position.x, event.position.y, color);
      })
    );

    // Learning - neural pulse between learner and teacher
    this.subscriptionIds.push(
      eventBus.subscribe('LEARNING', (event) => {
        const color = event.entityType === 'prey' ? OceanicColors.prey : OceanicColors.predator;
        this.createLearningEffect(
          event.learnerPosition.x,
          event.learnerPosition.y,
          event.teacherPosition.x,
          event.teacherPosition.y,
          color
        );
      })
    );

    // Entity death
    this.subscriptionIds.push(
      eventBus.subscribe('ENTITY_DIED', (event) => {
        const color =
          event.entityType === 'prey'
            ? OceanicColors.prey
            : event.entityType === 'predator'
            ? OceanicColors.predator
            : OceanicColors.resource;
        this.createDeathEffect(event.position.x, event.position.y, color);
      })
    );

    // Resource bloom
    this.subscriptionIds.push(
      eventBus.subscribe('RESOURCE_BLOOM', () => {
        this.createBloomEffect();
      })
    );
  }

  /**
   * Create a predation effect (prey consumed)
   * Shows an expanding ring with particles
   */
  createPredationEffect(x: number, y: number): void {
    // Create expanding ring
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(OceanicColors.predator),
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });

    const ring = new THREE.Mesh(this.ringGeometry.clone(), ringMaterial);
    ring.position.set(x, y, 5);
    ring.scale.set(3, 3, 1);
    this.scene.add(ring);

    // Create burst particles
    const particleCount = 8;
    const particles: THREE.Mesh[] = [];
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(OceanicColors.prey),
      transparent: true,
      opacity: 0.9,
    });

    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(this.circleGeometry.clone(), particleMaterial.clone());
      const angle = (i / particleCount) * Math.PI * 2;
      particle.position.set(x, y, 5);
      particle.scale.set(1.5, 1.5, 1);
      particle.userData.angle = angle;
      particle.userData.startX = x;
      particle.userData.startY = y;
      this.scene.add(particle);
      particles.push(particle);
    }

    const effect: Effect = {
      mesh: ring,
      startTime: performance.now(),
      duration: 600,
      update: (progress: number) => {
        // Expand ring
        const scale = 3 + progress * 25;
        ring.scale.set(scale, scale, 1);
        ringMaterial.opacity = 0.8 * (1 - progress);

        // Expand particles outward
        for (const particle of particles) {
          const angle = particle.userData.angle;
          const dist = progress * 30;
          particle.position.x = particle.userData.startX + Math.cos(angle) * dist;
          particle.position.y = particle.userData.startY + Math.sin(angle) * dist;
          particle.scale.set(1.5 * (1 - progress * 0.5), 1.5 * (1 - progress * 0.5), 1);
          (particle.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - progress);
        }
      },
    };

    // Store particles for cleanup
    (effect as any).particles = particles;

    this.effects.push(effect);
  }

  /**
   * Create a death effect
   * Shows fading particles dispersing
   */
  createDeathEffect(x: number, y: number, color: string): void {
    const particleCount = 6;
    const particles: THREE.Mesh[] = [];

    for (let i = 0; i < particleCount; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.7,
      });

      const particle = new THREE.Mesh(this.circleGeometry.clone(), material);
      const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.5;
      particle.position.set(x, y, 4);
      particle.scale.set(2, 2, 1);
      particle.userData.angle = angle;
      particle.userData.startX = x;
      particle.userData.startY = y;
      particle.userData.speed = 0.5 + Math.random() * 0.5;
      this.scene.add(particle);
      particles.push(particle);
    }

    const effect: Effect = {
      mesh: particles[0], // Reference first particle
      startTime: performance.now(),
      duration: 800,
      update: (progress: number) => {
        for (const particle of particles) {
          const angle = particle.userData.angle;
          const speed = particle.userData.speed;
          const dist = progress * 20 * speed;

          // Float upward and outward
          particle.position.x = particle.userData.startX + Math.cos(angle) * dist;
          particle.position.y = particle.userData.startY + Math.sin(angle) * dist + progress * 10;

          // Fade and shrink
          const scale = 2 * (1 - progress * 0.7);
          particle.scale.set(scale, scale, 1);
          (particle.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - progress);
        }
      },
    };

    (effect as any).particles = particles;
    this.effects.push(effect);
  }

  /**
   * Create a reproduction effect
   * Shows a pulsing glow that splits into two
   */
  createReproductionEffect(x: number, y: number, color: string): void {
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.6,
    });

    const glow = new THREE.Mesh(this.circleGeometry.clone(), material);
    glow.position.set(x, y, 3);
    glow.scale.set(5, 5, 1);
    this.scene.add(glow);

    // Second glow for split effect
    const glow2Material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0,
    });
    const glow2 = new THREE.Mesh(this.circleGeometry.clone(), glow2Material);
    glow2.position.set(x, y, 3);
    glow2.scale.set(5, 5, 1);
    this.scene.add(glow2);

    const effect: Effect = {
      mesh: glow,
      startTime: performance.now(),
      duration: 700,
      update: (progress: number) => {
        if (progress < 0.5) {
          // Pulse phase
          const pulse = 1 + Math.sin(progress * Math.PI * 4) * 0.3;
          const scale = 5 * pulse;
          glow.scale.set(scale, scale, 1);
          material.opacity = 0.6 + Math.sin(progress * Math.PI * 4) * 0.2;
        } else {
          // Split phase
          const splitProgress = (progress - 0.5) * 2;
          const offset = splitProgress * 8;

          glow.position.x = x - offset;
          glow.scale.set(5 * (1 - splitProgress * 0.3), 5 * (1 - splitProgress * 0.3), 1);
          material.opacity = 0.6 * (1 - splitProgress);

          glow2.position.x = x + offset;
          glow2.scale.set(5 * (1 - splitProgress * 0.3), 5 * (1 - splitProgress * 0.3), 1);
          glow2Material.opacity = 0.6 * (1 - splitProgress);
        }
      },
    };

    (effect as any).glow2 = glow2;
    this.effects.push(effect);
  }

  /**
   * Create a learning effect
   * Shows a pulse traveling between two points
   */
  createLearningEffect(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string
  ): void {
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.8,
    });

    const pulse = new THREE.Mesh(this.circleGeometry.clone(), material);
    pulse.position.set(fromX, fromY, 6);
    pulse.scale.set(3, 3, 1);
    this.scene.add(pulse);

    const effect: Effect = {
      mesh: pulse,
      startTime: performance.now(),
      duration: 400,
      update: (progress: number) => {
        // Move along path
        pulse.position.x = fromX + (toX - fromX) * progress;
        pulse.position.y = fromY + (toY - fromY) * progress;

        // Pulse size
        const pulseScale = 3 + Math.sin(progress * Math.PI * 2) * 1;
        pulse.scale.set(pulseScale, pulseScale, 1);

        // Fade at end
        material.opacity = 0.8 * (1 - progress * 0.5);
      },
    };

    this.effects.push(effect);
  }

  /**
   * Create a resource bloom effect
   * Shows expanding waves across the screen
   */
  createBloomEffect(): void {
    const waveCount = 3;

    for (let i = 0; i < waveCount; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(OceanicColors.resource),
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      });

      const ring = new THREE.Mesh(new THREE.RingGeometry(1, 3, 64), material);
      ring.position.set(0, 0, 2);
      ring.scale.set(10, 10, 1);
      this.scene.add(ring);

      const delay = i * 200;

      const effect: Effect = {
        mesh: ring,
        startTime: performance.now() + delay,
        duration: 2000,
        update: (progress: number) => {
          const scale = 10 + progress * 300;
          ring.scale.set(scale, scale, 1);
          material.opacity = 0.3 * (1 - progress);
        },
      };

      this.effects.push(effect);
    }
  }

  /**
   * Create an escape effect (prey successfully evaded)
   */
  createEscapeEffect(x: number, y: number): void {
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(OceanicColors.prey),
      transparent: true,
      opacity: 0.6,
    });

    const burst = new THREE.Mesh(this.circleGeometry.clone(), material);
    burst.position.set(x, y, 5);
    burst.scale.set(4, 4, 1);
    this.scene.add(burst);

    const effect: Effect = {
      mesh: burst,
      startTime: performance.now(),
      duration: 300,
      update: (progress: number) => {
        const scale = 4 + progress * 15;
        burst.scale.set(scale, scale, 1);
        material.opacity = 0.6 * (1 - progress);
      },
    };

    this.effects.push(effect);
  }

  /**
   * Update all active effects
   */
  update(): void {
    const currentTime = performance.now();
    const toRemove: number[] = [];

    for (let i = 0; i < this.effects.length; i++) {
      const effect = this.effects[i];
      const elapsed = currentTime - effect.startTime;

      if (elapsed < 0) {
        // Effect hasn't started yet (delayed)
        continue;
      }

      const progress = Math.min(elapsed / effect.duration, 1);

      if (progress >= 1) {
        // Effect complete, mark for removal
        toRemove.push(i);

        // Clean up mesh
        this.scene.remove(effect.mesh);
        if ((effect.mesh as THREE.Mesh).geometry) {
          (effect.mesh as THREE.Mesh).geometry.dispose();
        }
        if ((effect.mesh as THREE.Mesh).material) {
          const mat = (effect.mesh as THREE.Mesh).material;
          if (Array.isArray(mat)) {
            mat.forEach((m) => m.dispose());
          } else {
            mat.dispose();
          }
        }

        // Clean up additional meshes stored on effect
        const particles = (effect as any).particles as THREE.Mesh[] | undefined;
        if (particles) {
          for (const p of particles) {
            this.scene.remove(p);
            p.geometry.dispose();
            (p.material as THREE.Material).dispose();
          }
        }

        const glow2 = (effect as any).glow2 as THREE.Mesh | undefined;
        if (glow2) {
          this.scene.remove(glow2);
          glow2.geometry.dispose();
          (glow2.material as THREE.Material).dispose();
        }
      } else {
        // Update effect
        effect.update(progress);
      }
    }

    // Remove completed effects (in reverse order to maintain indices)
    for (let i = toRemove.length - 1; i >= 0; i--) {
      this.effects.splice(toRemove[i], 1);
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    // Unsubscribe from events
    const eventBus = EventBus.getInstance();
    for (const id of this.subscriptionIds) {
      eventBus.unsubscribe(id);
    }

    // Clean up all active effects
    for (const effect of this.effects) {
      this.scene.remove(effect.mesh);
      if ((effect.mesh as THREE.Mesh).geometry) {
        (effect.mesh as THREE.Mesh).geometry.dispose();
      }
      if ((effect.mesh as THREE.Mesh).material) {
        const mat = (effect.mesh as THREE.Mesh).material;
        if (Array.isArray(mat)) {
          mat.forEach((m) => m.dispose());
        } else {
          mat.dispose();
        }
      }
    }

    this.effects = [];

    // Clean up shared geometries
    this.ringGeometry.dispose();
    this.circleGeometry.dispose();
  }
}
