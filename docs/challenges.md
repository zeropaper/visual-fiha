# Challenges

This page documents the main technical challenges faced during the development of this project, and how they were addressed. It is meant to provide context and insights for future contributors, and to highlight the key architectural decisions that were made to overcome these challenges.

## Custom Scripts

In order to allow users to create their own interactive visuals, we need to provide a way for them to write custom scripts that can interact with the layers, the inputs, and the rest of the system. This means implementing a scripting environment that is safe, performant, and easy to use.

## Performance

Perfomance is a critical aspect of our application, for the application to be useful it needs to apply changes on the layers and the data coming from the inputs (audio, MIDI, ...) with as little latency as possible, and without consuming too much memory or CPU resources.

Between the data sent as part of the `runtimedata` message, the state management in the Controls worker, the audio processing, and the rendering in the Display worker, we need to be careful about memory usage.

Everything in the system is designed to minimize latency, and keep a high frame rate in the display. Therefore, the system is message driven and spreads the computational load across multiple workers. This somewhat compares to a microservices architecture, where each worker is responsible for a specific domain (state management, rendering, transpilation), and they communicate via messages. This allows us to keep the UI responsive, and the rendering smooth, even when processing complex data or running user scripts.

### Buffers Solution

Because of the large ratio of message emition to actual data changes, we need to implement a buffering system for the `runtimedata` message. The buffers are located at several points in the system, and they are responsible for collecting the data changes and passing them to the next stage of the pipeline at a controlled rate. This allows us to avoid overwhelming the system with too many messages, and to keep the performance stable.

## Typescript Support

Because type annotations are particularly useful for users of the editor and because the scripting layer provides some special capabilities, providing support for TypeScript in the user scripts is therefore important. This means implementing a system for transpiling TypeScript code to JavaScript, and providing type definitions for the editor's API.

### ThreeJS Types

Three.js is a large library with complex types, and it took some effort to find a way to provide type definitions for the parts of the API that we expose to the user scripts, without including the entire library in the editor's type definitions. 

## Audio Analysis

The plain "line-in" and/or microphone audio input is trivial to implement using the Web Audio API, but providing useful audio analysis data (such as frequency data, beat detection, etc.) is more complex and especially providing that with multiple audio files that need to be controlled (play, pause, stop, seek, etc.) and analyzed independently is a challenge. 

## Persistence

The application is meant to work without a backend, which means that all the project data (layers, scripts, assets, etc.) needs to be stored locally in the browser API to read/write multiple files.
