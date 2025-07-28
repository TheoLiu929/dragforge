// PointerSensor placeholder - will be implemented in future versions
import { Sensor, SensorOptions, SensorEventHandler } from './types';

export class PointerSensor implements Sensor {
  readonly name = 'PointerSensor';
  readonly priority = 80; // Between Mouse and Touch
  readonly options: SensorOptions = {};

  attach(element: HTMLElement, handler: SensorEventHandler): void {
    console.warn('PointerSensor is not implemented yet. Will be available in future versions.');
  }

  detach(): void {}
  enable(): void {}
  disable(): void {}
  isEnabled(): boolean { return false; }
  isActive(): boolean { return false; }
  canHandle(event: Event): boolean { return false; }
  destroy(): void {}
}