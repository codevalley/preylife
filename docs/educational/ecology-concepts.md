# Ecology Concepts

This guide explains the ecological principles demonstrated in PreyLife.

## Predator-Prey Dynamics

### The Lotka-Volterra Model

PreyLife demonstrates the classic predator-prey relationship described by the Lotka-Volterra equations:

```
dN/dt = rN - aNP   (Prey population change)
dP/dt = baNP - mP  (Predator population change)
```

Where:
- N = Prey population
- P = Predator population
- r = Prey growth rate
- a = Predation rate
- b = Conversion efficiency
- m = Predator death rate

### Population Cycles

In PreyLife, you'll observe characteristic population cycles:

1. **Prey increase** - Abundant resources, few predators
2. **Predator increase** - Abundant prey, predators reproduce
3. **Prey decrease** - High predation pressure
4. **Predator decrease** - Prey scarcity causes starvation
5. **Cycle repeats**

This creates oscillating populations with predators lagging behind prey.

### Phase Shifts

Sometimes populations can undergo sudden shifts:
- **Prey extinction cascade** - Too many predators → no prey → predator extinction
- **Predator collapse** - Not enough prey → predator extinction → prey explosion
- **Resource depletion** - Too many prey → resource crash → prey crash

## Energy Flow

### Trophic Levels

PreyLife models a simple food chain:

```
Level 1: Resources (Producers)
    ↓ Energy transfer
Level 2: Prey (Primary Consumers)
    ↓ Energy transfer
Level 3: Predators (Secondary Consumers)
```

### Ecological Efficiency

Only a fraction of energy transfers between trophic levels:
- Prey gain energy from resources with a 20% bonus
- Predators gain 85% of prey's energy when hunting

This models the "10% rule" in ecology - most energy is lost to metabolism at each level.

### Energy Cycling

When organisms die, their energy returns to the ecosystem:
- Dead creatures spawn resources (nutrient cycling)
- This prevents total energy loss from the system
- Creates a closed-loop energy model

## Carrying Capacity

### Resource Limitation

PreyLife implements carrying capacity through:
- Maximum resource count (2000)
- Resource decay over time
- Competition for limited food

When populations exceed carrying capacity:
- Resources become scarce
- Starvation increases
- Population decreases

### Dynamic Equilibrium

Healthy ecosystems in PreyLife settle into dynamic equilibrium:
- Population fluctuates around a mean
- Resources regenerate at consumption rate
- Births roughly equal deaths

## Niche Partitioning

### Trait Specialization

PreyLife creatures can specialize in different survival strategies:

**Prey Strategies:**
- **Stealth specialists** - Avoid detection, zigzag when fleeing
- **Strength specialists** - Outrun predators directly
- **Longevity specialists** - Survive longer, reproduce more

**Predator Strategies:**
- **Stealth hunters** - Better at detecting hidden prey
- **Strength hunters** - Better at catching fleeing prey
- **Endurance hunters** - Survive longer between meals

### Competitive Exclusion

When two similar strategies compete:
- One often dominates (competitive exclusion principle)
- Or they differentiate further (niche partitioning)
- Environmental changes can shift which strategy wins

## Population Genetics

### Genetic Drift

In small populations, random chance affects trait frequencies:
- Rare traits can become common by chance
- Common traits can be lost
- Small populations are more susceptible

### Selection Pressure

Environmental factors drive trait changes:
- **Predation pressure** → Favors prey with better escape abilities
- **Food scarcity** → Favors efficient foragers
- **Competition** → Favors specialized traits

### Gene Flow

Social learning in PreyLife simulates gene flow:
- Traits spread between individuals
- Can homogenize populations
- Can introduce new traits to groups

## Ecosystem Stability

### Resilience

Stable ecosystems in PreyLife can recover from disturbances:
- Emergency resource spawning when prey are critically low
- Population recovery after crashes
- Species conversion as a stabilizing mechanism

### Fragility

Some conditions create fragile ecosystems:
- Very low diversity (all similar traits)
- Extreme population imbalances
- Resource depletion

### Biodiversity Benefits

Trait diversity provides ecosystem benefits:
- Different strategies succeed in different conditions
- Population crashes affect some individuals less
- Recovery is faster with diverse gene pools

## Ecological Succession

### Pioneer Species

Early in simulation, populations establish:
- Initial trait distributions set by spawning
- Early reproduction shapes future generations
- "Founder effect" visible in small populations

### Climax Community

Over time, stable patterns emerge:
- Dominant traits become established
- Population fluctuations stabilize
- Predator-prey ratios balance

### Disturbance

Events can reset succession:
- Mass extinctions
- Resource blooms
- Manual population changes

## Concepts to Explore

### Questions to Investigate

1. **What prey strategy survives longest?**
   - High stealth? High strength? Balanced?

2. **How do predator numbers affect prey evolution?**
   - More predators = more pressure for escape traits?

3. **Does biodiversity increase stability?**
   - Compare outcomes with diverse vs uniform starting traits

4. **What causes extinction cascades?**
   - Identify the tipping points

5. **Can you predict population cycles?**
   - Observe patterns and forecast peaks/crashes

### Data Collection Ideas

Track over time:
- Population counts
- Average attributes
- Extinction events
- Resource levels

Look for correlations between:
- Predator traits and prey evolution
- Resource abundance and population growth
- Trait diversity and extinction risk
