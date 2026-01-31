# Task 4: Resource Visual Redesign - Bioluminescent Plankton

## Objective
Transform resources from simple green squares into organic bioluminescent plankton particles that glow softly in the deep ocean.

## Status: COMPLETED ✓

## Subtasks

### 4.1 Plankton Geometry
- [x] Create soft circular particle shapes
- [x] Varied sizes based on energy value
- [x] Soft edges with transparency

### 4.2 Plankton Shader
- [x] Soft green-cyan glow
- [x] Gentle pulsing animation
- [x] Energy affects brightness
- [x] Bloom-compatible glow effect with core and ring

### 4.3 Visual Polish
- [x] Varied pulse speeds per particle
- [x] Phase offset for varied animation
- [x] Depth variation for parallax feel

## Technical Implementation

### Files Created
1. `src/rendering/shaders/PlanktonShader.ts` - Custom GLSL shader with:
   - Circular soft-edged particles
   - Inner bright core
   - Outer glow ring for bloom
   - Energy-based brightness

### Files Modified
1. `src/entities/Resource.ts`:
   - Integrated plankton shader material
   - Size varies with energy value
   - Phase offset for varied animation timing
   - Z-depth variation for visual depth

## Color Palette Implemented
- Base: Soft green (#22aa66) to cyan-green (#44ffaa)
- High Energy: Brighter, larger glow
- Low Energy: Dimmer, smaller
- Glow Ring: Cyan-green for bloom effect

## Acceptance Criteria
- [x] Resources appear as organic glowing plankton
- [x] Energy value visible in brightness and size
- [x] Bloom effect creates soft glow
- [x] Performance maintained (build succeeds)

---

## Summary
Successfully transformed resources into beautiful bioluminescent plankton. The particles now:
1. Have soft, circular shapes with gentle edges
2. Glow with a bright core and outer bloom ring
3. Pulse gently at varied speeds
4. Show energy value through brightness and size
5. Have subtle depth variation for visual richness

## Learnings
- Circular particles with smooth falloff look more organic
- Phase offsets prevent synchronized pulsing (more natural)
- Inner core + outer ring glow creates nice bloom effect
- Transparency with depthWrite: false needed for proper layering
