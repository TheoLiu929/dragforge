export interface Position {
  x: number;
  y: number;
}

export interface DragState {
  isDragging: boolean;
  draggedItem: DraggableItem | null;
  position: Position;
  offset: Position;
}

export interface DraggableItem {
  id: string;
  data?: any;
}

export interface DropTarget {
  id: string;
  data?: any;
}

export interface DragEngineOptions {
  onDragStart?: (item: DraggableItem) => void;
  onDragMove?: (position: Position) => void;
  onDragEnd?: (item: DraggableItem, target: DropTarget | null) => void;
  onDragCancel?: () => void;
}

export interface DragEngineState {
  draggableItems: Map<string, DraggableItem>;
  dropTargets: Map<string, DropTarget>;
  dragState: DragState;
}