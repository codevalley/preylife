import * as THREE from 'three';
import { Entity, EntityType } from './Entity';

export class Resource extends Entity {
  static readonly DEFAULT_ENERGY: number = 20;
  
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
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.updateMeshPosition();
    return this.mesh;
  }
}