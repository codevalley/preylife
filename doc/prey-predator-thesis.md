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
  - Prey: 300 units (evolves through mutations)
  - Predators: 480 units (evolves through mutations)
- **Effect**: Determines maximum energy storage, reproduction timing, and death threshold
- **Trade-off**: Higher capacity = more buffer against starvation but slower reproduction rate
- **Mutation**: Inherited from parent with small random variations (±5% normally, ±20% for significant mutations)
- **Range**: Can evolve between 50-200% of baseline value through successive generations

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
  - Base metabolism (constant drain, reduced by longevity)
  - Movement costs (proportional to strength)
  - Activity costs (proportional to velocity and strength)
  - Direction change costs (proportional to stealth)
  - Age-related inefficiency (separate factors for metabolism and activity)
  - Cost scales with creature type (predators have higher base costs)

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
- As energy decreases below threshold levels, risk of sudden death increases:
  - At 50% energy: 0.1% chance of death per update
  - At 40% energy: 0.5% chance of death per update
  - At 30% energy: 1.5% chance of death per update
  - At 20% energy: 3% chance of death per update
  - At 10% energy: 5% chance of death per update
  - At 5% energy: 10% chance of death per update
- This creates unpredictable sudden deaths from starvation, as seen in nature
- Higher longevity attribute reduces base metabolism, indirectly reducing starvation risk
- Higher strength increases activity costs, indirectly increasing starvation risk

### Interaction Formulas

#### Detection Calculation
```
// Basic detection formula
Base_Detection_Chance = Predator_Stealth - Prey_Stealth + 0.25

// For highly stealthy prey (>0.7)
High_Stealth_Penalty = (Prey_Stealth - 0.7) * 2.0
Detection_Chance = Predator_Stealth - Prey_Stealth + 0.25 - High_Stealth_Penalty
```
- If Detection_Chance > 0: Prey may be detected based on a probability check (Math.random() < Detection_Chance)
- If detected, a detection score is calculated based on distance (70%) and stealth advantage (30%)
- Predators target the prey with the highest detection score (closest and most detectable)
- Very stealthy prey (>0.7) receive a significant additional bonus to avoid detection
- This creates a viable evolutionary niche for highly stealthy prey

#### Capture Calculation
```
// Define median value for attributes
const MEDIAN = 0.5

// Calculate how far each entity is from the median
const predatorStrengthDeviation = abs(Predator_Strength - MEDIAN)
const predatorStealthDeviation = abs(Predator_Stealth - MEDIAN)
const preyStrengthDeviation = abs(Prey_Strength - MEDIAN)
const preyStealthDeviation = abs(Prey_Stealth - MEDIAN)

// Use the better attribute for each entity
const predatorBestDeviation = max(predatorStrengthDeviation, predatorStealthDeviation)
const preyBestDeviation = max(preyStrengthDeviation, preyStealthDeviation)

// Calculate advantage based on relative specialization
const specializationAdvantage = predatorBestDeviation - preyBestDeviation
const specializationFactor = specializationAdvantage * 0.3

// Determine best hunting attribute
Primary_Catch_Factor = max(
  Stealth_Difference * 0.4,  // Stealth-based hunting
  Strength_Difference * 0.5  // Strength-based hunting
)

// Calculate specialized trait bonus
Specialized_Bonus = 0
if (Predator_Stealth > 0.7 || Predator_Strength > 0.7) {
  Stealth_Bonus = max(0, (Predator_Stealth - 0.7) * 0.8)
  Strength_Bonus = max(0, (Predator_Strength - 0.7) * 0.8)
  Specialized_Bonus = max(Stealth_Bonus, Strength_Bonus)
}

// Final calculation with specialization advantage
Catch_Chance = 0.25 + Primary_Catch_Factor + Specialized_Bonus + specializationFactor
Capped_Chance = min(0.6, max(0.1, Catch_Chance))
```
- The capture chance is probabilistic: Math.random() < Capped_Chance
- Base chance increased from 0.15 to 0.25 to make predators more effective
- Minimum 10% and maximum 60% chance of capture (increased from 5-45%)
- Specialized predators get additional capture bonus from extreme traits
- New specializationFactor rewards predators who are more specialized than their prey
- Creates evolutionary pressure toward specialization and away from median values

#### Stealth/Strength Escape Mechanism
Even after a successful capture, prey have a second chance to escape:
```
// Define median value for attributes
const MEDIAN = 0.5

// Calculate how far each entity is from the median
const preyStrengthDeviation = abs(Prey_Strength - MEDIAN)
const preyStealthDeviation = abs(Prey_Stealth - MEDIAN)
const predatorStrengthDeviation = abs(Predator_Strength - MEDIAN)
const predatorStealthDeviation = abs(Predator_Stealth - MEDIAN)

// Use the better attribute for each entity
const preyBestDeviation = max(preyStrengthDeviation, preyStealthDeviation)
const predatorBestDeviation = max(predatorStrengthDeviation, predatorStealthDeviation)

// Calculate advantage based on relative specialization
const specializationAdvantage = preyBestDeviation - predatorBestDeviation
const specializationFactor = specializationAdvantage * 0.3

// Determine best escape attribute
Primary_Escape_Factor = max(
  Stealth_Difference * 0.8,  // Stealth-based escape
  Strength_Difference * 0.5  // Strength-based resistance
)

// Calculate specialized trait bonus
Specialized_Bonus = 0
if (Prey_Stealth > 0.7 || Prey_Strength > 0.7) {
  Stealth_Bonus = max(0, (Prey_Stealth - 0.7) * 1.5)
  Strength_Bonus = max(0, (Prey_Strength - 0.7) * 1.5)
  Specialized_Bonus = max(Stealth_Bonus, Strength_Bonus)
}

// Final calculation with specialization advantage
Escape_Chance = 0.25 + Primary_Escape_Factor + Specialized_Bonus + specializationFactor
Capped_Escape_Chance = min(0.75, max(0.15, Escape_Chance))
```
- The escape chance is probabilistic: Math.random() < Capped_Escape_Chance
- Base chance reduced from 0.3 to 0.25 to balance with predator improvements
- Minimum 15% and maximum 75% chance of escape (kept the same)
- Specialized prey (high strength or high stealth) get a significant escape bonus
- New specializationFactor rewards prey who are more specialized than their predator
- Escape attempts cost energy (5 energy units)
- Creates evolutionary arms race toward specialization for both predator and prey

#### Fleeing Mechanics
When fleeing from predators, prey use different strategies based on their attributes:
```
// Stealth-based evasion (>0.6)
Random_Movement_Angle = (random(-0.5,0.5) * PI * Prey_Stealth)
Direction_With_Randomness = apply_rotation(Flee_Direction, Random_Movement_Angle)

// Specialized stealth bonus (>0.7)
Stealth_Flee_Bonus = (Prey_Stealth - 0.7) * 0.5

// Strength-based flight
Strength_Flee_Bonus = Prey_Strength * 0.5
if (Prey_Strength > 0.7)
  Strength_Flee_Bonus += (Prey_Strength - 0.7) * 0.8

// Best attribute determines flee method
Flee_Bonus = max(Prey_Stealth * 0.5, Strength_Flee_Bonus)
Flee_Speed = Base_Speed * (1 + Flee_Bonus + Specialized_Flee_Bonus) * Avoidance_Multiplier

// Energy cost (higher for strength-based fleeing)
Fleeing_Energy_Cost = 2 * (1 + Prey_Strength * 0.5) * deltaTime
```
- High stealth prey (>0.6) use erratic movement patterns when fleeing
- High strength prey use faster sustained running
- Specialized prey (>0.7 in either attribute) get additional flee bonuses
- Strength-based fleeing costs more energy, creating a trade-off
- This ensures multiple viable evolutionary strategies for prey

#### Enhanced Learning System
Learning has been improved to preserve specialization and prevent regression to the mean:

```
// Check if creature is highly specialized
Is_Specialized = (Strength > 0.75 || Stealth > 0.75 || Longevity > 0.75)

// Specialized creatures only learn with much lower probability
if (Is_Specialized && Random(0,1) < 0.8) {
  Skip_Learning(); // 80% chance to skip learning for specialized creatures
}

// Base learning chance calculation
Learning_Chance = Creature1_Learnability * 0.1
```

Attribute selection is biased toward specialization:
```
// Identify specialized attributes in the teacher
Specialized_Attributes = []
if (Teacher_Strength > 0.7) Add "strength" to Specialized_Attributes
if (Teacher_Stealth > 0.7) Add "stealth" to Specialized_Attributes
if (Teacher_Longevity > 0.7) Add "longevity" to Specialized_Attributes

// 70% chance to learn a specialized attribute (if any exist)
if (Specialized_Attributes.length > 0 && Random(0,1) < 0.7) {
  Attribute_To_Learn = Random_From(Specialized_Attributes)
} else {
  Attribute_To_Learn = Random_From(["strength", "stealth", "longevity"])
}
```

Learning only occurs for significant differences:
```
// Only learn if the difference is meaningful (prevents dilution of traits)
if (abs(Teacher_Value - Learner_Value) > 0.15) {
  Learning_Amount = (Teacher_Value - Learner_Value) * Learnability * 0.2
  Capped_Learning = min(abs(Learning_Amount), 0.05) * sign(Learning_Amount)
  
  // Apply learning
  New_Attribute = Learner_Value + Capped_Learning
  
  // Learning costs energy - higher cost for larger changes
  Energy_Cost = abs(Capped_Learning) * 10
}
```

Benefits of the enhanced learning system:
- Preserves specialized traits by reducing learning probability for specialized creatures
- Encourages distinct evolutionary niches by prioritizing learning of specialized attributes
- Prevents regression to the mean by only learning when differences are significant
- Creates natural evolutionary pressure toward specialization
- Allows diverse strategies to coexist in the ecosystem

#### Anti-Clumping System
Creatures now apply mild repulsion forces to avoid excessive clumping:

```
// Personal space radius
Personal_Space = 20 // For prey (30 for predators)

// Calculate repulsion vector
Repulsion_Vector = (0, 0)
Too_Close_Count = 0

// Check each nearby creature
for each Nearby_Creature {
  Distance = position.distanceTo(Nearby_Creature.position)
  
  if (Distance < Personal_Space) {
    // Direction away from nearby creature
    Away_Vector = normalize(position - Nearby_Creature.position)
    
    // Strength based on proximity (closer = stronger)
    Repulsion_Strength = 1 - (Distance / Personal_Space)
    Away_Vector *= Repulsion_Strength
    
    Repulsion_Vector += Away_Vector
    Too_Close_Count++
  }
}

// Apply repulsion if creatures are too close
if (Too_Close_Count > 0) {
  Repulsion_Vector = normalize(Repulsion_Vector)
  
  // Repulsion factor varies with hunger (weaker when hungry)
  Energy_Ratio = current_energy / max_energy
  Repulsion_Factor = 0.1 * min(1, Energy_Ratio * 2) // 0.15 for predators
  
  // Add repulsion to velocity (don't replace it)
  Velocity += Repulsion_Vector * Speed * Repulsion_Factor
  Velocity = normalize(Velocity) * Speed
}
```

Benefits of the anti-clumping system:
- Prevents unrealistic clustering of same-type creatures
- Promotes better spatial distribution of the population
- Reduces competition between same-type individuals
- Creates more realistic territorial behavior
- Decreases priority when hungry (food-seeking takes precedence)

### Reproduction System
- **Probabilistic Reproduction**: Based on multiple factors rather than simple energy threshold
  - Energy level: Determines base probability
  - Age: Affects eligibility and probability
  - Time since last reproduction: Enforces cooldown period
  
- **Energy-Based Probability**:
  - **High Energy Threshold**: 
    - Prey: 80% of maximum energy
    - Predator: 70% of maximum energy
  - **Reproduction Probability**:
    - Above threshold: 
      - Prey: 20% chance per update
      - Predator: 30% chance per update
    - Below threshold: 
      - Prey: 3% chance per update
      - Predator: 5% chance per update
  
- **Age-Based Probability**:
  - Juvenile period: 0-15% of maximum lifespan
  - Juvenile reproduction probability: 1% (very rare but possible)
  - Adult reproduction follows normal energy-based probabilities
  
- **Reproduction Cooldown**:
  - Prey: 7-day cooldown after reproduction
  - Predator: 3-day cooldown after reproduction
  - Probability gradually increases as cooldown period progresses
  - Formula: Current_Probability = Base_Probability * (time_since_reproduction / cooldown_period)
  
- **Energy Cost**: Parent transfers 50% of energy to offspring

- **Attribute Inheritance**: Offspring inherit attributes from parent with slight variations:
  - Strength: Parent's value ± 0.05 (random)
  - Stealth: Parent's value ± 0.05 (random)
  - Learnability: Parent's value ± 0.05 (random)
  - Longevity: Parent's value ± 0.05 (random)
  
- **Energy Capacity Inheritance**:
  - Base value: Parent's exact capacity
  - Small random variation: ± 5% by default
  - Limits: Cannot go below 50% or above 200% of species baseline
  
- **Significant Mutations**: 10% chance of larger attribute change:
  - Genetic attributes: ± 0.2 (random)
  - Energy Capacity: ± 20% (random)
  
- **Mutation Balance**: 
  - Small mutations allow gradual adaptation
  - Significant mutations enable rapid response to environmental shifts
  - Energy capacity evolution creates diverse ecological niches
  - Cooldown periods prevent rapid population explosions
  - Maturity requirement simulates real biological development

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

## Recent Upgrades and Enhancements

### Specialized Intelligence Mechanics
An advanced intelligence system has been implemented to reward entities that specialize away from the median values, creating a strong evolutionary push toward diversity and specialization:

#### Deviation-from-Median Strategy
Creatures are now evaluated based on how far they specialize from median attribute values:
```
// Define median value for attributes
const MEDIAN = 0.5

// Calculate specialization level for each entity
Predator_Strength_Deviation = abs(Predator_Strength - MEDIAN)
Predator_Stealth_Deviation = abs(Predator_Stealth - MEDIAN)
Prey_Strength_Deviation = abs(Prey_Strength - MEDIAN)
Prey_Stealth_Deviation = abs(Prey_Stealth - MEDIAN)

// Use the best attribute for each entity
Predator_Best_Deviation = max(Predator_Strength_Deviation, Predator_Stealth_Deviation)
Prey_Best_Deviation = max(Prey_Strength_Deviation, Prey_Stealth_Deviation)

// Calculate advantage based on relative specialization
Specialization_Advantage = Predator_Best_Deviation - Prey_Best_Deviation
```
- Entities gain advantage when they are more specialized than their opponent
- Promotes evolution away from median values toward extreme traits
- Creates ecosystem pressure toward diverse strategies

#### Predator Specialized Intelligence
Predators with high specialization receive enhanced hunting capabilities:
- **Stealth Specialists (>0.7)**:
  - Enhanced prey detection range: `detectionRange * (1 + stealth * 0.5)`
  - Improved hunting success against normal prey
  - Special bonus when catching prey: `(stealth - 0.7) * 0.8`
  - Penalty applied when hunting highly stealthy prey
- **Strength Specialists (>0.7)**:
  - Enhanced prey capture ability: `(strength - 0.7) * 0.8`
  - Strength-based hunting slightly more effective than stealth-based
  - Hunger-based hunting speed increases

#### Prey Specialized Intelligence
Prey with high specialization receive enhanced survival capabilities:
- **Stealth Specialists (>0.7)**:
  - Enhanced escape chance with scaling bonus: `(stealth - 0.7) * 1.5`
  - Erratic movement patterns when fleeing (random direction changes)
  - Improved predator detection range: `baseRange * (1 + stealth * detectionMultiplier)`
  - Better resource finding ability: `detectionRange * (1 + stealth * 0.5)`
- **Strength Specialists (>0.7)**:
  - Improved escape resistance: `(strength - 0.7) * 1.5`
  - Faster sustained running with less fatigue: `(strength - 0.7) * 0.8`
  - Higher energy cost when fleeing

#### Updated Capture and Escape Formulas
Capture formula now includes specialization advantage:
```
// Base calculations similar to previous versions
Base_Catch_Chance = 0.25
Primary_Catch_Factor = max(Stealth_Difference * 0.4, Strength_Difference * 0.5)
Specialized_Bonus = max(Stealth_Bonus, Strength_Bonus)

// New specialization advantage component
Specialization_Factor = (Predator_Best_Deviation - Prey_Best_Deviation) * 0.3

// Final calculation with specialization advantage
Catch_Chance = Base_Catch_Chance + Primary_Catch_Factor + Specialized_Bonus + Specialization_Factor
Capped_Chance = min(0.6, max(0.1, Catch_Chance))
```

Escape formula with similar specialization advantage:
```
// Base calculations similar to previous versions
Base_Escape_Chance = 0.25
Primary_Escape_Factor = max(Stealth_Difference * 0.8, Strength_Difference * 0.5)
Specialized_Bonus = max(Stealth_Bonus, Strength_Bonus)

// New specialization advantage component
Specialization_Factor = (Prey_Best_Deviation - Predator_Best_Deviation) * 0.3

// Final calculation with specialization advantage
Escape_Chance = Base_Escape_Chance + Primary_Escape_Factor + Specialized_Bonus + Specialization_Factor
Capped_Escape_Chance = min(0.75, max(0.15, Escape_Chance))
```

#### Benefits of Specialized Intelligence
- Creates strong evolutionary pressure away from mediocrity
- Rewards extreme trait values with significant advantages
- Ensures multiple viable evolutionary strategies exist
- Relative specialization determines success in predator-prey interactions
- Maintains ecosystem diversity by preventing evolutionary convergence
- More realistic modeling of adaptation and specialization in nature

### Species Conversion Evolutionary Mechanism

The ecosystem now features a revolutionary evolutionary mechanism that allows creatures to evolve into a different species under specific conditions, introducing a natural recovery system from extinction events:

#### Core Concept
In extremely rare circumstances, a single creature with exceptional traits isolated from the opposite type may undergo an extraordinary evolutionary leap:
- Prey with exceptionally high strength/stealth might evolve into a predator
- Predators with exceptionally low strength/stealth might evolve into prey

This mechanism is designed as a natural "extinction failsafe" that operates on evolutionary principles rather than artificial respawning.

#### The Three Preconditions
For a creature to even be considered for species conversion, ALL THREE preconditions must be met:

1. **Isolation from Opposite Type**: The creature must not have contacted the opposite type for an extended period (30+ seconds)
2. **Prolonged Same-Species Contact**: The creature must have maintained extended contact with same-species individuals (10+ seconds)
3. **Extreme Trait Specialization**:
   - Prey must have exceptionally high attributes (avg > 0.85) to become predators
   - Predators must have exceptionally low attributes (avg < 0.25) to become prey

#### The Lottery Trigger
When ALL preconditions are met, the creature enters an extremely low-probability "lottery":
- Base probability is just 0.01% per update (1 in 10,000)
- Maximum probability is capped at 0.5% (1 in 200) even with extreme traits
- For truly exceptional traits (>0.9 or <0.1), probability is multiplied by 100x
- Only 1 conversion maximum can occur in a single update

#### Core Limitations
- Creature must not have contacted opposite type for 30+ seconds
- Creature must have maintained contact with same species for 10+ seconds
- 60-second cooldown period for newly converted creatures
- Creature undergoes a 3-second visual transformation effect

#### Optional Configurable Limitations
The following limitations can be enabled/disabled through configuration:
- **Population Ratio Control**: Can optionally enable conversion only when a species falls below a critical threshold (5% by default)
- **Conversion Rate Limiting**: Can optionally limit the number of conversions allowed per update (1 by default)

#### Probability Calculation Example
```
// Start with extremely low base probability
baseProbability = 0.0001 (0.01%)

// For prey with strength 0.95 (exceptional)
extremeTraitMultiplier = 100
adjustedProbability = 0.0001 * 100 = 0.01 (1%)

// Apply trait influence (small further adjustments)
traitInfluence = (0.95 * 0.2) = 0.19
probability = 0.01 + 0.0019 = 0.0119 (1.19%)

// Cap at maximum allowed probability
finalProbability = min(0.0119, 0.005) = 0.005 (0.5%)
```

#### Visual Effects
- **Prey → Predator**: Pulsating red glow and size increase during transformation
- **Predator → Prey**: Pulsating blue glow and size increase during transformation
- **Duration**: Transformation visual effects last for 2 seconds

#### Ecological Significance
- Creates natural extinction recovery mechanism through evolutionary principles
- Avoids artificial "respawn" mechanics while maintaining ecosystem balance
- Rewards specialized individuals with ecological niche transitions
- Increases unpredictability and emergent behavior in the ecosystem
- Models real-world evolutionary transitions (herbivores → carnivores and vice versa)
- Allows continuous simulation without manual intervention, even after extinction events

#### Balance Adjustments for Predator-Prey Dynamics
To maintain ecosystem balance while preventing predator extinction, several key parameters have been adjusted:

1. **Predator Hunting Speed**:
   - Increased maximum speed boost from 25% to 50% when starving
   - Now matches prey flee speed for fair pursuit dynamics
   - Gives predators a realistic chance to catch prey when hungry

2. **Energy Balance**:
   - Reduced predator energy consumption from 2.25x to 1.8x base rate
   - Increased energy gain from prey consumption from 70% to 85%
   - Creates more sustainable predator populations without making them overpowered

3. **Hunting Behavior**:
   - Increased hunger threshold for active hunting from 20% to 25%
   - Reduced random wandering probability from 70% to 50% when satiated
   - Encourages more opportunistic hunting even when not starving

4. **Capture and Escape Mechanics**:
   - Increased base capture chance from 25% to 35%
   - Increased maximum capture probability from 60% to 75%
   - Reduced prey base escape chance from 25% to 20%
   - Reduced prey flee speed multiplier from 1.1 to 1.0
   - Creates better balance where specialized predators can reliably catch prey

These adjustments ensure predator populations remain viable while maintaining the evolutionary pressure toward specialization in both predator and prey populations.

### Differentiated Starvation Systems
Separate starvation mechanics have been implemented for predators and prey:
- Predators now face higher starvation risk (up to 20% chance at 5% energy)
- Prey have lower starvation risk (maximum 10% chance at 5% energy)
- Type-specific thresholds at multiple energy levels
- Models real-world differences between primary and secondary consumers
- Enables fine-tuning of predator-prey balance

### Enhanced Learning System with Specialization Preservation
The learning system has been completely redesigned to protect and encourage evolutionary specialization:
- Highly specialized creatures (>0.75 in any attribute) have 80% chance to skip learning completely
- Learning biased toward specialization (70% chance to learn specialized attributes from teachers)
- Learning only occurs with significant attribute differences (>0.15)
- Promotes the emergence of distinct evolutionary niches and strategies
- Prevents genetic drift toward mediocrity (regression to the mean)

### Anti-Clumping Behavior
A mild social repulsion system has been implemented to prevent unrealistic clumping:
- Personal space radius for each creature type (20 units for prey, 30 for predators)
- Repulsion strength based on proximity (closer creatures create stronger repulsion)
- Hunger-dependent priority (weaker when hungry, stronger when satiated)
- Creates more realistic spatial distribution and reduces competition
- Simulates basic territorial behavior with minimal computational overhead

### Probabilistic Reproduction System
Reproduction has been made fully probabilistic, reflecting real-world biological processes:
- Energy-based probability tiers:
  - High energy threshold (prey: 80%, predator: 70%)
  - Higher probability above threshold (prey: 20%, predator: 30% per update)
  - Lower probability below threshold (prey: 3%, predator: 5% per update)
- Age-based maturity requirements:
  - Juvenile period (0-15% of lifespan) with very low reproduction chance (1%)
  - Adult period with normal energy-based probabilities
- Reproduction cooldown periods:
  - Prey: 7-day cooldown after reproduction
  - Predator: 3-day cooldown after reproduction
  - Probability gradually increases as cooldown period progresses

These mechanics prevent unrealistic population explosions and create more natural population dynamics.

### Energy Capacity Evolution
Energy capacity has been made evolvable through reproduction, allowing creatures to adapt their energy storage based on environmental pressures:
- Offspring inherit parent's energy capacity with small variation (±5%)
- 10% chance of significant mutation (±20%)
- Boundaries: 50-200% of baseline capacity
- Higher capacity = better survival in seasonal environments
- Lower capacity = faster reproduction cycles

### Enhanced Energy Consumption Model
The energy consumption model has been refined to include multiple factors:
- Base metabolism (influenced by longevity)
- Movement cost (influenced by strength)
- Activity cost (based on velocity and strength)
- Age-related inefficiency (separate factors for metabolism and activity)
- Type multiplier (predators have higher energy costs than prey)

This creates a more realistic and balanced energy economy.

### Differentiated Starvation Systems
Separate starvation mechanics have been implemented for predators and prey:

#### Prey Starvation Model:
```
// Prey starvation thresholds
thresholds = [
  { 50% energy: 0.01% death chance per update },
  { 40% energy: 0.01% death chance per update },
  { 30% energy: 0.1% death chance per update },
  { 20% energy: 1.0% death chance per update },
  { 10% energy: 2.0% death chance per update },
  { 5% energy:  10% death chance per update }
]
```

#### Predator Starvation Model:
```
// Predator starvation thresholds (higher risk)
thresholds = [
  { 50% energy: 0.02% death chance per update },
  { 40% energy: 0.1% death chance per update },
  { 30% energy: 0.5% death chance per update },
  { 20% energy: 2.0% death chance per update },
  { 10% energy: 5.0% death chance per update },
  { 5% energy:  20% death chance per update }
]
```

Benefits of differentiated starvation systems:
- Predators face higher starvation risk, reflecting their position as secondary consumers
- Creates ecosystem pressure on predators to maintain efficient hunting strategies
- Allows prey populations to be more resilient to resource fluctuations
- Enables fine-tuning of predator-prey balance without changing other mechanics
- Creates realistic boom-bust population cycles influenced by starvation dynamics

### Enhanced Predator-Prey Balance
The predator-prey interaction mechanics have been refined to create better balance and prevent prey extinction:
- Improved stealth and strength-based escape mechanisms
- More favorable escape chances for highly specialized prey (very high stealth or strength)
- Balanced capture and escape probabilities to ensure prey have reasonable survival chances
- Protected niches for different evolutionary strategies

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
  - Base speed is deliberately slow to create meaningful geographic separation
  - Speed proportional to strength 
  - Direction changes proportional to stealth
  - Predator facing direction matches movement
  - Prey fleeing behavior when predators are detected
  - Limited travel distance creates geographic specialization

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
  - Cluster formation around resource-rich areas due to limited movement speed
  - Development of different attribute profiles in different regions
  - Local extinction and recolonization dynamics with slower repopulation
  - Formation of "safe zones" where prey leverage terrain and stealth to avoid predators
  - Predator hunting grounds with specialized attributes for more effective hunting
  - Meaningful territorial boundaries due to limited movement range
- Resilience Mechanisms:
  - System self-regulation through prey population protection mechanisms
  - Extinction and recovery cycles
  - Attribute profile shifts in response to extinction events

This simulation provides a foundation for exploring evolutionary dynamics in a simplified ecosystem while maintaining biological realism through meaningful trade-offs and interdependencies.