import * as THREE from 'three';
import { Creature, GeneticAttributes } from './Creature';
import { EntityType } from './Entity';
import { Prey } from './Prey';

export class Predator extends Creature {
  static readonly DEFAULT_MAX_ENERGY: number = 150;
  static readonly DEFAULT_ATTRIBUTES: GeneticAttributes = {
    strength: 0.5,
    stealth: 0.4,
    learnability: 0.3,
    longevity: 0.5
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
    // Create a triangular geometry for predator
    const shape = new THREE.Shape();
    shape.moveTo(0, 8);  // Top point
    shape.lineTo(-6, -4); // Bottom left
    shape.lineTo(6, -4);  // Bottom right
    shape.lineTo(0, 8);   // Back to top
    
    const geometry = new THREE.ShapeGeometry(shape);
    
    // Create material with red color
    const material = new THREE.MeshBasicMaterial({ color: 0xff3333 });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.updateMeshPosition();
    
    // Rotate the mesh to point in the direction of movement
    this.mesh.rotation.z = Math.atan2(this.velocity.y, this.velocity.x) - Math.PI/2;
    
    return this.mesh;
  }
  
  // Method to consume prey
  consumePrey(prey: Prey): void {
    // Predator gains 70% of prey's current energy
    const energyGained = prey.energy * 0.7;
    this.energy = Math.min(this.maxEnergy, this.energy + energyGained);
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
        const detectionChance = stealthDiff + 0.3;
        
        // Add to detectable prey if the stealth check passes
        if (detectionChance > 0 && Math.random() < detectionChance) {
          // Score based on distance (closer = higher score) and stealth advantage
          const distanceScore = 1 - (distance / adjustedRange);
          const stealthScore = Math.max(0, stealthDiff);
          const totalScore = distanceScore * 0.6 + stealthScore * 0.4;
          
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
    // Balanced capture formula based on strength difference
    // Still gives prey advantage but makes it possible for predators to succeed
    const catchChance = (this.attributes.strength - prey.attributes.strength) * 0.6 + 0.2;
    
    // Limit catch chance between 10% and 50%
    const cappedChance = Math.min(0.5, Math.max(0.1, catchChance));
    
    return Math.random() < cappedChance;
  }
  
  // Override update to include prey detection and hunting
  update(deltaTime: number, preyList: Prey[] = []): void {
    // Randomly change direction occasionally
    if (Math.random() < 0.01) {
      const angle = Math.random() * Math.PI * 2;
      this.velocity.set(Math.cos(angle), Math.sin(angle)).normalize().multiplyScalar(this.speed);
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
        // Move toward the prey - hungrier predators move faster
        const huntSpeed = this.speed * (1 + hungerLevel * 0.3); // Up to 30% faster when starving
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
    
    // Clamp attributes to valid range
    Object.keys(childAttributes).forEach(key => {
      childAttributes[key as keyof GeneticAttributes] = Math.max(0, Math.min(1, childAttributes[key as keyof GeneticAttributes]));
    });
    
    // Create new predator instance with mutated attributes
    const offspring = new Predator(
      this.position.x + (Math.random() * 20 - 10),
      this.position.y + (Math.random() * 20 - 10),
      this.maxEnergy,
      childAttributes
    );
    
    // Parent loses energy from reproduction
    this.energy *= 0.5;
    
    return offspring;
  }
}