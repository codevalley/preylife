import * as THREE from 'three';
import { Entity, EntityType } from './Entity';

import { SimulationConfig } from '../config';
import {
  createPlanktonMaterial,
  updatePlanktonUniforms,
} from '../rendering/shaders/PlanktonShader';

export class Resource extends Entity {
  static readonly DEFAULT_ENERGY: number = SimulationConfig.resources.defaultEnergy;

  // Shader time for animation (shared across all resources)
  private static globalTime: number = 0;

  // Time tracking for decay
  creationTime: number = 0; // Will be set by the simulation engine when spawned

  // Unique phase offset for varied animation
  private phaseOffset: number;

  constructor(x: number, y: number, energy: number = Resource.DEFAULT_ENERGY) {
    super(EntityType.RESOURCE, x, y);
    this.energy = energy;
    this.maxEnergy = energy;
    this.phaseOffset = Math.random() * Math.PI * 2; // Random phase for varied pulsing
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

  /**
   * Create organic plankton geometry.
   * Size varies with energy value.
   */
  private createPlanktonGeometry(): THREE.PlaneGeometry {
    // Base size adjusted by energy (higher energy = larger plankton)
    const baseSize = 2.5;
    const energyRatio = this.energy / Resource.DEFAULT_ENERGY;
    const size = baseSize * (0.7 + energyRatio * 0.6); // 0.7 - 1.3x base size

    return new THREE.PlaneGeometry(size, size);
  }

  createMesh(): THREE.Mesh {
    // Create organic plankton geometry
    const geometry = this.createPlanktonGeometry();

    // Calculate colors based on energy
    // Higher energy = more vibrant green-cyan
    const energyRatio = this.energy / this.maxEnergy;
    const baseColor = new THREE.Color();
    const glowColor = new THREE.Color();

    // Mix between dim green (low energy) and vibrant cyan-green (high energy)
    baseColor.setRGB(
      0.1 + energyRatio * 0.1,
      0.5 + energyRatio * 0.3,
      0.3 + energyRatio * 0.3
    );

    glowColor.setRGB(
      0.2,
      0.8 + energyRatio * 0.2,
      0.5 + energyRatio * 0.3
    );

    // Create plankton shader material
    const material = createPlanktonMaterial({
      uBaseColor: { value: baseColor },
      uGlowColor: { value: glowColor },
      uEnergy: { value: energyRatio },
      uPulseSpeed: { value: 1.0 + Math.random() * 0.5 }, // Varied pulse speeds
      uGlowIntensity: { value: 0.7 + energyRatio * 0.4 },
    });

    this.mesh = new THREE.Mesh(geometry, material);

    // Slight z-offset based on phase to add depth variation
    this.mesh.position.z = -10 + (this.phaseOffset / Math.PI) * 5;

    this.updateMeshPosition();
    return this.mesh;
  }

  updateMeshPosition(): void {
    super.updateMeshPosition();

    if (this.mesh) {
      // Update global time for shader animation
      Resource.globalTime += 0.008; // Slower than creatures for gentle effect

      // Update shader uniforms with phase offset for varied animation
      const material = this.mesh.material as THREE.ShaderMaterial;
      if (material.uniforms) {
        updatePlanktonUniforms(
          material,
          Resource.globalTime + this.phaseOffset,
          this.energy,
          this.maxEnergy
        );
      }
    }
  }
}
