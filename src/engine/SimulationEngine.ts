import { Entity } from '../entities/Entity';
import { Resource } from '../entities/Resource';
import { Prey } from '../entities/Prey';
import { Predator } from '../entities/Predator';
import { SimulationConfig } from '../config';
import { GeneticAttributes } from '../entities/Creature';

interface AttributeStats {
  strength: number;
  stealth: number;
  learnability: number;
  longevity: number;
}

interface SimulationStats {
  resourceCount: number;
  preyCount: number;
  predatorCount: number;
  preyAttributes: AttributeStats;
  predatorAttributes: AttributeStats;
}

export class SimulationEngine {
  private resources: Resource[] = [];
  private prey: Prey[] = [];
  private predators: Predator[] = [];
  
  private isRunning: boolean = false;
  // Environment dimensions (set to match camera frustum size)
  private environmentWidth: number = 1000; // Will adjust based on aspect ratio
  private environmentHeight: number = 600; // Fixed base height
  
  // Simulation time tracking
  private days: number = 0;
  private framesPerDay: number = 10; // 10 frames = 1 day
  private frameCount: number = 0;
  
  // Seasonal resource spawning
  private seasonLength: number = 90; // 90 days per season (much less frequent)
  private seasonResourceSpawnAmount: number = SimulationConfig.resources.bloom.resourcesPerBloom; // Resources to spawn each season
  private resourceBloom: boolean = false; // Whether we're in a resource bloom period
  
  // Extinction and spawn tracking
  private extinctionEvents: {type: string, day: number}[] = [];
  private totalSpawned: {
    prey: number,
    predators: number,
    resources: number
  } = {
    prey: 0,
    predators: 0,
    resources: 0
  };
  
  constructor(
    private initialResourceCount: number = 250,
    private initialPreyCount: number = 50,
    private initialPredatorCount: number = 8
  ) {}
  
  // Track last prey and predator counts for extinction logging
  private lastPreyCount: number = 0;
  private lastPredatorCount: number = 0;
  
  // Methods to spawn new creatures on demand with clustering
  spawnPrey(count: number = 10, clustered: boolean = true): void {
    if (clustered) {
      // Define specialized cluster types for diverse initial population
      const clusterTypes = [
        {
          name: "Strength-Focused",
          attributes: {
            strength: 0.9,     // Strong
            stealth: 0.1,      // Very low stealth
            learnability: 0.3, // Average learnability
            longevity: 0.4,    // Average longevity
          },
          energyMod: 1.2       // 20% more energy capacity
        },
        {
          name: "Stealth-Focused",
          attributes: {
            strength: 0.1,     // Very low strength
            stealth: 0.9,      // Very stealthy
            learnability: 0.3, // Average learnability
            longevity: 0.4,    // Average longevity
          },
          energyMod: 0.9       // 10% less energy capacity
        },
        {
          name: "Resilient",
          attributes: {
            strength: 0.5,     // Average strength
            stealth: 0.5,      // Average stealth
            learnability: 0.1, // Very low learnability (resilient)
            longevity: 0.8,    // High longevity
          },
          energyMod: 1.1       // 10% more energy capacity
        },
        {
          name: "Balanced",
          attributes: {
            strength: 0.5,     // Average strength
            stealth: 0.5,      // Average stealth
            learnability: 0.5, // Average learnability
            longevity: 0.5,    // Average longevity
          },
          energyMod: 1.0       // Normal energy capacity
        },
        {
          name: "Adaptive",
          attributes: {
            strength: 0.4,     // Slightly below average strength
            stealth: 0.4,      // Slightly below average stealth
            learnability: 0.9, // High learnability
            longevity: 0.3,    // Lower longevity
          },
          energyMod: 0.8       // 20% less energy capacity
        }
      ];
      
      // Use all cluster types for initial spawning to ensure diversity
      const clusterCount = Math.min(clusterTypes.length, count > 25 ? 5 : 3);
      const preyPerCluster = Math.floor(count / clusterCount);
      const remainder = count % clusterCount;
      
      console.info(`Spawning ${count} prey in ${clusterCount} specialized clusters:`);
      
      for (let cluster = 0; cluster < clusterCount; cluster++) {
        // Generate a cluster center
        const centerX = Math.random() * this.environmentWidth - this.environmentWidth/2;
        const centerY = Math.random() * this.environmentHeight - this.environmentHeight/2;
        
        // Get the cluster type definition
        const clusterType = clusterTypes[cluster];
        const clusterPreyCount = cluster < remainder ? preyPerCluster + 1 : preyPerCluster;
        
        //console.log(`- Cluster ${cluster+1}: ${clusterType.name} (${clusterPreyCount} prey)`);
        
        // Spawn prey in this cluster
        for (let i = 0; i < clusterPreyCount; i++) {
          // Calculate position within the cluster
          const radius = Math.random() * 80; // Cluster radius
          const angle = Math.random() * Math.PI * 2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          
          // Create prey with cluster-specific attributes + small individual variation (±10%)
          const preyAttributes = {
            strength: clusterType.attributes.strength + (Math.random() * 0.2 - 0.1),
            stealth: clusterType.attributes.stealth + (Math.random() * 0.2 - 0.1),
            learnability: clusterType.attributes.learnability + (Math.random() * 0.2 - 0.1),
            longevity: clusterType.attributes.longevity + (Math.random() * 0.2 - 0.1),
          };
          
          // Clamp values to valid range
          Object.keys(preyAttributes).forEach(key => {
            preyAttributes[key as keyof GeneticAttributes] = Math.max(0.05, Math.min(0.95, preyAttributes[key as keyof GeneticAttributes]));
          });
          
          // Apply energy modifier for this cluster type with additional random variation (±10-15%)
          const baseEnergy = Prey.DEFAULT_MAX_ENERGY * clusterType.energyMod;
          const randomVariation = 0.85 + (Math.random() * 0.3); // 0.85 to 1.15 (±15%)
          const energy = baseEnergy * randomVariation;
          
          const newPrey = new Prey(x, y, energy, preyAttributes);
          this.addPrey(newPrey);
        }
      }
      
      // The total spawned count is already updated in the addPrey method
      // No need to update it again here
      
      //console.log(`Total prey: ${this.prey.length}`);
    } else {
      // Original random spawning
      for (let i = 0; i < count; i++) {
        const x = Math.random() * this.environmentWidth - this.environmentWidth/2;
        const y = Math.random() * this.environmentHeight - this.environmentHeight/2;
        const newPrey = new Prey(x, y);
        this.addPrey(newPrey);
      }
      
      console.info(`Spawned ${count} new prey randomly. Total prey: ${this.prey.length}`);
    }
  }
  
  spawnPredators(count: number = 5, clustered: boolean = true): void {
    if (clustered) {
      // Define specialized cluster types for diverse initial predator population
      const clusterTypes = [
        {
          name: "Brute Force",
          attributes: {
            strength: 0.9,     // Very strong
            stealth: 0.1,      // Not stealthy
            learnability: 0.3, // Average learnability
            longevity: 0.5,    // Average longevity
          },
          energyMod: 1.2       // 20% more energy capacity
        },
        {
          name: "Stealthy Hunter",
          attributes: {
            strength: 0.3,     // Lower strength
            stealth: 0.9,      // Very stealthy
            learnability: 0.4, // Slightly above average learnability
            longevity: 0.4,    // Average longevity
          },
          energyMod: 0.9       // 10% less energy capacity
        },
        {
          name: "Endurance Hunter",
          attributes: {
            strength: 0.6,     // Above average strength
            stealth: 0.4,      // Below average stealth
            learnability: 0.1, // Low learnability (resilient)
            longevity: 0.9,    // Very high longevity
          },
          energyMod: 1.15      // 15% more energy capacity
        },
        {
          name: "Balanced Hunter",
          attributes: {
            strength: 0.5,     // Average strength
            stealth: 0.5,      // Average stealth
            learnability: 0.5, // Average learnability
            longevity: 0.5,    // Average longevity
          },
          energyMod: 1.0       // Normal energy capacity
        }
      ];
      
      // Use all cluster types for initial spawning to ensure diversity
      // For small predator counts, use at least 2 types
      const clusterCount = Math.min(clusterTypes.length, Math.max(2, count > 8 ? 4 : count > 4 ? 3 : 2));
      const predatorsPerCluster = Math.floor(count / clusterCount);
      const remainder = count % clusterCount;
      
      //console.log(`Spawning ${count} predators in ${clusterCount} specialized clusters:`);
      
      for (let cluster = 0; cluster < clusterCount; cluster++) {
        // Generate a cluster center
        const centerX = Math.random() * this.environmentWidth - this.environmentWidth/2;
        const centerY = Math.random() * this.environmentHeight - this.environmentHeight/2;
        
        // Get the cluster type definition
        const clusterType = clusterTypes[cluster];
        const clusterPredCount = cluster < remainder ? predatorsPerCluster + 1 : predatorsPerCluster;
        
        //console.log(`- Cluster ${cluster+1}: ${clusterType.name} (${clusterPredCount} predators)`);
        
        // Spawn predators in this cluster
        for (let i = 0; i < clusterPredCount; i++) {
          // Calculate position within the cluster
          const radius = Math.random() * 60; // Cluster radius
          const angle = Math.random() * Math.PI * 2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          
          // Create predator with cluster-specific attributes + small individual variation (±10%)
          const predatorAttributes = {
            strength: clusterType.attributes.strength + (Math.random() * 0.2 - 0.1),
            stealth: clusterType.attributes.stealth + (Math.random() * 0.2 - 0.1),
            learnability: clusterType.attributes.learnability + (Math.random() * 0.2 - 0.1),
            longevity: clusterType.attributes.longevity + (Math.random() * 0.2 - 0.1),
          };
          
          // Clamp values to valid range
          Object.keys(predatorAttributes).forEach(key => {
            predatorAttributes[key as keyof GeneticAttributes] = Math.max(0.05, Math.min(0.95, predatorAttributes[key as keyof GeneticAttributes]));
          });
          
          // Apply energy modifier for this cluster type with additional random variation (±10-15%)
          const baseEnergy = Predator.DEFAULT_MAX_ENERGY * clusterType.energyMod;
          const randomVariation = 0.85 + (Math.random() * 0.3); // 0.85 to 1.15 (±15%)
          const energy = baseEnergy * randomVariation;
          
          const newPredator = new Predator(x, y, energy, predatorAttributes);
          this.addPredator(newPredator);
        }
      }
      
      // The total spawned count is already updated in the addPredator method
      // No need to update it again here
      
      //console.log(`Total predators: ${this.predators.length}`);
    } else {
      // Original random spawning
      for (let i = 0; i < count; i++) {
        const x = Math.random() * this.environmentWidth - this.environmentWidth/2;
        const y = Math.random() * this.environmentHeight - this.environmentHeight/2;
        const newPredator = new Predator(x, y);
        this.addPredator(newPredator);
      }
      
      //console.log(`Spawned ${count} new predators randomly. Total predators: ${this.predators.length}`);
    }
  }
  
  // Method to spawn resources
  spawnResources(count: number = 20): void {
    // Check resource cap before spawning
    const maxResources = SimulationConfig.resources.limits.maxCount;
    const enforcementThreshold = maxResources * SimulationConfig.resources.limits.enforcementThreshold;
    
    // Determine how many resources we can safely add
    const availableSpace = Math.max(0, enforcementThreshold - this.resources.length);
    const actualCount = Math.min(count, availableSpace);
    
    // Spawn resources up to the limit
    for (let i = 0; i < actualCount; i++) {
      const x = Math.random() * this.environmentWidth - this.environmentWidth/2;
      const y = Math.random() * this.environmentHeight - this.environmentHeight/2;
      
      const resource = new Resource(x, y);
      resource.creationTime = this.days; // Set creation timestamp
      this.resources.push(resource);
    }
    
    // Update total spawned count
    this.totalSpawned.resources += actualCount;
    
    //console.log(`Spawned ${actualCount} new resources. Total resources: ${this.resources.length}`);
    
    // Alert if we hit the resource cap
    // if (actualCount < count) {
    //   console.log(`Resource cap prevented spawning ${count - actualCount} resources. Current limit: ${maxResources}`);
    // }
  }
  
  initialize(): void {
    // Clear any existing entities
    this.resources = [];
    this.prey = [];
    this.predators = [];
    
    // Reset simulation time
    this.days = 0;
    this.frameCount = 0;
    
    // Reset tracking
    this.extinctionEvents = [];
    this.totalSpawned = {
      prey: 0,
      predators: 0,
      resources: 0
    };
    
    // Create initial resources in clusters
    const resourceClusterCount = 4;
    const resourcesPerCluster = Math.floor(this.initialResourceCount / resourceClusterCount);
    
    // Respect the resource cap even during initialization
    const maxResources = SimulationConfig.resources.limits.maxCount;
    const actualInitialCount = Math.min(this.initialResourceCount, maxResources);
    
    for (let cluster = 0; cluster < resourceClusterCount; cluster++) {
      const centerX = Math.random() * this.environmentWidth - this.environmentWidth/2;
      const centerY = Math.random() * this.environmentHeight - this.environmentHeight/2;
      
      for (let i = 0; i < resourcesPerCluster; i++) {
        if (this.resources.length >= actualInitialCount) break;
        
        const radius = Math.random() * 100;
        const angle = Math.random() * Math.PI * 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        const resource = new Resource(x, y);
        resource.creationTime = this.days; // Initial resources created at day 0
        this.resources.push(resource);
      }
    }
    
    // Add remaining resources randomly up to the cap
    const remainingCount = actualInitialCount - this.resources.length;
    for (let i = 0; i < remainingCount; i++) {
      const x = Math.random() * this.environmentWidth - this.environmentWidth/2;
      const y = Math.random() * this.environmentHeight - this.environmentHeight/2;
      
      const resource = new Resource(x, y);
      resource.creationTime = this.days; // Initial resources created at day 0
      this.resources.push(resource);
    }
    
    // Update resources spawned count
    this.totalSpawned.resources += this.resources.length;
    
    // Spawn initial prey and predators with clustering
    this.spawnPrey(this.initialPreyCount, true);
    this.spawnPredators(this.initialPredatorCount, true);
    
    // Log initial conditions
    console.info("=== SIMULATION INITIALIZED ===");
    console.info("Initial Resources:", this.resources.length);
    console.info("Initial Prey:", this.prey.length);
    console.info("Initial Predators:", this.predators.length);
    console.info("Initial Prey Attributes:", this.calculateAverageAttributes(this.prey));
    console.info("Initial Predator Attributes:", this.calculateAverageAttributes(this.predators));
    
    // Reset last counts
    this.lastPreyCount = this.prey.length;
    this.lastPredatorCount = this.predators.length;
  }
  
  start(): void {
    this.isRunning = true;
  }
  
  pause(): void {
    this.isRunning = false;
  }
  
  reset(): void {
    this.initialize();
  }
  
  getStats(): SimulationStats {
    return {
      resourceCount: this.resources.length,
      preyCount: this.prey.length,
      predatorCount: this.predators.length,
      preyAttributes: this.calculateAverageAttributes(this.prey),
      predatorAttributes: this.calculateAverageAttributes(this.predators)
    };
  }
  
  private calculateAverageAttributes(creatures: Prey[] | Predator[]): AttributeStats {
    if (creatures.length === 0) {
      return {
        strength: 0,
        stealth: 0,
        learnability: 0,
        longevity: 0
      };
    }
    
    const totals = creatures.reduce((acc, creature) => {
      return {
        strength: acc.strength + creature.attributes.strength,
        stealth: acc.stealth + creature.attributes.stealth,
        learnability: acc.learnability + creature.attributes.learnability,
        longevity: acc.longevity + creature.attributes.longevity
      };
    }, {
      strength: 0,
      stealth: 0,
      learnability: 0,
      longevity: 0
    });
    
    return {
      strength: parseFloat((totals.strength / creatures.length).toFixed(2)),
      stealth: parseFloat((totals.stealth / creatures.length).toFixed(2)),
      learnability: parseFloat((totals.learnability / creatures.length).toFixed(2)),
      longevity: parseFloat((totals.longevity / creatures.length).toFixed(2))
    };
  }
  
  getAllEntities(): Entity[] {
    return [
      ...this.resources,
      ...this.prey,
      ...this.predators
    ];
  }
  
  async update(deltaTime: number): Promise<void> {
    if (!this.isRunning) return;
    
    try {
      // Update all prey - passing predator information and other nearby prey
      this.prey.forEach(prey => {
        try {
          // Find nearby prey for this individual (for anti-clumping)
          const nearbyPrey = this.prey.filter(otherPrey => 
            otherPrey !== prey && 
            prey.position.distanceTo(otherPrey.position) < 50 // Consider prey within 50 units
          );
          
          // Update prey with all relevant context
          prey.update(deltaTime, this.resources, this.predators, nearbyPrey);
        } catch (error) {
          console.error("Error updating prey:", error);
        }
      });
      
      // Update all predators
      this.predators.forEach(predator => {
        try {
          // Find nearby predators for anti-clumping
          const nearbyPredators = this.predators.filter(otherPredator => 
            otherPredator !== predator && 
            predator.position.distanceTo(otherPredator.position) < 50
          );
          
          predator.update(deltaTime, this.prey, nearbyPredators);
        } catch (error) {
          console.error("Error updating predator:", error);
        }
      });
    } catch (error) {
      console.error("Error in simulation update:", error);
    }
    
    // Handle species conversion (evolutionary mutations between species)
    await this.handleSpeciesConversion().catch(error => {
      console.error("Error in species conversion:", error);
    });
    
    // Handle resource consumption
    this.handleResourceConsumption();
    
    // Handle predation
    this.handlePredation();
    
    // Handle reproduction
    this.handleReproduction();
    
    // Handle learning interactions between creatures
    this.handleLearning();
    
    // Remove dead entities
    this.removeDeadEntities();
    
    // Regenerate resources
    this.regenerateResources();
    
    // Check and log extinctions
    this.checkForExtinction();
    
    // Update day count
    this.frameCount++;
    if (this.frameCount >= this.framesPerDay) {
      this.days++;
      this.frameCount = 0;
      
      // Check if a new season should start
      this.checkSeasonsAndSpawnResources();
    }
  }
  
  private checkSeasonsAndSpawnResources(): void {
    // Check if we're at the start of a new season
    if (this.days % this.seasonLength === 0) {
      this.resourceBloom = true;
      
      //console.log(`=== Day ${this.days}: MAJOR SEASONAL RESOURCE BLOOM ===`);
      
      // Check resource cap before spawning
      const maxResources = SimulationConfig.resources.limits.maxCount;
      const enforcementThreshold = maxResources * SimulationConfig.resources.limits.enforcementThreshold;
      const availableSpace = Math.max(0, enforcementThreshold - this.resources.length);
      
      // Calculate how many resources to spawn based on available space
      const desiredAmount = this.seasonResourceSpawnAmount;
      const actualAmount = Math.min(desiredAmount, availableSpace);
      const resourcesSpawned = Math.max(0, actualAmount);
      
      // if (resourcesSpawned < desiredAmount) {
      //   //console.log(`Resource cap limited bloom to ${resourcesSpawned} resources instead of ${desiredAmount}`);
      // }
      
      if (resourcesSpawned > 0) {
        // Spawn resource clusters based on config
        const clusterCount = SimulationConfig.resources.bloom.clusterCount;
        const resourcesPerCluster = Math.floor(resourcesSpawned / clusterCount);
        
        // Create dense resource clusters in random locations
        for (let cluster = 0; cluster < clusterCount; cluster++) {
          // Choose a random location for the cluster
          const centerX = Math.random() * this.environmentWidth - this.environmentWidth/2;
          const centerY = Math.random() * this.environmentHeight - this.environmentHeight/2;
          
          // Create a primary dense cluster at the center
          const primaryClusterSize = Math.floor(resourcesPerCluster * SimulationConfig.resources.bloom.primaryDensity);
          for (let i = 0; i < primaryClusterSize; i++) {
            // Break if we've reached the resource cap
            if (this.resources.length >= enforcementThreshold) break;
            
            // Very tight clustering for primary resources
            const radius = Math.random() * SimulationConfig.resources.bloom.primaryClusterRadius;
            const angle = Math.random() * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            // Seasonal resources have much more energy during these major blooms
            const resource = new Resource(x, y, Resource.DEFAULT_ENERGY * SimulationConfig.resources.bloom.primaryEnergyMultiplier);
            resource.creationTime = this.days; // Set creation timestamp
            this.resources.push(resource);
          }
          
          // Create a secondary sparse cluster surrounding the primary cluster
          const secondaryClusterSize = resourcesPerCluster - primaryClusterSize;
          for (let i = 0; i < secondaryClusterSize; i++) {
            // Break if we've reached the resource cap
            if (this.resources.length >= enforcementThreshold) break;
            
            // Wider spread for secondary resources
            const radius = SimulationConfig.resources.bloom.primaryClusterRadius + 
                          (Math.random() * (SimulationConfig.resources.bloom.secondaryClusterRadius - 
                                           SimulationConfig.resources.bloom.primaryClusterRadius));
            const angle = Math.random() * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            // Secondary resources have less energy than primary but still more than normal
            const resource = new Resource(x, y, Resource.DEFAULT_ENERGY * SimulationConfig.resources.bloom.secondaryEnergyMultiplier);
            resource.creationTime = this.days; // Set creation timestamp
            this.resources.push(resource);
          }
        }
        
        // Count actual resources spawned
        const actualSpawned = Math.min(resourcesSpawned, enforcementThreshold - (this.resources.length - resourcesSpawned));
        this.totalSpawned.resources += actualSpawned;
      }
      
      // Announce the bloom in the console with more detail
      //console.log(`Spawned resources in ${SimulationConfig.resources.bloom.clusterCount} rich clusters. Total resources: ${this.resources.length}`);
      //console.log(`Primary resource energy: ${Resource.DEFAULT_ENERGY * SimulationConfig.resources.bloom.primaryEnergyMultiplier}`);
      //console.log(`Secondary resource energy: ${Resource.DEFAULT_ENERGY * SimulationConfig.resources.bloom.secondaryEnergyMultiplier}`);
      
      // Get bloom duration from config
      const bloomDuration = SimulationConfig.resources.bloom.bloomDuration;
      //console.log(`Resource bloom will last for ${bloomDuration} days`);
      
      setTimeout(() => {
        this.resourceBloom = false;
        //console.log(`=== Day ${this.days}: Resource bloom has ended ===`);
      }, bloomDuration * this.framesPerDay * 1000 / 60); // Convert to milliseconds (assuming 60fps)
    }
  }
  
  // Getter for current day
  getDays(): number {
    return this.days;
  }
  
  // Getter for extinction events
  getExtinctionEvents(): {type: string, day: number}[] {
    return [...this.extinctionEvents]; // Return a copy
  }
  
  // Getter for total spawned counts
  getTotalSpawned(): {prey: number, predators: number, resources: number} {
    return {...this.totalSpawned}; // Return a copy
  }
  
  // Getter for resource bloom status
  isResourceBloom(): boolean {
    return this.resourceBloom;
  }
  
  private checkForExtinction(): void {
    // Check if prey went extinct
    if (this.lastPreyCount > 0 && this.prey.length === 0) {
      // Create extinction event with counts at time of extinction
      this.extinctionEvents.push({
        type: 'prey',
        day: this.days,
        predatorCount: this.predators.length,
        resourceCount: this.resources.length
      });
      
      console.info("=== PREY EXTINCTION ===");
      console.info("Day:", this.days);
      console.info("Final Predator Count:", this.predators.length);
      console.info("Final Resource Count:", this.resources.length);
      console.info("Final Predator Attributes:", this.calculateAverageAttributes(this.predators));
    }
    
    // Check if predators went extinct
    if (this.lastPredatorCount > 0 && this.predators.length === 0) {
      // Create extinction event with counts at time of extinction
      this.extinctionEvents.push({
        type: 'predator',
        day: this.days,
        preyCount: this.prey.length,
        resourceCount: this.resources.length
      });
      
      console.info("=== PREDATOR EXTINCTION ===");
      console.info("Day:", this.days);
      console.info("Final Prey Count:", this.prey.length);
      console.info("Final Resource Count:", this.resources.length);
      console.info("Final Prey Attributes:", this.calculateAverageAttributes(this.prey));
    }
    
    // Update last counts
    this.lastPreyCount = this.prey.length;
    this.lastPredatorCount = this.predators.length;
  }
  
  private handleResourceConsumption(): void {
    for (const prey of this.prey) {
      // Only hunt for food if the prey isn't close to being full
      // Prey will only consume resources if they are below 90% of their max energy
      if (prey.energy < prey.maxEnergy * 0.9) {
        // Check if any predators are nearby - if so, don't consume resources (prioritize escape)
        const nearbyPredator = this.isPredatorNearby(prey, 70); // Check within 70 units
        
        if (!nearbyPredator) {
          for (let i = this.resources.length - 1; i >= 0; i--) {
            const resource = this.resources[i];
            const distance = prey.position.distanceTo(resource.position);
            
            if (distance < 10) { // Consumption range
              prey.consumeResource(resource);
              this.resources.splice(i, 1);
              break; // Each prey can only consume one resource per update
            }
          }
        }
      } else {
        // If they're mostly full, they'll wander more randomly instead of seeking food
        // This is handled implicitly since they won't be actively seeking resources
        // but will continue their current movement patterns
      }
    }
  }
  
  // Helper method to check if any predators are near a prey
  private isPredatorNearby(prey: Prey, distance: number): boolean {
    for (const predator of this.predators) {
      if (prey.position.distanceTo(predator.position) < distance) {
        return true;
      }
    }
    return false;
  }
  
  private handlePredation(): void {
    for (const predator of this.predators) {
      // Predators only hunt if they're below 80% of their max energy
      // They have a lower threshold than prey since hunting requires more energy
      // and they should conserve energy when relatively full
      if (predator.energy < predator.maxEnergy * 0.8) {
        for (let i = this.prey.length - 1; i >= 0; i--) {
          const prey = this.prey[i];
          const distance = predator.position.distanceTo(prey.position);
          
          if (distance < 15) { // Capture range
            // First check: can predator catch the prey? (strength-based)
            if (predator.canCatchPrey(prey)) {
              // Second check: can prey escape using stealth? (stealth-based)
              if (!prey.canEscapeWithStealth(predator)) {
                predator.consumePrey(prey);
                prey.die();
                break; // Each predator can only catch one prey per update
              } else {
                // Prey escapes using stealth!
                //console.log("Prey escaped using stealth!");
                
                // Give the prey a speed boost to escape (temporary)
                const escapeDirection = prey.position.clone().sub(predator.position).normalize();
                prey.velocity.copy(escapeDirection).multiplyScalar(prey.speed * 2);
                
                break; // Predator fails catch attempt
              }
            }
          }
        }
      } else {
        // If predator is mostly full, it will be less aggressive in pursuing prey
        // It might still chase prey that gets very close but with less persistence
        // This is handled in the Predator.update() method - we should adjust detection there
      }
    }
  }
  
  private handleReproduction(): void {
    // Handle prey reproduction
    const newPrey: Prey[] = [];
    for (const prey of this.prey) {
      if (prey.canReproduce()) {
        const offspring = prey.reproduce();
        newPrey.push(offspring);
      }
    }
    
    // Add new prey to the simulation and update counts
    for (const prey of newPrey) {
      this.addPrey(prey);
    }
    
    if (newPrey.length > 0) {
      //console.log(`${newPrey.length} new prey born through reproduction. Total spawned: ${this.totalSpawned.prey}`);
    }
    
    // DEBUG: Monitor predator energy levels when no prey exist
    if (this.prey.length === 0 && this.predators.length > 0) {
      // Calculate and log average energy
      const energyLevels = this.predators.map(p => p.energy / p.maxEnergy);
      // const averageEnergy = energyLevels.reduce((sum, e) => sum + e, 0) / energyLevels.length;
      // const minEnergy = Math.min(...energyLevels);
      // const maxEnergy = Math.max(...energyLevels);
      
      // console.log(`ENERGY MONITOR - Day ${this.days} - Predators: ${this.predators.length}`);
      // console.log(`  Average Energy: ${(averageEnergy * 100).toFixed(1)}%`);
      // console.log(`  Min Energy: ${(minEnergy * 100).toFixed(1)}%, Max Energy: ${(maxEnergy * 100).toFixed(1)}%`);
      
      // Count predators with various energy levels
      // const criticallyLow = energyLevels.filter(e => e < 0.1).length;
      // const veryLow = energyLevels.filter(e => e >= 0.1 && e < 0.2).length;
      // const low = energyLevels.filter(e => e >= 0.2 && e < 0.5).length;
      // const medium = energyLevels.filter(e => e >= 0.5 && e < 0.75).length;
      // const high = energyLevels.filter(e => e >= 0.75).length;
      
      // console.log(`  Energy Distribution:`);
      // console.log(`    <10%: ${criticallyLow}, 10-20%: ${veryLow}, 20-50%: ${low}, 50-75%: ${medium}, >75%: ${high}`);
    }
    
    // Handle predator reproduction
    const newPredators: Predator[] = [];
    let lowEnergyChecks = 0;
    
    for (const predator of this.predators) {
      // Additional debug log for checking reproduction probability
      if (predator.energy / predator.maxEnergy < 0.2) {
        lowEnergyChecks++;
        // Log only for the first few low-energy predators to avoid console spam
        // if (lowEnergyChecks <= 3) {
        //   const energyPercentage = (predator.energy / predator.maxEnergy * 100).toFixed(1);
        //   //console.log(`DEBUG: Low energy predator (${energyPercentage}%) being checked for reproduction`);
        // }
      }
      
      if (predator.canReproduce()) {
        // const energyPercentage = (predator.energy / predator.maxEnergy * 100).toFixed(1);
        // console.info(`*** Predator with ${energyPercentage}% energy REPRODUCING ***`);
        
        const offspring = predator.reproduce();
        newPredators.push(offspring);
      }
    }
    
    // Add new predators to the simulation and update counts
    for (const predator of newPredators) {
      this.addPredator(predator);
    }
    
    if (newPredators.length > 0) {
      //console.log(`${newPredators.length} new predators born through reproduction. Total spawned: ${this.totalSpawned.predators}`);
    }
  }
  
  // Helper method to add a prey to the simulation and update counts
  private addPrey(prey: Prey): void {
    this.prey.push(prey);
    this.totalSpawned.prey += 1;
  }
  
  // Helper method to add a predator to the simulation and update counts
  private addPredator(predator: Predator): void {
    this.predators.push(predator);
    this.totalSpawned.predators += 1;
  }
  
  private removeDeadEntities(): void {
    // Handle dead prey - spawn resources based on their remaining energy
    for (let i = this.prey.length - 1; i >= 0; i--) {
      if (this.prey[i].isDead) {
        // Convert 70% of prey's max energy to resources when they die
        const energyToConvert = this.prey[i].maxEnergy * 0.7;
        const resourceCount = Math.ceil(energyToConvert / Resource.DEFAULT_ENERGY);
        
        // Spawn resources near the dead prey's location
        this.spawnResourcesAtLocation(
          this.prey[i].position.x, 
          this.prey[i].position.y, 
          resourceCount,
          20 // Spread within 20 units
        );
        
        // Remove the dead prey
        this.prey.splice(i, 1);
      }
    }
    
    // Handle dead predators - spawn more resources as they're larger creatures
    for (let i = this.predators.length - 1; i >= 0; i--) {
      if (this.predators[i].isDead) {
        // Convert 70% of predator's max energy to resources when they die
        const energyToConvert = this.predators[i].maxEnergy * 0.7;
        const resourceCount = Math.ceil(energyToConvert / Resource.DEFAULT_ENERGY);
        
        // Spawn resources near the dead predator's location
        this.spawnResourcesAtLocation(
          this.predators[i].position.x, 
          this.predators[i].position.y, 
          resourceCount,
          30 // Spread within 30 units
        );
        
        // Remove the dead predator
        this.predators.splice(i, 1);
      }
    }
  }
  
  // Helper method to spawn resources around a location
  private spawnResourcesAtLocation(x: number, y: number, count: number, spread: number): void {
    // Check resource cap before spawning
    const maxResources = SimulationConfig.resources.limits.maxCount;
    const enforcementThreshold = maxResources * SimulationConfig.resources.limits.enforcementThreshold;
    
    // Determine how many resources we can safely add
    const availableSpace = Math.max(0, enforcementThreshold - this.resources.length);
    const actualCount = Math.min(count, availableSpace);
    
    for (let i = 0; i < actualCount; i++) {
      // Calculate position with random spread around the death location
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * spread;
      const resourceX = x + Math.cos(angle) * distance;
      const resourceY = y + Math.sin(angle) * distance;
      
      // Create the new resource and set its creation time
      const resource = new Resource(resourceX, resourceY);
      resource.creationTime = this.days; // Set creation timestamp
      this.resources.push(resource);
      this.totalSpawned.resources++;
    }
  }
  
  private handleLearning(): void {
    // Learning process for prey
    this.handleCreatureLearning(this.prey);
    
    // Learning process for predators
    this.handleCreatureLearning(this.predators);
  }
  
  private async handleSpeciesConversion(): Promise<void> {
    // Skip if species conversion is disabled
    if (!SimulationConfig.speciesConversion.enabled) return;
    
    // Log conversion attempt
    //console.log(`\n=== CHECKING FOR SPECIES CONVERSIONS (Day ${this.days}) ===`);
    //console.log(`Current populations - Prey: ${this.prey.length}, Predators: ${this.predators.length}`);
    
    // Create a population stats object for conversion checks
    const populationStats = {
      prey: this.prey.length,
      predators: this.predators.length
    };
    
    // Check which prey are near predators (used for isolation check)
    const preyNearPredatorMap = new Map<Prey, boolean>();
    
    // Generate data for all prey
    this.prey.forEach(prey => {
      // Check if any predators are nearby
      const nearPredator = this.predators.some(predator => 
        prey.position.distanceTo(predator.position) < 60 // Larger detection radius
      );
      preyNearPredatorMap.set(prey, nearPredator);
    });
    
    // Check for new prey → predator conversions and immediately handle them
    // We'll collect all newly created predators to add them at once
    const newPredators: Predator[] = [];
    const conversionPromises: Promise<void>[] = [];
    
    // Only check a subset of prey for conversion to reduce performance impact
    const maxPreyToCheck = Math.min(20, this.prey.length);
    const preyToCheck = [];
    
    // First, prioritize prey with extreme traits (high strength/stealth)
    // Use the actual threshold from config
    const preyThreshold = SimulationConfig.speciesConversion.traitInfluence.prey.traitThreshold;
    const potentialPredators = this.prey
      .filter(prey => {
        const avgTraits = (prey.attributes.strength + prey.attributes.stealth) / 2;
        return avgTraits > preyThreshold;
      })
      .sort((a, b) => (b.attributes.strength + b.attributes.stealth) - (a.attributes.strength + a.attributes.stealth));
    
    // Add the strongest prey first (at most 10)
    preyToCheck.push(...potentialPredators.slice(0, 10));
    
    // Fill remaining slots with random prey
    while (preyToCheck.length < maxPreyToCheck && this.prey.length > preyToCheck.length) {
      const randomPrey = this.prey[Math.floor(Math.random() * this.prey.length)];
      if (!preyToCheck.includes(randomPrey)) {
        preyToCheck.push(randomPrey);
      }
    }
    
    // Process prey conversions
    for (const prey of preyToCheck) {
      // Find nearby prey for conversion check (very close)
      const nearbyPrey = this.prey.filter(otherPrey => 
        otherPrey !== prey && 
        prey.position.distanceTo(otherPrey.position) < 15 // Close distance for contact
      );
      
      // Get whether this prey has recent predator contact
      const nearPredator = preyNearPredatorMap.get(prey) || false;
      
      // No need for special logging - let the natural conversion process work
      
      // Create a promise for this conversion check
      const conversionPromise = prey.checkSpeciesConversion(nearbyPrey, populationStats, nearPredator)
        .then(convertedPredator => {
          // If a new predator was created, collect it to add to the simulation
          if (convertedPredator) {
            console.info(`CONVERSION SUCCESS: Prey ${prey.id} converted to predator ${convertedPredator.id}`);
            newPredators.push(convertedPredator as Predator);
          }
        })
        .catch(error => {
          console.error('Error during prey conversion:', error);
        });
      
      conversionPromises.push(conversionPromise);
    }
    
    // Wait for all prey conversions to complete
    await Promise.all(conversionPromises);
    
    // Check which predators are near prey (used for isolation check)
    const predatorNearPreyMap = new Map<Predator, boolean>();
    
    // Only check a subset of predators for conversion
    const maxPredatorsToCheck = Math.min(20, this.predators.length);
    const predatorSample = [];
    
    // First, prioritize predators with extreme traits (low strength/stealth)
    // Use the actual threshold from config
    const predatorThreshold = SimulationConfig.speciesConversion.traitInfluence.predator.traitThreshold;
    const potentialPrey = this.predators
      .filter(predator => {
        const avgTraits = (predator.attributes.strength + predator.attributes.stealth) / 2;
        return avgTraits < predatorThreshold;
      })
      .sort((a, b) => (a.attributes.strength + a.attributes.stealth) - (b.attributes.strength + b.attributes.stealth));
    
    // Add the weakest predators first (at most 10) 
    predatorSample.push(...potentialPrey.slice(0, 10));
    
    // Fill remaining slots with random predators
    while (predatorSample.length < maxPredatorsToCheck && this.predators.length > predatorSample.length) {
      const randomPredator = this.predators[Math.floor(Math.random() * this.predators.length)];
      if (!predatorSample.includes(randomPredator)) {
        predatorSample.push(randomPredator);
      }
    }
    
    // Prepare predator-prey contact map
    predatorSample.forEach(predator => {
      // Check if any prey are nearby
      const nearPrey = this.prey.some(prey => 
        predator.position.distanceTo(prey.position) < 60 // Larger detection radius
      );
      predatorNearPreyMap.set(predator, nearPrey);
    });
    
    // Check for new predator → prey conversions and immediately handle them
    // We'll collect all newly created prey to add them at once
    const newPrey: Prey[] = [];
    const predatorConversionPromises: Promise<void>[] = [];
    
    // Process predator conversions
    for (const predator of predatorSample) {
      // Find nearby predators for conversion check
      const nearbyPredators = this.predators.filter(otherPredator => 
        otherPredator !== predator && 
        predator.position.distanceTo(otherPredator.position) < 15 // Close distance for contact
      );
      
      // Get whether this predator has recent prey contact
      const nearPrey = predatorNearPreyMap.get(predator) || false;
      
      // Create a promise for this conversion check
      const conversionPromise = predator.checkSpeciesConversion(nearbyPredators, populationStats, nearPrey)
        .then(convertedPrey => {
          // If a new prey was created, collect it to add to the simulation
          if (convertedPrey) {
            console.log(`CONVERSION SUCCESS: Predator ${predator.id} converted to prey ${convertedPrey.id}`);
            newPrey.push(convertedPrey as Prey);
          }
        })
        .catch(error => {
          console.error('Error during predator conversion:', error);
        });
      
      predatorConversionPromises.push(conversionPromise);
    }
    
    // Wait for all predator conversions to complete
    await Promise.all(predatorConversionPromises);
    
    // Add all newly created creatures to the simulation
    if (newPredators.length > 0) {
      console.info(`Adding ${newPredators.length} newly converted predators to the simulation`);
      newPredators.forEach(predator => {
        this.addPredator(predator);
        console.info(`New Predator added: ID=${predator.id}, Position=(${predator.position.x.toFixed(1)}, ${predator.position.y.toFixed(1)})`);
      });
      console.info(`=== EVOLUTIONARY EVENT COMPLETED ===`);
      console.info(`Day ${this.days}: ${newPredators.length} prey evolved into predators!`);
      //console.log(`Current population - Prey: ${this.prey.length}, Predators: ${this.predators.length}`);
      
      // Verify the predator was actually added
      //console.log(`Predator count verification: ${this.predators.length}`);
      // if (this.predators.length > 0) {
      //   console.log(`First predator ID: ${this.predators[0].id}`);
      // }
    }
    
    if (newPrey.length > 0) {
      console.info(`Adding ${newPrey.length} newly converted prey to the simulation`);
      newPrey.forEach(prey => {
        this.addPrey(prey);
        console.info(`New Prey added: ID=${prey.id}, Position=(${prey.position.x.toFixed(1)}, ${prey.position.y.toFixed(1)})`);
      });
      console.info(`=== EVOLUTIONARY EVENT COMPLETED ===`);
      console.info(`Day ${this.days}: ${newPrey.length} predators evolved into prey!`);
      //console.log(`Current population - Prey: ${this.prey.length}, Predators: ${this.predators.length}`);
      
      // Verify the prey was actually added
      //console.log(`Prey count verification: ${this.prey.length}`);
    }
  }
  
  private handleCreatureLearning(creatures: Prey[] | Predator[]): void {
    if (creatures.length <= 1) return;
    
    // Each creature has a small chance to learn from others
    for (let i = 0; i < creatures.length; i++) {
      const learner = creatures[i];
      
      // Skip learning process for highly specialized creatures (preserves specialization)
      // This prevents specialized traits from being diluted through learning
      const isSpecialized = learner.attributes.strength > 0.75 || 
                            learner.attributes.stealth > 0.75 || 
                            learner.attributes.longevity > 0.75;
                            
      // Specialized creatures only learn with much lower probability
      // The higher the specialization, the less likely they are to change
      if (isSpecialized && Math.random() < 0.8) {
        continue; // Skip learning for this specialized creature 80% of the time
      }
      
      // Chance to learn based on learnability
      if (Math.random() < learner.attributes.learnability * 0.1) {
        // Find a random other creature to learn from
        const teacherIndex = Math.floor(Math.random() * creatures.length);
        if (teacherIndex !== i) {
          const teacher = creatures[teacherIndex];
          
          // Identify if the teacher has strong specialization in any attribute
          const teacherSpecializedAttributes = [];
          if (teacher.attributes.strength > 0.7) teacherSpecializedAttributes.push('strength');
          if (teacher.attributes.stealth > 0.7) teacherSpecializedAttributes.push('stealth');
          if (teacher.attributes.longevity > 0.7) teacherSpecializedAttributes.push('longevity');
          
          // Determine attribute to learn
          let attributeToLearn: 'strength' | 'stealth' | 'longevity';
          
          if (teacherSpecializedAttributes.length > 0 && Math.random() < 0.7) {
            // 70% chance to learn a specialized attribute from the teacher (if any)
            attributeToLearn = teacherSpecializedAttributes[Math.floor(Math.random() * teacherSpecializedAttributes.length)] as 'strength' | 'stealth' | 'longevity';
          } else {
            // Otherwise choose a random attribute
            const attributes = ['strength', 'stealth', 'longevity'] as const;
            attributeToLearn = attributes[Math.floor(Math.random() * attributes.length)];
          }
          
          // Calculate how much to learn
          const teacherValue = teacher.attributes[attributeToLearn];
          const learnerValue = learner.attributes[attributeToLearn];
          
          // Only learn if the difference is significant
          // This prevents regression to the mean by only learning meaningful differences
          if (Math.abs(teacherValue - learnerValue) > 0.15) {
            // Calculate learning amount - higher learning for larger differences
            const learningAmount = (teacherValue - learnerValue) * learner.attributes.learnability * 0.2;
            
            // Cap the learning to avoid huge jumps
            const cappedLearning = Math.min(Math.abs(learningAmount), 0.05) * Math.sign(learningAmount);
            
            // Apply learning
            learner.attributes[attributeToLearn] += cappedLearning;
            learner.attributes[attributeToLearn] = Math.max(0, Math.min(1, learner.attributes[attributeToLearn]));
            
            // Learning costs energy - higher cost for larger changes
            learner.energy = Math.max(0, learner.energy - (Math.abs(cappedLearning) * 10));
          }
        }
      }
    }
  }
  
  private regenerateResources(): void {
    // Handle resource decay before generating new ones
    this.processResourceDecay();
    
    // Check if we can add more resources (below max limit)
    const maxResources = SimulationConfig.resources.limits.maxCount;
    const enforcementThreshold = maxResources * SimulationConfig.resources.limits.enforcementThreshold;
    const canAddResources = this.resources.length < enforcementThreshold;
    
    // Only regenerate if prey still exist and we're below the resource cap
    if (this.prey.length > 0 && canAddResources) {
      // During resource bloom, much higher regeneration rate
      if (this.resourceBloom) {
        // 10% chance of adding a resource during bloom
        if (Math.random() < 0.1) {
          // During bloom, spawn small clusters of resources rather than individual ones
          if (Math.random() < 0.3) { // 30% chance for a mini-cluster vs individual resource
            // Spawn a small cluster of 3-5 resources
            const clusterSize = Math.floor(Math.random() * 3) + 3; // 3-5 resources
            const centerX = Math.random() * this.environmentWidth - this.environmentWidth/2;
            const centerY = Math.random() * this.environmentHeight - this.environmentHeight/2;
            
            // Spawn the cluster
            for (let i = 0; i < clusterSize; i++) {
              // Check resource cap during cluster spawning
              if (this.resources.length >= enforcementThreshold) break;
              
              const radius = Math.random() * 30; // Small cluster radius
              const angle = Math.random() * Math.PI * 2;
              const x = centerX + Math.cos(angle) * radius;
              const y = centerY + Math.sin(angle) * radius;
              
              // During bloom, resources have more energy
              const resource = new Resource(x, y, Resource.DEFAULT_ENERGY * 1.5);
              resource.creationTime = this.days; // Set creation timestamp
              this.resources.push(resource);
              this.totalSpawned.resources++;
            }
          } else {
            // Just spawn a single resource
            const x = Math.random() * this.environmentWidth - this.environmentWidth/2;
            const y = Math.random() * this.environmentHeight - this.environmentHeight/2;
            const resource = new Resource(x, y, Resource.DEFAULT_ENERGY * 1.5);
            resource.creationTime = this.days; // Set creation timestamp
            this.resources.push(resource);
            this.totalSpawned.resources++;
          }
        }
      } else {
        // Normal slow regeneration (only a small chance each frame)
        if (Math.random() < 0.005) { // Only 0.5% chance of adding a resource each frame
          const x = Math.random() * this.environmentWidth - this.environmentWidth/2;
          const y = Math.random() * this.environmentHeight - this.environmentHeight/2;
          const resource = new Resource(x, y);
          resource.creationTime = this.days; // Set creation timestamp
          this.resources.push(resource);
          this.totalSpawned.resources++;
        }
      }
      
      // Bonus resources when prey population is critically low to help them recover
      if (this.prey.length < this.initialPreyCount * 0.2 && Math.random() < 0.03) {
        // Spawn a small cluster of bonus resources to help prey recover
        const clusterSize = Math.floor(Math.random() * 3) + 2; // 2-4 resources
        const centerX = Math.random() * this.environmentWidth - this.environmentWidth/2;
        const centerY = Math.random() * this.environmentHeight - this.environmentHeight/2;
        
        for (let i = 0; i < clusterSize; i++) {
          // Check resource cap during cluster spawning
          if (this.resources.length >= enforcementThreshold) break;
          
          const radius = Math.random() * 25; // Small cluster radius
          const angle = Math.random() * Math.PI * 2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          
          // High-energy resources to help prey recover
          const resource = new Resource(x, y, Resource.DEFAULT_ENERGY * 2.0);
          resource.creationTime = this.days; // Set creation timestamp
          this.resources.push(resource);
          this.totalSpawned.resources++;
        }
      }
    } else if (this.prey.length === 0) {
      // If no prey left, resources should slowly vanish (simulate decay)
      if (this.resources.length > 0 && Math.random() < 0.1) {
        this.resources.splice(Math.floor(Math.random() * this.resources.length), 1); // Remove a random resource
      }
    }
    
    // If we're above the max limit, strictly enforce the cap by removing oldest resources
    if (this.resources.length > maxResources) {
      // Sort resources by age (oldest first)
      this.resources.sort((a, b) => a.creationTime - b.creationTime);
      
      // Remove resources until we're back to the limit
      const excessCount = this.resources.length - maxResources;
      this.resources.splice(0, excessCount); // Remove oldest resources
      
      //console.log(`Resource cap enforced: removed ${excessCount} oldest resources`);
    }
  }
  
  // Process natural decay of resources based on their age
  private processResourceDecay(): void {
    if (!SimulationConfig.resources.limits.enableDecay) return;
    
    // Check each resource for age-based decay
    for (let i = this.resources.length - 1; i >= 0; i--) {
      if (this.resources[i].shouldDecay(this.days)) {
        this.resources.splice(i, 1); // Remove decayed resource
      }
    }
  }
  
  // Calculate reproduction statistics for UI display
  getReproductionStats(): {prey: {ready: number, total: number}, predator: {ready: number, total: number}} {
    // Count creatures ready to reproduce
    let preyReady = 0;
    let predatorReady = 0;
    
    // Check each prey
    this.prey.forEach(prey => {
      if (prey.canReproduce()) {
        preyReady++;
      }
    });
    
    // Check each predator
    this.predators.forEach(predator => {
      if (predator.canReproduce()) {
        predatorReady++;
      }
    });
    
    return {
      prey: {
        ready: preyReady,
        total: this.prey.length
      },
      predator: {
        ready: predatorReady,
        total: this.predators.length
      }
    };
  }
}
