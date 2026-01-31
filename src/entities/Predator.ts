import * as THREE from 'three';
import { Creature, GeneticAttributes } from './Creature';
import { EntityType } from './Entity';
import { Prey } from './Prey';

import { SimulationConfig } from '../config';
import { applyRepulsion } from '../utils/behavior';
import {
  createPredatorMaterial,
  updatePredatorUniforms,
} from '../rendering/shaders/PredatorShader';

export class Predator extends Creature {
  static readonly DEFAULT_MAX_ENERGY: number = SimulationConfig.predator.maxEnergy;
  static readonly DEFAULT_ATTRIBUTES: GeneticAttributes = {
    strength: SimulationConfig.predator.defaultAttributes.strength,
    stealth: SimulationConfig.predator.defaultAttributes.stealth,
    learnability: SimulationConfig.predator.defaultAttributes.learnability,
    longevity: SimulationConfig.predator.defaultAttributes.longevity
  };

  // Shader time for animation
  private static globalTime: number = 0;

  // Track hunting state for visual feedback
  private isActivelyHunting: boolean = false;

  constructor(
    x: number,
    y: number,
    energy: number = Predator.DEFAULT_MAX_ENERGY,
    attributes: GeneticAttributes = {...Predator.DEFAULT_ATTRIBUTES}
  ) {
    super(EntityType.PREDATOR, x, y, energy, attributes);
  }

  /**
   * Create angular, menacing predator geometry.
   * Inspired by anglerfish/gulper eel - intimidating deep sea hunters.
   * Strength affects jaw size, stealth affects body compactness.
   */
  private createHunterGeometry(): THREE.ShapeGeometry {
    const shape = new THREE.Shape();

    // Base size adjusted by energy capacity
    const baseSize = 8;
    const size = baseSize * (0.8 + (this.maxEnergy / Predator.DEFAULT_MAX_ENERGY) * 0.4);

    // Strength affects jaw size (stronger = larger jaw/mouth)
    const jawScale = 0.6 + this.attributes.strength * 0.6; // 0.6 - 1.2

    // Stealth affects body compactness (stealthier = more compact, less profile)
    const bodyCompact = 1.0 - this.attributes.stealth * 0.3; // 0.7 - 1.0

    const bodyLength = size * 1.2;
    const bodyHeight = size * 0.5 * bodyCompact;
    const jawLength = size * 0.4 * jawScale;

    // Angular predator body - aggressive shape
    // Start at jaw tip (front)
    shape.moveTo(bodyLength * 0.5 + jawLength, 0);

    // Upper jaw (angular)
    shape.lineTo(bodyLength * 0.3, bodyHeight * 0.3);

    // Upper body with dorsal ridge
    shape.lineTo(bodyLength * 0.1, bodyHeight * 0.7);
    shape.lineTo(-bodyLength * 0.2, bodyHeight * 0.5);

    // Back fin (angular)
    shape.lineTo(-bodyLength * 0.4, bodyHeight * 0.8);
    shape.lineTo(-bodyLength * 0.5, bodyHeight * 0.3);

    // Tail
    shape.lineTo(-bodyLength * 0.6, 0);

    // Lower back
    shape.lineTo(-bodyLength * 0.5, -bodyHeight * 0.3);
    shape.lineTo(-bodyLength * 0.4, -bodyHeight * 0.6);

    // Lower body
    shape.lineTo(-bodyLength * 0.2, -bodyHeight * 0.4);
    shape.lineTo(bodyLength * 0.1, -bodyHeight * 0.5);

    // Lower jaw
    shape.lineTo(bodyLength * 0.3, -bodyHeight * 0.25);

    // Close to jaw tip
    shape.lineTo(bodyLength * 0.5 + jawLength, 0);

    return new THREE.ShapeGeometry(shape);
  }

  createMesh(): THREE.Mesh {
    // Create angular hunter geometry
    const geometry = this.createHunterGeometry();

    // Calculate colors based on attributes
    // Base color: amber to crimson spectrum
    // Strength affects red intensity
    // Stealth affects how dark the base body is (contrast with lure)
    const baseColor = new THREE.Color();
    const eyeColor = new THREE.Color();

    // Mix between amber (balanced) and crimson (high strength)
    const redComponent = 0.7 + this.attributes.strength * 0.3;
    const orangeComponent = 0.4 - this.attributes.strength * 0.2;

    // Stealthier predators have darker bodies
    const darkness = 1.0 - this.attributes.stealth * 0.4;

    baseColor.setRGB(
      redComponent * darkness,
      orangeComponent * darkness * 0.6,
      0.1 * darkness
    );

    // Eye/lure color is bright orange-yellow
    eyeColor.setRGB(1.0, 0.6, 0.1);

    // Create predator shader material
    const material = createPredatorMaterial({
      uBaseColor: { value: baseColor },
      uEyeColor: { value: eyeColor },
      uEnergy: { value: this.energy / this.maxEnergy },
      uStealth: { value: this.attributes.stealth },
      uStrength: { value: this.attributes.strength },
      uGlowIntensity: { value: 0.5 }, // Subtle glow
      uHunting: { value: 0 },
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.updateMeshPosition();
    return this.mesh;
  }

  updateMeshPosition(): void {
    super.updateMeshPosition();

    if (this.mesh) {
      // Update global time for shader animation
      Predator.globalTime += 0.016; // Approximately 60fps

      // Update shader uniforms
      const material = this.mesh.material as THREE.ShaderMaterial;
      if (material.uniforms) {
        updatePredatorUniforms(
          material,
          Predator.globalTime,
          this.energy,
          this.maxEnergy,
          this.attributes.stealth,
          this.attributes.strength,
          this.isActivelyHunting
        );
      }

      // Rotate predator to face movement direction
      if (this.velocity.lengthSq() > 0.0001) {
        const angle = Math.atan2(this.velocity.y, this.velocity.x);
        this.mesh.rotation.z = angle;
      }
    }
  }

  // Method to consume prey
  consumePrey(prey: Prey): void {
    // Predator gains energy from prey based on config
    const energyGainRate = SimulationConfig.predator.energyGainFromPrey;
    const energyGained = prey.energy * energyGainRate;
    this.energy = Math.min(this.maxEnergy, this.energy + energyGained);

    // Track food consumption
    this.onFoodConsumption();

    // Update visual appearance to reflect new energy level
    this.updateMeshPosition();
  }

  // Method to check for nearby prey
  detectPrey(preyList: Prey[], detectionRange: number): Prey | null {
    // Adjust detection range based on predator's stealth
    // Higher stealth = better at spotting prey from farther away
    const adjustedRange = detectionRange * (1 + this.attributes.stealth * 0.5);

    // Sort prey by distance and stealth differential to find the most detectable prey
    const detectablePrey: {prey: Prey, score: number}[] = [];

    for (const prey of preyList) {
      const distance = this.position.distanceTo(prey.position);
      if (distance < adjustedRange) {
        // Detection formula based on stealth differential
        // Predator stealth vs prey stealth with a base chance
        const stealthDiff = this.attributes.stealth - prey.attributes.stealth;

        // Lower base detection chance and make high prey stealth more effective
        // This gives stealthy prey a much better chance to evade detection
        let detectionChance: number;

        // If prey has very high stealth (>0.7), give significant evasion bonus
        if (prey.attributes.stealth > 0.7) {
          // The formula below creates a steeper penalty for predators trying to detect very stealthy prey
          const highStealthPenalty = (prey.attributes.stealth - 0.7) * 2.0;
          detectionChance = stealthDiff + 0.25 - highStealthPenalty;
        } else {
          detectionChance = stealthDiff + 0.25; // Reduced from 0.3
        }

        // Add to detectable prey if the stealth check passes
        if (detectionChance > 0 && Math.random() < detectionChance) {
          // Score based on distance (closer = higher score) and stealth advantage
          const distanceScore = 1 - (distance / adjustedRange);
          const stealthScore = Math.max(0, stealthDiff);
          const totalScore = distanceScore * 0.7 + stealthScore * 0.3; // Weight distance more heavily

          detectablePrey.push({prey, score: totalScore});
        }
      }
    }

    // Return the prey with highest score (best combination of being close and easily detected)
    if (detectablePrey.length > 0) {
      detectablePrey.sort((a, b) => b.score - a.score);
      return detectablePrey[0].prey;
    }

    return null;
  }

  // Method to attempt to catch prey
  canCatchPrey(prey: Prey): boolean {
    // Define median value for attributes
    const MEDIAN = 0.5;

    // Calculate how far each entity is from the median for both attributes
    const predatorStrengthDeviation = Math.abs(this.attributes.strength - MEDIAN);
    const predatorStealthDeviation = Math.abs(this.attributes.stealth - MEDIAN);
    const preyStrengthDeviation = Math.abs(prey.attributes.strength - MEDIAN);
    const preyStealthDeviation = Math.abs(prey.attributes.stealth - MEDIAN);

    // Use the better attribute for each entity
    const predatorBestDeviation = Math.max(predatorStrengthDeviation, predatorStealthDeviation);
    const preyBestDeviation = Math.max(preyStrengthDeviation, preyStealthDeviation);

    // Calculate advantage based on how much more specialized the predator is compared to prey
    // Positive means predator is more specialized, negative means prey is more specialized
    const specializationAdvantage = predatorBestDeviation - preyBestDeviation;

    // Base catch chance
    const baseCatchChance = 0.35; // Increased from 0.25 to make predators more effective

    // Calculate attribute-based hunting factor
    const strengthDifference = this.attributes.strength - prey.attributes.strength;
    const stealthDifference = this.attributes.stealth - prey.attributes.stealth;
    const primaryCatchFactor = stealthDifference > strengthDifference
      ? stealthDifference * 0.4  // Stealth-based hunting
      : strengthDifference * 0.5; // Strength-based hunting (slightly more effective)

    // Specialized trait bonus for extreme values
    let specializedBonus = 0;

    // If predator has high stealth (>0.7) or high strength (>0.7), give bonus
    if (this.attributes.stealth > 0.7 || this.attributes.strength > 0.7) {
      const stealthBonus = Math.max(0, (this.attributes.stealth - 0.7) * 0.8);
      const strengthBonus = Math.max(0, (this.attributes.strength - 0.7) * 0.8);
      specializedBonus = Math.max(stealthBonus, strengthBonus);
    }

    // Add specialization advantage factor - reward being further from median than prey
    // This will be positive when predator is more specialized than prey, negative otherwise
    const specializationFactor = specializationAdvantage * 0.3;

    // Calculate final catch chance
    const catchChance = baseCatchChance + primaryCatchFactor + specializedBonus + specializationFactor;

    // Limit catch chance between 15% and 75% (increased from 10-60%)
    // This gives predators better odds when they're highly specialized
    const cappedChance = Math.min(0.75, Math.max(0.15, catchChance));

    return Math.random() < cappedChance;
  }

  // Override update to include prey detection and hunting
  update(deltaTime: number, preyList: Prey[] = [], nearbyPredators: Predator[] = []): void {
    // Reset hunting state each frame
    this.isActivelyHunting = false;

    // Randomly change direction occasionally
    if (Math.random() < 0.01) {
      const angle = Math.random() * Math.PI * 2;
      this.velocity.set(Math.cos(angle), Math.sin(angle)).normalize().multiplyScalar(this.speed);
    }

    // Add mild repulsion between predators to prevent clumping
    // This is a lower priority than hunting
    if (nearbyPredators.length > 0) {
      applyRepulsion(this, nearbyPredators, 'predator');
    }

    // Check hunger level to determine hunting behavior
    const hungerLevel = 1 - (this.energy / this.maxEnergy);

    // If the predator is fairly full (less than 25% hunger), it's less aggressive
    // Increased from 20% to 25% to make predators hunt more often
    if (hungerLevel < 0.25) {
      // When relatively full, only notice prey that are very close and easy to catch
      // Reduced detection range and higher chance of just wandering
      if (Math.random() < 0.5) { // Reduced from 70% to 50% chance to wander when full
        // Just continue current movement - no hunting
      } else {
        // Occasionally still check for extremely close prey (opportunistic hunting)
        const nearbyPrey = this.detectPrey(preyList, 40); // Much shorter detection range
        if (nearbyPrey) {
          this.isActivelyHunting = true;
          // Move toward the prey, but with less persistence (lower speed multiplier)
          const direction = nearbyPrey.position.clone().sub(this.position).normalize();
          this.velocity.copy(direction).multiplyScalar(this.speed * 0.7); // Move slower when not hungry
        }
      }
    } else {
      // When hungry, actively hunt prey
      // Scale detection range with hunger - hungrier predators are more motivated
      const detectionMultiplier = SimulationConfig.predator.detectionRangeMultiplier || 0.5;
      const detectionRange = 80 * (1 + hungerLevel * detectionMultiplier); // Up to 50% increase when starving

      const nearbyPrey = this.detectPrey(preyList, detectionRange);
      if (nearbyPrey) {
        this.isActivelyHunting = true;
        // Move toward the prey - hungrier predators move faster to match fleeing prey speed
        // Using config value for hunt speed multiplier
        const huntingSpeedMultiplier = SimulationConfig.predator.huntingSpeedMultiplier || 0.5;
        const huntSpeed = this.speed * (1 + hungerLevel * huntingSpeedMultiplier); // Up to 50% faster when starving, matching fleeing prey
        const direction = nearbyPrey.position.clone().sub(this.position).normalize();
        this.velocity.copy(direction).multiplyScalar(huntSpeed);
      }
    }

    // Call parent update method
    super.update(deltaTime);
  }

  reproduce(): Predator {
    return this.reproduceOffspring(
      Predator,
      SimulationConfig.predator.maxEnergy,
      0.4,
      true
    );
  }
}
