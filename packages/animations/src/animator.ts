import { AnimationOptions, EasingFunction } from './types';
import { easeOutQuad } from './easing';

export class Animator {
  private animationId: number | null = null;
  private startTime: number | null = null;

  animate(options: AnimationOptions): void {
    const {
      duration = 300,
      easing = easeOutQuad,
      delay = 0,
      onUpdate,
      onComplete,
    } = options;

    const start = () => {
      this.startTime = performance.now();
      
      const update = (currentTime: number) => {
        if (!this.startTime) return;

        const elapsed = currentTime - this.startTime - delay;
        
        if (elapsed < 0) {
          this.animationId = requestAnimationFrame(update);
          return;
        }

        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);

        onUpdate?.(easedProgress);

        if (progress < 1) {
          this.animationId = requestAnimationFrame(update);
        } else {
          this.animationId = null;
          onComplete?.();
        }
      };

      this.animationId = requestAnimationFrame(update);
    };

    if (delay > 0) {
      setTimeout(start, delay);
    } else {
      start();
    }
  }

  cancel(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  isAnimating(): boolean {
    return this.animationId !== null;
  }
}