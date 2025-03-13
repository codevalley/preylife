# CLAUDE.md - Project Guidelines

## Project Overview
PreyLife: A browser-based 3D predator-prey ecosystem simulation with evolutionary mechanics using Three.js.

## Build Commands
```
npm run dev        # Start development server
npm run build      # Production build
npm run lint       # Run ESLint
npm run test       # Run all tests
npm run test:unit  # Run unit tests only
```

## Code Style Guidelines
- **Formatting**: Use Prettier with default config
- **Language**: TypeScript with strict type checking
- **Component Style**: Follow Model-View-Controller pattern
- **Naming**:
  - camelCase for variables and functions
  - PascalCase for classes and components
  - UPPER_SNAKE_CASE for constants
- **Imports**: Group imports by external libraries, then internal modules
- **Error Handling**: Use typed errors, avoid generic catch blocks
- **Documentation**: JSDoc comments for public APIs and complex functions
- **State Management**: Event-based communication between components
- **Testing**: Unit tests for core simulation logic, component tests for UI

## File Organization
- src/
  - engine/      # Simulation core
  - entities/    # Entity definitions
  - systems/     # Behavioral systems
  - rendering/   # Three.js visualization
  - ui/          # Control interface
  - utils/       # Helpers and utility functions