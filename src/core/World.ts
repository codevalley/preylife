/**
 * World - Central entity container with spatial indexing
 *
 * The World maintains all simulation entities and provides efficient
 * spatial queries through the SpatialHash. It serves as the central
 * data store that all systems operate on.
 */

import { Vector3 } from 'three';
import { Entity, EntityType } from '../entities/Entity';
import { Resource } from '../entities/Resource';
import { Prey } from '../entities/Prey';
import { Predator } from '../entities/Predator';
import { Creature } from '../entities/Creature';
import { SpatialHash, SpatialEntity } from '../spatial/SpatialHash';
import { SimulationConfig } from '../config';

/**
 * Adapter to make Entity compatible with SpatialHash
 */
interface SpatialEntityAdapter extends SpatialEntity {
  entity: Entity;
}

function createSpatialAdapter(entity: Entity): SpatialEntityAdapter {
  return {
    id: entity.id,
    get position() {
      // Convert Vector2 to Vector3 for SpatialHash
      return new Vector3(entity.position.x, entity.position.y, 0);
    },
    entity
  };
}

/**
 * World class - central container for all simulation entities
 */
export class World {
  // Entity collections
  private _resources: Resource[] = [];
  private _prey: Prey[] = [];
  private _predators: Predator[] = [];

  // Spatial indices for efficient queries
  private resourceSpatial: SpatialHash<SpatialEntityAdapter>;
  private preySpatial: SpatialHash<SpatialEntityAdapter>;
  private predatorSpatial: SpatialHash<SpatialEntityAdapter>;

  // Entity adapters for spatial hash
  private entityAdapters: Map<string, SpatialEntityAdapter> = new Map();

  // Environment bounds
  private _width: number;
  private _height: number;

  // Time tracking
  private _days: number = 0;
  private _frameCount: number = 0;
  private _framesPerDay: number = 10;

  // Statistics tracking
  private _statistics = {
    prey: {
      deaths: { hunting: 0, starvation: 0, age: 0, total: 0 },
      births: { reproduction: 0, conversion: 0, spawned: 0 },
      lifespans: [] as number[]
    },
    predators: {
      deaths: { starvation: 0, age: 0, total: 0 },
      births: { reproduction: 0, conversion: 0, spawned: 0 },
      preyConsumed: 0,
      lifespans: [] as number[]
    },
    resources: {
      fromCreatureDeath: 0,
      natural: 0,
      spawned: 0
    }
  };

  constructor() {
    this._width = SimulationConfig.environment.width;
    this._height = SimulationConfig.environment.height;

    // Cell size based on max detection range
    const cellSize = Math.max(
      SimulationConfig.creatures.interactionRanges.preyPredatorDetectionRange,
      SimulationConfig.creatures.interactionRanges.preyDetectionRange,
      100
    );

    this.resourceSpatial = new SpatialHash<SpatialEntityAdapter>(cellSize);
    this.preySpatial = new SpatialHash<SpatialEntityAdapter>(cellSize);
    this.predatorSpatial = new SpatialHash<SpatialEntityAdapter>(cellSize);
  }

  // ==================== Entity Accessors ====================

  get resources(): readonly Resource[] {
    return this._resources;
  }

  get prey(): readonly Prey[] {
    return this._prey;
  }

  get predators(): readonly Predator[] {
    return this._predators;
  }

  get allEntities(): Entity[] {
    return [...this._resources, ...this._prey, ...this._predators];
  }

  get allCreatures(): Creature[] {
    return [...this._prey, ...this._predators];
  }

  // ==================== Environment ====================

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  // ==================== Time ====================

  get days(): number {
    return this._days;
  }

  get frameCount(): number {
    return this._frameCount;
  }

  get framesPerDay(): number {
    return this._framesPerDay;
  }

  /**
   * Advance the frame counter and day if needed
   * @returns true if a new day started
   */
  advanceTime(): boolean {
    this._frameCount++;
    if (this._frameCount >= this._framesPerDay) {
      this._days++;
      this._frameCount = 0;
      return true;
    }
    return false;
  }

  // ==================== Statistics ====================

  get statistics() {
    return this._statistics;
  }

  // ==================== Entity Management ====================

  /**
   * Add a resource to the world
   */
  addResource(resource: Resource, source: 'spawned' | 'natural' | 'death' = 'natural'): void {
    this._resources.push(resource);
    const adapter = createSpatialAdapter(resource);
    this.entityAdapters.set(resource.id, adapter);
    this.resourceSpatial.insert(adapter);

    // Track statistics
    switch (source) {
      case 'spawned':
        this._statistics.resources.spawned++;
        break;
      case 'natural':
        this._statistics.resources.natural++;
        break;
      case 'death':
        this._statistics.resources.fromCreatureDeath++;
        break;
    }
  }

  /**
   * Add a prey to the world
   */
  addPrey(prey: Prey, source: 'spawned' | 'reproduction' | 'conversion' = 'reproduction'): void {
    this._prey.push(prey);
    const adapter = createSpatialAdapter(prey);
    this.entityAdapters.set(prey.id, adapter);
    this.preySpatial.insert(adapter);

    // Track statistics
    switch (source) {
      case 'spawned':
        this._statistics.prey.births.spawned++;
        break;
      case 'reproduction':
        this._statistics.prey.births.reproduction++;
        break;
      case 'conversion':
        this._statistics.prey.births.conversion++;
        break;
    }
  }

  /**
   * Add a predator to the world
   */
  addPredator(predator: Predator, source: 'spawned' | 'reproduction' | 'conversion' = 'reproduction'): void {
    this._predators.push(predator);
    const adapter = createSpatialAdapter(predator);
    this.entityAdapters.set(predator.id, adapter);
    this.predatorSpatial.insert(adapter);

    // Track statistics
    switch (source) {
      case 'spawned':
        this._statistics.predators.births.spawned++;
        break;
      case 'reproduction':
        this._statistics.predators.births.reproduction++;
        break;
      case 'conversion':
        this._statistics.predators.births.conversion++;
        break;
    }
  }

  /**
   * Remove a resource from the world
   */
  removeResource(resource: Resource): void {
    const index = this._resources.indexOf(resource);
    if (index !== -1) {
      this._resources.splice(index, 1);
      const adapter = this.entityAdapters.get(resource.id);
      if (adapter) {
        this.resourceSpatial.remove(adapter);
        this.entityAdapters.delete(resource.id);
      }
    }
  }

  /**
   * Remove a prey from the world
   */
  removePrey(prey: Prey, cause: 'hunting' | 'starvation' | 'age' = 'starvation'): void {
    const index = this._prey.indexOf(prey);
    if (index !== -1) {
      this._prey.splice(index, 1);
      const adapter = this.entityAdapters.get(prey.id);
      if (adapter) {
        this.preySpatial.remove(adapter);
        this.entityAdapters.delete(prey.id);
      }

      // Track statistics
      this._statistics.prey.deaths.total++;
      switch (cause) {
        case 'hunting':
          this._statistics.prey.deaths.hunting++;
          break;
        case 'starvation':
          this._statistics.prey.deaths.starvation++;
          break;
        case 'age':
          this._statistics.prey.deaths.age++;
          break;
      }
      if (prey.age > 0) {
        this._statistics.prey.lifespans.push(prey.age);
      }
    }
  }

  /**
   * Remove a predator from the world
   */
  removePredator(predator: Predator, cause: 'starvation' | 'age' = 'starvation'): void {
    const index = this._predators.indexOf(predator);
    if (index !== -1) {
      this._predators.splice(index, 1);
      const adapter = this.entityAdapters.get(predator.id);
      if (adapter) {
        this.predatorSpatial.remove(adapter);
        this.entityAdapters.delete(predator.id);
      }

      // Track statistics
      this._statistics.predators.deaths.total++;
      switch (cause) {
        case 'starvation':
          this._statistics.predators.deaths.starvation++;
          break;
        case 'age':
          this._statistics.predators.deaths.age++;
          break;
      }
      if (predator.age > 0) {
        this._statistics.predators.lifespans.push(predator.age);
      }
    }
  }

  /**
   * Update spatial index for an entity that has moved
   */
  updateEntityPosition(entity: Entity): void {
    const adapter = this.entityAdapters.get(entity.id);
    if (!adapter) return;

    switch (entity.type) {
      case EntityType.RESOURCE:
        this.resourceSpatial.update(adapter);
        break;
      case EntityType.PREY:
        this.preySpatial.update(adapter);
        break;
      case EntityType.PREDATOR:
        this.predatorSpatial.update(adapter);
        break;
    }
  }

  // ==================== Spatial Queries ====================

  /**
   * Find resources within a radius of a position
   */
  queryResources(x: number, y: number, radius: number): Resource[] {
    return this.resourceSpatial.query(x, y, radius)
      .map(adapter => adapter.entity as Resource);
  }

  /**
   * Find prey within a radius of a position
   */
  queryPrey(x: number, y: number, radius: number, exclude?: Prey): Prey[] {
    const excludeAdapter = exclude ? this.entityAdapters.get(exclude.id) : undefined;
    return this.preySpatial.query(x, y, radius, excludeAdapter)
      .map(adapter => adapter.entity as Prey);
  }

  /**
   * Find predators within a radius of a position
   */
  queryPredators(x: number, y: number, radius: number, exclude?: Predator): Predator[] {
    const excludeAdapter = exclude ? this.entityAdapters.get(exclude.id) : undefined;
    return this.predatorSpatial.query(x, y, radius, excludeAdapter)
      .map(adapter => adapter.entity as Predator);
  }

  /**
   * Find the nearest resource to a position
   */
  findNearestResource(x: number, y: number, maxRadius: number): Resource | null {
    const result = this.resourceSpatial.findNearest(x, y, maxRadius);
    return result ? result.entity.entity as Resource : null;
  }

  /**
   * Find the nearest prey to a position
   */
  findNearestPrey(x: number, y: number, maxRadius: number, exclude?: Prey): Prey | null {
    const excludeAdapter = exclude ? this.entityAdapters.get(exclude.id) : undefined;
    const result = this.preySpatial.findNearest(x, y, maxRadius, excludeAdapter);
    return result ? result.entity.entity as Prey : null;
  }

  /**
   * Find the nearest predator to a position
   */
  findNearestPredator(x: number, y: number, maxRadius: number, exclude?: Predator): Predator | null {
    const excludeAdapter = exclude ? this.entityAdapters.get(exclude.id) : undefined;
    const result = this.predatorSpatial.findNearest(x, y, maxRadius, excludeAdapter);
    return result ? result.entity.entity as Predator : null;
  }

  // ==================== Bulk Operations ====================

  /**
   * Remove all dead entities from the world
   * @returns Objects containing arrays of removed entities
   */
  removeDeadEntities(): { prey: Prey[]; predators: Predator[]; resources: Resource[] } {
    const deadPrey: Prey[] = [];
    const deadPredators: Predator[] = [];
    const deadResources: Resource[] = [];

    // Collect dead entities
    for (const prey of this._prey) {
      if (prey.isDead) {
        deadPrey.push(prey);
      }
    }

    for (const predator of this._predators) {
      if (predator.isDead) {
        deadPredators.push(predator);
      }
    }

    for (const resource of this._resources) {
      if (resource.isDead) {
        deadResources.push(resource);
      }
    }

    // Remove them (statistics are tracked in remove methods)
    for (const prey of deadPrey) {
      const cause = prey.energy <= 0 ? 'starvation' : 'age';
      this.removePrey(prey, cause);
    }

    for (const predator of deadPredators) {
      const cause = predator.energy <= 0 ? 'starvation' : 'age';
      this.removePredator(predator, cause);
    }

    for (const resource of deadResources) {
      this.removeResource(resource);
    }

    return { prey: deadPrey, predators: deadPredators, resources: deadResources };
  }

  /**
   * Clear all entities and reset the world
   */
  clear(): void {
    this._resources = [];
    this._prey = [];
    this._predators = [];

    this.resourceSpatial.clear();
    this.preySpatial.clear();
    this.predatorSpatial.clear();
    this.entityAdapters.clear();

    this._days = 0;
    this._frameCount = 0;

    // Reset statistics
    this._statistics = {
      prey: {
        deaths: { hunting: 0, starvation: 0, age: 0, total: 0 },
        births: { reproduction: 0, conversion: 0, spawned: 0 },
        lifespans: []
      },
      predators: {
        deaths: { starvation: 0, age: 0, total: 0 },
        births: { reproduction: 0, conversion: 0, spawned: 0 },
        preyConsumed: 0,
        lifespans: []
      },
      resources: {
        fromCreatureDeath: 0,
        natural: 0,
        spawned: 0
      }
    };
  }

  // ==================== Population Counts ====================

  get resourceCount(): number {
    return this._resources.length;
  }

  get preyCount(): number {
    return this._prey.length;
  }

  get predatorCount(): number {
    return this._predators.length;
  }

  get totalCreatureCount(): number {
    return this._prey.length + this._predators.length;
  }

  // ==================== Utilities ====================

  /**
   * Get a mutable reference to prey array (for systems that need to iterate and modify)
   */
  getMutablePrey(): Prey[] {
    return this._prey;
  }

  /**
   * Get a mutable reference to predators array
   */
  getMutablePredators(): Predator[] {
    return this._predators;
  }

  /**
   * Get a mutable reference to resources array
   */
  getMutableResources(): Resource[] {
    return this._resources;
  }

  /**
   * Track that a predator consumed prey
   */
  recordPreyConsumed(): void {
    this._statistics.predators.preyConsumed++;
  }

  /**
   * Get spatial hash statistics for debugging
   */
  getSpatialStats() {
    return {
      resources: this.resourceSpatial.getStats(),
      prey: this.preySpatial.getStats(),
      predators: this.predatorSpatial.getStats()
    };
  }
}
