// Re-export from @dragforge/sensors for backward compatibility
export { 
  BaseSensor,
  MouseSensor,
  SensorManager,
  createMouseSensor,
  createSensorManager,
  type MouseSensorOptions,
  type SensorManagerOptions,
  type SensorOptions,
  type SensorEvent,
  type SensorEventHandler,
  type Sensor
} from '@dragforge/sensors';

// Legacy TouchSensor placeholder (will be implemented in future versions)
import { Sensor, SensorOptions, SensorEventHandler } from '@dragforge/sensors';

export class TouchSensor implements Sensor {
  readonly name = 'TouchSensor';
  readonly priority = 90; // Lower than MouseSensor
  readonly options: SensorOptions = {};

  attach(element: HTMLElement, handler: SensorEventHandler): void {
    console.warn('TouchSensor is not implemented yet. Will be available in future versions.');
  }

  detach(): void {}
  enable(): void {}
  disable(): void {}
  isEnabled(): boolean { return false; }
  isActive(): boolean { return false; }
  canHandle(event: Event): boolean { return false; }
  destroy(): void {}
}