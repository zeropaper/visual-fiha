# Visual Fiha - Browser Version

The system is a browser-based creative coding platform designed to facilitate the creation of interactive visual experiences.
It allows users to create and manage projects using JavaScript, WebGL, CSS, and MIDI controllers.

The first version of Visual Fiha was created by [zeropaper](https://github.com/zeropaper) in 2014 as the W3C announced the MIDI API support in browsers.
It was a browser-based creative coding platform that allowed users to create interactive visual experiences using JavaScript, WebGL, CSS, and MIDI controllers.
In a later version, the project was rewritten to be a VS Code extension, which provided a more integrated development environment for users to create and manage their projects.
The extension version had some adavntages (like deeper integration with the editor) but some of the key features like latency of real time audio processing became unacceptably high, the MIDI support (not even implemented, would have suffered the same latency issue).

This third version of Visual Fiha is, again, a browser-based version of the system with some radical changes in the architecture.

## Architecture

### Scriptables

Scriptables are objects that have 2 code properties (and some methods):
- `setup`: Is a script called once when the scriptable is created. It is used to initialize the scriptable.
- `update`: Is a script that is called every frame. It is used to update the scriptable.

### Controls

The controls give the user the ability to interact with and observe the different components (inputs, signals, layers, displays) of the Visual Fiha system.
They consists of
- a control display (canvas#control-display)
- a list of inputs (ul#inputs)
- a list of signals (ul#signals)
- a list of layers (ul#layers)
- a list of displays (ul#displays)
- a timeline (canvas#timeline)
- a console (div#console)
- a graph view of the inputs, signals and layers (div#graph-view)

#### Inputs

Inputs are the primary data sources for the Visual Fiha system.
They can be anything from MIDI controllers, microphone, audio line-in, key presses, absolute or relative time, mouse movements to web socket streams.

#### Signals

Signals are [scriptables](#scriptables) charged of processing the data from inputs.

#### Layers

Like signals, layers are also [scriptables](#scriptables) and come (for now) in two types:
- **Canvas layers**: These are used to draw graphics onto a canvas element.
- **ThreeJS layers**: These are used to render 3D graphics using the Three.js library.

#### Graph view

The graph view is a visual representation of the inputs, signals, and layers in the system.

### Main Worker

The state of the application is managed in the main web worker and consists of the following information:
- **inputs**: A object that describes the inputs available in the system and their configuration.
- **signals**: An array of signal objects that are currently available in the system and their configuration.
- **layers**: An array of layer objects that are currently available in the system and their configuration.
- **displays**: An array of display objects that are currently available in the system and their configuration.
- **data**: An object that contains the signal generated values.

The main worker is responsible for:
- Managing the configuration of the application.
- Handling the raw data from the inputs.
- Processing the data through the signals.

### Displays

Displays are the visual output of the Visual Fiha system.
They are separated web pages that can be opened in different windows (and shown in fullscreen) on different monitors or projects.
They render the different layers the project.

When opening a "display" page, it will register itself at the web worker using the [Broadcast Channel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API) and the controls will update the display list accordingly.