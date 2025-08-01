import { DropTarget } from '../types';
import {
  CollisionDetectionStrategy,
  CollisionContext,
  CollisionResult,
  GridSnapOptions,
  NestedContainerOptions
} from './types';
import {
  rectIntersection,
  closestCenter,
  closestCorners,
  pointerWithin,
  pointerDistance,
  isRectInViewport,
  getElementRect,
  snapToGrid,
  getRectCenter
} from './algorithms';
import { QuadTree } from './QuadTree';

/**
 * 基础碰撞检测策略
 */
export abstract class BaseCollisionStrategy implements CollisionDetectionStrategy {
  abstract readonly name: string;
  
  protected quadTree: QuadTree | null = null;
  protected boundsCache = new Map<HTMLElement, { rect: DOMRect; timestamp: number }>();
  protected cacheTimeout = 100; // 100ms 缓存

  /**
   * 获取元素边界（带缓存）
   */
  protected getElementBounds(element: HTMLElement): DOMRect {
    const now = Date.now();
    const cached = this.boundsCache.get(element);
    
    if (cached && now - cached.timestamp < this.cacheTimeout) {
      return cached.rect;
    }
    
    const rect = element.getBoundingClientRect();
    this.boundsCache.set(element, { rect, timestamp: now });
    return rect;
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.boundsCache.clear();
    this.quadTree = null;
  }

  /**
   * 构建空间索引
   */
  protected buildSpatialIndex(targets: DropTarget[], viewport: DOMRect): void {
    this.quadTree = new QuadTree({
      x: viewport.left,
      y: viewport.top,
      width: viewport.width,
      height: viewport.height
    });

    for (const target of targets) {
      if (target.element) {
        const rect = this.getElementBounds(target.element);
        target.rect = {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        };
        this.quadTree.insert(target);
      }
    }
  }

  abstract detect(context: CollisionContext, targets: DropTarget[]): CollisionResult[];
}

/**
 * 矩形相交检测策略
 */
export class RectIntersectionStrategy extends BaseCollisionStrategy {
  readonly name = 'rectIntersection';

  detect(context: CollisionContext, targets: DropTarget[]): CollisionResult[] {
    const results: CollisionResult[] = [];
    const { dragRect, viewportRect } = context;

    // 只检测视口内的元素
    if (!isRectInViewport(dragRect, viewportRect)) {
      return results;
    }

    // 使用四叉树优化查询
    if (targets.length > 20) {
      this.buildSpatialIndex(targets, viewportRect);
      targets = this.quadTree!.query(dragRect);
    }

    for (const target of targets) {
      if (!target.element || target.disabled) continue;

      const targetRect = target.rect || getElementRect(target.element);
      const ratio = rectIntersection(dragRect, targetRect);
      
      if (ratio !== null) {
        results.push({
          target,
          distance: 0,
          intersectionRatio: ratio,
          priority: ratio // 相交面积越大优先级越高
        });
      }
    }

    // 按优先级排序
    return results.sort((a, b) => b.priority - a.priority);
  }
}

/**
 * 最近中心点检测策略
 */
export class ClosestCenterStrategy extends BaseCollisionStrategy {
  readonly name = 'closestCenter';

  detect(context: CollisionContext, targets: DropTarget[]): CollisionResult[] {
    const results: CollisionResult[] = [];
    const { dragRect, viewportRect } = context;

    if (!isRectInViewport(dragRect, viewportRect)) {
      return results;
    }

    for (const target of targets) {
      if (!target.element || target.disabled) continue;

      const targetRect = target.rect || getElementRect(target.element);
      const distance = closestCenter(dragRect, targetRect);
      
      // 只返回一定范围内的目标
      if (distance < 200) {
        results.push({
          target,
          distance,
          intersectionRatio: 0,
          priority: 1000 / (distance + 1) // 距离越近优先级越高
        });
      }
    }

    return results.sort((a, b) => b.priority - a.priority);
  }
}

/**
 * 指针位置检测策略
 */
export class PointerWithinStrategy extends BaseCollisionStrategy {
  readonly name = 'pointerWithin';

  detect(context: CollisionContext, targets: DropTarget[]): CollisionResult[] {
    const results: CollisionResult[] = [];
    const { position } = context;

    for (const target of targets) {
      if (!target.element || target.disabled) continue;

      const targetRect = target.rect || getElementRect(target.element);
      
      if (pointerWithin(position, targetRect)) {
        const distance = pointerDistance(position, targetRect);
        results.push({
          target,
          distance,
          intersectionRatio: 1,
          priority: 1000 // 指针在内部的优先级最高
        });
      }
    }

    return results.sort((a, b) => b.priority - a.priority);
  }
}

/**
 * 网格对齐碰撞检测策略
 */
export class GridSnapStrategy extends BaseCollisionStrategy {
  readonly name = 'gridSnap';
  
  constructor(private gridOptions: GridSnapOptions) {
    super();
  }

  detect(context: CollisionContext, targets: DropTarget[]): CollisionResult[] {
    if (!this.gridOptions.enabled) {
      return new RectIntersectionStrategy().detect(context, targets);
    }

    const { dragRect, position } = context;
    const { gridSize, offset } = this.gridOptions;
    
    // 对齐到网格
    const snappedPosition = snapToGrid(position, gridSize, offset);
    const snappedRect = {
      ...dragRect,
      x: snappedPosition.x - dragRect.width / 2,
      y: snappedPosition.y - dragRect.height / 2
    };

    // 使用对齐后的位置进行碰撞检测
    const snappedContext = { ...context, dragRect: snappedRect, position: snappedPosition };
    return new RectIntersectionStrategy().detect(snappedContext, targets);
  }
}

/**
 * 嵌套容器碰撞检测策略
 */
export class NestedContainerStrategy extends BaseCollisionStrategy {
  readonly name = 'nestedContainer';
  
  constructor(private nestedOptions: NestedContainerOptions) {
    super();
  }

  detect(context: CollisionContext, targets: DropTarget[]): CollisionResult[] {
    const results: CollisionResult[] = [];
    const { position } = context;
    
    if (!this.nestedOptions.enabled) {
      return new PointerWithinStrategy().detect(context, targets);
    }

    // 按深度优先级检测容器
    const containersMap = new Map<HTMLElement, DropTarget>();
    for (const target of targets) {
      if (target.element) {
        containersMap.set(target.element, target);
      }
    }

    // 查找最深的容器
    let deepestContainer: DropTarget | null = null;
    let maxDepth = -1;

    for (const target of targets) {
      if (!target.element || target.disabled) continue;

      const targetRect = target.rect || getElementRect(target.element);
      if (pointerWithin(position, targetRect)) {
        const depth = this.getContainerDepth(target.element, containersMap);
        
        if (depth > maxDepth && depth <= (this.nestedOptions.maxDepth || Infinity)) {
          deepestContainer = target;
          maxDepth = depth;
        }
      }
    }

    if (deepestContainer) {
      results.push({
        target: deepestContainer,
        distance: 0,
        intersectionRatio: 1,
        priority: 1000 + maxDepth // 深度越大优先级越高
      });
    }

    return results;
  }

  /**
   * 获取容器深度
   */
  private getContainerDepth(element: HTMLElement, containers: Map<HTMLElement, DropTarget>): number {
    let depth = 0;
    let current = element.parentElement;
    
    while (current && current !== document.body) {
      if (containers.has(current)) {
        depth++;
      }
      current = current.parentElement;
    }
    
    return depth;
  }
}

/**
 * 组合策略 - 支持多种策略组合
 */
export class CompositeStrategy extends BaseCollisionStrategy {
  readonly name = 'composite';
  
  constructor(private strategies: CollisionDetectionStrategy[]) {
    super();
  }

  detect(context: CollisionContext, targets: DropTarget[]): CollisionResult[] {
    const allResults: CollisionResult[] = [];
    const resultMap = new Map<DropTarget, CollisionResult>();

    // 执行所有策略
    for (const strategy of this.strategies) {
      const results = strategy.detect(context, targets);
      
      for (const result of results) {
        const existing = resultMap.get(result.target);
        if (!existing || result.priority > existing.priority) {
          resultMap.set(result.target, result);
        }
      }
    }

    // 转换为数组并排序
    return Array.from(resultMap.values()).sort((a, b) => b.priority - a.priority);
  }
}