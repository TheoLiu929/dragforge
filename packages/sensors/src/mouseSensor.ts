import { Position } from '@dragforge/core';
import { Sensor, SensorOptions, SensorEvent } from './types';

export class MouseSensor implements Sensor {
  name = 'mouse';
  private options: SensorOptions;
  private listeners: ((event: SensorEvent) => void)[] = [];

  constructor(options: SensorOptions = {}) {
    this.options = options;
  }

  activate(): void {
    document.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  deactivate(): void {
    document.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  onSensorEvent(listener: (event: SensorEvent) => void): void {
    this.listeners.push(listener);
  }

  private handleMouseDown = (e: MouseEvent): void => {
    const position: Position = { x: e.clientX, y: e.clientY };
    this.emit({
      type: 'start',
      position,
      nativeEvent: e,
    });
  };

  private handleMouseMove = (e: MouseEvent): void => {
    const position: Position = { x: e.clientX, y: e.clientY };
    this.emit({
      type: 'move',
      position,
      nativeEvent: e,
    });
  };

  private handleMouseUp = (e: MouseEvent): void => {
    const position: Position = { x: e.clientX, y: e.clientY };
    this.emit({
      type: 'end',
      position,
      nativeEvent: e,
    });
  };

  private emit(event: SensorEvent): void {
    this.listeners.forEach(listener => listener(event));
  }
}