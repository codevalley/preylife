/**
 * Configuration Re-export for Backward Compatibility
 *
 * This file re-exports the configuration from the new config module
 * to maintain backward compatibility with existing imports.
 *
 * Prefer importing from './config/index' for new code.
 */

export {
  SimulationConfig,
  resetConfig,
  updateConfig,
  getConfigSnapshot,
  loadConfig,
  DEFAULT_CONFIG
} from './config/index';

export type { SimulationConfigType } from './config/types';
