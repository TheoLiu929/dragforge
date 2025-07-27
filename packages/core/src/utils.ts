import { Position } from './types';

export function calculateDistance(a: Position, b: Position): number {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

export function isWithinBounds(position: Position, bounds: DOMRect): boolean {
  return (
    position.x >= bounds.left &&
    position.x <= bounds.right &&
    position.y >= bounds.top &&
    position.y <= bounds.bottom
  );
}

export function clampPosition(position: Position, bounds: DOMRect): Position {
  return {
    x: Math.max(bounds.left, Math.min(bounds.right, position.x)),
    y: Math.max(bounds.top, Math.min(bounds.bottom, position.y)),
  };
}

export function getElementCenter(element: HTMLElement): Position {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

export function createTransform(position: Position, offset: Position = { x: 0, y: 0 }): string {
  return `translate3d(${position.x + offset.x}px, ${position.y + offset.y}px, 0)`;
}