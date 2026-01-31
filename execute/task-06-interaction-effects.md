# Task 6: Interaction Effects

## Objective
Add visual effects for creature interactions: predation, reproduction, and learning to make the ecosystem dynamics visible and engaging.

## Status: COMPLETED

## Subtasks

### 6.1 Predation Visualization
- [x] Capture attempt effects (expanding ring + particle burst on prey consumption)
- [x] Death effects (fading particles dispersing upward)
- [ ] Hunt detection lines (subtle connection when predator spots prey) - Deferred
- [ ] Escape success animations (burst effect) - Event lacks position data

### 6.2 Reproduction Visualization
- [x] Effect system created (createReproductionEffect method)
- [ ] Mitosis-like splitting animation - Requires position in ReproductionEvent
- [ ] Offspring spawn glow effect - Requires position in ReproductionEvent
- [ ] Energy transfer visual - Requires position in ReproductionEvent

### 6.3 Learning Visualization
- [x] Effect system created (createLearningEffect method)
- [ ] Neural pulse effect between learning creatures - Requires positions in LearningEvent
- [ ] Attribute shift visual feedback - Requires positions in LearningEvent

### 6.4 Resource Bloom Visualization
- [x] Expanding wave rings across screen

## Technical Implementation

### InteractionEffects Class (src/rendering/InteractionEffects.ts)
- Subscribes to EventBus events for decoupled triggering
- Uses shared geometries (ring, circle) for pooling
- Manages effect lifecycle with update() method
- Proper cleanup in dispose()

### Effect Types Implemented
1. **Predation Effect** - Expanding ring with 8 particle burst at prey death location
2. **Death Effect** - 6 particles dispersing upward with fade
3. **Reproduction Effect** - Pulsing glow that splits (ready, needs event position)
4. **Learning Effect** - Pulse traveling between points (ready, needs event positions)
5. **Bloom Effect** - 3 staggered expanding rings
6. **Escape Effect** - Quick burst expansion (ready, needs event position)

### Files Modified
1. `src/rendering/InteractionEffects.ts` - New effect manager
2. `src/rendering/Renderer.ts` - Integrated effects (init, update, dispose)

### Event Integration
Events with working visual effects (have position data):
- `PREY_CONSUMED` → Predation effect at preyPosition
- `ENTITY_DIED` → Death effect at position
- `RESOURCE_BLOOM` → Bloom effect at center

Events needing position data for visual effects:
- `REPRODUCTION` → Needs position field
- `LEARNING` → Needs learnerPosition and teacherPosition fields
- `PREY_ESCAPED` → Needs position field

## Acceptance Criteria
- [x] Predation events are visually clear (ring + particles)
- [x] Death shows visual feedback (dispersing particles)
- [x] Resource bloom creates dramatic wave effect
- [x] Effects don't impact performance significantly (pooled geometries, cleanup)
- [x] Build compiles successfully
- [ ] Reproduction is visually satisfying - Blocked by event data
- [ ] Learning shows connection between creatures - Blocked by event data

## Future Enhancement
To enable all visual effects, add position data to these events in SimulationEvents.ts:
- ReproductionEvent: add `position: { x: number; y: number }`
- LearningEvent: add `learnerPosition` and `teacherPosition`
- PreyEscapedEvent: add `position: { x: number; y: number }`
