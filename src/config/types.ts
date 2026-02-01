/**
 * Configuration Types - Type definitions for all simulation parameters
 *
 * This module provides TypeScript interfaces for the simulation configuration,
 * enabling type safety and autocompletion throughout the codebase.
 */

/** Starvation threshold entry */
export interface StarvationThreshold {
  energyPercent: number;
  probability: number;
}

/** Attribute range for spawning [min, max] */
export type AttributeRange = [number, number];

/** UI configuration */
export interface UIConfig {
  toasts: {
    showInfo: boolean;
  };
}

/** Environment dimensions */
export interface EnvironmentConfig {
  width: number;
  height: number;
}

/** Initial population counts */
export interface InitialPopulationConfig {
  resources: number;
  prey: number;
  predators: number;
}

/** Resource limits configuration */
export interface ResourceLimitsConfig {
  maxCount: number;
  enableDecay: boolean;
  decayLifespan: number;
  decayChancePerFrame: number;
  enforcementThreshold: number;
}

/** Resource bloom configuration */
export interface ResourceBloomConfig {
  clusterCount: number;
  primaryEnergyMultiplier: number;
  secondaryEnergyMultiplier: number;
  primaryClusterRadius: number;
  secondaryClusterRadius: number;
  bloomDuration: number;
  resourcesPerBloom: number;
  primaryDensity: number;
}

/** Resource configuration */
export interface ResourcesConfig {
  defaultEnergy: number;
  regenerationChance: number;
  emergencyRegenerationThreshold: number;
  emergencyRegenerationChance: number;
  emergencyEnergyBonus: number;
  decayChance: number;
  limits: ResourceLimitsConfig;
  bloom: ResourceBloomConfig;
}

/** Creature interaction ranges */
export interface InteractionRangesConfig {
  resourceConsumption: number;
  preyCaptureRange: number;
  preyDetectionRange: number;
  preyResourceDetectionRange: number;
  preyPredatorDetectionRange: number;
}

/** Lifespan configuration */
export interface LifespanConfig {
  base: number;
  longevityBonus: number;
}

/** Energy consumption by type */
export interface EnergyConsumptionConfig {
  predator: number;
  prey: number;
}

/** Personal space configuration */
export interface PersonalSpaceConfig {
  prey: number;
  predator: number;
}

/** General creature configuration */
export interface CreaturesConfig {
  baseSpeed: number;
  baseCost: number;
  movementCostMultiplier: number;
  maxLifespan: LifespanConfig;
  energyConsumption: EnergyConsumptionConfig;
  interactionRanges: InteractionRangesConfig;
  personalSpaceRadius: PersonalSpaceConfig;
  repulsionFactor: PersonalSpaceConfig;
}

/** Default genetic attributes */
export interface DefaultAttributesConfig {
  strength: number;
  stealth: number;
  learnability: number;
  longevity: number;
}

/** Predator capture chance configuration */
export interface CaptureChanceConfig {
  strengthMultiplier: number;
  baseChance: number;
  minChance: number;
  maxChance: number;
}

/** Predator desperation configuration */
export interface PredatorDesperationConfig {
  hungerThreshold: number;
  speedBonus: number;
  detectionBonus: number;
  turnRateBonus: number;
  isolationRange: number;
  maxNearbyPredators: number;
}

/** Predator configuration */
export interface PredatorConfig {
  maxEnergy: number;
  defaultAttributes: DefaultAttributesConfig;
  captureChance: CaptureChanceConfig;
  energyGainFromPrey: number;
  huntingSpeedMultiplier: number;
  detectionRangeMultiplier: number;
  desperation: PredatorDesperationConfig;
}

/** Prey flee exhaustion configuration */
export interface PreyFleeExhaustionConfig {
  threshold: number;
  rate: number;
  maxPenalty: number;
}

/** Prey configuration */
export interface PreyConfig {
  maxEnergy: number;
  defaultAttributes: DefaultAttributesConfig;
  resourceEnergyBonus: number;
  predatorAvoidanceMultiplier: number;
  predatorDetectionMultiplier: number;
  escapeBaseChance: number;
  escapeEnergyConsumption: number;
  fleeExhaustion: PreyFleeExhaustionConfig;
}

/** Learning configuration */
export interface LearningConfig {
  chanceMultiplier: number;
  learningRate: number;
  maxLearningAmount: number;
  energyCost: number;
}

/** Reproduction energy thresholds */
export interface ReproductionThresholdConfig {
  prey: number;
  predator: number;
}

/** Reproduction probability by energy level */
export interface ReproductionProbabilityConfig {
  highEnergy: {
    prey: number;
    predator: number;
  };
  lowEnergy: {
    prey: number;
    predator: number;
  };
}

/** Reproduction cooldown */
export interface ReproductionCooldownConfig {
  prey: number;
  predator: number;
}

/** Reproduction configuration */
export interface ReproductionConfig {
  mutationRange: number;
  mutationChance: number;
  significantMutationRange: number;
  energyCapacityMutationRange: number;
  significantEnergyCapacityMutationRange: number;
  energyThreshold: ReproductionThresholdConfig;
  probability: ReproductionProbabilityConfig;
  cooldown: ReproductionCooldownConfig;
  juvenileMaturity: number;
  juvenileReproductionProbability: number;
}

/** Starvation configuration by species */
export interface StarvationConfig {
  prey: {
    thresholds: StarvationThreshold[];
  };
  predator: {
    thresholds: StarvationThreshold[];
  };
}

/** Clustered spawning attribute ranges */
export interface SpawningAttributesConfig {
  strengthRange: AttributeRange;
  stealthRange: AttributeRange;
  learnabilityRange: AttributeRange;
  longevityRange: AttributeRange;
  variation: number;
}

/** Species spawning configuration */
export interface SpeciesSpawningConfig {
  minClusters: number;
  maxClusters: number;
  radius: number;
  attributes: SpawningAttributesConfig;
}

/** Resource spawning configuration */
export interface ResourceSpawningConfig {
  clusterCount: number;
}

/** Clustered spawning configuration */
export interface ClusteredSpawningConfig {
  resources: ResourceSpawningConfig;
  prey: SpeciesSpawningConfig;
  predator: SpeciesSpawningConfig;
}

/** Species conversion contact tracking */
export interface ContactTrackingConfig {
  frameWindow: number;
  sameSpeciesContactRequired: number;
  resetOnOppositeContact: boolean;
  contactMemoryDuration: number;
  isolationThreshold: number;
}

/** Population conditions for conversion */
export interface PopulationConditionsConfig {
  enabled: boolean;
  enableRatio: number;
  minPopulationCheck: number;
  disableRatio: number;
}

/** Trait influence for conversion */
export interface TraitInfluenceConfig {
  strengthWeight: number;
  stealthWeight: number;
  traitThreshold: number;
  extremeTraitBonus: number;
  maxProbability: number;
}

/** Species conversion configuration */
export interface SpeciesConversionConfig {
  enabled: boolean;
  contactTracking: ContactTrackingConfig;
  baseProbability: number;
  populationConditions: PopulationConditionsConfig;
  traitInfluence: {
    prey: TraitInfluenceConfig;
    predator: TraitInfluenceConfig;
  };
  debugConversionChecks: boolean;
  limitConversionsPerUpdate: boolean;
  maxConversionsPerUpdate: number;
  evolutionCooldown: number;
  visualEffectDuration: number;
}

/** Spontaneous prey spawning configuration */
export interface SpontaneousPreyConfig {
  enabled: boolean;
  resourceThreshold: number;
  spawnChance: number;
  maxPerCycle: number;
}

/** Complete simulation configuration */
export interface SimulationConfigType {
  ui: UIConfig;
  environment: EnvironmentConfig;
  initialPopulation: InitialPopulationConfig;
  resources: ResourcesConfig;
  creatures: CreaturesConfig;
  predator: PredatorConfig;
  prey: PreyConfig;
  learning: LearningConfig;
  reproduction: ReproductionConfig;
  starvation: StarvationConfig;
  clusteredSpawning: ClusteredSpawningConfig;
  speciesConversion: SpeciesConversionConfig;
  spontaneousPrey: SpontaneousPreyConfig;
}
