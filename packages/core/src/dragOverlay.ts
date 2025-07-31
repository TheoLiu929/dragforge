import { Position } from './types';

export interface DragOverlayOptions {
  zIndex?: number;
  className?: string;
  transitionDuration?: number;
}

export class DragOverlay {
  private container: HTMLElement | null = null;
  private previewElement: HTMLElement | null = null;
  private options: Required<DragOverlayOptions>;
  private isAnimating = false;

  constructor(options: DragOverlayOptions = {}) {
    this.options = {
      zIndex: 9999,
      className: 'dragforge-overlay',
      transitionDuration: 200,
      ...options,
    };
  }

  public create(sourceElement: HTMLElement, position: Position): void {
    this.destroy();

    // 创建容器
    this.container = document.createElement('div');
    this.container.className = this.options.className;
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: ${this.options.zIndex};
    `;

    // 克隆源元素作为预览
    this.previewElement = sourceElement.cloneNode(true) as HTMLElement;
    this.previewElement.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: ${sourceElement.offsetWidth}px;
      height: ${sourceElement.offsetHeight}px;
      cursor: grabbing;
      pointer-events: none;
      transform: translate3d(${position.x}px, ${position.y}px, 0);
      will-change: transform;
    `;

    // 添加拖拽中的类名
    this.previewElement.classList.add('dragging');
    
    this.container.appendChild(this.previewElement);
    document.body.appendChild(this.container);

    // 设置 body cursor
    document.body.style.cursor = 'grabbing';
  }

  public updatePosition(position: Position): void {
    if (!this.previewElement || this.isAnimating) return;

    this.previewElement.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
  }

  public animateTo(position: Position): Promise<void> {
    return new Promise((resolve) => {
      if (!this.previewElement) {
        resolve();
        return;
      }

      this.isAnimating = true;
      
      // 添加过渡效果
      this.previewElement.style.transition = `transform ${this.options.transitionDuration}ms ease-out`;
      this.previewElement.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;

      const handleTransitionEnd = () => {
        if (this.previewElement) {
          this.previewElement.removeEventListener('transitionend', handleTransitionEnd);
          this.previewElement.style.transition = '';
        }
        this.isAnimating = false;
        resolve();
      };

      this.previewElement.addEventListener('transitionend', handleTransitionEnd);

      // 防止过渡未触发的情况
      setTimeout(() => {
        handleTransitionEnd();
      }, this.options.transitionDuration + 50);
    });
  }

  public destroy(): void {
    if (this.container) {
      this.container.remove();
      this.container = null;
      this.previewElement = null;
    }

    // 恢复 body cursor
    document.body.style.cursor = '';
  }

  public getPreviewElement(): HTMLElement | null {
    return this.previewElement;
  }

  public isActive(): boolean {
    return this.container !== null;
  }
}