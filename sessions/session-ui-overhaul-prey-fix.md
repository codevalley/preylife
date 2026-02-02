# UI Palette Overhaul + Prey Spinning Fix

**Date**: 2026-02-02
**Commits**: b9cd4e2 + this session's fix commit

---

## 1. UI Style Consistency

Unified all UI panels with the OceanicColors palette (defined in `DashboardPanel.ts`).

### ToastManager
- Removed redundant `@font-face` Inter import (app loads Inter via Google Fonts in `index.html`)
- Educational cards: warm brown background → deep oceanic blue (`rgba(8, 25, 45, 0.92)`)
- Kept warm accent (`accentWarm`) for educational card distinction (shimmer border, progress bar)

### HelpPanel
- Replaced all hardcoded colors (`#fff`, `#aaa`, `#888`, `#5588ff`, `#ff5555`) with OceanicColors references
- Updated content to reflect new mechanics: flee exhaustion, stealth evasion, target-lock homing, desperation mode, spontaneous prey spawning
- Redesigned layout: flex column (fixed header → scrollable content → no bleed), section hover effects, custom scrollbar, gradient backgrounds

### SettingsPanel
- Fixed hardcoded tooltip/checkbox colors to use OceanicColors
- Added three new settings sections:
  - **Predator Desperation** — hunger threshold, speed/detection/turn-rate bonuses, isolation range
  - **Prey Flee Exhaustion** — threshold, rate, max penalty
  - **Spontaneous Prey** — enabled toggle, resource threshold, spawn chance, max per cycle
- Redesigned layout: same flex column treatment as HelpPanel, polished footer buttons, input focus glow

### Typography
- Added Inter font via Google Fonts `<link>` in `index.html` (weights 400–700)
- All panels inherit `font-family: 'Inter', system-ui, -apple-system, sans-serif` from body

---

## 2. Prey Spinning Bug — Root Cause & Fix

### Symptom
Prey fish spin in place after eating, clump together, trigger species conversion, ecosystem collapses < 500 days.

### Root Cause
`lockedResource` was never cleared after consumption:

1. `consumeResource()` gave energy but didn't clear `lockedResource`
2. `World.removeResource()` removed the resource from arrays but didn't call `resource.die()`, so `isDead` stayed false
3. In `selectResource()`, the `isDead` check failed (not marked dead) and the distance check failed (prey was already at the resource position, distance ≈ 0 < threshold)
4. Lock persisted forever → prey kept "foraging" toward a ghost position
5. Repulsion was suppressed (guard checks `!this.lockedResource`) → no anti-clumping
6. No schooling/wander direction reached → prey sat at the point spinning via turn-rate lerp

### Fix (two changes)
- **`Prey.ts`**: Clear `this.lockedResource = null` inside `consumeResource()` — consuming prey immediately releases its lock
- **`World.ts`**: Call `resource.die()` inside `removeResource()` — any other prey locking the same resource detects `isDead` on next frame

### Schooling Behavior (new feature, layered on top)
When prey is idle (full or hungry with no food in range), instead of doing nothing (which left repulsion as the only force → spinning), prey now follow slowly-rotating "ocean currents":

- 3 schools offset by 120°, full rotation every ~90 seconds
- Each prey assigned a school at birth (`schoolId`)
- Idle prey set velocity via `.set()` (hard override, not `.add()`) toward their school's current direction
- Full prey cruise at 60% speed, hungry searching prey at 80%
- Creates natural schooling/dispersal patterns

### Failed Approaches (for reference)
- Moving repulsion after foraging → made it worse (`.add()` corrupted foraging `.copy()`)
- Suppressing repulsion during foraging only → didn't help (spinning happened when NOT foraging)
- Adding `strengthScale` param to `applyRepulsion()` → unnecessary, reverted

### Key Insight
The turn-rate lerp in `Creature.update()` (lines 70–80) smooths velocity 15–30% per frame. When no strong directional signal exists, even small forces (repulsion) get lerped into smooth circular arcs. Any idle state MUST set a clear direction via `.set()` or `.copy()`, never rely on `.add()` alone.

---

## 3. Architecture Lessons

- **Modal panel layout**: Use `display: flex; flex-direction: column` with fixed header, `overflow-y: auto` scroll area, fixed footer. Prevents content bleed.
- **Settings config paths**: Dot-notation like `predator.desperation.hungerThreshold`. Types in `src/config/types.ts`, defaults in `src/config/defaults.ts`.
- **Velocity contract**: `.copy()` = authoritative direction (foraging, fleeing, schooling). `.add()` = modifier (repulsion). Modifiers must never be the only force in any code path.
