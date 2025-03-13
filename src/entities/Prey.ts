import * as THREE from 'three';
import { Creature, GeneticAttributes } from './Creature';
import { EntityType } from './Entity';
import { Resource } from './Resource';
import { Predator } from './Predator';
import { SimulationConfig } from '../config';

export class Prey extends Creature {
  static readonly DEFAULT_MAX_ENERGY: number = SimulationConfig.prey.maxEnergy;
  static readonly DEFAULT_ATTRIBUTES: GeneticAttributes = {
    strength: SimulationConfig.prey.defaultAttributes.strength,
    stealth: SimulationConfig.prey.defaultAttributes.stealth,
    learnability: SimulationConfig.prey.defaultAttributes.learnability,
    longevity: SimulationConfig.prey.defaultAttributes.longevity
  };
  
  constructor(
    x: number,
    y: number,
    energy: number = Prey.DEFAULT_MAX_ENERGY,
    attributes: GeneticAttributes = {...Prey.DEFAULT_ATTRIBUTES}
  ) {
    super(EntityType.PREY, x, y, energy, attributes);
  }
  
  createMesh(): THREE.Mesh {
    // Keep circular geometry for prey
    const geometry = new THREE.CircleGeometry(6, 32);
    
    // Calculate color based on genetic attributes
    // Stealth = blue component, Strength = green component
    const blueIntensity = this.attributes.stealth;
    const greenIntensity = this.attributes.strength;
    
    // Energy affects overall brightness
    const energyRatio = this.energy / this.maxEnergy;
    const brightness = 0.3 + (energyRatio * 0.7); // 30-100% brightness
    
    // Combine colors: strength (green) and stealth (blue)
    const color = new THREE.Color(
      0,                          // No red component
      greenIntensity * brightness, // Green component
      blueIntensity * brightness   // Blue component
    );
    
    const material = new THREE.MeshBasicMaterial({ color });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.updateMeshPosition();
    return this.mesh;
  }
  
  updateMeshPosition(): void {
    super.updateMeshPosition();
    
    // Update color based on current energy level and attributes
    if (this.mesh) {
      const blueIntensity = this.attributes.stealth;
      const greenIntensity = this.attributes.strength;
      
      const energyRatio = this.energy / this.maxEnergy;
      const brightness = 0.3 + (energyRatio * 0.7); // 30-100% brightness
      
      (this.mesh.material as THREE.MeshBasicMaterial).color.setRGB(
        0,
        greenIntensity * brightness, 
        blueIntensity * brightness
      );
    }
  }
  
  // Method to consume a resource
  consumeResource(resource: Resource): void {
    // Prey get a 20% bonus when consuming resources to further help them survive
    const energyGain = resource.energy * 1.2;
    this.energy = Math.min(this.maxEnergy, this.energy + energyGain);
    
    // Update visual appearance to reflect new energy level
    this.updateMeshPosition();
  }
  
  // New method to determine if prey can escape using stealth after being caught
  canEscapeWithStealth(predator: Predator): boolean {
    // Calculate escape chance based on prey's stealth vs predator's stealth
    // Higher prey stealth = better chance to escape
    // Higher predator stealth = harder for prey to escape
    
    // Base escape chance is prey stealth minus predator stealth plus a small bonus
    const stealthDifference = this.attributes.stealth - predator.attributes.stealth;
    const escapeChance = stealthDifference * 0.8 + 0.3; // 30% base chance + stealth boost
    
    // Cap escape chance between 10-70%
    const cappedEscapeChance = Math.min(0.7, Math.max(0.1, escapeChance));
    
    // Stealth escape attempt consumes energy
    this.energy = Math.max(0, this.energy - 5);
    
    return Math.random() < cappedEscapeChance;
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
  update(deltaTime: number, resources: Resource[] = [], predators: Predator[] = []): void {
    
    // Check for nearby predators first - survival takes priority over feeding
    const nearbyPredator = this.detectPredator(predators);
    
    // Randomly change direction occasionally - higher chance when full
    const energyRatio = this.energy / this.maxEnergy;
    const directionChangeChance = 0.02 + (energyRatio * 0.03); // Up to 5% when full
    
    if (Math.random() < directionChangeChance && !nearbyPredator) {
      const angle = Math.random() * Math.PI * 2;
      this.velocity.set(Math.cos(angle), Math.sin(angle)).normalize().multiplyScalar(this.speed);
    }
    
    // If a predator is nearby, flee from it
    if (nearbyPredator) {
      // Direction away from predator
      const fleeDirection = this.position.clone().sub(nearbyPredator.position).normalize();
      
      // Get avoidance multiplier from config (default to 1.5 if not set)
      const avoidanceMultiplier = SimulationConfig.prey.predatorAvoidanceMultiplier || 1.5;
      
      // Boost speed based on stealth and avoidance multiplier
      const fleeSpeed = this.speed * (1 + this.attributes.stealth * 0.5) * avoidanceMultiplier;
      
      // Set velocity to flee
      this.velocity.copy(fleeDirection).multiplyScalar(fleeSpeed);
      
      // Fleeing consumes more energy
      this.energy = Math.max(0, this.energy - (2 * deltaTime));
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
    childEnergyCapacity = Math.max(SimulationConfig.prey.maxEnergy * 0.5, Math.min(SimulationConfig.prey.maxEnergy * 2.0, childEnergyCapacity));
    
    // Create new prey instance with mutated attributes and energy capacity
    const offspring = new Prey(
      this.position.x + (Math.random() * 20 - 10),
      this.position.y + (Math.random() * 20 - 10),
      childEnergyCapacity,  // Pass the mutated energy capacity
      childAttributes
    );
    
    // Parent loses energy from reproduction
    this.energy *= 0.5;
    
    // Reset reproduction timer
    this.timeSinceLastReproduction = 0;
    
    // Update visual appearance of parent to reflect energy loss
    this.updateMeshPosition();
    
    return offspring;
  }
}