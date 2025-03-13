import * as THREE from 'three';
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
    
    // Update visual appearance of parent to reflect energy loss
    this.updateMeshPosition();
    
    return offspring;
  }
}