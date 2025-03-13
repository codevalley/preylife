# Predator-Prey Ecosystem Simulation Specification

## Overview
A browser-based simulation modeling predator-prey dynamics with evolutionary mechanics. The simulation demonstrates natural selection through interactions between predators, prey, and resources, with a focus on the evolution of strength, stealth, and energy capacity.

## Core Elements

### 1. Resources
- **Visual Representation**: Small green square dots scattered across the environment
- **Behavior**: Static, regenerates when consumed by prey
- **Regeneration**: Resources respawn when prey or predators die (70% of organism's energy converts to resources)
- **Energy Value**: Each resource provides a fixed amount of energy to prey

### 2. Prey
- **Visual Representation**: Blue circular shapes with attribute visualization
- **Primary Goal**: Consume resources, reproduce, avoid predators
- **Movement**: Random movement with directional changes when resources detected

### 3. Predators
- **Visual Representation**: Red triangular shapes with attribute visualization
- **Primary Goal**: Hunt prey, reproduce
- **Movement**: Random movement with directed pursuit when prey detected

## Genetic Attributes

### 1. Strength (0.0-1.0)
- **Visual**: Red section of the creature
- **Effect for Prey**: Determines escape capability, movement speed
- **Effect for Predator**: Determines hunting success, movement speed
- **Trade-off**: Higher strength = faster movement but higher energy cost

### 2. Stealth (0.0-1.0)
- **Visual**: Blue section of the creature
- **Effect for Prey**: Ability to avoid detection
- **Effect for Predator**: Ability to approach prey undetected
- **Trade-off**: Higher stealth = better direction changes but higher energy cost

### 3. Energy Capacity (Evolving)
- **Visual**: Influences overall size of creature
- **Initial Values**: 
  - Prey: 100 units
  - Predators: 150 units
- **Effect**: Determines maximum energy storage, reproduction timing, and death threshold
- **Trade-off**: Higher capacity = more buffer against starvation but slower reproduction rate

### 4. Learnability (0.0-1.0)
- **Visual**: Yellow outline intensity around the creature
- **Effect**: Determines probability and magnitude of attribute adaptation during encounters
- **Applies to**: Both predator and prey (separate mechanics)
- **Trade-off**: Higher learnability = faster adaptation but costs energy for each learning event

### 5. Longevity (0.0-1.0)
- **Visual**: Purple glow intensity around the creature
- **Effect**: Determines maximum lifespan and metabolic efficiency over time
- **Applies to**: Both predator and prey
- **Trade-off**: Higher longevity = longer life but slower initial metabolism (efficiency)

## Core Mechanics

### Energy System
- **Initial State**: Creatures spawn with 50% of their maximum energy capacity
- **Acquisition**: 
  - Prey gain energy by consuming resources
  - Predators gain energy by consuming prey (70% of prey's current energy)
- **Consumption**:
  - Base metabolism (constant drain)
  - Movement costs (proportional to strength)
  - Direction change costs (proportional to stealth)
  - Age-related inefficiency (increases over time)

### Aging System
- **Lifespan**: Determined by Longevity attribute and environmental factors
  - Base Lifespan = Base_Value * Longevity_Multiplier
  - Maximum age in simulation time units
- **Metabolic Efficiency**: Declines with age
  - Efficiency = 1.0 at birth
  - Efficiency = Longevity at maximum age
  - Linear decline between these points
- **Effects**:
  - Energy conversion from food decreases with age
  - Energy costs for all activities increase with age
  - Formula: Actual_Energy_Cost = Base_Energy_Cost * (2 - Current_Efficiency)

### Energy Thresholds
- **Reproduction**: Occurs when energy reaches 100% of capacity
  - Parent transfers 50% of its energy to offspring
- **Starvation Risk**: Begins when energy falls below 50% of capacity
- **Critical Energy**: Below 10% of capacity
- **Death**: Occurs at 0% energy, through starvation probability, or when maximum age is reached

### Starvation Probability System
- As energy decreases below 50% capacity, risk of sudden death increases:
  - At 50% energy: 1% chance of death per time unit
  - At 40% energy: 5% chance of death per time unit
  - At 30% energy: 15% chance of death per time unit
  - At 20% energy: 30% chance of death per time unit
  - At 10% energy: 50% chance of death per time unit
  - Below 10% energy: Probability increases rapidly toward 100%

### Interaction Formulas

#### Detection Calculation
```
Detection_Chance = Predator_Stealth - Prey_Stealth + Base_Detection_Rate (0.3)
```
- If Detection_Chance ≤ 0: Prey remains undetected
- If Detection_Chance > 0: Predator spots prey and pursues

#### Capture Calculation
```
Catch_Chance = Predator_Strength - Prey_Strength + Base_Catch_Rate (0.4)
```
- If Catch_Chance ≤ 0: Prey escapes
- If Catch_Chance > 0: Predator catches prey

#### Learning Calculation
When two creatures of the same type (prey-prey or predator-predator) encounter each other:
```
Learning_Chance = Creature1_Learnability * Encounter_Duration_Factor
```
- If Learning_Chance > Random(0,1): Learning occurs

If learning occurs:
```
Max_Attribute_Shift = Current_Attribute * 0.15  // Maximum 15% change in any direction
Attribute_Shift = (Target_Attribute - Current_Attribute) * Learnability * Learning_Factor
Capped_Shift = min(abs(Attribute_Shift), Max_Attribute_Shift) * sign(Attribute_Shift)
New_Attribute = Current_Attribute + Capped_Shift
Energy_Cost = Learning_Cost_Base + (abs(Capped_Shift) * Energy_Multiplier)
```
- Learning applies to one randomly selected attribute (strength, stealth, or energy capacity)
- Learning occurs regardless of whether the target attribute is "better" - the creature simply adapts toward the encountered creature
- Attribute shifts are capped at 15% of current value to prevent drastic changes
- More significant changes cost proportionally more energy

### Reproduction System
- **Trigger**: When energy reaches 100% capacity
- **Energy Cost**: Parent transfers 50% of energy to offspring
- **Reproduction Probability**: Bell curve based on age
  - Very low probability during early life (0-15% of lifespan)
  - Gradually increases to peak at middle age (40-60% of lifespan)
  - Gradually decreases in later life (declining after 60% of lifespan)
  - Formula: Reproduction_Probability = Base_Chance * Age_Modifier * Energy_Level
  - Age_Modifier follows a bell curve peaking at 50% of lifespan
- **Inheritance**: Offspring inherit attributes from parent with slight variations:
  - Strength: Parent's value ± 0.05 (random)
  - Stealth: Parent's value ± 0.05 (random)
  - Energy Capacity: Parent's value ± 5% (random)
  - Learnability: Parent's value ± 0.05 (random)
  - Longevity: Parent's value ± 0.05 (random)
- **Mutation**: 10% chance of significant attribute change:
  - Strength: ± 0.2 (random)
  - Stealth: ± 0.2 (random)
  - Energy Capacity: ± 20% (random)
  - Learnability: ± 0.2 (random)
  - Longevity: ± 0.2 (random)

## Simulation Parameters

### Initial Population
- Resources: 200
- Prey: 50 (random distribution of attributes)
- Predators: 15 (random distribution of attributes)

### Environment
- **Boundaries**: Creatures bounce off edges of the simulation area
- **Size**: 1000×600 pixels

### Timescale
- Simulation steps occur at 60fps, with each step:
  - Energy is consumed
  - Movement occurs
  - Interactions are calculated
  - Starvation probability is applied
  - Reproduction is checked

## Visual Representation

### Creatures
- **Base Shape**: 
  - Predators: Triangular shapes
  - Prey: Circular shapes
- **Size**: Based on energy capacity and current energy level
  - Base size determined by maximum energy capacity
  - Current size scales with percentage of energy filled
- **Color Scheme**:
  - Predators: Red base
  - Prey: Blue base
  - Attribute visualization as pie sections:
    - Strength: Red section
    - Stealth: Blue section
- **Special Effects**:
  - Learnability: Yellow outline intensity
  - Longevity: Purple glow intensity
  - Age: Opacity/saturation (fades slightly with age)
- **Movement**: 
  - Speed proportional to strength 
  - Direction changes proportional to stealth
  - Optional: Small trail showing recent movement

### Resources
- Small green square dots
- Brightness may indicate energy value

### UI Elements
- **Population Graph**: Real-time graph showing population counts
- **Attribute Distribution**: Histograms showing attribute distributions over time
- **Controls**: Play/pause, speed adjustment, reset
- **Statistics Panel**: Average attribute values, energy levels, death causes
- **Optional Settings**: Initial population, mutation rate, energy costs

## Technical Implementation Considerations

### Data Structures
- Creature objects with properties for position, attributes, energy, type
- Spatial partitioning for efficient collision detection

### Main Loop
1. Update all creature positions
2. Check for resource consumption (prey)
3. Check for predator-prey interactions
4. Calculate energy consumption
5. Apply starvation probability checks
6. Handle reproduction
7. Remove dead creatures (energy ≤ 0 or starvation event)
8. Regenerate resources
9. Update visualization and statistics

## Expected Emergent Behaviors

- Cyclical population dynamics (predator-prey cycles)
- Evolution of specialized strategies:
  - High-strength, low-stealth predators
  - High-stealth, low-strength prey
- Adaptation to resource availability:
  - Higher energy capacity in volatile environments
  - Lower energy capacity in stable, resource-rich environments
- Population crashes and recoveries
- Possible evolutionary arms races between predator and prey attributes
- Social Learning Dynamics:
  - Formation of "cultural groups" with similar attribute profiles
  - Oscillating value of learnability based on environmental conditions
  - Potential "information cascades" where maladaptive traits spread rapidly
  - Resilience through diversity when certain trait profiles become disadvantageous
- Longevity/Metabolism Adaptations:
  - Evolution of "live fast, die young" strategies (low longevity, high initial efficiency)
  - Development of "slow and steady" strategies (high longevity, slower aging)
  - Age-structured populations with different roles for young and old individuals
  - Generational cycles as aging populations become vulnerable to predation or starvation

This simulation provides a foundation for exploring evolutionary dynamics in a simplified ecosystem while maintaining biological realism through meaningful trade-offs and interdependencies.