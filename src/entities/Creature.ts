import * as THREE from 'three';
import { Vector2 } from 'three';
import { Entity, EntityType } from './Entity';

export interface GeneticAttributes {
  strength: number;  // 0.0-1.0
  stealth: number;   // 0.0-1.0
  learnability: number; // 0.0-1.0
  longevity: number; // 0.0-1.0
}

export abstract class Creature extends Entity {
  // Movement properties
  velocity: Vector2 = new Vector2(0, 0);
  speed: number = 10; // Base speed in units per second
  
  // Genetic attributes
  attributes: GeneticAttributes;
  
  // Age properties
  age: number = 0;
  
  constructor(
    type: EntityType,
    x: number,
    y: number,
    energy: number,
    attributes: GeneticAttributes
  ) {
    super(type, x, y);
    this.energy = energy * 0.5; // Start with 50% of max energy
    this.maxEnergy = energy;
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
    
    // Age factor - older creatures become less efficient
    // The effect is reduced by longevity
    const ageEfficiency = Math.max(0.8, 1 - (this.age * 0.01 * (1 - this.attributes.longevity)));
    
    // Total energy consumption with all factors
    const totalCost = (baseCost + movementCost) / ageEfficiency;
    
    // Balance energy consumption between predators and prey
    // More reasonable values to ensure predators can survive
    const typeMultiplier = this.type === EntityType.PREDATOR ? 2.5 : 0.7;
    
    // Final energy consumption
    this.energy = Math.max(0, this.energy - (totalCost * typeMultiplier));
    
    // Check for death from starvation
    if (this.energy <= 0) {
      this.die();
    }
    
    // Check for death from old age
    // Maximum lifespan is affected by longevity attribute
    const maxLifespan = 60 + (this.attributes.longevity * 40); // 60-100 seconds
    if (this.age > maxLifespan) {
      this.die();
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
    // Creature can reproduce when energy is at max capacity
    return this.energy >= this.maxEnergy;
  }
  
  abstract reproduce(): Creature;
}