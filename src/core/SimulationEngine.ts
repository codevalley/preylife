/**
 * SimulationEngine - Orchestrates all simulation systems
 *
 * This is the new systems-based simulation engine that replaces the
 * monolithic original. It manages the World, runs systems in priority
 * order, and provides the same public API for compatibility.
 */

import { World } from './World';
import type { System } from '../systems/System';
import {
  AgingSystem,
  MovementSystem,
  ForagingSystem,
  PredationSystem,
  ReproductionSystem,
  LearningSystem,
  ConversionSystem,
  ResourceSystem,
  StatisticsSystem
} from '../systems/index';
import { Entity } from '../entities/Entity';
import { Resource } from '../entities/Resource';
import { Prey } from '../entities/Prey';
import { Predator } from '../entities/Predator';
import { SimulationConfig } from '../config';
import { EventBus } from '../events/EventBus';
import type { GeneticAttributes } from '../entities/Creature';

// Attribute stats interface for API compatibility
interface AttributeStats {
  strength: number;
  stealth: number;
  learnability: number;
  longevity: number;
}

interface SimulationStats {
  resourceCount: number;
  preyCount: number;
  predatorCount: number;
  preyAttributes: AttributeStats;
  predatorAttributes: AttributeStats;
}

interface ExtinctionEvent {
  type: string;
  day: number;
  preyCount?: number;
  predatorCount?: number;
  resourceCount: number;
}

interface EvolutionEvent {
  fromType: string;
  toType: string;
  day: number;
  preyCount: number;
  predatorCount: number;
  resourceCount: number;
}

/** Fisher-Yates shuffle — mutates the array in place */
function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export class SimulationEngine {
  // Core components
  private world: World;
  private systems: System[] = [];

  // State
  private isRunning: boolean = false;

  // Configuration
  private initialResourceCount: number;
  private initialPreyCount: number;
  private initialPredatorCount: number;

  // Tracking (for API compatibility)
  private extinctionEvents: ExtinctionEvent[] = [];
  private evolutionEvents: EvolutionEvent[] = [];
  private totalSpawned = {
    prey: 0,
    predators: 0,
    resources: 0
  };

  // Resource system reference for bloom status
  private resourceSystem: ResourceSystem;

  constructor(
    initialResourceCount: number = SimulationConfig.initialPopulation.resources,
    initialPreyCount: number = SimulationConfig.initialPopulation.prey,
    initialPredatorCount: number = SimulationConfig.initialPopulation.predators
  ) {
    this.initialResourceCount = initialResourceCount;
    this.initialPreyCount = initialPreyCount;
    this.initialPredatorCount = initialPredatorCount;

    this.world = new World();
    this.resourceSystem = new ResourceSystem();

    // Initialize systems in priority order
    this.initializeSystems();

    // Subscribe to events for tracking
    this.subscribeToEvents();
  }

  private initializeSystems(): void {
    this.systems = [
      new AgingSystem(),
      new MovementSystem(),
      new PredationSystem(),
      new ForagingSystem(),
      new ReproductionSystem(),
      new LearningSystem(),
      new ConversionSystem(),
      this.resourceSystem,
      new StatisticsSystem()
    ];

    // Sort by priority
    this.systems.sort((a, b) => a.priority - b.priority);
  }

  private subscribeToEvents(): void {
    const eventBus = EventBus.getInstance();

    // Track extinction events
    eventBus.subscribe('EXTINCTION', (event) => {
      this.extinctionEvents.push({
        type: event.species,
        day: event.day,
        preyCount: event.preyCount,
        predatorCount: event.predatorCount,
        resourceCount: event.resourceCount
      });
    });

    // Track evolution events
    eventBus.subscribe('SPECIES_CONVERSION', (event) => {
      this.evolutionEvents.push({
        fromType: event.fromType,
        toType: event.toType,
        day: event.day,
        preyCount: this.world.preyCount,
        predatorCount: this.world.predatorCount,
        resourceCount: this.world.resourceCount
      });
    });
  }

  // ==================== Lifecycle ====================

  initialize(): void {
    // Clear world
    this.world.clear();

    // Reset tracking
    this.extinctionEvents = [];
    this.evolutionEvents = [];
    this.totalSpawned = { prey: 0, predators: 0, resources: 0 };

    // Spawn initial resources
    this.spawnInitialResources();

    // Spawn initial creatures
    this.spawnPrey(this.initialPreyCount, true);
    this.spawnPredators(this.initialPredatorCount, true);

    // Initialize all systems
    for (const system of this.systems) {
      if (system.initialize) {
        system.initialize(this.world);
      }
    }

    // Log initial conditions
    console.info("=== SIMULATION INITIALIZED ===");
    console.info("Initial Resources:", this.world.resourceCount);
    console.info("Initial Prey:", this.world.preyCount);
    console.info("Initial Predators:", this.world.predatorCount);

    // Emit reset event
    EventBus.getInstance().emit({
      type: 'SIMULATION_RESET',
      timestamp: Date.now(),
      day: 0,
      initialPrey: this.initialPreyCount,
      initialPredators: this.initialPredatorCount,
      initialResources: this.initialResourceCount
    });
  }

  private spawnInitialResources(): void {
    const clusterCount = SimulationConfig.clusteredSpawning.resources.clusterCount;
    const resourcesPerCluster = Math.floor(this.initialResourceCount / clusterCount);
    const maxResources = SimulationConfig.resources.limits.maxCount;
    const actualInitialCount = Math.min(this.initialResourceCount, maxResources);

    for (let cluster = 0; cluster < clusterCount; cluster++) {
      const centerX = Math.random() * this.world.width - this.world.width / 2;
      const centerY = Math.random() * this.world.height - this.world.height / 2;

      for (let i = 0; i < resourcesPerCluster; i++) {
        if (this.world.resourceCount >= actualInitialCount) break;

        const radius = Math.random() * 100;
        const angle = Math.random() * Math.PI * 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        const resource = new Resource(x, y);
        resource.creationTime = 0;
        this.world.addResource(resource, 'spawned');
        this.totalSpawned.resources++;
      }
    }

    // Add remaining resources randomly
    const remainingCount = actualInitialCount - this.world.resourceCount;
    for (let i = 0; i < remainingCount; i++) {
      const x = Math.random() * this.world.width - this.world.width / 2;
      const y = Math.random() * this.world.height - this.world.height / 2;

      const resource = new Resource(x, y);
      resource.creationTime = 0;
      this.world.addResource(resource, 'spawned');
      this.totalSpawned.resources++;
    }
  }

  start(): void {
    this.isRunning = true;
    EventBus.getInstance().emit({
      type: 'SIMULATION_STARTED',
      timestamp: Date.now(),
      day: this.world.days
    });
  }

  pause(): void {
    this.isRunning = false;
    EventBus.getInstance().emit({
      type: 'SIMULATION_PAUSED',
      timestamp: Date.now(),
      day: this.world.days
    });
  }

  reset(): void {
    this.initialResourceCount = SimulationConfig.initialPopulation.resources;
    this.initialPreyCount = SimulationConfig.initialPopulation.prey;
    this.initialPredatorCount = SimulationConfig.initialPopulation.predators;

    // Reset all systems
    for (const system of this.systems) {
      if (system.reset) {
        system.reset(this.world);
      }
    }

    this.initialize();
  }

  // ==================== Update Loop ====================

  async update(deltaTime: number): Promise<void> {
    if (!this.isRunning) return;

    // Shuffle update order each frame to remove deterministic processing bias
    const shuffledPrey = shuffleArray([...this.world.prey]);
    const shuffledPredators = shuffleArray([...this.world.predators]);

    // Update all prey with context (for existing behavior)
    for (const prey of shuffledPrey) {
      const nearbyPrey = this.world.queryPrey(
        prey.position.x,
        prey.position.y,
        50,
        prey
      );
      prey.update(
        deltaTime,
        [...this.world.resources],
        [...this.world.predators],
        nearbyPrey
      );
    }

    // Update all predators with context
    for (const predator of shuffledPredators) {
      const nearbyPredators = this.world.queryPredators(
        predator.position.x,
        predator.position.y,
        50,
        predator
      );
      predator.update(deltaTime, [...this.world.prey], nearbyPredators);
    }

    // Run all systems in priority order
    for (const system of this.systems) {
      if (!system.enabled) continue;

      try {
        // Handle async systems (like ConversionSystem)
        const result = system.update(deltaTime, this.world) as void | Promise<void>;
        if (result && typeof (result as Promise<void>).then === 'function') {
          await result;
        }
      } catch (error) {
        console.error(`Error in ${system.name}:`, error);
      }
    }

    // Remove dead entities and spawn resources from death
    const dead = this.world.removeDeadEntities();
    for (const prey of dead.prey) {
      this.resourceSystem.spawnResourcesAtLocation(
        this.world,
        prey.position.x,
        prey.position.y,
        Math.ceil(prey.maxEnergy * 0.7 / Resource.DEFAULT_ENERGY),
        20
      );
    }
    for (const predator of dead.predators) {
      this.resourceSystem.spawnResourcesAtLocation(
        this.world,
        predator.position.x,
        predator.position.y,
        Math.ceil(predator.maxEnergy * 0.7 / Resource.DEFAULT_ENERGY),
        30
      );
    }

    // Advance time
    const newDay = this.world.advanceTime();
    if (newDay) {
      EventBus.getInstance().emit({
        type: 'DAY_CHANGED',
        timestamp: Date.now(),
        day: this.world.days,
        newDay: this.world.days
      });
    }
  }

  // ==================== Spawning API ====================

  spawnPrey(count: number = 10, clustered: boolean = true): void {
    if (clustered) {
      const clusterTypes = [
        { attributes: { strength: 0.9, stealth: 0.1, learnability: 0.3, longevity: 0.4 }, energyMod: 1.2 },
        { attributes: { strength: 0.1, stealth: 0.9, learnability: 0.3, longevity: 0.4 }, energyMod: 0.9 },
        { attributes: { strength: 0.5, stealth: 0.5, learnability: 0.1, longevity: 0.8 }, energyMod: 1.1 },
        { attributes: { strength: 0.5, stealth: 0.5, learnability: 0.5, longevity: 0.5 }, energyMod: 1.0 },
        { attributes: { strength: 0.4, stealth: 0.4, learnability: 0.9, longevity: 0.3 }, energyMod: 0.8 }
      ];

      const clusterCount = Math.min(clusterTypes.length, count > 25 ? 5 : 3);
      const perCluster = Math.floor(count / clusterCount);
      const remainder = count % clusterCount;

      for (let cluster = 0; cluster < clusterCount; cluster++) {
        const centerX = Math.random() * this.world.width - this.world.width / 2;
        const centerY = Math.random() * this.world.height - this.world.height / 2;
        const clusterType = clusterTypes[cluster];
        const clusterSize = cluster < remainder ? perCluster + 1 : perCluster;

        for (let i = 0; i < clusterSize; i++) {
          const r = Math.random() * 80;
          const angle = Math.random() * Math.PI * 2;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;

          const attrs: GeneticAttributes = {
            strength: this.clamp(clusterType.attributes.strength + (Math.random() * 0.2 - 0.1), 0.05, 0.95),
            stealth: this.clamp(clusterType.attributes.stealth + (Math.random() * 0.2 - 0.1), 0.05, 0.95),
            learnability: this.clamp(clusterType.attributes.learnability + (Math.random() * 0.2 - 0.1), 0.05, 0.95),
            longevity: this.clamp(clusterType.attributes.longevity + (Math.random() * 0.2 - 0.1), 0.05, 0.95)
          };

          const energy = Prey.DEFAULT_MAX_ENERGY * clusterType.energyMod * (0.85 + Math.random() * 0.3);
          const prey = new Prey(x, y, energy, attrs);
          this.world.addPrey(prey, 'spawned');
          this.totalSpawned.prey++;
        }
      }
    } else {
      for (let i = 0; i < count; i++) {
        const x = Math.random() * this.world.width - this.world.width / 2;
        const y = Math.random() * this.world.height - this.world.height / 2;
        const prey = new Prey(x, y);
        this.world.addPrey(prey, 'spawned');
        this.totalSpawned.prey++;
      }
    }
  }

  spawnPredators(count: number = 5, clustered: boolean = true): void {
    if (clustered) {
      const clusterTypes = [
        { attributes: { strength: 0.9, stealth: 0.1, learnability: 0.3, longevity: 0.5 }, energyMod: 1.2 },
        { attributes: { strength: 0.3, stealth: 0.9, learnability: 0.4, longevity: 0.4 }, energyMod: 0.9 },
        { attributes: { strength: 0.6, stealth: 0.4, learnability: 0.1, longevity: 0.9 }, energyMod: 1.15 },
        { attributes: { strength: 0.5, stealth: 0.5, learnability: 0.5, longevity: 0.5 }, energyMod: 1.0 }
      ];

      const clusterCount = Math.min(clusterTypes.length, Math.max(2, count > 8 ? 4 : count > 4 ? 3 : 2));
      const perCluster = Math.floor(count / clusterCount);
      const remainder = count % clusterCount;

      for (let cluster = 0; cluster < clusterCount; cluster++) {
        const centerX = Math.random() * this.world.width - this.world.width / 2;
        const centerY = Math.random() * this.world.height - this.world.height / 2;
        const clusterType = clusterTypes[cluster];
        const clusterSize = cluster < remainder ? perCluster + 1 : perCluster;

        for (let i = 0; i < clusterSize; i++) {
          const r = Math.random() * 60;
          const angle = Math.random() * Math.PI * 2;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;

          const attrs: GeneticAttributes = {
            strength: this.clamp(clusterType.attributes.strength + (Math.random() * 0.2 - 0.1), 0.05, 0.95),
            stealth: this.clamp(clusterType.attributes.stealth + (Math.random() * 0.2 - 0.1), 0.05, 0.95),
            learnability: this.clamp(clusterType.attributes.learnability + (Math.random() * 0.2 - 0.1), 0.05, 0.95),
            longevity: this.clamp(clusterType.attributes.longevity + (Math.random() * 0.2 - 0.1), 0.05, 0.95)
          };

          const energy = Predator.DEFAULT_MAX_ENERGY * clusterType.energyMod * (0.85 + Math.random() * 0.3);
          const predator = new Predator(x, y, energy, attrs);
          this.world.addPredator(predator, 'spawned');
          this.totalSpawned.predators++;
        }
      }
    } else {
      for (let i = 0; i < count; i++) {
        const x = Math.random() * this.world.width - this.world.width / 2;
        const y = Math.random() * this.world.height - this.world.height / 2;
        const predator = new Predator(x, y);
        this.world.addPredator(predator, 'spawned');
        this.totalSpawned.predators++;
      }
    }
  }

  spawnResources(count: number = 20, fromManualSpawn: boolean = false): void {
    const maxResources = SimulationConfig.resources.limits.maxCount;
    const enforcementThreshold = maxResources * SimulationConfig.resources.limits.enforcementThreshold;
    const availableSpace = Math.max(0, enforcementThreshold - this.world.resourceCount);
    const actualCount = Math.min(count, availableSpace);

    for (let i = 0; i < actualCount; i++) {
      const x = Math.random() * this.world.width - this.world.width / 2;
      const y = Math.random() * this.world.height - this.world.height / 2;
      const resource = new Resource(x, y);
      resource.creationTime = this.world.days;
      this.world.addResource(resource, fromManualSpawn ? 'spawned' : 'natural');
      this.totalSpawned.resources++;
    }
  }

  // ==================== Getters (API compatibility) ====================

  getStats(): SimulationStats {
    return {
      resourceCount: this.world.resourceCount,
      preyCount: this.world.preyCount,
      predatorCount: this.world.predatorCount,
      preyAttributes: this.calculateAverageAttributes([...this.world.prey]),
      predatorAttributes: this.calculateAverageAttributes([...this.world.predators])
    };
  }

  private calculateAverageAttributes(creatures: { attributes: GeneticAttributes }[]): AttributeStats {
    if (creatures.length === 0) {
      return { strength: 0, stealth: 0, learnability: 0, longevity: 0 };
    }

    const totals = creatures.reduce((acc, creature) => ({
      strength: acc.strength + creature.attributes.strength,
      stealth: acc.stealth + creature.attributes.stealth,
      learnability: acc.learnability + creature.attributes.learnability,
      longevity: acc.longevity + creature.attributes.longevity
    }), { strength: 0, stealth: 0, learnability: 0, longevity: 0 });

    return {
      strength: parseFloat((totals.strength / creatures.length).toFixed(2)),
      stealth: parseFloat((totals.stealth / creatures.length).toFixed(2)),
      learnability: parseFloat((totals.learnability / creatures.length).toFixed(2)),
      longevity: parseFloat((totals.longevity / creatures.length).toFixed(2))
    };
  }

  getAllEntities(): Entity[] {
    return this.world.allEntities;
  }

  getDays(): number {
    return this.world.days;
  }

  getExtinctionEvents(): ExtinctionEvent[] {
    return [...this.extinctionEvents];
  }

  getEvolutionEvents(): EvolutionEvent[] {
    return [...this.evolutionEvents];
  }

  getTotalSpawned(): { prey: number; predators: number; resources: number } {
    // Return lifetime total (all births: reproduction + conversion + spawned)
    const stats = this.world.statistics;
    return {
      prey: stats.prey.births.reproduction + stats.prey.births.conversion + stats.prey.births.spawned,
      predators: stats.predators.births.reproduction + stats.predators.births.conversion + stats.predators.births.spawned,
      resources: stats.resources.fromCreatureDeath + stats.resources.natural + stats.resources.spawned
    };
  }

  isResourceBloom(): boolean {
    return this.resourceSystem.isBloomActive;
  }

  getStatistics() {
    const stats = this.world.statistics;
    const totalBirthsPrey = stats.prey.births.reproduction + stats.prey.births.conversion + stats.prey.births.spawned;
    const totalBirthsPredator = stats.predators.births.reproduction + stats.predators.births.conversion + stats.predators.births.spawned;

    return {
      prey: {
        medianLifespan: this.calculateMedian(stats.prey.lifespans),
        deathByHunting: stats.prey.deaths.total > 0
          ? (stats.prey.deaths.hunting / stats.prey.deaths.total * 100).toFixed(1) + '%'
          : '0%',
        deathByStarvation: stats.prey.deaths.total > 0
          ? (stats.prey.deaths.starvation / stats.prey.deaths.total * 100).toFixed(1) + '%'
          : '0%',
        birthByReproduction: totalBirthsPrey > 0
          ? (stats.prey.births.reproduction / totalBirthsPrey * 100).toFixed(1) + '%'
          : '0%',
        birthByConversion: totalBirthsPrey > 0
          ? (stats.prey.births.conversion / totalBirthsPrey * 100).toFixed(1) + '%'
          : '0%',
        birthBySpawning: totalBirthsPrey > 0
          ? (stats.prey.births.spawned / totalBirthsPrey * 100).toFixed(1) + '%'
          : '0%'
      },
      predators: {
        medianLifespan: this.calculateMedian(stats.predators.lifespans),
        birthByReproduction: totalBirthsPredator > 0
          ? (stats.predators.births.reproduction / totalBirthsPredator * 100).toFixed(1) + '%'
          : '0%',
        birthByConversion: totalBirthsPredator > 0
          ? (stats.predators.births.conversion / totalBirthsPredator * 100).toFixed(1) + '%'
          : '0%',
        birthBySpawning: totalBirthsPredator > 0
          ? (stats.predators.births.spawned / totalBirthsPredator * 100).toFixed(1) + '%'
          : '0%',
        medianPreyConsumed: stats.predators.deaths.total > 0
          ? (stats.predators.preyConsumed / stats.predators.deaths.total).toFixed(1)
          : '0'
      },
      resources: {
        fromCreatureDeath: stats.resources.fromCreatureDeath,
        natural: stats.resources.natural,
        spawned: stats.resources.spawned,
        fromCreatureDeathPercentage: this.totalSpawned.resources > 0
          ? (stats.resources.fromCreatureDeath / this.totalSpawned.resources * 100).toFixed(1) + '%'
          : '0%',
        naturalPercentage: this.totalSpawned.resources > 0
          ? (stats.resources.natural / this.totalSpawned.resources * 100).toFixed(1) + '%'
          : '0%',
        spawnedPercentage: this.totalSpawned.resources > 0
          ? (stats.resources.spawned / this.totalSpawned.resources * 100).toFixed(1) + '%'
          : '0%'
      }
    };
  }

  private calculateMedian(values: number[]): string {
    if (values.length === 0) return '0';
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return ((sorted[middle - 1] + sorted[middle]) / 2).toFixed(1);
    }
    return sorted[middle].toFixed(1);
  }

  getReproductionStats(): { prey: { ready: number; total: number }; predator: { ready: number; total: number } } {
    let preyReady = 0;
    let predatorReady = 0;

    for (const prey of this.world.prey) {
      if (prey.canReproduce()) preyReady++;
    }

    for (const predator of this.world.predators) {
      if (predator.canReproduce()) predatorReady++;
    }

    return {
      prey: { ready: preyReady, total: this.world.preyCount },
      predator: { ready: predatorReady, total: this.world.predatorCount }
    };
  }

  // ==================== Utilities ====================

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  // ==================== World Access ====================

  getWorld(): World {
    return this.world;
  }
}
