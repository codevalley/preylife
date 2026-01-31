/**
 * SpatialHash - Grid-based spatial partitioning for efficient entity queries
 *
 * Replaces O(n²) entity queries with O(1) cell lookups.
 * Entities are stored in grid cells based on their position, allowing
 * fast neighborhood queries for collision detection, hunting, and other
 * distance-based interactions.
 */

import { Vector3 } from 'three';

export interface SpatialEntity {
  id: string;
  position: Vector3;
}

export interface QueryResult<T extends SpatialEntity> {
  entity: T;
  distance: number;
}

export class SpatialHash<T extends SpatialEntity> {
  private cellSize: number;
  private grid: Map<string, Set<T>>;
  private entityCells: Map<string, string>; // Maps entity ID to cell key

  /**
   * Create a new SpatialHash
   * @param cellSize - Size of each grid cell. Should be >= largest query radius for efficiency.
   */
  constructor(cellSize: number = 100) {
    this.cellSize = cellSize;
    this.grid = new Map();
    this.entityCells = new Map();
  }

  /**
   * Get the cell key for a position
   */
  private getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  /**
   * Get the cell coordinates for a position
   */
  private getCellCoords(x: number, y: number): { cellX: number; cellY: number } {
    return {
      cellX: Math.floor(x / this.cellSize),
      cellY: Math.floor(y / this.cellSize)
    };
  }

  /**
   * Insert an entity into the spatial hash
   */
  insert(entity: T): void {
    const key = this.getCellKey(entity.position.x, entity.position.y);

    // Remove from old cell if it exists
    const oldKey = this.entityCells.get(entity.id);
    if (oldKey && oldKey !== key) {
      const oldCell = this.grid.get(oldKey);
      if (oldCell) {
        oldCell.delete(entity);
        if (oldCell.size === 0) {
          this.grid.delete(oldKey);
        }
      }
    }

    // Add to new cell
    if (!this.grid.has(key)) {
      this.grid.set(key, new Set());
    }
    this.grid.get(key)!.add(entity);
    this.entityCells.set(entity.id, key);
  }

  /**
   * Remove an entity from the spatial hash
   */
  remove(entity: T): void {
    const key = this.entityCells.get(entity.id);
    if (key) {
      const cell = this.grid.get(key);
      if (cell) {
        cell.delete(entity);
        if (cell.size === 0) {
          this.grid.delete(key);
        }
      }
      this.entityCells.delete(entity.id);
    }
  }

  /**
   * Update an entity's position in the spatial hash
   * More efficient than remove + insert when entity might not have moved cells
   */
  update(entity: T): void {
    const newKey = this.getCellKey(entity.position.x, entity.position.y);
    const oldKey = this.entityCells.get(entity.id);

    // Only update if cell changed
    if (oldKey !== newKey) {
      this.insert(entity);
    }
  }

  /**
   * Query all entities within a radius of a position
   * @param x - Center X position
   * @param y - Center Y position
   * @param radius - Search radius
   * @param exclude - Optional entity to exclude from results (e.g., the querying entity itself)
   * @returns Array of entities within the radius
   */
  query(x: number, y: number, radius: number, exclude?: T): T[] {
    const results: T[] = [];
    const radiusSquared = radius * radius;

    // Calculate cells to check based on radius
    const { cellX: minCellX, cellY: minCellY } = this.getCellCoords(x - radius, y - radius);
    const { cellX: maxCellX, cellY: maxCellY } = this.getCellCoords(x + radius, y + radius);

    // Check all cells that might contain entities within radius
    for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
      for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
        const key = `${cellX},${cellY}`;
        const cell = this.grid.get(key);

        if (cell) {
          for (const entity of cell) {
            // Skip excluded entity
            if (exclude && entity.id === exclude.id) continue;

            // Check actual distance
            const dx = entity.position.x - x;
            const dy = entity.position.y - y;
            const distanceSquared = dx * dx + dy * dy;

            if (distanceSquared <= radiusSquared) {
              results.push(entity);
            }
          }
        }
      }
    }

    return results;
  }

  /**
   * Query all entities within a radius with distance information
   * @param x - Center X position
   * @param y - Center Y position
   * @param radius - Search radius
   * @param exclude - Optional entity to exclude from results
   * @returns Array of query results with entity and distance
   */
  queryWithDistance(x: number, y: number, radius: number, exclude?: T): QueryResult<T>[] {
    const results: QueryResult<T>[] = [];
    const radiusSquared = radius * radius;

    const { cellX: minCellX, cellY: minCellY } = this.getCellCoords(x - radius, y - radius);
    const { cellX: maxCellX, cellY: maxCellY } = this.getCellCoords(x + radius, y + radius);

    for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
      for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
        const key = `${cellX},${cellY}`;
        const cell = this.grid.get(key);

        if (cell) {
          for (const entity of cell) {
            if (exclude && entity.id === exclude.id) continue;

            const dx = entity.position.x - x;
            const dy = entity.position.y - y;
            const distanceSquared = dx * dx + dy * dy;

            if (distanceSquared <= radiusSquared) {
              results.push({
                entity,
                distance: Math.sqrt(distanceSquared)
              });
            }
          }
        }
      }
    }

    return results;
  }

  /**
   * Find the nearest entity to a position within a maximum radius
   * @param x - Center X position
   * @param y - Center Y position
   * @param maxRadius - Maximum search radius
   * @param exclude - Optional entity to exclude from results
   * @returns The nearest entity and its distance, or null if none found
   */
  findNearest(x: number, y: number, maxRadius: number, exclude?: T): QueryResult<T> | null {
    const candidates = this.queryWithDistance(x, y, maxRadius, exclude);

    if (candidates.length === 0) return null;

    let nearest = candidates[0];
    for (let i = 1; i < candidates.length; i++) {
      if (candidates[i].distance < nearest.distance) {
        nearest = candidates[i];
      }
    }

    return nearest;
  }

  /**
   * Clear all entities from the spatial hash
   */
  clear(): void {
    this.grid.clear();
    this.entityCells.clear();
  }

  /**
   * Get the total number of entities in the spatial hash
   */
  get size(): number {
    return this.entityCells.size;
  }

  /**
   * Get all entities in the spatial hash
   */
  getAll(): T[] {
    const all: T[] = [];
    for (const cell of this.grid.values()) {
      for (const entity of cell) {
        all.push(entity);
      }
    }
    return all;
  }

  /**
   * Get statistics about the spatial hash distribution
   * Useful for debugging and tuning cell size
   */
  getStats(): { cellCount: number; entityCount: number; avgPerCell: number; maxPerCell: number } {
    let maxPerCell = 0;
    let totalEntities = 0;

    for (const cell of this.grid.values()) {
      totalEntities += cell.size;
      if (cell.size > maxPerCell) {
        maxPerCell = cell.size;
      }
    }

    return {
      cellCount: this.grid.size,
      entityCount: totalEntities,
      avgPerCell: this.grid.size > 0 ? totalEntities / this.grid.size : 0,
      maxPerCell
    };
  }
}
