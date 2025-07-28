import { BaseSensor } from './baseSensor';
import { SensorOptions, Position } from './types';

export interface MouseSensorOptions extends SensorOptions {
  button?: number; // 默认0 (左键)
  activationConstraint?: {
    delay?: number;
    tolerance?: number;
    distance?: number;
  };
}

export class MouseSensor extends BaseSensor {
  private startPosition: Position | null = null;
  private startTime: number = 0;
  private currentTarget: HTMLElement | null = null;
  private isDragging = false;
  private hasActivated = false;

  // 绑定的事件处理器引用，用于清理
  private boundHandlers = {
    mousedown: this.handleMouseDown.bind(this),
    mousemove: this.handleMouseMove.bind(this),
    mouseup: this.handleMouseUp.bind(this),
    dragstart: this.handleDragStart.bind(this),
    selectstart: this.handleSelectStart.bind(this),
    contextmenu: this.handleContextMenu.bind(this)
  };

  constructor(options: MouseSensorOptions = {}) {
    super('MouseSensor', 100, options); // 优先级100，高于触摸传感器
  }

  protected getDefaultOptions(): MouseSensorOptions {
    return {
      button: 0, // 左键
      activationConstraint: {
        distance: 5, // 5px移动距离才激活
        tolerance: 2  // 2px容差
      }
    };
  }

  canHandle(event: Event): boolean {
    if (event instanceof MouseEvent) {
      const button = (this.options as MouseSensorOptions).button ?? 0;
      // 检查是否是指定的鼠标按键
      if (event.type === 'mousedown') {
        return event.button === button;
      }
      return true;
    }
    return false;
  }

  protected bindEvents(): void {
    if (!this.element) return;

    // 绑定初始mousedown事件
    this.addEventListener(this.element, 'mousedown', this.boundHandlers.mousedown);
    
    // 防止默认的拖拽和选择行为
    this.addEventListener(this.element, 'dragstart', this.boundHandlers.dragstart);
    this.addEventListener(this.element, 'selectstart', this.boundHandlers.selectstart);
  }

  protected unbindEvents(): void {
    if (!this.element) return;

    // 移除所有事件监听器
    this.removeAllEventListeners(this.element);
    this.removeDocumentEvents();
    
    this.resetState();
  }

  private handleMouseDown(event: MouseEvent): void {
    if (!this.isEnabled() || !this.canHandle(event)) return;

    // 阻止默认行为
    event.preventDefault();
    event.stopPropagation();

    // 记录开始状态
    this.startPosition = { x: event.clientX, y: event.clientY };
    this.startTime = Date.now();
    this.currentTarget = event.target as HTMLElement;
    this.isDragging = true;
    this.hasActivated = false;

    // 绑定文档级别的事件
    this.bindDocumentEvents();

    // 阻止右键菜单
    if (event.button === 2) {
      this.addEventListener(document, 'contextmenu', this.boundHandlers.contextmenu);
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.isDragging || !this.startPosition || !this.element) return;

    const currentPosition = { x: event.clientX, y: event.clientY };

    // 检查是否在容差范围内
    if (!this.hasActivated && this.isWithinTolerance(this.startPosition, currentPosition)) {
      return;
    }

    // 检查激活约束
    if (!this.hasActivated) {
      if (!this.checkActivationConstraint(this.startPosition, currentPosition, this.startTime)) {
        return;
      }

      // 首次激活
      this.hasActivated = true;
      this.setActive(true);
      
      // 发送开始事件
      this.emitSensorEvent('start', this.startPosition, this.currentTarget || this.element, event);
    }

    // 发送移动事件
    this.emitSensorEvent('move', currentPosition, this.currentTarget || this.element, event);
  }

  private handleMouseUp(event: MouseEvent): void {
    if (!this.isDragging) return;

    const currentPosition = { x: event.clientX, y: event.clientY };

    if (this.hasActivated && this.active) {
      // 发送结束事件
      this.emitSensorEvent('end', currentPosition, this.currentTarget || this.element!, event);
    }

    this.cleanup();
  }

  private handleDragStart(event: DragEvent): void {
    // 阻止浏览器默认的拖拽行为
    event.preventDefault();
  }

  private handleSelectStart(event: Event): void {
    // 在拖拽过程中阻止文本选择
    if (this.isDragging) {
      event.preventDefault();
    }
  }

  private handleContextMenu(event: Event): void {
    // 在拖拽过程中阻止右键菜单
    if (this.isDragging) {
      event.preventDefault();
    }
  }

  private handleMouseLeave = (event: MouseEvent): void => {
    // 鼠标离开窗口时的处理
    if (this.isDragging && this.hasActivated) {
      const currentPosition = { x: event.clientX, y: event.clientY };
      this.emitSensorEvent('cancel', currentPosition, this.currentTarget || this.element!, event);
    }
    this.cleanup();
  };

  private handleBlur = (): void => {
    // 窗口失去焦点时的处理
    if (this.isDragging && this.hasActivated) {
      const cancelEvent = new CustomEvent('blur');
      this.emitSensorEvent('cancel', { x: 0, y: 0 }, this.element!, cancelEvent);
    }
    this.cleanup();
  };

  private bindDocumentEvents(): void {
    // 绑定全局事件处理器
    this.addEventListener(document, 'mousemove', this.boundHandlers.mousemove, { passive: false });
    this.addEventListener(document, 'mouseup', this.boundHandlers.mouseup);
    
    // 处理边界情况
    this.addEventListener(document, 'mouseleave', this.handleMouseLeave);
    this.addEventListener(window, 'blur', this.handleBlur);
    
    // 阻止选择和拖拽
    this.addEventListener(document, 'selectstart', this.boundHandlers.selectstart);
    this.addEventListener(document, 'dragstart', this.boundHandlers.dragstart);
  }

  private removeDocumentEvents(): void {
    // 移除全局事件处理器
    this.removeEventListener(document, 'mousemove', this.boundHandlers.mousemove);
    this.removeEventListener(document, 'mouseup', this.boundHandlers.mouseup);
    this.removeEventListener(document, 'mouseleave', this.handleMouseLeave);
    this.removeEventListener(window, 'blur', this.handleBlur);
    this.removeEventListener(document, 'selectstart', this.boundHandlers.selectstart);
    this.removeEventListener(document, 'dragstart', this.boundHandlers.dragstart);
    this.removeEventListener(document, 'contextmenu', this.boundHandlers.contextmenu);
  }

  private resetState(): void {
    this.startPosition = null;
    this.startTime = 0;
    this.currentTarget = null;
    this.isDragging = false;
    this.hasActivated = false;
    this.setActive(false);
  }

  private cleanup(): void {
    this.removeDocumentEvents();
    this.resetState();
  }

  // 公共方法：获取当前拖拽状态
  getDragState() {
    return {
      isDragging: this.isDragging,
      isActive: this.active,
      hasActivated: this.hasActivated,
      startPosition: this.startPosition,
      currentTarget: this.currentTarget
    };
  }
}