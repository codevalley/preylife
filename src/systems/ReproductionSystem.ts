/**
 * ReproductionSystem - Handles creature reproduction
 *
 * Priority: 60 (runs after foraging)
 *
 * This system:
 * - Checks reproduction eligibility for all creatures
 * - Creates offspring with genetic inheritance
 * - Handles mutation during reproduction
 * - Emits reproduction events
 */

import { BaseSystem, SystemPriority } from './System';
import type { World } from '../core/World';
import { EventBus } from '../events/EventBus';
import type { Prey } from '../entities/Prey';
import type { Predator } from '../entities/Predator';

export class ReproductionSystem extends BaseSystem {
  readonly name = 'ReproductionSystem';
  readonly priority = SystemPriority.REPRODUCTION;

  update(_deltaTime: number, world: World): void {
    // Handle prey reproduction
    this.processPreyReproduction(world);

    // Handle predator reproduction
    this.processPredatorReproduction(world);
  }

  private processPreyReproduction(world: World): void {
    const newPrey: Prey[] = [];

    for (const prey of world.prey) {
      if (prey.canReproduce()) {
        const offspring = prey.reproduce();
        newPrey.push(offspring);

        // Emit reproduction event
        EventBus.getInstance().emit({
          type: 'REPRODUCTION',
          timestamp: Date.now(),
          day: world.days,
          entityType: 'prey',
          parentId: prey.id,
          offspringId: offspring.id,
          parentAttributes: { ...prey.attributes },
          offspringAttributes: { ...offspring.attributes },
          mutated: this.checkIfMutated(prey, offspring)
        });
      }
    }

    // Add new prey to the world
    for (const prey of newPrey) {
      world.addPrey(prey, 'reproduction');
    }

    // Emit birth events
    if (newPrey.length > 0) {
      EventBus.getInstance().emit({
        type: 'ENTITY_CREATED',
        timestamp: Date.now(),
        day: world.days,
        entityType: 'prey',
        entityId: newPrey[0].id,
        position: { x: newPrey[0].position.x, y: newPrey[0].position.y },
        cause: 'reproduction',
        parentId: undefined
      });
    }
  }

  private processPredatorReproduction(world: World): void {
    const newPredators: Predator[] = [];

    for (const predator of world.predators) {
      if (predator.canReproduce()) {
        const offspring = predator.reproduce();
        newPredators.push(offspring);

        // Emit reproduction event
        EventBus.getInstance().emit({
          type: 'REPRODUCTION',
          timestamp: Date.now(),
          day: world.days,
          entityType: 'predator',
          parentId: predator.id,
          offspringId: offspring.id,
          parentAttributes: { ...predator.attributes },
          offspringAttributes: { ...offspring.attributes },
          mutated: this.checkIfMutated(predator, offspring)
        });
      }
    }

    // Add new predators to the world
    for (const predator of newPredators) {
      world.addPredator(predator, 'reproduction');
    }

    // Emit birth events
    if (newPredators.length > 0) {
      EventBus.getInstance().emit({
        type: 'ENTITY_CREATED',
        timestamp: Date.now(),
        day: world.days,
        entityType: 'predator',
        entityId: newPredators[0].id,
        position: { x: newPredators[0].position.x, y: newPredators[0].position.y },
        cause: 'reproduction',
        parentId: undefined
      });
    }
  }

  /**
   * Check if an offspring has significantly different attributes from parent
   */
  private checkIfMutated(parent: { attributes: { strength: number; stealth: number; learnability: number; longevity: number } }, offspring: { attributes: { strength: number; stealth: number; learnability: number; longevity: number } }): boolean {
    const threshold = 0.1; // Consider mutated if any attribute differs by more than 0.1

    return (
      Math.abs(parent.attributes.strength - offspring.attributes.strength) > threshold ||
      Math.abs(parent.attributes.stealth - offspring.attributes.stealth) > threshold ||
      Math.abs(parent.attributes.learnability - offspring.attributes.learnability) > threshold ||
      Math.abs(parent.attributes.longevity - offspring.attributes.longevity) > threshold
    );
  }
}
