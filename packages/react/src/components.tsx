import React, { ReactNode } from 'react';
import { useDraggable, useDroppable } from './hooks';

export interface DraggableProps {
  id: string;
  children: ReactNode;
  data?: any;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function Draggable({ id, children, data, disabled, className, style }: DraggableProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
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

  return (
    <div
      ref={setNodeRef}
      className={className}
      draggable={!disabled}
      onDragStart={handleDragStart}
      style={{
        ...style,
        transform: transform || undefined,
        opacity: isDragging ? 0.5 : 1,
        cursor: disabled ? 'default' : 'grab',
      }}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

export interface DroppableProps {
  id: string;
  children: ReactNode;
  data?: any;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function Droppable({ id, children, data, disabled, className, style }: DroppableProps) {
  const { setNodeRef, isOver } = useDroppable({
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
    >
      {children}
    </div>
  );
}