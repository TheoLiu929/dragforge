import React, { createContext, useContext, ReactNode, useMemo, useEffect, useState } from 'react';
import { DragEngine, DragEngineOptions, DragEvent, DragNode, DropTarget, CollisionDetection } from '@dragforge/core';

interface DragForgeContextValue {
  engine: DragEngine;
  draggableNodes: Map<string, DragNode>;
  droppableNodes: Map<string, DropTarget>;
  isDragging: boolean;
  activeNode: DragNode | null;
  activeTarget: DropTarget | null;
  collisionDetection?: CollisionDetection;
}

const DragForgeContext = createContext<DragForgeContextValue | null>(null);

export interface DragForgeProviderProps extends DragEngineOptions {
  children: ReactNode;
  collisionDetection?: CollisionDetection;
  onDragStart?: (event: DragEvent) => void;
  onDragMove?: (event: DragEvent) => void;
  onDragEnd?: (event: DragEvent) => void;
  onDragCancel?: (event: DragEvent) => void;
  onDragOver?: (event: DragEvent) => void;
  onDragEnter?: (event: DragEvent) => void;
  onDragLeave?: (event: DragEvent) => void;
  onDrop?: (event: DragEvent) => void;
}

export function DragForgeProvider({ 
  children,
  collisionDetection,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  ...engineOptions
}: DragForgeProviderProps) {
  const engine = useMemo(() => new DragEngine({
    collisionDetection,
    ...engineOptions
  }), [collisionDetection, engineOptions]);

  const [draggableNodes] = useState(() => new Map<string, DragNode>());
  const [droppableNodes] = useState(() => new Map<string, DropTarget>());
  const [isDragging, setIsDragging] = useState(false);
  const [activeNode, setActiveNode] = useState<DragNode | null>(null);
  const [activeTarget, setActiveTarget] = useState<DropTarget | null>(null);

  // 设置事件监听
  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    if (onDragStart) {
      unsubscribers.push(engine.on('dragstart', (event) => {
        setIsDragging(true);
        setActiveNode(event.node);
        onDragStart(event);
      }));
    } else {
      unsubscribers.push(engine.on('dragstart', (event) => {
        setIsDragging(true);
        setActiveNode(event.node);
      }));
    }

    if (onDragMove) {
      unsubscribers.push(engine.on('dragmove', onDragMove));
    }

    unsubscribers.push(engine.on('dragenter', (event) => {
      setActiveTarget(event.target || null);
      onDragEnter?.(event);
    }));

    unsubscribers.push(engine.on('dragleave', (event) => {
      setActiveTarget(null);
      onDragLeave?.(event);
    }));

    unsubscribers.push(engine.on('dragend', (event) => {
      setIsDragging(false);
      setActiveNode(null);
      setActiveTarget(null);
      onDragEnd?.(event);
    }));

    unsubscribers.push(engine.on('dragcancel', (event) => {
      setIsDragging(false);
      setActiveNode(null);
      setActiveTarget(null);
      onDragCancel?.(event);
    }));

    if (onDragOver) {
      unsubscribers.push(engine.on('dragover', onDragOver));
    }

    if (onDrop) {
      unsubscribers.push(engine.on('drop', onDrop));
    }

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [engine, onDragStart, onDragMove, onDragEnd, onDragCancel, onDragOver, onDragEnter, onDragLeave, onDrop]);

  // 清理引擎
  useEffect(() => {
    return () => {
      engine.destroy();
    };
  }, [engine]);

  const contextValue = useMemo(() => ({
    engine,
    draggableNodes,
    droppableNodes,
    isDragging,
    activeNode,
    activeTarget,
    collisionDetection,
  }), [engine, draggableNodes, droppableNodes, isDragging, activeNode, activeTarget, collisionDetection]);

  return (
    <DragForgeContext.Provider value={contextValue}>
      {children}
    </DragForgeContext.Provider>
  );
}

export function useDragForgeContext() {
  const context = useContext(DragForgeContext);
  if (!context) {
    throw new Error('useDragForgeContext must be used within a DragForgeProvider');
  }
  return context;
}