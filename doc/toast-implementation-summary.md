# PreyLife Toast Implementation Summary

This document summarizes the toast notification system implementation in PreyLife simulation. The toast system provides two types of notifications:

1. **Ephemeral Toasts**: Brief notifications for common simulation events
2. **Info Toasts**: Educational notifications that appear only once per simulation run

## Implemented Toast Events

### Ephemeral Toast Events

| Event | Trigger Location | Description |
|-------|-----------------|-------------|
| `PREY_BORN` | `SimulationEngine.handleReproduction()` | Shows when new prey are born through reproduction |
| `PREDATOR_BORN` | `SimulationEngine.handleReproduction()` | Shows when new predators are born through reproduction |
| `PREY_DIED` | `SimulationEngine.removeDeadEntities()` | Shows when prey die from causes other than predation |
| `PREDATOR_DIED` | `SimulationEngine.removeDeadEntities()` | Shows when predators die |
| `RESOURCE_SPAWNED` | `SimulationEngine.checkSeasonsAndSpawnResources()` | Shows during major resource spawning events like blooms |
| `RESOURCE_CONSUMED` | `SimulationEngine.handleResourceConsumption()` | Shows when prey consumes resources (not shown for every consumption to reduce spam) |
| `PREY_CONSUMED` | `SimulationEngine.handlePredation()` | Shows when a predator successfully catches and consumes prey |
| `PREY_ESCAPED` | `SimulationEngine.handlePredation()` | Shows when prey successfully escapes from a predator using stealth |
| `PREY_LEARNED` | `SimulationEngine.handleCreatureLearning()` | Shows when prey learns behaviors/traits from other prey (random sampling) |
| `PREDATOR_LEARNED` | `SimulationEngine.handleCreatureLearning()` | Shows when predators learn behaviors/traits from other predators (random sampling) |

### Info Toast Events

| Event | Trigger Location | Description |
|-------|-----------------|-------------|
| `FIRST_EXTINCTION` | `SimulationEngine.checkForExtinction()` | Shows when a species goes extinct for the first time |
| `FIRST_EVOLUTION` | `SimulationEngine.handleSpeciesConversion()` | Shows when an evolution/species conversion occurs for the first time |
| `RESOURCE_BLOOM` | `SimulationEngine.checkSeasonsAndSpawnResources()` | Shows when a seasonal resource bloom begins |
| `HIGH_PREY_DENSITY` | `UIController.checkInfoToastConditions()` | Shows when prey population exceeds 3× initial count |
| `HIGH_PREDATOR_DENSITY` | `UIController.checkInfoToastConditions()` | Shows when predator population exceeds 3× initial count |
| `LOW_RESOURCE_WARNING` | `UIController.checkInfoToastConditions()` | Shows when resources drop below 15% of initial count |
| `PREY_ATTRIBUTES_SPECIALIZED` | `UIController.checkInfoToastConditions()` | Shows when prey develop specialized attributes (>0.75) |
| `PREDATOR_ATTRIBUTES_SPECIALIZED` | `UIController.checkInfoToastConditions()` | Shows when predators develop specialized attributes (>0.75) |
| `ECOSYSTEM_BALANCED` | `UIController.checkInfoToastConditions()` | Shows when population remains stable (±25%) for 100+ days |
| `ECOSYSTEM_COLLAPSE_WARNING` | `UIController.checkInfoToastConditions()` | Shows when both populations decline by >60% over 20 days |

## Toast Behavior

- Ephemeral toasts appear for 2-3 seconds and fade out automatically
- Info toasts appear for 6-8 seconds with more educational content
- Multiple identical ephemeral events are aggregated with counts (e.g., "+5 prey")
- Info toasts appear only once per simulation run but reset when simulation is reset
- Toasts are positioned in the top-right corner
- Toasts automatically fade in and out with smooth animations

## Implementation Details

- `ToastManager` is implemented as a singleton for consistent notification management
- Toasts are tracked across the simulation to avoid repeating info toasts
- Ephemeral toasts are batched to avoid UI clutter for rapid events
- Population history is tracked to detect ecosystem stability/instability
- All toast flags are reset when the simulation is reset

## Key Files

- `src/ui/ToastManager.ts`: Core implementation of the toast system
- `src/engine/SimulationEngine.ts`: Contains wiring for simulation-specific events
- `src/ui/UIController.ts`: Contains wiring for UI-related events
- `doc/toast-framework.md`: Detailed framework documentation
- `doc/toast-implementation.md`: Implementation guide with code examples