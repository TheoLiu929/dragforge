// 基础类型定义 - 避免循环依赖
export interface Position {
  x: number;
  y: number;
}

// 传感器配置选项
export interface SensorOptions {
  activationConstraint?: {
    delay?: number;
    tolerance?: number;
    distance?: number;
  };
  disabled?: boolean;
}

// 传感器事件
export interface SensorEvent {
  type: 'start' | 'move' | 'end' | 'cancel';
  position: Position;
  target: HTMLElement;
  nativeEvent: Event;
  timestamp: number;
}

export type SensorEventHandler = (event: SensorEvent) => void;

// 传感器接口
export interface Sensor {
  readonly name: string;
  readonly priority: number;
  readonly options: SensorOptions;
  
  // 生命周期
  attach(element: HTMLElement, handler: SensorEventHandler): void;
  detach(): void;
  
  // 状态控制
  enable(): void;
  disable(): void;
  
  // 状态查询
  isEnabled(): boolean;
  isActive(): boolean;
  
  // 传感器特定方法
  canHandle(event: Event): boolean;
  
  // 清理资源
  destroy(): void;
}

// 传感器管理器选项
export interface SensorManagerOptions {
  autoActivate?: boolean;
  exclusiveMode?: boolean;
}