# PreyLife Toast Framework

This document describes the notification system that provides feedback about simulation events through two types of toast notifications.

## Toast Types

### 1. Ephemeral Toasts
Small, non-intrusive notifications that appear briefly and can group similar events.

- **Format**: Icon + short message
- **Duration**: 2-3 seconds
- **Position**: Top-right corner of the screen
- **Behavior**: 
  - Group identical events within a short time window
  - Show count when multiple instances occur ("+5 prey")
  - Fade in and out smoothly

### 2. Info Toasts
Larger educational callouts that explain important concepts when they first occur.

- **Format**: Icon + title + detailed message
- **Duration**: 6-8 seconds
- **Position**: Top-right corner of the screen
- **Behavior**:
  - Show only once per simulation run
  - More prominent appearance with colored border
  - Fade in and out smoothly

## Event Categories

### Ephemeral Events

| Event | Trigger Condition | Message | Icon |
|-------|-------------------|---------|------|
| `PREY_BORN` | When new prey are created through reproduction | "+{count} prey" | 🔵 |
| `PREDATOR_BORN` | When new predators are created through reproduction | "+{count} predator" | 🔺 |
| `PREY_DIED` | When prey die (not from predation) | "-{count} prey" | 🔵 |
| `PREDATOR_DIED` | When predators die | "-{count} predator" | 🔺 |
| `RESOURCE_SPAWNED` | When new resources are generated (only for significant spawns) | "+{count} resources" | 🟩 |
| `RESOURCE_CONSUMED` | When prey consumes a resource | "Resource consumed" | 🍽️ |
| `PREY_CONSUMED` | When a predator catches and consumes prey | "Prey consumed" | 🎯 |
| `PREY_ESCAPED` | When prey successfully escapes a predator using stealth | "Prey escaped!" | 💨 |
| `PREY_LEARNED` | When prey learns from another prey | "Prey learned" | 💡 |
| `PREDATOR_LEARNED` | When predator learns from another predator | "Predator learned" | 💡 |

### Info Events

| Event | Trigger Condition | Title | Message |
|-------|-------------------|-------|---------|
| `FIRST_EXTINCTION` | First time a species goes extinct | "Extinction Event" | "A species has gone extinct. This affects the entire ecosystem balance." |
| `FIRST_EVOLUTION` | First time a species conversion occurs | "Evolution Detected" | "Species have evolved! Creatures can change type based on traits and environment." |
| `RESOURCE_BLOOM` | When a seasonal resource bloom begins | "Resource Bloom" | "Environmental conditions have triggered a resource bloom - food is abundant!" |
| `HIGH_PREY_DENSITY` | When prey population exceeds 3x initial count | "High Prey Density" | "Prey population is very high. This may lead to resource depletion." |
| `HIGH_PREDATOR_DENSITY` | When predator population exceeds 3x initial count | "High Predator Density" | "Predator population surge detected. Prey may face extinction risk." |
| `LOW_RESOURCE_WARNING` | When resources drop below 15% of initial count | "Resource Depletion" | "Resources are running low. Prey population may crash soon." |
| `PREY_ATTRIBUTES_SPECIALIZED` | When average prey attribute exceeds 0.75 | "Prey Specialization" | "Prey have developed specialized traits to survive in this environment." |
| `PREDATOR_ATTRIBUTES_SPECIALIZED` | When average predator attribute exceeds 0.75 | "Predator Specialization" | "Predators have evolved specialized hunting strategies." |
| `ECOSYSTEM_BALANCED` | When populations remain stable for 100+ days | "Balanced Ecosystem" | "The ecosystem has reached a sustainable balance between all species." |
| `ECOSYSTEM_COLLAPSE_WARNING` | When multiple population metrics indicate instability | "Ecosystem Stress" | "Multiple indicators suggest the ecosystem is under severe stress." |

## Integration Points

To integrate this toast system with the simulation engine, calls to `ToastManager` should be added in these key locations:

1. **SimulationEngine.ts**:
   - `handleReproduction()`: Show PREY_BORN and PREDATOR_BORN toasts
   - `handlePredation()`: Show PREY_CONSUMED and PREY_ESCAPED toasts
   - `handleResourceConsumption()`: Show RESOURCE_CONSUMED toast
   - `removeDeadEntities()`: Show PREY_DIED and PREDATOR_DIED toasts
   - `regenerateResources()`: Show RESOURCE_SPAWNED toast (for significant spawns only)
   - `handleLearning()`: Show PREY_LEARNED and PREDATOR_LEARNED toasts
   - `checkForExtinction()`: Show FIRST_EXTINCTION info toast
   - `handleSpeciesConversion()`: Show FIRST_EVOLUTION info toast
   - `checkSeasonsAndSpawnResources()`: Show RESOURCE_BLOOM info toast

2. **UIController.ts**:
   - `updateStats()`: Check for conditions that trigger INFO_TOASTS:
     - Population thresholds (HIGH_PREY_DENSITY, HIGH_PREDATOR_DENSITY)
     - Resource depletion (LOW_RESOURCE_WARNING)
     - Attribute specialization (PREY/PREDATOR_ATTRIBUTES_SPECIALIZED)
     - Ecosystem balance or stress (ECOSYSTEM_BALANCED, ECOSYSTEM_COLLAPSE_WARNING)

## Implementation Notes

- The ToastManager is implemented as a singleton to ensure only one instance manages notifications
- The ToastManager maintains a list of seen INFO events to avoid showing them multiple times
- When the simulation resets, the seen INFO events list should be cleared
- Ephemeral toasts should be batched to avoid UI clutter for rapidly occurring events
- Toast appearance should be consistent with the game's visual style
- Toast container is absolutely positioned to avoid interfering with the simulation
- All animations are CSS-based for optimal performance