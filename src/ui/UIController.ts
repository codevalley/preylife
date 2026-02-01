import { SimulationEngine } from '../core/SimulationEngine';
import { OceanicColors } from './DashboardPanel';
import { PopulationSparkline } from './PopulationSparkline';
import { SettingsPanel } from './SettingsPanel';
import { SimulationConfig } from '../config';
import { HelpPanel } from './HelpPanel';
import { ToastManager, ToastEvent } from './ToastManager';
import { SimulationResultsPanel } from './SimulationResultsPanel';
import { formatNumber, formatTime } from '../utils/formatters';

export class UIController {
  // Panels
  private settingsPanel: SettingsPanel;
  private helpPanel: HelpPanel;
  private resultsPanel: SimulationResultsPanel;
  private sparkline: PopulationSparkline;

  // Control buttons
  private playPauseButton: HTMLButtonElement;
  private resetButton: HTMLButtonElement;

  // Simulation state
  private isSimulationRunning: boolean = false;

  // HUD elements
  private preyCountElement: HTMLElement;
  private predatorCountElement: HTMLElement;
  private resourceCountElement: HTMLElement;
  private preyLifetimeElement: HTMLElement;
  private predatorLifetimeElement: HTMLElement;
  private resourceLifetimeElement: HTMLElement;
  private daysElement: HTMLElement;

  // Flags for tracking which info toasts have been shown
  private highPreyDensityShown: boolean = false;
  private highPredatorDensityShown: boolean = false;
  private lowResourceWarningShown: boolean = false;
  private preySpecializedShown: boolean = false;
  private predatorSpecializedShown: boolean = false;
  private ecosystemBalancedShown: boolean = false;
  private ecosystemCollapseWarningShown: boolean = false;

  // Population history for stability analysis
  private populationHistory: Array<{
    day: number,
    prey: number,
    predators: number,
    resources: number
  }> = [];

  constructor(private simulation: SimulationEngine) {
    // Panels that need a parent element — use document.body so they overlay the full viewport
    this.settingsPanel = new SettingsPanel(document.body);
    this.helpPanel = new HelpPanel(document.body);
    this.resultsPanel = new SimulationResultsPanel(document.body, simulation);

    // Set the toast validation function
    ToastManager.getInstance().validateToastCondition = this.validateToastCondition.bind(this);

    // --- Top-left: Population pill badges ---
    const pillContainer = document.createElement('div');
    pillContainer.style.cssText = 'position: fixed; top: 16px; left: 16px; z-index: 200; display: flex; flex-direction: column; gap: 8px; pointer-events: auto;';

    const preyPill = this.createPill(OceanicColors.prey, 'rgba(0, 200, 255, 0.4)', 'prey');
    const predatorPill = this.createPill(OceanicColors.predator, 'rgba(255, 120, 30, 0.4)', 'predator');
    const resourcePill = this.createPill(OceanicColors.resource, 'rgba(68, 255, 170, 0.4)', 'resource');

    pillContainer.appendChild(preyPill.element);
    pillContainer.appendChild(predatorPill.element);
    pillContainer.appendChild(resourcePill.element);
    document.body.appendChild(pillContainer);

    this.preyCountElement = preyPill.countSpan;
    this.predatorCountElement = predatorPill.countSpan;
    this.resourceCountElement = resourcePill.countSpan;
    this.preyLifetimeElement = preyPill.lifetimeSpan;
    this.predatorLifetimeElement = predatorPill.lifetimeSpan;
    this.resourceLifetimeElement = resourcePill.lifetimeSpan;

    // Pill click handlers
    preyPill.element.addEventListener('click', () => {
      this.simulation.spawnPrey(1);
      this.updateStats();
    });
    predatorPill.element.addEventListener('click', () => {
      this.simulation.spawnPredators(1);
      this.updateStats();
    });
    resourcePill.element.addEventListener('click', () => {
      this.simulation.spawnResources(10, true);
      this.updateStats();
    });

    // --- Top-right: Control buttons + day counter ---
    const controlContainer = document.createElement('div');
    controlContainer.style.cssText = 'position: fixed; top: 16px; right: 16px; z-index: 200; display: flex; align-items: center; gap: 8px; pointer-events: auto;';

    // Play/pause button
    this.playPauseButton = this.createControlButton();
    this.playPauseButton.style.borderColor = 'rgba(0, 180, 130, 0.5)';
    this.playPauseButton.title = 'Play (Space)';
    this.playPauseButton.appendChild(this.createPlayPauseSvg());

    // Reset button
    this.resetButton = this.createControlButton();
    this.resetButton.title = 'Reset Simulation (R)';
    this.resetButton.appendChild(this.createResetSvg());

    // Settings button
    const settingsButton = this.createControlButton();
    settingsButton.title = 'Customize Simulation';
    settingsButton.appendChild(this.createSettingsSvg());

    // Help button
    const helpButton = this.createControlButton();
    helpButton.title = 'Help & Information';
    helpButton.appendChild(this.createHelpSvg());

    // Day counter pill
    const dayPill = document.createElement('div');
    dayPill.style.cssText = `
      display: flex; align-items: center; gap: 4px;
      background: rgba(8, 25, 45, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-radius: 20px;
      border: 1px solid ${OceanicColors.borderPrimary};
      padding: 6px 14px;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 14px;
      color: ${OceanicColors.textPrimary};
    `;
    dayPill.appendChild(this.createClockSvg());
    const daysSpan = document.createElement('span');
    daysSpan.id = 'days-count';
    daysSpan.style.cssText = 'font-weight: bold; min-width: 16px; text-align: center;';
    daysSpan.textContent = '0';
    dayPill.appendChild(daysSpan);

    controlContainer.appendChild(this.playPauseButton);
    controlContainer.appendChild(this.resetButton);
    controlContainer.appendChild(settingsButton);
    controlContainer.appendChild(helpButton);
    controlContainer.appendChild(dayPill);
    document.body.appendChild(controlContainer);

    this.daysElement = daysSpan;

    // Create sparkline and feedback button
    this.sparkline = new PopulationSparkline();
    this.createFeedbackButton();

    // Event listeners
    this.playPauseButton.addEventListener('click', this.onPlayPauseClick.bind(this));
    this.resetButton.addEventListener('click', this.onResetClick.bind(this));

    settingsButton.addEventListener('click', () => {
      this.settingsPanel.onSave((newConfig) => {
        Object.assign(SimulationConfig, newConfig);
        this.onResetClick();
      });
      this.settingsPanel.show();
    });

    helpButton.addEventListener('click', () => {
      this.helpPanel.show();
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (event) => {
      if (event.code === 'Space') {
        this.onPlayPauseClick();
        event.preventDefault();
      }
      if (event.code === 'KeyR') {
        this.onResetClick();
      }
    });

    // Show help panel on startup
    this.helpPanel.show();
  }

  // --- SVG creation helpers (safe DOM methods, no innerHTML) ---

  private createSvgElement(paths: string[], fill: string, size: number = 16): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', String(size));
    svg.setAttribute('height', String(size));
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', fill);
    for (const d of paths) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      svg.appendChild(path);
    }
    return svg;
  }

  private createPlayPauseSvg(): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', OceanicColors.textPrimary);

    const playPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    playPath.id = 'play-icon';
    playPath.setAttribute('d', 'M8 5v14l11-7z');
    playPath.style.display = 'block';

    const pausePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pausePath.id = 'pause-icon';
    pausePath.setAttribute('d', 'M6 19h4V5H6v14zm8-14v14h4V5h-4z');
    pausePath.style.display = 'none';

    svg.appendChild(playPath);
    svg.appendChild(pausePath);
    return svg;
  }

  private createResetSvg(): SVGSVGElement {
    return this.createSvgElement(
      ['M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'],
      OceanicColors.textSecondary
    );
  }

  private createSettingsSvg(): SVGSVGElement {
    return this.createSvgElement(
      ['M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z'],
      OceanicColors.textSecondary
    );
  }

  private createHelpSvg(): SVGSVGElement {
    return this.createSvgElement(
      ['M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z'],
      OceanicColors.textSecondary
    );
  }

  private createClockSvg(): SVGSVGElement {
    const svg = this.createSvgElement(
      ['M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z'],
      OceanicColors.textMuted, 14
    );
    return svg;
  }

  private createSpeciesIcon(type: 'prey' | 'predator' | 'resource', color: string, size: number = 14): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', String(size));
    svg.setAttribute('height', String(size));
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', color);

    if (type === 'prey') {
      // Fish silhouette with tail fin
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M12 20c4.97 0 9-3.58 9-8s-4.03-8-9-8c-1 0-2 .16-2.93.47L3 4v4.32C3.6 9.4 4 10.65 4 12s-.4 2.6-1 3.68V20l6.07-.47C10 19.84 11 20 12 20zm3-9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z');
      svg.appendChild(path);
    } else if (type === 'predator') {
      // Shark silhouette with dorsal fin
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M22 12l-4-4v2H13l2-6-5 4h-2L3 6v2l2 4-2 4v2l5-2h2l5 4-2-6h5v2l4-4z');
      svg.appendChild(path);
    } else {
      // Plankton dot cluster (3 small circles)
      for (const [cx, cy, r] of [['9', '8', '3'], ['16', '10', '2.5'], ['11', '16', '2.5']] as const) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', r);
        svg.appendChild(circle);
      }
    }

    return svg;
  }

  // --- Pill and button factories ---

  private createPill(color: string, borderColor: string, type: 'prey' | 'predator' | 'resource'): { element: HTMLElement, countSpan: HTMLElement, lifetimeSpan: HTMLElement } {
    const pill = document.createElement('div');
    pill.style.cssText = `
      display: flex; align-items: center; gap: 8px;
      background: rgba(8, 25, 45, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-radius: 20px;
      border: 1px solid ${borderColor};
      padding: 6px 14px;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      color: ${color};
    `;

    pill.appendChild(this.createSpeciesIcon(type, color));

    const countSpan = document.createElement('span');
    countSpan.style.fontWeight = 'bold';
    countSpan.textContent = '0';
    pill.appendChild(countSpan);

    const separator = document.createElement('span');
    separator.style.cssText = `color: ${OceanicColors.textMuted}; font-size: 11px;`;
    separator.textContent = '/';
    pill.appendChild(separator);

    const lifetimeSpan = document.createElement('span');
    lifetimeSpan.style.cssText = `color: ${OceanicColors.textMuted}; font-size: 11px;`;
    lifetimeSpan.textContent = '0';
    pill.appendChild(lifetimeSpan);

    // Hover effects
    const hoverBorder = borderColor.replace('0.4', '0.7');
    pill.addEventListener('mouseenter', () => {
      pill.style.borderColor = hoverBorder;
      pill.style.transform = 'scale(1.05)';
      pill.style.boxShadow = `0 0 12px ${borderColor}`;
    });
    pill.addEventListener('mouseleave', () => {
      pill.style.borderColor = borderColor;
      pill.style.transform = 'scale(1)';
      pill.style.boxShadow = 'none';
    });

    return { element: pill, countSpan, lifetimeSpan };
  }

  private createControlButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.style.cssText = `
      width: 36px; height: 36px;
      background: rgba(8, 25, 45, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(80, 180, 220, 0.3);
      border-radius: 18px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex; align-items: center; justify-content: center;
      padding: 0;
    `;

    button.addEventListener('mouseenter', () => {
      button.style.borderColor = 'rgba(100, 200, 255, 0.5)';
      button.style.transform = 'scale(1.05)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.borderColor = 'rgba(80, 180, 220, 0.3)';
      button.style.transform = 'scale(1)';
    });

    return button;
  }

  // --- Core logic (kept as-is) ---

  private onPlayPauseClick(): void {
    if (this.isSimulationRunning) {
      this.simulation.pause();
      this.isSimulationRunning = false;
      this.updatePlayPauseButton(false);
    } else {
      this.simulation.start();
      this.isSimulationRunning = true;

      setTimeout(() => {
        ToastManager.getInstance().checkEvergreen();
      }, 2000);

      this.updatePlayPauseButton(true);
    }
  }

  private onResetClick(): void {
    this.simulation.reset();
    this.simulation.pause();
    this.isSimulationRunning = false;
    this.updatePlayPauseButton(false);

    // Reset flags for info toasts
    this.highPreyDensityShown = false;
    this.highPredatorDensityShown = false;
    this.lowResourceWarningShown = false;
    this.preySpecializedShown = false;
    this.predatorSpecializedShown = false;
    this.ecosystemBalancedShown = false;
    this.ecosystemCollapseWarningShown = false;

    this.populationHistory = [];
    this.sparkline.reset();

    ToastManager.getInstance().resetInfoEvents();

    this.updateStats();
  }

  private lastEvergreenCheck: number = 0;
  private readonly EVERGREEN_CHECK_INTERVAL = 100;

  updateStats(): void {
    const stats = this.simulation.getStats();
    const days = this.simulation.getDays();

    // Evergreen toast check
    if (this.isSimulationRunning) {
      this.lastEvergreenCheck++;
      if (this.lastEvergreenCheck >= this.EVERGREEN_CHECK_INTERVAL) {
        ToastManager.getInstance().checkEvergreen();
        this.lastEvergreenCheck = 0;
      }
    }

    // Update population counts
    this.preyCountElement.textContent = formatNumber(stats.preyCount);
    this.predatorCountElement.textContent = formatNumber(stats.predatorCount);
    this.resourceCountElement.textContent = formatNumber(stats.resourceCount);

    // Update lifetime counts
    const totalSpawned = this.simulation.getTotalSpawned();
    this.preyLifetimeElement.textContent = formatNumber(totalSpawned.prey);
    this.predatorLifetimeElement.textContent = formatNumber(totalSpawned.predators);
    this.resourceLifetimeElement.textContent = formatNumber(totalSpawned.resources);

    // Update sparkline
    this.sparkline.addDataPoint(stats.preyCount, stats.predatorCount, stats.resourceCount);

    // Update day counter
    this.daysElement.textContent = formatTime(days);

    // Track population history
    this.populationHistory.push({
      day: days,
      prey: stats.preyCount,
      predators: stats.predatorCount,
      resources: stats.resourceCount
    });
    if (this.populationHistory.length > 120) {
      this.populationHistory.shift();
    }

    // Check for info toast conditions
    this.checkInfoToastConditions(stats);

    // Check for ecosystem extinction
    if (this.isSimulationRunning && stats.preyCount === 0 && stats.predatorCount === 0) {
      this.resultsPanel.showForExtinction();
      this.simulation.pause();
      this.isSimulationRunning = false;
      this.updatePlayPauseButton(false);
    }
  }

  private checkInfoToastConditions(stats: any): void {
    const initialResourceCount = SimulationConfig.initialPopulation.resources;

    if (stats.preyCount > 0 && stats.resourceCount > 0 &&
        (stats.preyCount >= 2 * stats.resourceCount) &&
        !this.highPreyDensityShown) {
      ToastManager.getInstance().showToast(ToastEvent.HIGH_PREY_DENSITY);
      this.highPreyDensityShown = true;
    }

    if (stats.predatorCount > 5 && stats.preyCount > 0 &&
        (stats.predatorCount / stats.preyCount) >= 1 &&
        !this.highPredatorDensityShown) {
      ToastManager.getInstance().showToast(ToastEvent.HIGH_PREDATOR_DENSITY);
      this.highPredatorDensityShown = true;
    }

    if (stats.resourceCount < initialResourceCount * 0.15 && !this.lowResourceWarningShown) {
      ToastManager.getInstance().showToast(ToastEvent.LOW_RESOURCE_WARNING);
      this.lowResourceWarningShown = true;
    }

    const preySpecialized =
      stats.preyAttributes.strength > 0.75 ||
      stats.preyAttributes.stealth > 0.75 ||
      stats.preyAttributes.longevity > 0.75;
    if (preySpecialized && !this.preySpecializedShown && stats.preyCount > 0) {
      ToastManager.getInstance().showToast(ToastEvent.PREY_ATTRIBUTES_SPECIALIZED);
      this.preySpecializedShown = true;
    }

    const predatorSpecialized =
      stats.predatorAttributes.strength > 0.75 ||
      stats.predatorAttributes.stealth > 0.75 ||
      stats.predatorAttributes.longevity > 0.75;
    if (predatorSpecialized && !this.predatorSpecializedShown && stats.predatorCount > 0) {
      ToastManager.getInstance().showToast(ToastEvent.PREDATOR_ATTRIBUTES_SPECIALIZED);
      this.predatorSpecializedShown = true;
    }

    if (this.populationHistory.length > 100 && !this.ecosystemBalancedShown) {
      const isStable = this.checkEcosystemStability();
      const hasRequiredPredators = stats.predatorCount >= 10;
      const hasHealthyResourcesRatio = stats.preyCount > 0 && stats.resourceCount >= (2 * stats.preyCount);
      const hasBalancedPredatorRatio = stats.predatorCount > 0 && stats.preyCount <= (10 * stats.predatorCount);

      if (isStable && hasRequiredPredators && hasHealthyResourcesRatio && hasBalancedPredatorRatio) {
        ToastManager.getInstance().showToast(ToastEvent.ECOSYSTEM_BALANCED);
        this.ecosystemBalancedShown = true;
      }
    }

    if (this.populationHistory.length > 20 && !this.ecosystemCollapseWarningShown) {
      const isUnstable = this.checkEcosystemInstability();
      if (isUnstable) {
        ToastManager.getInstance().showToast(ToastEvent.ECOSYSTEM_COLLAPSE_WARNING);
        this.ecosystemCollapseWarningShown = true;
      }
    }
  }

  private checkEcosystemStability(): boolean {
    if (this.populationHistory.length < 100) return false;

    const recentHistory = this.populationHistory.slice(-100);
    const avgPrey = recentHistory.reduce((sum, h) => sum + h.prey, 0) / recentHistory.length;
    const avgPredators = recentHistory.reduce((sum, h) => sum + h.predators, 0) / recentHistory.length;

    if (avgPrey < 1 || avgPredators < 1) return false;

    const preyStable = recentHistory.every(h =>
      h.prey > avgPrey * 0.75 && h.prey < avgPrey * 1.25
    );
    const predatorsStable = recentHistory.every(h =>
      h.predators > avgPredators * 0.75 && h.predators < avgPredators * 1.25
    );

    return preyStable && predatorsStable;
  }

  private checkEcosystemInstability(): boolean {
    if (this.populationHistory.length < 20) return false;

    const recentHistory = this.populationHistory.slice(-20);
    const preyStart = recentHistory[0].prey;
    const preyEnd = recentHistory[recentHistory.length - 1].prey;
    const predatorStart = recentHistory[0].predators;
    const predatorEnd = recentHistory[recentHistory.length - 1].predators;

    const preyDecline = preyStart > 10 && preyEnd < preyStart * 0.4;
    const predatorDecline = predatorStart > 5 && predatorEnd < predatorStart * 0.4;

    return preyDecline && predatorDecline;
  }

  private validateToastCondition(event: ToastEvent): boolean {
    const stats = this.simulation.getStats();

    switch (event) {
      case ToastEvent.HIGH_PREY_DENSITY:
        return stats.resourceCount > 0 && (stats.preyCount >= 2 * stats.resourceCount);

      case ToastEvent.HIGH_PREDATOR_DENSITY:
        return stats.predatorCount > 5 && stats.preyCount > 0 && (stats.predatorCount / stats.preyCount) >= 1;

      case ToastEvent.LOW_RESOURCE_WARNING: {
        const initialResourceCount = SimulationConfig.initialPopulation.resources;
        return stats.resourceCount < initialResourceCount * 0.15;
      }

      case ToastEvent.ECOSYSTEM_BALANCED: {
        const isStable = this.checkEcosystemStability();
        const hasRequiredPredators = stats.predatorCount >= 10;
        const hasHealthyResourcesRatio = stats.preyCount > 0 && stats.resourceCount >= (2 * stats.preyCount);
        const hasBalancedPredatorRatio = stats.predatorCount > 0 && stats.preyCount <= (10 * stats.predatorCount);
        return isStable && hasRequiredPredators && hasHealthyResourcesRatio && hasBalancedPredatorRatio;
      }

      case ToastEvent.ECOSYSTEM_COLLAPSE_WARNING:
        return this.checkEcosystemInstability();

      case ToastEvent.PREY_ATTRIBUTES_SPECIALIZED:
        return stats.preyAttributes.strength > 0.75 ||
               stats.preyAttributes.stealth > 0.75 ||
               stats.preyAttributes.longevity > 0.75;

      case ToastEvent.PREDATOR_ATTRIBUTES_SPECIALIZED:
        return stats.predatorAttributes.strength > 0.75 ||
               stats.predatorAttributes.stealth > 0.75 ||
               stats.predatorAttributes.longevity > 0.75;

      default:
        return true;
    }
  }

  private updatePlayPauseButton(isPlaying: boolean): void {
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');

    if (playIcon && pauseIcon) {
      if (isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        this.playPauseButton.title = 'Pause (Space)';
      } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        this.playPauseButton.title = 'Play (Space)';
      }
    }
  }

  private createFeedbackButton(): void {
    const existing = document.getElementById('feedback-button');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.id = 'feedback-button';
    container.style.cssText = 'position: fixed; bottom: 15px; right: 15px; z-index: 1000;';

    const link = document.createElement('a');
    link.href = 'https://twitter.com/nyn';
    link.target = '_blank';
    link.style.cssText = 'display: flex; align-items: center; background-color: rgba(255, 255, 255, 0.85); color: #1DA1F2; text-decoration: none; padding: 5px 10px; border-radius: 4px; font-size: 11px; transition: background-color 0.2s; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.2);';
    link.textContent = 'Feedback @nyn';

    link.addEventListener('mouseenter', () => {
      link.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
      link.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
    });
    link.addEventListener('mouseleave', () => {
      link.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
      link.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
    });

    container.appendChild(link);
    document.body.appendChild(container);
  }
}
