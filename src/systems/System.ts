/**
 * System - Base interface for all simulation systems
 *
 * Systems are the core building blocks of the simulation engine.
 * Each system handles a specific aspect of the simulation (movement,
 * predation, reproduction, etc.) and operates on entities in the World.
 */

import type { World } from '../core/World';

/**
 * Base interface for all simulation systems
 */
export interface System {
  /** Unique name for this system */
  readonly name: string;

  /**
   * Priority determines execution order (lower = earlier)
   * Standard priorities:
   * - 10: AgingSystem (age updates, death checks)
   * - 20: MovementSystem (position updates)
   * - 30: BehaviorSystem (AI decisions)
   * - 40: PredationSystem (hunting)
   * - 50: ForagingSystem (resource consumption)
   * - 60: ReproductionSystem
   * - 70: LearningSystem
   * - 80: ConversionSystem
   * - 90: ResourceSystem
   * - 100: StatisticsSystem
   */
  readonly priority: number;

  /**
   * Whether this system is currently enabled
   */
  enabled: boolean;

  /**
   * Update the system for one frame
   * @param deltaTime - Time elapsed since last update in seconds
   * @param world - The world containing all entities
   */
  update(deltaTime: number, world: World): void;

  /**
   * Initialize the system (called once at simulation start)
   */
  initialize?(world: World): void;

  /**
   * Clean up the system (called on simulation reset)
   */
  reset?(world: World): void;

  /**
   * Called when the simulation is paused
   */
  onPause?(): void;

  /**
   * Called when the simulation is resumed
   */
  onResume?(): void;
}

/**
 * Abstract base class providing common system functionality
 */
export abstract class BaseSystem implements System {
  abstract readonly name: string;
  abstract readonly priority: number;

  enabled: boolean = true;

  abstract update(deltaTime: number, world: World): void;

  initialize(_world: World): void {
    // Override in subclass if needed
  }

  reset(_world: World): void {
    // Override in subclass if needed
  }

  onPause(): void {
    // Override in subclass if needed
  }

  onResume(): void {
    // Override in subclass if needed
  }
}

/**
 * System priorities as constants for consistency
 */
export const SystemPriority = {
  AGING: 10,
  MOVEMENT: 20,
  BEHAVIOR: 30,
  PREDATION: 40,
  FORAGING: 50,
  REPRODUCTION: 60,
  LEARNING: 70,
  CONVERSION: 80,
  RESOURCE: 90,
  STATISTICS: 100
} as const;
