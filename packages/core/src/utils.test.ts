import { describe, it, expect } from 'vitest';
import {
  calculateDistance,
  isWithinBounds,
  clampPosition,
  getElementCenter,
  createTransform,
} from './utils';
import { Position } from './types';

describe('utils', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      const a: Position = { x: 0, y: 0 };
      const b: Position = { x: 3, y: 4 };
      expect(calculateDistance(a, b)).toBe(5);
    });

    it('should return 0 for same points', () => {
      const a: Position = { x: 10, y: 20 };
      const b: Position = { x: 10, y: 20 };
      expect(calculateDistance(a, b)).toBe(0);
    });
  });

  describe('isWithinBounds', () => {
    it('should return true when position is within bounds', () => {
      const position: Position = { x: 50, y: 50 };
      const bounds: DOMRect = {
        left: 0,
        top: 0,
        right: 100,
        bottom: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 0,
        toJSON: () => ({})
      };
      expect(isWithinBounds(position, bounds)).toBe(true);
    });

    it('should return false when position is outside bounds', () => {
      const position: Position = { x: 150, y: 150 };
      const bounds: DOMRect = {
        left: 0,
        top: 0,
        right: 100,
        bottom: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 0,
        toJSON: () => ({})
      };
      expect(isWithinBounds(position, bounds)).toBe(false);
    });

    it('should return true when position is on bounds edge', () => {
      const position: Position = { x: 100, y: 100 };
      const bounds: DOMRect = {
        left: 0,
        top: 0,
        right: 100,
        bottom: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 0,
        toJSON: () => ({})
      };
      expect(isWithinBounds(position, bounds)).toBe(true);
    });
  });

  describe('clampPosition', () => {
    const bounds: DOMRect = {
      left: 10,
      top: 20,
      right: 110,
      bottom: 120,
      width: 100,
      height: 100,
      x: 10,
      y: 20,
      toJSON: () => ({})
    };

    it('should not change position when within bounds', () => {
      const position: Position = { x: 50, y: 60 };
      expect(clampPosition(position, bounds)).toEqual(position);
    });

    it('should clamp position to left bound', () => {
      const position: Position = { x: 5, y: 60 };
      expect(clampPosition(position, bounds)).toEqual({ x: 10, y: 60 });
    });

    it('should clamp position to right bound', () => {
      const position: Position = { x: 120, y: 60 };
      expect(clampPosition(position, bounds)).toEqual({ x: 110, y: 60 });
    });

    it('should clamp position to top bound', () => {
      const position: Position = { x: 50, y: 10 };
      expect(clampPosition(position, bounds)).toEqual({ x: 50, y: 20 });
    });

    it('should clamp position to bottom bound', () => {
      const position: Position = { x: 50, y: 130 };
      expect(clampPosition(position, bounds)).toEqual({ x: 50, y: 120 });
    });

    it('should clamp position to multiple bounds', () => {
      const position: Position = { x: 5, y: 130 };
      expect(clampPosition(position, bounds)).toEqual({ x: 10, y: 120 });
    });
  });

  describe('createTransform', () => {
    it('should create transform string without offset', () => {
      const position: Position = { x: 100, y: 200 };
      expect(createTransform(position)).toBe('translate3d(100px, 200px, 0)');
    });

    it('should create transform string with offset', () => {
      const position: Position = { x: 100, y: 200 };
      const offset: Position = { x: 10, y: 20 };
      expect(createTransform(position, offset)).toBe('translate3d(110px, 220px, 0)');
    });

    it('should handle negative values', () => {
      const position: Position = { x: -50, y: -100 };
      const offset: Position = { x: -10, y: -20 };
      expect(createTransform(position, offset)).toBe('translate3d(-60px, -120px, 0)');
    });
  });
});