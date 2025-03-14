import { SimulationConfig } from '../config';

export class SettingsPanel {
  private panel: HTMLElement;
  private isVisible: boolean = false;
  private onSaveCallback: ((config: typeof SimulationConfig) => void) | null = null;

  constructor(container: HTMLElement) {
    // Create the panel container
    this.panel = document.createElement('div');
    this.panel.className = 'settings-panel';
    this.panel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80%;
      max-width: 1000px;
      height: 80vh;
      background: rgba(30, 30, 30, 0.95);
      border-radius: 8px;
      padding: 20px;
      display: none;
      z-index: 1000;
      overflow-y: auto;
      color: #fff;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    `;

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      color: #fff;
      font-size: 24px;
      cursor: pointer;
      padding: 5px 10px;
      border-radius: 4px;
    `;
    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    });
    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.backgroundColor = 'transparent';
    });
    closeButton.addEventListener('click', () => this.hide());
    this.panel.appendChild(closeButton);

    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Simulation Settings';
    title.style.cssText = `
      margin: 0 0 20px 0;
      font-size: 24px;
      font-weight: bold;
      color: #fff;
    `;
    this.panel.appendChild(title);

    // Create settings content
    this.createSettingsContent();

    // Add save button
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Changes';
    saveButton.style.cssText = `
      position: sticky;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #4CAF50;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      margin-top: 20px;
    `;
    saveButton.addEventListener('mouseenter', () => {
      saveButton.style.backgroundColor = '#45a049';
    });
    saveButton.addEventListener('mouseleave', () => {
      saveButton.style.backgroundColor = '#4CAF50';
    });
    saveButton.addEventListener('click', () => this.saveSettings());
    this.panel.appendChild(saveButton);

    // Add overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: none;
      z-index: 999;
    `;
    overlay.addEventListener('click', () => this.hide());

    // Add to container
    container.appendChild(overlay);
    container.appendChild(this.panel);
  }

  private createSettingsContent(): void {
    const content = document.createElement('div');
    content.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 60px;
    `;

    // Add sections
    content.appendChild(this.createInitialPopulationSection());
    content.appendChild(this.createResourceSection());
    content.appendChild(this.createCreatureSection());
    content.appendChild(this.createPredatorSection());
    content.appendChild(this.createPreySection());
    content.appendChild(this.createLearningSection());
    content.appendChild(this.createReproductionSection());
    content.appendChild(this.createStarvationSection());
    content.appendChild(this.createClusteredSpawningSection());
    content.appendChild(this.createSpeciesConversionSection());

    this.panel.appendChild(content);
  }

  private createSection(title: string, icon: string): HTMLElement {
    const section = document.createElement('div');
    section.className = 'settings-section';
    section.style.cssText = `
      background: rgba(40, 40, 40, 0.5);
      border-radius: 8px;
      padding: 15px;
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

    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    titleElement.style.cssText = `
      margin: 0;
      font-size: 18px;
      font-weight: bold;
      color: #fff;
    `;

    header.appendChild(iconElement);
    header.appendChild(titleElement);
    section.appendChild(header);

    return section;
  }

  private createNumberInput(
    label: string,
    value: number,
    min?: number,
    max?: number,
    step?: number,
    tooltip?: string
  ): HTMLElement {
    const container = document.createElement('div');
    container.style.cssText = `
      margin-bottom: 10px;
      position: relative;
    `;

    const labelElement = document.createElement('label');
    labelElement.style.cssText = `
      display: block;
      margin-bottom: 5px;
      font-size: 14px;
      color: #aaa;
    `;
    labelElement.textContent = label;

    if (tooltip) {
      const tooltipContainer = document.createElement('div');
      tooltipContainer.style.cssText = `
        display: inline-block;
        position: relative;
        margin-left: 5px;
      `;

      const tooltipIcon = document.createElement('span');
      tooltipIcon.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#666">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      `;
      tooltipIcon.style.cssText = `
        cursor: help;
        display: inline-flex;
        vertical-align: middle;
      `;

      const tooltipText = document.createElement('div');
      tooltipText.textContent = tooltip;
      tooltipText.style.cssText = `
        visibility: hidden;
        background-color: rgba(40, 40, 40, 0.95);
        color: #fff;
        text-align: center;
        padding: 8px 12px;
        border-radius: 6px;
        position: absolute;
        z-index: 1;
        width: 200px;
        left: 50%;
        transform: translateX(-50%);
        bottom: 125%;
        font-size: 12px;
        opacity: 0;
        transition: opacity 0.2s;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        pointer-events: none;
      `;

      // Add arrow
      const arrow = document.createElement('div');
      arrow.style.cssText = `
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: rgba(40, 40, 40, 0.95) transparent transparent transparent;
      `;
      tooltipText.appendChild(arrow);

      tooltipContainer.appendChild(tooltipIcon);
      tooltipContainer.appendChild(tooltipText);

      // Show/hide tooltip on hover
      tooltipContainer.addEventListener('mouseenter', () => {
        tooltipText.style.visibility = 'visible';
        tooltipText.style.opacity = '1';
      });

      tooltipContainer.addEventListener('mouseleave', () => {
        tooltipText.style.visibility = 'hidden';
        tooltipText.style.opacity = '0';
      });

      labelElement.appendChild(tooltipContainer);
    }

    const input = document.createElement('input');
    input.type = 'number';
    input.value = value.toString();
    if (min !== undefined) input.min = min.toString();
    if (max !== undefined) input.max = max.toString();
    if (step !== undefined) input.step = step.toString();
    input.style.cssText = `
      width: 100%;
      padding: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      background: rgba(30, 30, 30, 0.5);
      color: #fff;
      font-size: 14px;
    `;

    container.appendChild(labelElement);
    container.appendChild(input);
    return container;
  }

  private createInitialPopulationSection(): HTMLElement {
    const section = this.createSection('Initial Population', `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#4CAF50">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
      </svg>
    `);

    section.appendChild(this.createNumberInput(
      'Initial Resources',
      SimulationConfig.initialPopulation.resources,
      0,
      1000,
      10,
      'Number of food resources to spawn at simulation start'
    ));

    section.appendChild(this.createNumberInput(
      'Initial Prey',
      SimulationConfig.initialPopulation.prey,
      0,
      500,
      10,
      'Number of prey creatures to spawn at simulation start'
    ));

    section.appendChild(this.createNumberInput(
      'Initial Predators',
      SimulationConfig.initialPopulation.predators,
      0,
      100,
      5,
      'Number of predator creatures to spawn at simulation start'
    ));

    return section;
  }

  private createResourceSection(): HTMLElement {
    const section = this.createSection('Resources', `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#8BC34A">
        <path d="M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9zM5.6 10.25c0 1.38 1.12 2.5 2.5 2.5.53 0 1.01-.16 1.42-.44l-.02.19c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5l-.02-.19c.4.28.89.44 1.42.44 1.38 0 2.5-1.12 2.5-2.5 0-1-.59-1.85-1.43-2.25.84-.4 1.43-1.25 1.43-2.25 0-1.38-1.12-2.5-2.5-2.5-.53 0-1.01.16-1.42.44l.02-.19C14.5 2.12 13.38 1 12 1S9.5 2.12 9.5 3.5l.02.19c-.4-.28-.89-.44-1.42-.44-1.38 0-2.5 1.12-2.5 2.5 0 1 .59 1.85 1.43 2.25-.84.4-1.43 1.25-1.43 2.25zM12 5.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8s1.12-2.5 2.5-2.5z"/>
      </svg>
    `);

    section.appendChild(this.createNumberInput(
      'Default Energy',
      SimulationConfig.resources.defaultEnergy,
      1,
      50,
      1,
      'Energy value of each standard resource'
    ));

    section.appendChild(this.createNumberInput(
      'Regeneration Chance',
      SimulationConfig.resources.regenerationChance,
      0,
      1,
      0.01,
      'Probability of a new resource spawning each frame'
    ));

    // Add more resource settings...
    // (I'll continue with the rest of the sections in subsequent edits)

    return section;
  }

  private createCreatureSection(): HTMLElement {
    const section = this.createSection('Creature Settings', `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFB74D">
        <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"/>
        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
      </svg>
    `);

    section.appendChild(this.createNumberInput(
      'Base Speed',
      SimulationConfig.creatures.baseSpeed,
      0.1,
      10,
      0.1,
      'Base movement speed for all creatures'
    ));

    section.appendChild(this.createNumberInput(
      'Base Cost',
      SimulationConfig.creatures.baseCost,
      0.1,
      10,
      0.1,
      'Base energy cost for all actions'
    ));

    section.appendChild(this.createNumberInput(
      'Movement Cost Multiplier',
      SimulationConfig.creatures.movementCostMultiplier,
      0.1,
      5,
      0.1,
      'Multiplier for movement energy cost'
    ));

    return section;
  }

  private createPredatorSection(): HTMLElement {
    const section = this.createSection('Predator Settings', `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF5252">
        <path d="M12 2 L22 9 L19 20 L5 20 L2 9 Z"/>
      </svg>
    `);

    section.appendChild(this.createNumberInput(
      'Hunting Speed Multiplier',
      SimulationConfig.predator.huntingSpeedMultiplier,
      0.1,
      5,
      0.1,
      'Speed multiplier when chasing prey'
    ));

    section.appendChild(this.createNumberInput(
      'Detection Range Multiplier',
      SimulationConfig.predator.detectionRangeMultiplier,
      0.1,
      5,
      0.1,
      'Vision range multiplier for detecting prey'
    ));

    section.appendChild(this.createNumberInput(
      'Energy Gain from Prey',
      SimulationConfig.predator.energyGainFromPrey,
      1,
      100,
      1,
      'Energy gained from consuming prey'
    ));

    section.appendChild(this.createNumberInput(
      'Base Capture Chance',
      SimulationConfig.predator.captureChance.baseChance,
      0,
      1,
      0.01,
      'Base probability of successfully catching prey'
    ));

    return section;
  }

  private createPreySection(): HTMLElement {
    const section = this.createSection('Prey Settings', `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#64B5F6">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
      </svg>
    `);

    section.appendChild(this.createNumberInput(
      'Predator Avoidance Multiplier',
      SimulationConfig.prey.predatorAvoidanceMultiplier,
      0.1,
      5,
      0.1,
      'Speed multiplier when fleeing from predators'
    ));

    section.appendChild(this.createNumberInput(
      'Predator Detection Multiplier',
      SimulationConfig.prey.predatorDetectionMultiplier,
      0.1,
      5,
      0.1,
      'Vision range multiplier for detecting predators'
    ));

    section.appendChild(this.createNumberInput(
      'Resource Energy Bonus',
      SimulationConfig.prey.resourceEnergyBonus,
      1,
      50,
      1,
      'Additional energy gained from consuming resources'
    ));

    section.appendChild(this.createNumberInput(
      'Escape Base Chance',
      SimulationConfig.prey.escapeBaseChance,
      0,
      1,
      0.01,
      'Base probability of escaping from predators'
    ));

    return section;
  }

  private createLearningSection(): HTMLElement {
    const section = this.createSection('Learning Settings', `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#BA68C8">
        <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
      </svg>
    `);

    section.appendChild(this.createNumberInput(
      'Learning Rate',
      SimulationConfig.learning.learningRate,
      0.01,
      1,
      0.01,
      'Rate at which creatures learn from their experiences'
    ));

    section.appendChild(this.createNumberInput(
      'Maximum Learning Amount',
      SimulationConfig.learning.maxLearningAmount,
      0,
      100,
      1,
      'Maximum amount of learning possible'
    ));

    section.appendChild(this.createNumberInput(
      'Chance Multiplier',
      SimulationConfig.learning.chanceMultiplier,
      0,
      5,
      0.1,
      'Multiplier for learning probability'
    ));

    return section;
  }

  private createReproductionSection(): HTMLElement {
    const section = this.createSection('Reproduction Settings', `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#81C784">
        <path d="M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9zM5.6 10.25c0 1.38 1.12 2.5 2.5 2.5.53 0 1.01-.16 1.42-.44l-.02.19c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5l-.02-.19c.4.28.89.44 1.42.44 1.38 0 2.5-1.12 2.5-2.5 0-1-.59-1.85-1.43-2.25.84-.4 1.43-1.25 1.43-2.25 0-1.38-1.12-2.5-2.5-2.5-.53 0-1.01.16-1.42.44l.02-.19C14.5 2.12 13.38 1 12 1S9.5 2.12 9.5 3.5l.02.19c-.4-.28-.89-.44-1.42-.44-1.38 0-2.5 1.12-2.5 2.5 0 1 .59 1.85 1.43 2.25-.84.4-1.43 1.25-1.43 2.25z"/>
      </svg>
    `);

    section.appendChild(this.createNumberInput(
      'Energy Threshold (Prey)',
      SimulationConfig.reproduction.energyThreshold.prey,
      10,
      200,
      10,
      'Minimum energy required for prey reproduction'
    ));

    section.appendChild(this.createNumberInput(
      'Energy Threshold (Predator)',
      SimulationConfig.reproduction.energyThreshold.predator,
      10,
      200,
      10,
      'Minimum energy required for predator reproduction'
    ));

    section.appendChild(this.createNumberInput(
      'Mutation Chance',
      SimulationConfig.reproduction.mutationChance,
      0,
      1,
      0.01,
      'Probability of trait mutation during reproduction'
    ));

    section.appendChild(this.createNumberInput(
      'Mutation Range',
      SimulationConfig.reproduction.mutationRange,
      0,
      1,
      0.01,
      'Range of possible mutation changes'
    ));

    return section;
  }

  private createStarvationSection(): HTMLElement {
    const section = this.createSection('Starvation Settings', `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF7043">
        <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
      </svg>
    `);

    section.appendChild(this.createNumberInput(
      'Prey Energy Threshold',
      SimulationConfig.starvation.prey.thresholds[0].energyPercent,
      0,
      100,
      5,
      'Energy percentage at which prey start starving'
    ));

    section.appendChild(this.createNumberInput(
      'Predator Energy Threshold',
      SimulationConfig.starvation.predator.thresholds[0].energyPercent,
      0,
      100,
      5,
      'Energy percentage at which predators start starving'
    ));

    return section;
  }

  private createClusteredSpawningSection(): HTMLElement {
    const section = this.createSection('Clustered Spawning', `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#9575CD">
        <path d="M3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2zm16 14H5V5h14v14zM11 7h2v2h-2V7zM7 7h2v2H7V7zm8 0h2v2h-2V7zm-8 4h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"/>
      </svg>
    `);

    section.appendChild(this.createNumberInput(
      'Resource Clusters',
      SimulationConfig.clusteredSpawning.resources.clusterCount,
      1,
      20,
      1,
      'Number of resource clusters'
    ));

    section.appendChild(this.createNumberInput(
      'Prey Cluster Radius',
      SimulationConfig.clusteredSpawning.prey.radius,
      10,
      200,
      10,
      'Radius of prey spawn clusters'
    ));

    section.appendChild(this.createNumberInput(
      'Predator Cluster Radius',
      SimulationConfig.clusteredSpawning.predator.radius,
      10,
      200,
      10,
      'Radius of predator spawn clusters'
    ));

    return section;
  }

  private createSpeciesConversionSection(): HTMLElement {
    const section = this.createSection('Species Conversion', `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#4DB6AC">
        <path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"/>
      </svg>
    `);

    section.appendChild(this.createNumberInput(
      'Contact Window',
      SimulationConfig.speciesConversion.contactTracking.frameWindow,
      10,
      1000,
      10,
      'Time window for tracking species interactions'
    ));

    section.appendChild(this.createNumberInput(
      'Required Same-Species Contacts',
      SimulationConfig.speciesConversion.contactTracking.sameSpeciesContactRequired,
      1,
      50,
      1,
      'Number of same-species contacts required for conversion'
    ));

    section.appendChild(this.createNumberInput(
      'Isolation Threshold',
      SimulationConfig.speciesConversion.contactTracking.isolationThreshold,
      0,
      100,
      1,
      'Contact threshold for considering a creature isolated'
    ));

    return section;
  }

  show(): void {
    if (this.panel instanceof HTMLElement) {
      this.panel.style.display = 'block';
      const overlay = this.panel.previousElementSibling;
      if (overlay instanceof HTMLElement) {
        overlay.style.display = 'block';
      }
    }
    this.isVisible = true;
  }

  hide(): void {
    if (this.panel instanceof HTMLElement) {
      this.panel.style.display = 'none';
      const overlay = this.panel.previousElementSibling;
      if (overlay instanceof HTMLElement) {
        overlay.style.display = 'none';
      }
    }
    this.isVisible = false;
  }

  onSave(callback: (config: typeof SimulationConfig) => void): void {
    this.onSaveCallback = callback;
  }

  private saveSettings(): void {
    // TODO: Gather all input values and create updated config
    if (this.onSaveCallback) {
      // this.onSaveCallback(updatedConfig);
    }
    this.hide();
  }
} 