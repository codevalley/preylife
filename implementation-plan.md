# Implementation Plan

This document outlines the development phases for the PreyLife ecosystem simulation project.

## Phase 1: Core Functionality
**Goal**: Create a functional simulation with basic predator-prey dynamics.

### Tasks:
- ✅ Set up Three.js rendering environment
- ✅ Implement basic entity classes (Resource, Prey, Predator)
- ✅ Create simple versions of all core systems:
  - ✅ Movement system with randomized behavior
  - ✅ Simple interaction system for resource consumption and predation
  - ✅ Basic energy system (gain/loss)
  - ✅ Reproduction with inheritance
- ✅ Implement time control system (play/pause)
- ✅ Basic visualization (simple shapes with color indicators)
- ✅ Simple UI with start/stop controls

### Deliverables:
- ✅ Working simulation with default attributes
- ✅ Basic Three.js scene with rendered entities
- ✅ Functional predator/prey/resource interactions
- ✅ Simple population monitoring

### Progress Notes:
- Completed initial project structure setup with Vite and TypeScript
- Implemented core entity hierarchy with abstraction
- Created basic genetic attributes for creatures
- Implemented movement, energy consumption, and reproduction mechanics
- Set up Three.js renderer with proper entity representation
- Added simple UI controls for simulation state
- Implemented core simulation engine with interaction handling

## Phase 2: Advanced Mechanics & Customization
**Goal**: Implement genetic attributes and customization options.

### Tasks:
- ✅ Enhance genetic attribute system:
  - ✅ Strength, Stealth, Energy Capacity fully implemented
  - ✅ Add Learnability and Longevity attributes
  - ✅ Basic mutation mechanics
- ✅ Implement learning/adaptation system
- ✅ Complete aging system with metabolic effects
- ✅ Basic mortality system (age and starvation)
- ✅ Advanced movement with sensory perception
- Add simulation parameter controls:
  - Initial population settings
  - Mutation rate adjustments
  - Energy cost configurations
- ✅ Add predator/prey interaction detection and capture formulas
- ✅ Add attribute tracking and visualization in dashboard

### Deliverables:
- ✅ Basic attribute system with inheritance
- ⏳ Configuration panel for simulation parameters (in progress)
- ✅ Observable evolution of traits over generations
- ⏳ Adjustable simulation settings (in progress)

### Progress Notes:
- Enhanced ecosystem balance to ensure both predator and prey can thrive:
  - Reduced predator energy consumption (now 2.5x vs prey's 0.7x)
  - Adjusted predator capture chance (10-50% range based on strength)
  - Implemented clustered spawning for more realistic ecosystems
  - Increased prey's food value from resources (20% bonus)
  - Completely reworked resource regeneration system to be more realistic
  - Enhanced prey resource detection based on stealth attribute
- Added clustered spawning system:
  - Resources spawn in 4 clusters across the environment
  - Prey spawn in 2-3 clusters with different attribute profiles
  - Predators spawn in 1-2 clusters with different attribute profiles
  - Each cluster has its own genetic attribute profile with individual variations
  - Provides more realistic evolution and ecosystem dynamics
- Added extinction event logging to track evolutionary trends
- Added "spawn" buttons to inject new prey (10) or predators (5) during simulation
- Implemented attribute tracking and display in dashboard
- Improved UI styling for better readability
- Created attribute effects that make each genetic trait useful:
  - Strength: Affects movement speed and capture/escape chance
  - Stealth: Affects detection (predator detecting prey, prey finding resources)
  - Energy Capacity: Determines maximum energy storage and reproduction timing
  - Learnability: Affects adaptation rate in social learning system
  - Longevity: Reduces metabolic costs and increases maximum lifespan
- Added color coding to the dashboard to distinguish between entity types
- Implemented advanced detection systems for predators where stealth directly affects hunting success
- Added aging system with metabolic efficiency declining over time (affected by longevity)
- Implemented learning system where creatures can learn from others based on learnability attribute

## Phase 3: Enhanced Visualization & Analytics
**Goal**: Improve UI elements and add detailed analytics.

### Tasks:
- ✅ Add hover and selection interactions for entities:
  - ✅ Tooltip on hover showing basic entity info
  - ✅ Detailed panel for selected entities showing all attributes
  - ✅ Real-time attribute tracking for selected entities
- ✅ Create configuration system for easy parameter adjustment
- Create comprehensive dashboard with:
  - Real-time population graphs
  - Attribute distribution histograms
  - Energy level visualizations
  - Death cause statistics
- Enhance visual representations:
  - Improved entity models based on attributes
  - Visual effects for interactions (hunting, consumption)
  - Age and attribute visualization enhancements
- Simulation speed controls
- Add camera controls for navigating 3D environment
- Optional: D3.js integration for advanced statistics

### Deliverables:
- ✅ Entity inspection system with hover tooltips and selection tracking
- ✅ Centralized configuration system for simulation parameters
- Polished UI with comprehensive analytics dashboard
- Enhanced visual representation of entities and attributes
- Multiple visualization modes
- Interactive camera and scene controls

### Progress Notes:
- Enhanced ecosystem balance with advanced mechanics:
  - Dual-purpose stealth system: now affects both detection AND escape chance
  - Prey can escape from predators after capture using stealth (10-70% chance)
  - Implemented seasonal resource generation (60 new resources every 30 days)
  - Resource blooms create resource clusters that spawn high-energy resources
  - Visual indicators for bloom periods in UI (glowing resource box)
  - Reduced background resource generation for more pronounced seasonal cycles
  - Predator energy consumption balanced (2.5x vs prey's 0.7x)
  - Predator capture chance adjusted (10-50% range based on strength)
  - Increased prey's food value from resources (20% bonus)

- Added detailed entity inspection system:
  - Tooltips appear when hovering over any entity showing basic info
  - Clicking an entity selects it for detailed tracking
  - Selected entities display real-time attribute updates in a detailed panel
  - Energy levels shown with colored progress bars
  - All genetic attributes visualized with progress bars

- Created comprehensive configuration system:
  - All simulation parameters moved to central config.ts file
  - Parameters organized by category (environment, creatures, resources, etc.)
  - Easy to tweak any aspect of simulation without code changes
  - Fully commented for clarity

- Implemented improved dashboard system:
  - Each simulation day represents 10 frames
  - Dashboard displays current day count and extinction events
  - Collapsible panels for organizing UI elements
  - Separate boxes for prey, predator, and resource counts
  - Each box shows both active and total spawned counts
  - Spawn buttons integrated directly into respective population boxes
  - Extinction history with timestamps for easier analysis
  - Resource bloom indicator with visual effects

## Phase 4: Persistence & Optimization
**Goal**: Add state persistence and optimize performance.

### Tasks:
- Implement storage manager:
  - Save/load simulation state to LocalStorage
  - Export/import configuration
  - Auto-save on tab close
- Performance optimizations:
  - Spatial partitioning for efficient entity interactions
  - Rendering optimizations for large populations
  - Worker threads for computation-heavy calculations
- Browser compatibility testing
- Optional feature additions:
  - Preset scenarios
  - Shareable configurations

### Deliverables:
- Fully persistent simulation state
- Optimized performance for larger simulations
- Ability to save and share interesting scenarios
- Stable performance across modern browsers

## Technical Dependencies
- Core: Three.js
- Optional: D3.js for statistics
- Storage: LocalStorage/IndexedDB
- Build System: Vite