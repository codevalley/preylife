import { SimulationEngine } from '../engine/SimulationEngine';
import { DashboardPanel } from './DashboardPanel';

export class UIController {
  // Dashboard panels
  private controlPanel: DashboardPanel;
  private populationPanel: DashboardPanel;
  
  // Control buttons
  private startButton: HTMLButtonElement;
  private pauseButton: HTMLButtonElement;
  private resetButton: HTMLButtonElement;
  
  // Spawn buttons
  private spawnPreyButton: HTMLButtonElement;
  private spawnPredatorButton: HTMLButtonElement;
  private spawnResourceButton: HTMLButtonElement;
  
  // Dashboard elements
  private preyCountElement: HTMLElement;
  private predatorCountElement: HTMLElement;
  private resourceCountElement: HTMLElement;
  private daysElement: HTMLElement;
  private extinctionsElement: HTMLElement;
  
  // Total spawned elements
  private preySpawnedElement: HTMLElement;
  private predatorSpawnedElement: HTMLElement;
  private resourceSpawnedElement: HTMLElement;
  
  constructor(private simulation: SimulationEngine) {
    const uiContainer = document.getElementById('ui-container') as HTMLElement;
    
    // Create dashboard panels
    this.controlPanel = new DashboardPanel('Simulation Controls', 'control', uiContainer);
    this.populationPanel = new DashboardPanel('Population Stats', 'population', uiContainer);
    
    // Set up control panel
    const controlContent = this.controlPanel.getContentElement();
    controlContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
        <button id="start-btn" style="flex: 1; margin-right: 5px;">Start</button>
        <button id="pause-btn" style="flex: 1; margin-right: 5px;">Pause</button>
        <button id="reset-btn" style="flex: 1;">Reset</button>
      </div>
      <div style="margin-bottom: 15px;">
        <div style="margin-bottom: 5px; display: flex; justify-content: space-between;">
          <span>Day:</span>
          <span id="days-count">0</span>
        </div>
        <div style="margin-bottom: 5px; display: flex; justify-content: space-between;">
          <span>Extinctions:</span>
          <span id="extinctions-count">0</span>
        </div>
        <div id="resource-bloom" style="display: none; background-color: rgba(85, 204, 85, 0.2); padding: 5px; text-align: center; border-radius: 4px; margin-top: 5px; color: #55cc55; font-weight: bold;">
          Resource Bloom Active!
        </div>
      </div>
      <div id="extinction-history" style="font-size: 12px; color: #888; margin-top: 10px;">
      </div>
    `;
    
    // Set up population panel
    const populationContent = this.populationPanel.getContentElement();
    populationContent.innerHTML = `
      <div class="population-grid" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
        <!-- Prey Box -->
        <div style="border: 1px solid #5588ff; border-radius: 4px; padding: 8px;">
          <div style="font-weight: bold; color: #5588ff; margin-bottom: 5px; font-size: 14px;">Prey</div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>Active:</span>
            <span id="prey-count" style="color: #5588ff; font-weight: bold;">0</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Total:</span>
            <span id="prey-spawned" style="color: #5588ff;">0</span>
          </div>
          <button id="spawn-prey-btn" style="width: 100%; background-color: #5588ff; font-size: 12px;">Spawn 10</button>
        </div>
        
        <!-- Predator Box -->
        <div style="border: 1px solid #ff5555; border-radius: 4px; padding: 8px;">
          <div style="font-weight: bold; color: #ff5555; margin-bottom: 5px; font-size: 14px;">Predators</div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>Active:</span>
            <span id="predator-count" style="color: #ff5555; font-weight: bold;">0</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Total:</span>
            <span id="predator-spawned" style="color: #ff5555;">0</span>
          </div>
          <button id="spawn-predator-btn" style="width: 100%; background-color: #ff5555; font-size: 12px;">Spawn 5</button>
        </div>
        
        <!-- Resource Box -->
        <div style="border: 1px solid #55cc55; border-radius: 4px; padding: 8px;">
          <div style="font-weight: bold; color: #55cc55; margin-bottom: 5px; font-size: 14px;">Resources</div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>Active:</span>
            <span id="resource-count" style="color: #55cc55; font-weight: bold;">0</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Total:</span>
            <span id="resource-spawned" style="color: #55cc55;">0</span>
          </div>
          <button id="spawn-resource-btn" style="width: 100%; background-color: #55cc55; font-size: 12px;">Spawn 20</button>
        </div>
      </div>
    `;
    
    // Get control buttons
    this.startButton = document.getElementById('start-btn') as HTMLButtonElement;
    this.pauseButton = document.getElementById('pause-btn') as HTMLButtonElement;
    this.resetButton = document.getElementById('reset-btn') as HTMLButtonElement;
    
    // Get spawn buttons
    this.spawnPreyButton = document.getElementById('spawn-prey-btn') as HTMLButtonElement;
    this.spawnPredatorButton = document.getElementById('spawn-predator-btn') as HTMLButtonElement;
    this.spawnResourceButton = document.getElementById('spawn-resource-btn') as HTMLButtonElement;
    
    // Get dashboard elements
    this.preyCountElement = document.getElementById('prey-count') as HTMLElement;
    this.predatorCountElement = document.getElementById('predator-count') as HTMLElement;
    this.resourceCountElement = document.getElementById('resource-count') as HTMLElement;
    this.daysElement = document.getElementById('days-count') as HTMLElement;
    this.extinctionsElement = document.getElementById('extinctions-count') as HTMLElement;
    
    // Get total spawned elements
    this.preySpawnedElement = document.getElementById('prey-spawned') as HTMLElement;
    this.predatorSpawnedElement = document.getElementById('predator-spawned') as HTMLElement;
    this.resourceSpawnedElement = document.getElementById('resource-spawned') as HTMLElement;
    
    // Set up event listeners
    this.startButton.addEventListener('click', this.onStartClick.bind(this));
    this.pauseButton.addEventListener('click', this.onPauseClick.bind(this));
    this.resetButton.addEventListener('click', this.onResetClick.bind(this));
    this.spawnPreyButton.addEventListener('click', this.onSpawnPreyClick.bind(this));
    this.spawnPredatorButton.addEventListener('click', this.onSpawnPredatorClick.bind(this));
    this.spawnResourceButton.addEventListener('click', this.onSpawnResourceClick.bind(this));
  }
  
  private onStartClick(): void {
    this.simulation.start();
  }
  
  private onPauseClick(): void {
    this.simulation.pause();
  }
  
  private onResetClick(): void {
    this.simulation.reset();
    this.updateStats();
  }
  
  private onSpawnPreyClick(): void {
    this.simulation.spawnPrey(10);
    this.updateStats();
  }
  
  private onSpawnPredatorClick(): void {
    this.simulation.spawnPredators(5);
    this.updateStats();
  }
  
  private onSpawnResourceClick(): void {
    this.simulation.spawnResources(20);
    this.updateStats();
  }
  
  updateStats(): void {
    const stats = this.simulation.getStats();
    const days = this.simulation.getDays();
    const totalSpawned = this.simulation.getTotalSpawned();
    const extinctionEvents = this.simulation.getExtinctionEvents();
    const resourceBloom = this.simulation.isResourceBloom();
    
    // Update population counts
    this.preyCountElement.textContent = stats.preyCount.toString();
    this.predatorCountElement.textContent = stats.predatorCount.toString();
    this.resourceCountElement.textContent = stats.resourceCount.toString();
    
    // Update days
    this.daysElement.textContent = days.toString();
    
    // Update extinctions
    this.extinctionsElement.textContent = extinctionEvents.length.toString();
    
    // Update total spawned
    this.preySpawnedElement.textContent = totalSpawned.prey.toString();
    this.predatorSpawnedElement.textContent = totalSpawned.predators.toString();
    this.resourceSpawnedElement.textContent = totalSpawned.resources.toString();
    
    // Update resource bloom status
    const resourceBloomElement = document.getElementById('resource-bloom');
    if (resourceBloomElement) {
      resourceBloomElement.style.display = resourceBloom ? 'block' : 'none';
    }
    
    // Update extinction history
    const extinctionHistoryElement = document.getElementById('extinction-history');
    if (extinctionHistoryElement) {
      let historyHTML = '';
      
      if (extinctionEvents.length > 0) {
        extinctionEvents.forEach(event => {
          const color = event.type === 'prey' ? '#5588ff' : '#ff5555';
          historyHTML += `<div style="margin-bottom: 3px; font-size: 11px;">
            <span style="color: ${color};">${event.type.charAt(0).toUpperCase() + event.type.slice(1)}</span> extinction on day ${event.day}
          </div>`;
        });
      }
      
      extinctionHistoryElement.innerHTML = historyHTML;
    }
    
    // Add resource box special effect during bloom
    const resourceBox = this.resourceCountElement.closest('div').parentElement;
    if (resourceBox) {
      if (resourceBloom) {
        resourceBox.style.boxShadow = '0 0 10px #55cc55';
        resourceBox.style.transition = 'box-shadow 0.5s';
      } else {
        resourceBox.style.boxShadow = 'none';
      }
    }
  }
}