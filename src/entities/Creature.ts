import { Vector2 } from 'three';
import { Entity, EntityType } from './Entity';
import { SimulationConfig } from '../config';

export interface GeneticAttributes {
  strength: number;  // 0.0-1.0
  stealth: number;   // 0.0-1.0
  learnability: number; // 0.0-1.0
  longevity: number; // 0.0-1.0
}

export abstract class Creature extends Entity {
  // Movement properties
  velocity: Vector2 = new Vector2(0, 0);
  speed: number = SimulationConfig.creatures.baseSpeed; // Base speed from config
  
  // Genetic attributes
  attributes: GeneticAttributes;
  
  // Age properties
  age: number = 0;
  
  // Reproduction tracking
  timeSinceLastReproduction: number = 0; // Time since last reproduction event
  
  constructor(
    type: EntityType,
    x: number,
    y: number,
    energy: number,
    attributes: GeneticAttributes
  ) {
    super(type, x, y);
    this.maxEnergy = energy;
    this.energy = energy * 0.5; // Start with 50% of max energy
    this.attributes = attributes;
    
    // Set initial velocity with random direction
    const angle = Math.random() * Math.PI * 2;
    this.velocity.set(Math.cos(angle), Math.sin(angle)).normalize().multiplyScalar(this.speed);
  }
  
  update(deltaTime: number): void {
    // Update position based on velocity
    const moveSpeed = this.speed * this.attributes.strength * deltaTime;
    this.position.add(this.velocity.clone().multiplyScalar(moveSpeed));
    
    // Consume energy based on movement and metabolism
    this.consumeEnergy(deltaTime);
    
    // Check boundaries - wrap around or bounce
    this.handleBoundaries();
    
    // Increment age
    this.age += deltaTime;
    
    // Increment time since last reproduction
    this.timeSinceLastReproduction += deltaTime;
    
    // Update mesh position
    this.updateMeshPosition();
  }
  
  consumeEnergy(deltaTime: number): void {
    // Base metabolism cost - all creatures lose energy over time
    // Higher longevity reduces base metabolism cost (creatures are more efficient)
    const metabolicEfficiency = 0.7 + (this.attributes.longevity * 0.5); // 0.7-1.2 range
    const baseCost = (1 / metabolicEfficiency) * deltaTime;
    
    // Movement cost - higher strength = higher movement cost
    const movementCost = this.attributes.strength * 2 * deltaTime;
    
    // Activity-related cost (proportional to the creature's velocity)
    const velocityMagnitude = this.velocity.length();
    const activityCost = velocityMagnitude * this.attributes.strength * 0.5 * deltaTime;
    
    // Age factor - older creatures become less efficient 
    // Calculate age as a percentage of maximum lifespan
    const maxLifespan = 60 + (this.attributes.longevity * 40); // 60-100 seconds
    const ageRatio = this.age / maxLifespan;
    
    // Metabolic efficiency decreases with age, but is improved by longevity attribute
    // Formula: 1.0 at birth, decreases to longevity at maximum age
    const ageEfficiency = Math.max(0.7, 1.0 - (ageRatio * (1.0 - this.attributes.longevity)));
    
    // Calculate activity cost multiplier based on age
    // Older creatures get tired more quickly (affected less with higher longevity)
    const activityEfficiency = Math.max(0.6, 1.0 - (ageRatio * 0.8 * (1.0 - this.attributes.longevity)));
    
    // Total energy consumption with all factors
    const totalCost = (baseCost / ageEfficiency) + (movementCost + activityCost) / activityEfficiency;
    
    // Balance energy consumption between predators and prey
    // More reasonable values to ensure predators can survive
    const typeMultiplier = this.type === EntityType.PREDATOR ? 2.5 : 0.7;
    
    // Save previous energy for comparison
    const previousEnergy = this.energy;
    
    // Final energy consumption
    this.energy = Math.max(0, this.energy - (totalCost * typeMultiplier));
    
    // If energy changed significantly, update the mesh to reflect new energy level
    if (Math.abs(previousEnergy - this.energy) > 1) {
      this.updateMeshPosition();
    }
    
    // Starvation probability check - chance of sudden death when energy is low
    const energyRatio = this.energy / this.maxEnergy;
    this.checkStarvationProbability(energyRatio);
    
    // Check for death from starvation (energy completely depleted)
    if (this.energy <= 0) {
      this.die();
    }
    
    // Check for death from old age
    if (this.age > maxLifespan) {
      this.die();
    }
  }
  
  private checkStarvationProbability(energyRatio: number): void {
    // Check if energy level has dropped to starvation threshold levels
    // Apply random chance of death based on thresholds in config
    
    // Get the appropriate thresholds based on creature type
    const thresholds = this.type === EntityType.PREY 
      ? SimulationConfig.starvation.prey.thresholds 
      : SimulationConfig.starvation.predator.thresholds;
    
    // Check against each threshold from lowest energy to highest
    for (const threshold of thresholds) {
      if (energyRatio <= threshold.energyPercent) {
        // At or below this threshold, apply probability check
        if (Math.random() < threshold.probability) {
          // Random starvation death occurs!
          this.die();
          console.log(`${this.type} died from starvation at ${(energyRatio * 100).toFixed(1)}% energy`);
          break; // No need to check further thresholds
        }
        break; // Only apply the first (lowest) matching threshold
      }
    }
  }
  
  handleBoundaries(): void {
    // Wrap around environment boundaries
    // Use camera frustum size for consistent environment boundaries
    const width = 600 * (window.innerWidth / window.innerHeight); // Adjust for aspect ratio
    const height = 600; // Fixed height
    
    if (this.position.x < -width/2) this.position.x = width/2;
    if (this.position.x > width/2) this.position.x = -width/2;
    if (this.position.y < -height/2) this.position.y = height/2;
    if (this.position.y > height/2) this.position.y = -height/2;
  }
  
  canReproduce(): boolean {
    // Calculate max lifespan for maturity check
    const maxLifespan = SimulationConfig.creatures.maxLifespan.base + 
                        (this.attributes.longevity * SimulationConfig.creatures.maxLifespan.longevityBonus);
    
    // Get type-specific reproduction parameters
    const isPreyType = this.type === EntityType.PREY;
    const energyThreshold = isPreyType 
      ? SimulationConfig.reproduction.energyThreshold.prey 
      : SimulationConfig.reproduction.energyThreshold.predator;
    
    const cooldownDays = isPreyType
      ? SimulationConfig.reproduction.cooldown.prey
      : SimulationConfig.reproduction.cooldown.predator;
      
    // Convert cooldown days to simulation time units
    const cooldownTime = cooldownDays * 10; // 10 frames per day
    
    // Calculate cooldown factor (0 right after reproduction, 1 when cooldown is complete)
    const cooldownFactor = Math.min(1, this.timeSinceLastReproduction / cooldownTime);
    
    // Check if juvenile (age less than juvenile maturity threshold of max lifespan)
    const isJuvenile = this.age < (maxLifespan * SimulationConfig.reproduction.juvenileMaturity);
    
    // Calculate energy ratio
    const energyRatio = this.energy / this.maxEnergy;
    
    // Get threshold for lottery-like probabilities
    // (We're reusing the isPreyType variable defined above)
      
    // Apply lottery-like odds for critically low energy
    if (energyRatio < 0.1) {
      // Critically low energy (below 10%) - near-zero chance
      return Math.random() < 0.00001; // 0.001% chance (1 in 100,000)
    } 
    else if (energyRatio < 0.2) {
      // Very low energy (10-20%) - extremely rare
      return Math.random() < 0.0001; // 0.01% chance (1 in 10,000)
    }
    // For energy between 20% and the threshold, we'll continue with the
    // normal probability calculation below (using config's lowEnergy values)
    
    // Base reproduction probability
    let reproductionProbability;
    if (isJuvenile) {
      // Very low probability for juveniles
      reproductionProbability = SimulationConfig.reproduction.juvenileReproductionProbability;
    } else {
      // Normal energy-based probability
      if (energyRatio >= energyThreshold) {
        reproductionProbability = isPreyType
          ? SimulationConfig.reproduction.probability.highEnergy.prey
          : SimulationConfig.reproduction.probability.highEnergy.predator;
      } else {
        reproductionProbability = isPreyType
          ? SimulationConfig.reproduction.probability.lowEnergy.prey
          : SimulationConfig.reproduction.probability.lowEnergy.predator;
      }
    }
    
    // Apply cooldown factor (reduces probability right after reproduction)
    reproductionProbability *= cooldownFactor;
    
    // Check if reproduction occurs based on calculated probability
    return Math.random() < reproductionProbability;
  }
  
  abstract reproduce(): Creature;
}