import { useRef, useEffect, useCallback, useState } from 'react';
import { DragEngine, Position, DragEngineOptions, DragEngineState } from '@dragforge/core';

export function useDragEngine(options: DragEngineOptions = {}): {
  engine: DragEngine;
  state: DragEngineState;
} {
  const engineRef = useRef<DragEngine>();
  const [state, setState] = useState<DragEngineState>({
    draggableItems: new Map(),
    dropTargets: new Map(),
    dragState: {
      isDragging: false,
      draggedItem: null,
      position: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
    },
  });

  if (!engineRef.current) {
    engineRef.current = new DragEngine(options);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (engineRef.current) {
        setState(engineRef.current.getState());
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, []);

  return {
    engine: engineRef.current,
    state,
  };
}

export interface UseDraggableOptions {
  id: string;
  data?: any;
  disabled?: boolean;
}

export interface UseDraggableResult {
  attributes: {
    'data-draggable-id': string;
    role: string;
    tabIndex: number;
  };
  listeners: {
    onMouseDown: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
  };
  setNodeRef: (node: HTMLElement | null) => void;
  transform: string | null;
  isDragging: boolean;
}

export function useDraggable(options: UseDraggableOptions): UseDraggableResult {
  const { id, data, disabled = false } = options;
  const nodeRef = useRef<HTMLElement | null>(null);
  const engineRef = useRef<DragEngine | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled || !engineRef.current) return;
    
    e.preventDefault();
    const position: Position = { x: e.clientX, y: e.clientY };
    engineRef.current.startDrag(id, position);
  }, [id, disabled]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || !engineRef.current) return;
    
    const touch = e.touches[0];
    const position: Position = { x: touch.clientX, y: touch.clientY };
    engineRef.current.startDrag(id, position);
  }, [id, disabled]);

  const setNodeRef = useCallback((node: HTMLElement | null) => {
    nodeRef.current = node;
  }, []);

  return {
    attributes: {
      'data-draggable-id': id,
      role: 'button',
      tabIndex: 0,
    },
    listeners: {
      onMouseDown: handleMouseDown,
      onTouchStart: handleTouchStart,
    },
    setNodeRef,
    transform: null,
    isDragging: false,
  };
}

export interface UseDroppableOptions {
  id: string;
  data?: any;
  disabled?: boolean;
}

export interface UseDroppableResult {
  setNodeRef: (node: HTMLElement | null) => void;
  isOver: boolean;
  active: any | null;
}

export function useDroppable(options: UseDroppableOptions): UseDroppableResult {
  const { id, data, disabled = false } = options;
  const nodeRef = useRef<HTMLElement | null>(null);

  const setNodeRef = useCallback((node: HTMLElement | null) => {
    nodeRef.current = node;
  }, []);

  return {
    setNodeRef,
    isOver: false,
    active: null,
  };
}