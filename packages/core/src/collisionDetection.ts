import { CollisionDetection, DragNode, DropTarget, Position } from './types';
import { 
  createCollisionDetector, 
  CollisionDetector,
  pointerWithin,
  getElementRect
} from './collision';

/**
 * 矩形相交碰撞检测（使用新的碰撞检测系统）
 */
export class RectIntersectionCollision implements CollisionDetection {
  private detector: CollisionDetector;

  constructor() {
    this.detector = createCollisionDetector({
      strategy: 'rectIntersection'
    });
  }

  detectCollision(dragNode: DragNode, position: Position, dropTargets: DropTarget[]): DropTarget | null {
    return this.detector.getBestTarget(dragNode, position, dropTargets);
  }
}

/**
 * 指针位置碰撞检测（向后兼容）
 */
export class PointerWithinCollision implements CollisionDetection {
  detectCollision(dragNode: DragNode, position: Position, dropTargets: DropTarget[]): DropTarget | null {
    for (const target of dropTargets) {
      if (target.disabled || !target.element) continue;
      
      const rect = getElementRect(target.element);
      if (pointerWithin(position, rect)) {
        return target;
      }
    }
    return null;
  }
}

/**
 * 最近中心点碰撞检测
 */
export class ClosestCenterCollision implements CollisionDetection {
  private detector: CollisionDetector;

  constructor() {
    this.detector = createCollisionDetector({
      strategy: 'closestCenter'
    });
  }

  detectCollision(dragNode: DragNode, position: Position, dropTargets: DropTarget[]): DropTarget | null {
    return this.detector.getBestTarget(dragNode, position, dropTargets);
  }
}

/**
 * 网格对齐碰撞检测
 */
export class GridSnapCollision implements CollisionDetection {
  private detector: CollisionDetector;

  constructor(gridSize = 20) {
    this.detector = createCollisionDetector({
      strategy: 'rectIntersection',
      gridSnap: {
        enabled: true,
        gridSize
      }
    });
  }

  detectCollision(dragNode: DragNode, position: Position, dropTargets: DropTarget[]): DropTarget | null {
    return this.detector.getBestTarget(dragNode, position, dropTargets);
  }
}

/**
 * 嵌套容器碰撞检测
 */
export class NestedContainerCollision implements CollisionDetection {
  private detector: CollisionDetector;

  constructor(maxDepth = 5) {
    this.detector = createCollisionDetector({
      strategy: 'pointerWithin',
      nestedContainers: {
        enabled: true,
        maxDepth
      }
    });
  }

  detectCollision(dragNode: DragNode, position: Position, dropTargets: DropTarget[]): DropTarget | null {
    return this.detector.getBestTarget(dragNode, position, dropTargets);
  }
}