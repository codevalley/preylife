import * as THREE from 'three';
import { Entity, EntityType } from './Entity';

import { SimulationConfig } from '../config';

export class Resource extends Entity {
  static readonly DEFAULT_ENERGY: number = SimulationConfig.resources.defaultEnergy;
  
  // Time tracking for decay
  creationTime: number = 0; // Will be set by the simulation engine when spawned
  
  constructor(x: number, y: number, energy: number = Resource.DEFAULT_ENERGY) {
    super(EntityType.RESOURCE, x, y);
    this.energy = energy;
    this.maxEnergy = energy;
  }
  
  // Check if the resource should decay based on its age
  shouldDecay(currentDay: number): boolean {
    if (!SimulationConfig.resources.limits.enableDecay) {
      return false;
    }
    
    // Calculate the age of this resource in days
    const ageInDays = currentDay - this.creationTime;
    
    // If resource is young, don't decay it
    if (ageInDays < SimulationConfig.resources.limits.decayLifespan) {
      return false;
    }
    
    // Older resources have a chance to decay each frame
    return Math.random() < SimulationConfig.resources.limits.decayChancePerFrame;
  }
  
  update(_deltaTime: number): void {
    // Resources are now occasionally updated for decay, but still static otherwise
  }
  
  createMesh(): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(3, 3);
    
    // Calculate color intensity based on energy level
    const energyRatio = this.energy / this.maxEnergy;
    const colorIntensity = 0.3 + (energyRatio * 0.7); // 30-100% intensity
    
    // Green color with intensity based on energy
    const color = new THREE.Color(0, colorIntensity, 0);
    const material = new THREE.MeshBasicMaterial({ color });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.updateMeshPosition();
    return this.mesh;
  }
  
  updateMeshPosition(): void {
    super.updateMeshPosition();
    
    // Update color based on current energy level
    if (this.mesh) {
      const energyRatio = this.energy / this.maxEnergy;
      const colorIntensity = 0.3 + (energyRatio * 0.7); // 30-100% intensity
      (this.mesh.material as THREE.MeshBasicMaterial).color.setRGB(0, colorIntensity, 0);
    }
  }
}