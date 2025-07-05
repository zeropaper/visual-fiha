# ThreeJS layer API

## Global objects

- `THREE`: The main Three.js namespace containing all classes and functions.
- `scene`: The main scene object where all objects are added.
- `camera`: The main camera object used for rendering the scene.
- `renderer`: The WebGL renderer used to render the scene.
- `read`: A function to [read input values](#inputs) (e.g., MIDI, audio, time, etc.).

## Usage

In your <kbd>animation</kbd> script, call the `renderer.render(scene, camera)` method, at the end of the script, to render the scene.


## Snippets

```ts
// add a cube to the scene
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
```
