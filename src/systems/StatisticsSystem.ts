/**
 * StatisticsSystem - Tracks and emits simulation statistics
 *
 * Priority: 100 (runs last)
 *
 * This system:
 * - Calculates average attributes for each species
 * - Tracks population milestones
 * - Detects extinction events
 * - Emits statistics events
 */

import { BaseSystem, SystemPriority } from './System';
import type { World } from '../core/World';
import { EventBus } from '../events/EventBus';
import type { GeneticAttributes } from '../entities/Creature';

export class StatisticsSystem extends BaseSystem {
  readonly name = 'StatisticsSystem';
  readonly priority = SystemPriority.STATISTICS;

  // Track last counts for extinction detection
  private lastPreyCount: number = 0;
  private lastPredatorCount: number = 0;

  update(_deltaTime: number, world: World): void {
    // Check for extinctions
    this.checkExtinctions(world);

    // Update last counts
    this.lastPreyCount = world.preyCount;
    this.lastPredatorCount = world.predatorCount;

    // Emit stats update on new days
    if (world.frameCount === 0 && world.days > 0) {
      this.emitStatsUpdate(world);
    }
  }

  private checkExtinctions(world: World): void {
    // Check if prey went extinct
    if (this.lastPreyCount > 0 && world.preyCount === 0) {
      EventBus.getInstance().emit({
        type: 'EXTINCTION',
        timestamp: Date.now(),
        day: world.days,
        species: 'prey',
        lastPopulation: this.lastPreyCount,
        preyCount: 0,
        predatorCount: world.predatorCount,
        resourceCount: world.resourceCount
      });

      console.info(`=== PREY EXTINCTION ===`);
      console.info(`Day: ${world.days}`);
      console.info(`Final Predator Count: ${world.predatorCount}`);
      console.info(`Final Resource Count: ${world.resourceCount}`);
    }

    // Check if predators went extinct
    if (this.lastPredatorCount > 0 && world.predatorCount === 0) {
      EventBus.getInstance().emit({
        type: 'EXTINCTION',
        timestamp: Date.now(),
        day: world.days,
        species: 'predator',
        lastPopulation: this.lastPredatorCount,
        preyCount: world.preyCount,
        predatorCount: 0,
        resourceCount: world.resourceCount
      });

      console.info(`=== PREDATOR EXTINCTION ===`);
      console.info(`Day: ${world.days}`);
      console.info(`Final Prey Count: ${world.preyCount}`);
      console.info(`Final Resource Count: ${world.resourceCount}`);
    }
  }

  private emitStatsUpdate(world: World): void {
    EventBus.getInstance().emit({
      type: 'STATS_UPDATED',
      timestamp: Date.now(),
      day: world.days,
      preyCount: world.preyCount,
      predatorCount: world.predatorCount,
      resourceCount: world.resourceCount,
      preyAttributes: this.calculateAverageAttributes(world.prey),
      predatorAttributes: this.calculateAverageAttributes(world.predators)
    });
  }

  private calculateAverageAttributes(
    creatures: readonly { attributes: GeneticAttributes }[]
  ): GeneticAttributes {
    if (creatures.length === 0) {
      return {
        strength: 0,
        stealth: 0,
        learnability: 0,
        longevity: 0
      };
    }

    const totals = creatures.reduce(
      (acc, creature) => ({
        strength: acc.strength + creature.attributes.strength,
        stealth: acc.stealth + creature.attributes.stealth,
        learnability: acc.learnability + creature.attributes.learnability,
        longevity: acc.longevity + creature.attributes.longevity
      }),
      { strength: 0, stealth: 0, learnability: 0, longevity: 0 }
    );

    return {
      strength: parseFloat((totals.strength / creatures.length).toFixed(2)),
      stealth: parseFloat((totals.stealth / creatures.length).toFixed(2)),
      learnability: parseFloat((totals.learnability / creatures.length).toFixed(2)),
      longevity: parseFloat((totals.longevity / creatures.length).toFixed(2))
    };
  }

  reset(_world: World): void {
    this.lastPreyCount = 0;
    this.lastPredatorCount = 0;
  }

  initialize(world: World): void {
    this.lastPreyCount = world.preyCount;
    this.lastPredatorCount = world.predatorCount;
  }
}
