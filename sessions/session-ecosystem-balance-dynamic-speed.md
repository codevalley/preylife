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

## Files Modified

| File | Changes |
|------|---------|
| `src/config/types.ts` | Added `PredatorDesperationConfig`, `PreyFleeExhaustionConfig`, `SpontaneousPreyConfig` |
| `src/config/defaults.ts` | Default values for all new config fields |
| `src/entities/Creature.ts` | `getEffectiveSpeed()`, dynamic turn rate, `turnRateBonus` hook |
| `src/entities/Predator.ts` | `isDesperate()`, desperation bonuses for speed/detection/turn |
| `src/entities/Prey.ts` | `consecutiveFleeFrames` counter, exhaustion speed penalty |
| `src/systems/ResourceSystem.ts` | `trySpontaneousPreySpawn()` when prey extinct |
