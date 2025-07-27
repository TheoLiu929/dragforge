import { Position } from '@dragforge/core';

export interface Sensor {
  name: string;
  activate(): void;
  deactivate(): void;
}

export interface SensorOptions {
  activationConstraint?: ActivationConstraint;
  onActivation?: (event: Event) => void;
}

export interface ActivationConstraint {
  delay?: number;
  distance?: number;
  tolerance?: number;
}

export interface SensorEvent {
  type: 'start' | 'move' | 'end' | 'cancel';
  position: Position;
  nativeEvent: Event;
}