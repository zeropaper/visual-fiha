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