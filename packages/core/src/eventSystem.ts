import { DragEvent, DragEventListener } from './types';

export class EventEmitter {
  private listeners: Map<string, Set<DragEventListener>> = new Map();

  on(eventType: string, listener: DragEventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)!.add(listener);
    
    // 返回取消订阅函数
    return () => {
      this.off(eventType, listener);
    };
  }

  off(eventType: string, listener: DragEventListener): void {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  emit(event: DragEvent): void {
    const eventListeners = this.listeners.get(event.type);
    if (eventListeners) {
      for (const listener of eventListeners) {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in drag event listener:', error);
        }
      }
    }
  }

  removeAllListeners(eventType?: string): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }

  getListenerCount(eventType: string): number {
    return this.listeners.get(eventType)?.size ?? 0;
  }
}