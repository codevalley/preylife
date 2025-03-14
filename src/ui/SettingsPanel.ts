import { SimulationConfig } from '../config';

export class SettingsPanel {
  private panel: HTMLElement;
  private _isVisible: boolean = false;
  private onSaveCallback: ((config: typeof SimulationConfig) => void) | null = null;
  private defaultConfig: typeof SimulationConfig;
  private showAdvanced: boolean = false;
  private currentConfig: any = {};

  get isVisible(): boolean {
    return this._isVisible;
  }

  constructor(container: HTMLElement) {
    // Store a deep copy of the default config for resetting
    this.defaultConfig = JSON.parse(JSON.stringify(SimulationConfig));
    
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

    // Add buttons row
    const buttonsRow = document.createElement('div');
    buttonsRow.style.cssText = `
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      position: sticky;
      bottom: 0;
      background: rgba(30, 30, 30, 0.95);
      padding: 10px 0;
    `;

    // Add restore defaults button
    const restoreButton = document.createElement('button');
    restoreButton.textContent = 'Restore Defaults';
    restoreButton.style.cssText = `
      background: #777;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    `;
    restoreButton.addEventListener('mouseenter', () => {
      restoreButton.style.backgroundColor = '#888';
    });
    restoreButton.addEventListener('mouseleave', () => {
      restoreButton.style.backgroundColor = '#777';
    });
    restoreButton.addEventListener('click', () => this.restoreDefaults());
    buttonsRow.appendChild(restoreButton);

    // Add toggle advanced button
    const toggleAdvancedButton = document.createElement('button');
    toggleAdvancedButton.textContent = 'Show Advanced Settings';
    toggleAdvancedButton.style.cssText = `
      background: #555;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    `;
    toggleAdvancedButton.addEventListener('mouseenter', () => {
      toggleAdvancedButton.style.backgroundColor = '#666';
    });
    toggleAdvancedButton.addEventListener('mouseleave', () => {
      toggleAdvancedButton.style.backgroundColor = '#555';
    });
    toggleAdvancedButton.addEventListener('click', () => {
      this.showAdvanced = !this.showAdvanced;
      toggleAdvancedButton.textContent = this.showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings';
      this.updateAdvancedVisibility();
    });
    buttonsRow.appendChild(toggleAdvancedButton);

    // Add save button
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Changes';
    saveButton.style.cssText = `
      background: #4CAF50;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    `;
    saveButton.addEventListener('mouseenter', () => {
      saveButton.style.backgroundColor = '#45a049';
    });
    saveButton.addEventListener('mouseleave', () => {
      saveButton.style.backgroundColor = '#4CAF50';
    });
    saveButton.addEventListener('click', () => this.saveSettings());
    buttonsRow.appendChild(saveButton);

    this.panel.appendChild(buttonsRow);

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
    content.id = 'settings-content';
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
    this.updateAdvancedVisibility();
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
    configPath: string,
    min?: number,
    max?: number,
    step?: number,
    tooltip?: string,
    isAdvanced: boolean = false
  ): HTMLElement {
    const container = document.createElement('div');
    container.className = isAdvanced ? 'advanced-setting' : '';
    container.dataset.configPath = configPath;
    container.style.cssText = `
      margin-bottom: 10px;
      position: relative;
    `;

    if (isAdvanced) {
      container.style.display = this.showAdvanced ? 'block' : 'none';
    }

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
    input.dataset.configPath = configPath;
    
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

    // Add change event to store value
    input.addEventListener('change', () => {
      this.setConfigValue(configPath, parseFloat(input.value));
    });

    container.appendChild(labelElement);
    container.appendChild(input);
    return container;
  }

  private createCheckboxInput(
    label: string,
    value: boolean,
    configPath: string,
    tooltip?: string,
    isAdvanced: boolean = false
  ): HTMLElement {
    const container = document.createElement('div');
    container.className = isAdvanced ? 'advanced-setting' : '';
    container.dataset.configPath = configPath;
    container.style.cssText = `
      margin-bottom: 10px;
      position: relative;
      display: flex;
      align-items: center;
    `;

    if (isAdvanced) {
      container.style.display = this.showAdvanced ? 'flex' : 'none';
    }

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = value;
    input.dataset.configPath = configPath;
    input.id = `checkbox-${configPath.replace(/\./g, '-')}`;
    input.style.cssText = `
      margin-right: 8px;
    `;

    // Add change event to store value
    input.addEventListener('change', () => {
      this.setConfigValue(configPath, input.checked);
    });

    const labelElement = document.createElement('label');
    labelElement.htmlFor = input.id;
    labelElement.style.cssText = `
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

    container.appendChild(input);
    container.appendChild(labelElement);
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
      'initialPopulation.resources',
      0,
      1000,
      10,
      'Number of food resources to spawn at simulation start'
    ));

    section.appendChild(this.createNumberInput(
      'Initial Prey',
      SimulationConfig.initialPopulation.prey,
      'initialPopulation.prey',
      0,
      500,
      10,
      'Number of prey creatures to spawn at simulation start'
    ));

    section.appendChild(this.createNumberInput(
      'Initial Predators',
      SimulationConfig.initialPopulation.predators,
      'initialPopulation.predators',
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
      'resources.defaultEnergy',
      1,
      50,
      1,
      'Energy value of each standard resource'
    ));

    section.appendChild(this.createNumberInput(
      'Regeneration Chance',
      SimulationConfig.resources.regenerationChance,
      'resources.regenerationChance',
      0,
      1,
      0.01,
      'Probability of a new resource spawning each frame'
    ));

    section.appendChild(this.createNumberInput(
      'Emergency Regeneration Threshold',
      SimulationConfig.resources.emergencyRegenerationThreshold,
      'resources.emergencyRegenerationThreshold',
      0,
      1,
      0.01,
      'When prey population falls below this % of initial count, trigger emergency resources'
    ));

    section.appendChild(this.createNumberInput(
      'Emergency Regeneration Chance',
      SimulationConfig.resources.emergencyRegenerationChance,
      'resources.emergencyRegenerationChance',
      0,
      1,
      0.01,
      'Higher probability of resource spawning during emergency conditions'
    ));

    section.appendChild(this.createNumberInput(
      'Emergency Energy Bonus',
      SimulationConfig.resources.emergencyEnergyBonus,
      'resources.emergencyEnergyBonus',
      1,
      5,
      0.1,
      'Energy multiplier for resources spawned during emergency conditions'
    ));

    section.appendChild(this.createNumberInput(
      'Decay Chance',
      SimulationConfig.resources.decayChance,
      'resources.decayChance',
      0,
      1,
      0.01,
      'Probability of resources decaying when no prey exist in the ecosystem',
      true
    ));

    // Resource limits
    section.appendChild(this.createNumberInput(
      'Max Resource Count',
      SimulationConfig.resources.limits.maxCount,
      'resources.limits.maxCount',
      100,
      5000,
      100,
      'Absolute maximum number of resources allowed in simulation at once',
      true
    ));

    section.appendChild(this.createCheckboxInput(
      'Enable Resource Decay',
      SimulationConfig.resources.limits.enableDecay,
      'resources.limits.enableDecay',
      'Whether resources naturally decay over time',
      true
    ));

    section.appendChild(this.createNumberInput(
      'Resource Lifespan',
      SimulationConfig.resources.limits.decayLifespan,
      'resources.limits.decayLifespan',
      1,
      100,
      1,
      'Number of days a resource exists before it becomes eligible for natural decay',
      true
    ));

    section.appendChild(this.createNumberInput(
      'Decay Chance Per Frame',
      SimulationConfig.resources.limits.decayChancePerFrame,
      'resources.limits.decayChancePerFrame',
      0,
      0.1,
      0.001,
      'Probability per frame that an old resource will decay',
      true
    ));

    // Resource bloom settings
    section.appendChild(this.createNumberInput(
      'Bloom Cluster Count',
      SimulationConfig.resources.bloom.clusterCount,
      'resources.bloom.clusterCount',
      1,
      20,
      1,
      'Number of distinct resource clusters to create during a bloom event',
      true
    ));

    section.appendChild(this.createNumberInput(
      'Bloom Primary Energy Multiplier',
      SimulationConfig.resources.bloom.primaryEnergyMultiplier,
      'resources.bloom.primaryEnergyMultiplier',
      1,
      5,
      0.1,
      'Energy value multiplier for resources in primary clusters',
      true
    ));

    section.appendChild(this.createNumberInput(
      'Bloom Secondary Energy Multiplier',
      SimulationConfig.resources.bloom.secondaryEnergyMultiplier,
      'resources.bloom.secondaryEnergyMultiplier',
      1,
      5,
      0.1,
      'Energy value multiplier for resources in secondary clusters',
      true
    ));

    section.appendChild(this.createNumberInput(
      'Bloom Duration',
      SimulationConfig.resources.bloom.bloomDuration,
      'resources.bloom.bloomDuration',
      1,
      50,
      1,
      'Number of days the bloom event lasts before returning to normal',
      true
    ));

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
      'creatures.baseSpeed',
      0.1,
      20,
      0.1,
      'Base movement speed for all creatures'
    ));

    section.appendChild(this.createNumberInput(
      'Base Energy Cost',
      SimulationConfig.creatures.baseCost,
      'creatures.baseCost',
      0.1,
      10,
      0.1,
      'Base energy cost for all actions'
    ));

    section.appendChild(this.createNumberInput(
      'Movement Cost Multiplier',
      SimulationConfig.creatures.movementCostMultiplier,
      'creatures.movementCostMultiplier',
      0.1,
      10,
      0.1,
      'Multiplier for movement energy cost'
    ));

    // Lifespan settings
    section.appendChild(this.createNumberInput(
      'Base Lifespan',
      SimulationConfig.creatures.maxLifespan.base,
      'creatures.maxLifespan.base',
      10,
      300,
      10,
      'Base lifespan in seconds for all creatures'
    ));

    section.appendChild(this.createNumberInput(
      'Longevity Bonus',
      SimulationConfig.creatures.maxLifespan.longevityBonus,
      'creatures.maxLifespan.longevityBonus',
      0,
      200,
      10,
      'Additional seconds of lifespan granted at maximum longevity trait (1.0)'
    ));

    // Energy consumption multipliers
    section.appendChild(this.createNumberInput(
      'Predator Energy Consumption',
      SimulationConfig.creatures.energyConsumption.predator,
      'creatures.energyConsumption.predator',
      0.1,
      2,
      0.1,
      'Energy consumption multiplier for predators (lower = more efficient)',
      true
    ));

    section.appendChild(this.createNumberInput(
      'Prey Energy Consumption',
      SimulationConfig.creatures.energyConsumption.prey,
      'creatures.energyConsumption.prey',
      0.1,
      2,
      0.1,
      'Energy consumption multiplier for prey (lower = more efficient)',
      true
    ));

    // Interaction ranges
    section.appendChild(this.createNumberInput(
      'Resource Consumption Range',
      SimulationConfig.creatures.interactionRanges.resourceConsumption,
      'creatures.interactionRanges.resourceConsumption',
      1,
      50,
      1,
      'Distance at which prey can consume resources',
      true
    ));

    section.appendChild(this.createNumberInput(
      'Prey Capture Range',
      SimulationConfig.creatures.interactionRanges.preyCaptureRange,
      'creatures.interactionRanges.preyCaptureRange',
      1,
      50,
      1,
      'Distance at which predators can attempt to capture prey',
      true
    ));

    section.appendChild(this.createNumberInput(
      'Predator Detection Range',
      SimulationConfig.creatures.interactionRanges.preyDetectionRange,
      'creatures.interactionRanges.preyDetectionRange',
      10,
      200,
      10,
      'Distance at which predators can detect prey',
      true
    ));

    section.appendChild(this.createNumberInput(
      'Resource Detection Range',
      SimulationConfig.creatures.interactionRanges.preyResourceDetectionRange,
      'creatures.interactionRanges.preyResourceDetectionRange',
      10,
      200,
      10,
      'Distance at which prey can detect resources',
      true
    ));

    section.appendChild(this.createNumberInput(
      'Predator Detection Range (Prey)',
      SimulationConfig.creatures.interactionRanges.preyPredatorDetectionRange,
      'creatures.interactionRanges.preyPredatorDetectionRange',
      10,
      200,
      10,
      'Distance at which prey can detect approaching predators',
      true
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
      'Max Energy',
      SimulationConfig.predator.maxEnergy,
      'predator.maxEnergy',
      100,
      1000,
      50,
      'Maximum energy capacity for predators'
    ));

    // Default attributes
    section.appendChild(this.createNumberInput(
      'Default Strength',
      SimulationConfig.predator.defaultAttributes.strength,
      'predator.defaultAttributes.strength',
      0,
      1,
      0.05,
      'Default physical power for newly spawned predators'
    ));

    section.appendChild(this.createNumberInput(
      'Default Stealth',
      SimulationConfig.predator.defaultAttributes.stealth,
      'predator.defaultAttributes.stealth',
      0,
      1,
      0.05,
      'Default sneakiness for newly spawned predators'
    ));

    section.appendChild(this.createNumberInput(
      'Default Learnability',
      SimulationConfig.predator.defaultAttributes.learnability,
      'predator.defaultAttributes.learnability',
      0,
      1,
      0.05,
      'Default adaptability for newly spawned predators'
    ));

    section.appendChild(this.createNumberInput(
      'Default Longevity',
      SimulationConfig.predator.defaultAttributes.longevity,
      'predator.defaultAttributes.longevity',
      0,
      1,
      0.05,
      'Default lifespan factor for newly spawned predators'
    ));

    // Capture chance parameters
    section.appendChild(this.createNumberInput(
      'Strength Impact on Capture',
      SimulationConfig.predator.captureChance.strengthMultiplier,
      'predator.captureChance.strengthMultiplier',
      0,
      2,
      0.1,
      'Impact of strength trait on capture success'
    ));

    section.appendChild(this.createNumberInput(
      'Base Capture Chance',
      SimulationConfig.predator.captureChance.baseChance,
      'predator.captureChance.baseChance',
      0,
      1,
      0.01,
      'Base probability of successfully catching prey'
    ));

    section.appendChild(this.createNumberInput(
      'Minimum Capture Chance',
      SimulationConfig.predator.captureChance.minChance,
      'predator.captureChance.minChance',
      0,
      1,
      0.01,
      'Absolute minimum capture probability regardless of traits',
      true
    ));

    section.appendChild(this.createNumberInput(
      'Maximum Capture Chance',
      SimulationConfig.predator.captureChance.maxChance,
      'predator.captureChance.maxChance',
      0,
      1,
      0.01,
      'Absolute maximum capture probability regardless of traits',
      true
    ));

    // Other predator parameters
    section.appendChild(this.createNumberInput(
      'Energy Gain from Prey',
      SimulationConfig.predator.energyGainFromPrey,
      'predator.energyGainFromPrey',
      0,
      1,
      0.01,
      'Proportion of prey\'s energy gained when consumed'
    ));

    section.appendChild(this.createNumberInput(
      'Hunting Speed Boost',
      SimulationConfig.predator.huntingSpeedMultiplier,
      'predator.huntingSpeedMultiplier',
      0,
      2,
      0.1,
      'Speed boost factor when actively hunting'
    ));

    section.appendChild(this.createNumberInput(
      'Detection Range Boost',
      SimulationConfig.predator.detectionRangeMultiplier,
      'predator.detectionRangeMultiplier',
      0,
      2,
      0.1,
      'Detection range increase factor when hungry'
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
      'Max Energy',
      SimulationConfig.prey.maxEnergy,
      'prey.maxEnergy',
      50,
      500,
      25,
      'Maximum energy capacity for prey'
    ));

    // Default attributes
    section.appendChild(this.createNumberInput(
      'Default Strength',
      SimulationConfig.prey.defaultAttributes.strength,
      'prey.defaultAttributes.strength',
      0,
      1,
      0.05,
      'Default physical power for newly spawned prey'
    ));

    section.appendChild(this.createNumberInput(
      'Default Stealth',
      SimulationConfig.prey.defaultAttributes.stealth,
      'prey.defaultAttributes.stealth',
      0,
      1,
      0.05,
      'Default evasiveness for newly spawned prey'
    ));

    section.appendChild(this.createNumberInput(
      'Default Learnability',
      SimulationConfig.prey.defaultAttributes.learnability,
      'prey.defaultAttributes.learnability',
      0,
      1,
      0.05,
      'Default adaptability for newly spawned prey'
    ));

    section.appendChild(this.createNumberInput(
      'Default Longevity',
      SimulationConfig.prey.defaultAttributes.longevity,
      'prey.defaultAttributes.longevity',
      0,
      1,
      0.05,
      'Default lifespan factor for newly spawned prey'
    ));

    // Other prey parameters
    section.appendChild(this.createNumberInput(
      'Resource Energy Bonus',
      SimulationConfig.prey.resourceEnergyBonus,
      'prey.resourceEnergyBonus',
      1,
      5,
      0.1,
      'Multiplier for energy gained from consuming resources'
    ));

    section.appendChild(this.createNumberInput(
      'Predator Avoidance Speed',
      SimulationConfig.prey.predatorAvoidanceMultiplier,
      'prey.predatorAvoidanceMultiplier',
      0.5,
      3,
      0.1,
      'Speed boost factor when fleeing from predators'
    ));

    section.appendChild(this.createNumberInput(
      'Predator Detection Boost',
      SimulationConfig.prey.predatorDetectionMultiplier,
      'prey.predatorDetectionMultiplier',
      0.5,
      3,
      0.1,
      'Factor for how much stealth improves predator detection range'
    ));

    section.appendChild(this.createNumberInput(
      'Escape Base Chance',
      SimulationConfig.prey.escapeBaseChance,
      'prey.escapeBaseChance',
      0,
      1,
      0.01,
      'Base probability of escaping when caught by a predator'
    ));

    section.appendChild(this.createNumberInput(
      'Escape Energy Cost',
      SimulationConfig.prey.escapeEnergyConsumption,
      'prey.escapeEnergyConsumption',
      0,
      50,
      1,
      'Energy cost when attempting to escape from a predator'
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
      'learning.learningRate',
      0.01,
      1,
      0.01,
      'Rate at which creatures learn from their experiences'
    ));

    section.appendChild(this.createNumberInput(
      'Maximum Learning Amount',
      SimulationConfig.learning.maxLearningAmount,
      'learning.maxLearningAmount',
      0.01,
      0.5,
      0.01,
      'Maximum trait change possible from a single learning event'
    ));

    section.appendChild(this.createNumberInput(
      'Chance Multiplier',
      SimulationConfig.learning.chanceMultiplier,
      'learning.chanceMultiplier',
      0,
      1,
      0.01,
      'Base probability multiplier for learning'
    ));

    section.appendChild(this.createNumberInput(
      'Energy Cost',
      SimulationConfig.learning.energyCost,
      'learning.energyCost',
      0,
      50,
      1,
      'Energy cost for learning from others'
    ));

    return section;
  }

  private createReproductionSection(): HTMLElement {
    const section = this.createSection('Reproduction Settings', `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#81C784">
        <path d="M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9zM5.6 10.25c0 1.38 1.12 2.5 2.5 2.5.53 0 1.01-.16 1.42-.44l-.02.19c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5l-.02-.19c.4.28.89.44 1.42.44 1.38 0 2.5-1.12 2.5-2.5 0-1-.59-1.85-1.43-2.25.84-.4 1.43-1.25 1.43-2.25 0-1.38-1.12-2.5-2.5-2.5-.53 0-1.01.16-1.42.44l.02-.19C14.5 2.12 13.38 1 12 1S9.5 2.12 9.5 3.5l.02.19c-.4-.28-.89-.44-1.42-.44-1.38 0-2.5 1.12-2.5 2.5 0 1 .59 1.85 1.43 2.25-.84.4-1.43 1.25-1.43 2.25z"/>
      </svg>
    `);

    // Basic mutation settings
    section.appendChild(this.createNumberInput(
      'Standard Mutation Range',
      SimulationConfig.reproduction.mutationRange,
      'reproduction.mutationRange',
      0,
      1,
      0.01,
      'Standard mutation range for offspring traits'
    ));

    section.appendChild(this.createNumberInput(
      'Mutation Chance',
      SimulationConfig.reproduction.mutationChance,
      'reproduction.mutationChance',
      0,
      1,
      0.01,
      'Probability of a significant mutation occurring'
    ));

    section.appendChild(this.createNumberInput(
      'Significant Mutation Range',
      SimulationConfig.reproduction.significantMutationRange,
      'reproduction.significantMutationRange',
      0,
      1,
      0.05,
      'Range for significant mutations',
      true
    ));

    section.appendChild(this.createNumberInput(
      'Energy Capacity Mutation',
      SimulationConfig.reproduction.energyCapacityMutationRange,
      'reproduction.energyCapacityMutationRange',
      0,
      1,
      0.01,
      'Standard mutation range for max energy',
      true
    ));

    section.appendChild(this.createNumberInput(
      'Significant Energy Mutation',
      SimulationConfig.reproduction.significantEnergyCapacityMutationRange,
      'reproduction.significantEnergyCapacityMutationRange',
      0,
      1,
      0.05,
      'Range for significant max energy mutations',
      true
    ));

    // Energy thresholds
    section.appendChild(this.createNumberInput(
      'Prey Energy Threshold',
      SimulationConfig.reproduction.energyThreshold.prey,
      'reproduction.energyThreshold.prey',
      0,
      1,
      0.05,
      'Energy percentage threshold for high reproduction chance in prey'
    ));

    section.appendChild(this.createNumberInput(
      'Predator Energy Threshold',
      SimulationConfig.reproduction.energyThreshold.predator,
      'reproduction.energyThreshold.predator',
      0,
      1,
      0.05,
      'Energy percentage threshold for high reproduction chance in predators'
    ));

    // Reproduction probabilities
    section.appendChild(this.createNumberInput(
      'Prey High Energy Reproduction',
      SimulationConfig.reproduction.probability.highEnergy.prey,
      'reproduction.probability.highEnergy.prey',
      0,
      1,
      0.01,
      'Probability per update for prey above energy threshold',
      true
    ));

    section.appendChild(this.createNumberInput(
      'Predator High Energy Reproduction',
      SimulationConfig.reproduction.probability.highEnergy.predator,
      'reproduction.probability.highEnergy.predator',
      0,
      1,
      0.01,
      'Probability per update for predators above energy threshold',
      true
    ));

    section.appendChild(this.createNumberInput(
      'Prey Low Energy Reproduction',
      SimulationConfig.reproduction.probability.lowEnergy.prey,
      'reproduction.probability.lowEnergy.prey',
      0,
      0.05,
      0.001,
      'Probability per update for prey with moderate energy',
      true
    ));

    section.appendChild(this.createNumberInput(
      'Predator Low Energy Reproduction',
      SimulationConfig.reproduction.probability.lowEnergy.predator,
      'reproduction.probability.lowEnergy.predator',
      0,
      0.05,
      0.001,
      'Probability per update for predators with moderate energy',
      true
    ));

    // Cooldown periods
    section.appendChild(this.createNumberInput(
      'Prey Reproduction Cooldown',
      SimulationConfig.reproduction.cooldown.prey,
      'reproduction.cooldown.prey',
      1,
      30,
      1,
      'Days until prey can reproduce again at full probability'
    ));

    section.appendChild(this.createNumberInput(
      'Predator Reproduction Cooldown',
      SimulationConfig.reproduction.cooldown.predator,
      'reproduction.cooldown.predator',
      1,
      30,
      1,
      'Days until predators can reproduce again at full probability'
    ));

    // Juvenile settings
    section.appendChild(this.createNumberInput(
      'Juvenile Maturity',
      SimulationConfig.reproduction.juvenileMaturity,
      'reproduction.juvenileMaturity',
      0,
      1,
      0.05,
      'Proportion of lifespan before creature can reproduce',
      true
    ));

    section.appendChild(this.createNumberInput(
      'Juvenile Reproduction Probability',
      SimulationConfig.reproduction.juvenileReproductionProbability,
      'reproduction.juvenileReproductionProbability',
      0,
      0.1,
      0.01,
      'Low probability for juvenile reproduction if it occurs',
      true
    ));

    return section;
  }

  private createStarvationSection(): HTMLElement {
    const section = this.createSection('Starvation Settings', `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF7043">
        <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
      </svg>
    `);

    // Prey starvation thresholds
    for (let i = 0; i < SimulationConfig.starvation.prey.thresholds.length; i++) {
      const threshold = SimulationConfig.starvation.prey.thresholds[i];
      
      section.appendChild(this.createNumberInput(
        `Prey Energy ${threshold.energyPercent * 100}%`,
        threshold.probability,
        `starvation.prey.thresholds.${i}.probability`,
        0,
        0.1,
        0.0001,
        `Death probability per update at ${threshold.energyPercent * 100}% energy for prey`,
        i > 2 // Only first 3 thresholds are basic, rest are advanced
      ));
    }

    // Predator starvation thresholds
    for (let i = 0; i < SimulationConfig.starvation.predator.thresholds.length; i++) {
      const threshold = SimulationConfig.starvation.predator.thresholds[i];
      
      section.appendChild(this.createNumberInput(
        `Predator Energy ${threshold.energyPercent * 100}%`,
        threshold.probability,
        `starvation.predator.thresholds.${i}.probability`,
        0,
        0.5,
        0.001,
        `Death probability per update at ${threshold.energyPercent * 100}% energy for predators`,
        i > 2 // Only first 3 thresholds are basic, rest are advanced
      ));
    }

    return section;
  }

  private createClusteredSpawningSection(): HTMLElement {
    const section = this.createSection('Clustered Spawning', `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#9575CD">
        <path d="M3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2zm16 14H5V5h14v14zM11 7h2v2h-2V7zM7 7h2v2H7V7zm8 0h2v2h-2V7zm-8 4h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"/>
      </svg>
    `);

    // Resource clustering
    section.appendChild(this.createNumberInput(
      'Resource Clusters',
      SimulationConfig.clusteredSpawning.resources.clusterCount,
      'clusteredSpawning.resources.clusterCount',
      1,
      20,
      1,
      'Number of resource clusters to create during initial spawning'
    ));

    // Prey clustering
    section.appendChild(this.createNumberInput(
      'Minimum Prey Clusters',
      SimulationConfig.clusteredSpawning.prey.minClusters,
      'clusteredSpawning.prey.minClusters',
      1,
      10,
      1,
      'Minimum number of prey clusters to create during initial spawning',
      true
    ));

    section.appendChild(this.createNumberInput(
      'Maximum Prey Clusters',
      SimulationConfig.clusteredSpawning.prey.maxClusters,
      'clusteredSpawning.prey.maxClusters',
      1,
      10,
      1,
      'Maximum number of prey clusters to create during initial spawning',
      true
    ));

    section.appendChild(this.createNumberInput(
      'Prey Cluster Radius',
      SimulationConfig.clusteredSpawning.prey.radius,
      'clusteredSpawning.prey.radius',
      10,
      200,
      10,
      'Radius of prey spawn clusters'
    ));

    // Predator clustering
    section.appendChild(this.createNumberInput(
      'Minimum Predator Clusters',
      SimulationConfig.clusteredSpawning.predator.minClusters,
      'clusteredSpawning.predator.minClusters',
      1,
      5,
      1,
      'Minimum number of predator clusters to create during initial spawning',
      true
    ));

    section.appendChild(this.createNumberInput(
      'Maximum Predator Clusters',
      SimulationConfig.clusteredSpawning.predator.maxClusters,
      'clusteredSpawning.predator.maxClusters',
      1,
      5,
      1,
      'Maximum number of predator clusters to create during initial spawning',
      true
    ));

    section.appendChild(this.createNumberInput(
      'Predator Cluster Radius',
      SimulationConfig.clusteredSpawning.predator.radius,
      'clusteredSpawning.predator.radius',
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

    // Enable/disable species conversion
    section.appendChild(this.createCheckboxInput(
      'Enable Species Conversion',
      SimulationConfig.speciesConversion.enabled,
      'speciesConversion.enabled',
      'Master toggle for species conversion feature'
    ));

    // Contact tracking parameters
    section.appendChild(this.createNumberInput(
      'Contact Window',
      SimulationConfig.speciesConversion.contactTracking.frameWindow,
      'speciesConversion.contactTracking.frameWindow',
      10,
      1000,
      10,
      'Number of frames to analyze for contact history'
    ));

    section.appendChild(this.createNumberInput(
      'Required Same-Species Contacts',
      SimulationConfig.speciesConversion.contactTracking.sameSpeciesContactRequired,
      'speciesConversion.contactTracking.sameSpeciesContactRequired',
      1,
      1000,
      10,
      'Minimum same-species contacts needed in window'
    ));

    section.appendChild(this.createCheckboxInput(
      'Reset on Opposite Contact',
      SimulationConfig.speciesConversion.contactTracking.resetOnOppositeContact,
      'speciesConversion.contactTracking.resetOnOppositeContact',
      'Whether to reset contact counter when meeting opposite species',
      true
    ));

    section.appendChild(this.createNumberInput(
      'Contact Memory Duration',
      SimulationConfig.speciesConversion.contactTracking.contactMemoryDuration,
      'speciesConversion.contactTracking.contactMemoryDuration',
      100,
      2000,
      100,
      'Maximum frames to remember contact history',
      true
    ));

    section.appendChild(this.createNumberInput(
      'Isolation Threshold',
      SimulationConfig.speciesConversion.contactTracking.isolationThreshold,
      'speciesConversion.contactTracking.isolationThreshold',
      100,
      1000,
      50,
      'Frames without opposite species contact to consider isolated'
    ));

    // Conversion probability
    section.appendChild(this.createNumberInput(
      'Base Conversion Probability',
      SimulationConfig.speciesConversion.baseProbability,
      'speciesConversion.baseProbability',
      0,
      0.5,
      0.01,
      'Base probability for conversion check per eligible creature'
    ));

    // Population conditions
    section.appendChild(this.createCheckboxInput(
      'Enable Population Conditions',
      SimulationConfig.speciesConversion.populationConditions.enabled,
      'speciesConversion.populationConditions.enabled',
      'Whether to enable population-based conversion triggers',
      true
    ));

    section.appendChild(this.createNumberInput(
      'Cooldown Period',
      SimulationConfig.speciesConversion.evolutionCooldown,
      'speciesConversion.evolutionCooldown',
      10,
      2000,
      50,
      'Frames before converted creature is eligible for conversion again',
      true
    ));

    return section;
  }

  private updateAdvancedVisibility(): void {
    const advancedElements = document.querySelectorAll('.advanced-setting');
    advancedElements.forEach((element) => {
      (element as HTMLElement).style.display = this.showAdvanced ? 'block' : 'none';
      
      // Special handling for flex items
      if ((element as HTMLElement).style.display === 'flex') {
        (element as HTMLElement).style.display = this.showAdvanced ? 'flex' : 'none';
      }
    });
  }

  private restoreDefaults(): void {
    // Deep copy the default config
    this.currentConfig = JSON.parse(JSON.stringify(this.defaultConfig));
    
    // Update all input elements with default values
    const inputs = this.panel.querySelectorAll('input');
    inputs.forEach((input) => {
      const configPath = input.dataset.configPath;
      if (configPath) {
        const value = this.getConfigValue(this.defaultConfig, configPath);
        if (input.type === 'checkbox') {
          (input as HTMLInputElement).checked = value as boolean;
        } else {
          input.value = value.toString();
        }
      }
    });
  }

  private getConfigValue(config: any, path: string): any {
    const parts = path.split('.');
    let result = config;
    
    for (const part of parts) {
      if (part.includes('[')) {
        // Handle array paths (e.g., "starvation.prey.thresholds.0.probability")
        const arrayName = part.split('[')[0];
        const index = parseInt(part.split('[')[1].split(']')[0]);
        result = result[arrayName][index];
      } else {
        result = result[part];
      }
      
      if (result === undefined) {
        console.error(`Path ${path} not found in config`);
        return null;
      }
    }
    
    return result;
  }

  private setConfigValue(path: string, value: any): void {
    if (!this.currentConfig) {
      // Initialize with current config if empty
      this.currentConfig = JSON.parse(JSON.stringify(SimulationConfig));
    }
    
    const parts = path.split('.');
    let current = this.currentConfig;
    
    // Navigate to the correct nested object
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      
      if (part.includes('[')) {
        // Handle array paths
        const arrayName = part.split('[')[0];
        const index = parseInt(part.split('[')[1].split(']')[0]);
        
        if (!current[arrayName]) {
          current[arrayName] = [];
        }
        
        if (!current[arrayName][index]) {
          current[arrayName][index] = {};
        }
        
        current = current[arrayName][index];
      } else {
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
    }
    
    // Set the value on the final property
    const lastPart = parts[parts.length - 1];
    if (lastPart.includes('[')) {
      const arrayName = lastPart.split('[')[0];
      const index = parseInt(lastPart.split('[')[1].split(']')[0]);
      
      if (!current[arrayName]) {
        current[arrayName] = [];
      }
      
      current[arrayName][index] = value;
    } else {
      current[lastPart] = value;
    }
  }

  show(): void {
    // Initialize current config from SimulationConfig
    this.currentConfig = JSON.parse(JSON.stringify(SimulationConfig));
    
    // Update UI inputs with current config values
    const inputs = this.panel.querySelectorAll('input');
    inputs.forEach((input) => {
      const configPath = input.dataset.configPath;
      if (configPath) {
        const value = this.getConfigValue(SimulationConfig, configPath);
        if (input.type === 'checkbox') {
          (input as HTMLInputElement).checked = value as boolean;
        } else {
          input.value = value.toString();
        }
      }
    });
    
    if (this.panel instanceof HTMLElement) {
      this.panel.style.display = 'block';
      const overlay = this.panel.previousElementSibling;
      if (overlay instanceof HTMLElement) {
        overlay.style.display = 'block';
      }
    }
    this._isVisible = true;
  }

  hide(): void {
    if (this.panel instanceof HTMLElement) {
      this.panel.style.display = 'none';
      const overlay = this.panel.previousElementSibling;
      if (overlay instanceof HTMLElement) {
        overlay.style.display = 'none';
      }
    }
    this._isVisible = false;
  }

  onSave(callback: (config: typeof SimulationConfig) => void): void {
    this.onSaveCallback = callback;
  }

  private saveSettings(): void {
    if (this.onSaveCallback) {
      // Apply changes from currentConfig
      this.onSaveCallback(this.currentConfig);
    }
    this.hide();
  }
}