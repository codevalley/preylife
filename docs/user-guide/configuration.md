# Configuration Reference

This guide documents all configuration parameters in PreyLife. Parameters can be modified in the Settings panel or by editing `src/config.ts`.

## Configuration Structure

Parameters are organized into logical categories:

- **UI** - Visual feedback settings
- **Environment** - World dimensions
- **Initial Population** - Starting counts
- **Resources** - Food source behavior
- **Creatures** - General creature settings
- **Predator** - Predator-specific settings
- **Prey** - Prey-specific settings
- **Learning** - Social learning behavior
- **Reproduction** - Breeding mechanics
- **Starvation** - Energy-based death risk
- **Clustered Spawning** - Initial distribution
- **Species Conversion** - Evolutionary jumps

---

## UI Settings

Control visual notifications and feedback.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `ui.toasts.showEphemeral` | `true` | Show brief notifications (+1 prey, etc.) |
| `ui.toasts.showInfo` | `true` | Show educational callouts (extinctions, etc.) |

---

## Environment Settings

Define the simulation world boundaries.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `environment.width` | `1000` | Width of simulation area in units |
| `environment.height` | `600` | Height of simulation area in units |

---

## Initial Population

Starting counts for simulation entities.

| Parameter | Default | Description |
|-----------|---------|-------------|
| `initialPopulation.resources` | `250` | Initial food sources |
| `initialPopulation.prey` | `90` | Initial prey creatures |
| `initialPopulation.predators` | `4` | Initial predator creatures |

**Tips:**
- Set `predators` to `0` for a prey-only ecosystem
- Increase `resources` if prey starve quickly
- Reduce `prey` for faster evolution observation

---

## Resource Settings

### Basic Resources

| Parameter | Default | Description |
|-----------|---------|-------------|
| `resources.defaultEnergy` | `12` | Energy value of each resource |
| `resources.regenerationChance` | `0.02` | Probability per frame of new resource (2%) |
| `resources.emergencyRegenerationThreshold` | `0.2` | Prey population % to trigger emergency spawning |
| `resources.emergencyRegenerationChance` | `0.05` | Emergency spawn probability (5%) |
| `resources.emergencyEnergyBonus` | `1.5` | Emergency resource energy multiplier |
| `resources.decayChance` | `0.1` | Decay probability when no prey exist |

### Resource Limits

| Parameter | Default | Description |
|-----------|---------|-------------|
| `resources.limits.maxCount` | `2000` | Maximum resources in simulation |
| `resources.limits.enableDecay` | `true` | Enable natural resource decay |
| `resources.limits.decayLifespan` | `30` | Days before decay eligibility |
| `resources.limits.decayChancePerFrame` | `0.005` | Decay probability for old resources |
| `resources.limits.enforcementThreshold` | `0.9` | Start limiting at 90% of max |

### Seasonal Blooms

| Parameter | Default | Description |
|-----------|---------|-------------|
| `resources.bloom.clusterCount` | `5` | Clusters per bloom event |
| `resources.bloom.primaryEnergyMultiplier` | `2.0` | Primary cluster energy (2×) |
| `resources.bloom.secondaryEnergyMultiplier` | `1.5` | Secondary cluster energy (1.5×) |
| `resources.bloom.primaryClusterRadius` | `60` | Dense cluster radius |
| `resources.bloom.secondaryClusterRadius` | `160` | Sparse cluster radius |
| `resources.bloom.bloomDuration` | `10` | Days bloom lasts |
| `resources.bloom.resourcesPerBloom` | `75` | Total resources per bloom |
| `resources.bloom.primaryDensity` | `0.6` | Primary cluster allocation (60%) |

---

## Creature Settings

General parameters for all creatures.

### Movement

| Parameter | Default | Description |
|-----------|---------|-------------|
| `creatures.baseSpeed` | `8` | Base movement speed (units/second) |
| `creatures.baseCost` | `1.0` | Base energy consumption rate |
| `creatures.movementCostMultiplier` | `2.0` | Strength effect on movement cost |

### Lifespan

| Parameter | Default | Description |
|-----------|---------|-------------|
| `creatures.maxLifespan.base` | `60` | Base lifespan in seconds |
| `creatures.maxLifespan.longevityBonus` | `40` | Extra seconds at max longevity |

### Energy Consumption

| Parameter | Default | Description |
|-----------|---------|-------------|
| `creatures.energyConsumption.predator` | `0.9` | Predator consumption multiplier |
| `creatures.energyConsumption.prey` | `0.7` | Prey consumption multiplier |

### Interaction Ranges

| Parameter | Default | Description |
|-----------|---------|-------------|
| `creatures.interactionRanges.resourceConsumption` | `10` | Prey eating range |
| `creatures.interactionRanges.preyCaptureRange` | `15` | Predator capture range |
| `creatures.interactionRanges.preyDetectionRange` | `80` | Predator prey detection |
| `creatures.interactionRanges.preyResourceDetectionRange` | `50` | Prey resource detection |
| `creatures.interactionRanges.preyPredatorDetectionRange` | `100` | Prey predator detection |

### Anti-Clumping

| Parameter | Default | Description |
|-----------|---------|-------------|
| `creatures.personalSpaceRadius.prey` | `20` | Prey separation distance |
| `creatures.personalSpaceRadius.predator` | `30` | Predator separation distance |
| `creatures.repulsionFactor.prey` | `0.1` | Prey separation force |
| `creatures.repulsionFactor.predator` | `0.15` | Predator separation force |

---

## Predator Settings

| Parameter | Default | Description |
|-----------|---------|-------------|
| `predator.maxEnergy` | `560` | Maximum energy capacity |
| `predator.energyGainFromPrey` | `0.85` | Energy gained from prey (85%) |
| `predator.huntingSpeedMultiplier` | `0.5` | Speed boost when hungry (50%) |
| `predator.detectionRangeMultiplier` | `0.5` | Detection boost when hungry (50%) |

### Default Attributes

| Parameter | Default | Description |
|-----------|---------|-------------|
| `predator.defaultAttributes.strength` | `0.5` | Initial strength |
| `predator.defaultAttributes.stealth` | `0.4` | Initial stealth |
| `predator.defaultAttributes.learnability` | `0.1` | Initial learnability |
| `predator.defaultAttributes.longevity` | `0.5` | Initial longevity |

### Capture Chance

| Parameter | Default | Description |
|-----------|---------|-------------|
| `predator.captureChance.strengthMultiplier` | `0.6` | Strength impact on capture |
| `predator.captureChance.baseChance` | `0.2` | Minimum base chance (20%) |
| `predator.captureChance.minChance` | `0.1` | Absolute minimum (10%) |
| `predator.captureChance.maxChance` | `0.5` | Absolute maximum (50%) |

---

## Prey Settings

| Parameter | Default | Description |
|-----------|---------|-------------|
| `prey.maxEnergy` | `175` | Maximum energy capacity |
| `prey.resourceEnergyBonus` | `1.2` | Resource energy bonus (20%) |
| `prey.predatorAvoidanceMultiplier` | `1.0` | Flee speed boost |
| `prey.predatorDetectionMultiplier` | `1.1` | Stealth effect on detection |
| `prey.escapeBaseChance` | `0.2` | Base escape probability (20%) |
| `prey.escapeEnergyConsumption` | `5` | Energy cost to escape |

### Default Attributes

| Parameter | Default | Description |
|-----------|---------|-------------|
| `prey.defaultAttributes.strength` | `0.5` | Initial strength |
| `prey.defaultAttributes.stealth` | `0.5` | Initial stealth |
| `prey.defaultAttributes.learnability` | `0.05` | Initial learnability |
| `prey.defaultAttributes.longevity` | `0.5` | Initial longevity |

---

## Learning Settings

| Parameter | Default | Description |
|-----------|---------|-------------|
| `learning.chanceMultiplier` | `0.1` | Base learning probability (10%) |
| `learning.learningRate` | `0.2` | How much trait difference is adopted |
| `learning.maxLearningAmount` | `0.05` | Maximum trait change per event |
| `learning.energyCost` | `10` | Energy cost multiplier |

---

## Reproduction Settings

### Mutation

| Parameter | Default | Description |
|-----------|---------|-------------|
| `reproduction.mutationRange` | `0.1` | Standard trait variation (±0.05) |
| `reproduction.mutationChance` | `0.1` | Significant mutation probability (10%) |
| `reproduction.significantMutationRange` | `0.4` | Large mutation range (±0.2) |
| `reproduction.energyCapacityMutationRange` | `0.1` | Energy capacity variation (±5%) |
| `reproduction.significantEnergyCapacityMutationRange` | `0.4` | Large energy variation (±20%) |

### Thresholds

| Parameter | Default | Description |
|-----------|---------|-------------|
| `reproduction.energyThreshold.prey` | `0.8` | Prey reproduction energy (80%) |
| `reproduction.energyThreshold.predator` | `0.70` | Predator reproduction energy (70%) |

### Probability

| Parameter | Default | Description |
|-----------|---------|-------------|
| `reproduction.probability.highEnergy.prey` | `0.2` | Prey reproduction rate (20%) |
| `reproduction.probability.highEnergy.predator` | `0.4` | Predator reproduction rate (40%) |
| `reproduction.probability.lowEnergy.prey` | `0.001` | Low-energy prey rate (0.1%) |
| `reproduction.probability.lowEnergy.predator` | `0.002` | Low-energy predator rate (0.2%) |

### Cooldown

| Parameter | Default | Description |
|-----------|---------|-------------|
| `reproduction.cooldown.prey` | `7` | Days between prey births |
| `reproduction.cooldown.predator` | `3` | Days between predator births |

### Maturity

| Parameter | Default | Description |
|-----------|---------|-------------|
| `reproduction.juvenileMaturity` | `0.15` | Lifespan % before reproduction (15%) |
| `reproduction.juvenileReproductionProbability` | `0.01` | Juvenile reproduction rate (1%) |

---

## Starvation Settings

Probability of death at each energy level.

### Prey Starvation

| Energy Level | Death Probability |
|--------------|-------------------|
| 50% | 0.01% |
| 40% | 0.01% |
| 30% | 0.1% |
| 20% | 0.5% |
| 10% | 2% |
| 5% | 1% |

### Predator Starvation

| Energy Level | Death Probability |
|--------------|-------------------|
| 50% | 0.1% |
| 40% | 0.2% |
| 30% | 0.5% |
| 20% | 2% |
| 10% | 8% |
| 5% | 25% |

---

## Clustered Spawning Settings

Controls initial entity distribution.

### Resources

| Parameter | Default | Description |
|-----------|---------|-------------|
| `clusteredSpawning.resources.clusterCount` | `4` | Initial resource clusters |

### Prey

| Parameter | Default | Description |
|-----------|---------|-------------|
| `clusteredSpawning.prey.minClusters` | `2` | Minimum prey clusters |
| `clusteredSpawning.prey.maxClusters` | `3` | Maximum prey clusters |
| `clusteredSpawning.prey.radius` | `80` | Cluster spread radius |
| `clusteredSpawning.prey.attributes.variation` | `0.2` | Within-cluster variation |

### Predator

| Parameter | Default | Description |
|-----------|---------|-------------|
| `clusteredSpawning.predator.minClusters` | `1` | Minimum predator clusters |
| `clusteredSpawning.predator.maxClusters` | `2` | Maximum predator clusters |
| `clusteredSpawning.predator.radius` | `60` | Cluster spread radius |
| `clusteredSpawning.predator.attributes.variation` | `0.2` | Within-cluster variation |

---

## Species Conversion Settings

Controls evolutionary species jumps.

### Master Toggle

| Parameter | Default | Description |
|-----------|---------|-------------|
| `speciesConversion.enabled` | `true` | Enable/disable conversion |

### Contact Tracking

| Parameter | Default | Description |
|-----------|---------|-------------|
| `speciesConversion.contactTracking.frameWindow` | `600` | Frames to analyze (10 seconds) |
| `speciesConversion.contactTracking.sameSpeciesContactRequired` | `300` | Required same-species contacts |
| `speciesConversion.contactTracking.resetOnOppositeContact` | `true` | Reset on opposite contact |
| `speciesConversion.contactTracking.isolationThreshold` | `450` | Frames without opposite contact |

### Probability

| Parameter | Default | Description |
|-----------|---------|-------------|
| `speciesConversion.baseProbability` | `0.05` | Base conversion chance (5%) |

### Trait Influence (Prey → Predator)

| Parameter | Default | Description |
|-----------|---------|-------------|
| `speciesConversion.traitInfluence.prey.traitThreshold` | `0.6` | Minimum avg trait for conversion |
| `speciesConversion.traitInfluence.prey.extremeTraitBonus` | `500` | Multiplier for extreme traits |
| `speciesConversion.traitInfluence.prey.maxProbability` | `0.25` | Maximum conversion probability (25%) |

### Trait Influence (Predator → Prey)

| Parameter | Default | Description |
|-----------|---------|-------------|
| `speciesConversion.traitInfluence.predator.traitThreshold` | `0.5` | Maximum avg trait for conversion |
| `speciesConversion.traitInfluence.predator.extremeTraitBonus` | `500` | Multiplier for extreme traits |
| `speciesConversion.traitInfluence.predator.maxProbability` | `0.15` | Maximum conversion probability (15%) |

### Limits

| Parameter | Default | Description |
|-----------|---------|-------------|
| `speciesConversion.evolutionCooldown` | `600` | Frames before next conversion |
| `speciesConversion.visualEffectDuration` | `3.0` | Animation duration (seconds) |

---

## Common Adjustments

### "Predators always die"
- Increase `predator.maxEnergy`
- Decrease `prey.escapeBaseChance`
- Increase `predator.energyGainFromPrey`

### "No evolution happening"
- Increase `reproduction.mutationChance`
- Increase `reproduction.significantMutationRange`
- Increase `learning.chanceMultiplier`

### "Population explodes"
- Decrease `resources.regenerationChance`
- Increase `creatures.baseCost`
- Decrease reproduction probabilities

### "Want faster simulation"
- Reduce `initialPopulation` values
- Increase starvation probabilities
- Reduce `creatures.maxLifespan.base`
