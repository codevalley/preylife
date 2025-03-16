import { Vector2 } from 'three';
import { Entity, EntityType } from './Entity';
import { SimulationConfig } from '../config';

export interface GeneticAttributes {
  strength: number;  // 0.0-1.0
  stealth: number;   // 0.0-1.0
  learnability: number; // 0.0-1.0
  longevity: number; // 0.0-1.0
}

export abstract class Creature extends Entity {
  // Movement properties
  velocity: Vector2 = new Vector2(0, 0);
  speed: number = SimulationConfig.creatures.baseSpeed; // Base speed from config
  
  // Genetic attributes
  attributes: GeneticAttributes;
  
  // Age properties
  age: number = 0;
  
  // Stats tracking
  offspringCount: number = 0;
  foodConsumed: number = 0;
  
  // Reproduction tracking
  timeSinceLastReproduction: number = 0; // Time since last reproduction event
  
  // Species conversion tracking
  sameSpeciesContactCounter: number = 0;  // Count of frames with same species contact
  sameSpeciesContactHistory: number[] = []; // Array to track same species contact history
  timeWithoutOppositeTypeContact: number = 0; // Time since last contact with opposite type
  lastContactedOppositeType: boolean = false; // Flag for if recently contacted opposite type
  speciesConversionCooldown: number = 0; // Cooldown timer after conversion
  
  // Animation state for newly converted creatures
  isConversionAnimation: boolean = false;
  conversionEffectTime: number = 0;
  
  constructor(
    type: EntityType,
    x: number,
    y: number,
    energy: number,
    attributes: GeneticAttributes
  ) {
    super(type, x, y);
    this.maxEnergy = energy;
    this.energy = energy * 0.5; // Start with 50% of max energy
    this.attributes = attributes;
    
    // Set initial velocity with random direction
    const angle = Math.random() * Math.PI * 2;
    this.velocity.set(Math.cos(angle), Math.sin(angle)).normalize().multiplyScalar(this.speed);
  }
  
  update(deltaTime: number): void {
    // Update position based on velocity
    const moveSpeed = this.speed * this.attributes.strength * deltaTime;
    this.position.add(this.velocity.clone().multiplyScalar(moveSpeed));
    
    // Consume energy based on movement and metabolism
    this.consumeEnergy(deltaTime);
    
    // Check boundaries - wrap around or bounce
    this.handleBoundaries();
    
    // Increment age
    this.age += deltaTime;
    
    // Increment time since last reproduction
    this.timeSinceLastReproduction += deltaTime;
    
    // Decrement species conversion cooldown if active
    if (this.speciesConversionCooldown > 0) {
      this.speciesConversionCooldown -= deltaTime;
      if (this.speciesConversionCooldown < 0) this.speciesConversionCooldown = 0;
    }
    
    // Initialize contact history array if it's empty
    if (!this.sameSpeciesContactHistory || this.sameSpeciesContactHistory.length === 0) {
      this.sameSpeciesContactHistory = new Array(
        SimulationConfig.speciesConversion.contactTracking.frameWindow
      ).fill(0);
    }
    
    // Update conversion animation if this is a newly converted creature
    if (this.isConversionAnimation) {
      this.conversionEffectTime -= deltaTime;
      
      // Add debug log to see what's happening with the timer
      // if (Math.random() < 0.01) {
      //   console.log(`Conversion animation in progress: ${this.conversionEffectTime.toFixed(2)}/${SimulationConfig.speciesConversion.visualEffectDuration}`);
      // }
      
      if (this.conversionEffectTime <= 0) {
        // Animation complete
        //console.log(`Conversion animation complete for ${this.type} with ID: ${this.id}`);
        this.isConversionAnimation = false;
        this.conversionEffectTime = 0;
      }
    }
    
    // Update mesh position
    this.updateMeshPosition();
  }
  
  consumeEnergy(deltaTime: number): void {
    // Base metabolism cost - all creatures lose energy over time
    // Higher longevity reduces base metabolism cost (creatures are more efficient)
    const metabolicEfficiency = 0.7 + (this.attributes.longevity * 0.5); // 0.7-1.2 range
    const baseCost = (1 / metabolicEfficiency) * deltaTime;
    
    // Movement cost - higher strength = higher movement cost
    const movementCost = this.attributes.strength * 2 * deltaTime;
    
    // Activity-related cost (proportional to the creature's velocity)
    const velocityMagnitude = this.velocity.length();
    const activityCost = velocityMagnitude * this.attributes.strength * 0.5 * deltaTime;
    
    // Age factor - older creatures become less efficient 
    // Calculate age as a percentage of maximum lifespan
    const maxLifespan = 60 + (this.attributes.longevity * 40); // 60-100 seconds
    const ageRatio = this.age / maxLifespan;
    
    // Metabolic efficiency decreases with age, but is improved by longevity attribute
    // Formula: 1.0 at birth, decreases to longevity at maximum age
    const ageEfficiency = Math.max(0.7, 1.0 - (ageRatio * (1.0 - this.attributes.longevity)));
    
    // Calculate activity cost multiplier based on age
    // Older creatures get tired more quickly (affected less with higher longevity)
    const activityEfficiency = Math.max(0.6, 1.0 - (ageRatio * 0.8 * (1.0 - this.attributes.longevity)));
    
    // Total energy consumption with all factors
    const totalCost = (baseCost / ageEfficiency) + (movementCost + activityCost) / activityEfficiency;
    
    // Balance energy consumption between predators and prey
    // More reasonable values to ensure predators can survive
    const typeMultiplier = this.type === EntityType.PREDATOR ? 2.5 : 0.7;
    
    // Save previous energy for comparison
    const previousEnergy = this.energy;
    
    // Final energy consumption
    this.energy = Math.max(0, this.energy - (totalCost * typeMultiplier));
    
    // If energy changed significantly, update the mesh to reflect new energy level
    if (Math.abs(previousEnergy - this.energy) > 1) {
      this.updateMeshPosition();
    }
    
    // Starvation probability check - chance of sudden death when energy is low
    const energyRatio = this.energy / this.maxEnergy;
    this.checkStarvationProbability(energyRatio);
    
    // Check for death from starvation (energy completely depleted)
    if (this.energy <= 0) {
      this.die();
    }
    
    // Check for death from old age
    if (this.age > maxLifespan) {
      this.die();
    }
  }
  
  private checkStarvationProbability(energyRatio: number): void {
    // Check if energy level has dropped to starvation threshold levels
    // Apply random chance of death based on thresholds in config
    
    // Get the appropriate thresholds based on creature type
    const thresholds = this.type === EntityType.PREY 
      ? SimulationConfig.starvation.prey.thresholds 
      : SimulationConfig.starvation.predator.thresholds;
    
    // Check against each threshold from lowest energy to highest
    for (const threshold of thresholds) {
      if (energyRatio <= threshold.energyPercent) {
        // At or below this threshold, apply probability check
        if (Math.random() < threshold.probability) {
          // Random starvation death occurs!
          this.die();
          //console.log(`${this.type} died from starvation at ${(energyRatio * 100).toFixed(1)}% energy`);
          break; // No need to check further thresholds
        }
        break; // Only apply the first (lowest) matching threshold
      }
    }
  }
  
  handleBoundaries(): void {
    // Wrap around environment boundaries
    // Use camera frustum size for consistent environment boundaries
    const width = 600 * (window.innerWidth / window.innerHeight); // Adjust for aspect ratio
    const height = 600; // Fixed height
    
    if (this.position.x < -width/2) this.position.x = width/2;
    if (this.position.x > width/2) this.position.x = -width/2;
    if (this.position.y < -height/2) this.position.y = height/2;
    if (this.position.y > height/2) this.position.y = -height/2;
  }
  
  canReproduce(): boolean {
    // Calculate max lifespan for maturity check
    const maxLifespan = SimulationConfig.creatures.maxLifespan.base + 
                        (this.attributes.longevity * SimulationConfig.creatures.maxLifespan.longevityBonus);
    
    // Get type-specific reproduction parameters
    const isPreyType = this.type === EntityType.PREY;
    const energyThreshold = isPreyType 
      ? SimulationConfig.reproduction.energyThreshold.prey 
      : SimulationConfig.reproduction.energyThreshold.predator;
    
    const cooldownDays = isPreyType
      ? SimulationConfig.reproduction.cooldown.prey
      : SimulationConfig.reproduction.cooldown.predator;
      
    // Convert cooldown days to simulation time units
    const cooldownTime = cooldownDays * 10; // 10 frames per day
    
    // Calculate cooldown factor (0 right after reproduction, 1 when cooldown is complete)
    const cooldownFactor = Math.min(1, this.timeSinceLastReproduction / cooldownTime);
    
    // Check if juvenile (age less than juvenile maturity threshold of max lifespan)
    const isJuvenile = this.age < (maxLifespan * SimulationConfig.reproduction.juvenileMaturity);
    
    // Calculate energy ratio
    const energyRatio = this.energy / this.maxEnergy;
    
    // Get threshold for lottery-like probabilities
    // (We're reusing the isPreyType variable defined above)
      
    // Apply lottery-like odds for critically low energy
    if (energyRatio < 0.1) {
      // Critically low energy (below 10%) - near-zero chance
      return Math.random() < 0.00001; // 0.001% chance (1 in 100,000)
    } 
    else if (energyRatio < 0.2) {
      // Very low energy (10-20%) - extremely rare
      return Math.random() < 0.0001; // 0.01% chance (1 in 10,000)
    }
    // For energy between 20% and the threshold, we'll continue with the
    // normal probability calculation below (using config's lowEnergy values)
    
    // Base reproduction probability
    let reproductionProbability;
    if (isJuvenile) {
      // Very low probability for juveniles
      reproductionProbability = SimulationConfig.reproduction.juvenileReproductionProbability;
    } else {
      // Normal energy-based probability
      if (energyRatio >= energyThreshold) {
        reproductionProbability = isPreyType
          ? SimulationConfig.reproduction.probability.highEnergy.prey
          : SimulationConfig.reproduction.probability.highEnergy.predator;
      } else {
        reproductionProbability = isPreyType
          ? SimulationConfig.reproduction.probability.lowEnergy.prey
          : SimulationConfig.reproduction.probability.lowEnergy.predator;
      }
    }
    
    // Apply cooldown factor (reduces probability right after reproduction)
    reproductionProbability *= cooldownFactor;
    
    // Check if reproduction occurs based on calculated probability
    return Math.random() < reproductionProbability;
  }
  
  abstract reproduce(): Creature;
  
  protected onReproduction(): void {
    this.offspringCount++;
    this.timeSinceLastReproduction = 0;
  }

  protected onFoodConsumption(): void {
    this.foodConsumed++;
  }
  
  /**
   * Handles species conversion logic when creatures of the same type are in proximity
   * @param nearbyCreatures Creatures of the same species nearby
   * @param totalPopulation Object with population counts
   * @param nearbyOppositeType Whether any opposite type creatures are nearby
   * @returns A new creature of the opposite type if conversion occurs, null otherwise
   */
  async checkSpeciesConversion(
    nearbyCreatures: Creature[], 
    totalPopulation: {prey: number, predators: number},
    nearbyOppositeType: boolean = false
  ): Promise<Creature | null> {
    // Skip if feature is disabled or creature is in cooldown or already converting
    if (!SimulationConfig.speciesConversion.enabled || 
        this.speciesConversionCooldown > 0) {
      return null;
    }
    
    // Get the contact tracking configuration
    const contactConfig = SimulationConfig.speciesConversion.contactTracking;
    
    // STEP 1: Track contact with opposite type creatures
    if (nearbyOppositeType) {
      // Reset timer when in contact with opposite type
      this.timeWithoutOppositeTypeContact = 0;
      this.lastContactedOppositeType = true;
      
      // If configured to reset same-species contact on opposite contact, do so
      if (contactConfig.resetOnOppositeContact) {
        // Reset the contact counter and history
        this.sameSpeciesContactCounter = 0;
        this.sameSpeciesContactHistory = [];
      }
    } else {
      // Increment timer when no contact with opposite type
      if (this.lastContactedOppositeType) {
        // Just lost contact with opposite type
        this.timeWithoutOppositeTypeContact = 1;
        this.lastContactedOppositeType = false;
      } else {
        // Continue incrementing time without opposite type contact
        this.timeWithoutOppositeTypeContact++;
      }
    }
    
    // STEP 2: Update same-species contact tracking
    // Add current frame's contact status to history (1 for contact, 0 for no contact)
    this.sameSpeciesContactHistory.push(nearbyCreatures.length > 0 ? 1 : 0);
    
    // Trim history to only keep the configured window size
    if (this.sameSpeciesContactHistory.length > contactConfig.frameWindow) {
      this.sameSpeciesContactHistory = this.sameSpeciesContactHistory.slice(-contactConfig.frameWindow);
    }
    
    // Count total contacts in the window
    const totalContactsInWindow = this.sameSpeciesContactHistory.reduce((sum, val) => sum + val, 0);
    
    // PRECONDITION 1: Must not have been in contact with opposite type for isolation threshold
    if (this.timeWithoutOppositeTypeContact < contactConfig.isolationThreshold) {
      return null;
    }
    
    // PRECONDITION 2: Must have sufficient same-species contact in the window
    if (totalContactsInWindow < contactConfig.sameSpeciesContactRequired) {
      return null;
    }
    
    // The preconditions are met - creature is isolated from opposite type
    // and has sufficient contact with same species
    
    // Check optional population conditions for enabling conversion if enabled
    if (SimulationConfig.speciesConversion.populationConditions.enabled) {
      const { enableRatio, minPopulationCheck } = SimulationConfig.speciesConversion.populationConditions;
      const totalCreatures = totalPopulation.prey + totalPopulation.predators;
      
      let conversionEnabled = false;
      
      // Only apply population ratio check if we have enough creatures
      if (totalCreatures >= minPopulationCheck) {
        if (this.type === EntityType.PREDATOR) {
          // Enable predator→prey conversion if prey are critically endangered
          const preyRatio = totalPopulation.prey / totalCreatures;
          conversionEnabled = (preyRatio < enableRatio);
        } else {
          // Enable prey→predator conversion if predators are critically endangered
          const predatorRatio = totalPopulation.predators / totalCreatures;
          conversionEnabled = (predatorRatio < enableRatio);
        }
      }
      
      // Early return if conversion is not enabled due to population conditions
      if (!conversionEnabled) {
        // Debug: log when population condition fails
        if (SimulationConfig.speciesConversion.debugConversionChecks) {
          // Only log occasionally to avoid spam
          if (Math.random() < 0.01) {
            //console.log(`Conversion check: ${this.type} failed population condition check`);
            if (this.type === EntityType.PREDATOR) {
              //console.log(`Prey ratio: ${(totalPopulation.prey/totalCreatures).toFixed(3)}, threshold: ${enableRatio}`);
            } else {
              //console.log(`Predator ratio: ${(totalPopulation.predators/totalCreatures).toFixed(3)}, threshold: ${enableRatio}`);
            }
          }
        }
        return null;
      }
    }
    
    // STEP 3: Check trait thresholds for eligibility
    // Get influence settings based on creature type
    const influence = this.type === EntityType.PREY 
      ? SimulationConfig.speciesConversion.traitInfluence.prey
      : SimulationConfig.speciesConversion.traitInfluence.predator;
    
    // PRECONDITION 3: Creature must have extreme traits
    let hasExtremeTraits = false;
    let extremeTraitMultiplier = 1.0;
    const averageTraitValue = (this.attributes.strength + this.attributes.stealth) / 2;
    
    if (this.type === EntityType.PREY) {
      // Prey need extremely high traits to convert to predator
      hasExtremeTraits = averageTraitValue > influence.traitThreshold;
      
      // Bonus multiplier for extremely high traits (>0.9)
      if (this.attributes.strength > 0.9 || this.attributes.stealth > 0.9) {
        extremeTraitMultiplier = influence.extremeTraitBonus;
      }
    } else {
      // Predators need extremely low traits to convert to prey
      hasExtremeTraits = averageTraitValue < influence.traitThreshold;
      
      // Bonus multiplier for extremely low traits (<0.1)
      if (this.attributes.strength < 0.1 || this.attributes.stealth < 0.1) {
        extremeTraitMultiplier = influence.extremeTraitBonus;
      }
    }
    
    // Log trait information
    if (SimulationConfig.speciesConversion.debugConversionChecks) {
      console.log(`${this.type} traits - Strength: ${this.attributes.strength.toFixed(2)}, Stealth: ${this.attributes.stealth.toFixed(2)}`);
      console.log(`${this.type} trait threshold: ${influence.traitThreshold}, Avg: ${averageTraitValue.toFixed(2)}, Extreme traits: ${hasExtremeTraits}`);
      console.log(`Same-species contacts: ${totalContactsInWindow}/${contactConfig.frameWindow}, Required: ${contactConfig.sameSpeciesContactRequired}`);
      console.log(`Time without opposite type: ${this.timeWithoutOppositeTypeContact}, Required: ${contactConfig.isolationThreshold}`);
    }
    
    // Exit early if traits are not extreme enough
    if (!hasExtremeTraits) {
      if (SimulationConfig.speciesConversion.debugConversionChecks) {
        console.log(`${this.type} failed trait check - traits not extreme enough`);
      }
      return null;
    }
    
    // STEP 4: Calculate conversion probability
    // Start with base probability from config
    let conversionProbability = SimulationConfig.speciesConversion.baseProbability;
    
    // Apply extreme trait multiplier (could be 100x for truly extreme traits)
    conversionProbability *= extremeTraitMultiplier;
    
    // Calculate trait-based influence (small additional adjustment)
    const strengthInfluence = this.attributes.strength * influence.strengthWeight;
    const stealthInfluence = this.attributes.stealth * influence.stealthWeight;
    conversionProbability += strengthInfluence + stealthInfluence;
    
    // For extreme trait values, increase conversion probability substantially
    if (this.type === EntityType.PREY && 
        (this.attributes.strength > 0.9 || this.attributes.stealth > 0.9)) {
      // Boost probability for extremely strong/stealthy prey
      conversionProbability *= 2;
    } else if (this.type === EntityType.PREDATOR && 
              (this.attributes.strength < 0.1 || this.attributes.stealth < 0.1)) {
      // Boost probability for extremely weak predators
      conversionProbability *= 2;
    }
    
    // Ensure probability never exceeds the max allowed
    conversionProbability = Math.min(influence.maxProbability, Math.max(0, conversionProbability));
    
    // STEP 5: Check for conversion success (the lottery)
    if (SimulationConfig.speciesConversion.debugConversionChecks) {
      console.log(`${this.type} conversion probability: ${(conversionProbability * 100).toFixed(4)}%`);
    }
    
    const roll = Math.random();
    const success = roll < conversionProbability;
    
    if (SimulationConfig.speciesConversion.debugConversionChecks) {
      console.log(`${this.type} conversion roll: ${roll.toFixed(4)} vs ${conversionProbability.toFixed(4)} - ${success ? 'SUCCESS!' : 'failed'}`);
    }
    
    if (success) {
      // Conversion lottery hit! Immediately create the converted creature
      // Reset conversion tracking
      this.sameSpeciesContactCounter = 0;
      this.sameSpeciesContactHistory = [];
      this.timeWithoutOppositeTypeContact = 0;
      
      // Set cooldown
      this.speciesConversionCooldown = SimulationConfig.speciesConversion.evolutionCooldown;
      
      // Log this conversion event only when it happens
      console.info(`=== EVOLUTIONARY EVENT ===`);
      console.info(`${this.type} converting to ${this.type === EntityType.PREY ? 'PREDATOR' : 'PREY'}`);
      console.info(`Conversion probability was: ${(conversionProbability * 100).toFixed(4)}%`);
      console.info(`Attributes - Strength: ${this.attributes.strength.toFixed(2)}, Stealth: ${this.attributes.stealth.toFixed(2)}`);
      console.info(`Same-species contacts: ${totalContactsInWindow}/${contactConfig.frameWindow}`);
      console.info(`Time without opposite type: ${this.timeWithoutOppositeTypeContact}`);
      
      try {
        // Create opposite type with same attributes but adjusted for new role
        const convertedCreature = await this.convertToOppositeSpecies();
        
        // The creature is marked for death in the simulation engine
        this.die();
        
        // Return the new creature immediately for the engine to add
        return convertedCreature;
      } catch (error) {
        console.error("Error during conversion:", error);
        return null;
      }
    }
    
    return null;
  }
  
  /**
   * Creates a new creature of the opposite type with this creature's attributes
   * Adjusts attributes to be more suitable for the new role
   */
  private async convertToOppositeSpecies(): Promise<Creature> {
    // Create attributes for new creature with some adjustments
    const newAttributes: GeneticAttributes = {
      strength: this.attributes.strength,
      stealth: this.attributes.stealth,
      learnability: this.attributes.learnability,
      longevity: this.attributes.longevity
    };
    
    let newCreature: Creature;
    
    // Convert prey to predator or predator to prey
    if (this.type === EntityType.PREY) {
      // Prey becoming predator - enhance strength and stealth slightly
      newAttributes.strength = Math.min(1.0, this.attributes.strength * 1.2);
      newAttributes.stealth = Math.min(1.0, this.attributes.stealth * 1.1);
      
      try {
        // Get base predator max energy from config
        const basePredatorMaxEnergy = SimulationConfig.predator.maxEnergy;
        
        // Calculate variance ratio from base prey energy to this prey's actual max energy
        const preyEnergyVarianceRatio = this.maxEnergy / SimulationConfig.prey.maxEnergy;
        
        // Apply same variance ratio to predator's max energy
        const newPredatorMaxEnergy = basePredatorMaxEnergy * preyEnergyVarianceRatio;
        
        // Scale the current energy proportionally
        const energyRatio = this.energy / this.maxEnergy;
        const scaledEnergy = newPredatorMaxEnergy * energyRatio;
        
        // Import using ES modules
        const { Predator } = await import('./Predator');
        newCreature = new Predator(
          this.position.x, this.position.y,
          newPredatorMaxEnergy, // Use scaled max energy that maintains variance ratio
          newAttributes
        );
        
        // Set the scaled energy
        newCreature.energy = Math.min(newPredatorMaxEnergy, Math.max(newPredatorMaxEnergy * 0.3, scaledEnergy));
        
      } catch (error) {
        console.error("Error creating predator:", error);
        throw error;
      }
      
    } else {
      // Predator becoming prey - reduce strength slightly, enhance longevity
      newAttributes.strength = Math.max(0.0, this.attributes.strength * 0.9);
      newAttributes.longevity = Math.min(1.0, this.attributes.longevity * 1.1);
      
      try {
        // Get base prey max energy from config
        const basePreyMaxEnergy = SimulationConfig.prey.maxEnergy;
        
        // Calculate variance ratio from base predator energy to this predator's actual max energy
        const predatorEnergyVarianceRatio = this.maxEnergy / SimulationConfig.predator.maxEnergy;
        
        // Apply same variance ratio to prey's max energy
        const newPreyMaxEnergy = basePreyMaxEnergy * predatorEnergyVarianceRatio;
        
        // Scale the current energy proportionally
        const energyRatio = this.energy / this.maxEnergy;
        const scaledEnergy = newPreyMaxEnergy * energyRatio;
        
        // Import using ES modules
        const { Prey } = await import('./Prey');
        newCreature = new Prey(
          this.position.x, this.position.y,
          newPreyMaxEnergy, // Use scaled max energy that maintains variance ratio
          newAttributes
        );
        
        // Set the scaled energy
        newCreature.energy = Math.min(newPreyMaxEnergy, Math.max(newPreyMaxEnergy * 0.3, scaledEnergy));
        
      } catch (error) {
        console.error("Error creating prey:", error);
        throw error;
      }
    }
    
    // Turn on conversion animation for the new creature
    newCreature.isConversionAnimation = true;
    newCreature.conversionEffectTime = SimulationConfig.speciesConversion.visualEffectDuration;
    
    return newCreature;
  }
}