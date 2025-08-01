import { DragNode, DropTarget, Position, Rect } from '../types';
import {
  CollisionDetectionStrategy,
  CollisionContext,
  CollisionResult,
  GridSnapOptions,
  NestedContainerOptions,
  PlaceholderOptions
} from './types';
import {
  RectIntersectionStrategy,
  ClosestCenterStrategy,
  PointerWithinStrategy,
  GridSnapStrategy,
  NestedContainerStrategy,
  CompositeStrategy
} from './strategies';
import { PlaceholderManager } from './PlaceholderManager';
import { getElementRect } from './algorithms';

export interface CollisionDetectorOptions {
  strategy?: 'rectIntersection' | 'closestCenter' | 'pointerWithin' | 'custom';
  customStrategy?: CollisionDetectionStrategy;
  gridSnap?: GridSnapOptions;
  nestedContainers?: NestedContainerOptions;
  placeholder?: PlaceholderOptions;
  throttleMs?: number;
}

/**
 * 碰撞检测器
 * 管理碰撞检测策略和占位符显示
 */
export class CollisionDetector {
  private strategy: CollisionDetectionStrategy;
  private placeholderManager: PlaceholderManager;
  private lastDetectionTime = 0;
  private throttleMs: number;
  private cachedResults: CollisionResult[] = [];

  constructor(options: CollisionDetectorOptions = {}) {
    this.throttleMs = options.throttleMs || 16; // 默认 60fps
    this.strategy = this.createStrategy(options);
    this.placeholderManager = new PlaceholderManager(options.placeholder);
  }

  /**
   * 创建碰撞检测策略
   */
  private createStrategy(options: CollisionDetectorOptions): CollisionDetectionStrategy {
    const { strategy = 'rectIntersection', customStrategy, gridSnap, nestedContainers } = options;

    if (customStrategy) {
      return customStrategy;
    }

    // 构建策略组合
    const strategies: CollisionDetectionStrategy[] = [];

    // 添加网格对齐策略
    if (gridSnap?.enabled) {
      strategies.push(new GridSnapStrategy(gridSnap));
    }

    // 添加嵌套容器策略
    if (nestedContainers?.enabled) {
      strategies.push(new NestedContainerStrategy(nestedContainers));
    }

    // 添加基础策略
    switch (strategy) {
      case 'closestCenter':
        strategies.push(new ClosestCenterStrategy());
        break;
      case 'pointerWithin':
        strategies.push(new PointerWithinStrategy());
        break;
      case 'rectIntersection':
      default:
        strategies.push(new RectIntersectionStrategy());
        break;
    }

    // 如果有多个策略，使用组合策略
    return strategies.length > 1 ? new CompositeStrategy(strategies) : strategies[0];
  }

  /**
   * 检测碰撞
   */
  detect(
    dragNode: DragNode,
    position: Position,
    targets: DropTarget[]
  ): CollisionResult[] {
    const now = Date.now();
    
    // 节流处理
    if (now - this.lastDetectionTime < this.throttleMs) {
      return this.cachedResults;
    }
    
    this.lastDetectionTime = now;

    // 获取拖拽元素的矩形
    const dragRect = dragNode.element 
      ? getElementRect(dragNode.element)
      : { x: position.x - 50, y: position.y - 50, width: 100, height: 100 };

    // 获取视口矩形
    const viewportRect: Rect = {
      x: window.scrollX,
      y: window.scrollY,
      width: window.innerWidth,
      height: window.innerHeight
    };

    // 创建碰撞检测上下文
    const context: CollisionContext = {
      dragNode,
      position,
      dragRect,
      viewportRect
    };

    // 执行碰撞检测
    this.cachedResults = this.strategy.detect(context, targets);

    // 更新占位符
    if (this.cachedResults.length > 0) {
      const topResult = this.cachedResults[0];
      this.placeholderManager.show(dragNode, topResult.target, position);
    } else {
      this.placeholderManager.hide();
    }

    return this.cachedResults;
  }

  /**
   * 获取最优碰撞目标
   */
  getBestTarget(
    dragNode: DragNode,
    position: Position,
    targets: DropTarget[]
  ): DropTarget | null {
    const results = this.detect(dragNode, position, targets);
    return results.length > 0 ? results[0].target : null;
  }

  /**
   * 显示占位符
   */
  showPlaceholder(dragNode: DragNode, target: DropTarget, position: Position): void {
    this.placeholderManager.show(dragNode, target, position);
  }

  /**
   * 隐藏占位符
   */
  hidePlaceholder(): void {
    this.placeholderManager.hide();
  }

  /**
   * 更新配置
   */
  updateOptions(options: Partial<CollisionDetectorOptions>): void {
    if (options.strategy || options.customStrategy || options.gridSnap || options.nestedContainers) {
      this.strategy = this.createStrategy({ ...options } as CollisionDetectorOptions);
    }
    
    if (options.placeholder !== undefined) {
      this.placeholderManager = new PlaceholderManager(options.placeholder);
    }
    
    if (options.throttleMs !== undefined) {
      this.throttleMs = options.throttleMs;
    }
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.placeholderManager.hide();
    this.cachedResults = [];
  }
}