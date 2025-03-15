# Toast System Implementation Guide

This guide provides step-by-step instructions for integrating the toast notification framework into the PreyLife simulation.

## Setup

1. First, import the ToastManager in your main.ts and initialize it:

```typescript
import { ToastManager } from './ui/ToastManager';

// Initialize at application startup
const toastManager = ToastManager.getInstance();
toastManager.addAnimationStyles();
```

2. Import the ToastManager, ToastType, and ToastEvent in SimulationEngine.ts:

```typescript
import { ToastManager, ToastType, ToastEvent } from '../ui/ToastManager';
```

## Integration Points in SimulationEngine

Add the following lines to display toasts at appropriate points:

### For Reproduction Events

```typescript
private handleReproduction(): void {
  // Existing code...
  
  // At the end of the method:
  if (newPrey.length > 0) {
    ToastManager.getInstance().showToast(
      ToastType.EPHEMERAL, 
      ToastEvent.PREY_BORN
    );
  }
  
  if (newPredators.length > 0) {
    ToastManager.getInstance().showToast(
      ToastType.EPHEMERAL, 
      ToastEvent.PREDATOR_BORN
    );
  }
}
```

### For Predation Events

```typescript
private handlePredation(): void {
  for (const predator of this.predators) {
    // Existing code...
    
    if (distance < 15) { // Capture range
      if (predator.canCatchPrey(prey)) {
        if (!prey.canEscapeWithStealth(predator)) {
          predator.consumePrey(prey);
          prey.die();
          
          // Add toast for prey consumption
          ToastManager.getInstance().showToast(
            ToastType.EPHEMERAL, 
            ToastEvent.PREY_CONSUMED,
            predator.position // Optional position in 3D space
          );
          
          break;
        } else {
          // Prey escapes using stealth
          // Existing code...
          
          // Add toast for prey escape
          ToastManager.getInstance().showToast(
            ToastType.EPHEMERAL, 
            ToastEvent.PREY_ESCAPED,
            prey.position // Optional position in 3D space
          );
          
          break;
        }
      }
    }
  }
}
```

### For Resource Consumption

```typescript
private handleResourceConsumption(): void {
  for (const prey of this.prey) {
    // Existing code...
    
    for (let i = this.resources.length - 1; i >= 0; i--) {
      const resource = this.resources[i];
      const distance = prey.position.distanceTo(resource.position);
      
      if (distance < 10) { // Consumption range
        prey.consumeResource(resource);
        this.resources.splice(i, 1);
        
        // Add toast for resource consumption
        ToastManager.getInstance().showToast(
          ToastType.EPHEMERAL, 
          ToastEvent.RESOURCE_CONSUMED,
          resource.position // Optional position in 3D space
        );
        
        break;
      }
    }
  }
}
```

### For Entity Death

```typescript
private removeDeadEntities(): void {
  // Handle dead prey
  let deadPreyCount = 0;
  for (let i = this.prey.length - 1; i >= 0; i--) {
    if (this.prey[i].isDead) {
      deadPreyCount++;
      // Existing code...
    }
  }
  
  // Show toast for prey deaths
  if (deadPreyCount > 0) {
    ToastManager.getInstance().showToast(
      ToastType.EPHEMERAL, 
      ToastEvent.PREY_DIED
    );
  }
  
  // Handle dead predators
  let deadPredatorCount = 0;
  for (let i = this.predators.length - 1; i >= 0; i--) {
    if (this.predators[i].isDead) {
      deadPredatorCount++;
      // Existing code...
    }
  }
  
  // Show toast for predator deaths
  if (deadPredatorCount > 0) {
    ToastManager.getInstance().showToast(
      ToastType.EPHEMERAL, 
      ToastEvent.PREDATOR_DIED
    );
  }
}
```

### For Resource Spawning

```typescript
private checkSeasonsAndSpawnResources(): void {
  // Existing code...
  
  if (this.days % this.seasonLength === 0) {
    this.resourceBloom = true;
    
    // Show info toast for resource bloom
    ToastManager.getInstance().showToast(
      ToastType.INFO, 
      ToastEvent.RESOURCE_BLOOM
    );
    
    // Rest of existing code...
  }
}

private regenerateResources(): void {
  // Existing code...
  
  // Show toast for major resource spawns only (like blooms or clusters)
  if (resourcesAdded > 10) {
    ToastManager.getInstance().showToast(
      ToastType.EPHEMERAL, 
      ToastEvent.RESOURCE_SPAWNED
    );
  }
}
```

### For Learning Events

```typescript
private handleCreatureLearning(creatures: Prey[] | Predator[]): void {
  // Existing code...
  
  for (let i = 0; i < creatures.length; i++) {
    const learner = creatures[i];
    
    // For existing learning code...
    if (learningOccurred) {
      // Determine creature type and show appropriate toast
      if (creatures[0] instanceof Prey) {
        ToastManager.getInstance().showToast(
          ToastType.EPHEMERAL, 
          ToastEvent.PREY_LEARNED,
          learner.position
        );
      } else {
        ToastManager.getInstance().showToast(
          ToastType.EPHEMERAL, 
          ToastEvent.PREDATOR_LEARNED,
          learner.position
        );
      }
    }
  }
}
```

### For Extinction Events

```typescript
private checkForExtinction(): void {
  // Existing code...
  
  if (this.lastPreyCount > 0 && this.prey.length === 0) {
    // Existing extinction handling...
    
    // Show info toast if this is the first extinction
    if (this.extinctionEvents.length === 1) {
      ToastManager.getInstance().showToast(
        ToastType.INFO, 
        ToastEvent.FIRST_EXTINCTION
      );
    }
  }
  
  if (this.lastPredatorCount > 0 && this.predators.length === 0) {
    // Existing extinction handling...
    
    // Show info toast if this is the first extinction
    if (this.extinctionEvents.length === 1) {
      ToastManager.getInstance().showToast(
        ToastType.INFO, 
        ToastEvent.FIRST_EXTINCTION
      );
    }
  }
}
```

### For Evolution Events

```typescript
private async handleSpeciesConversion(): Promise<void> {
  // Existing code...
  
  if (newPredators.length > 0 || newPrey.length > 0) {
    // This is an evolution event
    
    // Show info toast if this is the first evolution
    if (this.evolutionEvents.length === 1) {
      ToastManager.getInstance().showToast(
        ToastType.INFO, 
        ToastEvent.FIRST_EVOLUTION
      );
    }
  }
}
```

## Integration in UIController

In the `updateStats()` method, add checks for various population thresholds:

```typescript
updateStats(): void {
  // Existing code...
  
  const stats = this.simulation.getStats();
  const initialPreyCount = SimulationConfig.initialPopulation.prey;
  const initialPredatorCount = SimulationConfig.initialPopulation.predators;
  const initialResourceCount = SimulationConfig.initialPopulation.resources;
  
  // Check for high prey density
  if (stats.preyCount > initialPreyCount * 3 && !this.highPreyDensityShown) {
    ToastManager.getInstance().showToast(
      ToastType.INFO, 
      ToastEvent.HIGH_PREY_DENSITY
    );
    this.highPreyDensityShown = true;
  }
  
  // Check for high predator density
  if (stats.predatorCount > initialPredatorCount * 3 && !this.highPredatorDensityShown) {
    ToastManager.getInstance().showToast(
      ToastType.INFO, 
      ToastEvent.HIGH_PREDATOR_DENSITY
    );
    this.highPredatorDensityShown = true;
  }
  
  // Check for low resources
  if (stats.resourceCount < initialResourceCount * 0.15 && !this.lowResourceWarningShown) {
    ToastManager.getInstance().showToast(
      ToastType.INFO, 
      ToastEvent.LOW_RESOURCE_WARNING
    );
    this.lowResourceWarningShown = true;
  }
  
  // Check for specialized attributes
  const preySpecialized = 
    stats.preyAttributes.strength > 0.75 || 
    stats.preyAttributes.stealth > 0.75 || 
    stats.preyAttributes.longevity > 0.75;
    
  if (preySpecialized && !this.preySpecializedShown) {
    ToastManager.getInstance().showToast(
      ToastType.INFO, 
      ToastEvent.PREY_ATTRIBUTES_SPECIALIZED
    );
    this.preySpecializedShown = true;
  }
  
  const predatorSpecialized = 
    stats.predatorAttributes.strength > 0.75 || 
    stats.predatorAttributes.stealth > 0.75 || 
    stats.predatorAttributes.longevity > 0.75;
    
  if (predatorSpecialized && !this.predatorSpecializedShown) {
    ToastManager.getInstance().showToast(
      ToastType.INFO, 
      ToastEvent.PREDATOR_ATTRIBUTES_SPECIALIZED
    );
    this.predatorSpecializedShown = true;
  }
  
  // Track population stability
  this.populationHistory.push({
    day: this.simulation.getDays(),
    prey: stats.preyCount,
    predators: stats.predatorCount,
    resources: stats.resourceCount
  });
  
  // Limit history size
  if (this.populationHistory.length > 120) {
    this.populationHistory.shift();
  }
  
  // Check for ecosystem balance (stable for 100+ days)
  if (this.populationHistory.length > 100) {
    const isStable = this.checkEcosystemStability();
    if (isStable && !this.ecosystemBalancedShown) {
      ToastManager.getInstance().showToast(
        ToastType.INFO, 
        ToastEvent.ECOSYSTEM_BALANCED
      );
      this.ecosystemBalancedShown = true;
    }
  }
  
  // Check for ecosystem collapse warning
  if (this.populationHistory.length > 20) {
    const isUnstable = this.checkEcosystemInstability();
    if (isUnstable && !this.ecosystemCollapseWarningShown) {
      ToastManager.getInstance().showToast(
        ToastType.INFO, 
        ToastEvent.ECOSYSTEM_COLLAPSE_WARNING
      );
      this.ecosystemCollapseWarningShown = true;
    }
  }
}

// Helper method to check for ecosystem stability
private checkEcosystemStability(): boolean {
  // Last 100 days of data
  const recentHistory = this.populationHistory.slice(-100);
  
  // Check if all population values stay within ±25% of their average
  const avgPrey = recentHistory.reduce((sum, h) => sum + h.prey, 0) / recentHistory.length;
  const avgPredators = recentHistory.reduce((sum, h) => sum + h.predators, 0) / recentHistory.length;
  
  const preyStable = recentHistory.every(h => 
    h.prey > avgPrey * 0.75 && h.prey < avgPrey * 1.25
  );
  
  const predatorsStable = recentHistory.every(h => 
    h.predators > avgPredators * 0.75 && h.predators < avgPredators * 1.25
  );
  
  return preyStable && predatorsStable && avgPrey > 0 && avgPredators > 0;
}

// Helper method to check for ecosystem instability
private checkEcosystemInstability(): boolean {
  // Last 20 days of data
  const recentHistory = this.populationHistory.slice(-20);
  
  // Check for rapid decline in both populations
  const preyStart = recentHistory[0].prey;
  const preyEnd = recentHistory[recentHistory.length - 1].prey;
  const predatorStart = recentHistory[0].predators;
  const predatorEnd = recentHistory[recentHistory.length - 1].predators;
  
  const preyDecline = preyStart > 0 && preyEnd < preyStart * 0.4; // 60% decline
  const predatorDecline = predatorStart > 0 && predatorEnd < predatorStart * 0.4; // 60% decline
  
  return preyDecline && predatorDecline;
}

// Reset all flags when simulation is reset
private onResetClick(): void {
  // Existing code...
  
  // Reset flags for info toasts
  this.highPreyDensityShown = false;
  this.highPredatorDensityShown = false;
  this.lowResourceWarningShown = false;
  this.preySpecializedShown = false;
  this.predatorSpecializedShown = false;
  this.ecosystemBalancedShown = false;
  this.ecosystemCollapseWarningShown = false;
  
  // Reset ToastManager
  ToastManager.getInstance().resetInfoEvents();
  
  // Clear population history
  this.populationHistory = [];
}
```

## Handling Optional Position Parameter

When appropriate, you can pass the entity's 3D position to potentially render the toast near that position. If no position is provided, the toast will appear in the default position (top-right corner).

## Testing

1. Add some test code in main.ts to verify your toast implementation:

```typescript
// Test toasts
setTimeout(() => {
  ToastManager.getInstance().showToast(ToastType.EPHEMERAL, ToastEvent.PREY_BORN);
  
  setTimeout(() => {
    ToastManager.getInstance().showToast(ToastType.INFO, ToastEvent.FIRST_EVOLUTION);
  }, 1000);
}, 2000);
```

2. Verify that toasts appear correctly and with the proper styling
3. Verify that ephemeral toasts group identical events
4. Verify that info toasts only appear once per simulation run