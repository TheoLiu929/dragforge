import React from 'react';
import { 
  DragForgeProvider, 
  DragForgeable, 
  DragForgeDroppable, 
  useDragForgeCollisionDetection 
} from '@dragforge/react';
import { RectIntersectionCollision } from '@dragforge/collision';

function CollisionDebugger() {
  const collision = useDragForgeCollisionDetection();
  
  return (
    <div style={{ padding: '10px', background: '#f0f0f0', margin: '10px 0' }}>
      <strong>Collision Detection:</strong> {collision ? collision.constructor.name : 'None'}
    </div>
  );
}

export function CollisionTest() {
  const customCollision = new RectIntersectionCollision();

  const handleDragStart = (event: any) => {
    console.log('Drag started:', event);
  };

  const handleDragEnd = (event: any) => {
    console.log('Drag ended:', event);
  };

  const handleDrop = (event: any) => {
    console.log('Drop event:', event);
  };

  return (
    <DragForgeProvider
      collisionDetection={customCollision}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDrop={handleDrop}
    >
      <div style={{ padding: '20px' }}>
        <h2>Collision Detection Test</h2>
        
        <CollisionDebugger />
        
        <div style={{ display: 'flex', gap: '20px' }}>
          <div>
            <h3>Draggable Items</h3>
            <DragForgeable
              id="item-1"
              data={{ type: 'test', name: 'Item 1' }}
              style={{
                padding: '10px',
                background: '#ff6b6b',
                color: 'white',
                borderRadius: '4px',
                marginBottom: '10px',
                cursor: 'grab'
              }}
            >
              Test Item 1
            </DragForgeable>
            
            <DragForgeable
              id="item-2"
              data={{ type: 'test', name: 'Item 2' }}
              style={{
                padding: '10px',
                background: '#4ecdc4',
                color: 'white',
                borderRadius: '4px',
                cursor: 'grab'
              }}
            >
              Test Item 2
            </DragForgeable>
          </div>
          
          <div>
            <h3>Drop Zones</h3>
            <DragForgeDroppable
              id="zone-1"
              style={{
                width: '200px',
                height: '100px',
                border: '2px dashed #ccc',
                padding: '20px',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Drop Zone 1
            </DragForgeDroppable>
            
            <DragForgeDroppable
              id="zone-2"
              style={{
                width: '200px',
                height: '100px',
                border: '2px dashed #999',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Drop Zone 2
            </DragForgeDroppable>
          </div>
        </div>
      </div>
    </DragForgeProvider>
  );
}