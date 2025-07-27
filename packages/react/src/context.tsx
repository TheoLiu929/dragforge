import React, { createContext, useContext, ReactNode } from 'react';
import { DragEngine } from '@dragforge/core';
import { useDragEngine } from './hooks';

interface DragForgeContextValue {
  engine: DragEngine;
}

const DragForgeContext = createContext<DragForgeContextValue | null>(null);

export interface DragForgeProviderProps {
  children: ReactNode;
  onDragStart?: (item: any) => void;
  onDragMove?: (position: { x: number; y: number }) => void;
  onDragEnd?: (item: any, target: any) => void;
  onDragCancel?: () => void;
}

export function DragForgeProvider({ children, ...options }: DragForgeProviderProps) {
  const { engine } = useDragEngine(options);

  return (
    <DragForgeContext.Provider value={{ engine }}>
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