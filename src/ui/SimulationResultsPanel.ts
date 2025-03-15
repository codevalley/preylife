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
    const stats = this.simulation.getStats();
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
    // Get stats for sharing
    const totalSpawned = this.simulation.getTotalSpawned();
    const extinctionEvents = this.simulation.getExtinctionEvents();
    const evolutionEvents = this.simulation.getEvolutionEvents();
    
    // Generate formatted tweet text
    const formattedStats = `🔵 ${totalSpawned.prey} prey | 🔴 ${totalSpawned.predators} predators | 🟢 ${totalSpawned.resources} resources`;
    const formattedEvents = `💀 ${extinctionEvents.length} extinctions | 🧬 ${evolutionEvents.length} evolutions`;
    
    const tweetText = 
      `My ecosystem in #PreyLife lasted ${this.simulationDays} days before extinction!\n\n` +
      `${formattedStats}\n${formattedEvents}\n\n` +
      `Can you create a more balanced world? Try at:`;
    
    const tweetUrl = 'https://preylife.com';
    
    // Open Twitter intent URL directly
    const tweetIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(tweetUrl)}`;
    window.open(tweetIntentUrl, '_blank');
  }
  
  // Generate a sharable image and open a tweet with it (unused now, but kept for future reference)
  private _generateShareImage(): void {
    const canvas = document.createElement('canvas');
    const width = 1200;
    const height = 630;
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Fill background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
    
    // Add gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(50, 30, 45, 1)');
    gradient.addColorStop(1, 'rgba(20, 20, 30, 1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Get stats for sharing
    const totalSpawned = this.simulation.getTotalSpawned();
    const extinctionEvents = this.simulation.getExtinctionEvents();
    const evolutionEvents = this.simulation.getEvolutionEvents();
    
    // Draw logo
    const logoImg = new Image();
    logoImg.onload = () => {
      // Draw logo at the top
      ctx.drawImage(logoImg, width / 2 - 150, 30, 300, 100);
      
      // Draw Mars emoji
      ctx.font = '100px Arial';
      ctx.fillText('🪐', width / 2 - 50, 210);
      
      // Draw title
      ctx.font = 'bold 44px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('Your World Has Ended', width / 2, 280);
      
      // Draw days 
      ctx.font = '28px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('Your ecosystem survived for', width / 2, 330);
      
      // Draw days count
      ctx.font = 'bold 64px Arial';
      ctx.fillStyle = '#ff7a5c';
      ctx.fillText(`${this.simulationDays} days`, width / 2, 400);
      
      // Draw stats section
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText('Ecosystem Stats', width / 2, 460);
      
      // Draw stats boxes
      this.drawStatsBox(ctx, width / 4, 500, '#5588ff', 'Prey Spawned', totalSpawned.prey.toString());
      this.drawStatsBox(ctx, width / 2, 500, '#ff5555', 'Predators Spawned', totalSpawned.predators.toString());
      this.drawStatsBox(ctx, 3 * width / 4, 500, '#55cc55', 'Resources Generated', totalSpawned.resources.toString());
      
      // Draw URL
      ctx.font = '22px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillText('Try to build a more resilient ecosystem at preylife.com', width / 2, 580);
      
      // Convert to data URL
      const dataURL = canvas.toDataURL('image/png');
      
      // Generate stats summary for tweet
      const stats = `🔵 ${totalSpawned.prey} prey | 🔴 ${totalSpawned.predators} predators | 🟢 ${totalSpawned.resources} resources`;
      const tweetText = `My ecosystem in #PreyLife lasted ${this.simulationDays} days before extinction! \n\n${stats}\n\nCan you create a more balanced world? Try at:`;
      const tweetUrl = 'https://preylife.com';
      
      // Open compact share dialog
      const dialog = document.createElement('div');
      dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        background: rgba(0, 0, 0, 0.95);
        border-radius: 12px;
        padding: 25px;
        z-index: 1100;
        display: flex;
        flex-direction: column;
        box-shadow: 0 0 50px rgba(0, 0, 0, 0.8);
        overflow-y: auto;
      `;
      
      // Create dialog content
      dialog.innerHTML = `
        <h2 style="margin: 0 0 15px 0; color: white; text-align: center; font-size: 24px;">Ready to Share Your Results</h2>
        
        <div style="flex: 1; text-align: center; margin-bottom: 20px; padding: 0;">
          <img src="${dataURL}" alt="PreyLife Results" style="max-width: 100%; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.5);" />
        </div>
        
        <p style="text-align: center; margin: 0 0 15px 0; color: #aaa; font-size: 14px;">
          Share your ecosystem stats on Twitter with one click!
        </p>
        
        <a id="tweet-btn" href="#" style="background: #1DA1F2; color: white; text-decoration: none; padding: 12px 0; border-radius: 30px; font-weight: bold; display: block; text-align: center; width: 100%; transition: all 0.2s; margin-bottom: 15px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" style="margin-right: 8px; vertical-align: middle;">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
          Share on Twitter
        </a>
        
        <a id="close-btn" href="#" style="background: rgba(255, 255, 255, 0.1); color: white; text-decoration: none; padding: 12px 0; border-radius: 30px; font-weight: bold; display: block; text-align: center; width: 100%; transition: background 0.2s;">
          Close
        </a>
      `;
      
      // Create overlay
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 1099;
      `;
      
      // Add to body
      document.body.appendChild(overlay);
      document.body.appendChild(dialog);
      
      // Add event listeners
      const tweetButton = dialog.querySelector('#tweet-btn');
      if (tweetButton) {
        // Set up tweet
        tweetButton.addEventListener('click', (e) => {
          e.preventDefault();
          
          // Generate a more detailed tweet including stats
          const formattedStats = `🔵 ${totalSpawned.prey} prey | 🔴 ${totalSpawned.predators} predators | 🟢 ${totalSpawned.resources} resources`;
          const formattedEvents = `💀 ${extinctionEvents.length} extinctions | 🧬 ${evolutionEvents.length} evolutions`;
          
          const fullTweetText = 
            `My ecosystem in #PreyLife lasted ${this.simulationDays} days before extinction!\n\n` +
            `${formattedStats}\n${formattedEvents}\n\n` +
            `Can you create a more balanced world? Try at:`;
          
          // Open Twitter intent directly with the pre-formatted text
          const tweetIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullTweetText)}&url=${encodeURIComponent(tweetUrl)}`;
          window.open(tweetIntentUrl, '_blank');
          
          // Close the dialog
          document.body.removeChild(dialog);
          document.body.removeChild(overlay);
        });
      }
      
      const closeButton = dialog.querySelector('#close-btn');
      if (closeButton) {
        closeButton.addEventListener('click', (e) => {
          e.preventDefault();
          document.body.removeChild(dialog);
          document.body.removeChild(overlay);
        });
        
        closeButton.addEventListener('mouseenter', () => {
          (closeButton as HTMLElement).style.background = 'rgba(255, 255, 255, 0.2)';
        });
        
        closeButton.addEventListener('mouseleave', () => {
          (closeButton as HTMLElement).style.background = 'rgba(255, 255, 255, 0.1)';
        });
      }
      
      overlay.addEventListener('click', () => {
        document.body.removeChild(dialog);
        document.body.removeChild(overlay);
      });
    };
    
    // Load logo
    logoImg.src = '/assets/logo-nobg.png';
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
  
  private drawStatsBox(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, label: string, value: string): void {
    const boxWidth = 220;
    const boxHeight = 70;
    
    // Draw box
    ctx.fillStyle = color.replace(')', ', 0.2)').replace('rgb', 'rgba');
    ctx.beginPath();
    ctx.roundRect(x - boxWidth/2, y - boxHeight/2, boxWidth, boxHeight, 10);
    ctx.fill();
    
    // Draw border
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x - boxWidth/2, y - boxHeight/2, boxWidth, boxHeight, 10);
    ctx.stroke();
    
    // Draw label
    ctx.font = '18px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y - 10);
    
    // Draw value
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(value, x, y + 20);
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