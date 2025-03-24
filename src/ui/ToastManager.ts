import { formatNumber } from '../utils/formatters';

export enum ToastType {
  EPHEMERAL = 'ephemeral',
  INFO = 'info'
}

export enum ToastEvent {
  // Ephemeral events
  PREY_BORN = 'prey_born',
  PREDATOR_BORN = 'predator_born',
  PREY_DIED = 'prey_died',
  PREDATOR_DIED = 'predator_died',
  RESOURCE_SPAWNED = 'resource_spawned',
  RESOURCE_CONSUMED = 'resource_consumed',
  PREY_CONSUMED = 'prey_consumed',
  PREY_ESCAPED = 'prey_escaped',
  PREY_LEARNED = 'prey_learned',
  PREDATOR_LEARNED = 'predator_learned',
  
  // Info events (one-time educational callouts)
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

  // Evergreen info events (shown when no other events are pending)
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
}

export class ToastManager {
  private static instance: ToastManager;
  private ephemeralContainer: HTMLElement = document.createElement('div');
  private infoContainer: HTMLElement = document.createElement('div');
  private seenInfoEvents: Set<ToastEvent> = new Set();
  private eventCounts: Map<ToastEvent, number> = new Map();
  private toastElements: Map<string, HTMLElement> = new Map();
  
  // Queue for info toasts to prevent overlapping display
  private infoToastQueue: Array<{event: ToastEvent, config: ToastConfig}> = [];
  private processingInfoToast: boolean = false;
  
  // Configuration limits
  private readonly MAX_EPHEMERAL_TOASTS = 10;
  private readonly MAX_INFO_TOASTS = 3;
  private readonly INFO_TOAST_DELAY = 6000; // 6 seconds between showing info toasts
  
  // Toast configurations
  private toastConfigs: Record<ToastEvent, ToastConfig> = {
    // Ephemeral events
    [ToastEvent.PREY_BORN]: {
      message: "+{count} prey",
      icon: "🔵",
      color: "#5588ff",
      duration: 6000,
    },
    [ToastEvent.PREDATOR_BORN]: {
      message: "+{count} predator",
      icon: "🔺",
      color: "#ff5555",
      duration: 6000,
    },
    [ToastEvent.PREY_DIED]: {
      message: "-{count} prey",
      icon: "🔵",
      color: "#4477dd",
      duration: 6000,
    },
    [ToastEvent.PREDATOR_DIED]: {
      message: "-{count} predator",
      icon: "🔺",
      color: "#dd4444",
      duration: 6000,
    },
    [ToastEvent.RESOURCE_SPAWNED]: {
      message: "+{count} resources",
      icon: "🟩",
      color: "#55cc55",
      duration: 6000,
    },
    [ToastEvent.RESOURCE_CONSUMED]: {
      message: "{count} resource consumed",
      icon: "🍽️",
      color: "#55cc55",
      duration: 6000,
    },
    [ToastEvent.PREY_CONSUMED]: {
      message: "{count} prey consumed",
      icon: "🎯",
      color: "#ff5555",
      duration: 6000,
    },
    [ToastEvent.PREY_ESCAPED]: {
      message: "{count} prey escaped",
      icon: "💨",
      color: "#5588ff",
      duration: 6000,
    },
    [ToastEvent.PREY_LEARNED]: {
      message: "{count} prey learned",
      icon: "💡",
      color: "#5588ff",
      duration: 6000,
    },
    [ToastEvent.PREDATOR_LEARNED]: {
      message: "{count} predator learned",
      icon: "💡",
      color: "#ff5555",
      duration: 6000,
    },
    
    // Info events
    [ToastEvent.FIRST_EXTINCTION]: {
      title: "Extinction Event",
      message: "A species has gone extinct. This affects the entire ecosystem balance.",
      icon: "⚠️",
      color: "#ffaa44", 
      duration: 20000,
    },
    [ToastEvent.FIRST_EVOLUTION]: {
      title: "Evolution Detected",
      message: "Species have evolved! Creatures can change type based on traits and environment.",
      icon: "🧬",
      color: "#aa44ff",
      duration: 20000,
    },
    [ToastEvent.RESOURCE_BLOOM]: {
      title: "Resource Bloom",
      message: "Environmental conditions have triggered a resource bloom - food is abundant!",
      icon: "🌱",
      color: "#44dd44",
      duration: 20000,
    },
    [ToastEvent.HIGH_PREY_DENSITY]: {
      title: "High Prey Density",
      message: "Prey population is very high. This may lead to resource depletion.",
      icon: "📈",
      color: "#5588ff",
      duration: 20000,
    },
    [ToastEvent.HIGH_PREDATOR_DENSITY]: {
      title: "High Predator Density",
      message: "Predator population surge detected. Prey may face extinction risk.",
      icon: "📈",
      color: "#ff5555",
      duration: 20000,
    },
    [ToastEvent.LOW_RESOURCE_WARNING]: {
      title: "Resource Depletion",
      message: "Resources are running low. Prey population may crash soon.",
      icon: "⚠️",
      color: "#dddd44",
      duration: 20000,
    },
    [ToastEvent.PREY_ATTRIBUTES_SPECIALIZED]: {
      title: "Prey Specialization",
      message: "Prey have developed specialized traits to survive in this environment.",
      icon: "🔬",
      color: "#5588ff",
      duration: 20000,
    },
    [ToastEvent.PREDATOR_ATTRIBUTES_SPECIALIZED]: {
      title: "Predator Specialization", 
      message: "Predators have evolved specialized hunting strategies.",
      icon: "🔬",
      color: "#ff5555",
      duration: 20000,
    },
    [ToastEvent.ECOSYSTEM_BALANCED]: {
      title: "Balanced Ecosystem",
      message: "The ecosystem has reached a sustainable balance between all species.",
      icon: "⚖️",
      color: "#44aaff",
      duration: 20000,
    },
    [ToastEvent.ECOSYSTEM_COLLAPSE_WARNING]: {
      title: "Ecosystem Stress",
      message: "Multiple indicators suggest the ecosystem is under severe stress.",
      icon: "🔥",
      color: "#ff4444",
      duration: 20000,
    },

    // Evergreen info events
    [ToastEvent.EVERGREEN_CREATURES]: {
      title: "Circle of Life",
      message: "Welcome to the food chain! Prey feed on resources (green squares), while predators hunt prey to survive. Each species must find its balance.",
      icon: "🔄",
      color: "#44aaff",
      duration: 20000,
    },
    [ToastEvent.EVERGREEN_CREATURE_PANEL]: {
      title: "Creature Details",
      message: "Click on any creature to inspect their traits! Each one has unique attributes that determine their survival strategy.",
      icon: "👆",
      color: "#aa44ff",
      duration: 20000,
    },
    [ToastEvent.EVERGREEN_TRAITS]: {
      title: "Survival Traits",
      message: "Strength and stealth are key survival traits. Strong creatures move faster but use more energy, while stealthy ones are better at detecting threats.",
      icon: "💪",
      color: "#ff44aa",
      duration: 20000,
    },
    [ToastEvent.EVERGREEN_EVOLUTION]: {
      title: "Natural Selection",
      message: "Watch evolution in action! Creatures inherit traits from parents with slight mutations, and can learn from their peers. The fittest survive to pass on their genes.",
      icon: "🧬",
      color: "#44ffaa",
      duration: 20000,
    },
    [ToastEvent.EVERGREEN_ENERGY]: {
      title: "Energy Management",
      message: "Energy is life! Every action costs energy - moving, hunting, escaping, and reproducing. Creatures must balance activity with food intake.",
      icon: "⚡",
      color: "#ffaa44",
      duration: 20000,
    },
    [ToastEvent.EVERGREEN_REPRODUCTION]: {
      title: "Reproduction Strategies",
      message: "Creatures typically reproduce when energy is high, but desperate times call for desperate measures - some may risk reproduction even when resources are scarce.",
      icon: "🐣",
      color: "#ff44ff",
      duration: 20000,
    },
    [ToastEvent.EVERGREEN_LEARNABILITY]: {
      title: "Social Learning",
      message: "Learnability is a double-edged sword. Quick learners can rapidly adopt successful traits from the group, but they're also more susceptible to negative influences.",
      icon: "🧠",
      color: "#44ffff",
      duration: 20000,
    }
  };
  
  private constructor() {
    this.setupContainers();
    this.addGlobalStyles();
  }
  
  // This method is kept for backward compatibility
  public addAnimationStyles(): void {
    // This is now handled in the constructor via addGlobalStyles()
    // No need to do anything extra here
  }
  
  private setupContainers() {
    // Create ephemeral toast container (bottom right)
    this.ephemeralContainer.id = 'ephemeral-toast-container';
    this.ephemeralContainer.className = 'toast-container';
    document.body.appendChild(this.ephemeralContainer);
    
    // Create info toast container (bottom left)
    this.infoContainer.id = 'info-toast-container';
    this.infoContainer.className = 'toast-container';
    document.body.appendChild(this.infoContainer);
  }
  
  private addGlobalStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url(https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2) format('woff2');
      }
      
      .toast-container {
        position: fixed;
        bottom: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 1000;
        max-width: 350px;
        pointer-events: none;
        font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
      }
      
      #ephemeral-toast-container {
        right: 20px;
      }
      
      #info-toast-container {
        left: 20px;
      }
      
      .toast {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.5s ease, transform 0.5s ease;
        margin-top: 0px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
      }
      
      .toast.visible {
        opacity: 1;
        transform: translateY(0);
      }
      
      .toast.removing {
        opacity: 0;
        transform: translateY(20px);
        pointer-events: none;
      }
      
      .ephemeral-toast {
        display: flex;
        align-items: center;
        gap: 10px;
        background-color: rgba(20, 20, 20, 0.85);
        color: white;
        border-radius: 30px;
        padding: 8px 16px;
        margin-bottom: 0px;
        max-width: 300px;
      }
      
      .info-toast {
        background-color: rgba(20, 20, 20, 0.95);
        color: white;
        border-radius: 8px;
        padding: 14px 18px;
        margin-bottom: 0px;
        width: 100%;
        max-width: 350px;
        pointer-events: auto;
      }
      
      .close-btn {
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        font-size: 18px;
        padding: 0;
        line-height: 1;
        margin-left: 6px;
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
  
  public showToast(type: ToastType, event: ToastEvent): void {
    import('../config').then(({ SimulationConfig }) => {
      // Check toast visibility settings
      if (type === ToastType.EPHEMERAL && !SimulationConfig.ui.toasts.showEphemeral) {
        return; // Don't show ephemeral toasts if disabled
      }
      
      if (type === ToastType.INFO && !SimulationConfig.ui.toasts.showInfo) {
        return; // Don't show info toasts if disabled
      }
      
      const config = this.toastConfigs[event];
      
      if (!config) {
        console.error(`Toast configuration not found for event: ${event}`);
        return;
      }
      
      if (type === ToastType.EPHEMERAL) {
        this.showEphemeralToast(event, config);
      } else if (type === ToastType.INFO) {
        // Add info toast to queue instead of showing immediately
        this.queueInfoToast(event, config);
      }
    });
  }
  
  // Function to check if a toast's condition is still valid
  public validateToastCondition: (event: ToastEvent) => boolean = () => true;

  private queueInfoToast(event: ToastEvent, config: ToastConfig): void {
    // Only queue info toasts once per simulation
    if (this.seenInfoEvents.has(event)) {
      return;
    }
    
    // Mark as seen
    this.seenInfoEvents.add(event);
    
    // Add to queue
    this.infoToastQueue.push({ event, config });
    
    // Start processing the queue if not already
    if (!this.processingInfoToast) {
      this.processInfoToastQueue();
    }
  }
  
  private processInfoToastQueue(): void {
    if (this.infoToastQueue.length === 0) {
      this.processingInfoToast = false;
      
      // Check if we should show an evergreen toast
      // Only show if there are no active info toasts
      const activeInfoToasts = this.countActiveInfoToasts();
      if (activeInfoToasts === 0) {
        this.showRandomEvergreen();
      }
      return;
    }
    
    this.processingInfoToast = true;
    
    // Get the next toast from the queue
    const { event, config } = this.infoToastQueue.shift()!;
    
    // Validate that the condition is still true before showing
    if (this.validateToastCondition(event)) {
      // Display this toast if condition is still valid
      this.displayInfoToast(event, config);
    }
    
    // Set a timeout to process the next toast after a delay
    setTimeout(() => {
      this.processInfoToastQueue();
    }, this.INFO_TOAST_DELAY);
  }
  
  // Helper method to count active info toasts
  private countActiveInfoToasts(): number {
    let count = 0;
    this.toastElements.forEach((_, id) => {
      if (id.startsWith('info-')) {
        count++;
      }
    });
    return count;
  }
  
  private showEphemeralToast(event: ToastEvent, config: ToastConfig): void {
    // Increment count for this event type
    const currentCount = this.eventCounts.get(event) || 0;
    this.eventCounts.set(event, currentCount + 1);
    
    const toastId = `ephemeral-${event}`;
    
    // Check if we already have a toast for this event type
    if (this.toastElements.has(toastId)) {
      // Update existing toast
      const element = this.toastElements.get(toastId)!;
      const messageEl = element.querySelector('.toast-message');
      if (messageEl) {
        const count = this.eventCounts.get(event) || 1;
        messageEl.textContent = config.message.replace('{count}', formatNumber(count));
      }
      
      // Reset any removal timer and ensure the toast is visible
      element.classList.remove('removing');
      element.dataset.timestamp = Date.now().toString();
      
      // Clear any existing timeout
      const timeoutId = parseInt(element.dataset.timeoutId || '0');
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Set new timeout
      const newTimeoutId = window.setTimeout(() => {
        this.removeToast(toastId);
      }, config.duration);
      
      element.dataset.timeoutId = newTimeoutId.toString();
      
      return;
    }
    
    // If we're at maximum ephemeral toasts, remove the oldest one
    this.enforceMaxToasts(ToastType.EPHEMERAL);
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = 'toast ephemeral-toast';
    toast.id = toastId;
    toast.dataset.timestamp = Date.now().toString();
    toast.dataset.event = event;
    
    // Add content
    const count = this.eventCounts.get(event) || 1;
    const message = config.message.replace('{count}', formatNumber(count));
    
    toast.innerHTML = `
      <div class="toast-icon" style="font-size: 20px; min-width: 24px; text-align: center; line-height: 1;">${config.icon}</div>
      <div class="toast-message" style="font-size: 14px; font-weight: 500; color: ${config.color};">${message}</div>
    `;
    
    // Add to container at the end (bottom)
    this.ephemeralContainer.appendChild(toast);
    
    // Store reference
    this.toastElements.set(toastId, toast);
    
    // Trigger animation after a short delay (to ensure DOM update)
    setTimeout(() => {
      toast.classList.add('visible');
    }, 10);
    
    // Set timeout to remove
    const timeoutId = window.setTimeout(() => {
      this.removeToast(toastId);
    }, config.duration);
    
    toast.dataset.timeoutId = timeoutId.toString();
  }
  
  private displayInfoToast(event: ToastEvent, config: ToastConfig): void {
    // Enforce max toasts
    this.enforceMaxToasts(ToastType.INFO);
    
    // Create toast ID
    const toastId = `info-${event}`;
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = 'toast info-toast';
    toast.id = toastId;
    toast.dataset.timestamp = Date.now().toString();
    toast.dataset.event = event;
    toast.style.borderLeft = `4px solid ${config.color}`;
    
    // Add content
    toast.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <div class="toast-title" style="font-weight: bold; font-size: 16px; color: ${config.color};">${config.title}</div>
        <button class="close-btn">×</button>
      </div>
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div class="toast-icon" style="font-size: 22px; min-width: 26px; text-align: center; line-height: 1;">${config.icon}</div>
        <div class="toast-message" style="font-size: 14px; line-height: 1.5;">${config.message}</div>
      </div>
    `;
    
    // Add to container at the end (bottom)
    this.infoContainer.appendChild(toast);
    
    // Store reference
    this.toastElements.set(toastId, toast);
    
    // Trigger animation after a short delay
    setTimeout(() => {
      toast.classList.add('visible');
    }, 10);
    
    // Add close button functionality
    const closeButton = toast.querySelector('.close-btn');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.removeToast(toastId);
      });
    }
    
    // Set timeout to remove
    const timeoutId = window.setTimeout(() => {
      this.removeToast(toastId);
    }, config.duration);
    
    toast.dataset.timeoutId = timeoutId.toString();
  }
  
  private removeToast(toastId: string): void {
    const element = this.toastElements.get(toastId);
    if (!element) return;
    
    // Start removal animation
    element.classList.add('removing');
    element.classList.remove('visible');
    
    // Remove after animation completes
    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      this.toastElements.delete(toastId);
      
      // If this was an ephemeral toast, reset its count
      if (toastId.startsWith('ephemeral-')) {
        const event = toastId.replace('ephemeral-', '') as ToastEvent;
        this.eventCounts.delete(event);
      }
    }, 500);
  }
  
  private enforceMaxToasts(type: ToastType): void {
    const maxToasts = type === ToastType.EPHEMERAL ? this.MAX_EPHEMERAL_TOASTS : this.MAX_INFO_TOASTS;
    const prefix = type === ToastType.EPHEMERAL ? 'ephemeral-' : 'info-';
    
    // Get all toast elements of this type
    const toasts: {id: string, element: HTMLElement, timestamp: number}[] = [];
    
    this.toastElements.forEach((element, id) => {
      if (id.startsWith(prefix)) {
        const timestamp = parseInt(element.dataset.timestamp || '0');
        toasts.push({ id, element, timestamp });
      }
    });
    
    // Sort by timestamp (oldest first)
    toasts.sort((a, b) => a.timestamp - b.timestamp);
    
    // Remove oldest toasts if we exceed the limit
    while (toasts.length >= maxToasts) {
      const oldest = toasts.shift();
      if (oldest) {
        // Clear timeout
        const timeoutId = parseInt(oldest.element.dataset.timeoutId || '0');
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        // Remove toast
        this.removeToast(oldest.id);
      }
    }
  }
  
  // Check for opportunity to show evergreen toasts
  public checkEvergreen(): void {
    // Only check if we're not processing any toast and no active info toasts
    if (!this.processingInfoToast && this.infoToastQueue.length === 0) {
      const activeInfoToasts = this.countActiveInfoToasts();
      if (activeInfoToasts === 0) {
        this.showRandomEvergreen();
      }
    }
  }
  
  public resetInfoEvents(): void {
    // Clear seen info events
    this.seenInfoEvents.clear();
    
    // Clear the queue
    this.infoToastQueue = [];
    this.processingInfoToast = false;
    
    // Remove all info toasts
    const toastsToRemove: string[] = [];
    
    this.toastElements.forEach((_, id) => {
      if (id.startsWith('info-')) {
        toastsToRemove.push(id);
      }
    });
    
    // Remove each info toast
    toastsToRemove.forEach(id => {
      const element = this.toastElements.get(id);
      if (element) {
        // Clear timeout
        const timeoutId = parseInt(element.dataset.timeoutId || '0');
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        // Remove immediately without animation
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

    // Filter out already seen evergreen toasts
    const unseenEvergreens = evergreens.filter(event => !this.seenInfoEvents.has(event));
    
    if (unseenEvergreens.length > 0) {
      // Show a random unseen evergreen toast
      const randomEvent = unseenEvergreens[Math.floor(Math.random() * unseenEvergreens.length)];
      const config = this.toastConfigs[randomEvent];
      
      if (config) {
        // Mark as seen first, before displaying to prevent duplicate triggers
        this.seenInfoEvents.add(randomEvent);
        
        // Display directly instead of queueing to avoid recursion
        this.displayInfoToast(randomEvent, config);
        
        console.log(`Showing evergreen tip: ${randomEvent}`);
      }
    } else {
      // All evergreen toasts have been seen
      console.log("All evergreen tips have been seen already");
    }
  }
}