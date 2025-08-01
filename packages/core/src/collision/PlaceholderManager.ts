import { DragNode, DropTarget, Position } from '../types';
import { PlaceholderOptions } from './types';

/**
 * 占位符管理器
 * 用于在拖拽过程中显示放置位置预览
 */
export class PlaceholderManager {
  private placeholder: HTMLElement | null = null;
  private currentTarget: DropTarget | null = null;
  private options: PlaceholderOptions;

  constructor(options: PlaceholderOptions = { enabled: true }) {
    this.options = {
      enabled: true,
      className: 'dragforge-placeholder',
      ...options
    };
  }

  /**
   * 显示占位符
   */
  show(dragNode: DragNode, target: DropTarget, position: Position): void {
    if (!this.options.enabled || !target.element) return;

    // 如果目标没有变化，只更新位置
    if (this.currentTarget === target && this.placeholder) {
      this.updatePosition(position);
      return;
    }

    // 清理旧的占位符
    this.hide();

    // 创建新的占位符
    this.placeholder = this.createPlaceholder(dragNode);
    this.currentTarget = target;

    // 插入占位符
    this.insertPlaceholder(target, position);
  }

  /**
   * 隐藏占位符
   */
  hide(): void {
    if (this.placeholder) {
      this.placeholder.remove();
      this.placeholder = null;
      this.currentTarget = null;
    }
  }

  /**
   * 创建占位符元素
   */
  private createPlaceholder(dragNode: DragNode): HTMLElement {
    if (this.options.createElement) {
      return this.options.createElement(dragNode);
    }

    const placeholder = document.createElement('div');
    placeholder.className = this.options.className || 'dragforge-placeholder';
    
    // 设置默认样式
    if (dragNode.element) {
      const rect = dragNode.element.getBoundingClientRect();
      placeholder.style.cssText = `
        width: ${rect.width}px;
        height: ${rect.height}px;
        background: rgba(66, 153, 225, 0.2);
        border: 2px dashed #4299e1;
        border-radius: 4px;
        pointer-events: none;
        transition: all 0.2s ease;
      `;
    }

    return placeholder;
  }

  /**
   * 插入占位符到目标容器
   */
  private insertPlaceholder(target: DropTarget, position: Position): void {
    if (!target.element || !this.placeholder) return;

    const container = target.element;
    const children = Array.from(container.children) as HTMLElement[];
    
    // 如果容器是空的，直接添加
    if (children.length === 0) {
      container.appendChild(this.placeholder);
      return;
    }

    // 找到最近的插入位置
    const insertIndex = this.findInsertIndex(children, position, container);
    
    if (insertIndex >= children.length) {
      container.appendChild(this.placeholder);
    } else {
      container.insertBefore(this.placeholder, children[insertIndex]);
    }
  }

  /**
   * 更新占位符位置
   */
  private updatePosition(position: Position): void {
    if (!this.placeholder || !this.currentTarget?.element) return;

    const container = this.currentTarget.element;
    const children = Array.from(container.children).filter(
      child => child !== this.placeholder
    ) as HTMLElement[];

    if (children.length === 0) return;

    // 找到新的插入位置
    const insertIndex = this.findInsertIndex(children, position, container);
    const currentIndex = Array.from(container.children).indexOf(this.placeholder);

    // 如果位置没有变化，不需要移动
    if (currentIndex === insertIndex || currentIndex === insertIndex - 1) {
      return;
    }

    // 移动占位符
    if (insertIndex >= children.length) {
      container.appendChild(this.placeholder);
    } else {
      container.insertBefore(this.placeholder, children[insertIndex]);
    }
  }

  /**
   * 查找插入索引
   */
  private findInsertIndex(
    children: HTMLElement[],
    position: Position,
    container: HTMLElement
  ): number {
    const containerRect = container.getBoundingClientRect();
    const isHorizontal = this.isHorizontalLayout(children);

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const childRect = child.getBoundingClientRect();
      
      if (isHorizontal) {
        const childCenter = childRect.left + childRect.width / 2;
        if (position.x < childCenter) {
          return i;
        }
      } else {
        const childCenter = childRect.top + childRect.height / 2;
        if (position.y < childCenter) {
          return i;
        }
      }
    }

    return children.length;
  }

  /**
   * 判断是否为水平布局
   */
  private isHorizontalLayout(children: HTMLElement[]): boolean {
    if (children.length < 2) return true;

    const first = children[0].getBoundingClientRect();
    const second = children[1].getBoundingClientRect();
    
    // 如果第二个元素在第一个元素的右侧，认为是水平布局
    return Math.abs(first.top - second.top) < Math.abs(first.left - second.left);
  }

  /**
   * 获取占位符元素
   */
  getPlaceholder(): HTMLElement | null {
    return this.placeholder;
  }

  /**
   * 获取当前目标
   */
  getCurrentTarget(): DropTarget | null {
    return this.currentTarget;
  }
}