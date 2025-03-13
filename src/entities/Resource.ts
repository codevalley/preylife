import * as THREE from 'three';
import { Entity, EntityType } from './Entity';

import { SimulationConfig } from '../config';

export class Resource extends Entity {
  static readonly DEFAULT_ENERGY: number = SimulationConfig.resources.defaultEnergy;
  
  constructor(x: number, y: number, energy: number = Resource.DEFAULT_ENERGY) {
    super(EntityType.RESOURCE, x, y);
    this.energy = energy;
    this.maxEnergy = energy;
  }
  
  update(_deltaTime: number): void {
    // Resources are static, no need to update
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