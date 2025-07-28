// KeyboardSensor placeholder - will be implemented in future versions
import { Sensor, SensorOptions, SensorEventHandler } from './types';

export class KeyboardSensor implements Sensor {
  readonly name = 'KeyboardSensor';
  readonly priority = 50; // Lower than MouseSensor
  readonly options: SensorOptions = {};

  attach(element: HTMLElement, handler: SensorEventHandler): void {
    console.warn('KeyboardSensor is not implemented yet. Will be available in future versions.');
  }

  detach(): void {}
  enable(): void {}
  disable(): void {}
  isEnabled(): boolean { return false; }
  isActive(): boolean { return false; }
  canHandle(event: Event): boolean { return false; }
  destroy(): void {}
}