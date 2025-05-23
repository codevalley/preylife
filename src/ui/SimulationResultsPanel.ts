import { SimulationEngine } from '../engine/SimulationEngine';

// Add roundRect type declaration for TypeScript
declare global {
  interface CanvasRenderingContext2D {
    roundRect(x: number, y: number, w: number, h: number, r: number | number[]): CanvasRenderingContext2D;
  }
}

export class SimulationResultsPanel {
  private panel: HTMLElement;
  private simulationDays: number = 0;
  
  constructor(container: HTMLElement, private simulation: SimulationEngine) {
    // Add roundRect polyfill if needed
    this.addRoundRectPolyfill();
    
    // Create panel container
    this.panel = document.createElement('div');
    this.panel.className = 'simulation-results-panel';
    this.panel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 600px;
      background: rgba(20, 20, 20, 0.97);
      border-radius: 12px;
      padding: 30px;
      display: none;
      z-index: 1000;
      color: #fff;
      text-align: center;
      box-shadow: 0 0 50px rgba(0, 0, 0, 0.7);
    `;
    
    // Add keyboard event listener
    this.panel.tabIndex = 0; // Make the panel focusable
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: none;
      z-index: 999;
    `;

    // Add to container
    container.appendChild(overlay);
    container.appendChild(this.panel);

    // Update panel content
    this.updateContent();
  }

  private updateContent(): void {
    this.simulationDays = this.simulation.getDays();
    const totalSpawned = this.simulation.getTotalSpawned();
    const extinctionEvents = this.simulation.getExtinctionEvents();
    const evolutionEvents = this.simulation.getEvolutionEvents();
    
    // Create panel content
    this.panel.innerHTML = `
      <div style="position: relative; max-height: 90vh; overflow-y: auto;">
        <!-- Mars (extinct planet) emoji at the top -->
        <div style="font-size: 72px; margin-bottom: 10px; filter: drop-shadow(0 0 15px rgba(255, 100, 50, 0.7));">
          🪐
        </div>
        
        <!-- Title -->
        <h2 style="margin: 0 0 10px 0; font-size: 28px; color: #fff; font-weight: bold;">
          Your World Has Ended
        </h2>
        
        <!-- Subtitle with simulation days -->
        <div style="margin: 0 0 20px 0; display: flex; align-items: center; justify-content: center;">
          <div style="font-size: 16px; opacity: 0.8;">Your ecosystem survived for</div>
          <div style="margin-left: 10px; font-size: 28px; font-weight: bold; color: #ff7a5c; background: rgba(255, 122, 92, 0.15); padding: 5px 15px; border-radius: 20px;">
            ${this.simulationDays} days
          </div>
        </div>
        
        <!-- Simulation Stats -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px;">
          <!-- Prey Stats -->
          <div style="background: rgba(40, 70, 130, 0.3); border-radius: 8px; padding: 12px; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 5px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#5588ff" style="margin-right: 8px;">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
              </svg>
              <span style="font-weight: bold; color: #5588ff;">Prey</span>
            </div>
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${totalSpawned.prey}</div>
            <div style="font-size: 12px; opacity: 0.7;">Total Spawned</div>
          </div>
          
          <!-- Predator Stats -->
          <div style="background: rgba(130, 40, 40, 0.3); border-radius: 8px; padding: 12px; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 5px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff5555" style="margin-right: 8px;">
                <path d="M12 2 L22 9 L19 20 L5 20 L2 9 Z"/>
              </svg>
              <span style="font-weight: bold; color: #ff5555;">Predators</span>
            </div>
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${totalSpawned.predators}</div>
            <div style="font-size: 12px; opacity: 0.7;">Total Spawned</div>
          </div>
          
          <!-- Resource Stats -->
          <div style="background: rgba(40, 130, 40, 0.3); border-radius: 8px; padding: 12px; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 5px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#55cc55" style="margin-right: 8px;">
                <rect x="4" y="4" width="16" height="16" />
              </svg>
              <span style="font-weight: bold; color: #55cc55;">Resources</span>
            </div>
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${totalSpawned.resources}</div>
            <div style="font-size: 12px; opacity: 0.7;">Total Spawned</div>
          </div>
        </div>
        
        <!-- Ecological Events -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
          <!-- Extinction Events -->
          <div style="background: rgba(180, 50, 50, 0.2); border-radius: 8px; padding: 12px; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 5px;">
              <span style="font-size: 16px; margin-right: 8px;">💀</span>
              <span style="font-weight: bold; color: #ff7a7a;">Extinction Events</span>
            </div>
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${extinctionEvents.length}</div>
          </div>
          
          <!-- Evolution Events -->
          <div style="background: rgba(50, 120, 180, 0.2); border-radius: 8px; padding: 12px; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 5px;">
              <span style="font-size: 16px; margin-right: 8px;">🧬</span>
              <span style="font-weight: bold; color: #7a9fff;">Evolution Events</span>
            </div>
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${evolutionEvents.length}</div>
          </div>
        </div>
        
        <!-- Options -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
          <button id="restart-btn" class="result-action-btn" style="background: rgba(100, 180, 100, 0.2); color: #5CFF7A; border: 1px solid #5CFF7A; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.2s;">
            Start Over Again
          </button>
          <button id="add-prey-btn" class="result-action-btn" style="background: rgba(92, 122, 255, 0.2); color: #5C7AFF; border: 1px solid #5C7AFF; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.2s;">
            Add 10 Prey
          </button>
          <button id="add-both-btn" class="result-action-btn" style="background: rgba(255, 122, 92, 0.2); color: #FF7A5C; border: 1px solid #FF7A5C; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.2s;">
            Add 50 Prey & 5 Predators
          </button>
          <button id="share-btn" class="result-action-btn" style="background: rgba(92, 255, 200, 0.2); color: #5CFFC8; border: 1px solid #5CFFC8; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.2s;">
            Share Results
          </button>
        </div>
        
        <!-- Facts about ecosystem balance -->
        <div style="background: rgba(30, 30, 30, 0.5); border-radius: 8px; padding: 15px; font-size: 14px; color: #aaa; text-align: left;">
          <h3 style="margin: 0 0 10px 0; color: #ddd; font-size: 16px;">Did you know?</h3>
          <p style="margin: 0; line-height: 1.5;">An ecosystem's resilience depends on species diversity and balanced predator-prey ratios. Earth's ecosystems have evolved over billions of years, developing complex webs that can recover from disturbances.</p>
        </div>
      </div>
    `;
    
    // Add hover effects to buttons
    const buttons = this.panel.querySelectorAll('.result-action-btn');
    buttons.forEach(button => {
      if (button instanceof HTMLElement) {
        button.addEventListener('mouseenter', () => {
          const currentColor = button.style.borderColor;
          button.style.backgroundColor = currentColor.replace(')', ', 0.3)').replace('rgb', 'rgba');
          button.style.transform = 'translateY(-2px)';
          button.style.boxShadow = `0 5px 15px ${currentColor.replace(')', ', 0.3)').replace('rgb', 'rgba')}`;
        });
        
        button.addEventListener('mouseleave', () => {
          const currentColor = button.style.borderColor;
          button.style.backgroundColor = currentColor.replace(')', ', 0.2)').replace('rgb', 'rgba');
          button.style.transform = 'translateY(0)';
          button.style.boxShadow = 'none';
        });
      }
    });
    
    // Add button event listeners
    const restartButton = this.panel.querySelector('#restart-btn');
    if (restartButton) {
      restartButton.addEventListener('click', () => {
        this.hide();
        this.simulation.reset();
      });
    }
    
    const addPreyButton = this.panel.querySelector('#add-prey-btn');
    if (addPreyButton) {
      addPreyButton.addEventListener('click', () => {
        this.hide();
        this.simulation.spawnPrey(10);
        this.simulation.start();
      });
    }
    
    const addBothButton = this.panel.querySelector('#add-both-btn');
    if (addBothButton) {
      addBothButton.addEventListener('click', () => {
        this.hide();
        this.simulation.spawnPrey(50);
        this.simulation.spawnPredators(5);
        this.simulation.start();
      });
    }
    
    const shareButton = this.panel.querySelector('#share-btn');
    if (shareButton) {
      shareButton.addEventListener('click', () => {
        this.shareToTwitter();
      });
    }
  }
  
  // Share directly to Twitter
  private shareToTwitter(): void {
    const totalSpawned = this.simulation.getTotalSpawned();
    const extinctionEvents = this.simulation.getExtinctionEvents();
    const evolutionEvents = this.simulation.getEvolutionEvents();
    
    const formattedStats = `🔵 ${totalSpawned.prey} prey | 🔴 ${totalSpawned.predators} predators | 🟢 ${totalSpawned.resources} resources`;
    const formattedEvents = `💀 ${extinctionEvents.length} extinctions | 🧬 ${evolutionEvents.length} evolutions`;
    
    const tweetText = 
      `My ecosystem in #PreyLife lasted ${this.simulationDays} days before extinction!\n\n` +
      `${formattedStats}\n${formattedEvents}\n\n` +
      `Can you create a more balanced world? Try at:`;
    
    const tweetUrl = 'https://preylife.com';
    
    const tweetIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(tweetUrl)}`;
    window.open(tweetIntentUrl, '_blank');
  }
  
  
  // Helper method to draw stats boxes on the canvas
  // Add roundRect polyfill for older browsers
  private addRoundRectPolyfill(): void {
    if (!CanvasRenderingContext2D.prototype.roundRect) {
      CanvasRenderingContext2D.prototype.roundRect = function(
        x: number, y: number, width: number, height: number, radius: number | number[]
      ) {
        if (typeof radius === 'number') {
          radius = [radius, radius, radius, radius];
        } else if (radius.length === 1) {
          radius = [radius[0], radius[0], radius[0], radius[0]];
        } else if (radius.length === 2) {
          radius = [radius[0], radius[1], radius[0], radius[1]];
        } else if (radius.length === 3) {
          radius.push(radius[1]);
        }
        
        this.moveTo(x + radius[0], y);
        this.lineTo(x + width - radius[1], y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius[1]);
        this.lineTo(x + width, y + height - radius[2]);
        this.quadraticCurveTo(x + width, y + height, x + width - radius[2], y + height);
        this.lineTo(x + radius[3], y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius[3]);
        this.lineTo(x, y + radius[0]);
        this.quadraticCurveTo(x, y, x + radius[0], y);
        this.closePath();
        
        return this;
      };
    }
  }
  

  // Show the panel when ecosystem has ended
  showForExtinction(): void {
    // Update the days count and content
    this.updateContent();
    
    // Pause the simulation
    this.simulation.pause();
    
    // Display the panel and overlay
    if (this.panel instanceof HTMLElement) {
      this.panel.style.display = 'block';
      const overlay = this.panel.previousElementSibling;
      if (overlay instanceof HTMLElement) {
        overlay.style.display = 'block';
      }
      
      // Focus the panel for keyboard events
      setTimeout(() => {
        this.panel.focus();
      }, 100);
    }
  }

  hide(): void {
    if (this.panel instanceof HTMLElement) {
      this.panel.style.display = 'none';
      const overlay = this.panel.previousElementSibling;
      if (overlay instanceof HTMLElement) {
        overlay.style.display = 'none';
      }
    }
  }
}