import { Position } from '@dragforge/core';
import { Sensor, SensorOptions, SensorEvent } from './types';

export class TouchSensor implements Sensor {
  name = 'touch';
  private options: SensorOptions;
  private listeners: ((event: SensorEvent) => void)[] = [];

  constructor(options: SensorOptions = {}) {
    this.options = options;
  }

  activate(): void {
    document.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd);
    document.addEventListener('touchcancel', this.handleTouchCancel);
  }

  deactivate(): void {
    document.removeEventListener('touchstart', this.handleTouchStart);
    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);
    document.removeEventListener('touchcancel', this.handleTouchCancel);
  }

  onSensorEvent(listener: (event: SensorEvent) => void): void {
    this.listeners.push(listener);
  }

  private handleTouchStart = (e: TouchEvent): void => {
    if (e.touches.length !== 1) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const position: Position = { x: touch.clientX, y: touch.clientY };
    
    this.emit({
      type: 'start',
      position,
      nativeEvent: e,
    });
  };

  private handleTouchMove = (e: TouchEvent): void => {
    if (e.touches.length !== 1) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const position: Position = { x: touch.clientX, y: touch.clientY };
    
    this.emit({
      type: 'move',
      position,
      nativeEvent: e,
    });
  };

  private handleTouchEnd = (e: TouchEvent): void => {
    if (e.changedTouches.length !== 1) return;
    
    const touch = e.changedTouches[0];
    const position: Position = { x: touch.clientX, y: touch.clientY };
    
    this.emit({
      type: 'end',
      position,
      nativeEvent: e,
    });
  };

  private handleTouchCancel = (e: TouchEvent): void => {
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