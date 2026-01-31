# Visual Guide

This guide explains the visual elements of PreyLife and how to interpret what you see on screen.

## Entity Types

PreyLife displays three types of entities, each with distinct visual characteristics.

### Resources (Green Squares)

Resources are static food sources that prey consume to gain energy.

| Visual Property | Meaning |
|-----------------|---------|
| **Shape** | Square |
| **Base Color** | Green |
| **Brightness** | Energy value (brighter = more energy) |
| **Size** | Fixed, small |

**Key Observations:**
- Resources spawn naturally over time
- During seasonal blooms (every 90 days), large clusters appear
- Resources decay after 30 days if not consumed
- When creatures die, resources spawn at their location

### Prey (Blue Circles)

Prey are herbivorous creatures that eat resources and flee from predators.

| Visual Property | Meaning |
|-----------------|---------|
| **Shape** | Circle |
| **Base Color** | Blue-Green gradient |
| **Green Tint** | Strength attribute (more green = stronger) |
| **Blue Tint** | Stealth attribute (more blue = stealthier) |
| **Brightness** | Current energy level (dimmer = low energy) |

**Example Colors:**
- **Pure Blue** - High stealth, low strength (evasion specialist)
- **Teal/Cyan** - Balanced strength and stealth
- **Green-Blue** - High strength, moderate stealth (fast runner)
- **Dim Colors** - Low energy, at risk of starvation

### Predators (Red Pentagons)

Predators hunt and consume prey to survive.

| Visual Property | Meaning |
|-----------------|---------|
| **Shape** | Pentagon (5-sided) |
| **Base Color** | Red-Yellow gradient |
| **Red Tint** | Strength attribute (more red = stronger) |
| **Yellow Tint** | Stealth attribute (more yellow = stealthier) |
| **Brightness** | Current energy level (dimmer = low energy) |
| **Rotation** | Points in movement direction |

**Example Colors:**
- **Pure Red** - High strength, low stealth (brute force hunter)
- **Orange** - Balanced strength and stealth
- **Yellow-Red** - High stealth, moderate strength (ambush predator)
- **Dim Colors** - Low energy, desperately hunting

## Color Interpretation Chart

### Prey Colors

```
High Stealth                    Balanced                    High Strength
    |                              |                              |
   Blue ←────────────────────── Teal ──────────────────────→ Green

Low Stealth Prey are easier for predators to detect
High Stealth Prey can better evade predators
High Strength Prey move faster when fleeing
```

### Predator Colors

```
High Stealth                    Balanced                    High Strength
    |                              |                              |
  Yellow ←────────────────────── Orange ─────────────────────→ Red

High Stealth Predators are better at detecting prey
High Strength Predators are more likely to successfully catch prey
```

## Energy Visualization

Both prey and predators display their energy level through brightness:

| Brightness | Energy Level | State |
|------------|--------------|-------|
| Full brightness | 70-100% | Healthy |
| Medium brightness | 40-70% | Normal |
| Dim | 20-40% | Hungry |
| Very dim | 0-20% | Starving (death risk) |

## Movement Patterns

### Prey Movement
- **Wandering** - Random direction changes when well-fed
- **Foraging** - Moving toward resources when hungry
- **Fleeing** - Rapid movement away from predators (speed boost)
- **Erratic** - High-stealth prey may zigzag when fleeing

### Predator Movement
- **Patrolling** - Random direction changes when full
- **Hunting** - Direct pursuit toward detected prey
- **Tracking** - Following prey movement patterns
- **Rest** - Slower movement when energy is high

## Special Visual Effects

### Resource Bloom
During seasonal resource blooms:
- Multiple clusters of bright green squares appear
- Primary clusters (center) have brighter resources
- Secondary clusters (edges) have slightly dimmer resources
- Occurs every 90 days

### Reproduction
When creatures reproduce:
- New creature appears near the parent
- Parent's brightness decreases (energy transferred)
- Offspring starts at partial brightness

### Species Conversion
When a creature undergoes evolutionary conversion:
- Brief visual effect as creature transforms
- Shape changes (circle ↔ pentagon)
- Color gradient shifts (blue-green ↔ red-yellow)

## Dashboard Interpretation

The dashboard displays population statistics:

| Statistic | Meaning |
|-----------|---------|
| **Day** | Simulation time (10 frames = 1 day) |
| **Resources** | Current food source count |
| **Prey** | Current prey population |
| **Predators** | Current predator population |

### Attribute Averages

The dashboard shows average genetic attributes for each species:
- **Strength** - Physical power (speed, hunting/escape success)
- **Stealth** - Detection ability (prey evasion, predator tracking)
- **Learnability** - Adaptation rate (trait copying from others)
- **Longevity** - Lifespan and metabolic efficiency

## Entity Tooltips

Hover over any creature to see detailed information:
- **Energy** - Current/maximum energy level
- **Age** - Creature's age in seconds
- **Attributes** - Individual genetic traits
- **Offspring** - Number of offspring produced
- **Food** - Amount of food consumed

## Population Dynamics Indicators

### Healthy Ecosystem
- All entity types present
- Population numbers fluctuating
- Colors showing variety (evolution occurring)

### Prey Extinction Imminent
- Very few blue circles
- Many red pentagons
- Predators dimming (starvation)

### Predator Extinction Imminent
- Very few red pentagons
- Many blue circles
- Resources depleting rapidly

### Balanced State
- Moderate numbers of all entities
- Regular population cycles
- Visible genetic diversity in colors
