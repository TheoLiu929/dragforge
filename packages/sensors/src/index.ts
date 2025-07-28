export * from './types';
export { BaseSensor } from './baseSensor';
export { MouseSensor, type MouseSensorOptions } from './mouseSensor';
export { SensorManager } from './sensorManager';

// 便捷工厂函数
import { MouseSensor, MouseSensorOptions } from './mouseSensor';
import { SensorManager } from './sensorManager';
import { SensorManagerOptions } from './types';

export function createMouseSensor(options?: MouseSensorOptions) {
  return new MouseSensor(options);
}

export function createSensorManager(options?: SensorManagerOptions) {
  return new SensorManager(options);
}

// 占位符 - 未来版本实现
// export * from './touchSensor';
// export * from './keyboardSensor';
// export * from './pointerSensor';