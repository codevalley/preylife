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

  // Target-lock: commit to a prey for sustained pursuit instead of switching every frame
  private lockedTarget: Prey | null = null;
  private targetLockFrames: number = 0;
  private readonly minLockFrames = 30;       // Minimum frames before re-evaluating
  private readonly switchDistanceRatio = 0.3; // Only switch if another prey is this much closer

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
    // Longevity scales body height — long-lived predators look tankier (0.8-1.2 range)
    const bodyHeight = size * 0.5 * bodyCompact * (0.8 + this.attributes.longevity * 0.4);
    const jawLength = size * 0.4 * jawScale;

    const strength = this.attributes.strength;

    // Angular predator body - aggressive shape
    // Start at jaw tip (front)
    shape.moveTo(bodyLength * 0.5 + jawLength, 0);

    // Upper jaw (angular)
    shape.lineTo(bodyLength * 0.3, bodyHeight * 0.3);

    // Upper body with dorsal ridge — add zigzag spikes if strength > 0.3
    shape.lineTo(bodyLength * 0.1, bodyHeight * 0.7);

    if (strength > 0.3) {
      const spikeCount = Math.floor(strength * 3); // 1-3 spikes
      const spikeHeight = bodyHeight * strength * 0.5;
      const startX = bodyLength * 0.1;
      const endX = -bodyLength * 0.2;
      const startY = bodyHeight * 0.7;
      const endY = bodyHeight * 0.5;

      for (let i = 0; i < spikeCount; i++) {
        const t = (i + 0.5) / spikeCount;
        const baseT = (i + 1) / spikeCount;
        // Spike tip
        const spikeX = startX + (endX - startX) * t;
        const spikeBaseY = startY + (endY - startY) * t;
        shape.lineTo(spikeX, spikeBaseY + spikeHeight);
        // Valley between spikes (back to body contour)
        const valleyX = startX + (endX - startX) * baseT;
        const valleyY = startY + (endY - startY) * baseT;
        shape.lineTo(valleyX, valleyY);
      }
    } else {
      shape.lineTo(-bodyLength * 0.2, bodyHeight * 0.5);
    }

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
      uAge: { value: 0 },
      uLongevity: { value: this.attributes.longevity },
      uLearnability: { value: this.attributes.learnability },
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
        // Calculate normalized age ratio (lifespan scales with longevity)
        const maxLifespan = 60 + (this.attributes.longevity * 40);
        const ageRatio = Math.min(1, this.age / maxLifespan);

        updatePredatorUniforms(
          material,
          Predator.globalTime,
          this.energy,
          this.maxEnergy,
          this.attributes.stealth,
          this.attributes.strength,
          this.isActivelyHunting,
          ageRatio,
          this.attributes.longevity,
          this.attributes.learnability
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

  /**
   * Stealth-based lock break: stealthy prey can "vanish" mid-chase.
   * Chance per frame based on prey stealth vs predator stealth.
   * High stealth prey break locks frequently; low stealth prey almost never do.
   */
  private loseTrackCheck(prey: Prey): boolean {
    const stealthAdvantage = prey.attributes.stealth - this.attributes.stealth;
    // Base 1% chance, +2% per 0.1 stealth advantage, floored at 0
    const loseChance = Math.max(0, 0.01 + stealthAdvantage * 0.2);
    return Math.random() < loseChance;
  }

  /**
   * Target-lock wrapper around detectPrey. Commits to a target for minLockFrames,
   * only breaking early if the target dies, escapes range, or a much closer prey appears.
   */
  private selectPrey(preyList: Prey[], detectionRange: number): Prey | null {
    this.targetLockFrames++;

    // Check if current locked target is still valid
    if (this.lockedTarget) {
      const targetDead = this.lockedTarget.isDead;
      const targetDist = this.position.distanceTo(this.lockedTarget.position);
      const targetEscaped = targetDist > detectionRange * 1.2; // 20% grace beyond detection range

      if (targetDead || targetEscaped) {
        // Target lost — unlock immediately
        this.lockedTarget = null;
        this.targetLockFrames = 0;
      } else if (this.loseTrackCheck(this.lockedTarget)) {
        // Stealthy prey vanished — predator loses the trail
        this.lockedTarget = null;
        this.targetLockFrames = 0;
      } else if (this.targetLockFrames < this.minLockFrames) {
        // Still committed — keep chasing
        return this.lockedTarget;
      } else {
        // Lock expired — check if a significantly closer prey exists
        const newPrey = this.detectPrey(preyList, detectionRange);
        if (newPrey && newPrey !== this.lockedTarget) {
          const newDist = this.position.distanceTo(newPrey.position);
          if (newDist < targetDist * this.switchDistanceRatio) {
            // Much closer prey — switch target
            this.lockedTarget = newPrey;
            this.targetLockFrames = 0;
            return newPrey;
          }
        }
        // No better option — re-lock current target
        this.targetLockFrames = 0;
        return this.lockedTarget;
      }
    }

    // No locked target — acquire a new one
    const newTarget = this.detectPrey(preyList, detectionRange);
    if (newTarget) {
      this.lockedTarget = newTarget;
      this.targetLockFrames = 0;
    }
    return newTarget;
  }

  /**
   * Unified predation contest — single roll combining predator offense and prey defense.
   * At median attributes (all 0.5) the result is exactly 0.40 (40% catch rate).
   * Clamped to [0.15, 0.75].
   */
  canCatchPrey(prey: Prey): boolean {
    const MEDIAN = 0.5;

    // --- Predator offense ---
    const strengthDiff = this.attributes.strength - prey.attributes.strength;
    const stealthDiff = this.attributes.stealth - prey.attributes.stealth;
    const offense = Math.max(strengthDiff * 0.5, stealthDiff * 0.4);

    // Predator extreme-trait bonus (>0.7 in either stat)
    let predSpecBonus = 0;
    if (this.attributes.strength > 0.7 || this.attributes.stealth > 0.7) {
      predSpecBonus = Math.max(
        Math.max(0, (this.attributes.strength - 0.7) * 0.8),
        Math.max(0, (this.attributes.stealth - 0.7) * 0.8)
      );
    }

    // --- Prey defense ---
    const preyStealthDef = prey.attributes.stealth - this.attributes.stealth;
    const preyStrDef = prey.attributes.strength - this.attributes.strength;
    const defense = Math.max(preyStealthDef * 0.5, preyStrDef * 0.3);

    // Prey extreme-trait bonus
    let preySpecBonus = 0;
    if (prey.attributes.stealth > 0.7 || prey.attributes.strength > 0.7) {
      preySpecBonus = Math.max(
        Math.max(0, (prey.attributes.stealth - 0.7) * 1.0),
        Math.max(0, (prey.attributes.strength - 0.7) * 1.0)
      );
    }

    // --- Specialization advantage ---
    const predDeviation = Math.max(
      Math.abs(this.attributes.strength - MEDIAN),
      Math.abs(this.attributes.stealth - MEDIAN)
    );
    const preyDeviation = Math.max(
      Math.abs(prey.attributes.strength - MEDIAN),
      Math.abs(prey.attributes.stealth - MEDIAN)
    );
    const specAdv = (predDeviation - preyDeviation) * 0.2;

    // --- Combine ---
    const catchChance = 0.33 + offense + predSpecBonus - defense - preySpecBonus + specAdv;
    const capped = Math.min(0.75, Math.max(0.15, catchChance));

    return Math.random() < capped;
  }

  /**
   * Check if this predator is in a desperate state: starving and isolated.
   * Returns true when hunger exceeds threshold and few predators are nearby.
   */
  private isDesperate(hungerLevel: number, nearbyPredators: Predator[]): boolean {
    const desp = SimulationConfig.predator.desperation;
    if (hungerLevel < desp.hungerThreshold) return false;

    // Count predators within isolation range
    let closeCount = 0;
    for (const other of nearbyPredators) {
      if (this.position.distanceTo(other.position) < desp.isolationRange) {
        closeCount++;
        if (closeCount > desp.maxNearbyPredators) return false;
      }
    }
    return true;
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

    // Check desperation state: starving + isolated
    const desperate = this.isDesperate(hungerLevel, nearbyPredators);
    const desp = SimulationConfig.predator.desperation;

    // Apply desperation turn rate bonus (read by parent Creature.update)
    this.turnRateBonus = desperate ? desp.turnRateBonus : 0;

    // If the predator is fairly full (less than 25% hunger), it's less aggressive
    // Increased from 20% to 25% to make predators hunt more often
    if (hungerLevel < 0.25) {
      // When relatively full, only notice prey that are very close and easy to catch
      // Reduced detection range and higher chance of just wandering
      if (Math.random() < 0.5) { // Reduced from 70% to 50% chance to wander when full
        // Just continue current movement - no hunting
      } else {
        // Occasionally still check for extremely close prey (opportunistic hunting)
        const nearbyPrey = this.selectPrey(preyList, 40); // Much shorter detection range
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
      let detectionRange = 80 * (1 + hungerLevel * detectionMultiplier); // Up to 50% increase when starving

      // Desperation: boost detection range
      if (desperate) {
        detectionRange *= (1 + desp.detectionBonus);
      }

      const nearbyPrey = this.selectPrey(preyList, detectionRange);
      if (nearbyPrey) {
        this.isActivelyHunting = true;
        // Move toward the prey - hungrier predators move faster to match fleeing prey speed
        // Using config value for hunt speed multiplier
        const huntingSpeedMultiplier = SimulationConfig.predator.huntingSpeedMultiplier || 0.5;
        let huntSpeed = this.speed * (1 + hungerLevel * huntingSpeedMultiplier); // Up to 50% faster when starving, matching fleeing prey

        // Desperation: boost hunting speed
        if (desperate) {
          huntSpeed *= (1 + desp.speedBonus);
        }

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
