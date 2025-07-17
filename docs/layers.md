# Layers

Layers are aimed at rendering visual content in the Visual Fiha system. 

## Controls

In the sidebar, layers can be tuned on or off, their opacity can be adjusted, and they can be reordered.

## Types of Layers

- [**Canvas layers**](#canvas-api): These are used to draw graphics onto a canvas element.
- [**ThreeJS layers**](#threejs-api): These are used to render 3D graphics using the Three.js library.

## Commnon API

All layers have a `setup` and `animation` scripts.  
All layer scripts have a set of global functions available to them, such as:
* `read`: A function to [read input values](#inputs) (e.g., MIDI, audio, time, etc.).
* Math utilities: `sin`, `cos`, `tan`, `sqrt`, `pow`, etc. These functions are the same as the JavaScript Math functions, but they are available globally without needing to call `Math.` prefix.