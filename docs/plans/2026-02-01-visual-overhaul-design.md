# Visual Overhaul Design

## 1. Creature Visual System (Hybrid Trait Mapping)

### Prey (Fish)
- **Strength** → Fin prominence (larger dorsal/tail fins)
- **Stealth** → Body opacity/transparency (high stealth = translucent, faint glow)
- **Learnability** → Pulse/animation speed (faster = more adaptive)
- **Longevity** → Body elongation (long-lived = eel-like, short-lived = compact)
- **Age** → Color desaturation over time (young = bright/saturated, old = weathered tint)

### Predator (Hunters)
- **Strength** → Jaw/mouth size + spikier dorsal ridges
- **Stealth** → Darker body with brighter lure contrast (anglerfish effect)
- **Learnability** → Sensor dots along body (lateral line organs — more/brighter)
- **Longevity** → Bulkier, more armored silhouette
- **Age** → Color desaturation + texture noise (scarring)

### Resources (Plankton)
- Keep current system (simple soft circles, green glow, energy-based sizing)

## 2. Ocean Background (Soft Caustics + Depth Fog)

### Top Zone (upper ~25% — surface)
- Smooth sine-wave caustic light patterns (overlapping waves at different scales/speeds)
- No smoothstep sharpening — pure smooth blending
- Warm cyan-white light color (sunlight through water)
- Slow, gentle drift animation

### Mid Zone (~25-65%)
- Caustics fade out via depth multiplier
- Color transition: deep blue → blue-black
- Marine snow particles more visible (backlit)

### Deep Zone (~65-100%)
- Near-black with subtle dark blue variation
- No caustics
- Faint depth fog (slight haze layer)

### Overall
- Smooth continuous gradient, no banding
- Vignette at screen edges
- sin() combinations replace noise + smoothstep (eliminates contour look)

## 3. UI — Minimal HUD

### Top-Left: Population Pills
- Three stacked pill badges: prey (cyan), predator (orange), resource (green)
- Icon + count in each pill
- Click to spawn that entity type

### Bottom-Left: Ecology Sparkline + Health Dot
- Stacked area chart (~250x80px) showing populations over last N days
- Predator-prey oscillation waves visible at a glance
- Health dot: green (balanced), amber (one pop >70%), red (any pop <5%)
- Click to expand into larger chart overlay

### Top-Right: Controls
- Play/pause + speed as minimal floating pills
- Settings gear, reset icon
- Day counter as small text

### Right Side: Creature Detail Drawer
- Hidden by default, opens on creature click
- Slides in from right (~280px wide)
- Content: creature sprite preview, species label, genetic trait bars, energy bar, age, generation
- Lineage section: generation count, parent traits, mini family tree (2-3 ancestor generations)
- Close button or click-away to dismiss

### Removed
- Ecology events list panel (replaced by sparkline + health indicator)
- Help as permanent panel (moved to ? icon → modal)
- Per-creature birth/death counter toasts

## 4. Tooltips + Notification Cards

### Hover Tooltips
- Cursor-anchored (not creature-anchored) minimal label
- Shows: species + dominant trait descriptor + energy bar
- Appears on hover, disappears on mouse-out
- Quick glance — click opens full drawer

### Ecology Event Cards (Bottom-Center)
- Significant events only: extinction warnings, population booms, resource blooms, evolution milestones
- Short narrative sentence + icon
- Fade after ~5 seconds
- Stack up to 2-3, newest at bottom

### Educational Insight Cards (Bottom-Center)
- Contextual tips about evolutionary concepts
- Distinct style: warm amber-tinted glass + lightbulb icon
- Triggered by simulation events (bloom → resource competition, oscillation → Lotka-Volterra)
- Visually distinct from ecology event cards
