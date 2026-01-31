/**
 * Configuration Module - Central configuration management
 *
 * This module provides the simulation configuration with type safety,
 * validation, and default values. Import SimulationConfig for the
 * current configuration values.
 */

export * from './types';
export * from './validation';
export { DEFAULT_CONFIG } from './defaults';

import type { SimulationConfigType } from './types';
import { DEFAULT_CONFIG } from './defaults';
import { assertValidConfig } from './validation';

/**
 * Deep clone an object
 */
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Deep merge two objects
 */
function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const output = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = target[key];

      if (
        sourceValue !== null &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        (output as Record<string, unknown>)[key] = deepMerge(
          targetValue as object,
          sourceValue as object
        );
      } else if (sourceValue !== undefined) {
        (output as Record<string, unknown>)[key] = sourceValue;
      }
    }
  }

  return output;
}

/**
 * The active simulation configuration
 * This is a mutable copy of the defaults that can be modified at runtime
 */
export const SimulationConfig: SimulationConfigType = deepClone(DEFAULT_CONFIG);

// Validate the default configuration on load
assertValidConfig(SimulationConfig);

/**
 * Reset configuration to defaults
 */
export function resetConfig(): void {
  Object.assign(SimulationConfig, deepClone(DEFAULT_CONFIG));
}

/**
 * Update configuration with partial values
 * Validates the resulting configuration before applying
 */
export function updateConfig(updates: Partial<SimulationConfigType>): void {
  const newConfig = deepMerge(SimulationConfig, updates);
  assertValidConfig(newConfig);
  Object.assign(SimulationConfig, newConfig);
}

/**
 * Get a copy of the current configuration
 */
export function getConfigSnapshot(): SimulationConfigType {
  return deepClone(SimulationConfig);
}

/**
 * Load configuration from a JSON object
 * Validates before applying
 */
export function loadConfig(config: SimulationConfigType): void {
  assertValidConfig(config);
  Object.assign(SimulationConfig, deepClone(config));
}
