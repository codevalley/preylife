/**
 * SaveManager - Handles saving and loading simulation state
 *
 * Provides functionality to:
 * - Save current simulation state to JSON
 * - Load simulation state from JSON
 * - Export statistics to CSV
 * - Manage localStorage saves
 */

import type { World } from '../core/World';
import type { GeneticAttributes } from '../entities/Creature';
import { Prey } from '../entities/Prey';
import { Predator } from '../entities/Predator';
import { Resource } from '../entities/Resource';
import { loadConfig, getConfigSnapshot } from '../config';
import type { SimulationConfigType } from '../config/types';

// Save format version for compatibility checking
const SAVE_VERSION = '1.0.0';

// Serialized entity interfaces
interface SerializedResource {
  id: string;
  x: number;
  y: number;
  energy: number;
  creationTime: number;
}

interface SerializedCreature {
  id: string;
  x: number;
  y: number;
  energy: number;
  maxEnergy: number;
  age: number;
  attributes: GeneticAttributes;
  velocityX: number;
  velocityY: number;
  offspringCount: number;
  foodConsumed: number;
  timeSinceLastReproduction: number;
}

interface SerializedStatistics {
  prey: {
    deaths: { hunting: number; starvation: number; age: number; total: number };
    births: { reproduction: number; conversion: number; spawned: number };
  };
  predators: {
    deaths: { starvation: number; age: number; total: number };
    births: { reproduction: number; conversion: number; spawned: number };
    preyConsumed: number;
  };
  resources: {
    fromCreatureDeath: number;
    natural: number;
    spawned: number;
  };
}

interface SaveData {
  version: string;
  timestamp: number;
  name: string;
  days: number;
  frameCount: number;
  config: SimulationConfigType;
  resources: SerializedResource[];
  prey: SerializedCreature[];
  predators: SerializedCreature[];
  statistics: SerializedStatistics;
}

interface SaveMetadata {
  name: string;
  timestamp: number;
  days: number;
  preyCount: number;
  predatorCount: number;
  resourceCount: number;
}

export class SaveManager {
  private static instance: SaveManager | null = null;
  private readonly storageKey = 'preylife_saves';
  private readonly maxAutoSaves = 5;

  private constructor() {}

  static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  /**
   * Create a save data object from the current world state
   */
  createSaveData(world: World, name: string = 'Unnamed Save'): SaveData {
    return {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      name,
      days: world.days,
      frameCount: world.frameCount,
      config: getConfigSnapshot(),
      resources: this.serializeResources(world),
      prey: this.serializePrey(world),
      predators: this.serializePredators(world),
      statistics: this.serializeStatistics(world)
    };
  }

  /**
   * Serialize resources to JSON-safe format
   */
  private serializeResources(world: World): SerializedResource[] {
    return [...world.resources].map(resource => ({
      id: resource.id,
      x: resource.position.x,
      y: resource.position.y,
      energy: resource.energy,
      creationTime: resource.creationTime
    }));
  }

  /**
   * Serialize prey to JSON-safe format
   */
  private serializePrey(world: World): SerializedCreature[] {
    return [...world.prey].map(prey => ({
      id: prey.id,
      x: prey.position.x,
      y: prey.position.y,
      energy: prey.energy,
      maxEnergy: prey.maxEnergy,
      age: prey.age,
      attributes: { ...prey.attributes },
      velocityX: prey.velocity.x,
      velocityY: prey.velocity.y,
      offspringCount: prey.offspringCount,
      foodConsumed: prey.foodConsumed,
      timeSinceLastReproduction: prey.timeSinceLastReproduction
    }));
  }

  /**
   * Serialize predators to JSON-safe format
   */
  private serializePredators(world: World): SerializedCreature[] {
    return [...world.predators].map(predator => ({
      id: predator.id,
      x: predator.position.x,
      y: predator.position.y,
      energy: predator.energy,
      maxEnergy: predator.maxEnergy,
      age: predator.age,
      attributes: { ...predator.attributes },
      velocityX: predator.velocity.x,
      velocityY: predator.velocity.y,
      offspringCount: predator.offspringCount,
      foodConsumed: predator.foodConsumed,
      timeSinceLastReproduction: predator.timeSinceLastReproduction
    }));
  }

  /**
   * Serialize statistics
   */
  private serializeStatistics(world: World): SerializedStatistics {
    const stats = world.statistics;
    return {
      prey: {
        deaths: { ...stats.prey.deaths },
        births: { ...stats.prey.births }
      },
      predators: {
        deaths: { ...stats.predators.deaths },
        births: { ...stats.predators.births },
        preyConsumed: stats.predators.preyConsumed
      },
      resources: { ...stats.resources }
    };
  }

  /**
   * Load save data into a world
   */
  loadSaveData(world: World, saveData: SaveData): void {
    // Validate version
    if (saveData.version !== SAVE_VERSION) {
      console.warn(`Save version mismatch: ${saveData.version} vs ${SAVE_VERSION}`);
    }

    // Clear existing world
    world.clear();

    // Load configuration
    loadConfig(saveData.config);

    // Load resources
    for (const r of saveData.resources) {
      const resource = new Resource(r.x, r.y, r.energy);
      resource.creationTime = r.creationTime;
      world.addResource(resource, 'spawned');
    }

    // Load prey
    for (const p of saveData.prey) {
      const prey = new Prey(p.x, p.y, p.maxEnergy, p.attributes);
      prey.energy = p.energy;
      prey.age = p.age;
      prey.velocity.set(p.velocityX, p.velocityY);
      prey.offspringCount = p.offspringCount;
      prey.foodConsumed = p.foodConsumed;
      prey.timeSinceLastReproduction = p.timeSinceLastReproduction;
      world.addPrey(prey, 'spawned');
    }

    // Load predators
    for (const p of saveData.predators) {
      const predator = new Predator(p.x, p.y, p.maxEnergy, p.attributes);
      predator.energy = p.energy;
      predator.age = p.age;
      predator.velocity.set(p.velocityX, p.velocityY);
      predator.offspringCount = p.offspringCount;
      predator.foodConsumed = p.foodConsumed;
      predator.timeSinceLastReproduction = p.timeSinceLastReproduction;
      world.addPredator(predator, 'spawned');
    }

    // Note: World time (days/frameCount) would need to be set via World methods
    // Statistics would need a restore method in World
  }

  /**
   * Save to localStorage
   */
  saveToLocalStorage(world: World, name: string): boolean {
    try {
      const saveData = this.createSaveData(world, name);
      const saves = this.getLocalStorageSaves();

      // Add or update save
      const existingIndex = saves.findIndex(s => s.name === name);
      if (existingIndex >= 0) {
        saves[existingIndex] = saveData;
      } else {
        saves.push(saveData);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(saves));
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }

  /**
   * Load from localStorage
   */
  loadFromLocalStorage(world: World, name: string): boolean {
    try {
      const saves = this.getLocalStorageSaves();
      const saveData = saves.find(s => s.name === name);

      if (!saveData) {
        console.error(`Save "${name}" not found`);
        return false;
      }

      this.loadSaveData(world, saveData);
      return true;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return false;
    }
  }

  /**
   * Get list of saves in localStorage
   */
  getLocalStorageSaves(): SaveData[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get metadata for all saves
   */
  getSaveMetadata(): SaveMetadata[] {
    return this.getLocalStorageSaves().map(save => ({
      name: save.name,
      timestamp: save.timestamp,
      days: save.days,
      preyCount: save.prey.length,
      predatorCount: save.predators.length,
      resourceCount: save.resources.length
    }));
  }

  /**
   * Delete a save from localStorage
   */
  deleteSave(name: string): boolean {
    try {
      const saves = this.getLocalStorageSaves();
      const filtered = saves.filter(s => s.name !== name);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete save:', error);
      return false;
    }
  }

  /**
   * Export save data as a downloadable JSON file
   */
  exportToFile(world: World, filename: string = 'preylife-save.json'): void {
    const saveData = this.createSaveData(world, filename.replace('.json', ''));
    const json = JSON.stringify(saveData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Import save data from a file
   */
  async importFromFile(world: World, file: File): Promise<boolean> {
    try {
      const text = await file.text();
      const saveData: SaveData = JSON.parse(text);

      // Validate save data structure
      if (!saveData.version || !saveData.resources || !saveData.prey || !saveData.predators) {
        throw new Error('Invalid save file format');
      }

      this.loadSaveData(world, saveData);
      return true;
    } catch (error) {
      console.error('Failed to import save file:', error);
      return false;
    }
  }

  /**
   * Export statistics to CSV
   */
  exportStatisticsToCSV(world: World, filename: string = 'preylife-stats.csv'): void {
    const stats = world.statistics;

    const rows = [
      ['Category', 'Metric', 'Value'],
      ['Prey', 'Deaths - Hunting', stats.prey.deaths.hunting],
      ['Prey', 'Deaths - Starvation', stats.prey.deaths.starvation],
      ['Prey', 'Deaths - Age', stats.prey.deaths.age],
      ['Prey', 'Deaths - Total', stats.prey.deaths.total],
      ['Prey', 'Births - Reproduction', stats.prey.births.reproduction],
      ['Prey', 'Births - Conversion', stats.prey.births.conversion],
      ['Prey', 'Births - Spawned', stats.prey.births.spawned],
      ['Predators', 'Deaths - Starvation', stats.predators.deaths.starvation],
      ['Predators', 'Deaths - Age', stats.predators.deaths.age],
      ['Predators', 'Deaths - Total', stats.predators.deaths.total],
      ['Predators', 'Births - Reproduction', stats.predators.births.reproduction],
      ['Predators', 'Births - Conversion', stats.predators.births.conversion],
      ['Predators', 'Births - Spawned', stats.predators.births.spawned],
      ['Predators', 'Prey Consumed', stats.predators.preyConsumed],
      ['Resources', 'From Creature Death', stats.resources.fromCreatureDeath],
      ['Resources', 'Natural', stats.resources.natural],
      ['Resources', 'Spawned', stats.resources.spawned],
      ['Population', 'Current Prey', world.preyCount],
      ['Population', 'Current Predators', world.predatorCount],
      ['Population', 'Current Resources', world.resourceCount],
      ['Time', 'Days', world.days]
    ];

    const csv = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Auto-save functionality
   */
  autoSave(world: World): void {
    const name = `autosave-${Date.now()}`;
    this.saveToLocalStorage(world, name);

    // Clean up old autosaves
    const saves = this.getLocalStorageSaves();
    const autosaves = saves
      .filter(s => s.name.startsWith('autosave-'))
      .sort((a, b) => b.timestamp - a.timestamp);

    // Keep only the most recent autosaves
    const toDelete = autosaves.slice(this.maxAutoSaves);
    for (const save of toDelete) {
      this.deleteSave(save.name);
    }
  }
}

/**
 * Convenience function to get the SaveManager instance
 */
export function getSaveManager(): SaveManager {
  return SaveManager.getInstance();
}
