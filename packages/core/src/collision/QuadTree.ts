import { Rect, DropTarget } from '../types';
import { QuadTreeNode } from './types';
import { rectIntersection } from './algorithms';

/**
 * 四叉树空间索引
 * 用于优化大量元素的碰撞检测
 */
export class QuadTree {
  private root: QuadTreeNode;
  private maxObjects = 10;
  private maxLevels = 5;

  constructor(bounds: Rect, maxObjects = 10, maxLevels = 5) {
    this.maxObjects = maxObjects;
    this.maxLevels = maxLevels;
    this.root = this.createNode(bounds, 0);
  }

  /**
   * 创建节点
   */
  private createNode(bounds: Rect, level: number): QuadTreeNode {
    return {
      bounds,
      objects: [],
      nodes: [],
      level
    };
  }

  /**
   * 清空四叉树
   */
  clear(): void {
    this.clearNode(this.root);
  }

  private clearNode(node: QuadTreeNode): void {
    node.objects = [];
    node.nodes = [];
  }

  /**
   * 插入对象
   */
  insert(target: DropTarget): void {
    if (!target.rect) return;
    this.insertIntoNode(this.root, target);
  }

  private insertIntoNode(node: QuadTreeNode, target: DropTarget): void {
    if (!target.rect) return;

    // 如果有子节点，尝试插入到子节点
    if (node.nodes.length > 0) {
      const index = this.getIndex(node, target.rect);
      if (index !== -1) {
        this.insertIntoNode(node.nodes[index], target);
        return;
      }
    }

    // 添加到当前节点
    node.objects.push(target);

    // 如果超过最大对象数且未达到最大层级，则分割
    if (node.objects.length > this.maxObjects && node.level < this.maxLevels) {
      if (node.nodes.length === 0) {
        this.split(node);
      }

      // 重新分配对象到子节点
      let i = 0;
      while (i < node.objects.length) {
        const obj = node.objects[i];
        if (obj.rect) {
          const index = this.getIndex(node, obj.rect);
          if (index !== -1) {
            node.objects.splice(i, 1);
            this.insertIntoNode(node.nodes[index], obj);
            continue;
          }
        }
        i++;
      }
    }
  }

  /**
   * 分割节点为四个子节点
   */
  private split(node: QuadTreeNode): void {
    const { x, y, width, height } = node.bounds;
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const level = node.level + 1;

    // 创建四个子节点
    node.nodes = [
      // 右上
      this.createNode({
        x: x + halfWidth,
        y: y,
        width: halfWidth,
        height: halfHeight
      }, level),
      // 左上
      this.createNode({
        x: x,
        y: y,
        width: halfWidth,
        height: halfHeight
      }, level),
      // 左下
      this.createNode({
        x: x,
        y: y + halfHeight,
        width: halfWidth,
        height: halfHeight
      }, level),
      // 右下
      this.createNode({
        x: x + halfWidth,
        y: y + halfHeight,
        width: halfWidth,
        height: halfHeight
      }, level)
    ];
  }

  /**
   * 获取矩形应该插入的子节点索引
   */
  private getIndex(node: QuadTreeNode, rect: Rect): number {
    const { x, y, width, height } = node.bounds;
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const midX = x + halfWidth;
    const midY = y + halfHeight;

    // 判断是否完全位于某个象限
    const inTop = rect.y + rect.height < midY;
    const inBottom = rect.y > midY;
    const inLeft = rect.x + rect.width < midX;
    const inRight = rect.x > midX;

    if (inTop) {
      if (inRight) return 0; // 右上
      if (inLeft) return 1;  // 左上
    } else if (inBottom) {
      if (inLeft) return 2;  // 左下
      if (inRight) return 3; // 右下
    }

    return -1; // 跨越多个象限
  }

  /**
   * 查询可能与给定矩形碰撞的对象
   */
  query(rect: Rect): DropTarget[] {
    const candidates: DropTarget[] = [];
    this.queryNode(this.root, rect, candidates);
    return candidates;
  }

  private queryNode(node: QuadTreeNode, rect: Rect, result: DropTarget[]): void {
    // 检查是否与节点边界相交
    if (!rectIntersection(rect, node.bounds)) {
      return;
    }

    // 添加当前节点的对象
    result.push(...node.objects);

    // 递归查询子节点
    if (node.nodes.length > 0) {
      for (const child of node.nodes) {
        this.queryNode(child, rect, result);
      }
    }
  }

  /**
   * 获取所有对象
   */
  getAllObjects(): DropTarget[] {
    const objects: DropTarget[] = [];
    this.collectObjects(this.root, objects);
    return objects;
  }

  private collectObjects(node: QuadTreeNode, result: DropTarget[]): void {
    result.push(...node.objects);
    for (const child of node.nodes) {
      this.collectObjects(child, result);
    }
  }

  /**
   * 可视化调试信息
   */
  getDebugInfo(): any {
    return this.getNodeDebugInfo(this.root);
  }

  private getNodeDebugInfo(node: QuadTreeNode): any {
    return {
      bounds: node.bounds,
      level: node.level,
      objects: node.objects.length,
      children: node.nodes.map(child => this.getNodeDebugInfo(child))
    };
  }
}