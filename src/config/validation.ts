/**
 * Configuration Validation - Runtime validation for configuration values
 *
 * Validates configuration values to catch errors early and provide
 * helpful error messages for misconfigured parameters.
 */

import type { SimulationConfigType } from './types';

export interface ValidationError {
  path: string;
  message: string;
  value: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

/**
 * Validate that a value is within a range
 */
function validateRange(
  value: number,
  min: number,
  max: number,
  path: string,
  errors: ValidationError[]
): void {
  if (value < min || value > max) {
    errors.push({
      path,
      message: `Value must be between ${min} and ${max}`,
      value
    });
  }
}

/**
 * Validate that a value is a positive number
 */
function validatePositive(
  value: number,
  path: string,
  errors: ValidationError[]
): void {
  if (value <= 0) {
    errors.push({
      path,
      message: 'Value must be positive',
      value
    });
  }
}

/**
 * Validate that a value is a non-negative number
 */
function validateNonNegative(
  value: number,
  path: string,
  errors: ValidationError[]
): void {
  if (value < 0) {
    errors.push({
      path,
      message: 'Value must be non-negative',
      value
    });
  }
}

/**
 * Validate that a value is a probability (0-1)
 */
function validateProbability(
  value: number,
  path: string,
  errors: ValidationError[]
): void {
  if (value < 0 || value > 1) {
    errors.push({
      path,
      message: 'Probability must be between 0 and 1',
      value
    });
  }
}

/**
 * Validate attribute ranges [min, max]
 */
function validateAttributeRange(
  range: [number, number],
  path: string,
  errors: ValidationError[]
): void {
  if (range[0] < 0 || range[0] > 1) {
    errors.push({
      path: `${path}[0]`,
      message: 'Minimum attribute value must be between 0 and 1',
      value: range[0]
    });
  }
  if (range[1] < 0 || range[1] > 1) {
    errors.push({
      path: `${path}[1]`,
      message: 'Maximum attribute value must be between 0 and 1',
      value: range[1]
    });
  }
  if (range[0] > range[1]) {
    errors.push({
      path,
      message: 'Minimum must be less than or equal to maximum',
      value: range
    });
  }
}

/**
 * Validate the complete simulation configuration
 */
export function validateConfig(config: SimulationConfigType): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // Environment validation
  validatePositive(config.environment.width, 'environment.width', errors);
  validatePositive(config.environment.height, 'environment.height', errors);

  // Initial population validation
  validateNonNegative(config.initialPopulation.resources, 'initialPopulation.resources', errors);
  validateNonNegative(config.initialPopulation.prey, 'initialPopulation.prey', errors);
  validateNonNegative(config.initialPopulation.predators, 'initialPopulation.predators', errors);

  // Resource validation
  validatePositive(config.resources.defaultEnergy, 'resources.defaultEnergy', errors);
  validateProbability(config.resources.regenerationChance, 'resources.regenerationChance', errors);
  validateProbability(config.resources.emergencyRegenerationThreshold, 'resources.emergencyRegenerationThreshold', errors);
  validateProbability(config.resources.emergencyRegenerationChance, 'resources.emergencyRegenerationChance', errors);
  validatePositive(config.resources.limits.maxCount, 'resources.limits.maxCount', errors);
  validateProbability(config.resources.limits.enforcementThreshold, 'resources.limits.enforcementThreshold', errors);

  // Creature validation
  validatePositive(config.creatures.baseSpeed, 'creatures.baseSpeed', errors);
  validatePositive(config.creatures.baseCost, 'creatures.baseCost', errors);
  validatePositive(config.creatures.maxLifespan.base, 'creatures.maxLifespan.base', errors);
  validateNonNegative(config.creatures.maxLifespan.longevityBonus, 'creatures.maxLifespan.longevityBonus', errors);

  // Predator validation
  validatePositive(config.predator.maxEnergy, 'predator.maxEnergy', errors);
  validateRange(config.predator.defaultAttributes.strength, 0, 1, 'predator.defaultAttributes.strength', errors);
  validateRange(config.predator.defaultAttributes.stealth, 0, 1, 'predator.defaultAttributes.stealth', errors);
  validateRange(config.predator.defaultAttributes.learnability, 0, 1, 'predator.defaultAttributes.learnability', errors);
  validateRange(config.predator.defaultAttributes.longevity, 0, 1, 'predator.defaultAttributes.longevity', errors);
  validateProbability(config.predator.captureChance.baseChance, 'predator.captureChance.baseChance', errors);
  validateProbability(config.predator.captureChance.minChance, 'predator.captureChance.minChance', errors);
  validateProbability(config.predator.captureChance.maxChance, 'predator.captureChance.maxChance', errors);
  validateProbability(config.predator.energyGainFromPrey, 'predator.energyGainFromPrey', errors);

  // Prey validation
  validatePositive(config.prey.maxEnergy, 'prey.maxEnergy', errors);
  validateRange(config.prey.defaultAttributes.strength, 0, 1, 'prey.defaultAttributes.strength', errors);
  validateRange(config.prey.defaultAttributes.stealth, 0, 1, 'prey.defaultAttributes.stealth', errors);
  validateRange(config.prey.defaultAttributes.learnability, 0, 1, 'prey.defaultAttributes.learnability', errors);
  validateRange(config.prey.defaultAttributes.longevity, 0, 1, 'prey.defaultAttributes.longevity', errors);
  validateProbability(config.prey.escapeBaseChance, 'prey.escapeBaseChance', errors);

  // Learning validation
  validateProbability(config.learning.chanceMultiplier, 'learning.chanceMultiplier', errors);
  validateProbability(config.learning.learningRate, 'learning.learningRate', errors);
  validatePositive(config.learning.maxLearningAmount, 'learning.maxLearningAmount', errors);

  // Reproduction validation
  validateProbability(config.reproduction.mutationChance, 'reproduction.mutationChance', errors);
  validatePositive(config.reproduction.mutationRange, 'reproduction.mutationRange', errors);
  validateProbability(config.reproduction.energyThreshold.prey, 'reproduction.energyThreshold.prey', errors);
  validateProbability(config.reproduction.energyThreshold.predator, 'reproduction.energyThreshold.predator', errors);
  validateProbability(config.reproduction.probability.highEnergy.prey, 'reproduction.probability.highEnergy.prey', errors);
  validateProbability(config.reproduction.probability.highEnergy.predator, 'reproduction.probability.highEnergy.predator', errors);
  validateProbability(config.reproduction.juvenileMaturity, 'reproduction.juvenileMaturity', errors);

  // Clustered spawning validation
  validateAttributeRange(config.clusteredSpawning.prey.attributes.strengthRange, 'clusteredSpawning.prey.attributes.strengthRange', errors);
  validateAttributeRange(config.clusteredSpawning.prey.attributes.stealthRange, 'clusteredSpawning.prey.attributes.stealthRange', errors);
  validateAttributeRange(config.clusteredSpawning.prey.attributes.learnabilityRange, 'clusteredSpawning.prey.attributes.learnabilityRange', errors);
  validateAttributeRange(config.clusteredSpawning.prey.attributes.longevityRange, 'clusteredSpawning.prey.attributes.longevityRange', errors);
  validateAttributeRange(config.clusteredSpawning.predator.attributes.strengthRange, 'clusteredSpawning.predator.attributes.strengthRange', errors);
  validateAttributeRange(config.clusteredSpawning.predator.attributes.stealthRange, 'clusteredSpawning.predator.attributes.stealthRange', errors);
  validateAttributeRange(config.clusteredSpawning.predator.attributes.learnabilityRange, 'clusteredSpawning.predator.attributes.learnabilityRange', errors);
  validateAttributeRange(config.clusteredSpawning.predator.attributes.longevityRange, 'clusteredSpawning.predator.attributes.longevityRange', errors);

  // Species conversion validation
  validateProbability(config.speciesConversion.baseProbability, 'speciesConversion.baseProbability', errors);
  validateProbability(config.speciesConversion.traitInfluence.prey.maxProbability, 'speciesConversion.traitInfluence.prey.maxProbability', errors);
  validateProbability(config.speciesConversion.traitInfluence.predator.maxProbability, 'speciesConversion.traitInfluence.predator.maxProbability', errors);

  // Warnings for potentially problematic configurations
  if (config.initialPopulation.prey === 0 && config.initialPopulation.predators > 0) {
    warnings.push('Starting with predators but no prey will quickly lead to predator extinction');
  }

  if (config.initialPopulation.resources === 0) {
    warnings.push('Starting with no resources will cause prey to starve quickly');
  }

  if (config.predator.captureChance.minChance > config.predator.captureChance.maxChance) {
    warnings.push('Predator minimum capture chance is greater than maximum');
  }

  if (config.reproduction.energyThreshold.prey > 0.95) {
    warnings.push('Prey reproduction threshold is very high, may inhibit population growth');
  }

  if (config.reproduction.energyThreshold.predator > 0.95) {
    warnings.push('Predator reproduction threshold is very high, may inhibit population growth');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Throw an error if configuration is invalid
 */
export function assertValidConfig(config: SimulationConfigType): void {
  const result = validateConfig(config);

  if (!result.valid) {
    const errorMessages = result.errors.map(
      e => `  - ${e.path}: ${e.message} (got: ${JSON.stringify(e.value)})`
    ).join('\n');
    throw new Error(`Invalid simulation configuration:\n${errorMessages}`);
  }

  if (result.warnings.length > 0) {
    console.warn('Configuration warnings:');
    for (const warning of result.warnings) {
      console.warn(`  - ${warning}`);
    }
  }
}
