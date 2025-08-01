import { Position, Rect } from '../types';

/**
 * 矩形相交检测
 * 返回相交面积比例 (0-1)，如果不相交返回 null
 */
export function rectIntersection(dragRect: Rect, targetRect: Rect): number | null {
  const left = Math.max(dragRect.x, targetRect.x);
  const right = Math.min(dragRect.x + dragRect.width, targetRect.x + targetRect.width);
  const top = Math.max(dragRect.y, targetRect.y);
  const bottom = Math.min(dragRect.y + dragRect.height, targetRect.y + targetRect.height);

  if (left < right && top < bottom) {
    const intersectionArea = (right - left) * (bottom - top);
    const dragArea = dragRect.width * dragRect.height;
    const targetArea = targetRect.width * targetRect.height;
    const minArea = Math.min(dragArea, targetArea);
    
    return minArea > 0 ? intersectionArea / minArea : 0;
  }

  return null;
}

/**
 * 最近中心点算法
 * 返回两个矩形中心点之间的距离
 */
export function closestCenter(dragRect: Rect, targetRect: Rect): number {
  const dragCenter = getRectCenter(dragRect);
  const targetCenter = getRectCenter(targetRect);
  
  return getDistance(dragCenter, targetCenter);
}

/**
 * 最近角点算法
 * 返回拖拽元素的角点到目标元素最近角点的距离
 */
export function closestCorners(dragRect: Rect, targetRect: Rect): number {
  const dragCorners = getRectCorners(dragRect);
  const targetCorners = getRectCorners(targetRect);
  
  let minDistance = Infinity;
  
  for (const dragCorner of dragCorners) {
    for (const targetCorner of targetCorners) {
      const distance = getDistance(dragCorner, targetCorner);
      minDistance = Math.min(minDistance, distance);
    }
  }
  
  return minDistance;
}

/**
 * 指针位置检测
 * 检测指针是否在目标矩形内
 */
export function pointerWithin(position: Position, targetRect: Rect): boolean {
  return (
    position.x >= targetRect.x &&
    position.x <= targetRect.x + targetRect.width &&
    position.y >= targetRect.y &&
    position.y <= targetRect.y + targetRect.height
  );
}

/**
 * 指针到矩形的距离
 * 如果指针在矩形内返回 0
 */
export function pointerDistance(position: Position, targetRect: Rect): number {
  if (pointerWithin(position, targetRect)) {
    return 0;
  }

  // 计算到矩形边缘的最短距离
  const dx = Math.max(targetRect.x - position.x, 0, position.x - (targetRect.x + targetRect.width));
  const dy = Math.max(targetRect.y - position.y, 0, position.y - (targetRect.y + targetRect.height));
  
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 获取矩形与指定方向最近的边缘点
 */
export function getClosestEdgePoint(rect: Rect, position: Position): Position {
  const center = getRectCenter(rect);
  const dx = position.x - center.x;
  const dy = position.y - center.y;
  
  // 计算角度确定最近的边
  const angle = Math.atan2(dy, dx);
  const halfWidth = rect.width / 2;
  const halfHeight = rect.height / 2;
  
  // 根据角度确定交点
  let x: number, y: number;
  
  if (Math.abs(Math.cos(angle)) * halfHeight > Math.abs(Math.sin(angle)) * halfWidth) {
    // 左右边
    x = dx > 0 ? rect.x + rect.width : rect.x;
    y = center.y + Math.tan(angle) * (x - center.x);
  } else {
    // 上下边
    y = dy > 0 ? rect.y + rect.height : rect.y;
    x = center.x + (y - center.y) / Math.tan(angle);
  }
  
  return { x, y };
}

/**
 * 计算矩形的重叠区域
 */
export function getIntersectionRect(rect1: Rect, rect2: Rect): Rect | null {
  const left = Math.max(rect1.x, rect2.x);
  const right = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
  const top = Math.max(rect1.y, rect2.y);
  const bottom = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);

  if (left < right && top < bottom) {
    return {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top
    };
  }

  return null;
}

/**
 * 网格对齐
 */
export function snapToGrid(position: Position, gridSize: number, offset: Position = { x: 0, y: 0 }): Position {
  return {
    x: Math.round((position.x - offset.x) / gridSize) * gridSize + offset.x,
    y: Math.round((position.y - offset.y) / gridSize) * gridSize + offset.y
  };
}

/**
 * 获取矩形中心点
 */
export function getRectCenter(rect: Rect): Position {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2
  };
}

/**
 * 获取矩形四个角点
 */
export function getRectCorners(rect: Rect): Position[] {
  return [
    { x: rect.x, y: rect.y }, // 左上
    { x: rect.x + rect.width, y: rect.y }, // 右上
    { x: rect.x, y: rect.y + rect.height }, // 左下
    { x: rect.x + rect.width, y: rect.y + rect.height } // 右下
  ];
}

/**
 * 计算两点之间的距离
 */
export function getDistance(p1: Position, p2: Position): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 检查矩形是否在视口内
 */
export function isRectInViewport(rect: Rect, viewport: Rect): boolean {
  return !(
    rect.x > viewport.x + viewport.width ||
    rect.x + rect.width < viewport.x ||
    rect.y > viewport.y + viewport.height ||
    rect.y + rect.height < viewport.y
  );
}

/**
 * 获取元素的边界矩形
 */
export function getElementRect(element: HTMLElement): Rect {
  const bounds = element.getBoundingClientRect();
  return {
    x: bounds.left + window.scrollX,
    y: bounds.top + window.scrollY,
    width: bounds.width,
    height: bounds.height
  };
}