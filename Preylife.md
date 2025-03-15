# 🌿 Preylife: An Evolutionary Ecosystem Simulation

## 🤔 What is this Simulation?

Preylife is a fascinating digital ecosystem that demonstrates the emergence of complex evolutionary strategies through simple probabilistic rules. Unlike traditional simulations with hardcoded behaviors, Preylife creates an environment where creatures can evolve and adapt naturally through genetic inheritance, learning, and environmental pressures.

### 🎯 Key Concepts

- **Emergent Behavior**: Complex patterns emerge from simple rules
- **Natural Selection**: Successful traits are passed down through generations
- **Nash Equilibrium**: The system tends to find stable states where different strategies coexist
- **Evolutionary Arms Race**: Continuous adaptation between predators and prey

Think of it as a digital petri dish where you can observe evolution in action! 

## 🧩 Elements of the Simulation

### 🟢 Resources
- **Appearance**: Small green squares
- **Behavior**: Static food sources that regenerate over time
- **Distribution**: Forms natural clusters creating "rich" and "poor" areas
- **Properties**:
  - Provide energy to prey when consumed
  - Decay over time if not consumed
  - Regenerate based on environmental conditions
- **Seasonal Blooms**: 
  - Create dense clusters of high-energy resources
  - 🌱 Primary clusters (2x energy)
  - 🌿 Secondary clusters (1.5x energy)
  - Create temporary abundance and migration patterns

### 🔵 Prey (Blue Circles)
- **Primary Goal**: Consume resources and avoid predators
- **Attributes**:
  - 💪 **Strength** (Green tint): Movement speed & escape ability
  - 🕵️ **Stealth** (Blue tint): Predator detection & evasion
  - 🧠 **Learnability**: Adaptation speed & social learning
  - ⏳ **Longevity**: Lifespan & metabolic efficiency
- **Behavior**:
  - Sense nearby resources within detection range
  - Detect approaching predators based on stealth
  - Flee from predators with speed based on strength
  - Consume resources to gain energy
  - Reproduce when energy is sufficient
- **Evolution**:
  - Inherits traits from parents with mutations
  - Can learn from nearby prey
  - Adapts to local conditions over generations
  - Can evolve energy capacity through mutations

### 🔴 Predators (Red Pentagons)
- **Primary Goal**: Hunt prey and maintain energy levels
- **Attributes**:
  - 💪 **Strength** (Red tint): Hunting speed & capture success
  - 🕵️ **Stealth** (Yellow tint): Approach prey undetected
  - 🧠 **Learnability**: Adaptation speed & hunting tactics
  - ⏳ **Longevity**: Lifespan & metabolic efficiency
- **Behavior**:
  - Detect prey within range based on stealth
  - Chase prey with speed based on strength
  - Attempt to capture prey using strength vs prey's stealth
  - Consume prey to gain energy
  - Reproduce when energy is sufficient
- **Evolution**:
  - Specialized hunting strategies emerge
  - Population self-regulates based on prey availability
  - Can learn successful strategies from other predators

## ⚖️ Energy Mechanics & Reproduction

### 🔄 Energy Cycle
```
Resources → Prey → Predators → (Death) → Resources
```

- **Resources**:
  - Provide base energy to prey
  - Special blooms provide more energy

- **Prey**:
  - Gain energy by consuming resources (with bonus multiplier)
  - Lose energy through movement (more for high-strength prey)
  - Lose energy through metabolism and aging
  - Lose energy when escaping predators
  - Need 80% of maximum energy to reproduce effectively
  - Split energy with offspring during reproduction

- **Predators**:
  - Gain energy by consuming prey (get 85% of prey's energy)
  - Lose energy through movement (more for high-strength predators)
  - Lose energy through metabolism and aging
  - Need 70% of maximum energy to reproduce effectively
  - Lose 60% of energy when reproducing

### 🧬 Reproduction & Inheritance

- **Requirements**:
  - Sufficient energy level (80% for prey, 70% for predators)
  - Mature age (past juvenile stage)
  - Cooldown period since last reproduction

- **Genetic Inheritance**:
  - Offspring inherit parent's attributes with small variations
  - Random mutations affect attributes
  - Chance of significant mutations that create larger changes
  - Energy capacity can also mutate over generations

- **Population Control**:
  - Higher energy threshold for reproduction
  - Energy cost for reproduction
  - Age and maturity requirements
  - Starvation risk at low energy levels

## 🔄 Species Conversion

In rare circumstances, creatures can evolve into a different species:

### 🔵→🔴 Prey to Predator Conversion
- Requires extremely high strength or stealth (trait threshold > 0.6)
- Must be isolated from predators for extended time
- Must have extended contact with other prey
- More likely with specialized traits (strength or stealth > 0.9)

### 🔴→🔵 Predator to Prey Conversion
- Requires very low strength or stealth (trait threshold < 0.5) 
- Must be isolated from prey for extended time
- Must have extended contact with other predators
- More likely with extremely low traits (strength or stealth < 0.1)

This mechanism serves as a natural recovery system, allowing the ecosystem to self-regulate without artificial respawning.

## 🧬 Evolutionary Strategies

### 🎯 Specialization vs Generalization
- **Specialists**: Excel in one trait (high strength OR high stealth)
  - Better at specific tasks
  - More energy efficient in their specialty
  - Get bonuses for extremely high specialization
  - Vulnerable to environmental changes

- **Generalists**: Balanced traits
  - More adaptable
  - Less efficient
  - Better survival in varying conditions

### 🔄 Common Adaptations

#### 🔵 Prey Strategies:
- **Speed Demons**: High strength, low stealth
  - Fast movement and resource gathering
  - Direct flight from predators
  - Higher energy consumption
- **Ghost Prey**: High stealth, low strength
  - Early predator detection
  - Erratic evasion movements
  - Better at avoiding detection
- **Adaptive Prey**: High learnability
  - Quick strategy adjustment
  - Social learning from successful prey
  - Energy-efficient movement patterns

#### 🔴 Predator Strategies:
- **Brute Hunters**: High strength, low stealth
  - Direct and fast pursuit
  - High capture rate once detected
  - Higher energy costs for movement
- **Stealth Hunters**: High stealth, low strength
  - Surprise attacks
  - Better approach success
  - Lower prey detection rate
- **Pack Hunters**: High learnability
  - Learn from successful hunters
  - Adapt to prey patterns
  - Efficient energy management

## 🎮 Simulation Mechanics

### 🧮 Resource Mechanics
- **Generation**: Slow background regeneration with seasonal blooms
- **Decay**: Resources decay if not consumed within certain time
- **Emergency Generation**: When prey population is critically low
- **Bloom Events**: Create rich clusters of high-energy resources

### ⚔️ Predator-Prey Interactions
- **Detection**: Based on distance and stealth attributes
- **Chase**: Predator speed vs prey speed (affected by strength)
- **Capture Attempt**: Probability based on predator strength vs prey stealth
- **Escape Attempt**: Probability based on prey stealth vs predator strength
- **Energy Transfer**: Predator gains 85% of prey's energy if captured

### 🧪 Learning & Adaptation
- **Social Learning**: Creatures can learn from others of same species
- **Attribute Adjustments**: Small changes to attributes based on observations
- **Specialization Preservation**: Highly specialized creatures resist change
- **Energy Cost**: Learning requires energy investment

### ⚡ Energy & Metabolism
- **Base Metabolism**: All creatures lose energy over time
- **Movement Cost**: Higher strength = higher movement cost
- **Age Factor**: Older creatures become less efficient (affected by longevity)
- **Activity Cost**: Based on velocity and strength
- **Starvation Risk**: Probability of death increases at low energy levels

## 🎮 Observation Tips

1. 👀 Watch for:
   - Color variations showing specialization (green/blue for prey, red/yellow for predators)
   - Formation of hunting territories
   - Seasonal migration patterns during resource blooms
   - Population boom-bust cycles

2. 🔍 Look for:
   - Prey clustering in safe zones
   - Predator hunting patterns
   - Resource competition
   - Learning behavior spread

3. 📈 Monitor:
   - Population ratios and balance
   - Evolution of traits over time
   - Energy efficiency strategies
   - Extinction and conversion events

Remember: Every simulation is unique! The beauty of Preylife is watching how different strategies emerge and evolve naturally. 🌟