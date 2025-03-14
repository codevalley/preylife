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

// Check for mobile device
function isMobileDevice() {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.innerWidth <= 800 && window.innerHeight <= 900)
  );
}

// Create mobile warning overlay
function showMobileWarning() {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    color: white;
    text-align: center;
    padding: 20px;
  `;

  const warningIcon = document.createElement('div');
  warningIcon.innerHTML = `
    <svg width="80" height="80" viewBox="0 0 24 24" fill="#ffcc00">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
    </svg>
  `;
  
  const title = document.createElement('h2');
  title.textContent = 'Mobile Not Supported';
  title.style.marginTop = '20px';
  
  const message = document.createElement('p');
  message.textContent = 'This simulation requires a desktop browser with a larger screen. Please visit on a desktop computer for the full experience.';
  message.style.margin = '10px 0 20px 0';
  message.style.maxWidth = '600px';
  
  const signature = document.createElement('p');
  signature.innerHTML = 'Find out more: <a href="https://twitter.com/nyn" style="color: #1DA1F2; text-decoration: none;">@nyn</a>';
  signature.style.marginTop = '30px';
  signature.style.fontSize = '14px';
  
  overlay.appendChild(warningIcon);
  overlay.appendChild(title);
  overlay.appendChild(message);
  overlay.appendChild(signature);
  
  document.body.appendChild(overlay);
}

// Initialize application when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  // Check if on mobile device
  if (isMobileDevice()) {
    showMobileWarning();
    return; // Don't initialize the application on mobile
  }
  
  // Initialize on desktop
  const app = new Application();
  
  // Add cleanup on window unload
  window.addEventListener('beforeunload', () => {
    app.dispose();
  });
});