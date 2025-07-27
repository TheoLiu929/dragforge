import { Sensor, SensorOptions } from './types';

export class KeyboardSensor implements Sensor {
  name = 'keyboard';
  private options: SensorOptions;
  private activeElement: HTMLElement | null = null;

  constructor(options: SensorOptions = {}) {
    this.options = options;
  }

  activate(): void {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  deactivate(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === ' ' || e.key === 'Enter') {
      const target = e.target as HTMLElement;
      if (target.hasAttribute('data-draggable-id')) {
        e.preventDefault();
        this.activeElement = target;
        this.options.onActivation?.(e);
      }
    }
  };
}