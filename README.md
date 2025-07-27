# Visual Fiha - Browser Version

The system is a browser-based creative coding platform designed to facilitate the creation of interactive visual experiences.
It allows users to create and manage projects using JavaScript, WebGL, CSS, and MIDI controllers.

The first version of Visual Fiha was created by [zeropaper](https://github.com/zeropaper) in 2014 as the W3C announced the MIDI API support in browsers.
It was a browser-based creative coding platform that allowed users to create interactive visual experiences using JavaScript, WebGL, CSS, and MIDI controllers.
In a later version, the project was rewritten to be a VS Code extension, which provided a more integrated development environment for users to create and manage their projects.
The extension version had some adavntages (like deeper integration with the editor) but some of the key features like latency of real time audio processing became unacceptably high, the MIDI support (not even implemented, would have suffered the same latency issue).

This third version of Visual Fiha is, again, a browser-based version of the system with some radical changes in the architecture.

> **Note**: The codebase has been recently reorganized for better maintainability. See the [migration guide](docs/migration-guide.md) for details about the structural changes.

## Architecture

See the [messaging architecture](docs/architecture/messaging.md) for a high-level overview of the messaging and worker architecture, and the [project structure](docs/project-structure.md) for detailed information about code organization.

### Scriptables

Scriptables are objects that have 2 code properties (and some methods):
- `setup`: Is a script called once when the scriptable is created. It is used to initialize the scriptable.
- `update`: Is a script that is called every frame. It is used to update the scriptable.

### Controls

The controls provide the user interface for interacting with and observing the different components (inputs, signals, layers, displays) of the Visual Fiha system. The controls are implemented as a React application with a modular feature-based architecture:

**Core Structure:**
- **Control Display**: A canvas-based visual representation of the current state
- **Script Editor**: Monaco Editor integration for editing setup and animation scripts
- **Layer Management**: Interface for creating, reordering, and configuring layers
- **Input Management**: Configuration and monitoring of input sources
- **Display Management**: Control and monitoring of connected display windows
- **Timeline**: Visual timeline interface (planned feature)
- **Console**: Output and debugging information
- **Graph view**: Visual representation of the data flow (planned feature)

**Architecture:**
- `src/controls/` - Main controls application structure
  - `ControlsApp.tsx` - Main application component
  - `Controls.worker.ts` - Web Worker for controls logic
  - `features/` - Feature-based component organization
  - `contexts/` - React contexts for state management
  - `hooks/` - Custom React hooks

#### Inputs

Inputs are the primary data sources for the Visual Fiha system.
They can be anything from MIDI controllers, microphone, audio line-in, key presses, absolute or relative time, mouse movements to web socket streams.
(#scriptables) charged of processing the data from inputs.

#### Layers

Layers are [scriptables](#scriptables) that render visual content. The system currently supports two types:
- **Canvas layers**: 2D graphics rendering using the Canvas 2D API
- **ThreeJS layers**: 3D graphics rendering using the Three.js library

Each layer has:
- **Setup script**: Executed once when the layer is created or modified
- **Animation script**: Executed every frame for real-time updates
- **Opacity control**: Adjustable transparency (0-100%)
- **Active state**: Can be enabled/disabled
- **Reordering**: Layers can be dragged to change render order

**Layer Management:**
- Located in `src/controls/features/Layers/`
- Individual layer implementations in `src/layers/Canvas2D/` and `src/layers/ThreeJS/`
- Layer scripts are transpiled in real-time using TypeScript



### Main Worker

The application state is managed in the Controls Worker (`src/controls/Controls.worker.ts`) and consists of:
- **inputs**: Configuration and state of input sources (MIDI, audio, time, etc.)
- **signals**: Array of signal processing objects (planned feature)
- **layers**: Array of visual layer objects with their scripts and configuration
- **displays**: Array of connected display windows and their properties
- **worker**: Global setup and animation scripts
- **data**: Runtime data from inputs and computed values

The Controls Worker is responsible for:
- Managing the overall application configuration
- Processing raw input data (MIDI, audio, time)
- Coordinating script transpilation via TypeScript worker
- Broadcasting runtime data to display workers
- Handling display registration and management

**Communication:**
- Uses BroadcastChannel API for cross-context messaging
- Communicates with main thread via standard Worker postMessage
- Coordinates with TypeScript transpiler worker for script compilation

### Displays

Displays are separate web pages that render the visual output of the Visual Fiha system. They can be opened in different windows, shown fullscreen, and positioned across multiple monitors.

**Display Architecture:**
- Each display runs in its own `Display.worker.ts` Web Worker
- Displays register themselves via BroadcastChannel when opened
- Real-time layer rendering with compositing and opacity control
- Independent canvas-based rendering pipeline

**Display Features:**
- **Multi-window support**: Each display can be positioned independently
- **Layer composition**: Renders layers in order with proper opacity blending
- **Real-time updates**: Receives live configuration and data updates
- **Worker isolation**: Each display worker runs independently for performance

**Implementation:**
- Main display logic in `src/display/Display.worker.ts`
- Display management in `src/display/Display.ts`
- State management via `src/display/displayState.ts`

When a display window is opened, it automatically registers with the system using the BroadcastChannel API, and the controls interface updates to show the new display in the management panel.