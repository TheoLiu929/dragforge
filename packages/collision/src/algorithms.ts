import { Position } from '@dragforge/core';
import { BoundingBox, CollisionResult } from './types';

export function getBoundingBox(element: HTMLElement): BoundingBox {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    bottom: rect.bottom,
    right: rect.right,
    width: rect.width,
    height: rect.height,
  };
}

export function isIntersecting(a: BoundingBox, b: BoundingBox): boolean {
  return (
    a.left < b.right &&
    a.right > b.left &&
    a.top < b.bottom &&
    a.bottom > b.top
  );
}

export function getIntersectionArea(a: BoundingBox, b: BoundingBox): number {
  if (!isIntersecting(a, b)) return 0;

  const xOverlap = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const yOverlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);

  return xOverlap * yOverlap;
}

export function getDistance(a: BoundingBox, b: BoundingBox): number {
  const aCenterX = a.left + a.width / 2;
  const aCenterY = a.top + a.height / 2;
  const bCenterX = b.left + b.width / 2;
  const bCenterY = b.top + b.height / 2;

  return Math.sqrt(
    Math.pow(aCenterX - bCenterX, 2) + Math.pow(aCenterY - bCenterY, 2)
  );
}

export function pointInBoundingBox(point: Position, box: BoundingBox): boolean {
  return (
    point.x >= box.left &&
    point.x <= box.right &&
    point.y >= box.top &&
    point.y <= box.bottom
  );
}

export function closestCorners(box: BoundingBox, point: Position): Position[] {
  const corners = [
    { x: box.left, y: box.top },
    { x: box.right, y: box.top },
    { x: box.right, y: box.bottom },
    { x: box.left, y: box.bottom },
  ];

  return corners.sort((a, b) => {
    const distA = Math.sqrt(Math.pow(a.x - point.x, 2) + Math.pow(a.y - point.y, 2));
    const distB = Math.sqrt(Math.pow(b.x - point.x, 2) + Math.pow(b.y - point.y, 2));
    return distA - distB;
  });
}