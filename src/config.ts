// Simulation configuration parameters - Core settings for the predator-prey simulation
export const SimulationConfig = {
  // Environment settings - Define the simulation world boundaries
  // don't show in dashboard
  environment: {
    width: 1000,    // Width of the simulation area in units (affects creature movement and resource distribution)
    height: 600,    // Height of the simulation area in units (affects creature movement and resource distribution)
  },
  
  // Initial population - Starting counts for the simulation entities
  initialPopulation: {
    resources: 250, // Initial number of food resources to spawn at simulation start
    prey: 150,      // Initial number of prey creatures to spawn at simulation start
    predators: 0    // Initial number of predator creatures to spawn at simulation start (0 for prey-only ecosystem)
  },
  
  // Resource settings - Configuration for food sources in the ecosystem
  resources: {
    defaultEnergy: 12,                 // Energy value of each standard resource (how much energy prey gain when consumed)
    regenerationChance: 0.02,          // Probability (0-1) of a new resource spawning on each frame
    emergencyRegenerationThreshold: 0.2, // When prey population falls below this % of initial count, trigger emergency resources
    emergencyRegenerationChance: 0.05,   // Higher probability (0-1) of resource spawning during emergency conditions
    emergencyEnergyBonus: 1.5,           // Energy multiplier for resources spawned during emergency conditions
    decayChance: 0.1,                    // Probability (0-1) of resources decaying when no prey exist in the ecosystem
    
    // Resource limitation settings - Controls to prevent resource overpopulation
    limits: {
      maxCount: 2000,               // Absolute maximum number of resources allowed in simulation at once
      enableDecay: true,            // Whether resources naturally decay over time (true) or persist indefinitely (false)
      decayLifespan: 30,            // Number of days a resource exists before it becomes eligible for natural decay
      decayChancePerFrame: 0.005,   // Probability (0-1) per frame that an old resource (beyond decayLifespan) will decay
      enforcementThreshold: 0.9,    // When resources reach this % of maxCount, start enforcing limits more strictly
    },
    
    // Seasonal bloom settings - Periodic bursts of abundant resources
    bloom: {
      clusterCount: 5,                  // Number of distinct resource clusters to create during a bloom event
      primaryEnergyMultiplier: 2.0,     // Energy value multiplier for resources in primary (dense) clusters
      secondaryEnergyMultiplier: 1.5,   // Energy value multiplier for resources in secondary (sparse) clusters
      primaryClusterRadius: 60,         // Radius in units for dense primary resource clusters
      secondaryClusterRadius: 160,      // Radius in units for sparse secondary resource clusters
      bloomDuration: 10,                // Number of days the bloom event lasts before returning to normal
      resourcesPerBloom: 75,            // Total number of new resources spawned during each bloom event
      primaryDensity: 0.6               // Proportion (0-1) of bloom resources allocated to primary dense clusters
    }
  },
  
  // Creature settings - General parameters that apply to both prey and predators
  creatures: {
    // General creature settings - Base movement and energy parameters
    baseSpeed: 8,                  // Base movement speed in units per second (before trait modifications)
    baseCost: 1.0,                 // Base energy consumption rate per second (before trait modifications)
    movementCostMultiplier: 2.0,   // How much the strength trait affects movement energy cost
    maxLifespan: {
      base: 60,                    // Base lifespan in seconds for all creatures
      longevityBonus: 40           // Additional seconds of lifespan granted at maximum longevity trait (1.0)
    },
    
    // Energy consumption multipliers by type - Balances energy use between species
    energyConsumption: {
      predator: 0.9,               // Energy consumption multiplier for predators (lower = more efficient)
      prey: 0.7                    // Energy consumption multiplier for prey (lower = more efficient)
    },
    
    // Detection and interaction ranges - Distances for various interactions
    interactionRanges: {
      resourceConsumption: 10,         // Distance in units at which prey can consume resources
      preyCaptureRange: 15,            // Distance in units at which predators can attempt to capture prey
      preyDetectionRange: 80,          // Distance in units at which predators can detect prey
      preyResourceDetectionRange: 50,  // Distance in units at which prey can detect resources
      preyPredatorDetectionRange: 100  // Distance in units at which prey can detect approaching predators
    }
  },
  
  // Predator settings - Parameters specific to predator behavior and attributes
  predator: {
    maxEnergy: 560,                // Maximum energy capacity for predators (how much energy they can store)
    defaultAttributes: {           // Default genetic traits for newly spawned predators (0-1 scale)
      strength: 0.5,               // Physical power - affects movement speed, hunting success, and energy cost
      stealth: 0.4,                // Sneakiness - affects ability to approach prey undetected
      learnability: 0.1,           // Adaptability - affects ability to learn from other predators
      longevity: 0.5               // Lifespan - affects maximum age and metabolic efficiency
    },
    captureChance: {               // Parameters determining success rate when capturing prey
      strengthMultiplier: 0.6,     // Impact of strength trait on capture success (higher = more impact)
      baseChance: 0.2,             // Minimum capture probability before trait modifications
      minChance: 0.1,              // Absolute minimum capture probability regardless of traits
      maxChance: 0.5               // Absolute maximum capture probability regardless of traits
    },
    energyGainFromPrey: 0.85,           // Proportion (0-1) of prey's energy gained when consumed
    huntingSpeedMultiplier: 0.5,        // Speed boost factor when actively hunting (0.5 = up to 50% faster)
    detectionRangeMultiplier: 0.5,      // Detection range increase factor when hungry (0.5 = up to 50% increase)
  },
  
  // Prey settings - Parameters specific to prey behavior and attributes
  prey: {
    maxEnergy: 175,                // Maximum energy capacity for prey (how much energy they can store)
    defaultAttributes: {           // Default genetic traits for newly spawned prey (0-1 scale)
      strength: 0.5,               // Physical power - affects movement speed and energy cost
      stealth: 0.5,                // Evasiveness - affects ability to hide from predators
      learnability: 0.05,          // Adaptability - affects ability to learn from other prey
      longevity: 0.5               // Lifespan - affects maximum age and metabolic efficiency
    },
    resourceEnergyBonus: 1.2,            // Multiplier for energy gained from consuming resources
    predatorAvoidanceMultiplier: 1.0,    // Speed boost factor when fleeing from predators (1.0 = no boost)
    predatorDetectionMultiplier: 1.1,    // Factor for how much stealth improves predator detection range
    escapeBaseChance: 0.2,               // Base probability (0-1) of escaping when caught by a predator
    escapeEnergyConsumption: 5,          // Energy cost when attempting to escape from a predator
  },
  
  // Learning settings - Parameters for how creatures adapt traits from others
  learning: {
    chanceMultiplier: 0.1,       // Base probability multiplier for learning (multiplied by learnability trait)
    learningRate: 0.2,           // How much of the trait difference is adopted when learning occurs
    maxLearningAmount: 0.05,     // Maximum trait change possible from a single learning event
    energyCost: 10               // Energy cost multiplier for learning (higher = more energy used)
  },
  
  // Reproduction settings - Parameters for breeding and offspring traits
  reproduction: {
    mutationRange: 0.1,                   // Standard mutation range (±0.05 by default) for offspring traits
    mutationChance: 0.1,                  // Probability (0-1) of a significant mutation occurring
    significantMutationRange: 0.4,        // Range for significant mutations (±0.2 by default)
    energyCapacityMutationRange: 0.1,     // Standard mutation range for max energy (±5% by default)
    significantEnergyCapacityMutationRange: 0.4, // Range for significant max energy mutations (±20%)
    
    // Probabilistic reproduction parameters - Controls when creatures attempt to reproduce
    energyThreshold: {
      prey: 0.8,                   // Energy percentage (0-1) threshold for high reproduction chance in prey
      predator: 0.70               // Energy percentage (0-1) threshold for high reproduction chance in predators
    },
    probability: {
      highEnergy: {                // Reproduction probabilities when energy is above threshold
        prey: 0.2,                 // Probability (0-1) per update for prey above energy threshold
        predator: 0.4              // Probability (0-1) per update for predators above energy threshold
      },
      lowEnergy: {                 // Reproduction probabilities when energy is below threshold but above 20%
        prey: 0.001,               // Probability (0-1) per update for prey with moderate energy
        predator: 0.002            // Probability (0-1) per update for predators with moderate energy
      }
    },
    cooldown: {
      prey: 7,                     // Days until prey can reproduce again at full probability
      predator: 3                  // Days until predators can reproduce again at full probability
    },
    juvenileMaturity: 0.15,                   // Proportion (0-1) of lifespan before creature can reproduce
    juvenileReproductionProbability: 0.01     // Low probability (0-1) for juvenile reproduction if it occurs
  },
  
  // Starvation settings - Parameters for energy-based mortality risk
  starvation: {
    // Separate starvation thresholds for prey and predators
    prey: {
      // Prey starvation probability thresholds as array of {energy percentage : death probability per update}
      // Prey are more resilient to starvation (lower probabilities)
      thresholds: [
        { energyPercent: 0.5, probability: 0.0001 }, // At 50% energy: 0.01% chance of death per update
        { energyPercent: 0.4, probability: 0.0001 }, // At 40% energy: 0.01% chance of death per update
        { energyPercent: 0.3, probability: 0.001 },  // At 30% energy: 0.1% chance of death per update
        { energyPercent: 0.2, probability: 0.005 },  // At 20% energy: 0.5% chance of death per update
        { energyPercent: 0.1, probability: 0.02 },   // At 10% energy: 2% chance of death per update
        { energyPercent: 0.05, probability: 0.01 }   // At 5% energy: 1% chance of death per update
      ]
    },
    
    predator: {
      // Predator starvation probability thresholds as array of {energy percentage : death probability per update}
      // Predators are more vulnerable to starvation (higher probabilities)
      thresholds: [
        { energyPercent: 0.5, probability: 0.001 },  // At 50% energy: 0.1% chance of death per update
        { energyPercent: 0.4, probability: 0.002 },  // At 40% energy: 0.2% chance of death per update
        { energyPercent: 0.3, probability: 0.005 },  // At 30% energy: 0.5% chance of death per update
        { energyPercent: 0.2, probability: 0.02 },   // At 20% energy: 2% chance of death per update
        { energyPercent: 0.1, probability: 0.08 },   // At 10% energy: 8% chance of death per update
        { energyPercent: 0.05, probability: 0.25 }   // At 5% energy: 25% chance of death per update
      ]
    }
  },
  
  // Clustered spawning settings - Controls how entities are distributed in groups at spawn
  clusteredSpawning: {
    resources: {
      clusterCount: 4,             // Number of resource clusters to create during initial spawning
    },
    prey: {
      minClusters: 2,              // Minimum number of prey clusters to create during initial spawning
      maxClusters: 3,              // Maximum number of prey clusters to create during initial spawning
      radius: 80,                  // Radius in units for each prey cluster
      attributes: {
        // Range of possible trait values for each initial prey cluster [min, max]
        strengthRange: [0.3, 0.7],     // Range for strength trait in newly spawned prey
        stealthRange: [0.3, 0.7],      // Range for stealth trait in newly spawned prey
        learnabilityRange: [0.2, 0.6], // Range for learnability trait in newly spawned prey
        longevityRange: [0.3, 0.7],    // Range for longevity trait in newly spawned prey
        variation: 0.2                 // Individual variation within a cluster (±0.1 around cluster value)
      }
    },
    predator: {
      minClusters: 1,              // Minimum number of predator clusters to create during initial spawning
      maxClusters: 2,              // Maximum number of predator clusters to create during initial spawning
      radius: 60,                  // Radius in units for each predator cluster
      attributes: {
        // Range of possible trait values for each initial predator cluster [min, max]
        strengthRange: [0.4, 0.8],     // Range for strength trait in newly spawned predators
        stealthRange: [0.3, 0.7],      // Range for stealth trait in newly spawned predators
        learnabilityRange: [0.2, 0.6], // Range for learnability trait in newly spawned predators
        longevityRange: [0.3, 0.7],    // Range for longevity trait in newly spawned predators
        variation: 0.2                 // Individual variation within a cluster (±0.1 around cluster value)
      }
    }
  },
  
  // Species conversion settings - Parameters for evolutionary mutation between species types
  speciesConversion: {
    enabled: true,                 // Master toggle for species conversion feature (true = enabled)
    
    // Contact tracking system - Determines how species interactions affect conversion eligibility
    contactTracking: {
      frameWindow: 600,                 // Number of frames to analyze for contact history (10 seconds)
      sameSpeciesContactRequired: 300,  // Minimum same-species contacts needed in window (50% of frames)
      resetOnOppositeContact: true,     // Whether to reset contact counter when meeting opposite species
      contactMemoryDuration: 900,       // Maximum frames to remember contact history (15 seconds)
      isolationThreshold: 450,          // Frames without opposite species contact to consider isolated
    },
    
    // Base conversion probability - Starting chance before trait modifications
    baseProbability: 0.05,         // Base probability (0-1) for conversion check per eligible creature
    
    // Population conditions - Optional rules for triggering conversions based on species ratios
    populationConditions: {
      enabled: false,              // Whether to enable population-based conversion triggers
      enableRatio: 0.001,          // Species ratio threshold to enable conversion (0.1% of total population)
      minPopulationCheck: 10,      // Minimum total population before ratio checks are applied
      disableRatio: 0.05           // Species ratio threshold to disable conversion (5% of total population)
    },
    
    // Trait influence on conversion probability - How genetic traits affect species change
    traitInfluence: {
      prey: {
        // Parameters for prey-to-predator conversion based on traits
        strengthWeight: 1.0,       // Weight of strength trait on conversion (higher = stronger effect)
        stealthWeight: 1.0,        // Weight of stealth trait on conversion (higher = stronger effect)
        traitThreshold: 0.6,       // Minimum average trait value needed to qualify for conversion
        extremeTraitBonus: 500,    // Multiplier for conversion probability with exceptional traits
        maxProbability: 0.25       // Maximum possible conversion probability (0-1) regardless of traits
      },
      predator: {
        // Parameters for predator-to-prey conversion based on traits
        strengthWeight: -1.0,      // Weight of strength trait on conversion (negative = inverse effect)
        stealthWeight: -1.0,       // Weight of stealth trait on conversion (negative = inverse effect)
        traitThreshold: 0.5,       // Maximum average trait value allowed to qualify for conversion
        extremeTraitBonus: 500,    // Multiplier for conversion probability with exceptionally low traits
        maxProbability: 0.15       // Maximum possible conversion probability (0-1) regardless of traits
      }
    },
    
    // Debugging and visualization options
    debugConversionChecks: false,        // Whether to log detailed conversion check data to console
    
    // Limits and cooldowns - Control conversion frequency and visual feedback
    limitConversionsPerUpdate: false,    // Whether to cap conversions per update cycle
    maxConversionsPerUpdate: 3,          // Maximum conversions allowed per update if limiting is enabled
    evolutionCooldown: 600,              // Frames before converted creature is eligible for conversion again
    visualEffectDuration: 3.0            // Duration in seconds for the conversion animation effect
  }
};