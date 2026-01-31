# Task 3: Predator Visual Redesign - Deep Sea Hunter

## Objective
Transform predators from simple red pentagons into menacing deep sea hunters with angular geometry, glowing lures, and intimidating visual characteristics.

## Status: COMPLETED ✓

## Subtasks

### 3.1 Hunter Geometry
- [x] Create angular, aggressive body shape (anglerfish-inspired)
- [x] Large jaw/mouth area that scales with strength
- [x] Compact, powerful body influenced by stealth
- [x] Sharp, angular fins and dorsal ridge

### 3.2 Predator Shader
- [x] Custom shader with warm color palette (amber to crimson)
- [x] Eye glow effect that intensifies when hunting
- [x] Stealth affects body darkness vs lure brightness contrast
- [x] Energy affects overall saturation and eye glow

### 3.3 Attribute Visualization
- [x] Strength → jaw size and color intensity
- [x] Stealth → body darkness (contrast with glow)
- [x] Energy → eye/lure glow intensity

### 3.4 Hunt Mode Visual
- [x] isActivelyHunting state tracked per predator
- [x] Pulsing intensification when hunting
- [x] Rotation to face movement direction

## Technical Implementation

### Files Created
1. `src/rendering/shaders/PredatorShader.ts` - Custom GLSL shader with:
   - Eye glow zone at front of creature
   - Hunting pulse animation
   - Body darkness controlled by stealth
   - Edge glow for bloom compatibility

### Files Modified
1. `src/entities/Predator.ts`:
   - New `createHunterGeometry()` method with angular shapes
   - Jaw size varies with strength
   - Body compactness varies with stealth
   - Integrated predator shader material
   - Tracks `isActivelyHunting` state
   - Rotation follows movement direction

## Color Palette Implemented
- Base: Amber to Crimson spectrum (#ffaa00 → #cc0000)
- High Strength: Deeper red, larger jaw
- High Stealth: Darker body, higher contrast with lure
- Eye/Lure: Bright orange-yellow glow
- Hunting: Pulsating intensification

## Acceptance Criteria
- [x] Predators appear as menacing angular shapes
- [x] Attributes clearly visible in appearance
- [x] Hunting state visible through glow intensity
- [x] Performance maintained (build succeeds)

---

## Summary
Successfully transformed predators into intimidating deep sea hunters. The creatures now:
1. Have angular, aggressive body shapes with prominent jaws
2. Feature glowing "lure" effect at the front (like anglerfish)
3. Show strength via jaw size and color intensity
4. Show stealth via body darkness (better contrast with glow)
5. Pulse and intensify when actively hunting prey
6. Face their direction of movement

## Learnings
- Angular shapes with straight lines create threatening appearance
- Hunting state as boolean flag allows real-time shader updates
- Eye glow positioned by UV coordinate creates focal point
- Stealth affecting darkness creates interesting ambush predator aesthetic
