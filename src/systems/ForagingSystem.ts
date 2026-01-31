/**
 * ForagingSystem - Handles prey resource consumption
 *
 * Priority: 50 (runs after predation)
 *
 * This system:
 * - Detects when prey are near resources
 * - Handles resource consumption
 * - Emits consumption events
 */

import { BaseSystem, SystemPriority } from './System';
import type { World } from '../core/World';
import { SimulationConfig } from '../config';
import { EventBus } from '../events/EventBus';

export class ForagingSystem extends BaseSystem {
  readonly name = 'ForagingSystem';
  readonly priority = SystemPriority.FORAGING;

  update(_deltaTime: number, world: World): void {
    const consumptionRange = SimulationConfig.creatures.interactionRanges.resourceConsumption;

    for (const prey of world.prey) {
      // Only hunt for food if the prey isn't close to being full
      if (prey.energy >= prey.maxEnergy * 0.9) continue;

      // Check if any predators are nearby - if so, don't consume resources (prioritize escape)
      const nearbyPredators = world.queryPredators(
        prey.position.x,
        prey.position.y,
        70 // Check within 70 units
      );

      if (nearbyPredators.length > 0) continue;

      // Find resources within consumption range
      const nearbyResources = world.queryResources(
        prey.position.x,
        prey.position.y,
        consumptionRange
      );

      if (nearbyResources.length > 0) {
        // Consume the first available resource
        const resource = nearbyResources[0];
        prey.consumeResource(resource);
        world.removeResource(resource);

        // Emit event
        EventBus.getInstance().emit({
          type: 'RESOURCE_CONSUMED',
          timestamp: Date.now(),
          day: world.days,
          resourceId: resource.id,
          preyId: prey.id,
          energyGained: resource.energy * SimulationConfig.prey.resourceEnergyBonus
        });

        // Each prey can only consume one resource per update
        break;
      }
    }
  }
}
