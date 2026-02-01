import * as THREE from 'three';
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
   * The shape varies based on strength (more streamlined = higher strength)
   */
  private createFishGeometry(): THREE.ShapeGeometry {
    const shape = new THREE.Shape();

    // Base size adjusted by energy capacity
    const baseSize = 6;
    const size = baseSize * (0.8 + (this.maxEnergy / Prey.DEFAULT_MAX_ENERGY) * 0.4);

    // Strength affects body proportions: stronger = more elongated/streamlined
    const streamline = 0.8 + this.attributes.strength * 0.4; // 0.8 - 1.2
    const bodyWidth = size * 0.6 / streamline;
    const bodyLength = size * streamline;

    // Fish body - organic curved shape
    // Start at nose
    shape.moveTo(bodyLength * 0.5, 0);

    // Upper body curve (nose to tail)
    shape.bezierCurveTo(
      bodyLength * 0.3, bodyWidth * 0.8,   // Control point 1
      -bodyLength * 0.1, bodyWidth * 0.6,  // Control point 2
      -bodyLength * 0.3, bodyWidth * 0.2   // End at tail base
    );

    // Tail fin (creates flowing V shape)
    const tailLength = bodyLength * 0.3;
    shape.lineTo(-bodyLength * 0.3 - tailLength * 0.3, bodyWidth * 0.5);
    shape.lineTo(-bodyLength * 0.5, 0); // Tail tip
    shape.lineTo(-bodyLength * 0.3 - tailLength * 0.3, -bodyWidth * 0.5);
    shape.lineTo(-bodyLength * 0.3, -bodyWidth * 0.2);

    // Lower body curve (tail back to nose)
    shape.bezierCurveTo(
      -bodyLength * 0.1, -bodyWidth * 0.6,
      bodyLength * 0.3, -bodyWidth * 0.8,
      bodyLength * 0.5, 0
    );

    return new THREE.ShapeGeometry(shape);
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
    const stealthBlue = 0.6 + this.attributes.stealth * 0.4;
    const strengthCyan = this.attributes.strength * 0.25;

    baseColor.setRGB(
      0.05,                          // Minimal red
      0.15 + strengthCyan,            // Small amount of green (cyan hint)
      stealthBlue                     // Strong blue
    );

    // Glow color is brighter blue-white
    glowColor.setRGB(
      0.15,
      0.3 + strengthCyan,
      1.0
    );

    // Create bioluminescent shader material
    const material = createBioluminescentMaterial({
      uBaseColor: { value: baseColor },
      uGlowColor: { value: glowColor },
      uEnergy: { value: this.energy / this.maxEnergy },
      uStealth: { value: this.attributes.stealth },
      uStrength: { value: this.attributes.strength },
      uGlowIntensity: { value: 0.6 }, // Subtle glow
      uPulseSpeed: { value: 2.0 + this.attributes.learnability }, // Faster pulse = more active learner
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
        updateBioluminescentUniforms(
          material,
          Prey.globalTime,
          this.energy,
          this.maxEnergy,
          this.attributes.stealth,
          this.attributes.strength
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

    // Randomly change direction occasionally - higher chance when full
    const energyRatio = this.energy / this.maxEnergy;
    const directionChangeChance = 0.02 + (energyRatio * 0.03); // Up to 5% when full

    if (Math.random() < directionChangeChance && !nearbyPredator) {
      const angle = Math.random() * Math.PI * 2;
      this.velocity.set(Math.cos(angle), Math.sin(angle)).normalize().multiplyScalar(this.speed);
    }

    // Add mild repulsion between prey to prevent clumping
    // This is a lower priority than predator avoidance and food seeking
    if (!nearbyPredator && nearbyPrey.length > 0) {
      applyRepulsion(this, nearbyPrey, 'prey');
    }

    // If a predator is nearby, flee from it
    if (nearbyPredator) {
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
      const fleeSpeed = this.speed * (1 + fleeBonus + specializedFleeBonus) * avoidanceMultiplier;

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
      const hungerLevel = 1 - energyRatio;

      // If prey is fairly full (less than 30% hunger), it's less focused on finding food
      if (hungerLevel < 0.3) {
        // When fairly full, prey wanders more and is less likely to chase resources
        // They might still opportunistically grab very close resources
        if (Math.random() < 0.8) { // 80% chance to just wander when full
          // Just continue current movement - no active foraging
        } else {
          // Occasionally still check for extremely close resources (opportunistic feeding)
          const nearbyResource = this.detectResource(resources, 30); // Much shorter detection range
          if (nearbyResource) {
            // Move toward the resource, but with less urgency
            const direction = nearbyResource.position.clone().sub(this.position).normalize();
            this.velocity.copy(direction).multiplyScalar(this.speed * 0.8); // Move slower when not hungry
          }
        }
      } else {
        // When hungry, actively search for food
        // Scale detection range with hunger - hungrier prey are more motivated to find food
        const detectionRange = 50 * (1 + hungerLevel * 0.6); // Up to 60% increase when starving

        const nearbyResource = this.detectResource(resources, detectionRange);
        if (nearbyResource) {
          // Move toward the resource - hungrier prey move faster toward food
          const foragingSpeed = this.speed * (1 + hungerLevel * 0.3); // Up to 30% faster when starving
          const direction = nearbyResource.position.clone().sub(this.position).normalize();
          this.velocity.copy(direction).multiplyScalar(foragingSpeed);
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
