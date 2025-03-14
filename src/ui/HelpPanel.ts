export class HelpPanel {
  private panel: HTMLElement;

  constructor(container: HTMLElement) {
    // Create the panel container
    this.panel = document.createElement('div');
    this.panel.className = 'help-panel';
    this.panel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 1200px;
      height: 85vh;
      background: rgba(30, 30, 30, 0.97);
      border-radius: 12px;
      padding: 20px;
      display: none;
      z-index: 1000;
      overflow-y: auto;
      color: #fff;
      box-shadow: 0 0 30px rgba(0, 0, 0, 0.7);
    `;

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 15px;
      right: 20px;
      background: none;
      border: none;
      color: #fff;
      font-size: 28px;
      cursor: pointer;
      padding: 5px 10px;
      border-radius: 4px;
      z-index: 1;
    `;
    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    });
    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.backgroundColor = 'transparent';
    });
    closeButton.addEventListener('click', () => this.hide());
    this.panel.appendChild(closeButton);

    // Add title with icons
    const titleSection = document.createElement('div');
    titleSection.style.cssText = `
      text-align: center;
      margin-bottom: 30px;
      padding-top: 10px;
    `;

    const titleIcons = document.createElement('div');
    titleIcons.style.cssText = `
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;
    `;

    // Add entity icons
    const icons = [
      { shape: 'circle', color: '#5588ff', size: 24 },
      { shape: 'pentagon', color: '#ff5555', size: 28 },
      { shape: 'square', color: '#55cc55', size: 20 }
    ];

    icons.forEach(icon => {
      const iconContainer = document.createElement('div');
      if (icon.shape === 'pentagon') {
        iconContainer.innerHTML = `
          <svg width="${icon.size}" height="${icon.size}" viewBox="0 0 24 24" fill="${icon.color}">
            <path d="M12 2 L22 9 L19 20 L5 20 L2 9 Z"/>
          </svg>
        `;
      } else if (icon.shape === 'circle') {
        iconContainer.innerHTML = `
          <svg width="${icon.size}" height="${icon.size}" viewBox="0 0 24 24" fill="${icon.color}">
            <circle cx="12" cy="12" r="10"/>
          </svg>
        `;
      } else {
        iconContainer.innerHTML = `
          <svg width="${icon.size}" height="${icon.size}" viewBox="0 0 24 24" fill="${icon.color}">
            <rect x="2" y="2" width="20" height="20"/>
          </svg>
        `;
      }
      titleIcons.appendChild(iconContainer);
    });

    const title = document.createElement('h1');
    title.textContent = 'Preylife: Evolutionary Ecosystem';
    title.style.cssText = `
      margin: 0;
      font-size: 32px;
      font-weight: bold;
      color: #fff;
    `;

    titleSection.appendChild(titleIcons);
    titleSection.appendChild(title);
    this.panel.appendChild(titleSection);

    // Create content sections
    this.createContent();

    // Add overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: none;
      z-index: 999;
    `;
    overlay.addEventListener('click', () => this.hide());

    // Add to container
    container.appendChild(overlay);
    container.appendChild(this.panel);
  }

  private createContent(): void {
    const content = document.createElement('div');
    content.style.cssText = `
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 25px;
      padding: 0 10px;
    `;

    // First row
    content.appendChild(this.createIntroSection());
    content.appendChild(this.createHowToPlaySection());
    content.appendChild(this.createControlsSection());

    // Second row
    content.appendChild(this.createResourcesSection());
    content.appendChild(this.createPreySection());
    content.appendChild(this.createPredatorSection());

    // Third row
    content.appendChild(this.createEnergySection());
    content.appendChild(this.createInteractionsSection());
    content.appendChild(this.createEvolutionSection());

    this.panel.appendChild(content);
  }

  private createSection(title: string, icon: string, content: string): HTMLElement {
    const section = document.createElement('div');
    section.style.cssText = `
      background: rgba(40, 40, 40, 0.5);
      border-radius: 8px;
      padding: 20px;
      height: fit-content;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    `;

    const iconElement = document.createElement('span');
    iconElement.innerHTML = icon;
    iconElement.style.cssText = `
      margin-right: 10px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const titleElement = document.createElement('h2');
    titleElement.textContent = title;
    titleElement.style.cssText = `
      margin: 0;
      font-size: 20px;
      font-weight: bold;
      color: #fff;
    `;

    header.appendChild(iconElement);
    header.appendChild(titleElement);
    section.appendChild(header);

    const contentElement = document.createElement('div');
    contentElement.innerHTML = content;
    contentElement.style.cssText = `
      font-size: 14px;
      line-height: 1.6;
      color: #ddd;
    `;

    section.appendChild(contentElement);
    return section;
  }

  private createIntroSection(): HTMLElement {
    return this.createSection(
      'What is Preylife?',
      '🧬',
      `
        <p>Preylife is a digital ecosystem that demonstrates the emergence of complex evolutionary strategies through simple probabilistic rules.</p>
        <div style="margin: 15px 0; padding: 15px; background: rgba(30, 30, 30, 0.5); border-radius: 6px;">
          <h3 style="margin: 0 0 10px 0; color: #fff;">Key Concepts</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Emergent Behavior:</strong> Complex patterns emerge from simple rules</li>
            <li><strong>Natural Selection:</strong> Successful traits are passed down</li>
            <li><strong>Nash Equilibrium:</strong> Stable states where strategies coexist</li>
            <li><strong>Evolutionary Arms Race:</strong> Continuous predator-prey adaptation</li>
          </ul>
        </div>
      `
    );
  }

  private createHowToPlaySection(): HTMLElement {
    return this.createSection(
      'How to Play',
      '🎮',
      `
        <div style="display: grid; gap: 15px;">
          <div style="background: rgba(30, 30, 30, 0.5); padding: 15px; border-radius: 6px;">
            <h4 style="margin: 0 0 8px 0; color: #fff;">Basic Concepts</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
              <li>Watch the ecosystem evolve</li>
              <li>Monitor population balance</li>
              <li>Observe emerging strategies</li>
              <li>Track evolutionary events</li>
            </ul>
          </div>

          <div style="background: rgba(30, 30, 30, 0.5); padding: 15px; border-radius: 6px;">
            <h4 style="margin: 0 0 8px 0; color: #fff;">Interactions</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
              <li>Click entities to spawn more</li>
              <li>Hover for detailed information</li>
              <li>Adjust settings to experiment</li>
              <li>Watch for seasonal events</li>
            </ul>
          </div>
        </div>
      `
    );
  }

  private createControlsSection(): HTMLElement {
    return this.createSection(
      'Controls & Settings',
      '⚙️',
      `
        <div style="display: grid; gap: 15px;">
          <div style="background: rgba(30, 30, 30, 0.5); padding: 15px; border-radius: 6px;">
            <h4 style="margin: 0 0 8px 0; color: #fff;">Keyboard Controls</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
              <li><strong>Space</strong>: Play/Pause</li>
              <li><strong>R</strong>: Reset simulation</li>
            </ul>
          </div>

          <div style="background: rgba(30, 30, 30, 0.5); padding: 15px; border-radius: 6px;">
            <h4 style="margin: 0 0 8px 0; color: #fff;">UI Controls</h4>
            <div style="display: grid; gap: 8px; font-size: 13px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: #4CAF50;">▶️</span>
                <div>Play/Pause simulation</div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span>🔄</span>
                <div>Reset to initial state</div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span>⚙️</span>
                <div>Customize parameters</div>
              </div>
            </div>
          </div>
        </div>
      `
    );
  }

  private createInteractionsSection(): HTMLElement {
    return this.createSection(
      'Interactions',
      '🔄',
      `
        <div style="display: grid; gap: 15px;">
          <div style="background: rgba(30, 30, 30, 0.5); padding: 15px; border-radius: 6px;">
            <h4 style="margin: 0 0 8px 0; color: #fff;">Prey & Resources</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
              <li>Prey consume resources for energy</li>
              <li>Resources regenerate over time</li>
              <li>Seasonal blooms create abundance</li>
            </ul>
          </div>

          <div style="background: rgba(30, 30, 30, 0.5); padding: 15px; border-radius: 6px;">
            <h4 style="margin: 0 0 8px 0; color: #fff;">Predator & Prey</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
              <li>Predators hunt prey for energy</li>
              <li>Prey develop evasion strategies</li>
              <li>Both species learn from peers</li>
            </ul>
          </div>

          <div style="background: rgba(30, 30, 30, 0.5); padding: 15px; border-radius: 6px;">
            <h4 style="margin: 0 0 8px 0; color: #fff;">Population Balance</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
              <li>Natural cycles emerge</li>
              <li>Species adapt to pressures</li>
              <li>Ecosystem self-regulates</li>
            </ul>
          </div>

          <div style="background: rgba(30, 30, 30, 0.5); padding: 15px; border-radius: 6px;">
            <h4 style="margin: 0 0 8px 0; color: #fff;">Survival Strategies</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <h5 style="margin: 0 0 5px 0; color: #5588ff;">Prey Strategies</h5>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                  <li><strong>Speed Demons</strong>: Outrun & gather</li>
                  <li><strong>Ghost Prey</strong>: Detect & evade</li>
                  <li><strong>Adaptive Prey</strong>: Quick learning</li>
                </ul>
              </div>
              <div>
                <h5 style="margin: 0 0 5px 0; color: #ff5555;">Predator Strategies</h5>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                  <li><strong>Brute Hunters</strong>: Direct pursuit</li>
                  <li><strong>Stealth Hunters</strong>: Surprise attacks</li>
                  <li><strong>Pack Hunters</strong>: Social learning</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      `
    );
  }

  private createResourcesSection(): HTMLElement {
    return this.createSection(
      'Resources',
      `<svg width="20" height="20" viewBox="0 0 24 24" fill="#55cc55">
        <rect x="4" y="4" width="16" height="16"/>
      </svg>`,
      `
        <div style="display: flex; align-items: start; gap: 15px; margin-bottom: 15px;">
          <div style="flex: 1;">
            <p style="margin-top: 0;">Static food sources that form the foundation of the ecosystem's energy cycle.</p>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Regenerate over time</li>
              <li>Form natural clusters</li>
              <li>Create rich and poor areas</li>
            </ul>
          </div>
        </div>
        <div style="background: rgba(30, 30, 30, 0.5); padding: 15px; border-radius: 6px;">
          <h3 style="margin: 0 0 10px 0; color: #fff;">Seasonal Blooms</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>🌱 Primary Clusters
              <div style="font-size: 12px; color: #aaa;">2x energy value</div>
            </div>
            <div>🌿 Secondary Clusters
              <div style="font-size: 12px; color: #aaa;">1.5x energy value</div>
            </div>
          </div>
        </div>
      `
    );
  }

  private createPreySection(): HTMLElement {
    return this.createSection(
      'Prey',
      `<svg width="20" height="20" viewBox="0 0 24 24" fill="#5588ff">
        <circle cx="12" cy="12" r="10"/>
      </svg>`,
      `
        <p style="margin-top: 0;">Herbivorous creatures that consume resources and must avoid predators.</p>
        <div style="background: rgba(30, 30, 30, 0.5); padding: 15px; border-radius: 6px; margin: 15px 0;">
          <h3 style="margin: 0 0 10px 0; color: #fff;">Attributes</h3>
          <div style="display: grid; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #66ff66;">💪</span>
              <div>
                <strong>Strength</strong>
                <div style="font-size: 12px; color: #aaa;">Movement speed & escape ability</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #5588ff;">🕵️</span>
              <div>
                <strong>Stealth</strong>
                <div style="font-size: 12px; color: #aaa;">Predator detection & evasion</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #ffcc44;">🧠</span>
              <div>
                <strong>Learnability</strong>
                <div style="font-size: 12px; color: #aaa;">Adaptation speed</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #cc66cc;">⏳</span>
              <div>
                <strong>Longevity</strong>
                <div style="font-size: 12px; color: #aaa;">Lifespan & efficiency</div>
              </div>
            </div>
          </div>
        </div>
      `
    );
  }

  private createPredatorSection(): HTMLElement {
    return this.createSection(
      'Predators',
      `<svg width="20" height="20" viewBox="0 0 24 24" fill="#ff5555">
        <path d="M12 2 L22 9 L19 20 L5 20 L2 9 Z"/>
      </svg>`,
      `
        <p style="margin-top: 0;">Carnivorous creatures that hunt prey and maintain ecosystem balance.</p>
        <div style="background: rgba(30, 30, 30, 0.5); padding: 15px; border-radius: 6px; margin: 15px 0;">
          <h3 style="margin: 0 0 10px 0; color: #fff;">Attributes</h3>
          <div style="display: grid; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #ff5555;">💪</span>
              <div>
                <strong>Strength</strong>
                <div style="font-size: 12px; color: #aaa;">Hunting speed & capture success</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #ffcc44;">🕵️</span>
              <div>
                <strong>Stealth</strong>
                <div style="font-size: 12px; color: #aaa;">Approach undetected</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #ffcc44;">🧠</span>
              <div>
                <strong>Learnability</strong>
                <div style="font-size: 12px; color: #aaa;">Adaptation speed</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #cc66cc;">⏳</span>
              <div>
                <strong>Longevity</strong>
                <div style="font-size: 12px; color: #aaa;">Lifespan & efficiency</div>
              </div>
            </div>
          </div>
        </div>
      `
    );
  }

  private createEnergySection(): HTMLElement {
    return this.createSection(
      'Energy & Balance',
      '⚖️',
      `
        <div style="background: rgba(30, 30, 30, 0.5); padding: 15px; border-radius: 6px; margin-bottom: 15px;">
          <h3 style="margin: 0 0 10px 0; color: #fff;">Energy Cycle</h3>
          <div style="text-align: center; padding: 10px; background: rgba(0, 0, 0, 0.2); border-radius: 4px;">
            Resources → Prey → Predators → Resources
          </div>
        </div>
        <div style="display: grid; gap: 15px;">
          <div>
            <h3 style="margin: 0 0 10px 0; color: #fff; font-size: 16px;">🟢 Resources</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Regenerate slowly</li>
              <li>Seasonal blooms</li>
              <li>Decay without prey</li>
            </ul>
          </div>
          <div>
            <h3 style="margin: 0 0 10px 0; color: #fff; font-size: 16px;">🔵 Prey</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>80% energy to reproduce</li>
              <li>Split energy with offspring</li>
              <li>Evolving energy capacity</li>
            </ul>
          </div>
          <div>
            <h3 style="margin: 0 0 10px 0; color: #fff; font-size: 16px;">🔴 Predators</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>70% energy to reproduce</li>
              <li>Higher energy costs</li>
              <li>85% energy from prey</li>
            </ul>
          </div>
        </div>
      `
    );
  }

  private createEvolutionSection(): HTMLElement {
    return this.createSection(
      'Evolution & Strategies',
      '🧬',
      `
        <div style="display: grid; gap: 20px;">
          <div style="background: rgba(30, 30, 30, 0.5); padding: 15px; border-radius: 6px;">
            <h3 style="margin: 0 0 10px 0; color: #fff;">Specialization Types</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <h4 style="margin: 0 0 5px 0; color: #fff;">Specialists</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                  <li>Excel in one trait</li>
                  <li>Energy efficient</li>
                  <li>Environment sensitive</li>
                </ul>
              </div>
              <div>
                <h4 style="margin: 0 0 5px 0; color: #fff;">Generalists</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                  <li>Balanced traits</li>
                  <li>More adaptable</li>
                  <li>Less efficient</li>
                </ul>
              </div>
            </div>
          </div>

          <div style="background: rgba(30, 30, 30, 0.5); padding: 15px; border-radius: 6px;">
            <h3 style="margin: 0 0 10px 0; color: #fff;">Species Conversion</h3>
            <p style="margin: 0 0 10px 0; font-size: 13px;">In rare circumstances, creatures can evolve into a different species through extraordinary evolutionary leaps.</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <h4 style="margin: 0 0 5px 0; color: #5588ff;">Prey → Predator</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                  <li>High strength/stealth</li>
                  <li>Isolated from predators</li>
                  <li>Extended prey contact</li>
                </ul>
              </div>
              <div>
                <h4 style="margin: 0 0 5px 0; color: #ff5555;">Predator → Prey</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                  <li>Low strength/stealth</li>
                  <li>Isolated from prey</li>
                  <li>Extended predator contact</li>
                </ul>
              </div>
            </div>

            <div style="margin-top: 10px; font-size: 12px; color: #888; padding: 8px; background: rgba(0, 0, 0, 0.2); border-radius: 4px;">
              💡 This mechanism serves as a natural recovery system, allowing the ecosystem to self-regulate without artificial respawning.
            </div>
          </div>

          <div style="background: rgba(30, 30, 30, 0.5); padding: 15px; border-radius: 6px;">
            <h3 style="margin: 0 0 10px 0; color: #fff;">Extinction Events</h3>
            <p style="margin: 0 0 10px 0; font-size: 13px;">Population crashes can lead to extinction events, triggered by various factors:</p>
            
            <div style="display: grid; gap: 10px;">
              <div>
                <h4 style="margin: 0 0 5px 0; color: #fff;">Resource Collapse</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                  <li>Overgrazing by prey population</li>
                  <li>Resource decay in prey-scarce areas</li>
                  <li>Emergency regeneration triggers</li>
                </ul>
              </div>
              <div>
                <h4 style="margin: 0 0 5px 0; color: #fff;">Population Crashes</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                  <li>Predator overhunting</li>
                  <li>Starvation cascades</li>
                  <li>Trait disadvantages</li>
                </ul>
              </div>
              <div style="margin-top: 5px; font-size: 12px; color: #888; padding: 8px; background: rgba(0, 0, 0, 0.2); border-radius: 4px;">
                💡 The ecosystem can recover through species conversion and emergency resource regeneration.
              </div>
            </div>
          </div>
        </div>
      `
    );
  }

  show(): void {
    if (this.panel instanceof HTMLElement) {
      this.panel.style.display = 'block';
      const overlay = this.panel.previousElementSibling;
      if (overlay instanceof HTMLElement) {
        overlay.style.display = 'block';
      }
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