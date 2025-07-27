import { SpringOptions } from './types';

export class Spring {
  private stiffness: number;
  private damping: number;
  private mass: number;
  private velocity: number;
  private current: number;
  private target: number;

  constructor(options: SpringOptions = {}) {
    this.stiffness = options.stiffness ?? 170;
    this.damping = options.damping ?? 26;
    this.mass = options.mass ?? 1;
    this.velocity = options.velocity ?? 0;
    this.current = 0;
    this.target = 0;
  }

  setTarget(target: number): void {
    this.target = target;
  }

  update(deltaTime: number): number {
    const spring = -this.stiffness * (this.current - this.target);
    const damper = -this.damping * this.velocity;
    const acceleration = (spring + damper) / this.mass;
    
    this.velocity += acceleration * deltaTime;
    this.current += this.velocity * deltaTime;

    return this.current;
  }

  isSettled(threshold: number = 0.01): boolean {
    const displacement = Math.abs(this.current - this.target);
    const speed = Math.abs(this.velocity);
    
    return displacement < threshold && speed < threshold;
  }

  reset(value: number = 0, velocity: number = 0): void {
    this.current = value;
    this.target = value;
    this.velocity = velocity;
  }
}

export class SpringSystem {
  private springs: Map<string, Spring> = new Map();
  private animationId: number | null = null;
  private lastTime: number | null = null;

  createSpring(id: string, options?: SpringOptions): Spring {
    const spring = new Spring(options);
    this.springs.set(id, spring);
    return spring;
  }

  removeSpring(id: string): void {
    this.springs.delete(id);
  }

  start(): void {
    if (this.animationId !== null) return;

    const update = (currentTime: number) => {
      if (this.lastTime === null) {
        this.lastTime = currentTime;
      }

      const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.064); // Cap at ~60fps
      this.lastTime = currentTime;

      let allSettled = true;

      this.springs.forEach(spring => {
        spring.update(deltaTime);
        if (!spring.isSettled()) {
          allSettled = false;
        }
      });

      if (!allSettled) {
        this.animationId = requestAnimationFrame(update);
      } else {
        this.stop();
      }
    };

    this.animationId = requestAnimationFrame(update);
  }

  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
      this.lastTime = null;
    }
  }
}