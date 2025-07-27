import React, { useState } from 'react';
import { DragForgeProvider, DragForgeable, DragForgeDroppable, Canvas, useDragForgeCollisionDetection } from '@dragforge/react';
import { RectIntersectionCollision } from '@dragforge/core';
import './App.css';

interface Item {
  id: string;
  content: string;
  color: string;
}

function DragForgeableItem({ item }: { item: Item }) {
  const handleDragStart = (event: React.DragEvent) => {
    const dragData = {
      id: item.id,
      content: item.content,
      color: item.color,
    };

    event.dataTransfer.setData('application/json', JSON.stringify(dragData));
    event.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      className="draggable-item"
      draggable={true}
      onDragStart={handleDragStart}
      style={{
        backgroundColor: item.color,
        cursor: 'grab',
      }}
    >
      {item.content}
    </div>
  );
}

function CollisionInfo() {
  const collision = useDragForgeCollisionDetection();
  return (
    <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px', marginBottom: '20px' }}>
      <strong>Collision Detection:</strong> {collision ? collision.constructor.name : 'Default'}
    </div>
  );
}

function App() {
  const [items] = useState<Item[]>([
    { id: '1', content: 'Item 1', color: '#ff6b6b' },
    { id: '2', content: 'Item 2', color: '#4ecdc4' },
    { id: '3', content: 'Item 3', color: '#45b7d1' },
    { id: '4', content: 'Item 4', color: '#f9ca24' },
  ]);

  const customCollision = new RectIntersectionCollision();

  const handleCanvasDrop = (item: any, position: { x: number; y: number }) => {
    console.log('Item dropped on canvas:', item, 'at position:', position);
  };

  return (
    <DragForgeProvider
      collisionDetection={customCollision}
      onDragStart={(event) => console.log('Drag started:', event)}
      onDragEnd={(event) => console.log('Drag ended:', event)}
    >
      <div className="app">
        <h1>DragForge Example</h1>

        <CollisionInfo />

        <div className="main-layout">
          <div className="sidebar">
            <div className="items-section">
              <h2>Draggable Items</h2>
              <div className="items-grid">
                {items.map((item) => (
                  <DragForgeableItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>

          <div className="canvas-section">
            <h2>Design Canvas</h2>
            <p className="canvas-description">
              拖拽左侧的项目到画布的任意位置。画布支持网格对齐和刻度尺。
            </p>
            <Canvas
              id="design-canvas"
              width={800}
              height={500}
              showRuler={true}
              showGrid={true}
              rulerUnit={20}
              gridSize={20}
              onItemDrop={handleCanvasDrop}
              className="design-canvas"
            />
          </div>
        </div>

        <div className="demo-section">
          <h2>Using Components</h2>
          <div className="component-demo">
            <DragForgeable
              id="component-1"
              className="demo-draggable"
              data={{ type: 'component', name: 'Button' }}
            >
              <div className="demo-content">Draggable Component 1</div>
            </DragForgeable>

            <DragForgeable
              id="component-2"
              className="demo-draggable"
              data={{ type: 'component', name: 'Input' }}
            >
              <div className="demo-content">Draggable Component 2</div>
            </DragForgeable>

            <DragForgeDroppable id="component-drop" className="demo-droppable">
              <div className="demo-drop-content">Drop Components Here</div>
            </DragForgeDroppable>
          </div>
        </div>
      </div>
    </DragForgeProvider>
  );
}

export default App;
