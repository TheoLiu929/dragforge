import React, { ReactNode } from 'react';
import { useDragForgeable, useDragForgeDroppable } from './hooks';

export interface DragForgeableProps {
  id: string;
  children: ReactNode;
  data?: any;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function DragForgeable({ id, children, data, disabled, className, style }: DragForgeableProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDragForgeable({
    id,
    data,
    disabled,
  });

  // HTML5 拖拽支持
  const handleDragStart = (event: React.DragEvent) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    
    const dragData = {
      id,
      ...data,
    };
    
    event.dataTransfer.setData('application/json', JSON.stringify(dragData));
    event.dataTransfer.effectAllowed = 'copy';
  };

  const transformStyle = transform 
    ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
    : undefined;

  return (
    <div
      ref={setNodeRef}
      className={className}
      draggable={!disabled}
      onDragStart={handleDragStart}
      style={{
        ...style,
        transform: transformStyle,
        opacity: isDragging ? 0.5 : 1,
        cursor: disabled ? 'default' : 'grab',
      }}
      {...attributes}
    >
      {children}
    </div>
  );
}

export interface DragForgeDroppableProps {
  id: string;
  children: ReactNode;
  data?: any;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function DragForgeDroppable({ id, children, data, disabled, className, style }: DragForgeDroppableProps) {
  const { attributes, setNodeRef, isOver } = useDragForgeDroppable({
    id,
    data,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      className={className}
      style={{
        ...style,
        backgroundColor: isOver ? 'rgba(0, 0, 0, 0.05)' : undefined,
      }}
      {...attributes}
    >
      {children}
    </div>
  );
}