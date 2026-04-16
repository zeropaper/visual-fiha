# Initialization and Message Flows

This document traces the complete initialization sequence and runtime message flows in Visual Fiha, including how the main thread, workers, and display windows communicate.

## Application Startup Sequence

### Phase 1: React Initialization (Main Thread)

```
[main.tsx] Starting React app initialization
  ↓
[ControlsApp] Initializing controls application
[ControlsApp] Current script loaded: {id: "", role: "animation", type: ""}
  ↓
React app mounted to DOM
```

**Key Points:**
- React loads from `src/controls/main.tsx` and mounts the ControlsApp component
- The current script is loaded from localStorage (defaults to empty)
- The ControlsApp component loads all feature components and sets up context providers

### Phase 2: Controls Worker Spawning

When ControlsApp initializes its context (AppFastContextProvider), it spawns the Controls Worker:

```
[controls] worker terminated (if previous instance exists)
  ↓
[Controls.worker] Worker starting up
[Controls.worker] BroadcastChannel 'core' created
  ↓
Worker ready for messages
```

**Key Points:**
- The Controls Worker runs in `src/controls/Controls.worker.ts`
- It creates a BroadcastChannel named "core" for communication with other workers and windows
- Default app state and runtime data are initialized in the worker

### Phase 3: Inputs Initialization

Immediately after the Controls Worker starts, the Inputs feature sends initial data:

```
[controls-worker] Inputs data received: {time, audio, midi, ...}
  ↓
[timeline] BPM changed to 120
```

**Key Points:**
- Inputs are aggregated from multiple sources (microphone, audio files, MIDI, time)
- The `inputsdata` message is sent every frame from the Inputs component
- Throttled logging (every 5 seconds) to avoid console spam

### Phase 4: Configuration Initialization

After inputs are set, the app sends the full configuration:

```
[controls-worker] init complete: {layers, displayWindows, ...}
[controls] initialized
```

**Key Points:**
- The init handler in Controls.worker.ts:
  1. Receives the full AppState
  2. Transpiles all layer setup and animation scripts via the transpiler worker
  3. Resets runtime data
  4. Broadcasts runtimedata to all display windows
- The worker is now ready for layer operations and playback commands

### Phase 5: Display Worker Initialization

When a display window is needed, a Display Worker is spawned:

```
[Display.worker] Worker starting up
[Display.worker] BroadcastChannel 'core' created
[Display.worker] Setting up communication
  ↓
[Display.worker] BroadcastChannel listener attached
[Display.worker] Worker message listener attached
  ↓
[Display.worker] Starting scriptable setup
[Display.worker] Scriptable setup complete, starting render loop
```

**Key Points:**
- Display workers run in `src/display/Display.worker.ts`
- Each display window has its own worker with a unique name (e.g., "display-main")
- Two communication channels are set up:
  - BroadcastChannel ("core") for cross-worker communication
  - Worker messages from the main thread
- The scriptable (worker setup code) executes once before the render loop starts

### Phase 6: Display Canvas Setup & Registration

Once the Display Worker is ready, the main thread sends an OffscreenCanvas:

```
[display-worker] Received offscreencanvas
  ↓
registerDisplay() sends:
  {type: "registerdisplay", payload: {id: "display-main", width: 600, height: 400}}
```

**Key Points:**
- The OffscreenCanvas is transferred (zero-copy) to the worker
- The worker registers itself with the Controls Worker via BroadcastChannel
- Registration includes the display's dimensions

### Phase 7: Layer Processing

After registration, the Controls Worker broadcasts layers to the display:

```
[display-worker] registerdisplaycallback received {id: "display-main"}
[display-worker] Processing layers for this display
  ↓
For each layer in the config:
  - Create Canvas2DLayer or ThreeJSLayer instance
  - Bind event handlers (compilation/execution errors)
  - Execute setup script
  - Resize to match display dimensions
```

**Key Points:**
- Layers are instantiated in the display worker, not the main thread
- Each layer maintains its own canvas for rendering
- Setup scripts execute once per layer in the display worker context

### Phase 8: Render Loop Starts

Once layers are ready:

```
requestAnimationFrame(() => {
  Object.assign(displayState, scriptable.execAnimation() || {})
  renderLayers()
  context.drawImage(layer.canvas, ...) // Composite all layers
  ctx.drawImage(canvas, ...) // Transfer to OffscreenCanvas
  requestAnimationFrame(() => render())
})
```

**Key Points:**
- The render loop runs in the Display Worker
- Each frame:
  1. Executes the worker's animation script
  2. For each active layer: executes animation and composites to main canvas
  3. Transfers the final canvas to the OffscreenCanvas
  4. Schedules the next frame

---

## Runtime Message Flows

### Playback Control Flow

When the user clicks the Play button in the timeline:

```
[Timeline Component] User clicks Play
  ↓
Controls Context updates: isRunning = true
  ↓
[controls-worker] Starting animation/playback
  ├─ runtimeData.time.isRunning = true
  ├─ runtimeData.time.started = Date.now()
  └─ runtimeData.bpm.isRunning = true
  ↓
broadcastRuntimeData() sends:
  {type: "runtimedata", payload: {time, bpm, layers, audio, midi, ...}}
  ↓
[Display.worker] runtimedata handler
  └─ Object.assign(data, payload)
  ↓
Each layer's animation script can access runtime data via `read()` function
```

**Message Flow Diagram:**
```
Timeline (UI)
    ↓ (click: play)
Controls Context
    ↓ (post: "start")
Controls.worker
    ├─ update state
    └─ broadcastChannel.postMessage("runtimedata", ...)
        ↓
    Display.worker(s)
        ├─ update local data
        └─ render next frame with updated values
```

### Pause/Resume Flow

Similar to play but with different state updates:

```
User clicks Pause
  ↓
[controls-worker] Pausing animation/playback
  ├─ runtimeData.time.isRunning = false
  ├─ runtimeData.bpm.isRunning = false
  ├─ Playing all audio sources (stop)
  └─ broadcastRuntimeData()
  ↓
Resume maintains elapsed time:
  ├─ runtimeData.time.started = Date.now() - runtimeData.time.elapsed
  ├─ runtimeData.time.isRunning = true
  └─ runtimeData.bpm.started = Date.now() - runtimeData.bpm.elapsed
```

### Layer Configuration Update

When user modifies a layer (changes type, opacity, active state, or script):

```
[Layers Feature] User modifies layer config
  ↓
Controls Context updates: appState.layers
  ↓
[controls-worker] updateconfig handler:
  ├─ appState = {..., ...payload}
  ├─ runtimeData.layers = [...] (sync layer states)
  └─ broadcastChannel.postMessage({type: "updateconfig", payload: appState})
  ↓
[Display.worker] updateconfig handler:
  ├─ processLayers(update.layers)
  │  ├─ For new layers: instantiate Canvas2DLayer or ThreeJSLayer
  │  ├─ For existing layers: update active/opacity properties
  │  └─ execSetup() for modified layers
  ├─ Sort state.layers to match config order
  └─ Ready to render next frame with updated config
```

**Key Points:**
- Layer configuration changes are atomic (all displays updated together)
- Layer instantiation happens in the Display Worker (not main thread)
- Setup scripts re-execute if the script code changes

### Input Data Streaming

Inputs (MIDI, audio, keyboard, microphone) are continuously collected and broadcast:

```
[Inputs Component] Collects data from:
  ├─ MIDI listeners
  ├─ Microphone analyzer
  ├─ Audio file analysis
  ├─ Keyboard events
  ├─ Mouse events
  └─ Time calculations
  ↓
useWriteInputValues() hook aggregates all inputs
  ↓
Controls Context updates: inputsdata
  ↓
[controls-worker] inputsdata handler:
  ├─ runtimeData = {...runtimeData, ...payload}
  └─ Logged every 5 seconds to console (not every frame)
  ↓
broadcastRuntimeData() includes inputs in next broadcast
  ↓
Display.worker can read current input state via:
  ├─ read.midi (MIDI messages)
  ├─ read.audio (audio analysis data)
  ├─ read.keyboard (key states)
  └─ read.mouse (mouse position/buttons)
```

**Frequency:**
- Input collection: Every frame (requestAnimationFrame)
- Input broadcasts to workers: High frequency, debounced
- Console logging: Every 5 seconds

### Error Handling Flow

When a script compilation or execution error occurs in a display:

```
[Layer Scriptable] Compilation error detected
  ↓
onCompilationError handler:
  ├─ Capture error details (line, column, message)
  ├─ Create event: {..., workerName: "display-main"}
  └─ broadcastChannelCom.post("compilationerror", event)
  ↓
[Controls.worker] Receives compilationerror via BroadcastChannel
  ├─ Update appState.errors = [...]
  └─ Notify UI context
  ↓
[UI] Displays error in editor or error panel
```

**Error Types:**
- Compilation errors: TypeScript transpilation failures
- Execution errors: Runtime errors in setup/animation scripts
- Success events: Successful compilations (logged separately)

### Display Resizing Flow

When a display window is resized:

```
[Display Window] User resizes window
  ↓
Display.onresize event
  ↓
Main thread sends:
  {type: "resize", payload: {width: 1200, height: 800}}
  ↓
[Display.worker] resize handler:
  ├─ canvas.width = width
  ├─ canvas.height = height
  ├─ For each layer: resizeLayer()
  │  ├─ layer.width = canvas.width
  │  ├─ layer.height = canvas.height
  │  └─ layer.execSetup() (recalculate setup with new dimensions)
  └─ If not control window: 
       broadcastChannel.postMessage({type: "resizedisplay", ...})
  ↓
[Controls.worker] Updates stage config
```

**Key Points:**
- Only display windows trigger resize messages (not the control window)
- Layer setup scripts re-execute on resize (allowing responsive layouts)
- BroadcastChannel coordinates resizing across multiple displays

### Display Registration Callback

After the Controls Worker broadcasts updateconfig, it waits for displays to register:

```
[Controls.worker] Broadcasts updateconfig
  ↓
[Display.worker] Receives updateconfig
  ├─ Processes layers
  └─ Waits for registration callback
  ↓
[Controls.worker] Sends registerdisplaycallback
  {type: "registerdisplaycallback", payload: {id: "display-main"}}
  ↓
[Display.worker] registerdisplaycallback handler:
  ├─ Check if id matches this worker
  └─ processLayers(data.layers) (initialize layers if not done)
```

**Key Points:**
- Ensures all displays receive layer updates before rendering
- Prevents race conditions during config changes
- Callback data can trigger additional initialization if needed

---

## Communication Architecture

### BroadcastChannel ("core")

The primary inter-worker communication channel. All workers and the main thread listen on this channel.

**Messages:**
- `updateconfig`: New AppState from Controls Worker
- `runtimedata`: Current RuntimeData (time, inputs, audio, etc.)
- `registerdisplay`: Display window announces its existence
- `resizedisplay`: Display window reports resize
- `compilationerror`, `compilationsuccess`: Layer script compilation events
- `executionerror`: Layer script execution errors
- `registerdisplaycallback`: Controls Worker confirms display registration
- `clearAssetsCache`: Clears cached assets in all workers

### Worker Messages (postMessage)

Direct communication from main thread to individual workers.

**Controls Worker messages:**
- `offscreencanvas`: Sends the canvas to render to
- Any message matching a handler in the handlers object

**Display Worker messages:**
- `offscreencanvas`: Receives the canvas for rendering
- `resize`: Window resize event
- Other handler messages

### Message Type System

All messages follow the ComEventData structure from `src/utils/com.ts`:

```typescript
interface ComEventData {
  type: string
  payload?: any
  meta?: {
    source: string          // "controls-worker", "display-main", etc.
    sent: number            // Timestamp when message was sent
    operationId?: string    // For async request/response
    error?: string          // If this is an error response
  }
}
```

### Async Request/Response Pattern

For messages expecting a response, the system uses operationId:

```
Sender posts with: meta: {operationId: "123-controls-worker-456"}
  ↓
Handler processes and calls post("message-response", result, {operationId: "123-..."})
  ↓
Original sender's Promise resolves with result
```

**Used for:**
- Script compilation responses
- Screenshot/canvas export operations
- Asset loading

---

## Performance Considerations

### High-Frequency Messages

Several messages occur every frame (~60Hz):

1. **runtimedata**: Broadcast every frame with current time/inputs
   - Includes: time, bpm, audio analysis, midi state, input values
   - Display Workers constantly read from this data

2. **Render loop**: RequestAnimationFrame execution
   - Layer animation scripts execute
   - Canvas composite and transfer

### Optimization Strategies

1. **Input Throttling**: inputsdata logging is throttled to every 5 seconds
2. **Layer-specific rendering**: Only active layers execute animation scripts
3. **OffscreenCanvas transfer**: Zero-copy canvas transfer between workers
4. **Broadcast instead of individual messages**: One broadcast reaches all displays
5. **Scriptable debouncing**: Script updates are debounced during editing

### Potential Bottlenecks

1. **TypeScript transpilation**: Happens synchronously per layer (could be parallel)
2. **Layer setup on config change**: All layers re-execute setup (even unchanged ones)
3. **BroadcastChannel latency**: No guarantee of message delivery order if many displays

---

## State Management

### Controls Worker State

**appState** (AppState):
- Configuration of the entire application
- Immutable from Controls Worker perspective (updated via updateconfig messages)
- Sent to Display Workers via BroadcastChannel

**runtimeData** (RuntimeData):
- Current time, BPM, input values, audio analysis
- Updated continuously from Inputs and playback controls
- Broadcast to all workers every frame

### Display Worker State

**state** (DisplayState):
- Local copy of relevant AppState and RuntimeData
- Layer instances (Canvas2DLayer, ThreeJSLayer)
- Canvas rendering context
- Scriptable instance for worker scripts

**data** (RuntimeData):
- Copy of latest runtimedata from Controls Worker
- Read by layer animation scripts via read() function

### Synchronization

1. Controls Worker is the source of truth for AppState
2. RuntimeData is continuously broadcast (eventual consistency)
3. Display Workers apply updates in received order
4. Each worker can replay by receiving a full AppState

---

## Error Handling

### Compilation Errors

```
TypeScript transpilation failure
  ↓
onCompilationError event
  ↓
broadcastChannelCom.post("compilationerror", event)
  ↓
Controls.worker updates appState.errors
  ↓
UI displays in editor error panel
```

### Execution Errors

```
Layer script throws error during execAnimation()
  ↓
Caught by Scriptable error handler
  ↓
broadcastChannelCom.post("executionerror", event)
  ↓
Controls.worker logs error
  ↓
Layer's animation is skipped for that frame, next frame continues
```

### Worker Crashes

If a Display Worker crashes, the main thread must:
1. Detect the crash (message timeout or error event)
2. Spawn a new Display Worker
3. Resend the latest appState and runtimedata

Currently, there's no automatic recovery - manual page reload required.

---

## Debugging Tips

### Console Output Structure

All logs are prefixed with context:
- `[main.tsx]`: Main thread initialization
- `[ControlsApp]`: React component lifecycle
- `[Controls.worker]`: Controls Worker state management
- `[controls-worker]`: Message handlers in Controls Worker
- `[Display.worker]`: Display Worker initialization
- `[display-worker]`: Message handlers in Display Worker
- `[com.ts:source]`: Communication layer (if enabled)

### Viewing Message Flows

1. Open DevTools Console
2. Filter by: `controls-worker`, `display-worker`, or both
3. Watch for message sequences:
   - Init: see initialization sequence
   - Play: see playback control flow
   - Edit layer: see updateconfig flow

### Tracing High-Frequency Messages

To see every runtimedata message (warning: very noisy):
1. Uncomment logging in Controls.worker.ts `inputsdata` handler
2. Or add custom logging in Display.worker.ts `runtimedata` handler
3. Filter console by timestamp to track latency

### Performance Profiling

1. Open Performance tab in DevTools
2. Record a session while playing
3. Look for:
   - `requestAnimationFrame` duration (should be <16ms)
   - `execAnimation()` time per layer
   - BroadcastChannel postMessage() overhead
   - Canvas transfer time

---

## Related Documentation

- [Architecture Diagram](./architecture-diagram.md) - Visual diagrams of system components and data flows
- [Messaging Architecture](./messaging.md) - Detailed messaging patterns
- [Project Structure](./project-structure.md) - File organization
- [Audio Architecture](./audio.md) - Input/audio system details
