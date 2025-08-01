import React, { useEffect, useRef, useState } from 'react';
import { 
  createDragEngine, 
  DragEngine, 
  DragEvent,
  GridSnapCollision,
  NestedContainerCollision,
  ClosestCenterCollision
} from '@dragforge/core';
import './CollisionTest.css';

type CollisionMode = 'default' | 'grid' | 'nested' | 'closest';

const CollisionTest: React.FC = () => {
  const engineRef = useRef<DragEngine | null>(null);
  const [mode, setMode] = useState<CollisionMode>('default');
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [gridSize, setGridSize] = useState(30);
  const [activeZone, setActiveZone] = useState<string | null>(null);

  useEffect(() => {
    // Create collision detection based on mode
    let collisionDetection;
    switch (mode) {
      case 'grid':
        collisionDetection = new GridSnapCollision(gridSize);
        break;
      case 'nested':
        collisionDetection = new NestedContainerCollision(3);
        break;
      case 'closest':
        collisionDetection = new ClosestCenterCollision();
        break;
      default:
        collisionDetection = undefined; // Use default
    }

    // Create drag engine
    const engine = createDragEngine({
      collisionDetection,
      autoScroll: true
    });
    
    engineRef.current = engine;

    // Register draggable items
    const items = document.querySelectorAll('.collision-item');
    items.forEach((item, index) => {
      engine.registerDragNode({
        id: `item-${index}`,
        element: item as HTMLElement,
        data: { index }
      });
    });

    // Register drop zones
    const zones = document.querySelectorAll('.drop-zone, .nested-zone');
    zones.forEach((zone, index) => {
      engine.registerDropTarget({
        id: `zone-${index}`,
        element: zone as HTMLElement,
        data: { type: zone.classList.contains('nested-zone') ? 'nested' : 'normal' }
      });
    });

    // Event listeners
    const handleDragEnter = (event: DragEvent) => {
      setActiveZone(event.target?.id || null);
    };

    const handleDragLeave = (event: DragEvent) => {
      setActiveZone(null);
    };

    const handleDrop = (event: DragEvent) => {
      console.log('Dropped:', event.node.id, 'on', event.target?.id);
      setActiveZone(null);
    };

    engine.on('dragenter', handleDragEnter);
    engine.on('dragleave', handleDragLeave);
    engine.on('drop', handleDrop);
    engine.on('dragend', () => setActiveZone(null));

    return () => {
      engine.destroy();
    };
  }, [mode, gridSize, showPlaceholder]);

  return (
    <div className="collision-test-container">
      <h1>Collision Detection Test</h1>
      
      <div className="controls">
        <div className="control-group">
          <label>Collision Mode:</label>
          <select value={mode} onChange={(e) => setMode(e.target.value as CollisionMode)}>
            <option value="default">Default (Rect Intersection)</option>
            <option value="grid">Grid Snap</option>
            <option value="nested">Nested Containers</option>
            <option value="closest">Closest Center</option>
          </select>
        </div>
        
        {mode === 'grid' && (
          <div className="control-group">
            <label>Grid Size:</label>
            <input 
              type="range" 
              min="10" 
              max="50" 
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
            />
            <span>{gridSize}px</span>
          </div>
        )}
        
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={showPlaceholder}
              onChange={(e) => setShowPlaceholder(e.target.checked)}
            />
            Show Placeholder
          </label>
        </div>
        
        {activeZone && (
          <div className="active-zone-indicator">
            Active Zone: <strong>{activeZone}</strong>
          </div>
        )}
      </div>

      <div className="test-area">
        <div className="items-section">
          <h2>Draggable Items</h2>
          <div className="items-container">
            <div className="collision-item small">Small</div>
            <div className="collision-item medium">Medium</div>
            <div className="collision-item large">Large</div>
            <div className="collision-item wide">Wide</div>
            <div className="collision-item tall">Tall</div>
          </div>
        </div>

        <div className="zones-section">
          <h2>Drop Zones</h2>
          
          {mode === 'grid' && (
            <div className="grid-container">
              <div 
                className="drop-zone grid-zone" 
                style={{
                  backgroundSize: `${gridSize}px ${gridSize}px`,
                  backgroundImage: `
                    linear-gradient(to right, #e0e0e0 1px, transparent 1px),
                    linear-gradient(to bottom, #e0e0e0 1px, transparent 1px)
                  `
                }}
              >
                <p>Grid Aligned Zone</p>
              </div>
            </div>
          )}
          
          {mode === 'nested' && (
            <div className="nested-container">
              <div className="drop-zone nested-zone level-1">
                <span>Level 1</span>
                <div className="drop-zone nested-zone level-2">
                  <span>Level 2</span>
                  <div className="drop-zone nested-zone level-3">
                    <span>Level 3</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {(mode === 'default' || mode === 'closest') && (
            <div className="standard-zones">
              <div className="drop-zone zone-a">Zone A</div>
              <div className="drop-zone zone-b">Zone B</div>
              <div className="drop-zone zone-c">Zone C</div>
            </div>
          )}
        </div>
      </div>

      <div className="info-panel">
        <h3>Collision Detection Features</h3>
        <ul>
          <li><strong>Rect Intersection:</strong> Detects when dragged item overlaps with drop zone</li>
          <li><strong>Grid Snap:</strong> Aligns items to a grid when dropped</li>
          <li><strong>Nested Containers:</strong> Supports dropping into nested containers with depth priority</li>
          <li><strong>Closest Center:</strong> Finds the drop zone with center closest to drag position</li>
          <li><strong>Placeholder:</strong> Shows preview of where item will be placed</li>
          <li><strong>Performance:</strong> Uses QuadTree for optimized collision detection with many elements</li>
        </ul>
      </div>
    </div>
  );
};

export default CollisionTest;