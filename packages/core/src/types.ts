// Re-export Position from sensors to maintain backward compatibility
export type { Position, Sensor } from '@dragforge/sensors';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// 核心接口定义
export interface DragNode {
  id: string;
  element?: HTMLElement;
  data?: any;
  disabled?: boolean;
  constraints?: DragConstraint[];
}

export interface DropTarget {
  id: string;
  element?: HTMLElement;
  data?: any;
  disabled?: boolean;
  rect?: Rect;
}

// 事件系统
export interface DragEvent {
  type: 'dragstart' | 'dragmove' | 'dragend' | 'dragcancel' | 'dragover' | 'dragenter' | 'dragleave' | 'drop';
  node: DragNode;
  position: Position;
  target?: DropTarget;
  delta?: Position;
  timestamp: number;
}

export type DragEventListener = (event: DragEvent) => void;

// Re-export sensor types from @dragforge/sensors for convenience
export type { 
  SensorOptions,
  SensorEvent,
  SensorEventHandler,
  SensorManagerOptions
} from '@dragforge/sensors';

// 碰撞检测策略
export interface CollisionDetection {
  detectCollision(dragNode: DragNode, position: Position, dropTargets: DropTarget[]): DropTarget | null;
}

// 拖拽约束
export interface DragConstraint {
  apply(position: Position, node: DragNode): Position;
}

// 引擎状态
export interface DragState {
  isDragging: boolean;
  draggedNode: DragNode | null;
  position: Position;
  initialPosition: Position;
  delta: Position;
  activeDropTarget: DropTarget | null;
}

export interface DragEngineState {
  dragNodes: Map<string, DragNode>;
  dropTargets: Map<string, DropTarget>;
  sensors: Map<string, Sensor>;
  dragState: DragState;
  isEnabled: boolean;
}

// 引擎选项
export interface DragEngineOptions {
  collisionDetection?: CollisionDetection;
  autoScroll?: boolean;
  measuring?: {
    droppable?: {
      strategy?: 'WhenDragging' | 'Always';
    };
  };
}

