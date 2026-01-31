# Simulation Mechanics

This guide explains how PreyLife's simulation works under the hood.

## Core Concepts

### Energy System

Energy is the fundamental resource driving all behavior in PreyLife.

**Energy Flow:**
```
Resources (static) → Prey (consumption) → Predators (hunting)
       ↓                    ↓                     ↓
    Decay              Death/Decay            Death/Decay
       ↓                    ↓                     ↓
   Removed          → New Resources ←
```

**Energy Rules:**
- All creatures lose energy over time (metabolism)
- Movement consumes additional energy
- Higher strength = higher energy cost
- Higher longevity = more efficient metabolism
- Energy at 0 = death

### Genetic Attributes

Every creature has four genetic attributes (0.0 to 1.0 scale):

| Attribute | Effects |
|-----------|---------|
| **Strength** | Movement speed, hunting success (predator), escape speed (prey), energy cost |
| **Stealth** | Detection avoidance (prey), prey detection range (predator), direction variability when fleeing |
| **Learnability** | Rate of trait adaptation from observing others |
| **Longevity** | Maximum lifespan, metabolic efficiency |

### Trait Trade-offs

Attributes create natural trade-offs:
- **High Strength**: Faster but uses more energy
- **High Stealth**: Better detection but less physical power
- **High Learnability**: Adapts quickly but less specialized
- **High Longevity**: Lives longer but slower to reproduce

## Entity Behaviors

### Resource Behavior

Resources are static and follow these rules:
- **Spawning**: Naturally regenerate over time (0.5% chance per frame)
- **Blooms**: Every 90 days, large clusters spawn (75 resources in 5 clusters)
- **Decay**: After 30 days, resources have a chance to decay
- **Death Drops**: When creatures die, resources spawn at their location
- **Cap**: Maximum 2000 resources in simulation

### Prey Behavior

Prey alternate between several behavioral modes:

**Foraging (when hungry)**
- Detect resources within 50-80 units (based on hunger)
- Move toward nearest resource
- Hungrier prey search more aggressively

**Fleeing (when predator detected)**
- Detect predators within 100-120 units
- Move directly away from predator
- Speed boost while fleeing
- High-stealth prey zigzag unpredictably

**Wandering (when full)**
- Random direction changes
- Minimal resource seeking
- Will opportunistically grab close resources

**Reproduction (when energy > 80%)**
- Creates offspring with inherited traits
- Transfers energy to offspring
- Offspring spawn nearby with random variation

### Predator Behavior

Predators follow a simpler behavioral pattern:

**Hunting (when hungry)**
- Detect prey within 80-120 units (based on hunger)
- Pursue detected prey directly
- Hungrier predators hunt more aggressively

**Resting (when full)**
- Random wandering
- Minimal active hunting
- May opportunistically catch close prey

**Reproduction (when energy > 70%)**
- Creates offspring with inherited traits
- Higher energy threshold than prey

## Interaction Mechanics

### Resource Consumption (Prey)

When prey is within 10 units of a resource:
1. Resource energy is absorbed (+ 20% bonus)
2. Resource is removed from simulation
3. Prey energy capped at maximum

### Predation (Predator vs Prey)

When predator is within 15 units of prey:

**Step 1: Catch Attempt**
```
Base chance: 35%
+ Strength differential × 0.5
+ Stealth differential × 0.4
+ Specialization bonus (if traits > 0.7)
Final chance: 15-75%
```

**Step 2: Escape Attempt (if caught)**
```
Base chance: 20%
+ Stealth differential × 0.8
+ Strength differential × 0.5
+ Specialization bonus (if traits > 0.7)
Final chance: 15-75%
```

**Outcomes:**
- Successful hunt: Prey dies, predator gains 85% of prey's energy
- Escape: Prey flees with speed boost, predator loses catch opportunity

### Social Learning

Creatures can learn traits from nearby same-species creatures:

**Learning Process:**
1. Random chance based on learnability (10% × learnability)
2. Find nearby teacher creature
3. Choose attribute to learn (70% chance for specialized traits)
4. Adjust own attribute toward teacher's value
5. Capped at 0.05 change per learning event
6. Costs energy

**Specialization Protection:**
- Creatures with traits > 0.75 have 80% chance to skip learning
- Prevents specialized traits from regressing to average

## Reproduction Mechanics

### Reproduction Eligibility

Creatures can reproduce based on:
- **Energy**: Must be above threshold (80% prey, 70% predator)
- **Age**: Must pass juvenile maturity (15% of lifespan)
- **Cooldown**: Time since last reproduction

**Reproduction Probability:**
```
High energy (above threshold): 20% prey, 40% predator
Low energy (20-threshold): 0.1% prey, 0.2% predator
Very low (<20%): 0.01%
Critical (<10%): 0.001%
```

### Genetic Inheritance

Offspring inherit traits with variation:
1. Each trait starts with parent's value
2. Small variation: ±0.05 random change
3. 10% chance of significant mutation: ±0.2 additional change
4. All traits clamped to 0-1 range

**Energy Inheritance:**
- Max energy can vary ±5% normally
- 10% chance of ±20% significant change
- Capped at 50-200% of species base energy

### Energy Cost

Reproduction consumes parent energy:
- Prey retain 50% of energy
- Predators retain 40% of energy

## Species Conversion

Rare evolutionary events can convert prey↔predator.

### Conversion Requirements

**Prey → Predator:**
1. Must be isolated from predators for 450+ frames
2. Must have contact with same-species for 300+ frames
3. Must have extreme traits (average strength+stealth > 0.6)
4. Random probability check

**Predator → Prey:**
1. Must be isolated from prey for 450+ frames
2. Must have contact with same-species for 300+ frames
3. Must have weak traits (average strength+stealth < 0.5)
4. Random probability check

### Conversion Probability

```
Base: 5%
× Extreme trait bonus (up to 500×)
+ Trait influence weights
Capped at: 25% (prey→predator) or 15% (predator→prey)
```

### Post-Conversion

- New creature spawns at same location
- Attributes adjusted for new role
- Visual animation effect
- 600-frame cooldown before next conversion

## Starvation Mechanics

Low energy creates increasing death risk:

| Energy Level | Prey Death Chance | Predator Death Chance |
|--------------|-------------------|----------------------|
| 50% | 0.01% | 0.1% |
| 40% | 0.01% | 0.2% |
| 30% | 0.1% | 0.5% |
| 20% | 0.5% | 2% |
| 10% | 2% | 8% |
| 5% | 1% | 25% |

Predators are more vulnerable to starvation than prey.

## Seasonal Cycles

### Resource Blooms (Every 90 Days)

- 5 clusters spawn around the map
- Primary clusters: Dense, high-energy resources (2× energy)
- Secondary clusters: Sparse, moderate-energy resources (1.5× energy)
- Total: 75 new resources
- Bloom duration: 10 days

### Emergency Resources

When prey population falls below 20% of initial:
- 3% chance per frame for bonus resource cluster
- High-energy resources (2× normal)
- Helps prey population recover

## Death and Resource Cycling

When creatures die:
- 70% of max energy converts to resources
- Resources spawn in a cluster at death location
- Spread: 20 units for prey, 30 units for predators

This creates nutrient cycling:
- Prey die → Resources appear → Other prey eat → Population recovers
- Predators die → Resources appear → Prey eat → Predators hunt → Cycle continues
