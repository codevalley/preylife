# Session: Ecosystem Balance — Dynamic Speed + Death Spiral Prevention

**Date**: 2026-02-01
**Context**: Ecosystem collapsed predictably — all creatures with similar strength moved identically regardless of age, energy, or other attributes. Predator extinctions were common, prey dominated indefinitely. Goal: replace flat `speed * strength` movement with a dynamic multi-attribute model, then add mechanics to prevent specific collapse patterns.

---

## Fix 0: Dynamic Speed Model (Creature.ts)

- **Problem**: Line 77 `moveSpeed = speed * strength * deltaTime` — only strength affected speed. Age, energy, stealth, longevity all ignored.
- **Change**: New `getEffectiveSpeed(deltaTime)` method with attribute blend, energy curve, and age curve. Dynamic turn rate based on stealth + learnability (agility).
- **File**: `src/entities/Creature.ts`

## Fix 1: Hunger Desperation (Predator.ts)

- **Problem**: Lone starving predators wandered aimlessly while prey clustered elsewhere.
- **Change**: `isDesperate()` check — when hunger > 80% AND isolated (<=1 predator within 150 units), boost detection range (+50%), hunting speed (+40%), turn rate (+0.15).
- **Config**: `PredatorDesperationConfig` in `src/config/types.ts`
- **File**: `src/entities/Predator.ts`

## Fix 2: Prey Flee Exhaustion (Prey.ts)

- **Problem**: Prey fled indefinitely at full speed, making persistent hunting non-viable.
- **Change**: `consecutiveFleeFrames` counter increments while fleeing, decrements by 2 when not. After 60 frames, speed penalty up to 35%.
- **Config**: `PreyFleeExhaustionConfig` in `src/config/types.ts`
- **File**: `src/entities/Prey.ts`

## Fix 3: Spontaneous Prey Spawning (ResourceSystem.ts)

- **Problem**: Once prey went extinct, ecosystem was permanently doomed.
- **Change**: When prey extinct + resources > 50, 0.2% per-frame chance to spawn one prey at a random resource position. Safety net only.
- **Config**: `SpontaneousPreyConfig` in `src/config/types.ts`
- **File**: `src/systems/ResourceSystem.ts`

---

## Critical Iteration: Speed Curve Rebalance

**Problem discovered**: Initial implementation made predators win in ~500 days (vs 35+ years before). Predator population crossed prey count within 200 days.

**Root cause**: Triple compounding penalty on fleeing prey created a death spiral:
1. **Flee exhaustion** (Fix 2) reduced fleeSpeed by up to 35%
2. **Energy-based speed** (Fix 0) — fleeing costs energy, lower energy = slower movement
3. **Pre-existing flee energy cost** drained energy every frame while fleeing

These multiplied: predator hunting at ~1.85x prey speed (was ~1.2x). Meanwhile, desperation fired constantly for isolated predators (4 starting predators are always isolated).

**Deeper design flaw**: Stealth contributed 25% to movement speed, giving stealthy creatures a triple benefit (concealment + agility + speed). This forced harsh compensating mechanics that overcorrected.

**Fix — attribute role separation**:
- **Strength** owns speed (85% weight) — locomotion stat
- **Stealth** owns concealment/agility (turn rate only) — removed from speed formula
- **Learnability** adds small reactivity (15% weight)
- **Energy curve** softened: floor raised from 0.50 to 0.75 (prevents chase death-spiral)
- **Age curve** widened: floor lowered from 0.60 to 0.45, decline starts at 50% lifespan (visible diversity)

**Result**: 12x speed spread from slowest (old, weak, depleted) to fastest (prime, strong, full). Speed vs stealth become competing survival strategies rather than stacking bonuses.

---

## Predator Target-Lock + Stealth Evasion

**Problem**: Predators switched targets every frame when multiple prey were nearby, causing erratic zigzag "confused" movement. No target persistence mechanism existed.

**Fix — target-lock homing**:
- `selectPrey()` wraps `detectPrey()` with 30-frame minimum lock
- Lock breaks only if target dies, escapes 120% detection range, or a prey appears 70% closer
- Prevents oscillation while still allowing opportunistic switches

**Problem discovered**: Target-lock made predators too lethal — committed chases always succeeded. Predators ate all prey in 300-500 days.

**Fix — stealth lock-break**: `loseTrackCheck()` gives stealthy prey a per-frame chance to "vanish" mid-chase. Base 1% + 2% per 0.1 stealth advantage. Creates two survival strategies:
- **Strong prey** (high str, low stealth): outrun predators (speed strategy)
- **Stealthy prey** (low str, high stealth): break lock, vanish (evasion strategy)

**Result**: 43-year balanced run achieved.

---

## Sparkline Era Bands

**Problem**: Sparkline had a single background tint based on current health state — no historical era visualization in full-history mode.

**Fix**: Each `DataPoint` stores its `HealthState`. New `drawEraBands()` renders merged vertical color strips (green = balanced, amber = imbalanced, red = critical) behind the series. Adjacent same-state points merge into single rectangles for efficiency.

---

## Prey Anti-Spin Fix

**Problem**: Prey exhibited visible spinning/confusion despite targeting static resources. Three competing forces per frame caused it.

**Root cause analysis**:
1. **Repulsion vs foraging tug-of-war** — prey near resources pushed apart by `applyRepulsion()`, then pulled back by foraging, every frame
2. **Random direction spam** — up to 5% per frame direction changes when full, combined with turn-rate smoothing, produced circular arcs
3. **Resource oscillation** — `detectResource()` returned closest resource each frame; equidistant resources caused switching

**Fix**:
- `selectResource()` — resource target persistence until consumed or out of range
- Repulsion suppressed while `lockedResource` is set (foraging overrides spacing)
- Random direction chance reduced from 0.5-5% to 0.5-1.5%, suppressed while foraging
- Resource lock dropped when fleeing (survival overrides foraging)

---

## Files Modified

| File | Changes |
|------|---------|
| `src/config/types.ts` | Added `PredatorDesperationConfig`, `PreyFleeExhaustionConfig`, `SpontaneousPreyConfig` |
| `src/config/defaults.ts` | Default values for all new config fields |
| `src/entities/Creature.ts` | `getEffectiveSpeed()`, dynamic turn rate, `turnRateBonus` hook |
| `src/entities/Predator.ts` | `isDesperate()`, desperation bonuses, `selectPrey()` target-lock, `loseTrackCheck()` stealth evasion |
| `src/entities/Prey.ts` | `consecutiveFleeFrames`, exhaustion penalty, `selectResource()` target persistence, anti-spin fixes |
| `src/systems/ResourceSystem.ts` | `trySpontaneousPreySpawn()` when prey extinct |
| `src/ui/PopulationSparkline.ts` | Per-datapoint health state, `drawEraBands()` historical era visualization |
