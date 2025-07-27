import { Position } from '@dragforge/core';

export interface AnimationOptions {
  duration?: number;
  easing?: EasingFunction;
  delay?: number;
  onComplete?: () => void;
  onUpdate?: (progress: number) => void;
}

export type EasingFunction = (t: number) => number;

export interface SpringOptions {
  stiffness?: number;
  damping?: number;
  mass?: number;
  velocity?: number;
}

export interface Transition {
  from: Position;
  to: Position;
  duration: number;
  easing: EasingFunction;
}