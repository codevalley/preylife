# Visual Overhaul Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete visual overhaul of the PreyLife ecosystem — new creature visuals with hybrid trait mapping, smooth ocean background, minimal HUD UI, creature detail drawer with lineage, and redesigned notification system.

**Architecture:** Modify existing entity geometry/shader files for creature visuals, rewrite ocean shader for smooth caustics, replace the entire UI layer (UIController, DashboardPanel, EntityTooltip, ToastManager) with a minimal HUD system, and add lineage tracking to the Creature class.

**Tech Stack:** TypeScript, Three.js (ShaderMaterial, GLSL), HTML/CSS (inline styles), Canvas 2D (for sparkline chart)

---

### Task 1: Ocean Background — Smooth Caustics + Depth Fog

**Files:**
- Modify: `src/rendering/OceanBackground.ts`

**Step 1: Rewrite the fragment shader**

Replace the entire `caustics()` function and gradient logic. The new shader uses overlapping `sin()` waves instead of `noise() + smoothstep()`:

```glsl
// Replace the caustics function (lines 73-89) with:
float caustics(vec2 uv, float time) {
  // Multiple overlapping sine waves at different scales/speeds
  float c = 0.0;
  c += sin(uv.x * 6.0 + time * 0.4 + sin(uv.y * 4.0 + time * 0.3)) * 0.3;
  c += sin(uv.y * 5.0 - time * 0.35 + sin(uv.x * 3.0 - time * 0.2)) * 0.25;
  c += sin((uv.x + uv.y) * 8.0 + time * 0.25) * 0.15;
  c += sin((uv.x - uv.y) * 7.0 - time * 0.3) * 0.1;

  // Smooth result (no smoothstep sharpening!)
  c = c * 0.5 + 0.5; // Normalize to 0-1
  c = c * c; // Soft contrast curve

  // Fade toward bottom — only visible in upper 40%
  c *= smoothstep(0.0, 0.4, uv.y);
  // Extra fade for very top edge
  c *= smoothstep(1.0, 0.85, uv.y);

  return c;
}
```

Update the main() gradient to use smoother blending and add depth fog:

```glsl
void main() {
  float depth = 1.0 - vUv.y;
  float depthCurve = pow(depth, 1.3); // Slightly less aggressive curve

  // Smooth three-point gradient (no horizontal noise)
  float midBlend = smoothstep(0.0, 0.5, depthCurve);
  float abyssBlend = smoothstep(0.4, 1.0, depthCurve);
  vec3 color = mix(
    mix(uSurfaceColor, uMidColor, midBlend),
    uAbyssColor,
    abyssBlend
  );

  // Soft caustic light
  float causticPattern = caustics(vUv, uTime);
  color += uCausticColor * causticPattern * uCausticIntensity;

  // Depth fog — subtle haze in deep zone
  float fogAmount = smoothstep(0.5, 1.0, depthCurve) * 0.15;
  vec3 fogColor = vec3(0.02, 0.05, 0.1);
  color = mix(color, fogColor, fogAmount);

  // Vignette
  float vignette = 1.0 - length((vUv - 0.5) * 1.2);
  vignette = smoothstep(0.0, 1.0, vignette);
  color *= 0.85 + vignette * 0.15;

  gl_FragColor = vec4(color, 1.0);
}
```

Also update the surface color to be warmer:
```typescript
surface: new THREE.Color(0x0c3055),  // Slightly warmer/brighter surface
```

**Step 2: Verify visually**

Run: `npm run dev`
Expected: Ocean should show smooth, undulating light patterns near the top that fade into darkness. No hard contour bands.

**Step 3: Commit**

```bash
git add src/rendering/OceanBackground.ts
git commit -m "feat: replace ocean caustics with smooth sine-wave light patterns"
```

---

### Task 2: Prey Creature Visual — Hybrid Trait Geometry + Shader

**Files:**
- Modify: `src/entities/Prey.ts` (geometry: `createFishGeometry`, colors in `createMesh`)
- Modify: `src/rendering/shaders/BioluminescentShader.ts` (add `uAge`, `uLongevity` uniforms)

**Step 1: Update prey geometry with hybrid trait mapping**

In `Prey.ts`, rewrite `createFishGeometry()` to incorporate:
- **Longevity** → body elongation (replaces energy-based sizing)
- **Strength** → fin prominence (larger dorsal + tail fins for strong prey)

Key changes:
- `bodyLength` scales with `longevity` (0.8-1.4 range) instead of just streamline
- `bodyWidth` inversely proportional to longevity (compact vs eel-like)
- Tail fin size and dorsal fin height scale with `strength` (0.5-1.5 range)
- Add a small dorsal fin triangle on top of the body for high-strength prey

**Step 2: Update prey shader for age + stealth transparency**

In `BioluminescentShader.ts`:
- Add uniforms: `uAge` (0-1 normalized), `uLongevity` (0-1)
- **Stealth** → modulate alpha/opacity: high stealth = more transparent (0.4-1.0 range)
- **Age** → desaturate color: mix base color toward gray as age increases
- Set `transparent: true` on the ShaderMaterial

Update `createMesh()` in `Prey.ts` to pass `uAge` and `uLongevity` uniforms.
Update `updateMeshPosition()` to update `uAge` based on `this.age / maxLifespan`.

**Step 3: Verify visually**

Run: `npm run dev`
Expected: Prey with high longevity should be elongated. High strength = prominent fins. High stealth = semi-transparent. Old prey look desaturated.

**Step 4: Commit**

```bash
git add src/entities/Prey.ts src/rendering/shaders/BioluminescentShader.ts
git commit -m "feat: hybrid trait visuals for prey — longevity elongation, strength fins, stealth transparency, age desaturation"
```

---

### Task 3: Predator Creature Visual — Hybrid Trait Geometry + Shader

**Files:**
- Modify: `src/entities/Predator.ts` (geometry: `createHunterGeometry`, colors in `createMesh`)
- Modify: `src/rendering/shaders/PredatorShader.ts` (add `uAge`, `uLongevity`, `uLearnability` uniforms)

**Step 1: Update predator geometry with hybrid trait mapping**

In `Predator.ts`, update `createHunterGeometry()`:
- **Strength** → jaw size (already exists) + add spiky dorsal ridges (zigzag points on top)
- **Longevity** → bulkier body (scale `bodyHeight` up with longevity for armored look)
- Keep stealth → body compactness

**Step 2: Update predator shader for learnability sensor dots + age**

In `PredatorShader.ts`:
- Add uniforms: `uAge` (0-1), `uLongevity` (0-1), `uLearnability` (0-1)
- **Learnability** → render small bright dots along the body midline (lateral line). Use `sin()` patterns on UV to create evenly-spaced dots, with brightness proportional to learnability.
- **Age** → desaturate + add noise-based scarring texture for old predators
- Set `transparent: true` for consistency

Update `createMesh()` and `updateMeshPosition()` in `Predator.ts` to pass new uniforms.

**Step 3: Verify visually**

Run: `npm run dev`
Expected: Strong predators have large jaws + dorsal spikes. High learnability shows bright sensor dots. Old predators look scarred/weathered. High longevity = bulkier.

**Step 4: Commit**

```bash
git add src/entities/Predator.ts src/rendering/shaders/PredatorShader.ts
git commit -m "feat: hybrid trait visuals for predators — dorsal spikes, sensor dots, age scarring, bulk"
```

---

### Task 4: Lineage Tracking in Creature Class

**Files:**
- Modify: `src/entities/Creature.ts`

**Step 1: Add lineage data to Creature**

Add new properties to the `Creature` class:

```typescript
// Lineage tracking
generation: number = 0;
parentTraits: GeneticAttributes | null = null;
grandparentTraits: GeneticAttributes | null = null;
greatGrandparentTraits: GeneticAttributes | null = null;
parentSpecies: EntityType | null = null;
```

**Step 2: Pass lineage through reproduction**

In `reproduceOffspring()`, after creating the offspring:

```typescript
offspring.generation = this.generation + 1;
offspring.parentTraits = { ...this.attributes };
offspring.grandparentTraits = this.parentTraits ? { ...this.parentTraits } : null;
offspring.greatGrandparentTraits = this.grandparentTraits ? { ...this.grandparentTraits } : null;
offspring.parentSpecies = this.type;
```

**Step 3: Pass lineage through species conversion**

In `convertToOppositeSpecies()`, after creating `newCreature`:

```typescript
newCreature.generation = this.generation; // Same generation (conversion, not reproduction)
newCreature.parentTraits = this.parentTraits;
newCreature.grandparentTraits = this.grandparentTraits;
newCreature.greatGrandparentTraits = this.greatGrandparentTraits;
newCreature.parentSpecies = this.type; // Record that parent was opposite species
```

**Step 4: Commit**

```bash
git add src/entities/Creature.ts
git commit -m "feat: add lineage tracking — generation count and ancestor trait history"
```

---

### Task 5: Minimal HUD — Population Pills + Controls

**Files:**
- Modify: `src/ui/UIController.ts` (complete rewrite of constructor HTML and layout)
- Modify: `src/ui/DashboardPanel.ts` (may simplify or remove — pills don't need collapsible panels)

**Step 1: Remove old panel-based layout**

Remove the `controlPanel` and `ecologyPanel` DashboardPanel instances. Replace with direct DOM creation for the minimal HUD layout.

**Step 2: Create top-left population pills**

Three vertically stacked pill badges with glass-morphism:

```html
<!-- Population Pills (top-left, position:fixed) -->
<div id="population-pills" style="position:fixed; top:16px; left:16px; display:flex; flex-direction:column; gap:8px; z-index:100;">
  <div id="prey-pill" class="pop-pill" style="...cyan glass pill...">
    <svg>...</svg> <span id="prey-count">0</span>
  </div>
  <div id="predator-pill" class="pop-pill" style="...orange glass pill...">
    <svg>...</svg> <span id="predator-count">0</span>
  </div>
  <div id="resource-pill" class="pop-pill" style="...green glass pill...">
    <svg>...</svg> <span id="resource-count">0</span>
  </div>
</div>
```

Each pill: `backdrop-filter:blur(12px)`, rounded (border-radius:20px), compact (~36px height), click to spawn.

**Step 3: Create top-right controls**

```html
<!-- Controls (top-right, position:fixed) -->
<div id="controls" style="position:fixed; top:16px; right:16px; display:flex; gap:8px; align-items:center; z-index:100;">
  <button id="play-pause-btn">▶</button>
  <button id="reset-btn">↺</button>
  <button id="settings-btn">⚙</button>
  <button id="help-btn">?</button>
  <span id="day-counter">Day 0</span>
</div>
```

Same glass-morphism pill styling. SVG icons for buttons (reuse existing SVGs).

**Step 4: Wire up event handlers**

Move all existing click handlers, keyboard shortcuts, and spawn logic to work with the new DOM elements. Preserve all existing functionality.

**Step 5: Remove ui-container dependency**

The old system relied on a `#ui-container` element. The new HUD uses `position:fixed` elements appended directly to `document.body`.

**Step 6: Verify**

Run: `npm run dev`
Expected: Population pills top-left, controls top-right. Old panels gone. Click pills to spawn. Play/pause works. All keyboard shortcuts work.

**Step 7: Commit**

```bash
git add src/ui/UIController.ts src/ui/DashboardPanel.ts
git commit -m "feat: replace panel UI with minimal HUD — population pills and control buttons"
```

---

### Task 6: Ecology Sparkline + Health Indicator

**Files:**
- Create: `src/ui/PopulationSparkline.ts`
- Modify: `src/ui/UIController.ts` (add sparkline to bottom-left)

**Step 1: Create PopulationSparkline component**

A self-contained class that:
- Creates a `<canvas>` element (250x80px)
- Draws a stacked area chart of prey/predator/resource populations
- Maintains its own rolling data buffer (last 200 data points)
- Has a health dot (small `<div>` circle) next to it
- Glass-morphism container

```typescript
export class PopulationSparkline {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private container: HTMLElement;
  private healthDot: HTMLElement;
  private data: Array<{prey: number, predator: number, resource: number}> = [];
  private maxDataPoints = 200;
  private expanded = false;

  constructor() { /* create DOM, position fixed bottom-left */ }

  addDataPoint(prey: number, predator: number, resource: number): void {
    /* push to data, shift if > max, redraw */
  }

  private draw(): void {
    /* Canvas 2D stacked area chart */
    /* Colors: prey=#00ccff, predator=#ff7722, resource=#44ffaa */
    /* Normalize to max value in window */
    /* Draw filled areas bottom-up: resource, prey, predator */
  }

  private updateHealthDot(prey: number, predator: number, resource: number): void {
    const total = prey + predator + resource;
    if (total === 0) { /* red */ return; }
    const anyExtinct = prey === 0 || predator === 0;
    const dominated = prey / total > 0.7 || predator / total > 0.7;
    if (anyExtinct) { /* red */ }
    else if (dominated) { /* amber */ }
    else { /* green */ }
  }

  getContainer(): HTMLElement { return this.container; }

  toggleExpanded(): void {
    /* Expand canvas to 500x200 overlay, or collapse back */
  }
}
```

**Step 2: Integrate into UIController**

In `UIController.updateStats()`, call `this.sparkline.addDataPoint(stats.preyCount, stats.predatorCount, stats.resourceCount)`.

Add click handler on sparkline container to toggle expanded view.

**Step 3: Verify**

Run: `npm run dev`
Expected: Bottom-left shows a small sparkline chart that updates in real-time. Health dot changes color based on balance. Click expands to larger view.

**Step 4: Commit**

```bash
git add src/ui/PopulationSparkline.ts src/ui/UIController.ts
git commit -m "feat: add population sparkline with health indicator"
```

---

### Task 7: Creature Detail Drawer

**Files:**
- Create: `src/ui/CreatureDrawer.ts`
- Modify: `src/ui/EntityTooltip.ts` (simplify to minimal hover label)
- Modify: `src/rendering/Renderer.ts` (click opens drawer instead of details panel)
- Modify: `src/ui/UIController.ts` (integrate drawer)

**Step 1: Create CreatureDrawer component**

A slide-in drawer from the right side:

```typescript
export class CreatureDrawer {
  private container: HTMLElement;
  private isOpen = false;
  private selectedCreature: Creature | null = null;
  private updateInterval: number | null = null;

  constructor() {
    /* Create drawer DOM:
       - Fixed position right:0, top:0, height:100vh, width:280px
       - Transform: translateX(100%) when closed, translateX(0) when open
       - Transition: transform 0.3s ease
       - Glass-morphism background
       - Close button (X) top-right
       - Content sections:
         1. Species label + small creature icon
         2. Energy bar (full width)
         3. Genetic trait bars (strength, stealth, learnability, longevity)
            - Each bar: label, value, colored horizontal bar
            - Strength = red, Stealth = blue, Learnability = yellow, Longevity = purple
         4. Stats: Age (days), Generation #, Offspring count, Food consumed
         5. Lineage section:
            - "Generation N" header
            - Mini family tree:
              - Current creature traits summary
              - Parent traits (if available) with arrow
              - Grandparent traits (if available) with arrow
              - Species labels if conversion happened
    */
  }

  open(creature: Creature): void { /* slide in, start update interval */ }
  close(): void { /* slide out, stop interval */ }
  private update(): void { /* refresh all stats from creature */ }
  private renderFamilyTree(): string { /* generate lineage HTML */ }
}
```

**Step 2: Simplify EntityTooltip to minimal hover label**

Rewrite `EntityTooltip` to only show:
- Species name + dominant trait descriptor (e.g. "Stealthy Fish", "Strong Hunter")
- Small energy bar
- Positioned near cursor (not attached to creature)
- No details panel — that's the drawer's job now

Dominant trait logic:
```typescript
function getDominantTrait(creature: Creature): string {
  const attrs = creature.attributes;
  const max = Math.max(attrs.strength, attrs.stealth, attrs.learnability, attrs.longevity);
  if (max === attrs.strength) return 'Strong';
  if (max === attrs.stealth) return 'Stealthy';
  if (max === attrs.learnability) return 'Adaptive';
  return 'Hardy';
}
```

**Step 3: Update Renderer click handler**

In `Renderer.ts`, the `onClick` handler should:
- On entity click: call `CreatureDrawer.open(creature)` instead of `EntityTooltip.selectEntity()`
- On background click: call `CreatureDrawer.close()`

The drawer reference needs to be passed to or accessed from the Renderer. Add it as a constructor parameter or use an event-based approach.

**Step 4: Verify**

Run: `npm run dev`
Expected: Hover shows minimal tooltip. Click opens right-side drawer with full stats + lineage. Click away closes drawer.

**Step 5: Commit**

```bash
git add src/ui/CreatureDrawer.ts src/ui/EntityTooltip.ts src/rendering/Renderer.ts src/ui/UIController.ts
git commit -m "feat: add creature detail drawer with lineage, simplify hover tooltip"
```

---

### Task 8: Redesign Notification System

**Files:**
- Modify: `src/ui/ToastManager.ts`

**Step 1: Restructure toast containers**

Change from left/right positioning to bottom-center:
- Both ecology event cards and educational insight cards appear at bottom-center
- Remove ephemeral birth/death toasts entirely (remove those event subscriptions)
- Keep only significant events: extinction, evolution, resource bloom, population milestones, ecosystem balance/collapse

**Step 2: Restyle ecology event cards**

Cards at bottom-center, max-width 400px, centered:
```css
#event-toast-container {
  position: fixed;
  bottom: 100px; /* above the sparkline */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 400px;
  z-index: 200;
}
```

Card style: glass-morphism, narrative messages (keep existing text), fade after 5 seconds (down from 20).

**Step 3: Restyle educational insight cards**

Same container but distinct visual style:
- Warm amber-tinted glass: `background: rgba(45, 30, 8, 0.85)`
- Lightbulb icon prefix
- Same positioning

**Step 4: Remove ephemeral event subscriptions**

In `subscribeToEvents()`, remove subscriptions for:
- `PREY_BORN`, `PREDATOR_BORN` (births)
- `PREY_DIED`, `PREDATOR_DIED` (deaths)
- `RESOURCE_SPAWNED`, `RESOURCE_CONSUMED` (resources)
- `PREY_CONSUMED`, `PREY_ESCAPED` (predation)
- `PREY_LEARNED`, `PREDATOR_LEARNED` (learning)

Keep subscriptions for:
- `REPRODUCTION` — no toast (removed)
- `EXTINCTION`, `SPECIES_CONVERSION`, `RESOURCE_BLOOM`, `POPULATION_MILESTONE`

**Step 5: Verify**

Run: `npm run dev`
Expected: No more birth/death counter toasts. Significant events appear bottom-center with distinct styles for ecology vs educational. Cards fade after 5s.

**Step 6: Commit**

```bash
git add src/ui/ToastManager.ts
git commit -m "feat: redesign notifications — bottom-center cards, remove ephemeral toasts"
```

---

### Task 9: Polish + Integration Pass

**Files:**
- Modify: `src/ui/UIController.ts` (remove dead code, clean up references to old panels)
- Modify: `src/main.ts` (if needed for new component wiring)
- Modify: `index.html` (remove `#ui-container` if no longer needed)

**Step 1: Remove dead code**

- Remove ecology events tracking array and all related table rendering code from UIController
- Remove `DashboardPanel` usage (if fully replaced by pills)
- Clean up `ecologyPanel` references
- Remove old tooltip detailed stats HTML from UIController (`createOrUpdateTooltip`, `setupTooltipEvents` methods)
- Remove the `#ui-container` element from `index.html` if pills/controls are appended to body

**Step 2: Ensure all features still work**

Manually verify:
- [ ] Ocean: smooth caustics, no contour bands, depth gradient
- [ ] Prey: longevity=elongation, strength=fins, stealth=transparency, age=desaturation
- [ ] Predator: strength=jaw+spikes, stealth=dark+lure, learnability=dots, longevity=bulk, age=scars
- [ ] Population pills: show counts, click to spawn
- [ ] Controls: play/pause, reset, settings, help, day counter
- [ ] Sparkline: updates real-time, health dot changes, click to expand
- [ ] Drawer: opens on creature click, shows stats + lineage, closes on click-away
- [ ] Hover tooltip: minimal label with dominant trait
- [ ] Notifications: bottom-center, ecology vs educational styling, no ephemeral toasts
- [ ] Keyboard shortcuts: Space (play/pause), R (reset)
- [ ] Settings panel still opens from gear icon
- [ ] Help modal still opens from ? icon
- [ ] Feedback button still present

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: clean up dead code and verify integration"
```

---

### Task 10: Build Verification

**Step 1: Run production build**

Run: `npm run build`
Expected: Clean build with no TypeScript errors.

**Step 2: Preview production build**

Run: `npm run preview`
Expected: All features work in production build.

**Step 3: Run linter**

Run: `npm run lint`
Expected: No new lint errors introduced.

**Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address build/lint issues from visual overhaul"
```
