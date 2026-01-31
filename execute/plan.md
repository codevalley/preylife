# PreyLife Reimagined: Ocean Depths Ecosystem

## Vision
Transform PreyLife from an abstract 2D simulation into an **immersive underwater ecosystem** set in the ocean depths. This reimagining maintains all core mechanics (energy, stealth, strength, learnability, procreation, species conversion) while creating a visually stunning and ecologically coherent experience.

## Theme: The Abyssal Zone

### Why Ocean Depths?
1. **Visual richness** - Bioluminescence, particle effects, fluid motion
2. **Ecological coherence** - Natural predator-prey relationships (fish, plankton, larger predators)
3. **Emergent storytelling** - Deep sea creatures have fascinating survival strategies that map perfectly to our genetic attributes
4. **Technical opportunity** - Shaders, lighting, and particle systems can shine in this environment

---

## Core Concept Mapping

| Original | Reimagined | Ecological Justification |
|----------|------------|-------------------------|
| **Prey (blue circles)** | **Bioluminescent Fish** | Small schooling fish that use light for communication |
| **Predator (red pentagons)** | **Deep Sea Hunters** | Anglerfish-like predators with lures and sharp features |
| **Resources (green squares)** | **Plankton Blooms** | Floating organic particles and small organisms |
| **Stealth** | **Bioluminescence Control** | Ability to dim/brighten to evade or attract |
| **Strength** | **Hydrodynamic Form** | Streamlined body for speed and power |
| **Learnability** | **Neural Plasticity** | Brain adaptation visible as subtle glow patterns |
| **Longevity** | **Deep Adaptation** | Creatures adapted to extreme pressure live longer |
| **Energy** | **Metabolic Reserves** | Visible as body fullness/glow intensity |

---

## Visual Design System

### Environment
- **Background**: Deep gradient from midnight blue to abyssal black
- **Particles**: Floating marine snow, bioluminescent specs
- **Lighting**: Subtle caustic patterns, volumetric light shafts from above
- **Boundaries**: Seamless wrap (toroidal ocean)

### Prey (Bioluminescent Fish)
- **Shape**: Organic fish silhouette with flowing fins
- **Base Color**: Cool spectrum (cyan to teal)
- **Stealth Visual**: Glow intensity (high stealth = subtle bioluminescence control)
- **Strength Visual**: Body elongation and fin size (stronger = more streamlined)
- **Energy Visual**: Body luminosity and fullness
- **Movement**: Smooth, flowing with slight trail effects

### Predators (Deep Sea Hunters)
- **Shape**: Angular, aggressive silhouette (anglerfish/gulper eel hybrid)
- **Base Color**: Warm spectrum (amber to crimson)
- **Stealth Visual**: Lure brightness and body darkness contrast
- **Strength Visual**: Jaw/body proportion (stronger = larger jaw, compact body)
- **Energy Visual**: Eye glow intensity, body saturation
- **Movement**: Lurking patterns with sudden bursts

### Resources (Plankton)
- **Shape**: Small organic particles, varied sizes
- **Color**: Soft greens and blues with subtle glow
- **Animation**: Gentle floating, clustering behavior
- **Bloom Events**: Spectacular particle explosions with volumetric effects

---

## Technical Implementation Plan

### Phase 1: Foundation Overhaul
**Duration**: Core visual system rebuild

#### Task 1.1: Shader-Based Rendering System
- Replace basic materials with custom GLSL shaders
- Implement glow/bloom post-processing
- Create underwater atmosphere shader

#### Task 1.2: Environment System
- Gradient background with depth fog
- Marine snow particle system
- Subtle caustic light patterns
- Ambient underwater sounds (optional)

### Phase 2: Entity Redesign
**Duration**: New visual entities

#### Task 2.1: Prey Visual Overhaul
- New fish geometry with procedural fins
- Bioluminescent shader with attribute mapping
- Trail/motion blur effects
- Schooling visual hints

#### Task 2.2: Predator Visual Overhaul
- Angular predator geometry
- Lure and eye glow systems
- Intimidating color palette
- Hunt mode visual states

#### Task 2.3: Resource Visual Overhaul
- Organic particle system for plankton
- Clustering behavior visualization
- Bloom event spectacular effects

### Phase 3: Interaction Visualization
**Duration**: Making mechanics visible

#### Task 3.1: Predation Visualization
- Hunt detection lines (subtle)
- Capture attempt effects
- Escape success animations
- Death/conversion effects

#### Task 3.2: Reproduction Visualization
- Mitosis-like splitting animation
- Genetic inheritance visual (color mixing)
- Population cluster hints

#### Task 3.3: Learning Visualization
- Neural pulse effects between creatures
- Attribute shift visual feedback

### Phase 4: UI Reimagining
**Duration**: Cohesive oceanic interface

#### Task 4.1: Dashboard Redesign
- Glass-morphism underwater aesthetic
- Organic data visualization
- Population as depth sonar display

#### Task 4.2: Tooltip and Selection
- Creature detail card with biological stats
- Ancestry visualization
- Real-time attribute monitoring

### Phase 5: Polish and Mobile
**Duration**: Final touches

#### Task 5.1: Performance Optimization
- Shader optimization for various GPUs
- Entity pooling for particles
- LOD system for large populations

#### Task 5.2: Mobile Experience
- Responsive underwater interface
- Touch-friendly controls
- Performance scaling for mobile GPUs

---

## Success Criteria

1. **Visual Impact**: First impression should be "wow, this is beautiful"
2. **Ecological Coherence**: Behaviors make intuitive sense in ocean context
3. **Core Mechanics Preserved**: All original features work identically
4. **Performance**: 60fps with 500+ entities on mid-range hardware
5. **Educational Value**: Users can observe and understand evolution

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Shader complexity overwhelming | Start with basic shaders, enhance iteratively |
| Performance degradation | Profile constantly, implement LOD early |
| Scope creep | Strict task boundaries, core mechanics first |
| Breaking existing logic | Keep simulation engine unchanged initially |

---

## Task Sequence

### Iteration 1 (Completed)
- [x] Plan created
- [x] **Task 1**: Environment foundation (background, particles, atmosphere) ✓

### Iteration 2 (Completed)
- [x] **Task 2**: Prey visual redesign (fish geometry, bioluminescence shader) ✓

### Iteration 3 (Completed)
- [x] **Task 3**: Predator visual redesign (angular geometry, hunt visualization) ✓

### Iteration 4 (Completed)
- [x] **Task 4**: Resource visual redesign (plankton particles, bloom effects) ✓

### Iteration 5 (Completed)
- [x] **Task 5**: UI/Dashboard oceanic redesign ✓

### Iteration 6 (Next)
- [ ] **Task 6**: Interaction effects (predation, reproduction, learning visuals)

### Iteration 7
- [ ] **Task 7**: Polish, mobile support, performance optimization

---

## Evaluation Checklist

### Plan Completeness
- [x] Vision clearly articulated
- [x] Theme justified ecologically
- [x] Core mechanics mapped to new theme
- [x] Visual design system documented
- [x] Technical phases defined
- [x] Tasks sequenced logically
- [x] Success criteria established
- [x] Risks identified with mitigations

### Plan Feasibility
- [x] Tasks are atomic and achievable
- [x] No breaking changes to core simulation logic proposed
- [x] Iterative approach allows course correction
- [x] Performance considerations addressed

---

## Status: IN PROGRESS

**Iteration Count**: 6/7 (Tasks 1-5 complete, Task 6 next)
**Next Step**: Begin Task 6 - Interaction Effects
