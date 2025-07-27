import { 
  DragEngineOptions, 
  DragEngineState, 
  DragNode, 
  DropTarget, 
  Position,
  DragEvent,
  Sensor,
  DragEventListener
} from './types';
import { EventEmitter } from './eventSystem';
import { RectIntersectionCollision } from './collisionDetection';
import { MouseSensor } from './sensors';

export class DragEngine {
  private state: DragEngineState;
  private options: DragEngineOptions;
  private eventEmitter: EventEmitter;
  private rafId: number | null = null;
  private pendingUpdate: (() => void) | null = null;

  constructor(options: DragEngineOptions = {}) {
    this.options = {
      collisionDetection: new RectIntersectionCollision(),
      sensors: [new MouseSensor()],
      ...options,
    };

    this.eventEmitter = new EventEmitter();

    this.state = {
      dragNodes: new Map(),
      dropTargets: new Map(),
      sensors: new Map(),
      isEnabled: true,
      dragState: {
        isDragging: false,
        draggedNode: null,
        position: { x: 0, y: 0 },
        initialPosition: { x: 0, y: 0 },
        delta: { x: 0, y: 0 },
        activeDropTarget: null,
      },
    };

    this.setupSensors();
  }

  // 传感器管理
  private setupSensors(): void {
    if (!this.options.sensors) return;

    for (const sensor of this.options.sensors) {
      this.state.sensors.set(sensor.name, sensor);
    }
  }

  registerSensor(sensor: Sensor): void {
    this.state.sensors.set(sensor.name, sensor);
  }

  unregisterSensor(name: string): void {
    const sensor = this.state.sensors.get(name);
    if (sensor) {
      sensor.teardown();
      this.state.sensors.delete(name);
    }
  }

  // 拖拽节点管理
  registerDragNode(node: DragNode): () => void {
    this.state.dragNodes.set(node.id, node);

    return () => {
      this.unregisterDragNode(node.id);
    };
  }

  unregisterDragNode(id: string): void {
    this.state.dragNodes.delete(id);
  }

  // 放置目标管理
  registerDropTarget(target: DropTarget): () => void {
    this.state.dropTargets.set(target.id, target);

    return () => {
      this.unregisterDropTarget(target.id);
    };
  }

  unregisterDropTarget(id: string): void {
    this.state.dropTargets.delete(id);
  }

  // 拖拽操作
  startDrag(nodeId: string, position: Position): void {
    if (!this.state.isEnabled) return;

    const node = this.state.dragNodes.get(nodeId);
    if (!node || node.disabled) return;

    this.state.dragState = {
      isDragging: true,
      draggedNode: node,
      position: { ...position },
      initialPosition: { ...position },
      delta: { x: 0, y: 0 },
      activeDropTarget: null,
    };

    this.emitEvent({
      type: 'dragstart',
      node,
      position,
      timestamp: Date.now(),
    });
  }

  updateDragPosition(position: Position): void {
    if (!this.state.dragState.isDragging || !this.state.dragState.draggedNode) return;

    // 使用 RAF 节流优化性能
    if (this.pendingUpdate) return;

    this.pendingUpdate = () => {
      const { draggedNode, initialPosition } = this.state.dragState;
      
      // 应用约束
      let constrainedPosition = { ...position };
      if (draggedNode!.constraints) {
        for (const constraint of draggedNode!.constraints) {
          constrainedPosition = constraint.apply(constrainedPosition, draggedNode!);
        }
      }

      // 更新状态
      this.state.dragState.position = constrainedPosition;
      this.state.dragState.delta = {
        x: constrainedPosition.x - initialPosition.x,
        y: constrainedPosition.y - initialPosition.y,
      };

      // 碰撞检测
      const newDropTarget = this.detectCollision(draggedNode!, constrainedPosition);
      const previousDropTarget = this.state.dragState.activeDropTarget;

      if (newDropTarget !== previousDropTarget) {
        // 离开之前的目标
        if (previousDropTarget) {
          this.emitEvent({
            type: 'dragleave',
            node: draggedNode!,
            position: constrainedPosition,
            target: previousDropTarget,
            timestamp: Date.now(),
          });
        }

        // 进入新目标
        if (newDropTarget) {
          this.emitEvent({
            type: 'dragenter',
            node: draggedNode!,
            position: constrainedPosition,
            target: newDropTarget,
            timestamp: Date.now(),
          });
        }

        this.state.dragState.activeDropTarget = newDropTarget;
      }

      // 发送拖拽移动事件
      this.emitEvent({
        type: 'dragmove',
        node: draggedNode!,
        position: constrainedPosition,
        target: newDropTarget,
        delta: this.state.dragState.delta,
        timestamp: Date.now(),
      });

      this.pendingUpdate = null;
    };

    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => {
        if (this.pendingUpdate) {
          this.pendingUpdate();
        }
        this.rafId = null;
      });
    }
  }

  endDrag(): void {
    if (!this.state.dragState.isDragging || !this.state.dragState.draggedNode) return;

    const { draggedNode, position, activeDropTarget } = this.state.dragState;

    // 发送drop事件
    if (activeDropTarget) {
      this.emitEvent({
        type: 'drop',
        node: draggedNode,
        position,
        target: activeDropTarget,
        timestamp: Date.now(),
      });
    }

    // 发送dragend事件
    this.emitEvent({
      type: 'dragend',
      node: draggedNode,
      position,
      target: activeDropTarget,
      timestamp: Date.now(),
    });

    this.resetDragState();
  }

  cancelDrag(): void {
    if (!this.state.dragState.isDragging || !this.state.dragState.draggedNode) return;

    const { draggedNode, position } = this.state.dragState;

    this.emitEvent({
      type: 'dragcancel',
      node: draggedNode,
      position,
      timestamp: Date.now(),
    });

    this.resetDragState();
  }

  // 碰撞检测
  private detectCollision(dragNode: DragNode, position: Position): DropTarget | null {
    if (!this.options.collisionDetection) return null;

    const enabledDropTargets = Array.from(this.state.dropTargets.values())
      .filter(target => !target.disabled);

    return this.options.collisionDetection.detectCollision(dragNode, position, enabledDropTargets);
  }

  // 事件系统
  on(eventType: string, listener: DragEventListener): () => void {
    return this.eventEmitter.on(eventType, listener);
  }

  off(eventType: string, listener: DragEventListener): void {
    this.eventEmitter.off(eventType, listener);
  }

  private emitEvent(event: DragEvent): void {
    this.eventEmitter.emit(event);
  }

  // 生命周期管理
  enable(): void {
    this.state.isEnabled = true;
    for (const sensor of this.state.sensors.values()) {
      sensor.enable();
    }
  }

  disable(): void {
    this.state.isEnabled = false;
    this.cancelDrag();
    for (const sensor of this.state.sensors.values()) {
      sensor.disable();
    }
  }

  destroy(): void {
    this.disable();
    
    // 清理所有传感器
    for (const sensor of this.state.sensors.values()) {
      sensor.teardown();
    }
    
    // 清理RAF
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // 清理事件监听器
    this.eventEmitter.removeAllListeners();
    
    // 清理状态
    this.state.dragNodes.clear();
    this.state.dropTargets.clear();
    this.state.sensors.clear();
  }

  private resetDragState(): void {
    this.state.dragState = {
      isDragging: false,
      draggedNode: null,
      position: { x: 0, y: 0 },
      initialPosition: { x: 0, y: 0 },
      delta: { x: 0, y: 0 },
      activeDropTarget: null,
    };

    // 清理待处理更新
    this.pendingUpdate = null;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  // 获取状态
  getState(): DragEngineState {
    return { ...this.state };
  }

  getDragState() {
    return { ...this.state.dragState };
  }

  isDragging(): boolean {
    return this.state.dragState.isDragging;
  }
}