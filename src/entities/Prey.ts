import * as THREE from 'three';
import { Creature, GeneticAttributes } from './Creature';
import { EntityType } from './Entity';
import { Resource } from './Resource';
import { Predator } from './Predator';
import { SimulationConfig } from '../config';
import { applyRepulsion } from '../utils/behavior';

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
      
      let redValue = 0;
      
      // Add visual effect for conversion
      // if (this.isUndergoingConversion) {
      //   // Add pulsating red component during conversion (prey → predator)
      //   const pulseRate = Math.sin(Date.now() * 0.01) * 0.5 + 0.5; // 0-1 pulsating value
      //   redValue = 0.7 * pulseRate; // Reddish glow during conversion
        
      //   // Also make the creature slightly larger during conversion
      //   const scaleFactor = 1.0 + (pulseRate * 0.3); // Scale 1.0-1.3x
      //   this.mesh.scale.set(scaleFactor, scaleFactor, 1);
      // } else {
      //   // Reset scale when not converting
      //   this.mesh.scale.set(1, 1, 1);
      // }
      
      (this.mesh.material as THREE.MeshBasicMaterial).color.setRGB(
        redValue,
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
    
    // Track food consumption
    this.onFoodConsumption();
    
    // Update visual appearance to reflect new energy level
    this.updateMeshPosition();
  }
  
  // New method to determine if prey can escape using stealth after being caught
  canEscapeWithStealth(predator: Predator): boolean {
    // Define median value for attributes
    const MEDIAN = 0.5;
    
    // Calculate how far each entity is from the median for both attributes
    const preyStrengthDeviation = Math.abs(this.attributes.strength - MEDIAN);
    const preyStealthDeviation = Math.abs(this.attributes.stealth - MEDIAN);
    const predatorStrengthDeviation = Math.abs(predator.attributes.strength - MEDIAN);
    const predatorStealthDeviation = Math.abs(predator.attributes.stealth - MEDIAN);
    
    // Use the better attribute for each entity
    const preyBestDeviation = Math.max(preyStrengthDeviation, preyStealthDeviation);
    const predatorBestDeviation = Math.max(predatorStrengthDeviation, predatorStealthDeviation);
    
    // Calculate advantage based on how much more specialized the prey is compared to predator
    // Positive means prey is more specialized, negative means predator is more specialized
    const specializationAdvantage = preyBestDeviation - predatorBestDeviation;
    
    // Base stealth difference (stealth-based escape)
    const stealthDifference = this.attributes.stealth - predator.attributes.stealth;
    
    // Base strength difference (strength-based resistance)
    const strengthDifference = this.attributes.strength - predator.attributes.strength;
    
    // Specialized trait bonus - reward either high stealth OR high strength
    // This creates multiple viable evolutionary strategies
    let specializedBonus = 0;
    
    // If prey has high stealth (>0.7) or high strength (>0.7), give bonus
    if (this.attributes.stealth > 0.7 || this.attributes.strength > 0.7) {
      // The higher the specialization, the bigger the bonus
      const stealthBonus = Math.max(0, (this.attributes.stealth - 0.7) * 1.5);
      const strengthBonus = Math.max(0, (this.attributes.strength - 0.7) * 1.5);
      specializedBonus = Math.max(stealthBonus, strengthBonus);
    }
    
    // Determine primary escape factor (use the better of stealth or strength)
    const primaryEscapeFactor = stealthDifference > strengthDifference 
      ? stealthDifference * 0.8  // Stealth-based escape
      : strengthDifference * 0.5; // Strength-based resistance (slightly less effective)
    
    // Add specialization advantage factor - reward being further from median than predator
    // This will be positive when prey is more specialized than predator, negative otherwise
    const specializationFactor = specializationAdvantage * 0.3;
    
    // Use escape base chance from config
    const baseEscapeChance = SimulationConfig.prey.escapeBaseChance || 0.2;
    
    // Calculate total escape chance with base chance, primary factor and specialized bonus
    const escapeChance = baseEscapeChance + primaryEscapeFactor + specializedBonus + specializationFactor;
    
    // Cap escape chance between 15-75% (kept the same)
    const cappedEscapeChance = Math.min(0.75, Math.max(0.15, escapeChance));
    
    // Stealth escape attempt consumes energy from config
    const escapeEnergyCost = SimulationConfig.prey.escapeEnergyConsumption || 5;
    this.energy = Math.max(0, this.energy - escapeEnergyCost);
    
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