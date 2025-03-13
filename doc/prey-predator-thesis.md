# Predator-Prey Ecosystem Simulation Specification

## Overview
A browser-based simulation modeling predator-prey dynamics with evolutionary mechanics. The simulation demonstrates natural selection through interactions between predators, prey, and resources, with a focus on the evolution of strength, stealth, and energy capacity.

## Core Elements

### 1. Resources
- **Visual Representation**: Small green square dots scattered across the environment
- **Behavior**: Static, regenerates when consumed by prey
- **Death Regeneration**: When any creature dies (old age, starvation, predation), resources spawn at their location
  - 70% of the creature's max energy is converted to resources
  - Resources are distributed in a circular pattern around the death location
  - Predators create more resources due to their higher energy capacity
- **Energy Value**: Each resource provides a fixed amount of energy to prey
- **Resource Clustering**: Resources spawn in clusters rather than uniformly, creating rich areas and food deserts
- **Major Seasonal Resource Blooms**: Every 90 simulation days, a dramatic resource bloom occurs
  - 200 high-energy resources spawn in 5 dense clusters
  - Primary resources (60% of each cluster): Tightly packed with 2x normal energy
  - Secondary resources (40% of each cluster): Surrounding ring with 1.5x normal energy
  - Blooms last for 10 days (vs. 5 days for standard blooms)
- **Adaptive Resource Generation**: 
  - During resource blooms: Accelerated regeneration rate (10% chance per frame) with higher energy value
  - Normal periods: Low regeneration rate (0.5% chance per frame)
  - Critical prey population: Bonus resources with 50% higher energy value to help prey recover
- **Resource Decay**: If prey population reaches zero, resources slowly decay and disappear

### 2. Prey
- **Visual Representation**: Blue circular shapes with attribute visualization (blue-green color scheme)
- **Primary Goal**: Consume resources, reproduce, avoid predators
- **Movement**: 
  - Hunger-driven foraging behavior
  - When hungry (<70% energy): Active resource seeking with increased detection range
  - When satiated (>70% energy): Primarily random movement with reduced resource interest
  - Hungrier prey move faster toward detected resources
  - Detection range scales with hunger level (up to 60% increase when starving)
- **Predator Avoidance Behavior**:
  - Actively detect nearby predators within a configurable detection range
  - Stealth attribute increases predator detection range
  - Flee from detected predators at increased speed (50% faster than normal)
  - Prioritize survival over feeding when predators are nearby
  - Higher stealth prey can detect predators from further away

### 3. Predators
- **Visual Representation**: Red pentagon shapes with attribute visualization (red-yellow color scheme)
- **Primary Goal**: Hunt prey, reproduce
- **Movement**: 
  - Hunger-driven hunting behavior
  - When hungry (<80% energy): Active prey pursuit with increased detection range
  - When satiated (>80% energy): Reduced aggression and mostly random movement
  - Opportunistic hunting only for very close prey when satiated
  - Hungrier predators move faster during pursuit (up to 25% faster when starving)
  - Detection range scales with hunger level (up to 50% increase when starving)
  - Slightly slower maximum speed than fleeing prey (25% vs 50% boost)

## Genetic Attributes

### 1. Strength (0.0-1.0)
- **Visual**: Green component for prey, red component for predators
- **Effect for Prey**: Determines escape capability, movement speed
- **Effect for Predator**: Determines hunting success, movement speed
- **Trade-off**: Higher strength = faster movement but higher energy cost

### 2. Stealth (0.0-1.0)
- **Visual**: Blue component for prey, yellow component for predators
- **Effect for Prey**: Ability to avoid detection and detect predators from further away
- **Effect for Predator**: Ability to approach prey undetected
- **Trade-off**: Higher stealth = better predator detection/avoidance but higher energy cost

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

### Hunger-Driven Behavior System
- **Prey Foraging Thresholds**:
  - Full (90-100% energy): Will not consume resources even when directly on top of them
  - Satiated (70-90% energy): Opportunistic foraging only for very close resources
  - Hungry (30-70% energy): Active foraging with normal detection range
  - Starving (0-30% energy): Aggressive foraging with increased detection range and speed
  
- **Predator Hunting Thresholds**:
  - Full (80-100% energy): Will not attack prey even when in range
  - Satiated (70-80% energy): Opportunistic hunting only for very close, easily caught prey
  - Hungry (20-70% energy): Active hunting with normal detection range
  - Starving (0-20% energy): Aggressive hunting with increased detection range and speed
  
- **Movement Adaptations**:
  - Detection range increases with hunger level
  - Movement speed toward food/prey increases with hunger level
  - Direction change probability increases when satiated (more exploration)
  - Pursuit persistence increases with hunger level

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
- If Detection_Chance > 0: Prey may be detected based on a probability check (Math.random() < Detection_Chance)
- If detected, a detection score is calculated based on distance and stealth advantage
- Predators target the prey with the highest detection score (closest and most detectable)

#### Capture Calculation
```
Catch_Chance = (Predator_Strength - Prey_Strength) * 0.6 + 0.2
Capped_Chance = min(0.5, max(0.1, Catch_Chance))
```
- The capture chance is probabilistic: Math.random() < Capped_Chance
- Minimum 10% and maximum 50% chance of capture regardless of strength difference
- This ensures predators always have some chance to catch prey while giving prey the opportunity to escape

#### Stealth Escape Mechanism
Even after a successful capture, prey have a second chance to escape:
```
Escape_Chance = (Prey_Stealth - Predator_Stealth) * 0.8 + 0.3
Capped_Escape_Chance = min(0.7, max(0.1, Escape_Chance))
```
- The escape chance is probabilistic: Math.random() < Capped_Escape_Chance
- Minimum 10% and maximum 70% chance of escape
- Successful escape temporarily boosts prey speed to flee from the predator
- Escape attempts cost energy (5 energy units)

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
- Resources: 250 (spawned in 4 clusters)
- Prey: 50 (spawned in 2-3 clusters with shared attribute profiles)
- Predators: 8 (spawned in 1-2 clusters with shared attribute profiles)

### Cluster Spawning
- **Resource Clusters**: Resources spawn in 4 primary clusters with some random distribution
- **Prey Clusters**: 2-3 clusters with cluster-specific attribute profiles
  - Each cluster has a base attribute profile (e.g., high stealth/low strength)
  - Individual prey have small variations around their cluster's profile (±0.1)
- **Predator Clusters**: 1-2 clusters with cluster-specific attribute profiles
  - Creates initial predator sub-populations with different hunting styles
  - Encourages evolution of distinct predator strategies

### Environment
- **Boundaries**: Creatures wrap around edges of the simulation area (toroidal space)
- **Size**: 1000×600 pixels

### Extinction Tracking and Response
- **Extinction Events**: System tracks and logs when either predators or prey go extinct
- **Population Recovery**: When prey population falls below 20% of initial count, bonus high-energy resources spawn to help recovery
- **Simulation History**: Records extinction events with day numbers and final attribute states

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
  - Predators: Pentagon shapes
  - Prey: Circular shapes
- **Size**: Based on energy capacity and current energy level
  - Base size determined by maximum energy capacity
  - Current size scales with percentage of energy filled
- **Color Scheme**:
  - Predators: Red-yellow color scheme
    - Strength: Red component
    - Stealth: Yellow component
  - Prey: Blue-green color scheme
    - Strength: Green component  
    - Stealth: Blue component
  - Overall color intensity reflects energy level (brighter = more energy)
- **Special Effects**:
  - Learnability: Slight pulsation effect
  - Longevity: Slight glow intensity
  - Age: Opacity/saturation (fades slightly with age)
- **Movement**: 
  - Speed proportional to strength 
  - Direction changes proportional to stealth
  - Predator facing direction matches movement
  - Prey fleeing behavior when predators are detected

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
   - Prey check for nearby predators and flee if detected
   - Prey seek resources based on hunger level
   - Predators seek prey based on hunger level
2. Check for resource consumption (prey)
   - Only consume resources if no predators nearby
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
  - High-strength, low-stealth predators (fast hunters)
  - High-stealth, low-strength prey (good at detecting and avoiding predators)
  - Balanced prey that can both evade predators and efficiently forage
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
- Seasonal Adaptive Behaviors:
  - Population surges following resource blooms
  - Predator population lag behind prey population increases
  - Crash-and-recovery cycles tied to seasonal resource availability
- Geographic Specialization:
  - Cluster formation around resource-rich areas
  - Development of different attribute profiles in different regions
  - Local extinction and recolonization dynamics
  - Formation of "safe zones" where prey leverage terrain and stealth to avoid predators
  - Predator hunting grounds with specialized attributes for more effective hunting
- Resilience Mechanisms:
  - System self-regulation through prey population protection mechanisms
  - Extinction and recovery cycles
  - Attribute profile shifts in response to extinction events

This simulation provides a foundation for exploring evolutionary dynamics in a simplified ecosystem while maintaining biological realism through meaningful trade-offs and interdependencies.