# Ecosystem Mechanics v2 — Deep Analysis & Recommendations

**Date**: 2026-02-01
**Context**: Post systems-refactor + ocean visual revamp. Full audit of ecological mechanics.

---

## 1. Design Philosophy (Author's Intent)

The core principle is a **god-free ecosystem** — no central intelligence corrects or balances the system. All balance must emerge from individual creature mechanics and their interactions. The system should have enough mechanical depth to give evolution room to find its own equilibria.

### The Two Core Traits

The world is deliberately simplified into two trait buckets:

- **Strength** — All physical traits. Raw power, speed, body mass, jaw strength, musculature. The leopard's bite, the buffalo's horns.
- **Stealth** — All cognitive/cunning traits. Not just hiding — this encompasses brain power, sensory acuity, deception, pattern recognition, spatial awareness. The leopard's spots, the octopus's camouflage, the human's brain. Anything that uses *intelligence* to negate physical advantage.

This Physical vs Mental dichotomy is the fundamental axis of the simulation.

### Supporting Traits

- **Learnability** — Cultural transmission. When creatures bump into each other, traits mutate slightly. Represents collective intelligence, herd knowledge, social learning. Proximity-based trait exchange.
- **Longevity** — Survival duration as an evolutionary variable. Gives "weaker" species (those needing more chances or time) the ability to persist against aggressive ones.
- **Energy/Metabolism** — The universal currency and constraint. Ties all behavior to a finite resource budget.

### Emergent Balancing Mechanisms

- **Reproduction**: High inheritance fidelity with slight variance, plus rare dramatic mutations to prevent evolutionary dead ends.
- **Survival reproduction**: Ultra-rare reproduction even when conditions aren't met — a species-preservation escape valve, not a god-hand.
- **Species conversion**: Homogeneity-driven speciation. If a society becomes too uniform (detected via proximity/bumping), some individuals flip to the opposite species. "If a field is full of goats, some goats start eating other goats."

---

## 2. Post-Refactor Impact Assessment

### What Changed (and Shouldn't Have Affected Balance)

The systems refactor reorganized code into discrete systems but was meant to preserve logic. However, two structural changes created subtle ecological shifts:

**A. System execution ordering**

Systems now execute in strict priority sequence per frame:

```
Aging(20) → Movement(30) → Predation(40) → Foraging(50) →
Reproduction(60) → Learning(70) → Conversion(80) → Resources(90)
```

Previously, creature self-updates (movement, detection, decisions) were interleaved with interaction resolution. Now **all creatures move first, then interactions resolve**. A prey that "decides to flee" has already moved before the predation system checks capture range. This creates a subtle **prey advantage** — prey effectively get a "free move" before predation is evaluated.

**B. Velocity smoothing + speed reduction (post-refactor visual polish)**

- Base speed: 8 → 6.5 (19% reduction)
- Velocity lerp at 0.12 per frame → creatures take ~20 frames to complete a turn
- Net effect: creatures cover significantly less area per unit time
- Encounter rates drop across the board
- Energy costs were calibrated for the old speed profile

### Impact on Ecosystem

| Metric | Before | After | Effect |
|--------|--------|-------|--------|
| Encounter rate | Higher | Lower | Predators find prey less often |
| Prey escape | Simultaneous | Prey moves first | Slight prey advantage |
| Movement area/frame | ~8 units | ~4-5 effective | Fewer interactions overall |
| Energy burn | Calibrated | Uncalibrated | Predators may starve faster |

**Verdict**: The ecosystem is now tilted toward prey survival. Predators face lower encounter rates with unchanged energy burn.

---

## 3. Mechanical Audit — What Works, What's Broken

### 3.1 Predation: Double-Gated (Critical Issue)

Predation requires passing **two independent probability gates**:

1. `predator.canCatchPrey()` — Strength-weighted contest, base 35%, capped 15%–75%
2. `prey.canEscapeWithStealth()` — Stealth-weighted contest, base ~40% escape, capped 15%–75%

Combined success rate with median attributes:
```
P(catch) × P(no escape) = ~35% × ~60% = ~21% per encounter
```

With the reduced encounter frequency post-refactor, a predator might get 2-3 encounters per hunger cycle and succeed in fewer than 1. Meanwhile, the predator energy multiplier is **2.5x** vs prey's **0.7x** — predators burn energy 3.57x faster.

**This is the single biggest balance issue.** The double gate made sense when encounters were frequent, but with slower movement, it's too punishing.

**Why this matters for the god-free philosophy**: If predators consistently starve, the system can't find equilibrium — it collapses to prey-only, then resources deplete, then everything dies. The mechanics need to give predators a *viable* ecological niche, not a guaranteed one.

### 3.2 Learnability: Nearly Vestigial (Major Issue)

Current activation chain:
```
Chance = learnability(0.05) × chanceMultiplier(0.1) = 0.5% per frame (prey)
× 20% not-skipped if specialized = 0.1% effective
× requires teacher with attribute > 0.7
× requires attribute difference > 0.15
× max learning: 0.05 per event
× energy cost: 10 per event
```

A prey creature might meaningfully learn **once in its entire lifetime**, and the effect (0.05 attribute change) is smaller than a single mutation. The attribute occupies genetic space but provides almost no evolutionary pressure.

**Why this matters for the philosophy**: Learnability is supposed to represent cultural transmission — one of the most powerful forces in real evolution. Currently it's too weak to create any selective pressure. Creatures with high learnability gain almost nothing, so the trait drifts randomly rather than being selected for or against. It's an evolutionary dead variable.

### 3.3 Reproduction: Burst Dynamics (Moderate Issue)

Reproduction probabilities are per-frame:
- Prey (high energy): **20% per frame** after cooldown
- Predator (high energy): **40% per frame** after cooldown

Once cooldown expires and energy threshold is met, reproduction happens within 2-5 frames — essentially **guaranteed and instant**. The cooldown is the actual gating mechanism, not the probability.

This creates boom-bust population dynamics: populations explode in bursts, then crash as resources deplete. Real populations grow more gradually.

**However**: In the god-free philosophy, boom-bust might be acceptable — it's an emergent pattern. The question is whether the bust phase recovers gracefully or leads to extinction spirals.

### 3.4 Longevity: Functional but Invisible (Minor Issue)

Longevity affects:
- Max lifespan: 60 + longevity × 40 = 60–100 seconds
- Metabolic efficiency: reduces energy burn with age
- Age-related efficiency decline: slowed by high longevity

This works mechanically but has no **active** behavioral expression. A long-lived creature looks and acts exactly like a short-lived one — it just persists longer. The trait creates selection pressure (longer life = more reproduction opportunities), but the player can't observe it working.

### 3.5 Energy Economy: Viable but Tight (Moderate Issue)

Energy flow:
```
Resource(12) → ×1.2 bonus → Prey gains 14.4
Prey(175 max) → ×0.85 transfer → Predator gains prey.energy × 0.85
Predator(560 max) → death → corpse resources (70% maxEnergy worth)
```

The corpse-to-resource recycling is ecologically sound — it creates a nutrient cycle. But the predator burn rate (2.5x multiplier) relative to prey (0.7x) means predators need to hunt very frequently. Combined with the 21% catch rate, predators are economically fragile.

### 3.6 Species Conversion: Well-Designed but Ultra-Rare

The mechanic is philosophically excellent — homogeneity pressure driving speciation is a real evolutionary force. The implementation requires:
- 450 frames of isolation from opposite species
- 300/600 frames of same-species contact
- Extreme trait values
- Probability roll (base 5%, up to 25% with bonuses)

This is appropriately rare for an "evolutionary event." The concern is whether it fires often enough to matter in a typical viewing session (5-15 minutes).

### 3.7 The Strength/Stealth Dichotomy: Sound but Unbalanced

The Physical vs Mental split is philosophically clean. However, in the current implementation, Stealth (mental) is mechanically superior because it provides:

**For Prey**: Better predator detection range, better resource detection range, erratic fleeing (harder to catch), higher escape probability, AND reduced predator detection of self.

**For Predators**: Better prey detection range AND harder for prey to detect.

**Strength provides**: Faster movement (but higher energy cost), higher catch probability, higher flee speed for prey.

The issue: Stealth provides **both offensive and defensive benefits** while Strength provides offensive benefits with a **defensive penalty** (higher energy cost). A high-stealth prey is harder to find AND harder to catch AND better at finding food. A high-strength prey is faster but burns more energy and is equally easy to detect.

**This creates a dominant strategy**: Stealth-focused evolution should outperform strength-focused evolution in most scenarios, reducing the diversity of evolutionary outcomes.

---

## 4. Recommendations (God-Free Compatible)

All recommendations below preserve the core principle: no central correction, all balance from individual mechanics.

### Tier 0: Critical Fixes (Restore Viability)

#### Fix A: Reduce Predation Gates to Single Contest

**Current**: Two independent rolls (canCatch AND canEscape).
**Proposed**: Single unified contest.

The catch-vs-escape should be one roll, not two. Combine strength-advantage and stealth-advantage into a single "hunt outcome" score:

```
huntScore = (predator.strength - prey.strength) × weight_str
          + (predator.stealth - prey.stealth) × weight_stl
          + specialization bonuses
          + base chance

outcome = random() < clamp(huntScore, 0.15, 0.75)
```

This preserves the trait interplay but removes the multiplicative penalty. Expected catch rate rises from ~21% to ~35-45% with median attributes.

**Why god-free**: This isn't adding a correction — it's fixing a mathematical artifact. Two independent gates weren't an intentional design for "extra difficulty," they were an implementation detail that creates unintended predator fragility.

#### Fix B: Recalibrate Energy Multipliers

**Current**: Predator 2.5x, Prey 0.7x
**Proposed**: Predator 1.6x, Prey 0.8x

The 3.57x ratio is too extreme. In real ecosystems, predators are typically 2-3x more metabolically expensive than their prey, not 3.5x. Reducing to 2x ratio (1.6/0.8) gives predators more margin while still making energy a meaningful constraint.

#### Fix C: Adjust Velocity Smoothing

**Current**: Lerp rate 0.12 (very smooth, very slow turning)
**Proposed**: Lerp rate 0.20

This maintains visible smooth arcs while allowing creatures to complete turns in ~12 frames instead of ~20. Restores encounter rates closer to pre-refactor levels without losing the visual improvement.

### Tier 1: Make Traits Viable (Evolutionary Depth)

#### Fix D: Strengthen the Strength Trait's Defensive Value

Currently, stealth is better for both offense and defense. To make strength competitively viable:

- High-strength prey should have a **deterrence effect** — predators with low strength should be less likely to *attempt* a hunt against visibly strong prey (even before the catch contest). In nature, a lion doesn't chase a buffalo unless hungry enough. The strength asymmetry should factor into the predator's *decision to hunt*, not just the outcome.
- High-strength creatures should have a **stamina advantage** — faster sustained movement at lower relative energy cost (currently strength *increases* movement cost, which penalizes the trait).

This creates a genuine trade-off: Stealth = avoid the fight entirely, Strength = win the fight if it happens. Both viable, different niches.

#### Fix E: Revive Learnability as Cultural Transmission

The core idea — trait exchange through proximity — is excellent. The numbers just need tuning:

**Current**: 0.5% activation, 0.05 max change, 10 energy cost.
**Proposed**:
- Activation: `learnability × 0.5` (so 0.05 learnability = 2.5% per frame — 5x higher)
- Max change: 0.08 per event (larger than a mutation)
- Remove the 80% skip for specialized creatures (specialization should be challenged by learning, not protected from it)
- Energy cost: 3 (current 10 is prohibitive)

Additionally, make learning **bidirectional** — when two creatures are near each other, both shift slightly toward the other's traits. This represents genuine cultural mixing rather than one-way copying. The more creatures bump into diverse neighbors, the more the population diversifies.

**Why this matters**: With viable learnability, populations that stay in groups develop shared trait profiles (culture). Isolated creatures maintain individual traits. This creates a genuine evolutionary pressure — is it better to be a social learner or an independent specialist?

#### Fix F: Give Longevity Active Expression

Add a small, accumulating **experience bonus** for older creatures:

```
experienceBonus = min(0.15, age / maxLifespan × longevity × 0.2)
```

Apply this bonus to detection range. Old, long-lived creatures see farther — they "know the terrain." This makes longevity visibly valuable and creates an emergent dynamic: elder creatures are more effective survivors, making them valuable to the gene pool.

**Why god-free**: This is an individual mechanic, not a population correction. Each creature independently benefits from its own longevity trait.

### Tier 2: Emergent Group Behavior (High Visual Impact)

#### Fix G: Proximity-Based Alertness (Not Alarm Signaling)

Instead of an explicit "alarm" system, make individual detection range increase when prey are near each other:

```
detectionBonus = min(0.5, nearbyPreyCount × 0.1)
effectiveDetectionRange = baseRange × (1 + detectionBonus)
```

This is a purely individual mechanic — each prey independently benefits from being near others. But it **emergently creates schooling pressure**: prey near other prey survive better, so they naturally cluster. No god-hand, just individual incentive.

The reverse should also apply: isolated prey have standard detection. This creates a visible risk/reward — staying in a group is safer but means sharing resources.

#### Fix H: Predator Satiation State

When a predator's energy exceeds 65%, reduce its movement speed and hunting motivation:

```
if (energyRatio > 0.65) {
  // Satiated — drift slowly, no active hunting
  speed *= 0.4;
  huntingEnabled = false;
}
```

This is an individual metabolic mechanic, not a correction. It creates natural "safe zones" around well-fed predators and introduces visible behavioral rhythm: hunt → eat → drift → hungry → hunt. This makes the simulation more dynamic and watchable.

### Tier 3: Environmental Structure

#### Fix I: Resource Gradient Zones

Instead of uniform random resource spawning, create 2-3 persistent "nutrient upwelling" zones where resources spawn at 3x normal density. Zones shift slowly over time (every 200-300 days).

This creates:
- Natural migration patterns (creatures follow resources)
- Territorial hotspots (predators camp near rich zones)
- Strategic movement (not just random wandering)

**Why god-free**: The environment provides structure, but creatures must independently discover and exploit it. The zones don't correct populations — they create geography that individual mechanics interact with.

### Tier 4: Make Strength vs Stealth a Real Arms Race

#### Fix J: Ensure Both Strategies Can Win

The key to making the Physical vs Mental dichotomy exciting is ensuring neither consistently dominates. Current mechanics favor stealth. To fix:

**Strength-dominant scenarios**: Open areas with no cover, high resource density (strength creatures eat more, faster), group encounters (strong creatures intimidate).

**Stealth-dominant scenarios**: Sparse resources (stealth creatures find food better), high predator density (stealth creatures evade better), mixed populations (stealth enables selective engagement).

The simulation should naturally oscillate between these scenarios as populations shift resources and density. If strength-prey dominate, they deplete resources fast → scarcity favors stealth-prey → stealth-prey grow → density rises → strength-predators thrive against clustered stealth-prey → cycle continues.

**This oscillation is the holy grail of the god-free design**: no correction needed, just properly balanced individual mechanics creating macro-scale cycles.

---

## 5. Priority Matrix

| Fix | Impact | Effort | Risk | Priority |
|-----|--------|--------|------|----------|
| A. Single predation contest | Critical | Low | Low | **Immediate** |
| B. Energy multiplier rebalance | Critical | Low | Low | **Immediate** |
| C. Velocity smoothing tune | High | Trivial | None | **Immediate** |
| D. Strength defensive value | High | Medium | Medium | **Next** |
| E. Revive learnability | High | Medium | Low | **Next** |
| F. Longevity experience bonus | Medium | Low | Low | **Next** |
| G. Proximity alertness | High | Medium | Medium | **Later** |
| H. Predator satiation | Medium | Low | Low | **Later** |
| I. Resource gradient zones | High | High | Medium | **Later** |
| J. Arms race balancing | High | High | High | **Ongoing** |

---

## 6. What's Deliberately NOT Recommended

These are often suggested for ecosystem sims but would violate the god-free philosophy:

- **Population caps / forced culling** — god-hand correction
- **Guaranteed minimum populations** — god-hand protection
- **Adaptive difficulty** — god-hand balancing
- **Forced diversity spawning** — god-hand intervention
- **Resource spawning that responds to population** — god-hand feedback (note: emergency regeneration already exists and is borderline)

The existing survival reproduction and species conversion mechanics are acceptable because they operate through individual creature mechanics (probability per creature), not population-level correction.

---

## 7. Open Questions

1. **Should the emergency resource regeneration be removed?** It triggers when prey < 20% of initial count — this is arguably a god-hand. Consider replacing with higher corpse-to-resource conversion instead.

2. **Is the resource bloom (seasonal) a god-hand?** It's more like weather/seasons — environmental structure rather than population correction. Probably fine.

3. **Should creatures have any spatial memory?** Even simple "avoid the spot where I was almost caught" would add behavioral depth without central intelligence. But it adds complexity.

4. **Is the 2-species model sufficient?** Real food webs have many trophic levels. Adding a third level (apex predator, or resource types) would multiply emergent dynamics but also multiply balancing challenges.

---

*Next step: Implement Tier 0 fixes (A, B, C) to restore ecosystem viability, then evaluate whether Tier 1 changes are needed.*
