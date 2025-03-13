import { Entity, EntityType } from '../entities/Entity';
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
      
      console.log(`Spawning ${count} prey in ${clusterCount} specialized clusters:`);
      
      for (let cluster = 0; cluster < clusterCount; cluster++) {
        // Generate a cluster center
        const centerX = Math.random() * this.environmentWidth - this.environmentWidth/2;
        const centerY = Math.random() * this.environmentHeight - this.environmentHeight/2;
        
        // Get the cluster type definition
        const clusterType = clusterTypes[cluster];
        const clusterPreyCount = cluster < remainder ? preyPerCluster + 1 : preyPerCluster;
        
        console.log(`- Cluster ${cluster+1}: ${clusterType.name} (${clusterPreyCount} prey)`);
        
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
      
      console.log(`Total prey: ${this.prey.length}`);
    } else {
      // Original random spawning
      for (let i = 0; i < count; i++) {
        const x = Math.random() * this.environmentWidth - this.environmentWidth/2;
        const y = Math.random() * this.environmentHeight - this.environmentHeight/2;
        const newPrey = new Prey(x, y);
        this.addPrey(newPrey);
      }
      
      console.log(`Spawned ${count} new prey randomly. Total prey: ${this.prey.length}`);
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
      
      console.log(`Spawning ${count} predators in ${clusterCount} specialized clusters:`);
      
      for (let cluster = 0; cluster < clusterCount; cluster++) {
        // Generate a cluster center
        const centerX = Math.random() * this.environmentWidth - this.environmentWidth/2;
        const centerY = Math.random() * this.environmentHeight - this.environmentHeight/2;
        
        // Get the cluster type definition
        const clusterType = clusterTypes[cluster];
        const clusterPredCount = cluster < remainder ? predatorsPerCluster + 1 : predatorsPerCluster;
        
        console.log(`- Cluster ${cluster+1}: ${clusterType.name} (${clusterPredCount} predators)`);
        
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
      
      console.log(`Total predators: ${this.predators.length}`);
    } else {
      // Original random spawning
      for (let i = 0; i < count; i++) {
        const x = Math.random() * this.environmentWidth - this.environmentWidth/2;
        const y = Math.random() * this.environmentHeight - this.environmentHeight/2;
        const newPredator = new Predator(x, y);
        this.addPredator(newPredator);
      }
      
      console.log(`Spawned ${count} new predators randomly. Total predators: ${this.predators.length}`);
    }
  }
  
  // Method to spawn resources
  spawnResources(count: number = 20): void {
    for (let i = 0; i < count; i++) {
      const x = Math.random() * this.environmentWidth - this.environmentWidth/2;
      const y = Math.random() * this.environmentHeight - this.environmentHeight/2;
      this.resources.push(new Resource(x, y));
    }
    
    // Update total spawned count
    this.totalSpawned.resources += count;
    
    console.log(`Spawned ${count} new resources. Total resources: ${this.resources.length}`);
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
    
    for (let cluster = 0; cluster < resourceClusterCount; cluster++) {
      const centerX = Math.random() * this.environmentWidth - this.environmentWidth/2;
      const centerY = Math.random() * this.environmentHeight - this.environmentHeight/2;
      
      for (let i = 0; i < resourcesPerCluster; i++) {
        const radius = Math.random() * 100;
        const angle = Math.random() * Math.PI * 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        this.resources.push(new Resource(x, y));
      }
    }
    
    // Add remaining resources randomly
    const remainingResources = this.initialResourceCount - (resourceClusterCount * resourcesPerCluster);
    for (let i = 0; i < remainingResources; i++) {
      const x = Math.random() * this.environmentWidth - this.environmentWidth/2;
      const y = Math.random() * this.environmentHeight - this.environmentHeight/2;
      this.resources.push(new Resource(x, y));
    }
    
    // Update resources spawned count
    this.totalSpawned.resources += this.resources.length;
    
    // Spawn initial prey and predators with clustering
    this.spawnPrey(this.initialPreyCount, true);
    this.spawnPredators(this.initialPredatorCount, true);
    
    // Log initial conditions
    console.log("=== SIMULATION INITIALIZED ===");
    console.log("Initial Resources:", this.resources.length);
    console.log("Initial Prey:", this.prey.length);
    console.log("Initial Predators:", this.predators.length);
    console.log("Initial Prey Attributes:", this.calculateAverageAttributes(this.prey));
    console.log("Initial Predator Attributes:", this.calculateAverageAttributes(this.predators));
    
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
  
  update(deltaTime: number): void {
    if (!this.isRunning) return;
    
    // Update all prey - now passing predator information so prey can avoid them
    this.prey.forEach(prey => prey.update(deltaTime, this.resources, this.predators));
    
    // Update all predators
    this.predators.forEach(predator => predator.update(deltaTime, this.prey));
    
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
      
      console.log(`=== Day ${this.days}: MAJOR SEASONAL RESOURCE BLOOM ===`);
      
      // Spawn resource clusters based on config
      const clusterCount = SimulationConfig.resources.bloom.clusterCount;
      const resourcesPerCluster = Math.floor(this.seasonResourceSpawnAmount / clusterCount);
      
      // Create dense resource clusters in random locations
      for (let cluster = 0; cluster < clusterCount; cluster++) {
        // Choose a random location for the cluster
        const centerX = Math.random() * this.environmentWidth - this.environmentWidth/2;
        const centerY = Math.random() * this.environmentHeight - this.environmentHeight/2;
        
        // Create a primary dense cluster at the center
        const primaryClusterSize = Math.floor(resourcesPerCluster * SimulationConfig.resources.bloom.primaryDensity);
        for (let i = 0; i < primaryClusterSize; i++) {
          // Very tight clustering for primary resources
          const radius = Math.random() * SimulationConfig.resources.bloom.primaryClusterRadius;
          const angle = Math.random() * Math.PI * 2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          
          // Seasonal resources have much more energy during these major blooms
          this.resources.push(new Resource(x, y, Resource.DEFAULT_ENERGY * SimulationConfig.resources.bloom.primaryEnergyMultiplier));
        }
        
        // Create a secondary sparse cluster surrounding the primary cluster
        const secondaryClusterSize = resourcesPerCluster - primaryClusterSize;
        for (let i = 0; i < secondaryClusterSize; i++) {
          // Wider spread for secondary resources
          const radius = SimulationConfig.resources.bloom.primaryClusterRadius + 
                        (Math.random() * (SimulationConfig.resources.bloom.secondaryClusterRadius - 
                                         SimulationConfig.resources.bloom.primaryClusterRadius));
          const angle = Math.random() * Math.PI * 2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          
          // Secondary resources have less energy than primary but still more than normal
          this.resources.push(new Resource(x, y, Resource.DEFAULT_ENERGY * SimulationConfig.resources.bloom.secondaryEnergyMultiplier));
        }
      }
      
      // Update total spawned resources count
      this.totalSpawned.resources += this.seasonResourceSpawnAmount;
      
      // Announce the bloom in the console with more detail
      console.log(`Spawned ${this.seasonResourceSpawnAmount} resources in ${clusterCount} rich clusters`);
      console.log(`Primary resource energy: ${Resource.DEFAULT_ENERGY * SimulationConfig.resources.bloom.primaryEnergyMultiplier}`);
      console.log(`Secondary resource energy: ${Resource.DEFAULT_ENERGY * SimulationConfig.resources.bloom.secondaryEnergyMultiplier}`);
      
      // Get bloom duration from config
      const bloomDuration = SimulationConfig.resources.bloom.bloomDuration;
      console.log(`Resource bloom will last for ${bloomDuration} days`);
      
      setTimeout(() => {
        this.resourceBloom = false;
        console.log(`=== Day ${this.days}: Resource bloom has ended ===`);
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
      
      console.log("=== PREY EXTINCTION ===");
      console.log("Day:", this.days);
      console.log("Final Predator Count:", this.predators.length);
      console.log("Final Resource Count:", this.resources.length);
      console.log("Final Predator Attributes:", this.calculateAverageAttributes(this.predators));
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
      
      console.log("=== PREDATOR EXTINCTION ===");
      console.log("Day:", this.days);
      console.log("Final Prey Count:", this.prey.length);
      console.log("Final Resource Count:", this.resources.length);
      console.log("Final Prey Attributes:", this.calculateAverageAttributes(this.prey));
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
                console.log("Prey escaped using stealth!");
                
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
      console.log(`${newPrey.length} new prey born through reproduction. Total spawned: ${this.totalSpawned.prey}`);
    }
    
    // Handle predator reproduction
    const newPredators: Predator[] = [];
    for (const predator of this.predators) {
      if (predator.canReproduce()) {
        const offspring = predator.reproduce();
        newPredators.push(offspring);
      }
    }
    
    // Add new predators to the simulation and update counts
    for (const predator of newPredators) {
      this.addPredator(predator);
    }
    
    if (newPredators.length > 0) {
      console.log(`${newPredators.length} new predators born through reproduction. Total spawned: ${this.totalSpawned.predators}`);
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
    for (let i = 0; i < count; i++) {
      // Calculate position with random spread around the death location
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * spread;
      const resourceX = x + Math.cos(angle) * distance;
      const resourceY = y + Math.sin(angle) * distance;
      
      // Create the new resource
      this.resources.push(new Resource(resourceX, resourceY));
      this.totalSpawned.resources++;
    }
  }
  
  private handleLearning(): void {
    // Learning process for prey
    this.handleCreatureLearning(this.prey);
    
    // Learning process for predators
    this.handleCreatureLearning(this.predators);
  }
  
  private handleCreatureLearning(creatures: Prey[] | Predator[]): void {
    if (creatures.length <= 1) return;
    
    // Each creature has a small chance to learn from others
    for (let i = 0; i < creatures.length; i++) {
      const learner = creatures[i];
      
      // Chance to learn based on learnability
      if (Math.random() < learner.attributes.learnability * 0.1) {
        // Find a random other creature to learn from
        const teacherIndex = Math.floor(Math.random() * creatures.length);
        if (teacherIndex !== i) {
          const teacher = creatures[teacherIndex];
          
          // Select a random attribute to learn
          const attributes = ['strength', 'stealth', 'longevity'] as const;
          const attributeToLearn = attributes[Math.floor(Math.random() * attributes.length)];
          
          // Calculate how much to learn
          // Higher learnability = more learning
          const teacherValue = teacher.attributes[attributeToLearn];
          const learnerValue = learner.attributes[attributeToLearn];
          
          // Only learn if the teacher has a higher attribute
          if (teacherValue > learnerValue) {
            // Calculate learning amount
            const learningAmount = (teacherValue - learnerValue) * learner.attributes.learnability * 0.2;
            
            // Cap the learning to avoid huge jumps
            const cappedLearning = Math.min(learningAmount, 0.05);
            
            // Apply learning
            learner.attributes[attributeToLearn] += cappedLearning;
            
            // Learning costs energy
            learner.energy = Math.max(0, learner.energy - (cappedLearning * 10));
          }
        }
      }
    }
  }
  
  private regenerateResources(): void {
    // Only regenerate if prey still exist, otherwise let resources decay
    if (this.prey.length > 0) {
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
              const radius = Math.random() * 30; // Small cluster radius
              const angle = Math.random() * Math.PI * 2;
              const x = centerX + Math.cos(angle) * radius;
              const y = centerY + Math.sin(angle) * radius;
              
              // During bloom, resources have more energy
              this.resources.push(new Resource(x, y, Resource.DEFAULT_ENERGY * 1.5));
              this.totalSpawned.resources++;
            }
          } else {
            // Just spawn a single resource
            const x = Math.random() * this.environmentWidth - this.environmentWidth/2;
            const y = Math.random() * this.environmentHeight - this.environmentHeight/2;
            this.resources.push(new Resource(x, y, Resource.DEFAULT_ENERGY * 1.5));
            this.totalSpawned.resources++;
          }
        }
      } else {
        // Normal slow regeneration (only a small chance each frame)
        if (Math.random() < 0.005) { // Only 0.5% chance of adding a resource each frame
          const x = Math.random() * this.environmentWidth - this.environmentWidth/2;
          const y = Math.random() * this.environmentHeight - this.environmentHeight/2;
          this.resources.push(new Resource(x, y));
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
          const radius = Math.random() * 25; // Small cluster radius
          const angle = Math.random() * Math.PI * 2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          
          // High-energy resources to help prey recover
          this.resources.push(new Resource(x, y, Resource.DEFAULT_ENERGY * 2.0));
          this.totalSpawned.resources++;
        }
      }
    } else {
      // If no prey left, resources should slowly vanish (simulate decay)
      if (this.resources.length > 0 && Math.random() < 0.1) {
        this.resources.splice(Math.floor(Math.random() * this.resources.length), 1); // Remove a random resource
      }
    }
  }
}
