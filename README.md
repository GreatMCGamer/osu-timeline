# osu! Timeline Visualizer

A JavaScript-based timeline visualization for osu! beatmaps with key press visualization.

## Project Structure

```
osu-timeline/
├── src/
│   ├── index.html          # Main HTML file
│   ├── main.js             # Main application entry point
│   ├── config.js           # Configuration settings
│   ├── state.js            # Global state management
│   ├── websocket.js        # WebSocket connection handling
│   ├── textures.js         # Texture loading and image handling
│   └── drawing.js          # Canvas drawing functions
├── osu-timeline.html       # Original monolithic file (for reference)
└── README.md               # This file
```

## Features

- Real-time beatmap timeline visualization
- Key press visualization with color-coded lanes
- Support for hit circles, sliders, and spinners
- Texture loading with fallback support
- Combo detection and miss tracking
- Timeline locking for synchronization
- Debug panel for development

## How to Use

1. Open `src/index.html` in a web browser
2. Ensure osu! is running with the osu!Direct plugin
3. The visualization will automatically connect to the game

## Development

The application is now modularized into separate files for:
- Configuration (`config.js`)
- State management (`state.js`)
- WebSocket connections (`websocket.js`)
- Texture handling (`textures.js`)
- Drawing functions (`drawing.js`)
- Main application logic (`main.js`)

This modular approach makes the code more maintainable and easier to extend.