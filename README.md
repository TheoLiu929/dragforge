# DragForge

A customizable, modular drag-and-drop engine for modern web applications built with TypeScript and React.

## Overview

DragForge is a powerful and flexible drag-and-drop library designed for building complex, interactive user interfaces. It provides a modular architecture that allows you to use only the features you need while maintaining excellent performance and type safety.

## Features

- 🎯 **Modular Architecture**: Pick and choose only the modules you need
- 🚀 **Zero Dependencies**: Core module has no external dependencies
- 📱 **Multi-Platform**: Support for mouse, touch, and keyboard interactions
- ⚡ **Performance Focused**: Optimized algorithms and animations
- 🔧 **Fully Customizable**: Extensive configuration options
- 📦 **TypeScript First**: Built with TypeScript for excellent type safety

## Packages

- **@dragforge/core**: Core drag-and-drop engine with basic functionality
- **@dragforge/react**: React bindings and hooks for easy integration
- **@dragforge/sensors**: Advanced sensor system for various input methods
- **@dragforge/collision**: Collision detection algorithms
- **@dragforge/animations**: Smooth animation utilities

## Installation

```bash
# Install core package
pnpm add @dragforge/core

# Install React bindings (requires React 18+)
pnpm add @dragforge/react

# Install additional modules as needed
pnpm add @dragforge/sensors @dragforge/collision @dragforge/animations
```

## Quick Start

```tsx
import { useDraggable, useDroppable } from '@dragforge/react';

function DraggableItem() {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'draggable-1',
  });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      Drag me!
    </div>
  );
}

function DroppableArea() {
  const { setNodeRef, isOver } = useDroppable({
    id: 'droppable-1',
  });

  return (
    <div ref={setNodeRef} style={{ backgroundColor: isOver ? '#f0f0f0' : 'white' }}>
      Drop here!
    </div>
  );
}
```

## Development

This project uses pnpm workspaces for monorepo management.

### Prerequisites

- Node.js >= 16.0.0
- pnpm >= 8.0.0

### Setup

```bash
# Install dependencies
pnpm install

# Start development mode
pnpm dev

# Run tests
pnpm test

# Build all packages
pnpm build

# Format code
pnpm format

# Lint code
pnpm lint
```

### Project Structure

```
dragforge/
├── packages/
│   ├── core/        # Core engine
│   ├── react/       # React bindings
│   ├── sensors/     # Sensor system
│   ├── collision/   # Collision detection
│   └── animations/  # Animation utilities
├── example/         # Example application
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT © DragForge Team