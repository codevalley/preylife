/**
 * LearningSystem - Handles social learning between creatures
 *
 * Priority: 70 (runs after reproduction)
 *
 * This system:
 * - Allows creatures to learn traits from nearby same-species creatures
 * - Preserves specialization by limiting learning for specialized creatures
 * - Emits learning events
 */

import { BaseSystem, SystemPriority } from './System';
import type { World } from '../core/World';
import { SimulationConfig } from '../config';
import { EventBus } from '../events/EventBus';
import type { Creature } from '../entities/Creature';

export class LearningSystem extends BaseSystem {
  readonly name = 'LearningSystem';
  readonly priority = SystemPriority.LEARNING;

  update(_deltaTime: number, world: World): void {
    // Learning process for prey
    this.processLearning(world.getMutablePrey(), 'prey', world);

    // Learning process for predators
    this.processLearning(world.getMutablePredators(), 'predator', world);
  }

  private processLearning(
    creatures: Creature[],
    creatureType: 'prey' | 'predator',
    world: World
  ): void {
    if (creatures.length <= 1) return;

    const config = SimulationConfig.learning;

    for (let i = 0; i < creatures.length; i++) {
      const learner = creatures[i];

      // Skip learning process for highly specialized creatures (preserves specialization)
      const isSpecialized =
        learner.attributes.strength > 0.75 ||
        learner.attributes.stealth > 0.75 ||
        learner.attributes.longevity > 0.75;

      // Specialized creatures only learn with much lower probability
      if (isSpecialized && Math.random() < 0.8) {
        continue;
      }

      // Chance to learn based on learnability
      if (Math.random() < learner.attributes.learnability * config.chanceMultiplier) {
        // Find a random other creature to learn from
        const teacherIndex = Math.floor(Math.random() * creatures.length);
        if (teacherIndex !== i) {
          const teacher = creatures[teacherIndex];

          // Identify if the teacher has strong specialization in any attribute
          const teacherSpecializedAttributes: (keyof typeof learner.attributes)[] = [];
          if (teacher.attributes.strength > 0.7) teacherSpecializedAttributes.push('strength');
          if (teacher.attributes.stealth > 0.7) teacherSpecializedAttributes.push('stealth');
          if (teacher.attributes.longevity > 0.7) teacherSpecializedAttributes.push('longevity');

          // Determine attribute to learn
          let attributeToLearn: 'strength' | 'stealth' | 'longevity';

          if (teacherSpecializedAttributes.length > 0 && Math.random() < 0.7) {
            // 70% chance to learn a specialized attribute from the teacher
            attributeToLearn = teacherSpecializedAttributes[
              Math.floor(Math.random() * teacherSpecializedAttributes.length)
            ] as 'strength' | 'stealth' | 'longevity';
          } else {
            // Otherwise choose a random attribute
            const attributes = ['strength', 'stealth', 'longevity'] as const;
            attributeToLearn = attributes[Math.floor(Math.random() * attributes.length)];
          }

          // Calculate how much to learn
          const teacherValue = teacher.attributes[attributeToLearn];
          const learnerValue = learner.attributes[attributeToLearn];

          // Only learn if the difference is significant
          if (Math.abs(teacherValue - learnerValue) > 0.15) {
            // Calculate learning amount
            const learningAmount =
              (teacherValue - learnerValue) * learner.attributes.learnability * config.learningRate;

            // Cap the learning to avoid huge jumps
            const cappedLearning =
              Math.min(Math.abs(learningAmount), config.maxLearningAmount) *
              Math.sign(learningAmount);

            // Store old value for event
            const oldValue = learner.attributes[attributeToLearn];

            // Apply learning
            learner.attributes[attributeToLearn] += cappedLearning;
            learner.attributes[attributeToLearn] = Math.max(
              0,
              Math.min(1, learner.attributes[attributeToLearn])
            );

            // Learning costs energy
            learner.energy = Math.max(
              0,
              learner.energy - Math.abs(cappedLearning) * config.energyCost
            );

            // Emit learning event (only occasionally to avoid spam)
            if (Math.random() < 0.1) {
              EventBus.getInstance().emit({
                type: 'LEARNING',
                timestamp: Date.now(),
                day: world.days,
                entityType: creatureType,
                learnerId: learner.id,
                teacherId: teacher.id,
                attribute: attributeToLearn,
                oldValue,
                newValue: learner.attributes[attributeToLearn]
              });
            }
          }
        }
      }
    }
  }
}
