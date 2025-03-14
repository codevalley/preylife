import { SimulationEngine } from './engine/SimulationEngine';
import { Renderer } from './rendering/Renderer';
import { UIController } from './ui/UIController';
import { SimulationConfig } from './config';

class Application {
  private simulation: SimulationEngine;
  private renderer: Renderer;
  private uiController: UIController;
  
  private previousTime: number = 0;
  private frameId: number = 0;
  
  constructor() {
    // Create simulation engine with config
    this.simulation = new SimulationEngine(
      SimulationConfig.initialPopulation.resources,
      SimulationConfig.initialPopulation.prey,
      SimulationConfig.initialPopulation.predators
    );
    
    // Initialize simulation
    this.simulation.initialize();
    
    // Create renderer to fill window
    const container = document.body;
    this.renderer = new Renderer(
      container, 
      window.innerWidth,
      window.innerHeight,
      this.simulation
    );
    
    // Create UI controller
    this.uiController = new UIController(this.simulation);
    
    // Update initial stats
    this.uiController.updateStats();
    
    // Start animation loop
    this.previousTime = performance.now();
    this.animate();
  }
  
  private async animate(): Promise<void> {
    this.frameId = requestAnimationFrame(this.animate.bind(this));
    
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.previousTime) / 1000; // Convert to seconds
    this.previousTime = currentTime;
    
    // Update simulation - now awaits async operations like species conversion
    await this.simulation.update(deltaTime);
    
    // Update UI statistics
    this.uiController.updateStats();
    
    // Update renderer with current entities
    this.renderer.updateEntities(this.simulation.getAllEntities());
    
    // Render scene
    this.renderer.render();
  }
  
  dispose(): void {
    cancelAnimationFrame(this.frameId);
    this.renderer.dispose();
  }
}

// Initialize application when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  const app = new Application();
  
  // Add cleanup on window unload
  window.addEventListener('beforeunload', () => {
    app.dispose();
  });
});