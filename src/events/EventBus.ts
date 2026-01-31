/**
 * EventBus - Pub/Sub event system for decoupled communication
 *
 * Provides type-safe event publishing and subscription for simulation events.
 * Components can emit events without knowing who's listening, and listeners
 * can subscribe to specific event types.
 */

import type {
  SimulationEvent,
  SimulationEventType,
  EventByType
} from './SimulationEvents';

// Callback type for event handlers - use function type for flexibility
type EventHandler<T extends SimulationEventType> = (event: EventByType<T>) => void;

// Generic handler type for internal storage
type AnyEventHandler = (event: SimulationEvent) => void;

// Subscription record for managing listeners
interface Subscription {
  id: number;
  eventType: SimulationEventType;
  handler: AnyEventHandler;
  once: boolean;
}

/**
 * EventBus singleton for simulation-wide event communication
 */
export class EventBus {
  private static instance: EventBus | null = null;

  private subscriptions: Map<SimulationEventType, Subscription[]>;
  private nextSubscriptionId: number;
  private eventHistory: SimulationEvent[];
  private historyLimit: number;
  private paused: boolean;
  private queuedEvents: SimulationEvent[];

  private constructor() {
    this.subscriptions = new Map();
    this.nextSubscriptionId = 1;
    this.eventHistory = [];
    this.historyLimit = 1000; // Keep last 1000 events
    this.paused = false;
    this.queuedEvents = [];
  }

  /**
   * Get the singleton EventBus instance
   */
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static resetInstance(): void {
    EventBus.instance = null;
  }

  /**
   * Subscribe to a specific event type
   * @param eventType - The type of event to listen for
   * @param handler - Callback function when event is emitted
   * @returns Subscription ID for unsubscribing
   */
  subscribe<T extends SimulationEventType>(
    eventType: T,
    handler: EventHandler<T>
  ): number {
    const subscriptionId = this.nextSubscriptionId++;

    const subscription: Subscription = {
      id: subscriptionId,
      eventType,
      handler: handler as unknown as AnyEventHandler,
      once: false
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }

    this.subscriptions.get(eventType)!.push(subscription);

    return subscriptionId;
  }

  /**
   * Subscribe to an event type, but only receive it once
   * @param eventType - The type of event to listen for
   * @param handler - Callback function when event is emitted
   * @returns Subscription ID for unsubscribing
   */
  subscribeOnce<T extends SimulationEventType>(
    eventType: T,
    handler: EventHandler<T>
  ): number {
    const subscriptionId = this.nextSubscriptionId++;

    const subscription: Subscription = {
      id: subscriptionId,
      eventType,
      handler: handler as unknown as AnyEventHandler,
      once: true
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }

    this.subscriptions.get(eventType)!.push(subscription);

    return subscriptionId;
  }

  /**
   * Unsubscribe from events using the subscription ID
   * @param subscriptionId - The ID returned from subscribe()
   */
  unsubscribe(subscriptionId: number): boolean {
    for (const [eventType, subs] of this.subscriptions) {
      const index = subs.findIndex(s => s.id === subscriptionId);
      if (index !== -1) {
        subs.splice(index, 1);
        if (subs.length === 0) {
          this.subscriptions.delete(eventType);
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Unsubscribe all handlers for a specific event type
   * @param eventType - The type of event to unsubscribe from
   */
  unsubscribeAll(eventType: SimulationEventType): void {
    this.subscriptions.delete(eventType);
  }

  /**
   * Emit an event to all subscribers
   * @param event - The event to emit
   */
  emit<T extends SimulationEvent>(event: T): void {
    // If paused, queue the event
    if (this.paused) {
      this.queuedEvents.push(event);
      return;
    }

    this.processEvent(event);
  }

  /**
   * Process an event (internal)
   */
  private processEvent(event: SimulationEvent): void {
    // Store in history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.historyLimit) {
      this.eventHistory.shift();
    }

    // Get subscribers for this event type
    const subs = this.subscriptions.get(event.type);
    if (!subs) return;

    // Track subscriptions to remove after processing
    const toRemove: number[] = [];

    // Call each handler
    for (const subscription of subs) {
      try {
        subscription.handler(event);
        if (subscription.once) {
          toRemove.push(subscription.id);
        }
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    }

    // Remove one-time subscriptions
    for (const id of toRemove) {
      this.unsubscribe(id);
    }
  }

  /**
   * Pause event emission (events will be queued)
   */
  pause(): void {
    this.paused = true;
  }

  /**
   * Resume event emission and process queued events
   */
  resume(): void {
    this.paused = false;

    // Process queued events
    const events = [...this.queuedEvents];
    this.queuedEvents = [];

    for (const event of events) {
      this.processEvent(event);
    }
  }

  /**
   * Get recent event history
   * @param count - Number of recent events to return
   * @param filterType - Optional event type to filter by
   */
  getHistory(count?: number, filterType?: SimulationEventType): SimulationEvent[] {
    let events = this.eventHistory;

    if (filterType) {
      events = events.filter(e => e.type === filterType);
    }

    if (count !== undefined) {
      events = events.slice(-count);
    }

    return [...events];
  }

  /**
   * Clear all subscriptions
   */
  clearSubscriptions(): void {
    this.subscriptions.clear();
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Clear everything (history, subscriptions, queued events)
   */
  clear(): void {
    this.clearSubscriptions();
    this.clearHistory();
    this.queuedEvents = [];
    this.paused = false;
  }

  /**
   * Set the maximum number of events to keep in history
   */
  setHistoryLimit(limit: number): void {
    this.historyLimit = limit;
    while (this.eventHistory.length > this.historyLimit) {
      this.eventHistory.shift();
    }
  }

  /**
   * Check if there are any subscribers for an event type
   */
  hasSubscribers(eventType: SimulationEventType): boolean {
    const subs = this.subscriptions.get(eventType);
    return subs !== undefined && subs.length > 0;
  }

  /**
   * Get the number of subscribers for an event type
   */
  getSubscriberCount(eventType: SimulationEventType): number {
    const subs = this.subscriptions.get(eventType);
    return subs ? subs.length : 0;
  }
}

/**
 * Convenience function to get the EventBus instance
 */
export function getEventBus(): EventBus {
  return EventBus.getInstance();
}
