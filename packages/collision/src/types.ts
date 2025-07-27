import { Position } from '@dragforge/core';

export interface BoundingBox {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
}

export interface CollisionDetector {
  name: string;
  detect(draggable: BoundingBox, droppables: BoundingBox[]): CollisionResult[];
}

export interface CollisionResult {
  index: number;
  overlap: number;
  distance: number;
}

export interface CollisionOptions {
  strategy?: 'pointer' | 'center' | 'closest';
  threshold?: number;
}