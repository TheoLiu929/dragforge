import { Position, Rect, DragNode, DropTarget } from '../types';

/**
 * 碰撞检测结果
 */
export interface CollisionResult {
  target: DropTarget;
  distance: number;
  intersectionRatio: number;
  priority: number;
}

/**
 * 碰撞检测上下文
 */
export interface CollisionContext {
  dragNode: DragNode;
  position: Position;
  dragRect: Rect;
  viewportRect: Rect;
}

/**
 * 碰撞检测策略接口
 */
export interface CollisionDetectionStrategy {
  /**
   * 检测碰撞
   */
  detect(
    context: CollisionContext,
    targets: DropTarget[]
  ): CollisionResult[];

  /**
   * 策略名称
   */
  readonly name: string;
}

/**
 * 碰撞检测算法类型
 */
export type CollisionAlgorithm = (
  dragRect: Rect,
  targetRect: Rect,
  position: Position
) => number | null;

/**
 * 元素边界信息缓存
 */
export interface ElementBounds {
  element: HTMLElement;
  rect: Rect;
  timestamp: number;
}

/**
 * 四叉树节点
 */
export interface QuadTreeNode {
  bounds: Rect;
  objects: DropTarget[];
  nodes: QuadTreeNode[];
  level: number;
}

/**
 * 网格对齐选项
 */
export interface GridSnapOptions {
  enabled: boolean;
  gridSize: number;
  offset?: Position;
}

/**
 * 嵌套容器选项
 */
export interface NestedContainerOptions {
  enabled: boolean;
  maxDepth?: number;
  containerSelector?: string;
}

/**
 * 占位符选项
 */
export interface PlaceholderOptions {
  enabled: boolean;
  className?: string;
  createElement?: (dragNode: DragNode) => HTMLElement;
}