/**
 * Configuration Defaults - Default values for all simulation parameters
 *
 * This module provides the default configuration values, separated from
 * the main config file for clarity and maintainability.
 */

import type { SimulationConfigType } from './types';

/**
 * Default simulation configuration
 */
export const DEFAULT_CONFIG: SimulationConfigType = {
  // UI settings - Control visual feedback elements
  ui: {
    toasts: {
      showEphemeral: true,
      showInfo: true,
    }
  },

  // Environment settings - Define the simulation world boundaries
  environment: {
    width: 1000,
    height: 600,
  },

  // Initial population - Starting counts for the simulation entities
  initialPopulation: {
    resources: 250,
    prey: 90,
    predators: 4
  },

  // Resource settings - Configuration for food sources in the ecosystem
  resources: {
    defaultEnergy: 12,
    regenerationChance: 0.02,
    emergencyRegenerationThreshold: 0.2,
    emergencyRegenerationChance: 0.05,
    emergencyEnergyBonus: 1.5,
    decayChance: 0.1,

    limits: {
      maxCount: 2000,
      enableDecay: true,
      decayLifespan: 30,
      decayChancePerFrame: 0.005,
      enforcementThreshold: 0.9,
    },

    bloom: {
      clusterCount: 5,
      primaryEnergyMultiplier: 2.0,
      secondaryEnergyMultiplier: 1.5,
      primaryClusterRadius: 60,
      secondaryClusterRadius: 160,
      bloomDuration: 10,
      resourcesPerBloom: 75,
      primaryDensity: 0.6
    }
  },

  // Creature settings - General parameters that apply to both prey and predators
  creatures: {
    baseSpeed: 6.5,
    baseCost: 1.0,
    movementCostMultiplier: 2.0,
    maxLifespan: {
      base: 60,
      longevityBonus: 40
    },

    energyConsumption: {
      predator: 0.9,
      prey: 0.7
    },

    interactionRanges: {
      resourceConsumption: 10,
      preyCaptureRange: 15,
      preyDetectionRange: 80,
      preyResourceDetectionRange: 50,
      preyPredatorDetectionRange: 100
    },

    personalSpaceRadius: {
      prey: 20,
      predator: 30
    },
    repulsionFactor: {
      prey: 0.1,
      predator: 0.15
    }
  },

  // Predator settings - Parameters specific to predator behavior and attributes
  predator: {
    maxEnergy: 560,
    defaultAttributes: {
      strength: 0.5,
      stealth: 0.4,
      learnability: 0.1,
      longevity: 0.5
    },
    captureChance: {
      strengthMultiplier: 0.6,
      baseChance: 0.2,
      minChance: 0.1,
      maxChance: 0.5
    },
    energyGainFromPrey: 0.55,
    huntingSpeedMultiplier: 0.5,
    detectionRangeMultiplier: 0.5,
  },

  // Prey settings - Parameters specific to prey behavior and attributes
  prey: {
    maxEnergy: 175,
    defaultAttributes: {
      strength: 0.5,
      stealth: 0.5,
      learnability: 0.05,
      longevity: 0.5
    },
    resourceEnergyBonus: 1.2,
    predatorAvoidanceMultiplier: 1.0,
    predatorDetectionMultiplier: 1.1,
    escapeBaseChance: 0.2,
    escapeEnergyConsumption: 5,
  },

  // Learning settings - Parameters for how creatures adapt traits from others
  learning: {
    chanceMultiplier: 0.1,
    learningRate: 0.2,
    maxLearningAmount: 0.05,
    energyCost: 10
  },

  // Reproduction settings - Parameters for breeding and offspring traits
  reproduction: {
    mutationRange: 0.1,
    mutationChance: 0.1,
    significantMutationRange: 0.4,
    energyCapacityMutationRange: 0.1,
    significantEnergyCapacityMutationRange: 0.4,

    energyThreshold: {
      prey: 0.8,
      predator: 0.70
    },
    probability: {
      highEnergy: {
        prey: 0.2,
        predator: 0.08
      },
      lowEnergy: {
        prey: 0.001,
        predator: 0.002
      }
    },
    cooldown: {
      prey: 7,
      predator: 10
    },
    juvenileMaturity: 0.15,
    juvenileReproductionProbability: 0.01
  },

  // Starvation settings - Parameters for energy-based mortality risk
  starvation: {
    prey: {
      thresholds: [
        { energyPercent: 0.5, probability: 0.0001 },
        { energyPercent: 0.4, probability: 0.0001 },
        { energyPercent: 0.3, probability: 0.001 },
        { energyPercent: 0.2, probability: 0.005 },
        { energyPercent: 0.1, probability: 0.02 },
        { energyPercent: 0.05, probability: 0.01 }
      ]
    },
    predator: {
      thresholds: [
        { energyPercent: 0.5, probability: 0.001 },
        { energyPercent: 0.4, probability: 0.002 },
        { energyPercent: 0.3, probability: 0.005 },
        { energyPercent: 0.2, probability: 0.02 },
        { energyPercent: 0.1, probability: 0.08 },
        { energyPercent: 0.05, probability: 0.25 }
      ]
    }
  },

  // Clustered spawning settings - Controls how entities are distributed in groups at spawn
  clusteredSpawning: {
    resources: {
      clusterCount: 4,
    },
    prey: {
      minClusters: 2,
      maxClusters: 3,
      radius: 80,
      attributes: {
        strengthRange: [0.3, 0.7],
        stealthRange: [0.3, 0.7],
        learnabilityRange: [0.2, 0.6],
        longevityRange: [0.3, 0.7],
        variation: 0.2
      }
    },
    predator: {
      minClusters: 1,
      maxClusters: 2,
      radius: 60,
      attributes: {
        strengthRange: [0.4, 0.8],
        stealthRange: [0.3, 0.7],
        learnabilityRange: [0.2, 0.6],
        longevityRange: [0.3, 0.7],
        variation: 0.2
      }
    }
  },

  // Species conversion settings - Parameters for evolutionary mutation between species types
  speciesConversion: {
    enabled: true,

    contactTracking: {
      frameWindow: 600,
      sameSpeciesContactRequired: 300,
      resetOnOppositeContact: true,
      contactMemoryDuration: 900,
      isolationThreshold: 450,
    },

    baseProbability: 0.05,

    populationConditions: {
      enabled: false,
      enableRatio: 0.001,
      minPopulationCheck: 10,
      disableRatio: 0.05
    },

    traitInfluence: {
      prey: {
        strengthWeight: 1.0,
        stealthWeight: 1.0,
        traitThreshold: 0.6,
        extremeTraitBonus: 500,
        maxProbability: 0.25
      },
      predator: {
        strengthWeight: -1.0,
        stealthWeight: -1.0,
        traitThreshold: 0.5,
        extremeTraitBonus: 500,
        maxProbability: 0.15
      }
    },

    debugConversionChecks: false,
    limitConversionsPerUpdate: false,
    maxConversionsPerUpdate: 3,
    evolutionCooldown: 600,
    visualEffectDuration: 3.0
  }
};
