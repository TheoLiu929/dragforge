// Hooks
export { 
  useDragForgeEngine,
  useDragForgeable, 
  useDragForgeDroppable,
  useDragForgeCollisionDetection,
  type UseDragForgeableOptions,
  type UseDragForgeableResult,
  type UseDragForgeDroppableOptions,
  type UseDragForgeDroppableResult,
} from './hooks';

// Components
export { DragForgeable, DragForgeDroppable } from './components';
export { Canvas, type CanvasProps, type DroppedItem } from './Canvas';

// Context and Provider
export { 
  DragForgeProvider, 
  useDragForgeContext,
  type DragForgeProviderProps 
} from './context';

// Re-export core types for convenience
export type {
  DragNode,
  DropTarget,
  DragEvent,
  Position,
  CollisionDetection,
  DragConstraint,
  Sensor,
} from '@dragforge/core';

// Backward compatibility aliases
export { DragForgeProvider as DndProvider } from './context';
export { DragForgeable as Draggable } from './components';
export { DragForgeDroppable as Droppable } from './components';
export { useDragForgeable as useDraggable } from './hooks';
export { useDragForgeDroppable as useDroppable } from './hooks';
export { useDragForgeEngine as useDragEngine } from './hooks';
export { useDragForgeCollisionDetection as useCollisionDetection } from './hooks';
export { useDragForgeContext as useDndContext } from './context';