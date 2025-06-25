# Technical Debt Overview

This document lists notable technical debt and duplicate logic identified in the `src` folder.

## General Issues
- Several files contain extremely long functions with many responsibilities (e.g. `SimulationEngine.ts`).
- Many debug `console.log` statements are commented out, adding clutter.
- Numeric constants are duplicated across files instead of referencing values from `SimulationConfig`.
- Manual DOM construction in UI classes makes maintenance difficult; a lightweight framework could reduce boilerplate.

## Duplicate Code
- `Prey` and `Predator` classes share very similar `reproduce()` methods with only minor differences.
- Repulsion logic in the `update` methods of `Prey` and `Predator` is nearly identical.
- Spawning logic in `spawnPrey()` and `spawnPredators()` within `SimulationEngine` repeats the same cluster pattern logic.
- The UI panel classes perform repeated style assignments that could be centralized.

## Recommended Improvements
- Extract common creature reproduction logic into a base method in `Creature` or a helper module.
- Create utility functions for common repulsion and movement behaviors.
- Split `SimulationEngine` into smaller systems (resource handling, predation, reproduction, etc.).
- Consider using a templating system or front‑end framework for UI generation.
- Remove outdated debug code and consolidate constants under `SimulationConfig`.

