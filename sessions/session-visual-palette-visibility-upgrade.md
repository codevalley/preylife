# Session: Visual Palette & Visibility Upgrade

**Date**: 2026-02-04
**Context**: User reported that prey (especially stealth) and ocean gradients were too dark on many screens (Mac at full brightness showed little gradient). Goal was to make all elements more visible while preserving the deep‑sea mood.

---

## Changes Implemented

### Ocean Background
- **Problem**: Gradient was too dark and caustics too subtle, with fog + vignette further suppressing contrast.
- **Change**: Brighter surface/mid/abyss palette, stronger caustic tint/intensity, lighter fog mix, softer vignette.
- **File**: `src/rendering/OceanBackground.ts`

### Prey (Fish)
- **Problem**: Stealth prey were nearly invisible due to strong stealth dimming + low alpha floor + dark base color.
- **Change**: Brighter cyan base, stronger glow, higher brightness floor, reduced stealth dimming, higher alpha floor.
- **Files**: `src/entities/Prey.ts`, `src/rendering/shaders/BioluminescentShader.ts`

### Predators (Hunters)
- **Problem**: Dark base body with subtle glow led to low visibility against dark water.
- **Change**: Brighter amber base, reduced stealth darkening, stronger eye/lure glow and edge glow, higher energy brightness floor.
- **Files**: `src/entities/Predator.ts`, `src/rendering/shaders/PredatorShader.ts`

### Plankton (Resources)
- **Problem**: Subtle glow was lost against the dark background.
- **Change**: Brighter base/glow colors, higher glow intensity and energy brightness floor.
- **Files**: `src/entities/Resource.ts`, `src/rendering/shaders/PlanktonShader.ts`

---

## Further Suggestions

1. **Expose a “Visibility” preset**: A simple toggle (Default / High Contrast) to raise glow, alpha floor, and ocean brightness for accessibility.
2. **Per‑trait visibility budget**: Make stealth reduce glow more than base brightness (avoid double‑dimming from alpha + brightness).
3. **Ambient rim light**: Add a subtle screen‑space rim on creatures to pop them off the ocean background.
4. **User‑level controls**: Add sliders for ocean brightness, creature glow, and prey alpha floor in `SettingsPanel` for quick calibration.

---

## Files Changed (Theme Upgrade)

- `src/rendering/OceanBackground.ts`
- `src/rendering/shaders/BioluminescentShader.ts`
- `src/rendering/shaders/PredatorShader.ts`
- `src/rendering/shaders/PlanktonShader.ts`
- `src/entities/Prey.ts`
- `src/entities/Predator.ts`
- `src/entities/Resource.ts`
