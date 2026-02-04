# Rendering & Trait Morphing

This reference explains how the ocean background, plankton, prey, and predators are rendered and how genetic traits map to their visuals.

## Ocean Background
- Rendered as a full-screen shader plane with depth gradient, caustics, fog, and vignette.
- No traits affect the background; it is purely atmospheric.

## Plankton (Resources)
- **Geometry**: Soft circular plane; size scales with energy (higher energy → larger).
- **Shader**: Brightness and glow pulse scale with energy.

## Prey (Bioluminescent Fish)
- **Geometry morphing**:
  - **Longevity** → longer, slimmer body.
  - **Strength** → larger tail and dorsal fin (appears when strength > 0.3).
- **Shader mapping**:
  - **Stealth** → deeper blue color, lower glow, more transparency.
  - **Strength** → adds cyan warmth (higher saturation).
  - **Learnability** → faster glow pulse.
  - **Energy** → overall brightness.
  - **Age** → gradual desaturation.

## Predators (Hunters)
- **Geometry morphing**:
  - **Strength** → larger jaw and dorsal spikes.
  - **Stealth** → more compact body profile.
  - **Longevity** → taller/thicker body.
- **Shader mapping**:
  - **Strength** → stronger red/orange intensity.
  - **Stealth** → darker base body (higher contrast).
  - **Learnability** → lateral-line sensor dots.
  - **Energy** → brighter body and eye/lure glow.
  - **Hunting state** → pulsing glow intensification.
  - **Age** → desaturation and subtle scarring.

## Source Pointers
- Ocean shader: `src/rendering/OceanBackground.ts`
- Plankton shader: `src/rendering/shaders/PlanktonShader.ts`
- Prey geometry/shader: `src/entities/Prey.ts`, `src/rendering/shaders/BioluminescentShader.ts`
- Predator geometry/shader: `src/entities/Predator.ts`, `src/rendering/shaders/PredatorShader.ts`
