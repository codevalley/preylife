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
    prey: 150,
    predators: 0
  },
  
  // Resource settings
  resources: {
    defaultEnergy: 12,
    regenerationChance: 0.02, // % chance each frame
    emergencyRegenerationThreshold: 0.2, // % of initial prey
    emergencyRegenerationChance: 0.05, // % chance each frame
    emergencyEnergyBonus: 1.5, // multiplier for emergency resources
    decayChance: 0.1, // % chance of resources decaying when no prey
    
    // Resource limitation settings
    limits: {
      maxCount: 2000,           // Maximum number of resources allowed in the simulation
      enableDecay: true,        // Whether resources decay naturally over time
      decayLifespan: 30,        // Lifespan of resources in days before they start decaying
      decayChancePerFrame: 0.005, // Chance per frame that an old resource will decay
      enforcementThreshold: 0.9, // When resource count reaches 90% of maxCount, start enforcing limits
    },
    
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
    baseSpeed: 8, // Base movement speed in units per second
    baseCost: 1.0, // base energy consumption per second
    movementCostMultiplier: 2.0, // how much strength affects movement cost
    maxLifespan: {
      base: 60, // seconds
      longevityBonus: 40 // additional seconds at max longevity
    },
    
    // Energy consumption multipliers by type
    energyConsumption: {
      predator: 0.9, // Reduced from 2.25 to give predators more longevity
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
    energyGainFromPrey: 0.85, // % of prey's energy gained
    huntingSpeedMultiplier: 0.5, // Speed boost multiplier when hunting (0.5 = up to 50% faster)
    detectionRangeMultiplier: 0.5, // Detection range increase multiplier when hungry
  },
  
  // Prey settings
  prey: {
    maxEnergy: 175,
    defaultAttributes: {
      strength: 0.5,
      stealth: 0.5,
      learnability: 0.05,
      longevity: 0.5
    },
    resourceEnergyBonus: 1.2, // multiplier for energy from resources
    predatorAvoidanceMultiplier: 1.0, // Speed boost when fleeing from predators (reduced from 1.1)
    predatorDetectionMultiplier: 1.1, // How much stealth improves predator detection
    escapeBaseChance: 0.2, // Base probability of escaping when caught (reduced from 0.25)
    escapeEnergyConsumption: 5, // Energy cost of escape attempt
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
      predator: 0.70 // 70% energy threshold for high reproduction probability
    },
    probability: {
      highEnergy: {  // When energy is above threshold
        prey: 0.2,   // 20% chance per update when above threshold
        predator: 0.4 // 30% chance per update when above threshold
      },
      lowEnergy: {   // When energy is below threshold but above 20%
        prey: 0.001,   // 0.1% chance per update when between 20% and threshold
        predator: 0.002 // 0.1% chance per update when between 20% and threshold
      }
    },
    cooldown: {
      prey: 7,      // 7 days until full reproduction probability is restored
      predator: 3    // 6 days until full reproduction probability is restored
    },
    juvenileMaturity: 0.15, // Percentage of lifespan before creature is mature enough to reproduce
    juvenileReproductionProbability: 0.01 // Very low probability for juveniles to reproduce
  },
  
  // Starvation settings
  starvation: {
    // Separate starvation thresholds for prey and predators
    prey: {
      // Prey starvation probability thresholds (energy % : probability of death per update)
      // Prey are more resilient to starvation (lower probabilities)
      thresholds: [
        { energyPercent: 0.5, probability: 0.0001 }, // 50% energy: 0.01% chance per update
        { energyPercent: 0.4, probability: 0.0001 }, // 40% energy: 0.01% chance per update
        { energyPercent: 0.3, probability: 0.001 },  // 30% energy: 0.1% chance per update
        { energyPercent: 0.2, probability: 0.005 },   // 20% energy: 1% chance per update
        { energyPercent: 0.1, probability: 0.02 },   // 10% energy: 2% chance per update
        { energyPercent: 0.05, probability: 0.01 }    // 5% energy: 10% chance per update
      ]
    },
    
    predator: {
      // Predator starvation probability thresholds (energy % : probability of death per update)
      // Predators are more vulnerable to starvation (higher probabilities)
      thresholds: [
        { energyPercent: 0.5, probability: 0.001 }, // 50% energy: 0.1% chance per update
        { energyPercent: 0.4, probability: 0.002 },  // 40% energy: 0.2% chance per update
        { energyPercent: 0.3, probability: 0.005 },  // 30% energy: 0.5% chance per update
        { energyPercent: 0.2, probability: 0.02 },   // 20% energy: 2% chance per update
        { energyPercent: 0.1, probability: 0.08 },   // 10% energy: 8% chance per update
        { energyPercent: 0.05, probability: 0.25 }    // 5% energy: 25% chance per update
      ]
    }
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
  },
  
  // Species conversion settings (evolutionary mutation mechanism)
  speciesConversion: {
    enabled: true,                 // Master toggle for this feature
    
    // New species-level contact tracking system
    contactTracking: {
      frameWindow: 600,            // Window of frames to track contact history (10 seconds)
      sameSpeciesContactRequired: 300,  // Minimum contacts with same species in window (50%)
      resetOnOppositeContact: true,     // Reset counter on ANY contact with opposite species
      contactMemoryDuration: 900,       // Maximum time to track contact history (15 seconds)
      isolationThreshold: 450,          // Time without opposite species contact to consider isolated
    },
    
    // Conversion probability settings
    baseProbability: 0.05,         // Base probability for conversion check
    
    // Optional population conditions for enabling conversion (can be disabled)
    populationConditions: {
      enabled: false,              // Enable population conditions for extinct species regeneration
      enableRatio: 0.001,          // Trigger only when species is essentially extinct (0.1%)
      minPopulationCheck: 10,      // Only check ratio when total population > 10
      disableRatio: 0.05           // Disable when recovered to 5% of total population
    },
    
    // Trait influence on conversion probability
    traitInfluence: {
      prey: {
        // Higher values in these traits increase chance of prey→predator conversion
        strengthWeight: 1.0,       // Stronger prey more likely to become predators
        stealthWeight: 1.0,        // Stealthier prey more likely to become predators
        traitThreshold: 0.6,       // Threshold for trait qualifications
        extremeTraitBonus: 500,    // Bonus for exceptional traits
        maxProbability: 0.25       // Maximum possible conversion probability (25%)
      },
      predator: {
        // Lower values in these traits increase chance of predator→prey conversion
        strengthWeight: -1.0,      // Weaker predators more likely to become prey
        stealthWeight: -1.0,       // Less stealthy predators more likely to become prey
        traitThreshold: 0.5,       // Threshold for trait qualifications
        extremeTraitBonus: 500,    // Bonus for exceptional traits
        maxProbability: 0.15       // Maximum possible conversion probability (15%)
      }
    },
    
    // Debugging options
    debugConversionChecks: false,   // Prints debug info about conversion checks
    
    // Limits, cooldowns and visual effects
    limitConversionsPerUpdate: false, // Whether to limit conversions per update (false = unlimited)
    maxConversionsPerUpdate: 3,     // Maximum conversions per update cycle if limiting enabled
    evolutionCooldown: 600,         // Cooldown after conversion before checking again (10 seconds)
    visualEffectDuration: 3.0       // Duration of metamorphosis visual effect in seconds
  }
};