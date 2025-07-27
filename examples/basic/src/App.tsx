import React, { useState } from 'react';
import { DragForgeProvider, Draggable, Droppable, Canvas, useDraggable } from '@dragforge/react';
import './App.css';

interface Item {
  id: string;
  content: string;
  color: string;
}

function DraggableItem({ item }: { item: Item }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: item,
  });

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
      ref={setNodeRef}
      className="draggable-item"
      draggable={true}
      onDragStart={handleDragStart}
      style={{
        backgroundColor: item.color,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
      }}
      {...attributes}
      {...listeners}
    >
      {item.content}
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

  const handleCanvasDrop = (item: any, position: { x: number; y: number }) => {
    console.log('Item dropped on canvas:', item, 'at position:', position);
  };

  return (
    <DragForgeProvider
      onDragStart={(item) => console.log('Drag started:', item)}
      onDragEnd={(item, target) => console.log('Drag ended:', item, 'on', target)}
    >
      <div className="app">
        <h1>DragForge Example</h1>
        
        <div className="main-layout">
          <div className="sidebar">
            <div className="items-section">
              <h2>Draggable Items</h2>
              <div className="items-grid">
                {items.map((item) => (
                  <DraggableItem key={item.id} item={item} />
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
            <Draggable id="component-1" className="demo-draggable" data={{ type: 'component', name: 'Button' }}>
              <div className="demo-content">Draggable Component 1</div>
            </Draggable>
            
            <Draggable id="component-2" className="demo-draggable" data={{ type: 'component', name: 'Input' }}>
              <div className="demo-content">Draggable Component 2</div>
            </Draggable>

            <Droppable id="component-drop" className="demo-droppable">
              <div className="demo-drop-content">Drop Components Here</div>
            </Droppable>
          </div>
        </div>
      </div>
    </DragForgeProvider>
  );
}

export default App;