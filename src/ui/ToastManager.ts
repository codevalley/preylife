import { EventBus } from '../events/EventBus';
import { OceanicColors } from './DashboardPanel';

export enum ToastEvent {
  // Ecology events (significant ecosystem milestones)
  FIRST_EXTINCTION = 'first_extinction',
  FIRST_EVOLUTION = 'first_evolution',
  RESOURCE_BLOOM = 'resource_bloom',
  HIGH_PREY_DENSITY = 'high_prey_density',
  HIGH_PREDATOR_DENSITY = 'high_predator_density',
  LOW_RESOURCE_WARNING = 'low_resource_warning',
  PREY_ATTRIBUTES_SPECIALIZED = 'prey_attributes_specialized',
  PREDATOR_ATTRIBUTES_SPECIALIZED = 'predator_attributes_specialized',
  ECOSYSTEM_BALANCED = 'ecosystem_balanced',
  ECOSYSTEM_COLLAPSE_WARNING = 'ecosystem_collapse_warning',

  // Evergreen educational events
  EVERGREEN_CREATURES = 'evergreen_creatures',
  EVERGREEN_CREATURE_PANEL = 'evergreen_creature_panel',
  EVERGREEN_TRAITS = 'evergreen_traits',
  EVERGREEN_EVOLUTION = 'evergreen_evolution',
  EVERGREEN_ENERGY = 'evergreen_energy',
  EVERGREEN_REPRODUCTION = 'evergreen_reproduction',
  EVERGREEN_LEARNABILITY = 'evergreen_learnability'
}

interface ToastConfig {
  title?: string;
  message: string;
  icon: string;
  color: string;
  duration: number;
  isEducational?: boolean;
}

export class ToastManager {
  private static instance: ToastManager;
  private container: HTMLElement = document.createElement('div');
  private seenInfoEvents: Set<ToastEvent> = new Set();
  private toastElements: Map<string, HTMLElement> = new Map();

  // Queue for toasts to prevent overlapping display
  private toastQueue: Array<{event: ToastEvent, config: ToastConfig}> = [];
  private processingToast: boolean = false;

  // Configuration limits
  private readonly MAX_TOASTS = 3;
  private readonly TOAST_DELAY = 3000; // 3 seconds between showing toasts

  // Toast configurations
  private toastConfigs: Record<ToastEvent, ToastConfig> = {
    // Ecology events
    [ToastEvent.FIRST_EXTINCTION]: {
      title: "Extinction Event",
      message: "A species has gone extinct. This affects the entire deep sea ecosystem balance.",
      icon: "\u26A0\uFE0F",
      color: OceanicColors.accentWarm,
      duration: 5000,
    },
    [ToastEvent.FIRST_EVOLUTION]: {
      title: "Evolution Detected",
      message: "Species have evolved! Deep sea creatures can transform based on traits and environment.",
      icon: "\uD83E\uDDEC",
      color: "#aa66ff",
      duration: 5000,
    },
    [ToastEvent.RESOURCE_BLOOM]: {
      title: "Plankton Bloom",
      message: "Ocean currents have triggered a plankton bloom \u2014 food is abundant in the depths!",
      icon: "\uD83C\uDF0A",
      color: OceanicColors.resource,
      duration: 5000,
    },
    [ToastEvent.HIGH_PREY_DENSITY]: {
      title: "High Fish Density",
      message: "Bioluminescent fish population is very high. Plankton may become scarce.",
      icon: "\uD83D\uDCC8",
      color: OceanicColors.prey,
      duration: 5000,
    },
    [ToastEvent.HIGH_PREDATOR_DENSITY]: {
      title: "High Hunter Density",
      message: "Deep sea hunter surge detected. Fish may face extinction risk.",
      icon: "\uD83D\uDCC8",
      color: OceanicColors.predator,
      duration: 5000,
    },
    [ToastEvent.LOW_RESOURCE_WARNING]: {
      title: "Plankton Depletion",
      message: "Plankton levels are critically low. Fish population may crash soon.",
      icon: "\u26A0\uFE0F",
      color: "#dddd44",
      duration: 5000,
    },
    [ToastEvent.PREY_ATTRIBUTES_SPECIALIZED]: {
      title: "Fish Specialization",
      message: "Bioluminescent fish have developed specialized traits for deep sea survival.",
      icon: "\uD83D\uDD2C",
      color: OceanicColors.prey,
      duration: 5000,
    },
    [ToastEvent.PREDATOR_ATTRIBUTES_SPECIALIZED]: {
      title: "Hunter Specialization",
      message: "Deep sea hunters have evolved specialized hunting strategies.",
      icon: "\uD83D\uDD2C",
      color: OceanicColors.predator,
      duration: 5000,
    },
    [ToastEvent.ECOSYSTEM_BALANCED]: {
      title: "Balanced Ecosystem",
      message: "The deep sea ecosystem has reached a sustainable balance between all species.",
      icon: "\u2696\uFE0F",
      color: OceanicColors.accentCyan,
      duration: 5000,
    },
    [ToastEvent.ECOSYSTEM_COLLAPSE_WARNING]: {
      title: "Ecosystem Stress",
      message: "Multiple indicators suggest the ocean ecosystem is under severe stress.",
      icon: "\uD83D\uDD25",
      color: "#ff4444",
      duration: 5000,
    },

    // Evergreen educational events
    [ToastEvent.EVERGREEN_CREATURES]: {
      title: "Circle of Life",
      message: "Welcome to the deep sea food chain! Fish feed on plankton, while hunters prey on fish. Each species must find its balance in the abyss.",
      icon: "\uD83D\uDCA1",
      color: OceanicColors.accentCyan,
      duration: 8000,
      isEducational: true,
    },
    [ToastEvent.EVERGREEN_CREATURE_PANEL]: {
      title: "Creature Details",
      message: "Click on any creature to inspect their traits! Each one has unique bioluminescent patterns that reveal their survival strategy.",
      icon: "\uD83D\uDCA1",
      color: "#aa66ff",
      duration: 8000,
      isEducational: true,
    },
    [ToastEvent.EVERGREEN_TRAITS]: {
      title: "Survival Traits",
      message: "Strength and stealth are key survival traits. Strong creatures swim faster but use more energy, while stealthy ones can hide in the darkness.",
      icon: "\uD83D\uDCA1",
      color: "#ff66aa",
      duration: 8000,
      isEducational: true,
    },
    [ToastEvent.EVERGREEN_EVOLUTION]: {
      title: "Natural Selection",
      message: "Watch evolution in action! Deep sea creatures inherit traits from parents with slight mutations. The fittest survive the abyss.",
      icon: "\uD83D\uDCA1",
      color: OceanicColors.resource,
      duration: 8000,
      isEducational: true,
    },
    [ToastEvent.EVERGREEN_ENERGY]: {
      title: "Energy Management",
      message: "Energy is life in the depths! Every action costs energy \u2014 swimming, hunting, escaping. Creatures must balance activity with feeding.",
      icon: "\uD83D\uDCA1",
      color: OceanicColors.accentWarm,
      duration: 8000,
      isEducational: true,
    },
    [ToastEvent.EVERGREEN_REPRODUCTION]: {
      title: "Reproduction Strategies",
      message: "Deep sea creatures reproduce when energy is high. Some may risk reproduction even when food is scarce \u2014 a desperate survival strategy.",
      icon: "\uD83D\uDCA1",
      color: "#ff66ff",
      duration: 8000,
      isEducational: true,
    },
    [ToastEvent.EVERGREEN_LEARNABILITY]: {
      title: "Social Learning",
      message: "Learnability is a double-edged sword. Quick learners can rapidly adopt successful traits from nearby creatures in the darkness.",
      icon: "\uD83D\uDCA1",
      color: OceanicColors.accentCyan,
      duration: 8000,
      isEducational: true,
    }
  };

  private constructor() {
    this.setupContainer();
    this.addGlobalStyles();
    this.subscribeToEvents();
  }

  /**
   * Subscribe to EventBus events for significant ecology events only
   */
  private subscribeToEvents(): void {
    const eventBus = EventBus.getInstance();

    eventBus.subscribe('RESOURCE_BLOOM', () => {
      this.showToast(ToastEvent.RESOURCE_BLOOM);
    });

    eventBus.subscribe('SPECIES_CONVERSION', () => {
      this.showToast(ToastEvent.FIRST_EVOLUTION);
    });

    eventBus.subscribe('EXTINCTION', () => {
      this.showToast(ToastEvent.FIRST_EXTINCTION);
    });

    eventBus.subscribe('POPULATION_MILESTONE', (event) => {
      if (event.species === 'prey') {
        if (event.milestone === 'high') {
          this.showToast(ToastEvent.HIGH_PREY_DENSITY);
        }
      } else if (event.species === 'predator') {
        if (event.milestone === 'high') {
          this.showToast(ToastEvent.HIGH_PREDATOR_DENSITY);
        }
      } else if (event.species === 'resource') {
        if (event.milestone === 'low' || event.milestone === 'critical') {
          this.showToast(ToastEvent.LOW_RESOURCE_WARNING);
        }
      }
    });

    eventBus.subscribe('SIMULATION_RESET', () => {
      this.resetInfoEvents();
    });
  }

  private setupContainer() {
    this.container.id = 'notification-container';
    document.body.appendChild(this.container);
  }

  private addGlobalStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #notification-container {
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        gap: 8px;
        z-index: 1000;
        max-width: 400px;
        width: 100%;
        pointer-events: none;
        font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
      }

      .notification-card {
        background: rgba(8, 25, 45, 0.9);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(80, 180, 220, 0.3);
        border-radius: 10px;
        padding: 12px 16px;
        color: #e0f0ff;
        font-size: 13px;
        line-height: 1.4;
        pointer-events: auto;
        max-width: 400px;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.4s ease, transform 0.4s ease;
        box-shadow: 0 4px 20px rgba(0, 50, 80, 0.4);
      }

      .notification-card.visible {
        opacity: 1;
        transform: translateY(0);
      }

      .notification-card.removing {
        opacity: 0;
        transform: translateY(20px);
        pointer-events: none;
      }

      @keyframes shimmer-border {
        0%, 100% { border-color: rgba(255, 170, 68, 0.3); }
        50% { border-color: rgba(255, 170, 68, 0.6); }
      }

      @keyframes progress-shrink {
        from { width: 100%; }
        to { width: 0%; }
      }

      .educational-card {
        background: rgba(8, 25, 45, 0.92);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 170, 68, 0.3);
        border-radius: 10px;
        padding: 12px 16px;
        color: ${OceanicColors.textPrimary};
        font-size: 14px;
        line-height: 1.4;
        pointer-events: auto;
        max-width: 400px;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.4s ease, transform 0.4s ease;
        box-shadow: 0 4px 20px rgba(0, 50, 80, 0.4);
        animation: shimmer-border 3s ease-in-out infinite;
        position: relative;
        overflow: hidden;
      }

      .educational-card.visible {
        opacity: 1;
        transform: translateY(0);
      }

      .educational-card.removing {
        opacity: 0;
        transform: translateY(20px);
        pointer-events: none;
      }

      .educational-progress-bar {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 2px;
        background: rgba(255, 170, 68, 0.4);
        border-radius: 0 0 10px 10px;
      }

      .notification-close-btn {
        background: none;
        border: none;
        color: ${OceanicColors.textMuted};
        cursor: pointer;
        font-size: 16px;
        padding: 0;
        line-height: 1;
        margin-left: 6px;
        transition: color 0.2s;
      }

      .notification-close-btn:hover {
        color: ${OceanicColors.textPrimary};
      }
    `;
    document.head.appendChild(style);
  }

  public static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  public showToast(event: ToastEvent): void {
    import('../config').then(({ SimulationConfig }) => {
      if (!SimulationConfig.ui.toasts.showInfo) {
        return;
      }

      const config = this.toastConfigs[event];

      if (!config) {
        console.error(`Toast configuration not found for event: ${event}`);
        return;
      }

      this.queueToast(event, config);
    });
  }

  // Function to check if a toast's condition is still valid
  public validateToastCondition: (event: ToastEvent) => boolean = () => true;

  private queueToast(event: ToastEvent, config: ToastConfig): void {
    // Only queue each event once per simulation
    if (this.seenInfoEvents.has(event)) {
      return;
    }

    // Mark as seen
    this.seenInfoEvents.add(event);

    // Add to queue
    this.toastQueue.push({ event, config });

    // Start processing the queue if not already
    if (!this.processingToast) {
      this.processToastQueue();
    }
  }

  private processToastQueue(): void {
    if (this.toastQueue.length === 0) {
      this.processingToast = false;

      // Check if we should show an evergreen toast
      const activeToasts = this.countActiveToasts();
      if (activeToasts === 0) {
        this.showRandomEvergreen();
      }
      return;
    }

    this.processingToast = true;

    const { event, config } = this.toastQueue.shift()!;

    if (this.validateToastCondition(event)) {
      this.displayToast(event, config);
    }

    setTimeout(() => {
      this.processToastQueue();
    }, this.TOAST_DELAY);
  }

  private countActiveToasts(): number {
    return this.toastElements.size;
  }

  private displayToast(event: ToastEvent, config: ToastConfig): void {
    this.enforceMaxToasts();

    const toastId = `notification-${event}`;
    const isEducational = config.isEducational || false;

    const toast = document.createElement('div');
    toast.className = isEducational ? 'educational-card' : 'notification-card';
    toast.id = toastId;
    toast.dataset.timestamp = Date.now().toString();
    toast.dataset.event = event;

    if (!isEducational) {
      toast.style.borderLeft = `4px solid ${config.color}`;
    }

    const titleColor = isEducational ? OceanicColors.accentWarm : config.color;

    // Insight label badge for educational cards
    if (isEducational) {
      const insightBadge = document.createElement('div');
      insightBadge.style.cssText = `font-size: 10px; color: ${OceanicColors.accentWarm}; opacity: 0.7; margin-bottom: 4px; font-weight: 500;`;
      insightBadge.textContent = '\u{1F4A1} Insight';
      toast.appendChild(insightBadge);
    }

    // Build toast content using DOM methods
    const headerDiv = document.createElement('div');
    headerDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;';

    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = `font-weight: 600; font-size: 13px; color: ${titleColor};`;
    titleDiv.textContent = `${config.icon} ${config.title || ''}`;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close-btn';
    closeBtn.textContent = '\u00D7';

    headerDiv.appendChild(titleDiv);
    headerDiv.appendChild(closeBtn);

    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `font-size: ${isEducational ? '14' : '13'}px; line-height: 1.4;`;
    messageDiv.textContent = config.message;

    toast.appendChild(headerDiv);
    toast.appendChild(messageDiv);

    // Progress bar for educational cards
    if (isEducational) {
      const progressBar = document.createElement('div');
      progressBar.className = 'educational-progress-bar';
      progressBar.style.animation = `progress-shrink ${config.duration}ms linear forwards`;
      toast.appendChild(progressBar);
    }

    // Add to container (newest at bottom)
    this.container.appendChild(toast);

    // Store reference
    this.toastElements.set(toastId, toast);

    // Trigger animation
    setTimeout(() => {
      toast.classList.add('visible');
    }, 10);

    // Close button
    closeBtn.addEventListener('click', () => {
      this.removeToast(toastId);
    });

    // Auto-remove after duration
    const timeoutId = window.setTimeout(() => {
      this.removeToast(toastId);
    }, config.duration);

    toast.dataset.timeoutId = timeoutId.toString();
  }

  private removeToast(toastId: string): void {
    const element = this.toastElements.get(toastId);
    if (!element) return;

    element.classList.add('removing');
    element.classList.remove('visible');

    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      this.toastElements.delete(toastId);
    }, 400);
  }

  private enforceMaxToasts(): void {
    const toasts: {id: string, element: HTMLElement, timestamp: number}[] = [];

    this.toastElements.forEach((element, id) => {
      const timestamp = parseInt(element.dataset.timestamp || '0');
      toasts.push({ id, element, timestamp });
    });

    toasts.sort((a, b) => a.timestamp - b.timestamp);

    while (toasts.length >= this.MAX_TOASTS) {
      const oldest = toasts.shift();
      if (oldest) {
        const timeoutId = parseInt(oldest.element.dataset.timeoutId || '0');
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        this.removeToast(oldest.id);
      }
    }
  }

  public checkEvergreen(): void {
    if (!this.processingToast && this.toastQueue.length === 0) {
      const activeToasts = this.countActiveToasts();
      if (activeToasts === 0) {
        this.showRandomEvergreen();
      }
    }
  }

  public resetInfoEvents(): void {
    this.seenInfoEvents.clear();
    this.toastQueue = [];
    this.processingToast = false;

    const toastsToRemove: string[] = [];
    this.toastElements.forEach((_, id) => {
      toastsToRemove.push(id);
    });

    toastsToRemove.forEach(id => {
      const element = this.toastElements.get(id);
      if (element) {
        const timeoutId = parseInt(element.dataset.timeoutId || '0');
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
        this.toastElements.delete(id);
      }
    });
  }

  private showRandomEvergreen(): void {
    const evergreens = [
      ToastEvent.EVERGREEN_CREATURES,
      ToastEvent.EVERGREEN_CREATURE_PANEL,
      ToastEvent.EVERGREEN_TRAITS,
      ToastEvent.EVERGREEN_EVOLUTION,
      ToastEvent.EVERGREEN_ENERGY,
      ToastEvent.EVERGREEN_REPRODUCTION,
      ToastEvent.EVERGREEN_LEARNABILITY
    ];

    const unseenEvergreens = evergreens.filter(event => !this.seenInfoEvents.has(event));

    if (unseenEvergreens.length > 0) {
      const randomEvent = unseenEvergreens[Math.floor(Math.random() * unseenEvergreens.length)];
      const config = this.toastConfigs[randomEvent];

      if (config) {
        this.seenInfoEvents.add(randomEvent);
        this.displayToast(randomEvent, config);
      }
    }
  }
}
