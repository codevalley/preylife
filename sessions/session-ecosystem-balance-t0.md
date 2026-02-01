# Session: Ecosystem Balance — Tier 0 Fixes

**Date**: 2026-02-01
**Context**: Post systems-refactor. Predators were non-viable due to compounding probability gates, excessive energy burn, and unconstrained reproduction. Implemented Tier 0 fixes from ecosystem-mechanics-v2 analysis, then a second round of tuning after observing predator population explosions.

---

## Round 1: Mechanical Fixes

### Fix A: Unified Predation Contest
- **Problem**: Two independent probability rolls (`canCatchPrey` then `canEscapeWithStealth`) compounded to ~21% effective catch rate.
- **Change**: Merged into single roll in `Predator.canCatchPrey()` with unified formula. Deleted `Prey.canEscapeWithStealth()` entirely. Updated `PredationSystem` to remove nested escape check.
- **Formula**: Base 0.33, offense from strength/stealth differentials, defense from prey attributes, specialization advantage. Clamped [0.15, 0.75].

### Fix B: Energy Multiplier Rebalance
- **Problem**: Predator 2.5× vs prey 0.7× = 3.57× ratio, too punishing.
- **Change**: `Creature.ts` energy multiplier → predator 1.8×, prey 0.8× (2.25× ratio).

### Fix C: Velocity Smoothing Tune
- **Problem**: Lerp 0.12 = ~20 frames to turn, too sluggish, reduced encounters.
- **Change**: `Creature.ts` turnRate → 0.20 (~12 frames to turn).

### Fix D: Shuffle Creature Update Order
- **Problem**: Deterministic array iteration gave early-indexed creatures systematic advantage.
- **Change**: Fisher-Yates shuffle of prey/predator arrays before each frame's creature updates in `SimulationEngine`.

---

## Round 2: Predator Population Control

After Round 1, the ecosystem swung the other way — predators snowballed. Within 1 year predator population matched prey, within 2 years prey went extinct, then predators followed. Root cause analysis:

### Problem: Reproduction Without Hunting
Predators could chain-reproduce from energy alone. A predator reproducing at 40%/frame with 30-frame cooldown and 85% energy extraction per kill created exponential growth. No mechanical link between hunting success and reproduction.

### Fix E: Hunt-Gated Reproduction (Probabilistic)
- **Change**: Added `foodConsumed`-based multiplier to predator reproduction probability.
- **Formula**: `huntFactor = min(1, foodConsumed × 0.5)`, applied as `0.05 + huntFactor × 0.95`.
- **Effect**: 0 kills → 5% of normal repro chance, 1 kill → ~52%, 2+ kills → full. Soft gate, not boolean.

### Fix F: Config Rebalance
| Parameter | Before | After |
|-----------|--------|-------|
| `energyGainFromPrey` | 0.85 | 0.55 |
| Predator high-energy repro probability | 0.40/frame | 0.08/frame |
| Predator repro cooldown | 3 (→30 frames) | 10 (→100 frames) |
| Base catch rate | 0.40 | 0.33 |

---

## Files Changed

| File | Changes |
|------|---------|
| `src/entities/Predator.ts` | Rewrote `canCatchPrey()` — unified formula, base 0.33 |
| `src/entities/Prey.ts` | Deleted `canEscapeWithStealth()` |
| `src/systems/PredationSystem.ts` | Single-roll predation, escape energy cost on failed hunt |
| `src/entities/Creature.ts` | turnRate 0.20, energy multiplier 1.8:0.8, hunt-gated reproduction |
| `src/core/SimulationEngine.ts` | Fisher-Yates shuffle before creature updates |
| `src/config/defaults.ts` | energyGainFromPrey 0.55, predator repro 0.08, cooldown 10 |

## Result

Ecosystem sustained 5+ years with stable predator-prey oscillation. No extinction spirals observed.

---

## What's NOT Changed
- Event types (PREY_CONSUMED, PREY_ESCAPED preserved)
- InteractionEffects, ToastManager, Renderer
- Config types (only default values adjusted)
- No god-hand corrections — all changes are individual creature mechanics

## Next Steps
- Tier 1: Strengthen the Strength trait's defensive value (Fix D from analysis)
- Tier 1: Revive Learnability as cultural transmission (Fix E from analysis)
- Tier 1: Give Longevity active expression (Fix F from analysis)
