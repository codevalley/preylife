# Experiments & Troubleshooting

This guide provides interesting experiments to try and solutions for common issues.

## Fun Experiments

### 1. Prey-Only Ecosystem

Observe how prey populations behave without predation pressure.

**Setup:**
- Set `initialPopulation.predators` to `0`
- Keep default prey and resource counts

**What to observe:**
- Population growth until resource limitation
- Reduced evolutionary pressure on stealth
- Potential for strength/longevity specialization

### 2. High Mutation Rate

Accelerate evolution with increased mutation rates.

**Setup:**
- Set `reproduction.mutationChance` to `0.5` (50%)
- Set `reproduction.significantMutationRange` to `0.6`

**What to observe:**
- Rapid trait diversity
- Faster specialization emergence
- More volatile population dynamics

### 3. Scarce Resources

Create a harsh environment with limited food.

**Setup:**
- Set `initialPopulation.resources` to `50`
- Set `resources.regenerationChance` to `0.005` (0.5%)
- Disable resource blooms by setting `resourcesPerBloom` to `0`

**What to observe:**
- Intense competition for food
- Strong selection for efficient foraging
- Potential boom-bust population cycles

### 4. Predator Paradise

Start with many predators to see how they adapt.

**Setup:**
- Set `initialPopulation.predators` to `20`
- Set `initialPopulation.prey` to `150`

**What to observe:**
- Initial prey population crash
- Predator die-off as food becomes scarce
- Recovery cycles

### 5. Longevity Focus

Reward long-lived creatures with better survival.

**Setup:**
- Increase `creatures.maxLifespan.longevityBonus` to `80`
- Decrease starvation probabilities by 50%

**What to observe:**
- Evolution toward longevity specialization
- Longer population cycles
- Different evolutionary strategies emerge

### 6. Learning-Dominated Evolution

Make social learning the primary adaptation mechanism.

**Setup:**
- Set `learning.chanceMultiplier` to `0.5`
- Set `learning.maxLearningAmount` to `0.15`
- Reduce `reproduction.mutationChance` to `0.02`

**What to observe:**
- Traits spreading through populations quickly
- Homogenization vs diversity dynamics
- Cultural-like evolution patterns

### 7. Forced Conversion

Enable population-based species conversion triggers.

**Setup:**
- Set `speciesConversion.populationConditions.enabled` to `true`
- Reduce `speciesConversion.populationConditions.enableRatio` to `0.01`

**What to observe:**
- Automatic species rebalancing
- How extreme traits trigger conversion
- Population oscillations

### 8. Small World

Run simulation in a cramped space.

**Setup:**
- Set `environment.width` to `300`
- Set `environment.height` to `200`
- Reduce initial populations proportionally

**What to observe:**
- Higher interaction rates
- Faster evolution
- More extinctions

---

## Troubleshooting

### Predators Always Die

**Symptoms:**
- Predators go extinct within 100-200 days
- Prey population explodes after predator extinction

**Possible causes and fixes:**

1. **Prey escape rate too high**
   - Decrease `prey.escapeBaseChance` from 0.2 to 0.1

2. **Predators can't find prey**
   - Increase `creatures.interactionRanges.preyDetectionRange` to 120

3. **Predators starve too quickly**
   - Increase `predator.maxEnergy` to 700
   - Decrease predator starvation probabilities

4. **Not enough prey to hunt**
   - Increase `initialPopulation.prey` to 120

### Prey Always Die

**Symptoms:**
- Prey go extinct within first 50 days
- Predators then starve

**Possible causes and fixes:**

1. **Predators too efficient**
   - Decrease `predator.captureChance.maxChance` to 0.35
   - Increase `prey.escapeBaseChance` to 0.3

2. **Not enough resources**
   - Increase `initialPopulation.resources` to 400
   - Increase `resources.regenerationChance` to 0.04

3. **Prey can't detect predators**
   - Increase `creatures.interactionRanges.preyPredatorDetectionRange` to 150

### No Evolution Visible

**Symptoms:**
- Average attributes stay near 0.5
- No visible color changes over time

**Possible causes and fixes:**

1. **Mutation rate too low**
   - Increase `reproduction.mutationChance` to 0.2
   - Increase `reproduction.significantMutationRange` to 0.5

2. **Selection pressure too weak**
   - Increase predator efficiency slightly
   - Reduce resources to increase competition

3. **Learning diluting specialization**
   - Decrease `learning.chanceMultiplier` to 0.05

### Population Explosions

**Symptoms:**
- Prey population exceeds 500-1000
- Simulation becomes slow

**Possible causes and fixes:**

1. **Too many resources**
   - Decrease `resources.regenerationChance` to 0.01
   - Decrease `resources.bloom.resourcesPerBloom` to 40

2. **Reproduction too easy**
   - Increase `reproduction.energyThreshold.prey` to 0.9
   - Decrease `reproduction.probability.highEnergy.prey` to 0.1

3. **Predators not hunting enough**
   - Start with more predators
   - Decrease predator reproduction threshold

### Simulation Runs Slowly

**Symptoms:**
- Frame rate drops below 30fps
- UI becomes unresponsive

**Possible causes and fixes:**

1. **Too many entities**
   - Reduce initial population counts
   - Lower resource caps with `resources.limits.maxCount`

2. **Browser performance**
   - Try a different browser (Chrome recommended)
   - Close other tabs

3. **System resources**
   - Reduce browser window size
   - Check system memory usage

### Species Conversion Never Happens

**Symptoms:**
- No evolutionary jumps observed
- Species remain stable

**Possible causes and fixes:**

1. **Conversion disabled**
   - Ensure `speciesConversion.enabled` is `true`

2. **Requirements too strict**
   - Reduce `speciesConversion.contactTracking.sameSpeciesContactRequired` to 200
   - Reduce `speciesConversion.contactTracking.isolationThreshold` to 300

3. **Trait thresholds not reached**
   - Lower `speciesConversion.traitInfluence.prey.traitThreshold` to 0.5
   - Increase `speciesConversion.baseProbability` to 0.1

### Blank Screen / No Rendering

**Symptoms:**
- Page loads but nothing appears
- Browser console shows errors

**Possible causes and fixes:**

1. **WebGL not supported**
   - Check browser WebGL support at `webglreport.com`
   - Update graphics drivers

2. **JavaScript errors**
   - Open browser console (F12)
   - Look for error messages

3. **Build issues**
   - Run `npm run build` to check for errors
   - Try `npm run dev` for development mode

---

## Advanced Experiments

### Evolutionary Arms Race

Create conditions that force continuous adaptation.

**Setup:**
1. Start with balanced populations
2. Every 200 days, manually spawn 10 creatures of the minority species
3. Observe how each species develops counter-strategies

### Bottleneck Events

Simulate population crashes and recovery.

**Setup:**
1. Run simulation until day 300
2. Pause and delete 90% of prey
3. Resume and observe genetic drift and recovery

### Island Biogeography

Use very small populations to observe founder effects.

**Setup:**
- Set `initialPopulation.prey` to `5`
- Set `initialPopulation.predators` to `1`
- Set `initialPopulation.resources` to `50`

**What to observe:**
- Genetic drift effects
- Founder effect in trait distribution
- Extinction probability

### Competition Experiment

Compare outcomes with different initial trait distributions.

**Setup:**
1. Run simulation with default settings, note extinction times
2. Reset and modify `clusteredSpawning.prey.attributes.strengthRange` to `[0.8, 0.9]`
3. Run again and compare results
4. Repeat with stealth-focused initial population

### Environmental Gradient

Create resource-rich and resource-poor regions.

**Setup:**
- Modify code to spawn resources only in one half of the environment
- Observe spatial distribution of creatures over time
- Watch for local adaptation
