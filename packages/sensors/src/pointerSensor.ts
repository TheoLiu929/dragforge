import { Position } from '@dragforge/core';
import { Sensor, SensorOptions, SensorEvent } from './types';

export class PointerSensor implements Sensor {
  name = 'pointer';
  private options: SensorOptions;
  private listeners: ((event: SensorEvent) => void)[] = [];
  private pointerId: number | null = null;

  constructor(options: SensorOptions = {}) {
    this.options = options;
  }

  activate(): void {
    document.addEventListener('pointerdown', this.handlePointerDown);
    document.addEventListener('pointermove', this.handlePointerMove);
    document.addEventListener('pointerup', this.handlePointerUp);
    document.addEventListener('pointercancel', this.handlePointerCancel);
  }

  deactivate(): void {
    document.removeEventListener('pointerdown', this.handlePointerDown);
    document.removeEventListener('pointermove', this.handlePointerMove);
    document.removeEventListener('pointerup', this.handlePointerUp);
    document.removeEventListener('pointercancel', this.handlePointerCancel);
  }

  onSensorEvent(listener: (event: SensorEvent) => void): void {
    this.listeners.push(listener);
  }

  private handlePointerDown = (e: PointerEvent): void => {
    if (this.pointerId !== null) return;
    
    this.pointerId = e.pointerId;
    const position: Position = { x: e.clientX, y: e.clientY };
    
    this.emit({
      type: 'start',
      position,
      nativeEvent: e,
    });
  };

  private handlePointerMove = (e: PointerEvent): void => {
    if (e.pointerId !== this.pointerId) return;
    
    const position: Position = { x: e.clientX, y: e.clientY };
    
    this.emit({
      type: 'move',
      position,
      nativeEvent: e,
    });
  };

  private handlePointerUp = (e: PointerEvent): void => {
    if (e.pointerId !== this.pointerId) return;
    
    const position: Position = { x: e.clientX, y: e.clientY };
    this.pointerId = null;
    
    this.emit({
      type: 'end',
      position,
      nativeEvent: e,
    });
  };

  private handlePointerCancel = (e: PointerEvent): void => {
    if (e.pointerId !== this.pointerId) return;
    
    this.pointerId = null;
    
    this.emit({
      type: 'cancel',
      position: { x: 0, y: 0 },
      nativeEvent: e,
    });
  };

  private emit(event: SensorEvent): void {
    this.listeners.forEach(listener => listener(event));
  }
}