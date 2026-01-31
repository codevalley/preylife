/**
 * SimulationEvents - Type definitions for all simulation events
 *
 * These events provide decoupled communication between simulation systems
 * and UI components. Systems emit events, UI subscribes to events.
 */

import type { GeneticAttributes } from '../entities/Creature';

// Entity type identifiers
export type EntityType = 'prey' | 'predator' | 'resource';

// Base event interface
export interface BaseEvent {
  timestamp: number;
  day: number;
}

// Entity lifecycle events
export interface EntityCreatedEvent extends BaseEvent {
  type: 'ENTITY_CREATED';
  entityType: EntityType;
  entityId: string;
  position: { x: number; y: number };
  cause: 'spawn' | 'reproduction' | 'conversion';
  parentId?: string;
}

export interface EntityDiedEvent extends BaseEvent {
  type: 'ENTITY_DIED';
  entityType: EntityType;
  entityId: string;
  position: { x: number; y: number };
  cause: 'starvation' | 'predation' | 'age' | 'conversion';
  age: number;
  energy: number;
}

// Predation events
export interface PreyConsumedEvent extends BaseEvent {
  type: 'PREY_CONSUMED';
  preyId: string;
  predatorId: string;
  preyPosition: { x: number; y: number };
  energyGained: number;
}

export interface PreyEscapedEvent extends BaseEvent {
  type: 'PREY_ESCAPED';
  preyId: string;
  predatorId: string;
  escapeMethod: 'stealth' | 'speed';
}

// Resource events
export interface ResourceConsumedEvent extends BaseEvent {
  type: 'RESOURCE_CONSUMED';
  resourceId: string;
  preyId: string;
  energyGained: number;
}

export interface ResourceSpawnedEvent extends BaseEvent {
  type: 'RESOURCE_SPAWNED';
  count: number;
  cause: 'natural' | 'bloom' | 'death' | 'emergency';
  position?: { x: number; y: number }; // For single spawns
}

export interface ResourceBloomEvent extends BaseEvent {
  type: 'RESOURCE_BLOOM';
  totalResources: number;
  clusterCount: number;
}

// Reproduction events
export interface ReproductionEvent extends BaseEvent {
  type: 'REPRODUCTION';
  entityType: EntityType;
  parentId: string;
  offspringId: string;
  parentAttributes: GeneticAttributes;
  offspringAttributes: GeneticAttributes;
  mutated: boolean;
}

// Learning events
export interface LearningEvent extends BaseEvent {
  type: 'LEARNING';
  entityType: EntityType;
  learnerId: string;
  teacherId: string;
  attribute: keyof GeneticAttributes;
  oldValue: number;
  newValue: number;
}

// Species conversion events
export interface SpeciesConversionEvent extends BaseEvent {
  type: 'SPECIES_CONVERSION';
  fromType: EntityType;
  toType: EntityType;
  originalId: string;
  newId: string;
  attributes: GeneticAttributes;
}

// Population events
export interface ExtinctionEvent extends BaseEvent {
  type: 'EXTINCTION';
  species: EntityType;
  lastPopulation: number;
  preyCount: number;
  predatorCount: number;
  resourceCount: number;
}

export interface PopulationMilestoneEvent extends BaseEvent {
  type: 'POPULATION_MILESTONE';
  species: EntityType;
  population: number;
  milestone: 'low' | 'high' | 'critical';
  threshold: number;
}

// Simulation control events
export interface SimulationStartedEvent extends BaseEvent {
  type: 'SIMULATION_STARTED';
}

export interface SimulationPausedEvent extends BaseEvent {
  type: 'SIMULATION_PAUSED';
}

export interface SimulationResetEvent extends BaseEvent {
  type: 'SIMULATION_RESET';
  initialPrey: number;
  initialPredators: number;
  initialResources: number;
}

export interface DayChangedEvent extends BaseEvent {
  type: 'DAY_CHANGED';
  newDay: number;
}

// Statistics events
export interface StatsUpdatedEvent extends BaseEvent {
  type: 'STATS_UPDATED';
  preyCount: number;
  predatorCount: number;
  resourceCount: number;
  preyAttributes: GeneticAttributes;
  predatorAttributes: GeneticAttributes;
}

// Union type of all events
export type SimulationEvent =
  | EntityCreatedEvent
  | EntityDiedEvent
  | PreyConsumedEvent
  | PreyEscapedEvent
  | ResourceConsumedEvent
  | ResourceSpawnedEvent
  | ResourceBloomEvent
  | ReproductionEvent
  | LearningEvent
  | SpeciesConversionEvent
  | ExtinctionEvent
  | PopulationMilestoneEvent
  | SimulationStartedEvent
  | SimulationPausedEvent
  | SimulationResetEvent
  | DayChangedEvent
  | StatsUpdatedEvent;

// Event type string union for type-safe subscriptions
export type SimulationEventType = SimulationEvent['type'];

// Helper type to get event by type
export type EventByType<T extends SimulationEventType> = Extract<SimulationEvent, { type: T }>;
