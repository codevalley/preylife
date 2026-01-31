# Getting Started with PreyLife

This guide will help you get PreyLife running and understand the basics of the simulation.

## System Requirements

### Browser Support
- **Chrome** (recommended) - Version 90+
- **Firefox** - Version 88+
- **Safari** - Version 14+
- **Edge** - Version 90+

### Hardware Requirements
- WebGL-capable graphics (most modern computers)
- 4GB RAM minimum (8GB recommended for large populations)
- Any modern CPU

## Installation

### Prerequisites
- Node.js version 18 or higher
- npm (comes with Node.js)

### Steps

1. **Clone or download the repository**
   ```bash
   git clone https://github.com/codevalley/preylife.git
   cd preylife
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Production Build

To create an optimized production build:
```bash
npm run build
npm run preview  # Preview the build
```

## First Run

When PreyLife starts, you'll see:

1. **The Simulation Canvas** - The main area showing the ecosystem
2. **Dashboard Panel** (top-left) - Population statistics and day counter
3. **Control Buttons** (top-right) - Play/pause, reset, and settings

The simulation starts paused. Press **Space** or click the play button to begin.

## Basic Controls

### Keyboard

| Key | Action |
|-----|--------|
| `Space` | Toggle play/pause |
| `R` | Reset simulation to initial state |
| `H` | Toggle help panel |
| `S` | Toggle settings panel |

### Mouse

| Action | Effect |
|--------|--------|
| **Left Click** | Spawn a prey at that location |
| **Right Click** | Spawn a predator at that location |
| **Scroll Wheel** | Zoom in/out |
| **Click + Drag** | Pan the view |

## Understanding the Display

### Entity Types

| Entity | Appearance | Behavior |
|--------|------------|----------|
| **Prey** | Blue circles | Seek resources, avoid predators |
| **Predator** | Red pentagons | Hunt prey |
| **Resource** | Green squares | Static food sources |

### Dashboard Information

The dashboard shows real-time statistics:

- **Day** - Current simulation day (10 frames = 1 day)
- **Resources** - Number of food sources available
- **Prey** - Current prey population count
- **Predators** - Current predator population count
- **Attributes** - Average genetic traits for each species

### Color Meanings

Entity colors convey information about their traits:

**Prey Colors:**
- More **green** tint = Higher strength
- More **blue** tint = Higher stealth

**Predator Colors:**
- More **red** tint = Higher strength
- More **yellow** tint = Higher stealth

## Your First Experiment

Try this simple experiment to see evolution in action:

1. **Start the simulation** (press Space)
2. **Watch the initial dynamics** - Predators will hunt prey, prey will consume resources
3. **Observe trait changes** - Look at the average attributes in the dashboard
4. **Wait for seasonal blooms** - Every 90 days, a resource bloom occurs
5. **Notice extinctions** - Sometimes one species may go extinct temporarily

### What to Look For

- **Stealth evolution** in prey when predators dominate
- **Strength evolution** in predators when prey become evasive
- **Population cycles** - Classic predator-prey oscillations
- **Species conversion** - Rare evolutionary jumps between species

## Troubleshooting

### Simulation Not Starting

- Ensure you're using a supported browser
- Check that WebGL is enabled
- Try refreshing the page

### Poor Performance

- Reduce initial population in settings
- Close other browser tabs
- Try a different browser

### Blank Screen

- Check browser console for errors (F12)
- Ensure JavaScript is enabled
- Try clearing browser cache

## Next Steps

- Read the [Visual Guide](visual-guide.md) to understand all visual indicators
- Learn the [Mechanics](mechanics.md) behind the simulation
- Explore [Configuration](configuration.md) to customize parameters
- Try the [Experiments](experiments.md) for interesting scenarios
