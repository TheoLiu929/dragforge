import React, { useState } from 'react';
import { 
  DragForgeProvider, 
  DragForgeable, 
  DragForgeDroppable,
  useDragForgeEngine
} from '@dragforge/react';
import { createMouseSensor } from '@dragforge/core';

interface SensorEvent {
  type: string;
  timestamp: number;
  position: { x: number; y: number };
  sensor?: string;
}

function SensorDebugger() {
  const engine = useDragForgeEngine();
  const [events, setEvents] = useState<SensorEvent[]>([]);

  React.useEffect(() => {
    const unsubscribers = [
      engine.on('dragstart', (event) => {
        setEvents(prev => [...prev.slice(-9), {
          type: 'dragstart',
          timestamp: event.timestamp,
          position: event.position,
          sensor: 'MouseSensor'
        }]);
      }),
      engine.on('dragmove', (event) => {
        setEvents(prev => [...prev.slice(-9), {
          type: 'dragmove',
          timestamp: event.timestamp,
          position: event.position,
          sensor: 'MouseSensor'
        }]);
      }),
      engine.on('dragend', (event) => {
        setEvents(prev => [...prev.slice(-9), {
          type: 'dragend',
          timestamp: event.timestamp,
          position: event.position,
          sensor: 'MouseSensor'
        }]);
      }),
      engine.on('dragcancel', (event) => {
        setEvents(prev => [...prev.slice(-9), {
          type: 'dragcancel',
          timestamp: event.timestamp,
          position: event.position,
          sensor: 'MouseSensor'
        }]);
      })
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [engine]);

  return (
    <div style={{ 
      padding: '10px', 
      background: '#f5f5f5', 
      borderRadius: '4px', 
      marginBottom: '20px',
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <h3 style={{ margin: '0 0 10px 0' }}>传感器事件日志 (最近10条)</h3>
      <div style={{ height: '150px', overflow: 'auto' }}>
        {events.length === 0 ? (
          <div style={{ color: '#666' }}>等待拖拽事件...</div>
        ) : (
          events.map((event, index) => (
            <div key={index} style={{ 
              margin: '2px 0',
              color: event.type === 'dragstart' ? '#28a745' : 
                    event.type === 'dragend' ? '#dc3545' :
                    event.type === 'dragcancel' ? '#ffc107' : '#007bff'
            }}>
              [{new Date(event.timestamp).toLocaleTimeString()}] 
              {event.type} - ({event.position.x}, {event.position.y}) - {event.sensor}
            </div>
          ))
        )}
      </div>
      <button 
        onClick={() => setEvents([])}
        style={{ 
          marginTop: '10px', 
          padding: '4px 8px', 
          background: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '3px',
          cursor: 'pointer'
        }}
      >
        清空日志
      </button>
    </div>
  );
}

export function SensorTest() {
  const customMouseSensor = createMouseSensor({
    activationConstraint: {
      distance: 8, // 8px移动距离才激活
      tolerance: 3, // 3px容差
      delay: 100    // 100ms延迟
    }
  });

  return (
    <DragForgeProvider>
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>传感器系统测试</h1>
        
        <SensorDebugger />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div>
            <h2>拖拽元素</h2>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              MouseSensor配置：距离阈值8px，容差3px，延迟100ms
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <DragForgeable
                id="sensor-test-1"
                data={{ type: 'test', name: 'Test Item 1' }}
                style={{
                  padding: '15px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: 'grab',
                  userSelect: 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease'
                }}
              >
                🖱️ MouseSensor Test Item 1
                <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '5px' }}>
                  拖拽我测试MouseSensor
                </div>
              </DragForgeable>
              
              <DragForgeable
                id="sensor-test-2"
                data={{ type: 'test', name: 'Test Item 2' }}
                style={{
                  padding: '15px',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: 'grab',
                  userSelect: 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease'
                }}
              >
                🎯 MouseSensor Test Item 2
                <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '5px' }}>
                  测试拖拽阈值和边界情况
                </div>
              </DragForgeable>
              
              <div style={{
                padding: '15px',
                background: '#e9ecef',
                borderRadius: '8px',
                border: '2px dashed #adb5bd'
              }}>
                <div style={{ fontSize: '14px', color: '#495057' }}>
                  ℹ️ 传感器特性测试：
                </div>
                <ul style={{ fontSize: '12px', color: '#6c757d', margin: '8px 0 0 20px' }}>
                  <li>需要移动8px以上才开始拖拽</li>
                  <li>3px容差内不会误触发</li>
                  <li>100ms延迟防止快速点击</li>
                  <li>支持鼠标离开窗口的边界处理</li>
                  <li>自动阻止浏览器默认拖拽行为</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <h2>放置区域</h2>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              将左侧元素拖拽到这些区域，观察传感器事件日志
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <DragForgeDroppable
                id="sensor-drop-1"
                style={{
                  minHeight: '80px',
                  padding: '20px',
                  border: '2px dashed #28a745',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f8f9fa',
                  transition: 'all 0.2s ease'
                }}
              >
                📦 Drop Zone 1
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  主要放置区域
                </div>
              </DragForgeDroppable>
              
              <DragForgeDroppable
                id="sensor-drop-2"
                style={{
                  minHeight: '80px',
                  padding: '20px',
                  border: '2px dashed #dc3545',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f8f9fa',
                  transition: 'all 0.2s ease'
                }}
              >
                🎯 Drop Zone 2
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  次要放置区域
                </div>
              </DragForgeDroppable>
              
              <div style={{
                minHeight: '60px',
                padding: '15px',
                background: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#856404'
              }}>
                ⚠️ <strong>边界情况测试</strong><br/>
                拖拽过程中尝试：<br/>
                • 鼠标快速移出窗口<br/>
                • 按ESC键或失去窗口焦点<br/>
                • 右键点击
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ 
          marginTop: '40px', 
          padding: '20px', 
          background: '#e3f2fd',
          borderRadius: '8px',
          border: '1px solid #bbdefb'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>🔧 MouseSensor技术细节</h3>
          <div style={{ fontSize: '14px', color: '#424242' }}>
            <strong>实现特性：</strong>
            <ul style={{ margin: '8px 0 0 20px' }}>
              <li><strong>拖拽阈值：</strong>防止意外触发，支持距离和时间约束</li>
              <li><strong>边界处理：</strong>处理鼠标离开窗口、窗口失焦等边界情况</li>
              <li><strong>事件管理：</strong>自动绑定/解绑全局事件监听器</li>
              <li><strong>冲突避免：</strong>阻止浏览器默认拖拽、文本选择、右键菜单</li>
              <li><strong>性能优化：</strong>使用RAF节流、事件池管理</li>
              <li><strong>优先级系统：</strong>支持多传感器优先级管理</li>
            </ul>
          </div>
        </div>
      </div>
    </DragForgeProvider>
  );
}