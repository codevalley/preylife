import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Creature, GeneticAttributes } from './Creature';
import { EntityType } from './Entity';
import { Resource } from './Resource';
import { Predator } from './Predator';
import { SimulationConfig } from '../config';
import { applyRepulsion } from '../utils/behavior';
import {
  createBioluminescentMaterial,
  updateBioluminescentUniforms,
} from '../rendering/shaders/BioluminescentShader';

export class Prey extends Creature {
  static readonly DEFAULT_MAX_ENERGY: number = SimulationConfig.prey.maxEnergy;
  static readonly DEFAULT_ATTRIBUTES: GeneticAttributes = {
    strength: SimulationConfig.prey.defaultAttributes.strength,
    stealth: SimulationConfig.prey.defaultAttributes.stealth,
    learnability: SimulationConfig.prey.defaultAttributes.learnability,
    longevity: SimulationConfig.prey.defaultAttributes.longevity
  };

  // Shader time for animation
  private static globalTime: number = 0;

  // Flee exhaustion: continuous fleeing accumulates fatigue
  private consecutiveFleeFrames: number = 0;

  // Resource target persistence — avoid switching between equidistant resources
  private lockedResource: Resource | null = null;

  // Schooling: each prey belongs to one of 3 "current" groups.
  // When idle, prey follow their school's slowly-rotating direction instead of
  // sitting still (which lets repulsion create spinning vortices).
  private readonly schoolId: number = Math.floor(Math.random() * 3);

  constructor(
    x: number,
    y: number,
    energy: number = Prey.DEFAULT_MAX_ENERGY,
    attributes: GeneticAttributes = {...Prey.DEFAULT_ATTRIBUTES}
  ) {
    super(EntityType.PREY, x, y, energy, attributes);
  }

  /**
   * Create organic fish geometry for bioluminescent prey.
   * Longevity drives body elongation, strength drives fin prominence.
   */
  private createFishGeometry(): THREE.BufferGeometry {
    const shape = new THREE.Shape();
    const baseSize = 6;

    const { longevity, strength } = this.attributes;

    // Longevity drives body proportions: higher longevity = longer, narrower body
    const bodyLength = baseSize * (0.8 + longevity * 0.6);
    const bodyWidth = baseSize * 0.6 / (0.8 + longevity * 0.4);

    // Strength drives tail fin size
    const tailLength = bodyLength * (0.2 + strength * 0.25);

    // Fish body - organic curved shape starting at nose
    shape.moveTo(bodyLength * 0.5, 0);

    // Upper body curve (nose to tail)
    shape.bezierCurveTo(
      bodyLength * 0.3, bodyWidth * 0.8,
      -bodyLength * 0.1, bodyWidth * 0.6,
      -bodyLength * 0.3, bodyWidth * 0.2
    );

    // Tail fin (scaled by strength)
    shape.lineTo(-bodyLength * 0.3 - tailLength * 0.3, bodyWidth * 0.5);
    shape.lineTo(-bodyLength * 0.3 - tailLength, 0);
    shape.lineTo(-bodyLength * 0.3 - tailLength * 0.3, -bodyWidth * 0.5);
    shape.lineTo(-bodyLength * 0.3, -bodyWidth * 0.2);

    // Lower body curve (tail back to nose)
    shape.bezierCurveTo(
      -bodyLength * 0.1, -bodyWidth * 0.6,
      bodyLength * 0.3, -bodyWidth * 0.8,
      bodyLength * 0.5, 0
    );

    const bodyGeometry = new THREE.ShapeGeometry(shape);

    // Dorsal fin for strong prey (strength > 0.3)
    if (strength > 0.3) {
      const dorsalHeight = bodyWidth * strength * 0.6;
      const dorsalShape = new THREE.Shape();
      dorsalShape.moveTo(bodyLength * 0.1, bodyWidth * 0.45);
      dorsalShape.lineTo(0, bodyWidth * 0.45 + dorsalHeight);
      dorsalShape.lineTo(-bodyLength * 0.15, bodyWidth * 0.35);
      dorsalShape.closePath();

      const dorsalGeometry = new THREE.ShapeGeometry(dorsalShape);
      const merged = BufferGeometryUtils.mergeGeometries([bodyGeometry, dorsalGeometry]);
      bodyGeometry.dispose();
      dorsalGeometry.dispose();
      if (merged) {
        return merged;
      }
    }

    return bodyGeometry;
  }

  createMesh(): THREE.Mesh {
    // Create organic fish geometry
    const geometry = this.createFishGeometry();

    // Calculate colors based on attributes
    // Base color: cyan-teal spectrum
    // Stealth affects how blue (stealthier = deeper blue)
    // Strength affects how green/cyan (stronger = more vibrant cyan)
    const baseColor = new THREE.Color();
    const glowColor = new THREE.Color();

    // Blue-dominant palette — clearly distinct from green plankton
    // Stealth shifts toward deeper blue, strength adds slight cyan
    const stealthBlue = 0.7 + this.attributes.stealth * 0.3;
    const strengthCyan = this.attributes.strength * 0.35;

    baseColor.setRGB(
      0.08,                          // Slight red lift for visibility
      0.25 + strengthCyan,            // Brighter green for cyan presence
      stealthBlue                     // Strong blue
    );

    // Glow color is brighter blue-white
    glowColor.setRGB(
      0.2,
      0.5 + strengthCyan,
      1.0
    );

    // Create bioluminescent shader material
    const material = createBioluminescentMaterial({
      uBaseColor: { value: baseColor },
      uGlowColor: { value: glowColor },
      uEnergy: { value: this.energy / this.maxEnergy },
      uStealth: { value: this.attributes.stealth },
      uStrength: { value: this.attributes.strength },
      uAge: { value: 0 },
      uLongevity: { value: this.attributes.longevity },
      uGlowIntensity: { value: 0.9 },
      uPulseSpeed: { value: 2.0 + this.attributes.learnability },
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.updateMeshPosition();
    return this.mesh;
  }

  updateMeshPosition(): void {
    super.updateMeshPosition();

    if (this.mesh) {
      // Update global time for shader animation
      Prey.globalTime += 0.016; // Approximately 60fps

      // Update shader uniforms
      const material = this.mesh.material as THREE.ShaderMaterial;
      if (material.uniforms) {
        // Calculate normalized age ratio (lifespan scales with longevity)
        const maxLifespan = 60 + (this.attributes.longevity * 40);
        const ageRatio = Math.min(1, this.age / maxLifespan);

        updateBioluminescentUniforms(
          material,
          Prey.globalTime,
          this.energy,
          this.maxEnergy,
          this.attributes.stealth,
          this.attributes.strength,
          ageRatio,
          this.attributes.longevity
        );
      }

      // Rotate fish to face movement direction
      if (this.velocity.lengthSq() > 0.0001) {
        const angle = Math.atan2(this.velocity.y, this.velocity.x);
        this.mesh.rotation.z = angle;
      }
    }
  }

  // Method to consume a resource
  consumeResource(resource: Resource): void {
    // Prey get a 20% bonus when consuming resources to further help them survive
    const energyGain = resource.energy * 1.2;
    this.energy = Math.min(this.maxEnergy, this.energy + energyGain);

    // Track food consumption
    this.onFoodConsumption();

    // Clear any locked target so we don't keep steering toward a removed resource.
    this.lockedResource = null;

    // Update visual appearance to reflect new energy level
    this.updateMeshPosition();
  }

  // Method to check for nearby resources
  detectResource(resources: Resource[], detectionRange: number): Resource | null {
    // Increase detection range based on stealth attribute
    // Higher stealth means better at finding resources
    const adjustedRange = detectionRange * (1 + this.attributes.stealth * 0.5);

    // Find closest resource within range
    let closestResource: Resource | null = null;
    let closestDistance = adjustedRange;

    for (const resource of resources) {
      const distance = this.position.distanceTo(resource.position);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestResource = resource;
      }
    }

    return closestResource;
  }

  /**
   * Resource target persistence. Stick with a locked resource until it's consumed
   * or out of range, preventing oscillation between equidistant resources.
   */
  private selectResource(resources: Resource[], detectionRange: number): Resource | null {
    if (this.lockedResource) {
      const gone = this.lockedResource.isDead;
      const dist = this.position.distanceTo(this.lockedResource.position);
      if (gone || dist > detectionRange * 1.2) {
        this.lockedResource = null;
      } else {
        return this.lockedResource;
      }
    }
    const target = this.detectResource(resources, detectionRange);
    if (target) this.lockedResource = target;
    return target;
  }

  // Method to detect nearby predators
  detectPredator(predators: Predator[]): Predator | null {
    // Get predator detection range from config
    const baseDetectionRange = SimulationConfig.creatures.interactionRanges.preyPredatorDetectionRange;

    // Increase detection range based on stealth attribute (higher stealth = better at detecting predators)
    const detectionMultiplier = SimulationConfig.prey.predatorDetectionMultiplier || 1.2;
    const adjustedRange = baseDetectionRange * (1 + this.attributes.stealth * detectionMultiplier);

    // Find closest predator within range
    let closestPredator: Predator | null = null;
    let closestDistance = adjustedRange;

    for (const predator of predators) {
      const distance = this.position.distanceTo(predator.position);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPredator = predator;
      }
    }

    return closestPredator;
  }

  // Override update to include resource detection, predator avoidance, and movement
  update(deltaTime: number, resources: Resource[] = [], predators: Predator[] = [], nearbyPrey: Prey[] = []): void {

    // Check for nearby predators first - survival takes priority over feeding
    const nearbyPredator = this.detectPredator(predators);

    // Randomly change direction occasionally - mild wander when safe
    const energyRatio = this.energy / this.maxEnergy;
    const directionChangeChance = 0.005 + (energyRatio * 0.01); // 0.5-1.5% per frame

    if (Math.random() < directionChangeChance && !nearbyPredator && !this.lockedResource) {
      const angle = Math.random() * Math.PI * 2;
      this.velocity.set(Math.cos(angle), Math.sin(angle)).normalize().multiplyScalar(this.speed);
    }

    // Apply repulsion BEFORE foraging so that foraging's .copy() fully
    // overwrites it when a resource is locked. Suppress entirely while
    // foraging to prevent turn-rate-lerp oscillation (spinning).
    if (!nearbyPredator && !this.lockedResource && nearbyPrey.length > 0) {
      applyRepulsion(this, nearbyPrey, 'prey');
    }

    // If a predator is nearby, flee from it
    if (nearbyPredator) {
      // Drop resource target — survival overrides foraging
      this.lockedResource = null;

      // Accumulate flee exhaustion
      this.consecutiveFleeFrames++;

      // Direction away from predator
      const fleeDirection = this.position.clone().sub(nearbyPredator.position).normalize();

      // Get avoidance multiplier from config (default to 1.5 if not set)
      const avoidanceMultiplier = SimulationConfig.prey.predatorAvoidanceMultiplier || 1.2; // Reduced from 1.5 to 1.2

      // Calculate flee bonus based on prey attributes
      // High stealth prey are better at evading
      // High strength prey are better at running fast

      // Calculate specialized fleeing bonus
      let specializedFleeBonus = 0;

      // Stealth-based evasion: enhanced directional changes and unpredictability
      if (this.attributes.stealth > 0.6) {
        // Add some randomness to the flee direction for stealthy prey
        // This simulates erratic movement patterns that make them harder to catch
        const randomAngle = (Math.random() - 0.5) * Math.PI * this.attributes.stealth;
        const originalX = fleeDirection.x;
        const originalY = fleeDirection.y;

        // Apply rotation matrix
        fleeDirection.x = Math.cos(randomAngle) * originalX - Math.sin(randomAngle) * originalY;
        fleeDirection.y = Math.sin(randomAngle) * originalX + Math.cos(randomAngle) * originalY;

        // Ensure we have a valid direction
        if (fleeDirection.lengthSq() > 0.0001) {
          fleeDirection.normalize();
        }

        // Stealth specialists get additional flee bonus
        if (this.attributes.stealth > 0.7) {
          specializedFleeBonus = (this.attributes.stealth - 0.7) * 0.5;
        }
      }

      // Strength-based flight: faster sustained running
      let strengthFleeBonus = this.attributes.strength * 0.5;

      // Strength specialists get additional flee bonus
      if (this.attributes.strength > 0.7) {
        strengthFleeBonus += (this.attributes.strength - 0.7) * 0.8;
      }

      // Determine which attribute provides better fleeing advantage
      const fleeBonus = Math.max(this.attributes.stealth * 0.5, strengthFleeBonus);

      // Boost speed based on best attribute and avoidance multiplier
      let fleeSpeed = this.speed * (1 + fleeBonus + specializedFleeBonus) * avoidanceMultiplier;

      // Apply flee exhaustion penalty: after threshold frames of continuous fleeing, speed degrades
      const exhaustion = SimulationConfig.prey.fleeExhaustion;
      if (this.consecutiveFleeFrames > exhaustion.threshold) {
        const penalty = Math.min(
          (this.consecutiveFleeFrames - exhaustion.threshold) * exhaustion.rate,
          exhaustion.maxPenalty
        );
        fleeSpeed *= (1 - penalty);
      }

      // Only apply the flee direction if it's valid
      if (fleeDirection.lengthSq() > 0.0001) {
        // Set velocity to flee
        this.velocity.copy(fleeDirection).multiplyScalar(fleeSpeed);
      } else {
        // In the rare case of an invalid flee direction, just move in a random direction
        const angle = Math.random() * Math.PI * 2;
        this.velocity.set(Math.cos(angle), Math.sin(angle)).normalize().multiplyScalar(fleeSpeed);
      }

      // Fleeing consumes more energy - high strength prey use more energy when fleeing
      // This creates a trade-off: stronger prey flee faster but deplete energy quicker
      const fleeingEnergyCost = 2 * (1 + this.attributes.strength * 0.5) * deltaTime;
      this.energy = Math.max(0, this.energy - fleeingEnergyCost);
    }
    // If no predator nearby, focus on foraging based on hunger level
    else {
      // Recover from flee exhaustion (recovers 2x faster than it accumulates)
      this.consecutiveFleeFrames = Math.max(0, this.consecutiveFleeFrames - 2);
      const hungerLevel = 1 - energyRatio;

      // If prey is fairly full (less than 30% hunger), it's less focused on finding food
      if (hungerLevel < 0.3) {
        // Occasionally still check for extremely close resources (opportunistic feeding)
        const nearbyResource = (Math.random() < 0.2) ? this.selectResource(resources, 30) : null;
        if (nearbyResource) {
          const direction = nearbyResource.position.clone().sub(this.position).normalize();
          this.velocity.copy(direction).multiplyScalar(this.speed * 0.8);
        } else {
          // Schooling: follow a slowly rotating ocean current instead of sitting idle.
          // 3 schools offset by 120°, full rotation every ~90 seconds.
          // This gives idle prey a strong directional signal that prevents
          // repulsion-induced spinning while creating natural schooling patterns.
          const t = Date.now() * 0.001; // seconds
          const schoolOffset = (this.schoolId / 3) * Math.PI * 2;
          const currentAngle = (t / 90) * Math.PI * 2 + schoolOffset;
          this.velocity.set(
            Math.cos(currentAngle),
            Math.sin(currentAngle)
          ).multiplyScalar(this.speed * 0.6);
        }
      } else {
        // When hungry, actively search for food
        // Scale detection range with hunger - hungrier prey are more motivated to find food
        const detectionRange = 50 * (1 + hungerLevel * 0.6); // Up to 60% increase when starving

        const nearbyResource = this.selectResource(resources, detectionRange);
        if (nearbyResource) {
          // Move toward the resource - hungrier prey move faster toward food
          const foragingSpeed = this.speed * (1 + hungerLevel * 0.3); // Up to 30% faster when starving
          const direction = nearbyResource.position.clone().sub(this.position).normalize();
          this.velocity.copy(direction).multiplyScalar(foragingSpeed);
        } else {
          // No food in range — follow schooling current to keep moving and
          // cover ground searching. Without this, repulsion is the only
          // force and prey spin in place.
          const t = Date.now() * 0.001;
          const schoolOffset = (this.schoolId / 3) * Math.PI * 2;
          const currentAngle = (t / 90) * Math.PI * 2 + schoolOffset;
          this.velocity.set(
            Math.cos(currentAngle),
            Math.sin(currentAngle)
          ).multiplyScalar(this.speed * 0.8);
        }
      }
    }

    // Call parent update method
    super.update(deltaTime);
  }

  reproduce(): Prey {
    return this.reproduceOffspring(
      Prey,
      SimulationConfig.prey.maxEnergy,
      0.5
    );
  }
}
