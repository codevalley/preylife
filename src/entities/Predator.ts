import * as THREE from 'three';
import { Vector2 } from 'three';
import { Creature, GeneticAttributes } from './Creature';
import { EntityType } from './Entity';
import { Prey } from './Prey';

import { SimulationConfig } from '../config';

export class Predator extends Creature {
  static readonly DEFAULT_MAX_ENERGY: number = SimulationConfig.predator.maxEnergy;
  static readonly DEFAULT_ATTRIBUTES: GeneticAttributes = {
    strength: SimulationConfig.predator.defaultAttributes.strength,
    stealth: SimulationConfig.predator.defaultAttributes.stealth,
    learnability: SimulationConfig.predator.defaultAttributes.learnability,
    longevity: SimulationConfig.predator.defaultAttributes.longevity
  };
  
  constructor(
    x: number,
    y: number,
    energy: number = Predator.DEFAULT_MAX_ENERGY,
    attributes: GeneticAttributes = {...Predator.DEFAULT_ATTRIBUTES}
  ) {
    super(EntityType.PREDATOR, x, y, energy, attributes);
  }
  
  createMesh(): THREE.Mesh {
    // Create a pentagon geometry for predator (instead of triangle)
    const shape = new THREE.Shape();
    const radius = 8;
    const segments = 5; // Pentagon has 5 sides
    
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = Math.sin(angle) * radius;
      const y = Math.cos(angle) * radius;
      
      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }
    shape.lineTo(Math.sin(0) * radius, Math.cos(0) * radius); // Close the shape
    
    const geometry = new THREE.ShapeGeometry(shape);
    
    // Calculate color based on genetic attributes
    // Stealth = yellow component, Strength = red component
    const yellowIntensity = this.attributes.stealth;
    const redIntensity = this.attributes.strength;
    
    // Energy affects overall brightness
    const energyRatio = this.energy / this.maxEnergy;
    const brightness = 0.3 + (energyRatio * 0.7); // 30-100% brightness
    
    // Combine colors: strength (red) and stealth (yellow)
    const color = new THREE.Color(
      Math.max(redIntensity, yellowIntensity) * brightness, // Red component (take highest value)
      yellowIntensity * brightness, // Green component from yellow
      0                             // No blue component
    );
    
    const material = new THREE.MeshBasicMaterial({ color });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.updateMeshPosition();
    
    // Rotate the mesh to point in the direction of movement
    this.mesh.rotation.z = Math.atan2(this.velocity.y, this.velocity.x) - Math.PI/2;
    
    return this.mesh;
  }
  
  updateMeshPosition(): void {
    super.updateMeshPosition();
    
    // Update color based on current energy level and attributes
    if (this.mesh) {
      const yellowIntensity = this.attributes.stealth;
      const redIntensity = this.attributes.strength;
      
      const energyRatio = this.energy / this.maxEnergy;
      const brightness = 0.3 + (energyRatio * 0.7); // 30-100% brightness
      
      (this.mesh.material as THREE.MeshBasicMaterial).color.setRGB(
        Math.max(redIntensity, yellowIntensity) * brightness,
        yellowIntensity * brightness,
        0
      );
      
      // Update rotation to face movement direction
      this.mesh.rotation.z = Math.atan2(this.velocity.y, this.velocity.x) - Math.PI/2;
    }
  }
  
  // Method to consume prey
  consumePrey(prey: Prey): void {
    // Predator gains 70% of prey's current energy
    const energyGained = prey.energy * 0.7;
    this.energy = Math.min(this.maxEnergy, this.energy + energyGained);
    
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
    // Get strength and stealth differences
    const strengthDifference = this.attributes.strength - prey.attributes.strength;
    const stealthDifference = this.attributes.stealth - prey.attributes.stealth;
    
    // Determine primary catch factor (use the better of stealth or strength)
    // This allows predators to specialize in either strength-based hunting or stealth-based hunting
    const primaryCatchFactor = stealthDifference > strengthDifference 
      ? stealthDifference * 0.4  // Stealth-based hunting
      : strengthDifference * 0.5; // Strength-based hunting (slightly more effective)
    
    // Lower base catch chance to give prey more advantage
    const baseCatchChance = 0.15; // Reduced from 0.2
    
    // Specialized trait bonus for predators - reward either high stealth OR high strength
    let specializedBonus = 0;
    
    // If predator has high stealth (>0.7) or high strength (>0.7), give bonus
    if (this.attributes.stealth > 0.7 || this.attributes.strength > 0.7) {
      // The higher the specialization, the bigger the bonus
      const stealthBonus = Math.max(0, (this.attributes.stealth - 0.7) * 0.8);
      const strengthBonus = Math.max(0, (this.attributes.strength - 0.7) * 0.8);
      specializedBonus = Math.max(stealthBonus, strengthBonus);
    }
    
    // Calculate final catch chance
    const catchChance = baseCatchChance + primaryCatchFactor + specializedBonus;
    
    // Limit catch chance between 5% and 45% (reduced from 10-50%)
    // This gives prey a better chance to survive the initial catch attempt
    const cappedChance = Math.min(0.45, Math.max(0.05, catchChance));
    
    return Math.random() < cappedChance;
  }
  
  // Override update to include prey detection and hunting
  update(deltaTime: number, preyList: Prey[] = [], nearbyPredators: Predator[] = []): void {
    // Randomly change direction occasionally
    if (Math.random() < 0.01) {
      const angle = Math.random() * Math.PI * 2;
      this.velocity.set(Math.cos(angle), Math.sin(angle)).normalize().multiplyScalar(this.speed);
    }
    
    // Add mild repulsion between predators to prevent clumping
    // This is a lower priority than hunting
    if (nearbyPredators.length > 0) {
      // Calculate repulsion vector (away from other predators)
      const repulsionVector = new Vector2(0, 0);
      
      // Only consider very close predators (personal space radius)
      const personalSpaceRadius = 30; // Predators need more personal space than prey
      let tooCloseCount = 0;
      
      for (const otherPredator of nearbyPredators) {
        const distance = this.position.distanceTo(otherPredator.position);
        if (distance < personalSpaceRadius) {
          // Calculate vector away from this predator
          const awayVector = this.position.clone().sub(otherPredator.position).normalize();
          
          // Closer predators have stronger repulsion effect
          const repulsionStrength = 1 - (distance / personalSpaceRadius);
          awayVector.multiplyScalar(repulsionStrength);
          
          repulsionVector.add(awayVector);
          tooCloseCount++;
        }
      }
      
      // If there are nearby predators, apply a mild repulsion effect
      if (tooCloseCount > 0) {
        // Only normalize if the vector is not zero length
        if (repulsionVector.lengthSq() > 0.0001) {
          repulsionVector.normalize();
          
          // Predators are more territorial than prey, so repulsion is slightly stronger
          const energyRatio = this.energy / this.maxEnergy;
          const repulsionFactor = 0.15 * Math.min(1, energyRatio * 2); // Stronger when full, weaker when hungry
          
          // Add the repulsion component to the velocity (don't replace it)
          const repulsionComponent = repulsionVector.clone().multiplyScalar(this.speed * repulsionFactor);
          this.velocity.add(repulsionComponent);
          
          // Only normalize if velocity is not zero length
          if (this.velocity.lengthSq() > 0.0001) {
            this.velocity.normalize().multiplyScalar(this.speed);
          }
        }
      }
    }
    
    // Check hunger level to determine hunting behavior
    const hungerLevel = 1 - (this.energy / this.maxEnergy);
    
    // If the predator is fairly full (less than 20% hunger), it's less aggressive
    if (hungerLevel < 0.2) {
      // When relatively full, only notice prey that are very close and easy to catch
      // Reduced detection range and higher chance of just wandering
      if (Math.random() < 0.7) { // 70% chance to just wander when full
        // Just continue current movement - no hunting
      } else {
        // Occasionally still check for extremely close prey (opportunistic hunting)
        const nearbyPrey = this.detectPrey(preyList, 40); // Much shorter detection range
        if (nearbyPrey) {
          // Move toward the prey, but with less persistence (lower speed multiplier)
          const direction = nearbyPrey.position.clone().sub(this.position).normalize();
          this.velocity.copy(direction).multiplyScalar(this.speed * 0.7); // Move slower when not hungry
          
          // Update rotation to face movement direction
          if (this.mesh) {
            this.mesh.rotation.z = Math.atan2(this.velocity.y, this.velocity.x) - Math.PI/2;
          }
        }
      }
    } else {
      // When hungry, actively hunt prey
      // Scale detection range with hunger - hungrier predators are more motivated
      const detectionRange = 80 * (1 + hungerLevel * 0.5); // Up to 50% increase when starving
      
      const nearbyPrey = this.detectPrey(preyList, detectionRange);
      if (nearbyPrey) {
        // Move toward the prey - hungrier predators move faster, but slightly slower than maximum prey flee speed
        // This gives fleeing prey a small chance to escape by outrunning the predator
        const huntSpeed = this.speed * (1 + hungerLevel * 0.25); // Up to 25% faster when starving (vs 50% for fleeing prey)
        const direction = nearbyPrey.position.clone().sub(this.position).normalize();
        this.velocity.copy(direction).multiplyScalar(huntSpeed);
        
        // Update rotation to face movement direction
        if (this.mesh) {
          this.mesh.rotation.z = Math.atan2(this.velocity.y, this.velocity.x) - Math.PI/2;
        }
      }
    }
    
    // Call parent update method
    super.update(deltaTime);
  }
  
  reproduce(): Predator {
    // Create offspring with slightly mutated attributes
    const childAttributes: GeneticAttributes = {
      strength: this.attributes.strength + (Math.random() * 0.1 - 0.05),
      stealth: this.attributes.stealth + (Math.random() * 0.1 - 0.05),
      learnability: this.attributes.learnability + (Math.random() * 0.1 - 0.05),
      longevity: this.attributes.longevity + (Math.random() * 0.1 - 0.05)
    };
    
    // Significant mutation chance for attributes
    if (Math.random() < SimulationConfig.reproduction.mutationChance) {
      // Pick a random attribute for significant mutation
      const attributes = ['strength', 'stealth', 'learnability', 'longevity'];
      const attributeToMutate = attributes[Math.floor(Math.random() * attributes.length)] as keyof GeneticAttributes;
      
      // Apply significant mutation
      const mutationAmount = Math.random() * SimulationConfig.reproduction.significantMutationRange - (SimulationConfig.reproduction.significantMutationRange / 2);
      childAttributes[attributeToMutate] += mutationAmount;
    }
    
    // Clamp attributes to valid range
    Object.keys(childAttributes).forEach(key => {
      childAttributes[key as keyof GeneticAttributes] = Math.max(0, Math.min(1, childAttributes[key as keyof GeneticAttributes]));
    });
    
    // Mutate energy capacity (inheriting parent's with some variation)
    let childEnergyCapacity = this.maxEnergy;
    
    // Apply small random mutation to energy capacity
    const energyMutation = Math.random() * SimulationConfig.reproduction.energyCapacityMutationRange - (SimulationConfig.reproduction.energyCapacityMutationRange / 2);
    childEnergyCapacity *= (1 + energyMutation);
    
    // Small chance of significant energy capacity mutation
    if (Math.random() < SimulationConfig.reproduction.mutationChance) {
      const significantEnergyMutation = Math.random() * SimulationConfig.reproduction.significantEnergyCapacityMutationRange - (SimulationConfig.reproduction.significantEnergyCapacityMutationRange / 2);
      childEnergyCapacity *= (1 + significantEnergyMutation);
    }
    
    // Ensure energy capacity doesn't get too small or too large
    childEnergyCapacity = Math.max(SimulationConfig.predator.maxEnergy * 0.5, Math.min(SimulationConfig.predator.maxEnergy * 2.0, childEnergyCapacity));
    
    // Create new predator instance with mutated attributes and energy capacity
    const offspring = new Predator(
      this.position.x + (Math.random() * 20 - 10),
      this.position.y + (Math.random() * 20 - 10),
      childEnergyCapacity,  // Pass the mutated energy capacity
      childAttributes
    );
    
    // Parent loses energy from reproduction - 60% instead of 50%
    // Creates a slightly higher energy cost for predator reproduction
    this.energy *= 0.4;
    
    // Reset reproduction timer
    this.timeSinceLastReproduction = 0;
    
    // Update visual appearance of parent to reflect energy loss
    this.updateMeshPosition();
    
    // Log reproduction event when extremely hungry (for debugging)
    if (this.energy / this.maxEnergy < 0.2) {
      console.warn(`WARNING: Predator reproduced with very low energy: ${(this.energy / this.maxEnergy * 100).toFixed(1)}%`);
    }
    
    return offspring;
  }
}