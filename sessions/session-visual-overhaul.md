# Session: Visual Overhaul

**Date**: 2026-02-01
**Context**: The simulation was functionally solid after the ecosystem balance fixes, but visually generic — creatures were simple colored shapes, the ocean had contour-band artifacts, the UI was a cluttered panel layout, and birth/death toast spam obscured meaningful events. This session redesigned every visual layer.

---

## Brainstorming & Design

Explored options through structured Q&A before writing code:
- **Creature visuals**: Chose hybrid trait mapping (distinct visual features per genetic trait, not just color shifts)
- **Ocean background**: Chose soft caustics + depth fog (sin() waves replacing noise+smoothstep)
- **UI layout**: Chose minimal HUD (floating pills + controls, not panels)
- **Ecology display**: Chose sparkline + health dot (replacing meaningless event list)
- **Creature inspection**: Chose slide-in drawer (stable position, avoids jitter from creature-following tooltips)
- **Notifications**: Chose bottom-center cards for significant events only

Design doc: `docs/plans/2026-02-01-visual-overhaul-design.md`
Implementation plan: `docs/plans/2026-02-01-visual-overhaul-plan.md`

---

## Task 1: Ocean Background — Smooth Caustics + Depth Fog

- **Problem**: `noise() + smoothstep()` created visible contour bands.
- **Change**: Replaced caustics with 4 nested `sin()` waves at different scales/speeds. Added depth fog in deep zone. Updated surface color to `0x0c3055`.
- **File**: `src/rendering/OceanBackground.ts`

## Task 2: Prey Visuals — Hybrid Trait Geometry + Shader

- **Problem**: Prey were uniform blue circles; traits only shifted color slightly.
- **Change**: Longevity → body elongation (eel-like vs compact). Strength → fin prominence + dorsal fin. Stealth → body transparency (alpha 0.4–1.0). Age → color desaturation.
- **Files**: `src/entities/Prey.ts`, `src/rendering/shaders/BioluminescentShader.ts`

## Task 3: Predator Visuals — Hybrid Trait Geometry + Shader

- **Problem**: Predators were uniform red pentagons.
- **Change**: Strength → jaw size + dorsal ridge spikes (zigzag). Stealth → darker body with brighter lure contrast. Learnability → lateral line sensor dots (3–7 dots). Longevity → bulkier body (height scaled 0.8–1.2×). Age → desaturation + sine-based scar noise.
- **Files**: `src/entities/Predator.ts`, `src/rendering/shaders/PredatorShader.ts`

## Task 4: Lineage Tracking

- **Change**: Added `generation`, `parentTraits`, `grandparentTraits`, `greatGrandparentTraits`, `parentSpecies` to Creature class. Passed through `reproduceOffspring()` and `convertToOppositeSpecies()`.
- **File**: `src/entities/Creature.ts`

## Task 5: Minimal HUD — Population Pills + Controls

- **Problem**: Panel-based UI with DashboardPanel, ecology events table, stat tooltips. Cluttered.
- **Change**: Rewrote UIController (~1000 → ~370 lines). Removed DashboardPanel instantiation. Added position:fixed population pills (top-left, click-to-spawn) and control buttons (top-right: play/pause, reset, settings, help, day counter). Glass-morphism styling.
- **Files**: `src/ui/UIController.ts`, `index.html`

## Task 6: Ecology Sparkline + Health Indicator

- **Problem**: Ecology events in a long list — no way to see population trends at a glance.
- **Change**: Created Canvas 2D stacked area chart (220×70, expandable to 450×180). 200-point rolling buffer. Health dot: green (balanced), amber (>70% dominated), red (extinction). Click to expand/collapse.
- **File**: `src/ui/PopulationSparkline.ts` (new)

## Task 7: Creature Detail Drawer

- **Problem**: EntityTooltip was overloaded (246 lines) and anchored to creatures (jittery).
- **Change**: Created 280px slide-in drawer from right with stats, genetics bars, lineage tree (3 ancestor generations). Simplified EntityTooltip to 91-line hover-only label showing dominant trait + energy bar.
- **Files**: `src/ui/CreatureDrawer.ts` (new), `src/ui/EntityTooltip.ts`, `src/rendering/Renderer.ts`

## Task 8: Redesign Notification System

- **Problem**: Birth/death counter toasts spammed the screen. Info toasts lasted 20s in corners.
- **Change**: Removed `ToastType` enum and all ephemeral toasts. Single bottom-center container (above sparkline). Ecology event cards: glass-morphism, 5s duration. Educational insight cards: warm amber glass (`rgba(45, 30, 8, 0.85)`), lightbulb icon, 8s duration.
- **Files**: `src/ui/ToastManager.ts`, `src/ui/UIController.ts`, `src/main.ts`, `src/config/types.ts`, `src/config/defaults.ts`, `src/ui/SettingsPanel.ts`

## Task 9: Polish + Integration Pass

- Removed dead `#ui-container` div from `index.html`
- Removed orphaned `ecologyEvents` array from UIController (populated every frame but never displayed)
- Noted: `DashboardPanel` class is never instantiated, only `OceanicColors` is used — future cleanup candidate

## Task 10: Build Verification

- `npm run build` — clean, no TypeScript errors
- No references to removed APIs (`ToastType`, `addAnimationStyles`, `canEscapeWithStealth`)

---

## Files Changed

| File | Changes |
|------|---------|
| `src/rendering/OceanBackground.ts` | Sin-wave caustics, depth fog, updated colors |
| `src/entities/Prey.ts` | Hybrid trait geometry (elongation, fins), shader uniforms |
| `src/rendering/shaders/BioluminescentShader.ts` | Age/longevity uniforms, stealth transparency, age desaturation |
| `src/entities/Predator.ts` | Hybrid trait geometry (spikes, jaw, bulk), shader uniforms |
| `src/rendering/shaders/PredatorShader.ts` | Age/longevity/learnability uniforms, sensor dots, scar noise |
| `src/entities/Creature.ts` | Lineage properties, passed through reproduction/conversion |
| `src/ui/UIController.ts` | Complete rewrite — minimal HUD, sparkline integration, dead code removal |
| `index.html` | Stripped legacy CSS, removed #ui-container |
| `src/ui/PopulationSparkline.ts` | **New** — Canvas 2D sparkline + health dot |
| `src/ui/CreatureDrawer.ts` | **New** — Slide-in detail drawer with lineage |
| `src/ui/EntityTooltip.ts` | Simplified to hover-only (246 → 91 lines) |
| `src/rendering/Renderer.ts` | Wired drawer to click/touch handlers |
| `src/ui/ToastManager.ts` | Removed ephemeral toasts, bottom-center cards, dual styling |
| `src/main.ts` | Removed addAnimationStyles() call |
| `src/config/types.ts` | Removed showEphemeral from UIConfig |
| `src/config/defaults.ts` | Removed showEphemeral default |
| `src/ui/SettingsPanel.ts` | Removed ephemeral checkbox |

## What's NOT Changed

- Simulation mechanics (predation, reproduction, learning, conversion)
- Entity base classes (Entity, Resource)
- Systems (PredationSystem, ForagingSystem, LearningSystem, etc.)
- EventBus event types and contracts
- Config structure (only removed one UI flag)
- SaveManager, SpatialHash, World

## Next Steps

- Move `OceanicColors` out of `DashboardPanel.ts` to a shared module (7 files import it)
- Remove `DashboardPanel.ts` entirely (class is never instantiated)
- Visual tuning after playtesting (creature sizes, glow intensity, sparkline scale)
- Tier 1 trait expression work (Strength defense, Learnability cultural transmission, Longevity active expression)
