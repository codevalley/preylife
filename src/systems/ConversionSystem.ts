/**
 * ConversionSystem - Handles species conversion (evolutionary jumps)
 *
 * Priority: 80 (runs after learning)
 *
 * This system:
 * - Tracks creature contact with same/opposite species
 * - Checks conversion eligibility based on traits
 * - Handles species conversion (prey↔predator)
 * - Emits conversion events
 */

import { BaseSystem, SystemPriority } from './System';
import type { World } from '../core/World';
import { SimulationConfig } from '../config';
import { EventBus } from '../events/EventBus';
import type { Prey } from '../entities/Prey';
import type { Predator } from '../entities/Predator';

export class ConversionSystem extends BaseSystem {
  readonly name = 'ConversionSystem';
  readonly priority = SystemPriority.CONVERSION;

  async update(_deltaTime: number, world: World): Promise<void> {
    // Skip if species conversion is disabled
    if (!SimulationConfig.speciesConversion.enabled) return;

    const populationStats = {
      prey: world.preyCount,
      predators: world.predatorCount
    };

    // Process prey conversions
    const newPredators = await this.processPreyConversions(world, populationStats);

    // Process predator conversions
    const newPrey = await this.processPredatorConversions(world, populationStats);

    // Add converted creatures to the world
    for (const predator of newPredators) {
      world.addPredator(predator, 'conversion');

      EventBus.getInstance().emit({
        type: 'SPECIES_CONVERSION',
        timestamp: Date.now(),
        day: world.days,
        fromType: 'prey',
        toType: 'predator',
        originalId: '', // Original creature is dead
        newId: predator.id,
        attributes: { ...predator.attributes }
      });
    }

    for (const prey of newPrey) {
      world.addPrey(prey, 'conversion');

      EventBus.getInstance().emit({
        type: 'SPECIES_CONVERSION',
        timestamp: Date.now(),
        day: world.days,
        fromType: 'predator',
        toType: 'prey',
        originalId: '', // Original creature is dead
        newId: prey.id,
        attributes: { ...prey.attributes }
      });
    }

    // Log evolution events
    if (newPredators.length > 0) {
      console.info(`Day ${world.days}: ${newPredators.length} prey evolved into predators!`);
    }
    if (newPrey.length > 0) {
      console.info(`Day ${world.days}: ${newPrey.length} predators evolved into prey!`);
    }
  }

  private async processPreyConversions(
    world: World,
    populationStats: { prey: number; predators: number }
  ): Promise<Predator[]> {
    const newPredators: Predator[] = [];
    const config = SimulationConfig.speciesConversion;

    // Only check a subset of prey for conversion to reduce performance impact
    const maxToCheck = Math.min(20, world.preyCount);
    const preyThreshold = config.traitInfluence.prey.traitThreshold;

    // Prioritize prey with extreme traits (high strength/stealth)
    const potentialConverts = world.getMutablePrey()
      .filter(prey => {
        const avgTraits = (prey.attributes.strength + prey.attributes.stealth) / 2;
        return avgTraits > preyThreshold;
      })
      .sort((a, b) =>
        (b.attributes.strength + b.attributes.stealth) -
        (a.attributes.strength + a.attributes.stealth)
      )
      .slice(0, maxToCheck);

    for (const prey of potentialConverts) {
      // Find nearby prey for conversion check
      const nearbyPrey = world.queryPrey(prey.position.x, prey.position.y, 15, prey);

      // Check if any predators are nearby
      const nearPredator = world.queryPredators(
        prey.position.x,
        prey.position.y,
        60
      ).length > 0;

      try {
        const convertedPredator = await prey.checkSpeciesConversion(
          nearbyPrey,
          populationStats,
          nearPredator
        );

        if (convertedPredator) {
          newPredators.push(convertedPredator as Predator);
        }
      } catch (error) {
        console.error('Error during prey conversion:', error);
      }
    }

    return newPredators;
  }

  private async processPredatorConversions(
    world: World,
    populationStats: { prey: number; predators: number }
  ): Promise<Prey[]> {
    const newPrey: Prey[] = [];
    const config = SimulationConfig.speciesConversion;

    // Only check a subset of predators for conversion
    const maxToCheck = Math.min(20, world.predatorCount);
    const predatorThreshold = config.traitInfluence.predator.traitThreshold;

    // Prioritize predators with extreme traits (low strength/stealth)
    const potentialConverts = world.getMutablePredators()
      .filter(predator => {
        const avgTraits = (predator.attributes.strength + predator.attributes.stealth) / 2;
        return avgTraits < predatorThreshold;
      })
      .sort((a, b) =>
        (a.attributes.strength + a.attributes.stealth) -
        (b.attributes.strength + b.attributes.stealth)
      )
      .slice(0, maxToCheck);

    for (const predator of potentialConverts) {
      // Find nearby predators for conversion check
      const nearbyPredators = world.queryPredators(
        predator.position.x,
        predator.position.y,
        15,
        predator
      );

      // Check if any prey are nearby
      const nearPrey = world.queryPrey(
        predator.position.x,
        predator.position.y,
        60
      ).length > 0;

      try {
        const convertedPrey = await predator.checkSpeciesConversion(
          nearbyPredators,
          populationStats,
          nearPrey
        );

        if (convertedPrey) {
          newPrey.push(convertedPrey as Prey);
        }
      } catch (error) {
        console.error('Error during predator conversion:', error);
      }
    }

    return newPrey;
  }
}
