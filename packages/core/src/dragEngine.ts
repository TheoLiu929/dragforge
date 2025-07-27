import { DragEngineOptions, DragEngineState, DraggableItem, DropTarget, Position } from './types';

export class DragEngine {
  private state: DragEngineState;
  private options: DragEngineOptions;

  constructor(options: DragEngineOptions = {}) {
    this.options = options;
    this.state = {
      draggableItems: new Map(),
      dropTargets: new Map(),
      dragState: {
        isDragging: false,
        draggedItem: null,
        position: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
      },
    };
  }

  registerDraggable(item: DraggableItem): void {
    this.state.draggableItems.set(item.id, item);
  }

  unregisterDraggable(id: string): void {
    this.state.draggableItems.delete(id);
  }

  registerDropTarget(target: DropTarget): void {
    this.state.dropTargets.set(target.id, target);
  }

  unregisterDropTarget(id: string): void {
    this.state.dropTargets.delete(id);
  }

  startDrag(itemId: string, initialPosition: Position): void {
    const item = this.state.draggableItems.get(itemId);
    if (!item) return;

    this.state.dragState = {
      isDragging: true,
      draggedItem: item,
      position: initialPosition,
      offset: { x: 0, y: 0 },
    };

    this.options.onDragStart?.(item);
  }

  updateDragPosition(position: Position): void {
    if (!this.state.dragState.isDragging) return;

    this.state.dragState.position = position;
    this.options.onDragMove?.(position);
  }

  endDrag(): void {
    if (!this.state.dragState.isDragging || !this.state.dragState.draggedItem) return;

    const target = this.findDropTarget(this.state.dragState.position);
    this.options.onDragEnd?.(this.state.dragState.draggedItem, target);

    this.resetDragState();
  }

  cancelDrag(): void {
    if (!this.state.dragState.isDragging) return;

    this.options.onDragCancel?.();
    this.resetDragState();
  }

  private findDropTarget(position: Position): DropTarget | null {
    // This is a placeholder implementation
    // In a real implementation, this would check collision with drop targets
    return null;
  }

  private resetDragState(): void {
    this.state.dragState = {
      isDragging: false,
      draggedItem: null,
      position: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
    };
  }

  getState(): DragEngineState {
    return this.state;
  }
}