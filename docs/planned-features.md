# Planned Features

## Scripts

- Surface, in the controls, errors occuring in display scripts.
- Add (where possible) typings for `read` default value and result.

## Layers

- Blending modes for layers.
- Allow reading layer BitmapData in scripts (e.g., `read('layers.layerID.bitmapData')`, `read('layers.layerID.width')` and `read('layers.layerID.height')`).

## Assets

- Add a generic `load('https://example.com/image.png')` or `load('/path/to/asset.gltf')` method to load assets in scripts.
- Add a generic `read('assets.assetID')` method to read preloaded assets in scripts.

## BPM

- Persisting BPM information in the setup configuration.
- Set a BPM counting start time.

## Persistence

- Allow saving, loading and sharing setups.

## AI Assistant

- Improve error handling and suggestions.
- Allow user-defined functions and scripts.

## Editor

- Multi-user collaborative editing.

## Displays

- Mapping setup to use several displays to be projected on complex surfaces.

## Inputs

- Add WebRTC support for real-time distributed input (from smartphone gestures, orientation, motion, etc.).

## Timeline

- Allow zooming in the timeline.
- Allow adding and removing keyframes in the timeline.
- Allow tracking of input values in the timeline.