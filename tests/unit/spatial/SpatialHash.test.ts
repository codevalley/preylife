import { describe, it, expect, beforeEach } from 'vitest';
import { Vector3 } from 'three';
import { SpatialHash, SpatialEntity } from '../../../src/spatial/SpatialHash';

// Test entity implementing SpatialEntity interface
interface TestEntity extends SpatialEntity {
  id: string;
  position: Vector3;
  name?: string;
}

function createEntity(id: string, x: number, y: number, name?: string): TestEntity {
  return { id, position: new Vector3(x, y, 0), name };
}

describe('SpatialHash', () => {
  let spatialHash: SpatialHash<TestEntity>;

  beforeEach(() => {
    spatialHash = new SpatialHash<TestEntity>(100);
  });

  describe('insert and remove', () => {
    it('should insert an entity', () => {
      const entity = createEntity('1', 50, 50);
      spatialHash.insert(entity);
      expect(spatialHash.size).toBe(1);
    });

    it('should remove an entity', () => {
      const entity = createEntity('1', 50, 50);
      spatialHash.insert(entity);
      spatialHash.remove(entity);
      expect(spatialHash.size).toBe(0);
    });

    it('should handle removing non-existent entity gracefully', () => {
      const entity = createEntity('1', 50, 50);
      spatialHash.remove(entity); // Should not throw
      expect(spatialHash.size).toBe(0);
    });

    it('should handle multiple entities', () => {
      const entities = [
        createEntity('1', 0, 0),
        createEntity('2', 50, 50),
        createEntity('3', 150, 150)
      ];

      for (const entity of entities) {
        spatialHash.insert(entity);
      }

      expect(spatialHash.size).toBe(3);
    });
  });

  describe('update', () => {
    it('should update entity position within same cell', () => {
      const entity = createEntity('1', 50, 50);
      spatialHash.insert(entity);

      entity.position.x = 60;
      entity.position.y = 60;
      spatialHash.update(entity);

      const results = spatialHash.query(60, 60, 10);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('1');
    });

    it('should update entity position across cells', () => {
      const entity = createEntity('1', 50, 50);
      spatialHash.insert(entity);

      // Move to a different cell
      entity.position.x = 150;
      entity.position.y = 150;
      spatialHash.update(entity);

      // Should not find at old position
      const oldResults = spatialHash.query(50, 50, 10);
      expect(oldResults).toHaveLength(0);

      // Should find at new position
      const newResults = spatialHash.query(150, 150, 10);
      expect(newResults).toHaveLength(1);
    });
  });

  describe('query', () => {
    it('should find entities within radius', () => {
      spatialHash.insert(createEntity('1', 0, 0));
      spatialHash.insert(createEntity('2', 30, 30));
      spatialHash.insert(createEntity('3', 200, 200));

      const results = spatialHash.query(0, 0, 50);
      expect(results).toHaveLength(2);

      const ids = results.map(e => e.id).sort();
      expect(ids).toEqual(['1', '2']);
    });

    it('should respect exact radius boundary', () => {
      spatialHash.insert(createEntity('1', 0, 0));
      spatialHash.insert(createEntity('2', 50, 0)); // Exactly at radius

      const results = spatialHash.query(0, 0, 50);
      expect(results).toHaveLength(2);

      const resultsSmaller = spatialHash.query(0, 0, 49);
      expect(resultsSmaller).toHaveLength(1);
    });

    it('should exclude specified entity', () => {
      const entity1 = createEntity('1', 0, 0);
      const entity2 = createEntity('2', 10, 10);

      spatialHash.insert(entity1);
      spatialHash.insert(entity2);

      const results = spatialHash.query(0, 0, 50, entity1);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('2');
    });

    it('should query across cell boundaries', () => {
      // Place entities in different cells
      spatialHash.insert(createEntity('1', 95, 95));   // Cell (0,0)
      spatialHash.insert(createEntity('2', 105, 105)); // Cell (1,1)

      // Query from center should find both
      const results = spatialHash.query(100, 100, 20);
      expect(results).toHaveLength(2);
    });

    it('should return empty array when no entities in range', () => {
      spatialHash.insert(createEntity('1', 0, 0));

      const results = spatialHash.query(500, 500, 50);
      expect(results).toHaveLength(0);
    });
  });

  describe('queryWithDistance', () => {
    it('should return entities with correct distances', () => {
      spatialHash.insert(createEntity('1', 0, 0));
      spatialHash.insert(createEntity('2', 30, 40)); // Distance 50 from origin

      const results = spatialHash.queryWithDistance(0, 0, 100);
      expect(results).toHaveLength(2);

      const entity2Result = results.find(r => r.entity.id === '2');
      expect(entity2Result).toBeDefined();
      expect(entity2Result!.distance).toBeCloseTo(50, 5);
    });
  });

  describe('findNearest', () => {
    it('should find the nearest entity', () => {
      spatialHash.insert(createEntity('1', 100, 100));
      spatialHash.insert(createEntity('2', 30, 30));
      spatialHash.insert(createEntity('3', 50, 50));

      const result = spatialHash.findNearest(0, 0, 200);
      expect(result).not.toBeNull();
      expect(result!.entity.id).toBe('2');
    });

    it('should return null when no entities in range', () => {
      spatialHash.insert(createEntity('1', 500, 500));

      const result = spatialHash.findNearest(0, 0, 100);
      expect(result).toBeNull();
    });

    it('should exclude specified entity when finding nearest', () => {
      const entity1 = createEntity('1', 10, 10);
      const entity2 = createEntity('2', 50, 50);

      spatialHash.insert(entity1);
      spatialHash.insert(entity2);

      const result = spatialHash.findNearest(0, 0, 200, entity1);
      expect(result).not.toBeNull();
      expect(result!.entity.id).toBe('2');
    });
  });

  describe('clear and getAll', () => {
    it('should clear all entities', () => {
      spatialHash.insert(createEntity('1', 0, 0));
      spatialHash.insert(createEntity('2', 100, 100));

      spatialHash.clear();
      expect(spatialHash.size).toBe(0);
      expect(spatialHash.getAll()).toHaveLength(0);
    });

    it('should return all entities', () => {
      spatialHash.insert(createEntity('1', 0, 0));
      spatialHash.insert(createEntity('2', 100, 100));
      spatialHash.insert(createEntity('3', 200, 200));

      const all = spatialHash.getAll();
      expect(all).toHaveLength(3);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      // Insert entities in same cell
      spatialHash.insert(createEntity('1', 10, 10));
      spatialHash.insert(createEntity('2', 20, 20));
      // Insert entity in different cell
      spatialHash.insert(createEntity('3', 150, 150));

      const stats = spatialHash.getStats();
      expect(stats.entityCount).toBe(3);
      expect(stats.cellCount).toBe(2);
      expect(stats.maxPerCell).toBe(2);
    });
  });

  describe('negative coordinates', () => {
    it('should handle negative positions correctly', () => {
      spatialHash.insert(createEntity('1', -50, -50));
      spatialHash.insert(createEntity('2', -30, -30));

      const results = spatialHash.query(-40, -40, 50);
      expect(results).toHaveLength(2);
    });
  });

  describe('different cell sizes', () => {
    it('should work with small cell size', () => {
      const smallCellHash = new SpatialHash<TestEntity>(10);
      smallCellHash.insert(createEntity('1', 0, 0));
      smallCellHash.insert(createEntity('2', 15, 15));

      const results = smallCellHash.query(0, 0, 30);
      expect(results).toHaveLength(2);
    });

    it('should work with large cell size', () => {
      const largeCellHash = new SpatialHash<TestEntity>(500);
      largeCellHash.insert(createEntity('1', 0, 0));
      largeCellHash.insert(createEntity('2', 400, 400));

      const results = largeCellHash.query(200, 200, 300);
      expect(results).toHaveLength(2);
    });
  });
});
