import { Sensor } from './types';

export class MouseSensor implements Sensor {
  readonly name = 'MouseSensor';
  
  private element: HTMLElement | null = null;
  private isEnabled = true;

  setup(element: HTMLElement): void {
    this.element = element;
  }

  teardown(): void {
    this.element = null;
  }

  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
  }
}

export class TouchSensor implements Sensor {
  readonly name = 'TouchSensor';
  
  private element: HTMLElement | null = null;
  private isEnabled = true;

  setup(element: HTMLElement): void {
    this.element = element;
  }

  teardown(): void {
    this.element = null;
  }

  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
  }
}