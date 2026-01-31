/**
 * AgingSystem - Handles creature aging and death checks
 *
 * Priority: 10 (runs first)
 *
 * This system:
 * - Updates creature ages
 * - Handles reproduction cooldown timers
 * - Handles species conversion cooldowns
 * - Updates conversion animation effects
 */

import { BaseSystem, SystemPriority } from './System';
import type { World } from '../core/World';

export class AgingSystem extends BaseSystem {
  readonly name = 'AgingSystem';
  readonly priority = SystemPriority.AGING;

  update(deltaTime: number, world: World): void {
    // Process all creatures (both prey and predators)
    for (const creature of world.allCreatures) {
      // Increment age
      creature.age += deltaTime;

      // Increment time since last reproduction
      creature.timeSinceLastReproduction += deltaTime;

      // Decrement species conversion cooldown if active
      if (creature.speciesConversionCooldown > 0) {
        creature.speciesConversionCooldown -= deltaTime;
        if (creature.speciesConversionCooldown < 0) {
          creature.speciesConversionCooldown = 0;
        }
      }

      // Update conversion animation if this is a newly converted creature
      if (creature.isConversionAnimation) {
        creature.conversionEffectTime -= deltaTime;

        if (creature.conversionEffectTime <= 0) {
          // Animation complete
          creature.isConversionAnimation = false;
          creature.conversionEffectTime = 0;
        }
      }
    }
  }

  reset(world: World): void {
    // Reset ages and timers for all creatures
    for (const creature of world.allCreatures) {
      creature.age = 0;
      creature.timeSinceLastReproduction = 0;
      creature.speciesConversionCooldown = 0;
      creature.isConversionAnimation = false;
      creature.conversionEffectTime = 0;
    }
  }
}
