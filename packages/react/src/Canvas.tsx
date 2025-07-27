import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useDroppable } from './hooks';

export interface CanvasProps {
  id: string;
  width?: number;
  height?: number;
  showRuler?: boolean;
  rulerUnit?: number; // 刻度单位，默认为10px
  gridSize?: number; // 网格大小，默认为20px
  showGrid?: boolean;
  onItemDrop?: (item: any, position: { x: number; y: number }) => void;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface DroppedItem {
  id: string;
  data: any;
  position: { x: number; y: number };
  isDragging?: boolean;
}

export function Canvas({
  id,
  width = 800,
  height = 600,
  showRuler = true,
  rulerUnit = 10,
  gridSize = 20,
  showGrid = true,
  onItemDrop,
  children,
  className = '',
  style = {},
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([]);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  // 处理画布内元素的拖拽开始
  const handleItemDragStart = useCallback((event: React.DragEvent, item: DroppedItem) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const itemRect = (event.target as HTMLElement).getBoundingClientRect();

    // 计算鼠标相对于元素的偏移
    const offsetX = event.clientX - itemRect.left - itemRect.width / 2;
    const offsetY = event.clientY - itemRect.top - itemRect.height / 2;

    setDraggedItemId(item.id);
    setDragOffset({ x: offsetX, y: offsetY });

    // 设置拖拽数据，标记为内部移动
    const dragData = {
      ...item.data,
      isInternalMove: true,
      originalItemId: item.id,
    };

    event.dataTransfer.setData('application/json', JSON.stringify(dragData));
    event.dataTransfer.effectAllowed = 'move';

    // 标记正在拖拽的元素
    setDroppedItems((items) =>
      items.map((i) => (i.id === item.id ? { ...i, isDragging: true } : i))
    );
  }, []);

  // 处理画布内元素的拖拽结束
  const handleItemDragEnd = useCallback(() => {
    setDraggedItemId(null);
    setDragOffset({ x: 0, y: 0 });

    // 清除拖拽状态
    setDroppedItems((items) => items.map((i) => ({ ...i, isDragging: false })));
  }, []);

  // 处理拖拽项目到画布上的放置
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left - dragOffset.x;
      const y = event.clientY - rect.top - dragOffset.y;

      // 获取拖拽数据
      const dragData = event.dataTransfer.getData('application/json');
      if (dragData) {
        try {
          const item = JSON.parse(dragData);

          if (item.isInternalMove) {
            // 内部移动：更新现有元素位置
            setDroppedItems((prev) =>
              prev.map((existingItem) =>
                existingItem.id === item.originalItemId
                  ? { ...existingItem, position: { x, y }, isDragging: false }
                  : existingItem
              )
            );
          } else {
            // 外部拖入：创建新元素
            const newItem: DroppedItem = {
              id: `${item.id}_${Date.now()}`,
              data: item,
              position: { x, y },
              isDragging: false,
            };

            setDroppedItems((prev) => [...prev, newItem]);
            onItemDrop?.(item, { x, y });
          }
        } catch (error) {
          console.error('Failed to parse drag data:', error);
        }
      }

      // 重置拖拽状态
      handleItemDragEnd();
    },
    [onItemDrop, dragOffset, handleItemDragEnd]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  // 绘制刻度尺
  const renderRuler = () => {
    if (!showRuler) return null;

    const horizontalMarks = [];
    const verticalMarks = [];

    // 水平刻度
    for (let i = 0; i <= width; i += rulerUnit) {
      const isMajor = i % (rulerUnit * 5) === 0;
      horizontalMarks.push(
        <div
          key={`h-${i}`}
          className={`ruler-mark horizontal ${isMajor ? 'major' : 'minor'}`}
          style={{
            left: i,
            height: isMajor ? '10px' : '5px',
          }}
        >
          {isMajor && <span className="ruler-label">{i}</span>}
        </div>
      );
    }

    // 垂直刻度
    for (let i = 0; i <= height; i += rulerUnit) {
      const isMajor = i % (rulerUnit * 5) === 0;
      verticalMarks.push(
        <div
          key={`v-${i}`}
          className={`ruler-mark vertical ${isMajor ? 'major' : 'minor'}`}
          style={{
            top: i,
            width: isMajor ? '10px' : '5px',
          }}
        >
          {isMajor && <span className="ruler-label">{i}</span>}
        </div>
      );
    }

    return (
      <>
        <div className="ruler horizontal-ruler">{horizontalMarks}</div>
        <div className="ruler vertical-ruler">{verticalMarks}</div>
      </>
    );
  };

  // 绘制网格
  const renderGrid = () => {
    if (!showGrid) return null;

    const gridLines = [];

    // 垂直线
    for (let i = 0; i <= width; i += gridSize) {
      gridLines.push(
        <line key={`v-${i}`} x1={i} y1={0} x2={i} y2={height} stroke="#e0e0e0" strokeWidth="1" />
      );
    }

    // 水平线
    for (let i = 0; i <= height; i += gridSize) {
      gridLines.push(
        <line key={`h-${i}`} x1={0} y1={i} x2={width} y2={i} stroke="#e0e0e0" strokeWidth="1" />
      );
    }

    return (
      <svg
        className="canvas-grid"
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      >
        {gridLines}
      </svg>
    );
  };

  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      canvasRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef]
  );

  return (
    <div className={`canvas-container ${className}`} style={style}>
      {renderRuler()}

      <div
        ref={combinedRef}
        className={`canvas ${isOver ? 'canvas-over' : ''}`}
        style={{
          width,
          height,
          position: 'relative',
          backgroundColor: isOver ? '#f0f8ff' : '#ffffff',
          border: '1px solid #ccc',
          overflow: 'hidden',
          ...style,
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {renderGrid()}

        {/* 渲染已放置的项目 */}
        {droppedItems.map((item) => (
          <div
            key={item.id}
            className="dropped-item"
            draggable={true}
            onDragStart={(e) => handleItemDragStart(e, item)}
            onDragEnd={handleItemDragEnd}
            style={{
              position: 'absolute',
              left: item.position.x,
              top: item.position.y,
              padding: '8px 12px',
              backgroundColor: item.data.color || '#4ecdc4',
              color: 'white',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500',
              transform: 'translate(-50%, -50%)', // 居中显示
              userSelect: 'none',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              opacity: item.isDragging ? 0.5 : 1,
              cursor: 'move',
            }}
          >
            {item.data.content || item.data.name || item.data.id}
          </div>
        ))}

        {children}
      </div>
    </div>
  );
}
