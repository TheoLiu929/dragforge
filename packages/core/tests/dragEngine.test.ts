import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DragEngine } from '../src/dragEngine';
import { DragNode, DropTarget, Position } from '../src/types';

describe('DragEngine', () => {
  let engine: DragEngine;
  let mockOptions: any;

  beforeEach(() => {
    mockOptions = {
      onDragStart: vi.fn(),
      onDragMove: vi.fn(),
      onDragEnd: vi.fn(),
      onDragCancel: vi.fn(),
    };
    engine = new DragEngine(mockOptions);
  });

  describe('registerDraggable', () => {
    it('should register a draggable item', () => {
      const item: DraggableItem = { id: 'test-1', data: { name: 'Test Item' } };
      engine.registerDraggable(item);
      
      const state = engine.getState();
      expect(state.draggableItems.has('test-1')).toBe(true);
      expect(state.draggableItems.get('test-1')).toEqual(item);
    });
  });

  describe('unregisterDraggable', () => {
    it('should unregister a draggable item', () => {
      const item: DraggableItem = { id: 'test-1' };
      engine.registerDraggable(item);
      engine.unregisterDraggable('test-1');
      
      const state = engine.getState();
      expect(state.draggableItems.has('test-1')).toBe(false);
    });
  });

  describe('registerDropTarget', () => {
    it('should register a drop target', () => {
      const target: DropTarget = { id: 'target-1', data: { zone: 'A' } };
      engine.registerDropTarget(target);
      
      const state = engine.getState();
      expect(state.dropTargets.has('target-1')).toBe(true);
      expect(state.dropTargets.get('target-1')).toEqual(target);
    });
  });

  describe('unregisterDropTarget', () => {
    it('should unregister a drop target', () => {
      const target: DropTarget = { id: 'target-1' };
      engine.registerDropTarget(target);
      engine.unregisterDropTarget('target-1');
      
      const state = engine.getState();
      expect(state.dropTargets.has('target-1')).toBe(false);
    });
  });

  describe('startDrag', () => {
    it('should start dragging when item exists', () => {
      const item: DraggableItem = { id: 'test-1' };
      const position: Position = { x: 100, y: 200 };
      
      engine.registerDraggable(item);
      engine.startDrag('test-1', position);
      
      const state = engine.getState();
      expect(state.dragState.isDragging).toBe(true);
      expect(state.dragState.draggedItem).toEqual(item);
      expect(state.dragState.position).toEqual(position);
      expect(mockOptions.onDragStart).toHaveBeenCalledWith(item);
    });

    it('should not start dragging when item does not exist', () => {
      const position: Position = { x: 100, y: 200 };
      engine.startDrag('non-existent', position);
      
      const state = engine.getState();
      expect(state.dragState.isDragging).toBe(false);
      expect(mockOptions.onDragStart).not.toHaveBeenCalled();
    });
  });

  describe('updateDragPosition', () => {
    it('should update position when dragging', () => {
      const item: DraggableItem = { id: 'test-1' };
      const startPos: Position = { x: 100, y: 200 };
      const newPos: Position = { x: 150, y: 250 };
      
      engine.registerDraggable(item);
      engine.startDrag('test-1', startPos);
      engine.updateDragPosition(newPos);
      
      const state = engine.getState();
      expect(state.dragState.position).toEqual(newPos);
      expect(mockOptions.onDragMove).toHaveBeenCalledWith(newPos);
    });

    it('should not update position when not dragging', () => {
      const position: Position = { x: 150, y: 250 };
      engine.updateDragPosition(position);
      
      expect(mockOptions.onDragMove).not.toHaveBeenCalled();
    });
  });

  describe('endDrag', () => {
    it('should end drag when dragging', () => {
      const item: DraggableItem = { id: 'test-1' };
      const position: Position = { x: 100, y: 200 };
      
      engine.registerDraggable(item);
      engine.startDrag('test-1', position);
      engine.endDrag();
      
      const state = engine.getState();
      expect(state.dragState.isDragging).toBe(false);
      expect(state.dragState.draggedItem).toBe(null);
      expect(mockOptions.onDragEnd).toHaveBeenCalledWith(item, null);
    });

    it('should not end drag when not dragging', () => {
      engine.endDrag();
      expect(mockOptions.onDragEnd).not.toHaveBeenCalled();
    });
  });

  describe('cancelDrag', () => {
    it('should cancel drag when dragging', () => {
      const item: DraggableItem = { id: 'test-1' };
      const position: Position = { x: 100, y: 200 };
      
      engine.registerDraggable(item);
      engine.startDrag('test-1', position);
      engine.cancelDrag();
      
      const state = engine.getState();
      expect(state.dragState.isDragging).toBe(false);
      expect(state.dragState.draggedItem).toBe(null);
      expect(mockOptions.onDragCancel).toHaveBeenCalled();
    });

    it('should not cancel drag when not dragging', () => {
      engine.cancelDrag();
      expect(mockOptions.onDragCancel).not.toHaveBeenCalled();
    });
  });

  describe('getState', () => {
    it('should return the current state', () => {
      const state = engine.getState();
      expect(state).toHaveProperty('draggableItems');
      expect(state).toHaveProperty('dropTargets');
      expect(state).toHaveProperty('dragState');
      expect(state.dragState).toHaveProperty('isDragging');
      expect(state.dragState).toHaveProperty('draggedItem');
      expect(state.dragState).toHaveProperty('position');
      expect(state.dragState).toHaveProperty('offset');
    });
  });
});