// Simulation configuration parameters
export const SimulationConfig = {
  // Environment settings
  environment: {
    width: 1000,
    height: 600,
  },
  
  // Initial population
  initialPopulation: {
    resources: 500,
    prey: 50,
    predators: 4
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
    maxEnergy: 480,
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
    maxEnergy: 300,
    defaultAttributes: {
      strength: 0.5,
      stealth: 0.5,
      learnability: 0.3,
      longevity: 0.5
    },
    resourceEnergyBonus: 1.2, // multiplier for energy from resources
    predatorAvoidanceMultiplier: 1.5, // Speed boost when fleeing from predators
    predatorDetectionMultiplier: 1.2, // How much stealth improves predator detection
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