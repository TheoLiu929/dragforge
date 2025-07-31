import React, { useEffect, useRef, useState } from 'react';
import { createDragEngine, DragEngine, DragEvent } from '@dragforge/core';
import './SensorTest.css';

interface LogEntry {
  timestamp: number;
  type: string;
  message: string;
}

const SensorTest: React.FC = () => {
  const engineRef = useRef<DragEngine | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [dragCount, setDragCount] = useState(0);
  const [dropCount, setDropCount] = useState(0);

  const addLog = (type: string, message: string) => {
    setLogs(prev => [...prev, {
      timestamp: Date.now(),
      type,
      message
    }].slice(-10)); // Keep last 10 logs
  };

  useEffect(() => {
    // Create drag engine
    const engine = createDragEngine({
      autoScroll: true
    });
    engineRef.current = engine;

    // Setup event listeners
    const unsubscribers = [
      engine.on('dragstart', (event: DragEvent) => {
        addLog('dragstart', `Started dragging ${event.node.id}`);
        setDragCount(prev => prev + 1);
      }),
      engine.on('dragmove', (event: DragEvent) => {
        addLog('dragmove', `Position: ${Math.round(event.position.x)}, ${Math.round(event.position.y)}`);
      }),
      engine.on('dragenter', (event: DragEvent) => {
        addLog('dragenter', `Entered ${event.target?.id}`);
      }),
      engine.on('dragleave', (event: DragEvent) => {
        addLog('dragleave', `Left ${event.target?.id}`);
      }),
      engine.on('drop', (event: DragEvent) => {
        addLog('drop', `Dropped ${event.node.id} on ${event.target?.id}`);
        setDropCount(prev => prev + 1);
      }),
      engine.on('dragend', (event: DragEvent) => {
        addLog('dragend', `Ended dragging ${event.node.id}`);
      }),
      engine.on('dragcancel', (event: DragEvent) => {
        addLog('dragcancel', `Cancelled dragging ${event.node.id}`);
      }),
    ];

    // Register draggable items
    const item1 = document.getElementById('drag-item-1');
    const item2 = document.getElementById('drag-item-2');
    const item3 = document.getElementById('drag-item-3');

    if (item1) {
      engine.registerDragNode({
        id: 'item-1',
        element: item1 as HTMLElement,
        data: { color: 'blue', value: 1 }
      });
    }

    if (item2) {
      engine.registerDragNode({
        id: 'item-2',
        element: item2 as HTMLElement,
        data: { color: 'green', value: 2 }
      });
    }

    if (item3) {
      engine.registerDragNode({
        id: 'item-3',
        element: item3 as HTMLElement,
        data: { color: 'red', value: 3 },
        disabled: true // This one is disabled
      });
    }

    // Register drop targets
    const zone1 = document.getElementById('drop-zone-1');
    const zone2 = document.getElementById('drop-zone-2');

    if (zone1) {
      engine.registerDropTarget({
        id: 'zone-1',
        element: zone1 as HTMLElement,
        data: { accepts: ['blue', 'green'] }
      });
    }

    if (zone2) {
      engine.registerDropTarget({
        id: 'zone-2',
        element: zone2 as HTMLElement,
        data: { accepts: ['red', 'green'] }
      });
    }

    return () => {
      unsubscribers.forEach(unsub => unsub());
      engine.destroy();
    };
  }, []);

  const clearLogs = () => setLogs([]);

  return (
    <div className="sensor-test-container">
      <h1>DragForge Sensor System Test</h1>
      
      <div className="test-area">
        <div className="drag-items">
          <h2>Draggable Items</h2>
          <div id="drag-item-1" className="drag-item blue" data-dragforge-draggable>
            <span>Item 1</span>
            <small>Blue • Value: 1</small>
          </div>
          <div id="drag-item-2" className="drag-item green" data-dragforge-draggable>
            <span>Item 2</span>
            <small>Green • Value: 2</small>
          </div>
          <div id="drag-item-3" className="drag-item red disabled" data-dragforge-draggable data-disabled="true">
            <span>Item 3 (Disabled)</span>
            <small>Red • Value: 3</small>
          </div>
        </div>

        <div className="drop-zones">
          <h2>Drop Zones</h2>
          <div id="drop-zone-1" className="drop-zone" data-dragforge-droppable>
            <h3>Zone 1</h3>
            <p>Accepts: Blue, Green</p>
          </div>
          <div id="drop-zone-2" className="drop-zone" data-dragforge-droppable>
            <h3>Zone 2</h3>
            <p>Accepts: Red, Green</p>
          </div>
        </div>
      </div>

      <div className="stats">
        <h2>Statistics</h2>
        <div className="stat-grid">
          <div className="stat">
            <span className="stat-label">Total Drags:</span>
            <span className="stat-value">{dragCount}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Successful Drops:</span>
            <span className="stat-value">{dropCount}</span>
          </div>
        </div>
      </div>

      <div className="event-log">
        <div className="log-header">
          <h2>Event Log</h2>
          <button onClick={clearLogs}>Clear</button>
        </div>
        <div className="log-entries">
          {logs.map((log, index) => (
            <div key={index} className={`log-entry ${log.type}`}>
              <span className="log-type">{log.type}</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="instructions">
        <h2>Instructions</h2>
        <ul>
          <li>Drag items from the left to drop zones on the right</li>
          <li>Watch the event log to see the drag lifecycle</li>
          <li>Notice the visual feedback when hovering over drop zones</li>
          <li>Item 3 is disabled and cannot be dragged</li>
          <li>The drag preview follows your cursor with smooth animations</li>
        </ul>
      </div>
    </div>
  );
};

export default SensorTest;