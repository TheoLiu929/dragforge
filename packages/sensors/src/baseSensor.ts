import { Sensor, SensorOptions, SensorEventHandler, SensorEvent, Position } from './types';

export abstract class BaseSensor implements Sensor {
  public readonly name: string;
  public readonly priority: number;
  public readonly options: SensorOptions;

  protected element: HTMLElement | null = null;
  protected handler: SensorEventHandler | null = null;
  protected enabled = true;
  protected active = false;
  protected listeners: Array<{ event: string; listener: EventListener; options?: AddEventListenerOptions }> = [];

  constructor(name: string, priority: number, options: SensorOptions = {}) {
    this.name = name;
    this.priority = priority;
    this.options = { ...this.getDefaultOptions(), ...options };
  }

  // 子类需要实现的默认选项
  protected abstract getDefaultOptions(): SensorOptions;

  // 子类需要实现的事件绑定
  protected abstract bindEvents(): void;

  // 子类需要实现的事件解绑
  protected abstract unbindEvents(): void;

  // 生命周期方法
  attach(element: HTMLElement, handler: SensorEventHandler): void {
    if (this.element) {
      this.detach();
    }

    this.element = element;
    this.handler = handler;

    if (this.enabled && !this.options.disabled) {
      this.bindEvents();
    }
  }

  detach(): void {
    this.unbindEvents();
    this.element = null;
    this.handler = null;
    this.active = false;
  }

  // 状态控制
  enable(): void {
    if (!this.enabled) {
      this.enabled = true;
      if (this.element && !this.options.disabled) {
        this.bindEvents();
      }
    }
  }

  disable(): void {
    if (this.enabled) {
      this.enabled = false;
      this.unbindEvents();
      if (this.active) {
        this.cancelDrag();
      }
    }
  }

  // 状态查询
  isEnabled(): boolean {
    return this.enabled && !this.options.disabled;
  }

  isActive(): boolean {
    return this.active;
  }

  // 默认实现，子类可以覆盖
  canHandle(event: Event): boolean {
    return true;
  }

  // 清理资源
  destroy(): void {
    this.detach();
    this.listeners = [];
  }

  // 工具方法
  protected addEventListener(
    target: EventTarget,
    event: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ): void {
    target.addEventListener(event, listener, options);
    this.listeners.push({ event, listener, options });
  }

  protected removeEventListener(
    target: EventTarget,
    event: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ): void {
    target.removeEventListener(event, listener, options);
    const index = this.listeners.findIndex(l => 
      l.event === event && l.listener === listener
    );
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  protected removeAllEventListeners(target: EventTarget): void {
    this.listeners.forEach(({ event, listener, options }) => {
      target.removeEventListener(event, listener, options);
    });
    this.listeners = [];
  }

  // 发送传感器事件
  protected emitSensorEvent(
    type: SensorEvent['type'],
    position: Position,
    target: HTMLElement,
    nativeEvent: Event
  ): void {
    if (this.handler) {
      const sensorEvent: SensorEvent = {
        type,
        position,
        target,
        nativeEvent,
        timestamp: Date.now()
      };
      this.handler(sensorEvent);
    }
  }

  // 设置活动状态
  protected setActive(active: boolean): void {
    this.active = active;
  }

  // 取消拖拽
  protected cancelDrag(): void {
    if (this.active && this.element) {
      this.emitSensorEvent('cancel', { x: 0, y: 0 }, this.element, new CustomEvent('cancel'));
      this.setActive(false);
    }
  }

  // 检查激活约束
  protected checkActivationConstraint(startPosition: Position, currentPosition: Position, startTime: number): boolean {
    const { activationConstraint } = this.options;
    if (!activationConstraint) return true;

    // 检查延迟约束
    if (activationConstraint.delay) {
      const elapsed = Date.now() - startTime;
      if (elapsed < activationConstraint.delay) {
        return false;
      }
    }

    // 检查距离约束
    if (activationConstraint.distance) {
      const distance = Math.sqrt(
        Math.pow(currentPosition.x - startPosition.x, 2) +
        Math.pow(currentPosition.y - startPosition.y, 2)
      );
      if (distance < activationConstraint.distance) {
        return false;
      }
    }

    return true;
  }

  // 检查容差约束
  protected isWithinTolerance(startPosition: Position, currentPosition: Position): boolean {
    const { activationConstraint } = this.options;
    if (!activationConstraint?.tolerance) return false;

    const distance = Math.sqrt(
      Math.pow(currentPosition.x - startPosition.x, 2) +
      Math.pow(currentPosition.y - startPosition.y, 2)
    );

    return distance <= activationConstraint.tolerance;
  }
}