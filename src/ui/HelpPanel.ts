import { OceanicColors } from './DashboardPanel';

export class HelpPanel {
  private panel: HTMLElement;

  constructor(container: HTMLElement) {
    // Create the panel container with oceanic glass-morphism
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
      background: linear-gradient(170deg, rgba(8, 30, 55, 0.95) 0%, rgba(4, 15, 35, 0.97) 50%, rgba(8, 25, 45, 0.95) 100%);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 14px;
      padding: 0;
      display: none;
      z-index: 1000;
      overflow: hidden;
      color: ${OceanicColors.textPrimary};
      box-shadow: 0 8px 40px rgba(0, 30, 60, 0.6), 0 0 80px rgba(0, 100, 180, 0.08), inset 0 1px 0 rgba(100, 200, 255, 0.1);
      border: 1px solid ${OceanicColors.borderPrimary};
      flex-direction: column;
    `;

    // Inject help panel styles
    this.addHelpStyles();

    // Add keyboard event listener
    this.panel.tabIndex = 0; // Make the panel focusable
    this.panel.addEventListener('keydown', (event) => {
      // Close on Escape key
      if (event.key === 'Escape') {
        this.hide();
        event.preventDefault();
        event.stopPropagation();
      }
    });

    // === HEADER (fixed top) ===
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      border-bottom: 1px solid rgba(80, 180, 220, 0.15);
      background: linear-gradient(180deg, rgba(10, 35, 60, 0.4) 0%, transparent 100%);
      flex-shrink: 0;
    `;

    // Logo in header
    const logo = document.createElement('img');
    logo.src = '/assets/logo-nobg.png';
    logo.alt = 'Preylife Logo';
    logo.style.cssText = 'height: 36px; width: auto;';

    // Close button (DOM methods, hardcoded UI chrome)
    const closeButton = document.createElement('button');
    closeButton.className = 'help-close-btn';
    const closeX = document.createElement('span');
    closeX.style.cssText = 'font-size: 18px; line-height: 1;';
    closeX.textContent = '\u00D7';
    const closeHint = document.createElement('span');
    closeHint.style.cssText = 'font-size: 10px; opacity: 0.5; background: rgba(255,255,255,0.08); padding: 2px 5px; border-radius: 3px;';
    closeHint.textContent = 'ESC';
    const closeBtnWrap = document.createElement('div');
    closeBtnWrap.style.cssText = 'display: flex; align-items: center; gap: 6px;';
    closeBtnWrap.appendChild(closeX);
    closeBtnWrap.appendChild(closeHint);
    closeButton.appendChild(closeBtnWrap);
    closeButton.style.cssText = `
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: ${OceanicColors.textSecondary};
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      transition: all 0.2s;
    `;
    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.backgroundColor = 'rgba(255, 100, 100, 0.12)';
      closeButton.style.borderColor = 'rgba(255, 100, 100, 0.25)';
      closeButton.style.color = '#ff8888';
    });
    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
      closeButton.style.borderColor = 'rgba(255, 255, 255, 0.08)';
      closeButton.style.color = OceanicColors.textSecondary;
    });
    closeButton.title = 'Close Help Panel (Esc)';
    closeButton.addEventListener('click', () => this.hide());

    header.appendChild(logo);
    header.appendChild(closeButton);
    this.panel.appendChild(header);

    // === SCROLL AREA ===
    const scrollArea = document.createElement('div');
    scrollArea.className = 'help-scroll-area';
    scrollArea.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    `;
    this.panel.appendChild(scrollArea);

    // Create content sections inside scroll area
    this.createContent(scrollArea);

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

  private addHelpStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .help-section {
        transition: transform 0.2s ease, border-color 0.25s ease, box-shadow 0.25s ease;
      }
      .help-section:hover {
        transform: translateY(-2px);
        border-color: rgba(100, 200, 255, 0.3) !important;
        box-shadow: 0 6px 24px rgba(0, 80, 140, 0.15), inset 0 1px 0 rgba(100, 200, 255, 0.06);
      }
      .help-scroll-area {
        scrollbar-width: thin;
        scrollbar-color: rgba(80, 180, 220, 0.25) transparent;
      }
      .help-scroll-area::-webkit-scrollbar {
        width: 6px;
      }
      .help-scroll-area::-webkit-scrollbar-track {
        background: transparent;
      }
      .help-scroll-area::-webkit-scrollbar-thumb {
        background: rgba(80, 180, 220, 0.25);
        border-radius: 3px;
      }
      .help-scroll-area::-webkit-scrollbar-thumb:hover {
        background: rgba(80, 180, 220, 0.4);
      }
    `;
    document.head.appendChild(style);
  }

  private createContent(scrollArea?: HTMLElement): void {
    const content = document.createElement('div');
    content.style.cssText = `
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
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

    const target = scrollArea || this.panel;
    target.appendChild(content);
  }

  /**
   * Create a styled section for the help panel.
   * Note: icon and content use innerHTML but are ONLY called with hardcoded
   * string literals from createIntroSection, createHowToPlaySection, etc.
   * These are NOT user inputs - they are internal static content.
   */
  private createSection(title: string, icon: string, content: string): HTMLElement {
    const section = document.createElement('div');
    section.className = 'help-section';
    section.style.cssText = `
      background: linear-gradient(160deg, rgba(8, 28, 50, 0.7) 0%, rgba(5, 18, 35, 0.8) 100%);
      border-radius: 10px;
      padding: 20px;
      height: fit-content;
      border: 1px solid rgba(80, 180, 220, 0.15);
      position: relative;
      overflow: hidden;
    `;

    // Subtle top-edge highlight
    const topEdge = document.createElement('div');
    topEdge.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, rgba(100, 200, 255, 0.15) 50%, transparent 100%);
    `;
    section.appendChild(topEdge);

    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid ${OceanicColors.borderPrimary};
    `;

    const iconElement = document.createElement('span');
    // SECURITY: icon is hardcoded SVG/emoji from internal methods, not user input
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
      font-size: 18px;
      font-weight: bold;
      color: ${OceanicColors.textPrimary};
      text-shadow: 0 0 10px rgba(100, 200, 255, 0.2);
    `;

    header.appendChild(iconElement);
    header.appendChild(titleElement);
    section.appendChild(header);

    const contentElement = document.createElement('div');
    // SECURITY: content is hardcoded HTML from internal methods, not user input
    contentElement.innerHTML = content;
    contentElement.style.cssText = `
      font-size: 13px;
      line-height: 1.6;
      color: ${OceanicColors.textSecondary};
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
        <div style="margin: 15px 0; padding: 15px; background: rgba(5, 15, 30, 0.4); border-radius: 6px;">
          <h3 style="margin: 0 0 10px 0; color: ${OceanicColors.textPrimary};">Key Concepts</h3>
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
          <div style="background: rgba(5, 15, 30, 0.4); padding: 15px; border-radius: 6px;">
            <h4 style="margin: 0 0 8px 0; color: ${OceanicColors.textPrimary};">Basic Concepts</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
              <li>Watch the ecosystem evolve</li>
              <li>Monitor population balance</li>
              <li>Observe emerging strategies</li>
              <li>Track evolutionary events</li>
            </ul>
          </div>

          <div style="background: rgba(5, 15, 30, 0.4); padding: 15px; border-radius: 6px;">
            <h4 style="margin: 0 0 8px 0; color: ${OceanicColors.textPrimary};">Interactions</h4>
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
          <div style="background: rgba(5, 15, 30, 0.4); padding: 15px; border-radius: 6px;">
            <h4 style="margin: 0 0 8px 0; color: ${OceanicColors.textPrimary};">Keyboard Controls</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
              <li><strong>Space</strong>: Play/Pause</li>
              <li><strong>R</strong>: Reset simulation</li>
            </ul>
          </div>

          <div style="background: rgba(5, 15, 30, 0.4); padding: 15px; border-radius: 6px;">
            <h4 style="margin: 0 0 8px 0; color: ${OceanicColors.textPrimary};">UI Controls</h4>
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
          <div style="background: rgba(5, 15, 30, 0.4); padding: 15px; border-radius: 6px;">
            <h4 style="margin: 0 0 8px 0; color: ${OceanicColors.textPrimary};">Prey & Resources</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
              <li>Prey consume resources for energy</li>
              <li>Resources regenerate over time</li>
              <li>Seasonal blooms create abundance</li>
            </ul>
          </div>

          <div style="background: rgba(5, 15, 30, 0.4); padding: 15px; border-radius: 6px;">
            <h4 style="margin: 0 0 8px 0; color: ${OceanicColors.textPrimary};">Predator & Prey</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
              <li>Predators hunt prey for energy</li>
              <li>Prey develop evasion strategies</li>
              <li>Both species learn from peers</li>
            </ul>
          </div>

          <div style="background: rgba(5, 15, 30, 0.4); padding: 15px; border-radius: 6px;">
            <h4 style="margin: 0 0 8px 0; color: ${OceanicColors.textPrimary};">Population Balance</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
              <li>Natural cycles emerge</li>
              <li>Species adapt to pressures</li>
              <li>Ecosystem self-regulates</li>
            </ul>
          </div>

          <div style="background: rgba(5, 15, 30, 0.4); padding: 15px; border-radius: 6px;">
            <h4 style="margin: 0 0 8px 0; color: ${OceanicColors.textPrimary};">Survival Strategies</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <h5 style="margin: 0 0 5px 0; color: ${OceanicColors.prey};">Prey Strategies</h5>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                  <li><strong>Speed Demons</strong>: Outrun & gather</li>
                  <li><strong>Ghost Prey</strong>: Detect & evade</li>
                  <li><strong>Adaptive Prey</strong>: Quick learning</li>
                </ul>
              </div>
              <div>
                <h5 style="margin: 0 0 5px 0; color: ${OceanicColors.predator};">Predator Strategies</h5>
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
        <div style="background: rgba(5, 15, 30, 0.4); padding: 15px; border-radius: 6px;">
          <h3 style="margin: 0 0 10px 0; color: ${OceanicColors.textPrimary};">Seasonal Blooms</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>🌱 Primary Clusters
              <div style="font-size: 12px; color: ${OceanicColors.textSecondary};">2x energy value</div>
            </div>
            <div>🌿 Secondary Clusters
              <div style="font-size: 12px; color: ${OceanicColors.textSecondary};">1.5x energy value</div>
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
        <div style="background: rgba(5, 15, 30, 0.4); padding: 15px; border-radius: 6px; margin: 15px 0;">
          <h3 style="margin: 0 0 10px 0; color: ${OceanicColors.textPrimary};">Attributes</h3>
          <div style="display: grid; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #66ff66;">💪</span>
              <div>
                <strong>Strength</strong> (Green tint)
                <div style="font-size: 12px; color: ${OceanicColors.textSecondary};">Primary locomotion stat — drives swim speed</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: ${OceanicColors.prey};">🕵️</span>
              <div>
                <strong>Stealth</strong> (Blue tint)
                <div style="font-size: 12px; color: ${OceanicColors.textSecondary};">Concealment & agility — break predator lock, turn sharply</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #ffcc44;">🧠</span>
              <div>
                <strong>Learnability</strong>
                <div style="font-size: 12px; color: ${OceanicColors.textSecondary};">Adaptation speed & social learning</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #cc66cc;">⏳</span>
              <div>
                <strong>Longevity</strong>
                <div style="font-size: 12px; color: ${OceanicColors.textSecondary};">Lifespan & metabolic efficiency</div>
              </div>
            </div>
          </div>
        </div>
        <div style="background: rgba(5, 15, 30, 0.4); padding: 10px; border-radius: 6px;">
          <h3 style="margin: 0 0 5px 0; color: ${OceanicColors.textPrimary}; font-size: 15px;">Special Abilities</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 12px;">
            <li><strong>Resource Detection:</strong> Find food based on stealth</li>
            <li><strong>Predator Evasion:</strong> Flee with speed boost (strength-based)</li>
            <li><strong>Specialized Escape:</strong> Stealth prey use erratic movements</li>
            <li><strong>Energy Bonus:</strong> Gets 20% bonus from resources</li>
            <li><strong>Flee Exhaustion:</strong> Continuous fleeing accumulates fatigue, reducing speed</li>
            <li><strong>Stealth Evasion:</strong> High-stealth prey can vanish mid-chase, breaking predator lock</li>
          </ul>
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
        <div style="background: rgba(5, 15, 30, 0.4); padding: 15px; border-radius: 6px; margin: 15px 0;">
          <h3 style="margin: 0 0 10px 0; color: ${OceanicColors.textPrimary};">Attributes</h3>
          <div style="display: grid; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: ${OceanicColors.predator};">💪</span>
              <div>
                <strong>Strength</strong> (Red tint)
                <div style="font-size: 12px; color: ${OceanicColors.textSecondary};">Primary locomotion stat — drives pursuit speed</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #ffcc44;">🕵️</span>
              <div>
                <strong>Stealth</strong> (Yellow tint)
                <div style="font-size: 12px; color: ${OceanicColors.textSecondary};">Concealment & agility — better turn rate</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #ffcc44;">🧠</span>
              <div>
                <strong>Learnability</strong>
                <div style="font-size: 12px; color: ${OceanicColors.textSecondary};">Adaptation speed & hunting tactics</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #cc66cc;">⏳</span>
              <div>
                <strong>Longevity</strong>
                <div style="font-size: 12px; color: ${OceanicColors.textSecondary};">Lifespan & metabolic efficiency</div>
              </div>
            </div>
          </div>
        </div>
        <div style="background: rgba(5, 15, 30, 0.4); padding: 10px; border-radius: 6px;">
          <h3 style="margin: 0 0 5px 0; color: ${OceanicColors.textPrimary}; font-size: 15px;">Special Abilities</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 12px;">
            <li><strong>Prey Detection:</strong> Find prey based on stealth</li>
            <li><strong>Hunting Boost:</strong> Increased speed when pursuing prey</li>
            <li><strong>Capture Chance:</strong> Based on strength vs prey's stealth</li>
            <li><strong>Specialized Hunting:</strong> Bonuses for extreme traits</li>
            <li><strong>Target-Lock Homing:</strong> Committed pursuit with 30-frame minimum lock</li>
            <li><strong>Desperation Mode:</strong> Starving isolated hunters gain detection and speed bonuses</li>
          </ul>
        </div>
      `
    );
  }

  private createEnergySection(): HTMLElement {
    return this.createSection(
      'Energy & Balance',
      '⚖️',
      `
        <div style="background: rgba(5, 15, 30, 0.4); padding: 15px; border-radius: 6px; margin-bottom: 15px;">
          <h3 style="margin: 0 0 10px 0; color: ${OceanicColors.textPrimary};">Energy Cycle</h3>
          <div style="text-align: center; padding: 10px; background: rgba(0, 0, 0, 0.2); border-radius: 4px;">
            Resources → Prey → Predators → (Death) → Resources
          </div>
        </div>
        <div style="display: grid; gap: 15px;">
          <div>
            <h3 style="margin: 0 0 10px 0; color: ${OceanicColors.textPrimary}; font-size: 16px;">🟢 Resources</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Regenerate slowly over time</li>
              <li>Create richer clusters during blooms</li>
              <li>Decay if not consumed</li>
              <li>Bloom events create migration patterns</li>
            </ul>
          </div>
          <div>
            <h3 style="margin: 0 0 10px 0; color: ${OceanicColors.textPrimary}; font-size: 16px;">🔵 Prey</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Need 80% energy to reproduce</li>
              <li>Higher movement cost for strong prey</li>
              <li>Energy cost for escaping predators</li>
              <li>Metabolic efficiency improves with longevity</li>
            </ul>
          </div>
          <div>
            <h3 style="margin: 0 0 10px 0; color: ${OceanicColors.textPrimary}; font-size: 16px;">🔴 Predators</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Need 70% energy to reproduce</li>
              <li>Gain 85% of prey's energy when hunting</li>
              <li>Lose 60% energy during reproduction</li>
              <li>Higher hunting costs for strong predators</li>
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
          <div style="background: rgba(5, 15, 30, 0.4); padding: 15px; border-radius: 6px;">
            <h3 style="margin: 0 0 10px 0; color: ${OceanicColors.textPrimary};">Specialization Types</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <h4 style="margin: 0 0 5px 0; color: ${OceanicColors.textPrimary};">Specialists</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                  <li>Excel in one trait</li>
                  <li>Energy efficient</li>
                  <li>Environment sensitive</li>
                </ul>
              </div>
              <div>
                <h4 style="margin: 0 0 5px 0; color: ${OceanicColors.textPrimary};">Generalists</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                  <li>Balanced traits</li>
                  <li>More adaptable</li>
                  <li>Less efficient</li>
                </ul>
              </div>
            </div>
          </div>

          <div style="background: rgba(5, 15, 30, 0.4); padding: 15px; border-radius: 6px;">
            <h3 style="margin: 0 0 10px 0; color: ${OceanicColors.textPrimary};">Species Conversion</h3>
            <p style="margin: 0 0 10px 0; font-size: 13px;">In rare circumstances, creatures can evolve into a different species through extraordinary evolutionary leaps.</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <h4 style="margin: 0 0 5px 0; color: ${OceanicColors.prey};">Prey → Predator</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                  <li>Strength/stealth > 0.6</li>
                  <li>Isolated from predators</li>
                  <li>Extended prey contact</li>
                  <li>Bonus for traits > 0.9</li>
                </ul>
              </div>
              <div>
                <h4 style="margin: 0 0 5px 0; color: ${OceanicColors.predator};">Predator → Prey</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                  <li>Strength/stealth < 0.5</li>
                  <li>Isolated from prey</li>
                  <li>Extended predator contact</li>
                  <li>Bonus for traits < 0.1</li>
                </ul>
              </div>
            </div>

            <div style="margin-top: 10px; font-size: 12px; color: ${OceanicColors.textMuted}; padding: 8px; background: rgba(0, 0, 0, 0.2); border-radius: 4px;">
              💡 Species conversion and spontaneous prey spawning (when resources are abundant but prey are extinct) serve as natural recovery mechanisms, allowing the ecosystem to self-regulate.
            </div>
          </div>

          <div style="background: rgba(5, 15, 30, 0.4); padding: 15px; border-radius: 6px;">
            <h3 style="margin: 0 0 10px 0; color: ${OceanicColors.textPrimary};">Extinction Events</h3>
            <p style="margin: 0 0 10px 0; font-size: 13px;">Population crashes can lead to extinction events, triggered by various factors:</p>
            
            <div style="display: grid; gap: 10px;">
              <div>
                <h4 style="margin: 0 0 5px 0; color: ${OceanicColors.textPrimary};">Resource Collapse</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                  <li>Overgrazing by prey population</li>
                  <li>Resource decay in prey-scarce areas</li>
                  <li>Emergency regeneration triggers</li>
                </ul>
              </div>
              <div>
                <h4 style="margin: 0 0 5px 0; color: ${OceanicColors.textPrimary};">Population Crashes</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                  <li>Predator overhunting</li>
                  <li>Starvation cascades</li>
                  <li>Trait disadvantages</li>
                </ul>
              </div>
              <div style="margin-top: 5px; font-size: 12px; color: ${OceanicColors.textMuted}; padding: 8px; background: rgba(0, 0, 0, 0.2); border-radius: 4px;">
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
      this.panel.style.display = 'flex';
      const overlay = this.panel.previousElementSibling;
      if (overlay instanceof HTMLElement) {
        overlay.style.display = 'block';
      }
      
      // Add global keyboard event listener
      setTimeout(() => {
        this.panel.focus();
      }, 100);
      
      // Add global keyboard listener for Escape key
      document.addEventListener('keydown', this.handleGlobalKeyDown);
    }
  }

  hide(): void {
    if (this.panel instanceof HTMLElement) {
      this.panel.style.display = 'none';
      const overlay = this.panel.previousElementSibling;
      if (overlay instanceof HTMLElement) {
        overlay.style.display = 'none';
      }
      
      // Remove global keyboard listener
      document.removeEventListener('keydown', this.handleGlobalKeyDown);
    }
  }
  
  private handleGlobalKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.hide();
      event.preventDefault();
      event.stopPropagation();
    }
  }
} 