import { SimulationEngine } from '../engine/SimulationEngine';
import { DashboardPanel } from './DashboardPanel';

export class UIController {
  // Dashboard panels
  private controlPanel: DashboardPanel;
  private populationPanel: DashboardPanel;
  
  // Control buttons
  private playPauseButton: HTMLButtonElement;
  private resetButton: HTMLButtonElement;
  
  // Simulation state
  private isSimulationRunning: boolean = false;
  
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
  
  // Add helper method for number formatting
  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }
  
  constructor(private simulation: SimulationEngine) {
    const uiContainer = document.getElementById('ui-container') as HTMLElement;
    
    // Create dashboard panels
    this.controlPanel = new DashboardPanel('Simulation Controls', 'control', uiContainer);
    // Population panel (Organisms) is created later
    
    // Set up control panel
    const controlContent = this.controlPanel.getContentElement();
    controlContent.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 15px; background-color: rgba(40, 40, 40, 0.6); border-radius: 4px; padding: 6px 10px;">
        <!-- Day display with consistent styling -->
        <div class="control-button" style="display: flex; align-items: center; background-color: rgba(60, 60, 60, 0.7); border-radius: 4px; padding: 4px 8px; margin-right: 8px; min-width: 60px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#aaa" style="margin-right: 4px;">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z"/>
          </svg>
          <span id="days-count" style="font-weight: bold; min-width: 18px; text-align: center;">0</span>
        </div>
        
        <!-- Play/Pause button with consistent styling -->
        <button id="play-pause-btn" class="control-button" style="background-color: rgba(50, 120, 70, 0.7); border: none; width: 30px; height: 30px; padding: 0; margin-right: 8px; display: flex; align-items: center; justify-content: center; border-radius: 4px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path id="play-icon" d="M8 5v14l11-7z" style="display: block;"/>
            <path id="pause-icon" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" style="display: none;"/>
          </svg>
        </button>
        
        <!-- Reset button with consistent styling -->
        <button id="reset-btn" class="control-button" style="background-color: rgba(60, 60, 60, 0.7); border: none; width: 30px; height: 30px; padding: 0; margin-right: 8px; display: flex; align-items: center; justify-content: center; border-radius: 4px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
        </button>
        
        <!-- Resource bloom icon with consistent styling (hidden when inactive) -->
        <div id="resource-bloom" class="control-button" style="display: none; background-color: rgba(50, 120, 70, 0.7); border-radius: 4px; width: 30px; height: 30px; padding: 0; align-items: center; justify-content: center;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#55cc55">
            <path d="M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9zM5.6 10.25c0 1.38 1.12 2.5 2.5 2.5.53 0 1.01-.16 1.42-.44l-.02.19c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5l-.02-.19c.4.28.89.44 1.42.44 1.38 0 2.5-1.12 2.5-2.5 0-1-.59-1.85-1.43-2.25.84-.4 1.43-1.25 1.43-2.25 0-1.38-1.12-2.5-2.5-2.5-.53 0-1.01.16-1.42.44l.02-.19C14.5 2.12 13.38 1 12 1S9.5 2.12 9.5 3.5l.02.19c-.4-.28-.89-.44-1.42-.44-1.38 0-2.5 1.12-2.5 2.5 0 1 .59 1.85 1.43 2.25-.84.4-1.43 1.25-1.43 2.25zM12 5.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8s1.12-2.5 2.5-2.5z"/>
          </svg>
        </div>
      </div>
      
      <div style="margin-bottom: 15px; background-color: rgba(40, 40, 40, 0.6); border-radius: 4px; padding: 8px 10px;">
        <div style="display: flex; align-items: center; margin-bottom: 6px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#aaa" style="margin-right: 6px;">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span style="font-weight: bold; margin-right: 6px;">Extinctions</span>
          <span id="extinctions-count" class="badge" style="background: rgba(80, 80, 80, 0.7); padding: 2px 6px; border-radius: 10px; font-size: 11px;">0</span>
        </div>
        
        <div id="extinction-table" style="width: 100%; font-size: 12px;">
          <!-- Extinction events will be added here -->
        </div>
      </div>
    `;
    
    // Set up population panel with new name "Organisms"
    this.populationPanel = new DashboardPanel('Organisms', 'population', uiContainer);
    const populationContent = this.populationPanel.getContentElement();
    populationContent.innerHTML = `
      <div class="population-grid" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
        <!-- Prey Box -->
        <div style="background-color: rgba(40, 70, 130, 0.3); border: 1px solid rgba(85, 136, 255, 0.5); border-radius: 4px; padding: 8px;">
          <div style="font-weight: bold; color: #5588ff; margin-bottom: 5px; font-size: 14px; display: flex; align-items: center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#5588ff" style="margin-right: 4px;">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
            </svg>
            Prey
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="display: flex; align-items: center;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#5588ff" style="margin-right: 4px;">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span style="color: #aaaaaa; font-size: 11px; margin-right: 4px;">Live:</span>
            </span>
            <span id="prey-count" style="color: #5588ff; font-size: 11px;">0</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="display: flex; align-items: center;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2" style="margin-right: 4px;">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span style="color: #aaaaaa; font-size: 11px; margin-right: 4px;">Total:</span>
            </span>
            <span id="prey-spawned" style="color: #5588ff; font-size: 11px;">0</span>
          </div>
          <button id="spawn-prey-btn" title="Spawn 10 Prey" style="width: 100%; font-size: 12px; display: flex; align-items: center; justify-content: center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            10
          </button>
        </div>
        
        <!-- Predator Box -->
        <div style="background-color: rgba(130, 40, 40, 0.3); border: 1px solid rgba(255, 85, 85, 0.5); border-radius: 4px; padding: 8px;">
          <div style="font-weight: bold; color: #ff5555; margin-bottom: 5px; font-size: 14px; display: flex; align-items: center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff5555" style="margin-right: 4px;">
              <path d="M12 2 L22 9 L19 20 L5 20 L2 9 Z"/>
            </svg>
            Predators
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="display: flex; align-items: center;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff5555" style="margin-right: 4px;">
                <path d="M12 2 L22 9 L19 20 L5 20 L2 9 Z"/>
              </svg>
              <span style="color: #aaaaaa; font-size: 11px; margin-right: 4px;">Live:</span>
            </span>
            <span id="predator-count" style="color: #ff5555; font-size: 11px;">0</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="display: flex; align-items: center;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2" style="margin-right: 4px;">
                <path d="M12 2 L22 9 L19 20 L5 20 L2 9 Z"/>
              </svg>
              <span style="color: #aaaaaa; font-size: 11px; margin-right: 4px;">Total:</span>
            </span>
            <span id="predator-spawned" style="color: #ff5555; font-size: 11px;">0</span>
          </div>
          <button id="spawn-predator-btn" title="Spawn 5 Predators" style="width: 100%; font-size: 12px; display: flex; align-items: center; justify-content: center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            5
          </button>
        </div>
        
        <!-- Resource Box -->
        <div style="background-color: rgba(40, 130, 40, 0.3); border: 1px solid rgba(85, 204, 85, 0.5); border-radius: 4px; padding: 8px;">
          <div style="font-weight: bold; color: #55cc55; margin-bottom: 5px; font-size: 14px; display: flex; align-items: center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#55cc55" style="margin-right: 4px;">
              <rect x="4" y="4" width="16" height="16" />
            </svg>
            Food
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="display: flex; align-items: center;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#55cc55" style="margin-right: 4px;">
                <rect x="4" y="4" width="16" height="16" />
              </svg>
              <span style="color: #aaaaaa; font-size: 11px; margin-right: 4px;">Active:</span>
            </span>
            <span id="resource-count" style="color: #55cc55; font-size: 11px;">0</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="display: flex; align-items: center;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2" style="margin-right: 4px;">
                <rect x="4" y="4" width="16" height="16" />
              </svg>
              <span style="color: #aaaaaa; font-size: 11px; margin-right: 4px;">Total:</span>
            </span>
            <span id="resource-spawned" style="color: #55cc55; font-size: 11px;">0</span>
          </div>
          <button id="spawn-resource-btn" title="Spawn 20 Resources" style="width: 100%; font-size: 12px; display: flex; align-items: center; justify-content: center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            20
          </button>
        </div>
      </div>
    `;
    
    // Get control buttons
    this.playPauseButton = document.getElementById('play-pause-btn') as HTMLButtonElement;
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
    
    // Add tooltips to buttons
    this.playPauseButton.title = 'Play (Space)';
    this.resetButton.title = 'Reset Simulation (R)';
    this.spawnPreyButton.title = 'Spawn 10 Prey';
    this.spawnPredatorButton.title = 'Spawn 5 Predators';
    this.spawnResourceButton.title = 'Spawn 20 Resources';
    
    // Set up event listeners
    this.playPauseButton.addEventListener('click', this.onPlayPauseClick.bind(this));
    this.resetButton.addEventListener('click', this.onResetClick.bind(this));
    this.spawnPreyButton.addEventListener('click', this.onSpawnPreyClick.bind(this));
    this.spawnPredatorButton.addEventListener('click', this.onSpawnPredatorClick.bind(this));
    this.spawnResourceButton.addEventListener('click', this.onSpawnResourceClick.bind(this));
    
    // Setup keyboard shortcuts
    window.addEventListener('keydown', (event) => {
      // Spacebar to toggle play/pause
      if (event.code === 'Space') {
        this.onPlayPauseClick();
        event.preventDefault(); // Prevent scrolling when space is pressed
      }
      
      // "R" key to reset
      if (event.code === 'KeyR') {
        this.onResetClick();
      }
    });
  }
  
  private onPlayPauseClick(): void {
    if (this.isSimulationRunning) {
      // Pause the simulation
      this.simulation.pause();
      this.isSimulationRunning = false;
      
      // Update button UI
      const playIcon = document.getElementById('play-icon');
      const pauseIcon = document.getElementById('pause-icon');
      
      if (playIcon && pauseIcon) {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        this.playPauseButton.title = 'Play (Space)';
      }
    } else {
      // Start the simulation
      this.simulation.start();
      this.isSimulationRunning = true;
      
      // Update button UI
      const playIcon = document.getElementById('play-icon');
      const pauseIcon = document.getElementById('pause-icon');
      
      if (playIcon && pauseIcon) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        this.playPauseButton.title = 'Pause (Space)';
      }
    }
  }
  
  private onResetClick(): void {
    // Reset simulation
    this.simulation.reset();
    
    // Pause the simulation after reset
    this.simulation.pause();
    this.isSimulationRunning = false;
    
    // Update button UI
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    
    if (playIcon && pauseIcon) {
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
      this.playPauseButton.title = 'Play (Space)';
    }
    
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
    const reproductionStats = this.simulation.getReproductionStats();
    
    // Update population counts with formatted numbers
    this.preyCountElement.textContent = this.formatNumber(stats.preyCount);
    this.predatorCountElement.textContent = this.formatNumber(stats.predatorCount);
    this.resourceCountElement.textContent = this.formatNumber(stats.resourceCount);
    
    // Update days
    this.daysElement.textContent = days.toString();
    
    // Update extinctions
    this.extinctionsElement.textContent = extinctionEvents.length.toString();
    
    // Update total spawned with formatted numbers
    this.preySpawnedElement.textContent = this.formatNumber(totalSpawned.prey);
    this.predatorSpawnedElement.textContent = this.formatNumber(totalSpawned.predators);
    this.resourceSpawnedElement.textContent = this.formatNumber(totalSpawned.resources);
    
    // Update resource bloom status
    const resourceBloomElement = document.getElementById('resource-bloom');
    if (resourceBloomElement) {
      resourceBloomElement.style.display = resourceBloom ? 'flex' : 'none';
      
      // Add a tooltip if resource bloom is active
      if (resourceBloom) {
        resourceBloomElement.title = 'Resource Bloom Active!';
      }
    }
    
    // Update extinction table
    const extinctionTableElement = document.getElementById('extinction-table');
    if (extinctionTableElement) {
      let tableHTML = '';
      
      if (extinctionEvents.length > 0) {
        tableHTML = `
          <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 8px; margin-top: 5px;">
            <div style="font-weight: bold; font-size: 11px; color: #777;">Type</div>
            <div style="font-weight: bold; font-size: 11px; color: #777;">Day</div>
            <div style="font-weight: bold; font-size: 11px; color: #777;">Status</div>
        `;
        
        // Show newest events at the top
        const sortedEvents = [...extinctionEvents].reverse();
        
        sortedEvents.forEach(event => {
          const color = event.type === 'prey' ? '#5588ff' : '#ff5555';
          let statusText = '';
          
          // Use the counts captured at the time of extinction
          if (event.type === 'prey' && 'predatorCount' in event) {
            statusText = `${event.predatorCount} predators`;
          } else if (event.type === 'predator' && 'preyCount' in event) {
            statusText = `${event.preyCount} prey`;
          }
          
          tableHTML += `
            <div style="color: ${color}; font-weight: bold; font-size: 11px; display: flex; align-items: center;">
              ${event.type.charAt(0).toUpperCase() + event.type.slice(1)}
            </div>
            <div style="font-size: 11px;">${event.day}</div>
            <div style="font-size: 11px; color: #888;">${statusText}</div>
          `;
        });
        
        tableHTML += `</div>`;
      } else {
        tableHTML = `<div style="color: #666; font-style: italic; font-size: 11px; text-align: center; margin-top: 5px;">No extinction events</div>`;
      }
      
      extinctionTableElement.innerHTML = tableHTML;
    }
    
    // Update reproduction stats
    const preyReadyElement = document.getElementById('prey-ready');
    const predatorReadyElement = document.getElementById('predator-ready');
    
    if (preyReadyElement && reproductionStats.prey.total > 0) {
      const percentage = Math.round((reproductionStats.prey.ready / reproductionStats.prey.total) * 100);
      preyReadyElement.textContent = `${percentage}%`;
      preyReadyElement.title = `${reproductionStats.prey.ready} of ${reproductionStats.prey.total} prey ready to reproduce`;
    }
    
    if (predatorReadyElement && reproductionStats.predator.total > 0) {
      const percentage = Math.round((reproductionStats.predator.ready / reproductionStats.predator.total) * 100);
      predatorReadyElement.textContent = `${percentage}%`;
      predatorReadyElement.title = `${reproductionStats.predator.ready} of ${reproductionStats.predator.total} predators ready to reproduce`;
    }
    
    // Add resource box special effect during bloom
    const resourceBox = this.resourceCountElement?.closest('div')?.parentElement;
    if (resourceBox) {
      if (resourceBloom) {
        resourceBox.style.boxShadow = '0 0 10px #55cc55';
        resourceBox.style.transition = 'box-shadow 0.5s';
        
        // Pulse animation
        if (!resourceBox.classList.contains('bloom-pulse')) {
          resourceBox.classList.add('bloom-pulse');
          resourceBox.style.animation = 'pulse 2s infinite';
          
          // Add keyframes if they don't exist
          if (!document.querySelector('#bloom-pulse-keyframes')) {
            const style = document.createElement('style');
            style.id = 'bloom-pulse-keyframes';
            style.textContent = `
              @keyframes pulse {
                0% { box-shadow: 0 0 5px #55cc55; }
                50% { box-shadow: 0 0 15px #55cc55; }
                100% { box-shadow: 0 0 5px #55cc55; }
              }
            `;
            document.head.appendChild(style);
          }
        }
      } else {
        resourceBox.style.boxShadow = 'none';
        resourceBox.style.animation = 'none';
        resourceBox.classList.remove('bloom-pulse');
      }
    }
  }
}