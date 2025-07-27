import { Position } from '@dragforge/core';
import { Transition, AnimationOptions } from './types';
import { Animator } from './animator';
import { easeOutQuad } from './easing';

export function createTransition(
  from: Position,
  to: Position,
  options: AnimationOptions = {}
): Transition {
  return {
    from,
    to,
    duration: options.duration ?? 300,
    easing: options.easing ?? easeOutQuad,
  };
}

export function interpolatePosition(
  from: Position,
  to: Position,
  progress: number
): Position {
  return {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress,
  };
}

export class TransitionManager {
  private animator: Animator;
  private activeTransitions: Map<string, Transition> = new Map();

  constructor() {
    this.animator = new Animator();
  }

  startTransition(
    id: string,
    from: Position,
    to: Position,
    options: AnimationOptions & { onPositionUpdate?: (position: Position) => void } = {}
  ): void {
    const transition = createTransition(from, to, options);
    this.activeTransitions.set(id, transition);

    const { onPositionUpdate, ...animationOptions } = options;

    this.animator.animate({
      ...animationOptions,
      onUpdate: (progress) => {
        const position = interpolatePosition(from, to, progress);
        onPositionUpdate?.(position);
        options.onUpdate?.(progress);
      },
      onComplete: () => {
        this.activeTransitions.delete(id);
        options.onComplete?.();
      },
    });
  }

  cancelTransition(id: string): void {
    this.activeTransitions.delete(id);
    if (this.activeTransitions.size === 0) {
      this.animator.cancel();
    }
  }

  cancelAll(): void {
    this.activeTransitions.clear();
    this.animator.cancel();
  }

  isTransitioning(id?: string): boolean {
    if (id) {
      return this.activeTransitions.has(id);
    }
    return this.activeTransitions.size > 0;
  }
}