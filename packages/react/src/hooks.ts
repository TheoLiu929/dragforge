import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { DragNode, DropTarget, Position, CollisionDetection } from '@dragforge/core';
import { useDragForgeContext } from './context';

// Hook to access the drag engine directly
export function useDragForgeEngine() {
  const { engine } = useDragForgeContext();
  return engine;
}

export interface UseDragForgeableOptions {
  id: string;
  data?: any;
  disabled?: boolean;
}

export interface UseDragForgeableResult {
  attributes: {
    'data-draggable-id': string;
    'data-draggable-disabled'?: string;
    role: string;
    tabIndex: number;
    'aria-disabled'?: boolean;
    'aria-roledescription': string;
    'aria-describedby'?: string;
  };
  listeners: {
    onMouseDown: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  setNodeRef: (node: HTMLElement | null) => void;
  transform: { x: number; y: number } | null;
  isDragging: boolean;
}

export function useDragForgeable(options: UseDragForgeableOptions): UseDragForgeableResult {
  const { id, data, disabled = false } = options;
  const { engine, draggableNodes, isDragging: globalIsDragging, activeNode } = useDragForgeContext();
  const nodeRef = useRef<HTMLElement | null>(null);
  const [transform, setTransform] = useState<{ x: number; y: number } | null>(null);

  // Register drag node
  useEffect(() => {
    if (nodeRef.current && !disabled) {
      const node: DragNode = {
        id,
        element: nodeRef.current,
        data,
        disabled,
      };
      
      draggableNodes.set(id, node);
      const unregister = engine.registerDragNode(node);

      return () => {
        draggableNodes.delete(id);
        unregister();
      };
    }
  }, [id, data, disabled, engine, draggableNodes]);

  // Update transform during drag
  useEffect(() => {
    if (!globalIsDragging || activeNode?.id !== id) {
      setTransform(null);
      return;
    }

    const handleMove = () => {
      const state = engine.getDragState();
      if (state.isDragging && state.draggedNode?.id === id) {
        setTransform(state.delta);
      }
    };

    const unsubscribe = engine.on('dragmove', handleMove);
    return unsubscribe;
  }, [globalIsDragging, activeNode, id, engine]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    const position: Position = { x: e.clientX, y: e.clientY };
    engine.startDrag(id, position);
  }, [id, disabled, engine]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    
    const touch = e.touches[0];
    const position: Position = { x: touch.clientX, y: touch.clientY };
    engine.startDrag(id, position);
  }, [id, disabled, engine]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;

    // Space or Enter to start drag
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const rect = nodeRef.current?.getBoundingClientRect();
      if (rect) {
        const position: Position = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
        engine.startDrag(id, position);
      }
    }
  }, [id, disabled, engine]);

  const setNodeRef = useCallback((node: HTMLElement | null) => {
    nodeRef.current = node;
  }, []);

  const isDragging = globalIsDragging && activeNode?.id === id;

  const attributes = useMemo(() => ({
    'data-draggable-id': id,
    ...(disabled && { 'data-draggable-disabled': '' }),
    role: 'button',
    tabIndex: disabled ? -1 : 0,
    ...(disabled && { 'aria-disabled': true }),
    'aria-roledescription': 'draggable',
  }), [id, disabled]);

  const listeners = useMemo(() => ({
    onMouseDown: handleMouseDown,
    onTouchStart: handleTouchStart,
    onKeyDown: handleKeyDown,
  }), [handleMouseDown, handleTouchStart, handleKeyDown]);

  return {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  };
}

export interface UseDragForgeDroppableOptions {
  id: string;
  data?: any;
  disabled?: boolean;
}

export interface UseDragForgeDroppableResult {
  attributes: {
    'data-droppable-id': string;
    'data-droppable-disabled'?: string;
    role: string;
    'aria-disabled'?: boolean;
    'aria-roledescription': string;
  };
  setNodeRef: (node: HTMLElement | null) => void;
  isOver: boolean;
  active: DragNode | null;
  rect: DOMRect | null;
}

export function useDragForgeDroppable(options: UseDragForgeDroppableOptions): UseDragForgeDroppableResult {
  const { id, data, disabled = false } = options;
  const { engine, droppableNodes, activeNode, activeTarget } = useDragForgeContext();
  const nodeRef = useRef<HTMLElement | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Register drop target
  useEffect(() => {
    if (nodeRef.current && !disabled) {
      const target: DropTarget = {
        id,
        element: nodeRef.current,
        data,
        disabled,
      };
      
      droppableNodes.set(id, target);
      const unregister = engine.registerDropTarget(target);

      // Update rect
      setRect(nodeRef.current.getBoundingClientRect());

      return () => {
        droppableNodes.delete(id);
        unregister();
      };
    }
  }, [id, data, disabled, engine, droppableNodes]);

  // Update rect on resize
  useEffect(() => {
    if (!nodeRef.current) return;

    const updateRect = () => {
      if (nodeRef.current) {
        setRect(nodeRef.current.getBoundingClientRect());
      }
    };

    const resizeObserver = new ResizeObserver(updateRect);
    resizeObserver.observe(nodeRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const setNodeRef = useCallback((node: HTMLElement | null) => {
    nodeRef.current = node;
    if (node) {
      setRect(node.getBoundingClientRect());
    }
  }, []);

  const isOver = activeTarget?.id === id;

  const attributes = useMemo(() => ({
    'data-droppable-id': id,
    ...(disabled && { 'data-droppable-disabled': '' }),
    role: 'region',
    ...(disabled && { 'aria-disabled': true }),
    'aria-roledescription': 'droppable',
  }), [id, disabled]);

  return {
    attributes,
    setNodeRef,
    isOver,
    active: activeNode,
    rect,
  };
}

// Hook for custom collision detection
export function useDragForgeCollisionDetection(): CollisionDetection | undefined {
  const { collisionDetection } = useDragForgeContext();
  return collisionDetection;
}