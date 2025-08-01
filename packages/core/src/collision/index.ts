export * from './types';
export * from './algorithms';
export * from './QuadTree';
export * from './strategies';
export * from './PlaceholderManager';
export * from './CollisionDetector';

// 导出便捷的工厂函数
import { CollisionDetector, CollisionDetectorOptions } from './CollisionDetector';

export function createCollisionDetector(options?: CollisionDetectorOptions): CollisionDetector {
  return new CollisionDetector(options);
}