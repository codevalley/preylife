/**
 * ResourceSystem - Handles resource spawning, decay, and seasonal blooms
 *
 * Priority: 90 (runs near the end)
 *
 * This system:
 * - Regenerates resources naturally
 * - Handles seasonal resource blooms
 * - Processes resource decay
 * - Manages resource population limits
 */

import { BaseSystem, SystemPriority } from './System';
import type { World } from '../core/World';
import { Resource } from '../entities/Resource';
import { Prey } from '../entities/Prey';
import { SimulationConfig } from '../config';
import { EventBus } from '../events/EventBus';

export class ResourceSystem extends BaseSystem {
  readonly name = 'ResourceSystem';
  readonly priority = SystemPriority.RESOURCE;

  // Season tracking
  private seasonLength: number = 90; // 90 days per season
  private resourceBloom: boolean = false;

  update(_deltaTime: number, world: World): void {
    // Handle resource decay first
    this.processResourceDecay(world);

    // Check for seasonal blooms (only on new days)
    this.checkSeasonalBloom(world);

    // Regenerate resources
    this.regenerateResources(world);

    // Enforce resource limits
    this.enforceResourceLimits(world);
  }

  /**
   * Process natural decay of resources based on their age
   */
  private processResourceDecay(world: World): void {
    if (!SimulationConfig.resources.limits.enableDecay) return;

    const resources = world.getMutableResources();
    for (let i = resources.length - 1; i >= 0; i--) {
      if (resources[i].shouldDecay(world.days)) {
        world.removeResource(resources[i]);
      }
    }
  }

  /**
   * Check if a seasonal resource bloom should occur
   */
  private checkSeasonalBloom(world: World): void {
    // Only check on day boundaries
    if (world.frameCount !== 0) return;

    // Check if we're at the start of a new season
    if (world.days > 0 && world.days % this.seasonLength === 0) {
      this.resourceBloom = true;

      // Emit bloom event
      EventBus.getInstance().emit({
        type: 'RESOURCE_BLOOM',
        timestamp: Date.now(),
        day: world.days,
        totalResources: world.resourceCount,
        clusterCount: SimulationConfig.resources.bloom.clusterCount
      });

      // Spawn bloom resources
      this.spawnBloomResources(world);

      // Set bloom duration
      const bloomDuration = SimulationConfig.resources.bloom.bloomDuration;
      setTimeout(() => {
        this.resourceBloom = false;
      }, bloomDuration * world.framesPerDay * 1000 / 60);
    }
  }

  /**
   * Spawn seasonal bloom resources in clusters
   */
  private spawnBloomResources(world: World): void {
    const config = SimulationConfig.resources.bloom;
    const limits = SimulationConfig.resources.limits;

    const maxResources = limits.maxCount;
    const enforcementThreshold = maxResources * limits.enforcementThreshold;
    const availableSpace = Math.max(0, enforcementThreshold - world.resourceCount);

    const desiredAmount = config.resourcesPerBloom;
    const actualAmount = Math.min(desiredAmount, availableSpace);

    if (actualAmount <= 0) return;

    const resourcesPerCluster = Math.floor(actualAmount / config.clusterCount);

    for (let cluster = 0; cluster < config.clusterCount; cluster++) {
      // Choose a random location for the cluster
      const centerX = Math.random() * world.width - world.width / 2;
      const centerY = Math.random() * world.height - world.height / 2;

      // Create a primary dense cluster at the center
      const primaryClusterSize = Math.floor(resourcesPerCluster * config.primaryDensity);
      for (let i = 0; i < primaryClusterSize; i++) {
        if (world.resourceCount >= enforcementThreshold) break;

        const radius = Math.random() * config.primaryClusterRadius;
        const angle = Math.random() * Math.PI * 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        const resource = new Resource(
          x, y,
          Resource.DEFAULT_ENERGY * config.primaryEnergyMultiplier
        );
        resource.creationTime = world.days;
        world.addResource(resource, 'natural');
      }

      // Create a secondary sparse cluster surrounding the primary cluster
      const secondaryClusterSize = resourcesPerCluster - primaryClusterSize;
      for (let i = 0; i < secondaryClusterSize; i++) {
        if (world.resourceCount >= enforcementThreshold) break;

        const radius = config.primaryClusterRadius +
          (Math.random() * (config.secondaryClusterRadius - config.primaryClusterRadius));
        const angle = Math.random() * Math.PI * 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        const resource = new Resource(
          x, y,
          Resource.DEFAULT_ENERGY * config.secondaryEnergyMultiplier
        );
        resource.creationTime = world.days;
        world.addResource(resource, 'natural');
      }
    }
  }

  /**
   * Regenerate resources naturally
   */
  private regenerateResources(world: World): void {
    const limits = SimulationConfig.resources.limits;
    const maxResources = limits.maxCount;
    const enforcementThreshold = maxResources * limits.enforcementThreshold;

    // Can we add more resources?
    const canAddResources = world.resourceCount < enforcementThreshold;

    // Only regenerate if prey exist and we're below the cap
    if (world.preyCount > 0 && canAddResources) {
      if (this.resourceBloom) {
        // During bloom, higher regeneration rate
        if (Math.random() < 0.1) {
          if (Math.random() < 0.3) {
            // Spawn a small cluster
            this.spawnResourceCluster(world, 3, 5, 30, 1.5);
          } else {
            // Spawn single resource
            this.spawnSingleResource(world, 1.5);
          }
        }
      } else {
        // Normal slow regeneration
        if (Math.random() < SimulationConfig.resources.regenerationChance) {
          this.spawnSingleResource(world, 1.0);
        }
      }

      // Bonus resources when prey population is critically low
      const initialPrey = SimulationConfig.initialPopulation.prey;
      if (world.preyCount < initialPrey * SimulationConfig.resources.emergencyRegenerationThreshold) {
        if (Math.random() < SimulationConfig.resources.emergencyRegenerationChance) {
          this.spawnResourceCluster(world, 2, 4, 25, SimulationConfig.resources.emergencyEnergyBonus);
        }
      }
    } else if (world.preyCount === 0) {
      // If no prey left, resources slowly vanish
      if (world.resourceCount > 0 && Math.random() < SimulationConfig.resources.decayChance) {
        const resources = world.getMutableResources();
        const randomIndex = Math.floor(Math.random() * resources.length);
        world.removeResource(resources[randomIndex]);
      }

      // Spontaneous prey spawning: safety net when prey go extinct + resources abundant
      this.trySpontaneousPreySpawn(world);
    }
  }

  /**
   * Spawn a single resource
   */
  private spawnSingleResource(world: World, energyMultiplier: number): void {
    const x = Math.random() * world.width - world.width / 2;
    const y = Math.random() * world.height - world.height / 2;
    const resource = new Resource(x, y, Resource.DEFAULT_ENERGY * energyMultiplier);
    resource.creationTime = world.days;
    world.addResource(resource, 'natural');
  }

  /**
   * Spawn a cluster of resources
   */
  private spawnResourceCluster(
    world: World,
    minSize: number,
    maxSize: number,
    radius: number,
    energyMultiplier: number
  ): void {
    const limits = SimulationConfig.resources.limits;
    const enforcementThreshold = limits.maxCount * limits.enforcementThreshold;

    const clusterSize = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
    const centerX = Math.random() * world.width - world.width / 2;
    const centerY = Math.random() * world.height - world.height / 2;

    for (let i = 0; i < clusterSize; i++) {
      if (world.resourceCount >= enforcementThreshold) break;

      const r = Math.random() * radius;
      const angle = Math.random() * Math.PI * 2;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;

      const resource = new Resource(x, y, Resource.DEFAULT_ENERGY * energyMultiplier);
      resource.creationTime = world.days;
      world.addResource(resource, 'natural');
    }
  }

  /**
   * Attempt spontaneous prey spawn when prey are extinct and resources are abundant.
   * Acts as abiogenesis — a very rare event to prevent permanent ecosystem collapse.
   */
  private trySpontaneousPreySpawn(world: World): void {
    const config = SimulationConfig.spontaneousPrey;
    if (!config.enabled) return;
    if (world.resourceCount < config.resourceThreshold) return;

    let spawned = 0;
    while (spawned < config.maxPerCycle && Math.random() < config.spawnChance) {
      // Pick a random resource position to spawn near
      const resources = world.getMutableResources();
      const source = resources[Math.floor(Math.random() * resources.length)];

      const prey = new Prey(
        source.position.x + (Math.random() * 20 - 10),
        source.position.y + (Math.random() * 20 - 10)
      );
      world.addPrey(prey, 'spawned');
      spawned++;
    }
  }

  /**
   * Enforce resource population limits
   */
  private enforceResourceLimits(world: World): void {
    const maxResources = SimulationConfig.resources.limits.maxCount;

    if (world.resourceCount > maxResources) {
      // Sort resources by age (oldest first) and remove excess
      const resources = world.getMutableResources();
      resources.sort((a, b) => a.creationTime - b.creationTime);

      const excessCount = world.resourceCount - maxResources;
      for (let i = 0; i < excessCount; i++) {
        world.removeResource(resources[0]);
      }
    }
  }

  /**
   * Spawn resources at a specific location (e.g., from creature death)
   */
  spawnResourcesAtLocation(
    world: World,
    x: number,
    y: number,
    count: number,
    spread: number
  ): void {
    const limits = SimulationConfig.resources.limits;
    const enforcementThreshold = limits.maxCount * limits.enforcementThreshold;
    const availableSpace = Math.max(0, enforcementThreshold - world.resourceCount);
    const actualCount = Math.min(count, availableSpace);

    for (let i = 0; i < actualCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * spread;
      const resourceX = x + Math.cos(angle) * distance;
      const resourceY = y + Math.sin(angle) * distance;

      const resource = new Resource(resourceX, resourceY);
      resource.creationTime = world.days;
      world.addResource(resource, 'death');
    }
  }

  get isBloomActive(): boolean {
    return this.resourceBloom;
  }

  reset(_world: World): void {
    this.resourceBloom = false;
  }
}
