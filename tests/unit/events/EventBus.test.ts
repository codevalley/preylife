import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBus, getEventBus } from '../../../src/events/EventBus';
import type {
  EntityDiedEvent,
  PreyConsumedEvent,
  DayChangedEvent
} from '../../../src/events/SimulationEvents';

describe('EventBus', () => {
  beforeEach(() => {
    EventBus.resetInstance();
  });

  describe('singleton', () => {
    it('should return the same instance', () => {
      const instance1 = EventBus.getInstance();
      const instance2 = EventBus.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should return same instance via getEventBus helper', () => {
      const instance1 = EventBus.getInstance();
      const instance2 = getEventBus();
      expect(instance1).toBe(instance2);
    });

    it('should create new instance after reset', () => {
      const instance1 = EventBus.getInstance();
      EventBus.resetInstance();
      const instance2 = EventBus.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('subscribe and emit', () => {
    it('should call handler when event is emitted', () => {
      const eventBus = EventBus.getInstance();
      const handler = vi.fn();

      eventBus.subscribe('DAY_CHANGED', handler);

      const event: DayChangedEvent = {
        type: 'DAY_CHANGED',
        timestamp: Date.now(),
        day: 1,
        newDay: 1
      };

      eventBus.emit(event);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(event);
    });

    it('should only call handlers for matching event type', () => {
      const eventBus = EventBus.getInstance();
      const dayHandler = vi.fn();
      const deathHandler = vi.fn();

      eventBus.subscribe('DAY_CHANGED', dayHandler);
      eventBus.subscribe('ENTITY_DIED', deathHandler);

      const dayEvent: DayChangedEvent = {
        type: 'DAY_CHANGED',
        timestamp: Date.now(),
        day: 1,
        newDay: 1
      };

      eventBus.emit(dayEvent);

      expect(dayHandler).toHaveBeenCalledTimes(1);
      expect(deathHandler).not.toHaveBeenCalled();
    });

    it('should call multiple handlers for same event type', () => {
      const eventBus = EventBus.getInstance();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.subscribe('DAY_CHANGED', handler1);
      eventBus.subscribe('DAY_CHANGED', handler2);

      const event: DayChangedEvent = {
        type: 'DAY_CHANGED',
        timestamp: Date.now(),
        day: 1,
        newDay: 1
      };

      eventBus.emit(event);

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe('subscribeOnce', () => {
    it('should only call handler once', () => {
      const eventBus = EventBus.getInstance();
      const handler = vi.fn();

      eventBus.subscribeOnce('DAY_CHANGED', handler);

      const event: DayChangedEvent = {
        type: 'DAY_CHANGED',
        timestamp: Date.now(),
        day: 1,
        newDay: 1
      };

      eventBus.emit(event);
      eventBus.emit(event);
      eventBus.emit(event);

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('unsubscribe', () => {
    it('should stop receiving events after unsubscribe', () => {
      const eventBus = EventBus.getInstance();
      const handler = vi.fn();

      const subscriptionId = eventBus.subscribe('DAY_CHANGED', handler);

      const event: DayChangedEvent = {
        type: 'DAY_CHANGED',
        timestamp: Date.now(),
        day: 1,
        newDay: 1
      };

      eventBus.emit(event);
      expect(handler).toHaveBeenCalledTimes(1);

      const unsubscribed = eventBus.unsubscribe(subscriptionId);
      expect(unsubscribed).toBe(true);

      eventBus.emit(event);
      expect(handler).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it('should return false for invalid subscription id', () => {
      const eventBus = EventBus.getInstance();
      const result = eventBus.unsubscribe(99999);
      expect(result).toBe(false);
    });
  });

  describe('unsubscribeAll', () => {
    it('should remove all handlers for event type', () => {
      const eventBus = EventBus.getInstance();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.subscribe('DAY_CHANGED', handler1);
      eventBus.subscribe('DAY_CHANGED', handler2);

      eventBus.unsubscribeAll('DAY_CHANGED');

      const event: DayChangedEvent = {
        type: 'DAY_CHANGED',
        timestamp: Date.now(),
        day: 1,
        newDay: 1
      };

      eventBus.emit(event);

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe('pause and resume', () => {
    it('should queue events when paused', () => {
      const eventBus = EventBus.getInstance();
      const handler = vi.fn();

      eventBus.subscribe('DAY_CHANGED', handler);
      eventBus.pause();

      const event: DayChangedEvent = {
        type: 'DAY_CHANGED',
        timestamp: Date.now(),
        day: 1,
        newDay: 1
      };

      eventBus.emit(event);
      expect(handler).not.toHaveBeenCalled();

      eventBus.resume();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should process all queued events on resume', () => {
      const eventBus = EventBus.getInstance();
      const handler = vi.fn();

      eventBus.subscribe('DAY_CHANGED', handler);
      eventBus.pause();

      for (let i = 1; i <= 5; i++) {
        eventBus.emit({
          type: 'DAY_CHANGED',
          timestamp: Date.now(),
          day: i,
          newDay: i
        });
      }

      expect(handler).not.toHaveBeenCalled();

      eventBus.resume();
      expect(handler).toHaveBeenCalledTimes(5);
    });
  });

  describe('history', () => {
    it('should store events in history', () => {
      const eventBus = EventBus.getInstance();

      const event: DayChangedEvent = {
        type: 'DAY_CHANGED',
        timestamp: Date.now(),
        day: 1,
        newDay: 1
      };

      eventBus.emit(event);

      const history = eventBus.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toEqual(event);
    });

    it('should limit history size', () => {
      const eventBus = EventBus.getInstance();
      eventBus.setHistoryLimit(5);

      for (let i = 1; i <= 10; i++) {
        eventBus.emit({
          type: 'DAY_CHANGED',
          timestamp: Date.now(),
          day: i,
          newDay: i
        });
      }

      const history = eventBus.getHistory();
      expect(history).toHaveLength(5);
      expect((history[0] as DayChangedEvent).newDay).toBe(6); // Oldest remaining
    });

    it('should filter history by event type', () => {
      const eventBus = EventBus.getInstance();

      eventBus.emit({
        type: 'DAY_CHANGED',
        timestamp: Date.now(),
        day: 1,
        newDay: 1
      });

      eventBus.emit({
        type: 'ENTITY_DIED',
        timestamp: Date.now(),
        day: 1,
        entityType: 'prey',
        entityId: '1',
        position: { x: 0, y: 0 },
        cause: 'starvation',
        age: 10,
        energy: 0
      } as EntityDiedEvent);

      const dayHistory = eventBus.getHistory(undefined, 'DAY_CHANGED');
      expect(dayHistory).toHaveLength(1);
      expect(dayHistory[0].type).toBe('DAY_CHANGED');
    });

    it('should return recent N events', () => {
      const eventBus = EventBus.getInstance();

      for (let i = 1; i <= 10; i++) {
        eventBus.emit({
          type: 'DAY_CHANGED',
          timestamp: Date.now(),
          day: i,
          newDay: i
        });
      }

      const recent = eventBus.getHistory(3);
      expect(recent).toHaveLength(3);
      expect((recent[0] as DayChangedEvent).newDay).toBe(8);
    });

    it('should clear history', () => {
      const eventBus = EventBus.getInstance();

      eventBus.emit({
        type: 'DAY_CHANGED',
        timestamp: Date.now(),
        day: 1,
        newDay: 1
      });

      eventBus.clearHistory();
      expect(eventBus.getHistory()).toHaveLength(0);
    });
  });

  describe('hasSubscribers and getSubscriberCount', () => {
    it('should report correct subscriber status', () => {
      const eventBus = EventBus.getInstance();

      expect(eventBus.hasSubscribers('DAY_CHANGED')).toBe(false);
      expect(eventBus.getSubscriberCount('DAY_CHANGED')).toBe(0);

      eventBus.subscribe('DAY_CHANGED', () => {});

      expect(eventBus.hasSubscribers('DAY_CHANGED')).toBe(true);
      expect(eventBus.getSubscriberCount('DAY_CHANGED')).toBe(1);
    });
  });

  describe('error handling', () => {
    it('should continue processing after handler error', () => {
      const eventBus = EventBus.getInstance();
      const errorHandler = vi.fn(() => {
        throw new Error('Handler error');
      });
      const successHandler = vi.fn();

      eventBus.subscribe('DAY_CHANGED', errorHandler);
      eventBus.subscribe('DAY_CHANGED', successHandler);

      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      eventBus.emit({
        type: 'DAY_CHANGED',
        timestamp: Date.now(),
        day: 1,
        newDay: 1
      });

      expect(errorHandler).toHaveBeenCalled();
      expect(successHandler).toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });

  describe('clear', () => {
    it('should clear everything', () => {
      const eventBus = EventBus.getInstance();
      const handler = vi.fn();

      eventBus.subscribe('DAY_CHANGED', handler);
      eventBus.emit({
        type: 'DAY_CHANGED',
        timestamp: Date.now(),
        day: 1,
        newDay: 1
      });

      eventBus.pause();
      eventBus.emit({
        type: 'DAY_CHANGED',
        timestamp: Date.now(),
        day: 2,
        newDay: 2
      });

      eventBus.clear();

      expect(eventBus.getHistory()).toHaveLength(0);
      expect(eventBus.hasSubscribers('DAY_CHANGED')).toBe(false);
    });
  });
});
