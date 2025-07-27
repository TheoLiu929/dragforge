import { CollisionDetection, DragNode, DropTarget, Position } from './types';

export class RectIntersectionCollision implements CollisionDetection {
  detectCollision(dragNode: DragNode, position: Position, dropTargets: DropTarget[]): DropTarget | null {
    for (const target of dropTargets) {
      if (target.disabled || !target.element) continue;
      
      const rect = target.element.getBoundingClientRect();
      if (position.x >= rect.left && position.x <= rect.right &&
          position.y >= rect.top && position.y <= rect.bottom) {
        return target;
      }
    }
    return null;
  }
}