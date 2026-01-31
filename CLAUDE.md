# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PreyLife is a browser-based predator-prey ecosystem simulation demonstrating emergent evolutionary behavior through simple probabilistic rules. Creatures evolve specialized survival strategies through natural selection and genetic inheritance.

## Build Commands

```bash
npm run dev      # Start Vite development server with hot reload
npm run build    # TypeScript compile + Vite production build
npm run preview  # Preview production build locally
npm run lint     # Run ESLint on src/
npm run start    # Run Express server (server.js)
```

Note: No test suite is currently configured (`npm run test` exits with error).

## Architecture

### MVC Pattern with Event-Based Communication

```
Application (main.ts)
    │
    ├── SimulationEngine (Model)
    │   └── Maintains prey[], predators[], resources[]
    │   └── Runs update loop: creature updates → interactions → cleanup
    │
    ├── Renderer (View)
    │   └── Three.js orthographic camera (2D top-down)
    │   └── Syncs meshes with entity positions each frame
    │
    ├── UIController (Controller)
    │   └── Orchestrates all UI panels
    │   └── Reads simulation state via getters
    │
    └── ToastManager (Singleton)
        └── Event-based notifications decoupled from simulation
```

### Main Loop (main.ts)

```
requestAnimationFrame → simulation.update(deltaTime) → uiController.updateStats()
                      → renderer.updateEntities() → renderer.render()
```

### Entity Hierarchy

```
Entity (abstract) - position, energy, mesh, isDead
├── Resource - static food sources
└── Creature (abstract) - genetics, movement, reproduction
    ├── Prey - blue circles, stealth-focused
    └── Predator - red pentagons, strength-focused
```

### Configuration-Driven Design

All simulation parameters are centralized in `src/config.ts` (SimulationConfig). This includes environment dimensions, population settings, energy costs, reproduction rules, mutation rates, and species conversion thresholds. UI panels read and modify these values.

### Key Behavioral Systems (in SimulationEngine.update)

1. **Creature Updates** - Movement, energy consumption, anti-clumping
2. **Resource Consumption** - Prey feeding mechanics
3. **Predation** - Hunting with strength vs stealth contests
4. **Reproduction** - Genetic inheritance with mutation
5. **Learning** - Creatures adapt by observing neighbors
6. **Species Conversion** - Rare evolutionary jumps between predator/prey

### Genetic Attributes (0.0-1.0 scale)

- **strength** - Movement speed, combat success
- **stealth** - Detection avoidance
- **learnability** - Adaptation rate from social learning
- **longevity** - Lifespan, metabolic efficiency

### Event System

ToastManager provides decoupled notifications via `ToastManager.getInstance().showToast(event, ...)`. Events include births, deaths, extinctions, evolutions, resource blooms, and educational callouts.

## Code Style

- **TypeScript** with strict mode enabled
- **Naming**: camelCase (variables/functions), PascalCase (classes), UPPER_SNAKE_CASE (constants)
- **Imports**: External libraries first, then internal modules
- **Architecture**: MVC pattern, event-based communication between components
