import { Position } from '@dragforge/core';
import { BoundingBox, CollisionDetector, CollisionResult } from './types';
import { isIntersecting, getIntersectionArea, getDistance, pointInBoundingBox } from './algorithms';

export class PointerCollisionDetector implements CollisionDetector {
  name = 'pointer';

  detect(pointer: Position, droppables: BoundingBox[]): CollisionResult[] {
    const results: CollisionResult[] = [];

    droppables.forEach((droppable, index) => {
      if (pointInBoundingBox(pointer, droppable)) {
        results.push({
          index,
          overlap: 1,
          distance: 0,
        });
      }
    });

    return results;
  }
}

export class RectIntersectionDetector implements CollisionDetector {
  name = 'rectIntersection';

  detect(draggable: BoundingBox, droppables: BoundingBox[]): CollisionResult[] {
    const results: CollisionResult[] = [];

    droppables.forEach((droppable, index) => {
      if (isIntersecting(draggable, droppable)) {
        const overlap = getIntersectionArea(draggable, droppable);
        const distance = getDistance(draggable, droppable);
        
        results.push({
          index,
          overlap,
          distance,
        });
      }
    });

    return results.sort((a, b) => b.overlap - a.overlap);
  }
}

export class ClosestCenterDetector implements CollisionDetector {
  name = 'closestCenter';

  detect(draggable: BoundingBox, droppables: BoundingBox[]): CollisionResult[] {
    const results: CollisionResult[] = droppables.map((droppable, index) => {
      const distance = getDistance(draggable, droppable);
      const overlap = isIntersecting(draggable, droppable) 
        ? getIntersectionArea(draggable, droppable) 
        : 0;

      return {
        index,
        overlap,
        distance,
      };
    });

    return results.sort((a, b) => a.distance - b.distance);
  }
}