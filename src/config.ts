// Simulation configuration parameters
export const SimulationConfig = {
  // Environment settings
  environment: {
    width: 1000,
    height: 600,
  },
  
  // Initial population
  initialPopulation: {
    resources: 250,
    prey: 60,
    predators: 15
  },
  
  // Resource settings
  resources: {
    defaultEnergy: 15,
    regenerationChance: 0.02, // % chance each frame
    emergencyRegenerationThreshold: 0.2, // % of initial prey
    emergencyRegenerationChance: 0.05, // % chance each frame
    emergencyEnergyBonus: 1.5, // multiplier for emergency resources
    decayChance: 0.1, // % chance of resources decaying when no prey
    
    // Seasonal bloom settings
    bloom: {
      clusterCount: 5,           // Number of resource clusters during bloom
      primaryEnergyMultiplier: 2.0,  // Energy multiplier for primary cluster resources
      secondaryEnergyMultiplier: 1.5, // Energy multiplier for secondary cluster resources
      primaryClusterRadius: 60,  // Radius of primary dense clusters
      secondaryClusterRadius: 160, // Max radius of secondary sparse clusters
      bloomDuration: 10,         // How many days the bloom lasts
      resourcesPerBloom: 75,    // Total resources spawned during bloom
      primaryDensity: 0.6        // Percentage of resources in primary clusters (0.6 = 60%)
    }
  },
  
  // Creature settings
  creatures: {
    // General creature settings
    baseSpeed: 7, // Base movement speed in units per second
    baseCost: 1.0, // base energy consumption per second
    movementCostMultiplier: 2.0, // how much strength affects movement cost
    maxLifespan: {
      base: 60, // seconds
      longevityBonus: 40 // additional seconds at max longevity
    },
    
    // Energy consumption multipliers by type
    energyConsumption: {
      predator: 2.5,
      prey: 0.7
    },
    
    // Detection and interaction ranges
    interactionRanges: {
      resourceConsumption: 10,
      preyCaptureRange: 15,
      preyDetectionRange: 80,
      preyResourceDetectionRange: 50,
      preyPredatorDetectionRange: 100 // How far prey can detect predators
    }
  },
  
  // Predator settings
  predator: {
    maxEnergy: 420,
    defaultAttributes: {
      strength: 0.5,
      stealth: 0.4,
      learnability: 0.3,
      longevity: 0.5
    },
    captureChance: {
      strengthMultiplier: 0.6,
      baseChance: 0.2,
      minChance: 0.1,
      maxChance: 0.5
    },
    energyGainFromPrey: 0.7, // % of prey's energy gained
  },
  
  // Prey settings
  prey: {
    maxEnergy: 200,
    defaultAttributes: {
      strength: 0.5,
      stealth: 0.5,
      learnability: 0.3,
      longevity: 0.5
    },
    resourceEnergyBonus: 1.2, // multiplier for energy from resources
    predatorAvoidanceMultiplier: 1.15, // Speed boost when fleeing from predators
    predatorDetectionMultiplier: 1.1, // How much stealth improves predator detection
  },
  
  // Learning settings
  learning: {
    chanceMultiplier: 0.1, // base chance multiplied by learnability
    learningRate: 0.2, // how much of the difference is learned
    maxLearningAmount: 0.05, // maximum attribute change
    energyCost: 10 // energy cost multiplier for learning
  },
  
  // Reproduction settings
  reproduction: {
    mutationRange: 0.1, // ±0.05 by default
    mutationChance: 0.1, // chance of significant mutation
    significantMutationRange: 0.4, // ±0.2 by default
    energyCapacityMutationRange: 0.1, // ±5% by default
    significantEnergyCapacityMutationRange: 0.4, // ±20% by default
    
    // Probabilistic reproduction parameters
    energyThreshold: {
      prey: 0.8,    // 80% energy threshold for high reproduction probability
      predator: 0.7 // 70% energy threshold for high reproduction probability
    },
    probability: {
      highEnergy: {  // When energy is above threshold
        prey: 0.2,   // 20% chance per update when above threshold
        predator: 0.3 // 30% chance per update when above threshold
      },
      lowEnergy: {   // When energy is below threshold
        prey: 0.03,   // 3% chance per update when below threshold
        predator: 0.05 // 5% chance per update when below threshold
      }
    },
    cooldown: {
      prey: 7,      // 7 days until full reproduction probability is restored
      predator: 3    // 3 days until full reproduction probability is restored
    },
    juvenileMaturity: 0.15, // Percentage of lifespan before creature is mature enough to reproduce
    juvenileReproductionProbability: 0.01 // Very low probability for juveniles to reproduce
  },
  
  // Starvation settings
  starvation: {
    // Starvation probability thresholds (energy % : probability of death per update)
    thresholds: [
      { energyPercent: 0.5, probability: 0.0001 }, // 50% energy: 0.01% chance per update
      { energyPercent: 0.4, probability: 0.0001 }, // 40% energy: 0.01% chance per update
      { energyPercent: 0.3, probability: 0.002 }, // 30% energy: 0.2% chance per update
      { energyPercent: 0.2, probability: 0.015 },  // 20% energy: 1.5% chance per update
      { energyPercent: 0.1, probability: 0.025 },  // 10% energy: 2.5% chance per update
      { energyPercent: 0.05, probability: 0.15 }   // 5% energy: 15% chance per update
    ]
  },
  
  // Clustered spawning settings
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
        variation: 0.2 // ±0.1 individual variation
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
        variation: 0.2 // ±0.1 individual variation
      }
    }
  }
};