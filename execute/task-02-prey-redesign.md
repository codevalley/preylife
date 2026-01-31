# Task 2: Prey Visual Redesign - Bioluminescent Fish

## Objective
Transform prey from simple blue circles into organic bioluminescent fish with flowing fins and attribute-driven visual characteristics.

## Status: COMPLETED ✓

## Subtasks

### 2.1 Fish Geometry
- [x] Create organic fish body shape using Three.js Shape
- [x] Add flowing tail fin that responds to movement
- [x] Scale body proportions based on strength attribute
- [x] Size variation based on energy capacity

### 2.2 Bioluminescence Shader
- [x] Custom shader material for glowing effects
- [x] Stealth controls glow intensity (high stealth = dimmer)
- [x] Energy affects overall brightness
- [x] Subtle pulsing animation for "alive" feeling

### 2.3 Attribute Visualization
- [x] Strength → body streamlining and size
- [x] Stealth → glow intensity and color saturation
- [x] Learnability → pulse speed (faster = more active learner)
- [x] Longevity → (planned for future: color temperature)

### 2.4 Motion Direction
- [x] Fish rotates to face movement direction
- [x] Natural swimming appearance

## Technical Implementation

### Files Created
1. `src/rendering/shaders/BioluminescentShader.ts` - Custom GLSL shader with:
   - Configurable uniforms for energy, stealth, strength
   - Pulsing animation based on time
   - Edge glow effect for bloom compatibility
   - Color mixing based on attributes

### Files Modified
1. `src/entities/Prey.ts`:
   - New `createFishGeometry()` method using Bezier curves
   - Body shape varies with strength (streamlined vs round)
   - Integrated bioluminescent shader material
   - Rotation tracks movement direction
   - Shader uniforms update each frame

## Color Palette Implemented
- Base: Cyan-Teal spectrum (0x00ccff → 0x008080)
- High Stealth: Deeper blue, dimmer glow
- High Strength: Vibrant cyan, elongated body
- Low Energy: Dim, desaturated
- High Energy: Bright, full saturation with visible glow

## Acceptance Criteria
- [x] Prey appear as organic fish shapes
- [x] Attributes clearly visible in visual appearance
- [x] Glow effect works with post-processing bloom
- [x] Performance maintained (build succeeds)
- [x] Fish face direction of movement

---

## Summary
Successfully transformed prey from simple circles into beautiful bioluminescent fish. The creatures now:
1. Have organic, curved fish bodies with flowing tails
2. Glow and pulse based on their genetic attributes
3. Show stealth via glow intensity (stealthier = dimmer)
4. Show strength via body streamlining (stronger = more elongated)
5. Face their direction of movement naturally

## Learnings
- Three.js Shape with Bezier curves creates smooth organic shapes
- Custom shaders need proper UV coordinates from ShapeGeometry
- Static class variable for time keeps animation in sync across all prey
- Edge glow effect enhances bloom post-processing nicely
