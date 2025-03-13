import * as THREE from 'three';
import { Vector2 } from 'three';

export enum EntityType {
  RESOURCE = 'resource',
  PREY = 'prey',
  PREDATOR = 'predator'
}

export abstract class Entity {
  id: string;
  position: Vector2;
  mesh: THREE.Mesh | null = null;
  energy: number = 0;
  maxEnergy: number = 0;
  isDead: boolean = false;
  
  constructor(
    public type: EntityType,
    x: number = 0,
    y: number = 0
  ) {
    this.id = Math.random().toString(36).substring(2, 15);
    this.position = new Vector2(x, y);
  }
  
  abstract update(deltaTime: number): void;
  
  abstract createMesh(): THREE.Mesh;
  
  updateMeshPosition(): void {
    if (this.mesh) {
      this.mesh.position.set(this.position.x, this.position.y, 0);
      // Color updates will be handled in derived classes
    }
  }
  
  die(): void {
    this.isDead = true;
  }
}