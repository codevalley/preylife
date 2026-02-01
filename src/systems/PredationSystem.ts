/**
 * PredationSystem - Handles predator hunting and prey consumption
 *
 * Priority: 40 (runs before foraging)
 *
 * This system:
 * - Handles predator attempts to catch prey
 * - Processes successful hunts
 * - Handles prey escape attempts
 * - Emits predation events
 */

import { BaseSystem, SystemPriority } from './System';
import type { World } from '../core/World';
import { SimulationConfig } from '../config';
import { EventBus } from '../events/EventBus';

export class PredationSystem extends BaseSystem {
  readonly name = 'PredationSystem';
  readonly priority = SystemPriority.PREDATION;

  update(_deltaTime: number, world: World): void {
    const captureRange = SimulationConfig.creatures.interactionRanges.preyCaptureRange;

    for (const predator of world.predators) {
      // Predators only hunt if they're below 80% of their max energy
      if (predator.energy >= predator.maxEnergy * 0.8) continue;

      // Use spatial query to find nearby prey
      const nearbyPrey = world.queryPrey(
        predator.position.x,
        predator.position.y,
        captureRange
      );

      for (const prey of nearbyPrey) {
        // Unified predation contest — single roll handles both offense and defense
        if (predator.canCatchPrey(prey)) {
          // Successful hunt!
          const energyGained = prey.energy * SimulationConfig.predator.energyGainFromPrey;
          predator.consumePrey(prey);
          prey.die();

          // Track statistics
          world.recordPreyConsumed();

          // Emit prey consumed event
          EventBus.getInstance().emit({
            type: 'PREY_CONSUMED',
            timestamp: Date.now(),
            day: world.days,
            preyId: prey.id,
            predatorId: predator.id,
            preyPosition: { x: prey.position.x, y: prey.position.y },
            energyGained
          });

          // Each predator can only catch one prey per update
          break;
        } else {
          // Prey escaped!
          // Escape attempt costs the prey energy
          prey.energy = Math.max(0, prey.energy - 5);

          // Give the prey a speed boost to escape
          const escapeDirection = prey.position.clone().sub(predator.position).normalize();
          prey.velocity.copy(escapeDirection).multiplyScalar(prey.speed * 2);

          // Emit prey escaped event
          EventBus.getInstance().emit({
            type: 'PREY_ESCAPED',
            timestamp: Date.now(),
            day: world.days,
            preyId: prey.id,
            predatorId: predator.id,
            escapeMethod: 'stealth',
            preyPosition: { x: prey.position.x, y: prey.position.y }
          });

          // Predator fails catch attempt, move on
          break;
        }
      }
    }
  }
}
