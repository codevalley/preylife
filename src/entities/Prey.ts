import * as THREE from 'three';
import { Creature, GeneticAttributes } from './Creature';
import { EntityType } from './Entity';
import { Resource } from './Resource';
import { Predator } from './Predator';

export class Prey extends Creature {
  static readonly DEFAULT_MAX_ENERGY: number = 100;
  static readonly DEFAULT_ATTRIBUTES: GeneticAttributes = {
    strength: 0.5,
    stealth: 0.5,
    learnability: 0.3,
    longevity: 0.5
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
    // Create a circular geometry for prey
    const geometry = new THREE.CircleGeometry(6, 32);
    
    // Create material with blue color
    const material = new THREE.MeshBasicMaterial({ color: 0x0088ff });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.updateMeshPosition();
    return this.mesh;
  }
  
  // Method to consume a resource
  consumeResource(resource: Resource): void {
    // Prey get a 20% bonus when consuming resources to further help them survive
    const energyGain = resource.energy * 1.2;
    this.energy = Math.min(this.maxEnergy, this.energy + energyGain);
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
  
  // Override update to include resource detection and movement
  update(deltaTime: number, resources: Resource[] = []): void {
    // Randomly change direction occasionally
    if (Math.random() < 0.02) {
      const angle = Math.random() * Math.PI * 2;
      this.velocity.set(Math.cos(angle), Math.sin(angle)).normalize().multiplyScalar(this.speed);
    }
    
    // Try to detect nearby resources
    const nearbyResource = this.detectResource(resources, 50);
    if (nearbyResource) {
      // Move toward the resource
      const direction = nearbyResource.position.clone().sub(this.position).normalize();
      this.velocity.copy(direction).multiplyScalar(this.speed);
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
    
    // Clamp attributes to valid range
    Object.keys(childAttributes).forEach(key => {
      childAttributes[key as keyof GeneticAttributes] = Math.max(0, Math.min(1, childAttributes[key as keyof GeneticAttributes]));
    });
    
    // Create new prey instance with mutated attributes
    const offspring = new Prey(
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