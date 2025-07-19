# Layers

Layers are aimed at rendering visual content in the Visual Fiha system. 

## Controls

In the sidebar, layers can be tuned on or off, their opacity can be adjusted, and they can be reordered.

## Types of Layers

- [**Canvas layers**](#canvas-api): These are used to draw graphics onto a canvas element.
- [**ThreeJS layers**](#threejs-api): These are used to render 3D graphics using the Three.js library.

## Commnon API

All layers have a `setup` and `animation` scripts.  
The `setup` script is run once when it is modified, and the `animation` script is run on every frame.  
It is possible to pass data from the `setup` script to the `animation` script using the `cache` object (available globally).
All layer scripts have a set of global functions available to them, such as:
* `read`: A function to [read input values](#inputs) (e.g., MIDI, audio, time, etc.).
* Math utilities: `sin`, `cos`, `tan`, `sqrt`, `pow`, etc. These functions are the same as the JavaScript Math functions, but they are available globally without needing to call `Math.` prefix.

### The `cache` Global Object

The `cache` object is a global object that can be used to store data between the `setup` and `animation` scripts.  
It is useful for storing data that needs to be accessed in the `animation` script after it has been set in the `setup` script.  
For example, you can store a value in the `setup` script like this:

```js
cache.myValue = 42;
```
And then access it in the `animation` script like this:
```js
const myValue = cache.myValue;
```