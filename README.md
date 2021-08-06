# Visual Fiha — Visual Studio Code Extension

[![Main](https://github.com/zeropaper/visual-fiha/actions/workflows/main.yml/badge.svg)](https://github.com/zeropaper/visual-fiha/actions/workflows/main.yml)

## Disclaimer

This is a personal project and it is highly exprimental and is not ready for production use.

## Description

The Visual Fiha extension for VS Code is the third version of an application
aimed to provide a live-coding VJing environment using web technologies.

![image](https://user-images.githubusercontent.com/65971/128530419-14828850-778d-427e-bd6f-221fed02fc46.png)

## Features

- Live coding
- Multi-display
- Audio analasys
- Custom, function based, 2D canvas rendering context API
- ThreeJS based 3D rendering
- Assets support

## Installation

TODO: Describe

## Project Tasks

https://github.com/zeropaper/visual-fiha/projects/2

## Key Concepts

### Display

A display is a web page that can is used to render.
Typically, this is the page that you want to show to your audience with a projector.

Tip: You can double-click the display to enter full screen mode.

### Layers

Like many other graphical softwares, Visual Fiha has a layer system that allows compositing of images.

### Scriptables

The live-coding uses scriptable context that have a `setup` and an `animation` scripts.  
The `setup` script allows to define initial `cache` and `data` values that can be then used by the `animation` script.

### Cache

Each scriptables have an object `cache` that can hold any values used for the scriptable instance scripts.  
You can read and write the cache values from the `setup` and `animation` scripts.

### Data

The `data` is an object that is serializable and shared between the worker scripts and the layers scripts.

You can define values in the `data` object by returning an object from the `setup` script.

### Worker

Each display spawns a worker that is responsible for rendering the layers and send back the result to the display thread.

### Capture

The capture page is aimed to react to different inputs (audio, MIDI, mouse, keyboard, touch, etc.)
and send back the result to the extension (that, in turn, broadcasted it to the display workers).

#### Audio

Note: In order for the audio capture to work properly, you should keep the capture page open in a separate window
that has no other tabs open.

### Webview - Control

Gives the VJ some controls over the layers and the project settings.

## Development

1. Clone the repository
2. Install the dependecies with `npm install`
3. Press the F5 key to start the VS Code extension development

## Structure

![structure](./structure.drawio.png)

## License

See [LICENSE](./LICENSE)
