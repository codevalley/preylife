# Session: Architecture Overhaul & Documentation

**Date:** January 31, 2026
**Duration:** ~2 hours
**Focus:** Complete architecture reimagining and comprehensive documentation

---

## Overview

This session transformed PreyLife from an experimental prototype with a monolithic 1700-line SimulationEngine into a well-documented, maintainable, and extensible ecosystem simulation using modern software architecture patterns.

---

## Deliverables Completed

### 1. Comprehensive User Documentation

Created a complete `docs/` structure:

```
docs/
├── README.md                    # Quick start overview
├── user-guide/
│   ├── getting-started.md       # Installation, first run, controls
│   ├── visual-guide.md          # Entity types, colors, meanings
│   ├── mechanics.md             # How simulation works
│   ├── configuration.md         # All ~300 parameters explained
│   └── experiments.md           # Fun experiments, troubleshooting
└── educational/
    ├── ecology-concepts.md      # Predator-prey dynamics, Lotka-Volterra
    ├── evolution-primer.md      # Natural selection explained
    └── classroom-guide.md       # Lesson plans, activities, NGSS alignment
```

### 2. Systems-Based Architecture

Replaced the monolithic `SimulationEngine.ts` (1687 lines) with modular systems:

#### New Directory Structure
```
src/
├── core/
│   ├── World.ts             # Entity container + spatial indexing
│   └── SimulationEngine.ts  # Orchestrates systems (612 lines)
├── systems/
│   ├── System.ts            # Base interface + priority constants
│   ├── AgingSystem.ts       # Age updates, timers
│   ├── MovementSystem.ts    # Position updates
│   ├── ForagingSystem.ts    # Prey eating resources
│   ├── PredationSystem.ts   # Predator hunting
│   ├── ReproductionSystem.ts
│   ├── LearningSystem.ts    # Social learning
│   ├── ConversionSystem.ts  # Species evolution
│   ├── ResourceSystem.ts    # Spawning, decay, blooms
│   └── StatisticsSystem.ts  # Population tracking
├── spatial/
│   └── SpatialHash.ts       # O(1) entity queries
├── events/
│   ├── EventBus.ts          # Pub/sub singleton
│   └── SimulationEvents.ts  # 18 event type definitions
├── persistence/
│   └── SaveManager.ts       # Save/load, CSV export
└── config/
    ├── types.ts             # TypeScript interfaces
    ├── defaults.ts          # Default values
    ├── validation.ts        # Runtime validation
    └── index.ts             # Config management
```

#### System Execution Order
| Priority | System | Purpose |
|----------|--------|---------|
| 10 | AgingSystem | Age updates, death checks |
| 20 | MovementSystem | Position updates |
| 30 | ForagingSystem | Resource consumption |
| 40 | PredationSystem | Hunting mechanics |
| 50 | ReproductionSystem | Offspring creation |
| 60 | LearningSystem | Trait adoption |
| 70 | ConversionSystem | Species evolution |
| 80 | ResourceSystem | Spawning, blooms |
| 100 | StatisticsSystem | Population tracking |

### 3. Spatial Partitioning

Implemented `SpatialHash` for O(1) entity queries:
- Grid-based partitioning with configurable cell size
- `query(x, y, radius)` - Find entities within radius
- `findNearest(x, y, maxRadius)` - Find closest entity
- Automatic position updates when entities move

### 4. Event-Driven Communication

Created `EventBus` for decoupled component communication:
- 18 event types defined (entity lifecycle, predation, reproduction, etc.)
- Type-safe subscriptions with TypeScript generics
- ToastManager now subscribes to events automatically
- Systems emit events, UI reacts without tight coupling

### 5. Testing Infrastructure

Set up Vitest with comprehensive test coverage:

```
tests/
├── unit/
│   ├── spatial/SpatialHash.test.ts    # 21 tests
│   └── events/EventBus.test.ts        # 20 tests
└── integration/
    └── simulation.test.ts             # 23 tests
```

**Total: 64 passing tests**

### 6. Persistence System

Created `SaveManager` for save/load functionality:
- Save simulation state to localStorage
- Export/import JSON save files
- Export statistics to CSV
- Auto-save with rotation (keeps last 5)

### 7. UI Modernization

Updated ToastManager to use EventBus:
- Subscribes to simulation events automatically
- Shows toasts for births, deaths, predation, learning, etc.
- Decoupled from simulation systems

---

## Technical Decisions

### Why Systems-Based Architecture?
- **Testability**: Each system can be tested in isolation
- **Maintainability**: Changes to one behavior don't affect others
- **Extensibility**: New systems can be added without modifying existing code
- **Performance**: Systems can be enabled/disabled dynamically

### Why SpatialHash?
- Original O(n²) neighbor queries were a bottleneck
- SpatialHash provides O(1) average-case queries
- Cell size tuned to max detection range (100 units)

### Why EventBus?
- Decouples systems from UI components
- Enables future features (replays, logging, analytics)
- Makes testing easier (can verify events were emitted)

---

## Files Changed

### Deleted
- `src/engine/SimulationEngine.ts` (1687 lines)

### Added (New Files)
| File | Lines | Purpose |
|------|-------|---------|
| `src/core/World.ts` | ~300 | Entity container |
| `src/core/SimulationEngine.ts` | ~612 | System orchestrator |
| `src/spatial/SpatialHash.ts` | ~200 | Spatial partitioning |
| `src/events/EventBus.ts` | ~100 | Pub/sub messaging |
| `src/events/SimulationEvents.ts` | ~180 | Event definitions |
| `src/persistence/SaveManager.ts` | ~430 | Save/load system |
| `src/systems/*.ts` | ~600 | 9 system classes |
| `src/config/*.ts` | ~400 | Config restructure |
| `tests/**/*.ts` | ~500 | Test suite |
| `docs/**/*.md` | ~1500 | Documentation |

### Modified
- `src/main.ts` - Import from new location
- `src/rendering/Renderer.ts` - Import from new location
- `src/ui/*.ts` - Import updates, EventBus integration
- `src/config.ts` - Re-exports from config module
- `package.json` - Added vitest dependency

---

## Verification

```bash
npm run build   # ✓ Passes (warnings about chunk size only)
npm run test    # ✓ 64 tests pass
npm run dev     # ✓ Runs correctly in browser
npm run lint    # ✓ No errors
```

---

## Future Opportunities

The new architecture enables:
1. **Speed Control** - 0.5x to 4x simulation speed
2. **Population Graphs** - Real-time charting
3. **Entity Tracking** - Follow a specific creature
4. **Replays** - Record and replay simulations
5. **Scenarios** - Preset configurations for experiments

---

## Summary

This session completed a major architectural overhaul:
- **Before**: 1687-line monolithic engine, no tests, no docs
- **After**: Modular systems, 64 tests, comprehensive documentation

The codebase is now maintainable, testable, and ready for future enhancements.
