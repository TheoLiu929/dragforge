import React, { useState } from 'react';
import { DragForgeProvider, Draggable, Droppable, useDraggable, useDroppable } from '@dragforge/react';
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

  return (
    <div
      ref={setNodeRef}
      className="draggable-item"
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

function DropZone({ id, title }: { id: string; title: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className="drop-zone"
      style={{
        backgroundColor: isOver ? '#e0e0e0' : '#f5f5f5',
      }}
    >
      <h3>{title}</h3>
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

  return (
    <DragForgeProvider
      onDragStart={(item) => console.log('Drag started:', item)}
      onDragEnd={(item, target) => console.log('Drag ended:', item, 'on', target)}
    >
      <div className="app">
        <h1>DragForge Example</h1>
        
        <div className="container">
          <div className="items-section">
            <h2>Draggable Items</h2>
            <div className="items-grid">
              {items.map((item) => (
                <DraggableItem key={item.id} item={item} />
              ))}
            </div>
          </div>

          <div className="drop-section">
            <h2>Drop Zones</h2>
            <div className="drop-zones">
              <DropZone id="zone-1" title="Drop Zone 1" />
              <DropZone id="zone-2" title="Drop Zone 2" />
              <DropZone id="zone-3" title="Drop Zone 3" />
            </div>
          </div>
        </div>

        <div className="demo-section">
          <h2>Using Components</h2>
          <div className="component-demo">
            <Draggable id="component-1" className="demo-draggable">
              <div className="demo-content">Draggable Component 1</div>
            </Draggable>
            
            <Draggable id="component-2" className="demo-draggable">
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