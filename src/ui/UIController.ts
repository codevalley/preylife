import { SimulationEngine } from '../engine/SimulationEngine';
import { DashboardPanel } from './DashboardPanel';
import { SettingsPanel } from './SettingsPanel';
import { SimulationConfig } from '../config';
import { HelpPanel } from './HelpPanel';

export class UIController {
  // Dashboard panels
  private controlPanel: DashboardPanel;
  private ecologyPanel: DashboardPanel;
  private settingsPanel: SettingsPanel;
  private helpPanel: HelpPanel;
  
  // Control buttons
  private playPauseButton: HTMLButtonElement;
  private resetButton: HTMLButtonElement;
  
  // Simulation state
  private isSimulationRunning: boolean = false;
  
  // Dashboard elements
  private preyCountElement: HTMLElement;
  private predatorCountElement: HTMLElement;
  private resourceCountElement: HTMLElement;
  private daysElement: HTMLElement;
  private eventsCountElement: HTMLElement;
  
  // Total spawned elements
  private preySpawnedElement: HTMLElement;
  private predatorSpawnedElement: HTMLElement;
  private resourceSpawnedElement: HTMLElement;
  
  // Ecology events tracking
  private ecologyEvents: Array<{
    type: 'extinction' | 'evolution',
    species: 'prey' | 'predator',
    day: number,
    preyCount: number,
    predatorCount: number,
    resourceCount: number
  }> = [];
  
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
    this.ecologyPanel = new DashboardPanel('Ecology Events', 'ecology', uiContainer);
    this.settingsPanel = new SettingsPanel(uiContainer);
    this.helpPanel = new HelpPanel(uiContainer);
    
    // Set up control panel
    const controlContent = this.controlPanel.getContentElement();
    controlContent.innerHTML = `
      <!-- First row: Controls -->
      <div style="display: flex; align-items: center; margin-bottom: 8px; background-color: rgba(40, 40, 40, 0.6); border-radius: 4px; padding: 6px 10px; gap: 8px;">
        <!-- Play/Pause button -->
        <button id="play-pause-btn" class="control-button" style="background-color: rgba(50, 120, 70, 0.7); border: none; width: 34px; height: 34px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 4px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path id="play-icon" d="M8 5v14l11-7z" style="display: block;"/>
            <path id="pause-icon" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" style="display: none;"/>
          </svg>
        </button>
        
        <!-- Reset button -->
        <button id="reset-btn" class="control-button" style="background-color: rgba(60, 60, 60, 0.7); border: none; width: 34px; height: 34px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 4px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
        </button>

        <!-- Custom/Settings button -->
        <button id="custom-btn" class="control-button" style="background-color: rgba(60, 60, 60, 0.7); border: none; width: 34px; height: 34px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 4px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
          </svg>
        </button>

        <!-- Help button -->
        <button id="help-btn" class="control-button" style="background-color: rgba(60, 60, 60, 0.7); border: none; width: 34px; height: 34px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 4px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
          </svg>
        </button>

        <!-- Day display -->
        <div class="control-button" style="display: flex; align-items: center; background-color: rgba(60, 60, 60, 0.7); border-radius: 4px; padding: 0 12px; height: 34px; line-height: 34px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#aaa" style="margin-right: 4px;">
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
          </svg>
          <span id="days-count" style="font-weight: bold; min-width: 18px; text-align: center;">0</span>
        </div>
      </div>

      <!-- Second row: Stats -->
      <div style="display: flex; align-items: center; background-color: rgba(40, 40, 40, 0.6); border-radius: 4px; padding: 6px 10px; gap: 8px;">
        <!-- Prey stats -->
        <div id="prey-widget" style="display: flex; align-items: center; background-color: rgba(40, 70, 130, 0.3); border-radius: 4px; padding: 4px 8px; flex: 1; cursor: pointer; transition: background-color 0.2s;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#5588ff" style="margin-right: 4px;">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
          </svg>
          <span id="prey-count" style="color: #5588ff; font-weight: bold;">0</span>
          <span style="color: #777; margin: 0 4px;">/</span>
          <span id="prey-spawned" style="color: #5588ff;">0</span>
        </div>

        <!-- Predator stats -->
        <div id="predator-widget" style="display: flex; align-items: center; background-color: rgba(130, 40, 40, 0.3); border-radius: 4px; padding: 4px 8px; flex: 1; cursor: pointer; transition: background-color 0.2s;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff5555" style="margin-right: 4px;">
            <path d="M12 2 L22 9 L19 20 L5 20 L2 9 Z"/>
          </svg>
          <span id="predator-count" style="color: #ff5555; font-weight: bold;">0</span>
          <span style="color: #777; margin: 0 4px;">/</span>
          <span id="predator-spawned" style="color: #ff5555;">0</span>
        </div>

        <!-- Resource stats -->
        <div id="resource-widget" style="display: flex; align-items: center; background-color: rgba(40, 130, 40, 0.3); border-radius: 4px; padding: 4px 8px; flex: 1; cursor: pointer; transition: background-color 0.2s;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#55cc55" style="margin-right: 4px;">
            <rect x="4" y="4" width="16" height="16" />
          </svg>
          <span id="resource-count" style="color: #55cc55; font-weight: bold;">0</span>
          <span style="color: #777; margin: 0 4px;">/</span>
          <span id="resource-spawned" style="color: #55cc55;">0</span>
        </div>
      </div>
    `;

    // Set up ecology panel
    const ecologyContent = this.ecologyPanel.getContentElement();
    ecologyContent.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; max-height: 300px;">
        <div style="display: flex; align-items: center; margin-bottom: 6px;">
          <span id="events-count" class="badge" style="background: rgba(80, 80, 80, 0.7); padding: 2px 6px; border-radius: 10px; font-size: 11px; margin-left: auto;">0</span>
        </div>
        
        <div id="ecology-events-table" style="flex: 1; overflow: hidden; font-size: 12px;">
          <!-- Ecology events (extinctions and evolutions) will be added here -->
        </div>
      </div>
    `;
    
    // Get control buttons
    this.playPauseButton = document.getElementById('play-pause-btn') as HTMLButtonElement;
    this.resetButton = document.getElementById('reset-btn') as HTMLButtonElement;
    
    // Get dashboard elements
    this.preyCountElement = document.getElementById('prey-count') as HTMLElement;
    this.predatorCountElement = document.getElementById('predator-count') as HTMLElement;
    this.resourceCountElement = document.getElementById('resource-count') as HTMLElement;
    this.daysElement = document.getElementById('days-count') as HTMLElement;
    this.eventsCountElement = document.getElementById('events-count') as HTMLElement;
    
    // Get total spawned elements
    this.preySpawnedElement = document.getElementById('prey-spawned') as HTMLElement;
    this.predatorSpawnedElement = document.getElementById('predator-spawned') as HTMLElement;
    this.resourceSpawnedElement = document.getElementById('resource-spawned') as HTMLElement;
    
    // Add tooltips to buttons
    this.playPauseButton.title = 'Play (Space)';
    this.resetButton.title = 'Reset Simulation (R)';
    
    // Add tooltip for custom button
    const customButton = document.getElementById('custom-btn') as HTMLButtonElement;
    if (customButton) {
      customButton.title = 'Customize Simulation';
      
      // Add hover effect
      customButton.addEventListener('mouseenter', () => {
        customButton.style.backgroundColor = 'rgba(80, 80, 80, 0.7)';
      });
      customButton.addEventListener('mouseleave', () => {
        customButton.style.backgroundColor = 'rgba(60, 60, 60, 0.7)';
      });
    }

    // Add tooltip and hover effect for help button
    const helpButton = document.getElementById('help-btn') as HTMLButtonElement;
    if (helpButton) {
      helpButton.title = 'Help & Information';
      
      // Add hover effect
      helpButton.addEventListener('mouseenter', () => {
        helpButton.style.backgroundColor = 'rgba(80, 80, 80, 0.7)';
      });
      helpButton.addEventListener('mouseleave', () => {
        helpButton.style.backgroundColor = 'rgba(60, 60, 60, 0.7)';
      });
    }
    
    // Set up event listeners
    this.playPauseButton.addEventListener('click', this.onPlayPauseClick.bind(this));
    this.resetButton.addEventListener('click', this.onResetClick.bind(this));
    
    // Add click handlers for spawning
    document.getElementById('prey-widget')?.addEventListener('click', () => {
      this.simulation.spawnPrey(1);
      this.updateStats();
    });

    document.getElementById('predator-widget')?.addEventListener('click', () => {
      this.simulation.spawnPredators(1);
      this.updateStats();
    });

    document.getElementById('resource-widget')?.addEventListener('click', () => {
      this.simulation.spawnResources(10);
      this.updateStats();
    });

    // Add hover effects for the widgets
    const widgets = ['prey-widget', 'predator-widget', 'resource-widget'];
    widgets.forEach(id => {
      const widget = document.getElementById(id);
      if (widget) {
        widget.addEventListener('mouseenter', () => {
          widget.style.backgroundColor = id === 'prey-widget' ? 'rgba(40, 70, 130, 0.5)' :
                                      id === 'predator-widget' ? 'rgba(130, 40, 40, 0.5)' :
                                      'rgba(40, 130, 40, 0.5)';
        });
        widget.addEventListener('mouseleave', () => {
          widget.style.backgroundColor = id === 'prey-widget' ? 'rgba(40, 70, 130, 0.3)' :
                                      id === 'predator-widget' ? 'rgba(130, 40, 40, 0.3)' :
                                      'rgba(40, 130, 40, 0.3)';
        });
      }
    });

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

    // Add settings button click handler
    if (customButton) {
      customButton.addEventListener('click', () => {
        this.settingsPanel.onSave((newConfig) => {
          // Update simulation config
          Object.assign(SimulationConfig, newConfig);
          // Reset simulation with new config
          this.onResetClick();
        });
        this.settingsPanel.show();
      });
    }

    // Add help button click handler
    if (helpButton) {
      helpButton.addEventListener('click', () => {
        this.helpPanel.show();
      });
    }

    // Show help panel on startup
    this.helpPanel.show();
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
  
  updateStats(): void {
    const stats = this.simulation.getStats();
    const days = this.simulation.getDays();
    const totalSpawned = this.simulation.getTotalSpawned();
    const extinctionEvents = this.simulation.getExtinctionEvents();
    const evolutionEvents = this.simulation.getEvolutionEvents();
    const resourceBloom = this.simulation.isResourceBloom();
    const reproductionStats = this.simulation.getReproductionStats();
    
    // Update population counts with formatted numbers
    this.preyCountElement.textContent = this.formatNumber(stats.preyCount);
    this.predatorCountElement.textContent = this.formatNumber(stats.predatorCount);
    this.resourceCountElement.textContent = this.formatNumber(stats.resourceCount);
    
    // Update days
    this.daysElement.textContent = days.toString();
    
    // Check for new extinction events to add to our ecology events
    for (const event of extinctionEvents) {
      // Check if we already have this event in our list
      const existingEvent = this.ecologyEvents.find(e => 
        e.type === 'extinction' && 
        e.species === event.type && 
        e.day === event.day
      );
      
      if (!existingEvent) {
        // Add this extinction event to our list
        const newEvent = {
          type: 'extinction' as const,
          species: event.type as 'prey' | 'predator',
          day: event.day,
          preyCount: event.type === 'prey' ? 0 : stats.preyCount,
          predatorCount: event.type === 'predator' ? 0 : stats.predatorCount,
          resourceCount: stats.resourceCount
        };
        
        this.ecologyEvents.push(newEvent);
      }
    }
    
    // Check for new evolution events to add to our ecology events
    for (const event of evolutionEvents) {
      // Check if we already have this event in our list
      const existingEvent = this.ecologyEvents.find(e => 
        e.type === 'evolution' && 
        e.species === event.fromType && 
        e.day === event.day
      );
      
      if (!existingEvent) {
        // Add this evolution event to our list
        const newEvent = {
          type: 'evolution' as const,
          species: event.fromType as 'prey' | 'predator',
          day: event.day,
          preyCount: event.preyCount,
          predatorCount: event.predatorCount,
          resourceCount: event.resourceCount
        };
        
        this.ecologyEvents.push(newEvent);
      }
    }
    
    // Update events count and panel title
    this.eventsCountElement.textContent = this.ecologyEvents.length.toString();
    this.ecologyPanel.setTitle(`Ecology Events (${this.ecologyEvents.length})`);
    
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
    
    // Update ecology events table
    const ecologyEventsTableElement = document.getElementById('ecology-events-table');
    if (ecologyEventsTableElement) {
      let tableHTML = '';
      
      if (this.ecologyEvents.length > 0) {
        // Show newest events at the top
        const sortedEvents = [...this.ecologyEvents].sort((a, b) => b.day - a.day);
        
        // Always create scrollable container
        tableHTML = `
          <div style="height: 100%;">
            <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 8px; margin-bottom: 5px; position: sticky; top: 0; background-color: rgba(0, 0, 0, 0.7); padding: 5px 0;">
              <div style="font-weight: bold; font-size: 11px; color: #777;">Event</div>
              <div style="font-weight: bold; font-size: 11px; color: #777;">Day</div>
              <div style="font-weight: bold; font-size: 11px; color: #777;">Population</div>
            </div>
            
            <div style="max-height: 240px; overflow-y: auto; overflow-x: hidden; scrollbar-width: thin; scrollbar-color: #444 #222;">
              <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 8px;">
        `;
        
        sortedEvents.forEach(event => {
          // Choose color based on species
          const color = event.species === 'prey' ? '#5588ff' : '#ff5555';
          
          // Create event description
          let eventText = '';
          if (event.type === 'extinction') {
            eventText = `${event.species.charAt(0).toUpperCase() + event.species.slice(1)} extinct`;
          } else if (event.type === 'evolution') {
            if (event.species === 'prey') {
              eventText = 'Prey → Predator';
            } else {
              eventText = 'Predator → Prey';
            }
          }
          
          // Create population status with icons
          const populationText = `
            <span style="display: flex; align-items: center; font-size: 10px; white-space: nowrap;">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#5588ff" style="margin: 0 2px;">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
              </svg>${event.preyCount}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#ff5555" style="margin: 0 2px 0 4px;">
                <path d="M12 2 L22 9 L19 20 L5 20 L2 9 Z"/>
              </svg>${event.predatorCount}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#55cc55" style="margin: 0 2px 0 4px;">
                <rect x="4" y="4" width="16" height="16" />
              </svg>${event.resourceCount}
            </span>
          `;
          
          tableHTML += `
            <div style="color: ${color}; font-weight: bold; font-size: 11px; display: flex; align-items: center; padding: 3px 0;">
              ${eventText}
            </div>
            <div style="font-size: 11px; padding: 3px 0;">${event.day}</div>
            <div style="font-size: 11px; padding: 3px 0;">${populationText}</div>
          `;
        });
        
        tableHTML += `
              </div>
            </div>
          </div>
        `;
        
        // Add custom scrollbar styles
        tableHTML += `
          <style>
            #ecology-events-table div::-webkit-scrollbar {
              width: 6px;
              height: 6px;
            }
            #ecology-events-table div::-webkit-scrollbar-track {
              background: #222;
              border-radius: 3px;
            }
            #ecology-events-table div::-webkit-scrollbar-thumb {
              background: #444;
              border-radius: 3px;
            }
            #ecology-events-table div::-webkit-scrollbar-thumb:hover {
              background: #555;
            }
          </style>
        `;
      } else {
        tableHTML = `<div style="color: #666; font-style: italic; font-size: 11px; text-align: center; margin-top: 5px;">No ecological events yet</div>`;
      }
      
      ecologyEventsTableElement.innerHTML = tableHTML;
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