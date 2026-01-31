/**
 * MovementSystem - Handles creature and entity movement
 *
 * Priority: 20 (runs after aging)
 *
 * This system:
 * - Updates creature positions based on velocity
 * - Handles boundary wrapping
 * - Updates spatial indices after movement
 */

import { BaseSystem, SystemPriority } from './System';
import type { World } from '../core/World';

export class MovementSystem extends BaseSystem {
  readonly name = 'MovementSystem';
  readonly priority = SystemPriority.MOVEMENT;

  update(deltaTime: number, world: World): void {
    // Process all creatures
    for (const creature of world.allCreatures) {
      // Update position based on velocity
      const moveSpeed = creature.speed * creature.attributes.strength * deltaTime;
      creature.position.add(creature.velocity.clone().multiplyScalar(moveSpeed));

      // Handle boundary wrapping
      this.handleBoundaries(creature, world);

      // Update spatial index
      world.updateEntityPosition(creature);

      // Update mesh position
      creature.updateMeshPosition();
    }
  }

  /**
   * Handle boundary wrapping for creatures
   */
  private handleBoundaries(creature: { position: { x: number; y: number } }, world: World): void {
    const width = world.width;
    const height = world.height;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // Wrap around environment boundaries
    if (creature.position.x < -halfWidth) creature.position.x = halfWidth;
    if (creature.position.x > halfWidth) creature.position.x = -halfWidth;
    if (creature.position.y < -halfHeight) creature.position.y = halfHeight;
    if (creature.position.y > halfHeight) creature.position.y = -halfHeight;
  }
}
