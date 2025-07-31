import { 
  DragEngineOptions, 
  DragEngineState, 
  DragNode, 
  DropTarget, 
  Position,
  DragEvent,
  DragEventListener,
  SensorEvent,
  SensorEventHandler
} from './types';
import { EventEmitter } from './eventSystem';
import { RectIntersectionCollision } from './collisionDetection';
import { SensorManager, createMouseSensor, createSensorManager } from '@dragforge/sensors';
import { DragOverlay } from './dragOverlay';

// 新的引擎状态接口
interface DragState {
  isDragging: boolean;
  draggedNode: DragNode | null;
  position: Position;
  initialPosition: Position;
  delta: Position;
  activeDropTarget: DropTarget | null;
  startTime: number;
}

export class DragEngine {
  private state: {
    dragNodes: Map<string, DragNode>;
    dropTargets: Map<string, DropTarget>;
    isEnabled: boolean;
    dragState: DragState;
  };
  
  private options: DragEngineOptions;
  private eventEmitter: EventEmitter;
  private sensorManager: SensorManager;
  private dragOverlay: DragOverlay;
  private rafId: number | null = null;
  private pendingUpdate: (() => void) | null = null;

  constructor(options: DragEngineOptions = {}) {
    this.options = {
      collisionDetection: new RectIntersectionCollision(),
      ...options,
    };

    this.eventEmitter = new EventEmitter();
    this.sensorManager = createSensorManager({
      autoActivate: true,
      exclusiveMode: true
    });
    this.dragOverlay = new DragOverlay({
      className: 'dragforge-overlay',
      zIndex: 9999,
      transitionDuration: 200
    });

    this.state = {
      dragNodes: new Map(),
      dropTargets: new Map(),
      isEnabled: true,
      dragState: {
        isDragging: false,
        draggedNode: null,
        position: { x: 0, y: 0 },
        initialPosition: { x: 0, y: 0 },
        delta: { x: 0, y: 0 },
        activeDropTarget: null,
        startTime: 0
      },
    };

    this.setupSensors();
    this.bindSensorEvents();
  }

  // 传感器系统设置
  private setupSensors(): void {
    // 注册默认的MouseSensor
    const mouseSensor = createMouseSensor({
      activationConstraint: {
        distance: 5,
        tolerance: 2
      }
    });

    this.sensorManager.register(mouseSensor);
  }

  private bindSensorEvents(): void {
    // 这里我们还没有附加到具体元素，将在registerDragNode时附加
  }

  // 传感器事件处理器
  private createSensorEventHandler(): SensorEventHandler {
    return (event: SensorEvent) => {
      switch (event.type) {
        case 'start':
          this.handleDragStart(event);
          break;
        case 'move':
          this.handleDragMove(event);
          break;
        case 'end':
          this.handleDragEnd(event);
          break;
        case 'cancel':
          this.handleDragCancel(event);
          break;
      }
    };
  }

  // 拖拽事件处理
  private handleDragStart(sensorEvent: SensorEvent): void {
    if (!this.state.isEnabled || this.state.dragState.isDragging) return;

    // 找到对应的拖拽节点
    const dragNode = this.findDragNodeByElement(sensorEvent.target);
    if (!dragNode || dragNode.disabled) return;

    // 更新拖拽状态
    this.state.dragState = {
      isDragging: true,
      draggedNode: dragNode,
      position: sensorEvent.position,
      initialPosition: sensorEvent.position,
      delta: { x: 0, y: 0 },
      activeDropTarget: null,
      startTime: sensorEvent.timestamp
    };

    // 创建拖拽预览层
    if (dragNode.element) {
      // 获取元素的边界框
      const rect = dragNode.element.getBoundingClientRect();
      const overlayPosition = {
        x: rect.left,
        y: rect.top
      };
      
      this.dragOverlay.create(dragNode.element, overlayPosition);
      
      // 添加原始元素的拖拽中样式
      dragNode.element.classList.add('dragforge-dragging-source');
      dragNode.element.style.opacity = '0.5';
    }

    // 发送拖拽开始事件
    const dragEvent: DragEvent = {
      type: 'dragstart',
      node: dragNode,
      position: sensorEvent.position,
      delta: { x: 0, y: 0 },
      timestamp: sensorEvent.timestamp
    };

    this.eventEmitter.emit('dragstart', dragEvent);
  }

  private handleDragMove(sensorEvent: SensorEvent): void {
    if (!this.state.dragState.isDragging || !this.state.dragState.draggedNode) return;

    // 计算delta
    const delta = {
      x: sensorEvent.position.x - this.state.dragState.initialPosition.x,
      y: sensorEvent.position.y - this.state.dragState.initialPosition.y
    };

    // 更新状态
    this.state.dragState.position = sensorEvent.position;
    this.state.dragState.delta = delta;

    // 更新预览层位置
    if (this.state.dragState.draggedNode.element) {
      const rect = this.state.dragState.draggedNode.element.getBoundingClientRect();
      const overlayPosition = {
        x: rect.left + delta.x,
        y: rect.top + delta.y
      };
      
      this.scheduleUpdate(() => {
        this.dragOverlay.updatePosition(overlayPosition);
      });
    }

    // 碰撞检测
    const dropTarget = this.detectCollision(sensorEvent.position);
    const previousTarget = this.state.dragState.activeDropTarget;

    // 处理目标变化
    if (dropTarget !== previousTarget) {
      // 离开之前的目标
      if (previousTarget) {
        // 移除视觉反馈
        previousTarget.element?.classList.remove('dragforge-drop-active');
        
        const leaveEvent: DragEvent = {
          type: 'dragleave',
          node: this.state.dragState.draggedNode,
          position: sensorEvent.position,
          target: previousTarget,
          delta,
          timestamp: sensorEvent.timestamp
        };
        this.eventEmitter.emit('dragleave', leaveEvent);
      }

      // 进入新目标
      if (dropTarget) {
        // 添加视觉反馈
        dropTarget.element?.classList.add('dragforge-drop-active');
        
        const enterEvent: DragEvent = {
          type: 'dragenter',
          node: this.state.dragState.draggedNode,
          position: sensorEvent.position,
          target: dropTarget,
          delta,
          timestamp: sensorEvent.timestamp
        };
        this.eventEmitter.emit('dragenter', enterEvent);
      }

      this.state.dragState.activeDropTarget = dropTarget;
    }

    // 发送移动事件
    const moveEvent: DragEvent = {
      type: 'dragmove',
      node: this.state.dragState.draggedNode,
      position: sensorEvent.position,
      target: dropTarget || undefined,
      delta,
      timestamp: sensorEvent.timestamp
    };

    this.scheduleUpdate(() => {
      this.eventEmitter.emit('dragmove', moveEvent);
    });
  }

  private async handleDragEnd(sensorEvent: SensorEvent): Promise<void> {
    if (!this.state.dragState.isDragging || !this.state.dragState.draggedNode) return;

    const { draggedNode, activeDropTarget, delta } = this.state.dragState;

    // 执行放置动画
    if (activeDropTarget && activeDropTarget.element) {
      const targetRect = activeDropTarget.element.getBoundingClientRect();
      const targetCenter = {
        x: targetRect.left + targetRect.width / 2,
        y: targetRect.top + targetRect.height / 2
      };

      // 动画到目标位置
      await this.dragOverlay.animateTo(targetCenter);
    } else if (draggedNode.element) {
      // 如果没有有效的放置目标，动画回到原始位置
      const originalRect = draggedNode.element.getBoundingClientRect();
      const originalPosition = {
        x: originalRect.left,
        y: originalRect.top
      };
      
      await this.dragOverlay.animateTo(originalPosition);
    }

    // 如果有活跃的放置目标，触发drop事件
    if (activeDropTarget) {
      const dropEvent: DragEvent = {
        type: 'drop',
        node: draggedNode,
        position: sensorEvent.position,
        target: activeDropTarget,
        delta,
        timestamp: sensorEvent.timestamp
      };
      this.eventEmitter.emit('drop', dropEvent);
    }

    // 发送拖拽结束事件
    const endEvent: DragEvent = {
      type: 'dragend',
      node: draggedNode,
      position: sensorEvent.position,
      target: activeDropTarget || undefined,
      delta,
      timestamp: sensorEvent.timestamp
    };

    this.eventEmitter.emit('dragend', endEvent);

    // 清理拖拽状态
    this.cleanupDrag();
    
    // 重置状态
    this.resetDragState();
  }

  private async handleDragCancel(sensorEvent: SensorEvent): Promise<void> {
    if (!this.state.dragState.isDragging || !this.state.dragState.draggedNode) return;

    const { draggedNode, delta } = this.state.dragState;

    // 动画回到原始位置
    if (draggedNode.element) {
      const originalRect = draggedNode.element.getBoundingClientRect();
      const originalPosition = {
        x: originalRect.left,
        y: originalRect.top
      };
      
      await this.dragOverlay.animateTo(originalPosition);
    }

    // 发送取消事件
    const cancelEvent: DragEvent = {
      type: 'dragcancel',
      node: draggedNode,
      position: sensorEvent.position,
      delta,
      timestamp: sensorEvent.timestamp
    };

    this.eventEmitter.emit('dragcancel', cancelEvent);

    // 清理拖拽状态
    this.cleanupDrag();
    
    // 重置状态
    this.resetDragState();
  }

  private cleanupDrag(): void {
    // 清理预览层
    this.dragOverlay.destroy();

    // 恢复原始元素样式
    if (this.state.dragState.draggedNode?.element) {
      this.state.dragState.draggedNode.element.classList.remove('dragforge-dragging-source');
      this.state.dragState.draggedNode.element.style.opacity = '';
    }

    // 恢复放置目标样式
    if (this.state.dragState.activeDropTarget?.element) {
      this.state.dragState.activeDropTarget.element.classList.remove('dragforge-drop-active');
    }
  }

  // 工具方法
  private findDragNodeByElement(element: HTMLElement): DragNode | null {
    for (const node of this.state.dragNodes.values()) {
      if (node.element === element || node.element?.contains(element)) {
        return node;
      }
    }
    return null;
  }

  private detectCollision(position: Position): DropTarget | null {
    if (!this.options.collisionDetection || !this.state.dragState.draggedNode) {
      return null;
    }

    const dropTargets = Array.from(this.state.dropTargets.values());
    return this.options.collisionDetection.detectCollision(
      this.state.dragState.draggedNode,
      position,
      dropTargets
    );
  }

  private resetDragState(): void {
    this.state.dragState = {
      isDragging: false,
      draggedNode: null,
      position: { x: 0, y: 0 },
      initialPosition: { x: 0, y: 0 },
      delta: { x: 0, y: 0 },
      activeDropTarget: null,
      startTime: 0
    };
  }

  private scheduleUpdate(callback: () => void): void {
    if (this.pendingUpdate) {
      this.pendingUpdate = callback;
      return;
    }

    this.pendingUpdate = callback;
    this.rafId = requestAnimationFrame(() => {
      if (this.pendingUpdate) {
        this.pendingUpdate();
        this.pendingUpdate = null;
      }
      this.rafId = null;
    });
  }

  // 公共API
  registerDragNode(node: DragNode): () => void {
    this.state.dragNodes.set(node.id, node);

    // 如果有元素，将其附加到传感器管理器
    if (node.element) {
      this.sensorManager.attach(node.element, this.createSensorEventHandler());
    }

    return () => this.unregisterDragNode(node.id);
  }

  unregisterDragNode(id: string): void {
    const node = this.state.dragNodes.get(id);
    if (node) {
      // 如果正在拖拽该节点，取消拖拽
      if (this.state.dragState.isDragging && this.state.dragState.draggedNode?.id === id) {
        this.handleDragCancel({
          type: 'cancel',
          position: this.state.dragState.position,
          target: node.element!,
          nativeEvent: new CustomEvent('cancel'),
          timestamp: Date.now()
        });
      }

      this.state.dragNodes.delete(id);
    }
  }

  registerDropTarget(target: DropTarget): () => void {
    this.state.dropTargets.set(target.id, target);
    return () => this.unregisterDropTarget(target.id);
  }

  unregisterDropTarget(id: string): void {
    this.state.dropTargets.delete(id);
  }

  // 传感器管理
  registerSensor(sensor: any): () => void {
    return this.sensorManager.register(sensor);
  }

  unregisterSensor(name: string): boolean {
    return this.sensorManager.unregister(name);
  }

  // 引擎控制
  enable(): void {
    this.state.isEnabled = true;
  }

  disable(): void {
    this.state.isEnabled = false;
    if (this.state.dragState.isDragging) {
      this.handleDragCancel({
        type: 'cancel',
        position: this.state.dragState.position,
        target: this.state.dragState.draggedNode?.element!,
        nativeEvent: new CustomEvent('disable'),
        timestamp: Date.now()
      });
    }
  }

  // 状态查询
  getDragState() {
    return { ...this.state.dragState };
  }

  isEnabled(): boolean {
    return this.state.isEnabled;
  }

  // 事件系统
  on(eventType: string, listener: DragEventListener): () => void {
    return this.eventEmitter.on(eventType, listener);
  }

  off(eventType: string, listener: DragEventListener): void {
    this.eventEmitter.off(eventType, listener);
  }

  // 清理
  destroy(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // 如果正在拖拽，先取消
    if (this.state.dragState.isDragging) {
      this.cleanupDrag();
    }

    this.dragOverlay.destroy();
    this.sensorManager.destroy();
    this.eventEmitter.removeAllListeners();
    this.state.dragNodes.clear();
    this.state.dropTargets.clear();
    this.resetDragState();
  }

  // Legacy API compatibility
  startDrag(nodeId: string, position: Position): void {
    const node = this.state.dragNodes.get(nodeId);
    if (!node) return;

    // 模拟传感器事件
    const syntheticEvent: SensorEvent = {
      type: 'start',
      position,
      target: node.element!,
      nativeEvent: new CustomEvent('synthetic'),
      timestamp: Date.now()
    };

    this.handleDragStart(syntheticEvent);
  }
}

export function createDragEngine(options?: DragEngineOptions): DragEngine {
  return new DragEngine(options);
}