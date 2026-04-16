# Visual Fiha Architecture Diagram

## System Overview

```mermaid
graph TB
    subgraph MainThread["Main Thread (Controls UI)"]
        React["React App<br/>(ControlsApp)"]
        Features["Feature Components<br/>(Layers, Inputs, Audio,<br/>Timeline, Assets, Displays)"]
        Contexts["React Contexts<br/>(State Management)"]
        Monaco["Monaco Editor<br/>(Script Editing)"]
        
        React --> Features
        React --> Contexts
        Monaco --> Features
    end
    
    subgraph ControlsWorker["Controls Worker"]
        CWState["AppState<br/>(Layers, Inputs, Config)"]
        RuntimeData["RuntimeData<br/>(Time, BPM, Inputs)"]
        CWHandlers["Message Handlers<br/>(init, updateconfig,<br/>inputsdata, start, pause)"]
        Transpiler["TypeScript Transpiler<br/>(via tsTranspile worker)"]
        
        CWHandlers --> CWState
        CWHandlers --> RuntimeData
        CWHandlers --> Transpiler
    end
    
    subgraph DisplayWorker1["Display Worker 1<br/>(display-main)"]
        DWState1["DisplayState<br/>(Config, RuntimeData)"]
        DWLayers1["Layer Instances<br/>(Canvas2DLayer,<br/>ThreeJSLayer)"]
        Scriptable1["Scriptable<br/>(Worker Scripts)"]
        RenderLoop1["Render Loop<br/>(requestAnimationFrame)"]
        
        DWLayers1 --> Scriptable1
        Scriptable1 --> RenderLoop1
        RenderLoop1 --> DWLayers1
    end
    
    subgraph DisplayWorker2["Display Worker N<br/>(display-secondary, ...)"]
        DWState2["DisplayState<br/>(Config, RuntimeData)"]
        DWLayers2["Layer Instances<br/>(Canvas2DLayer,<br/>ThreeJSLayer)"]
        Scriptable2["Scriptable<br/>(Worker Scripts)"]
        RenderLoop2["Render Loop<br/>(requestAnimationFrame)"]
        
        DWLayers2 --> Scriptable2
        Scriptable2 --> RenderLoop2
        RenderLoop2 --> DWLayers2
    end
    
    subgraph TranspilerWorker["Transpiler Worker"]
        TSTranspile["TypeScript Compiler<br/>(via esbuild/swc)"]
    end
    
    subgraph Communication["Communication Channels"]
        BC["BroadcastChannel 'core'<br/>(updateconfig, runtimedata,<br/>registerdisplay, errors)"]
        PM["Worker.postMessage<br/>(offscreencanvas, resize)"]
    end
    
    subgraph ExternalInputs["External Input Sources"]
        MIDI["MIDI Controllers"]
        Microphone["Microphone"]
        AudioFiles["Audio Files"]
        Keyboard["Keyboard Events"]
        Mouse["Mouse Events"]
        Time["System Time"]
    end
    
    subgraph Display1["Display Window 1"]
        Canvas1["OffscreenCanvas"]
        OutputContext1["2D/WebGL Context"]
        HTMLCanvas1["HTML Canvas Element"]
        
        Canvas1 --> OutputContext1
        OutputContext1 --> HTMLCanvas1
    end
    
    subgraph DisplayN["Display Window N"]
        CanvasN["OffscreenCanvas"]
        OutputContextN["2D/WebGL Context"]
        HTMLCanvasN["HTML Canvas Element"]
        
        CanvasN --> OutputContextN
        OutputContextN --> HTMLCanvasN
    end
    
    %% Main Thread to Workers
    Contexts -->|spawn & configure| ControlsWorker
    Features -->|read/write state| Contexts
    Monaco -->|edit scripts| Contexts
    
    %% Controls to Inputs
    Features -->|collect from| ExternalInputs
    ExternalInputs -->|inputsdata message| ControlsWorker
    
    %% Controls Worker Communication
    ControlsWorker -->|transpile scripts| TranspilerWorker
    TranspilerWorker -->|compiled code| ControlsWorker
    
    ControlsWorker -->|broadcastChannel| BC
    BC -->|updateconfig, runtimedata| DisplayWorker1
    BC -->|updateconfig, runtimedata| DisplayWorker2
    
    %% Main Thread to Display Workers
    Features -->|postMessage offscreencanvas| PM
    Features -->|resize events| PM
    PM -->|received by| DisplayWorker1
    PM -->|received by| DisplayWorker2
    
    %% Display Workers to Canvas
    DisplayWorker1 -->|render via| Canvas1
    DisplayWorker2 -->|render via| CanvasN
    
    %% Display Workers back to Controls
    DisplayWorker1 -->|errors, resize, register| BC
    DisplayWorker2 -->|errors, resize, register| BC
    BC -->|received by| ControlsWorker
    
    style MainThread fill:#e1f5ff
    style ControlsWorker fill:#f3e5f5
    style DisplayWorker1 fill:#e8f5e9
    style DisplayWorker2 fill:#e8f5e9
    style TranspilerWorker fill:#fff3e0
    style Communication fill:#fce4ec
    style ExternalInputs fill:#f1f8e9
    style Display1 fill:#c8e6c9
    style DisplayN fill:#c8e6c9
```

## Detailed Message Flow

```mermaid
sequenceDiagram
    actor User
    participant Ctx as React Context
    participant CW as Controls Worker
    participant BC as BroadcastChannel
    participant DW as Display Worker
    participant Canvas as OffscreenCanvas

    User->>Ctx: Click Play Button
    Ctx->>CW: post("start")
    activate CW
    CW->>CW: Update runtimeData<br/>(isRunning=true, time.started=now)
    CW->>BC: broadcastRuntimeData()
    deactivate CW
    
    activate BC
    BC->>DW: {type: "runtimedata", payload}
    deactivate BC
    
    activate DW
    DW->>DW: Object.assign(data, payload)
    DW->>DW: requestAnimationFrame()
    DW->>DW: execAnimation() - read.time
    DW->>DW: execAnimation() for each layer
    DW->>Canvas: drawImage(layer.canvas)
    DW->>Canvas: Render complete
    deactivate DW

    User->>Ctx: Edit Layer Script
    Ctx->>CW: post("updateconfig", {layers})
    activate CW
    CW->>CW: Update appState.layers
    CW->>BC: broadcastChannel("updateconfig")
    deactivate CW
    
    activate BC
    BC->>DW: {type: "updateconfig", payload}
    deactivate BC
    
    activate DW
    DW->>DW: processLayers(update.layers)
    DW->>DW: For new layers:<br/>instantiate Canvas2DLayer
    DW->>DW: execSetup() - user script
    DW->>DW: Ready to render
    deactivate DW
```

## Data Flow Diagram

```mermaid
graph LR
    subgraph Sources["Input Sources"]
        MIDI["MIDI"]
        Audio["Audio"]
        Keyboard["Keyboard"]
        Mouse["Mouse"]
        Time["Time"]
    end
    
    subgraph Collection["Input Collection<br/>(Main Thread)"]
        MIDIListener["MIDI Listener"]
        AudioAnalyzer["Audio Analyzer"]
        KeyboardHandler["Keyboard Handler"]
        MouseHandler["Mouse Handler"]
        TimeCalc["Time Calculator"]
    end
    
    subgraph Aggregation["Input Aggregation<br/>(useWriteInputValues)"]
        Aggregate["Combine All Inputs"]
    end
    
    subgraph ControlsWorker_DFlow["Controls Worker"]
        InputsHandler["inputsdata Handler"]
        StateUpdate["Update RuntimeData"]
    end
    
    subgraph Broadcast["RuntimeData Broadcast<br/>(BroadcastChannel)"]
        BroadcastMsg["Every Frame:<br/>time, bpm, audio,<br/>midi, keyboard, mouse"]
    end
    
    subgraph DisplayWorker_DFlow["Display Worker"]
        DataRead["Store in data<br/>Object"]
        ScriptAccess["Scripts access via<br/>read.time, read.audio,<br/>read.midi, etc."]
    end
    
    subgraph Rendering["Rendering"]
        LayerExec["Layer Animation<br/>execAnimation()"]
        Canvas["Composite to Canvas"]
    end
    
    MIDI --> MIDIListener
    Audio --> AudioAnalyzer
    Keyboard --> KeyboardHandler
    Mouse --> MouseHandler
    Time --> TimeCalc
    
    MIDIListener --> Aggregate
    AudioAnalyzer --> Aggregate
    KeyboardHandler --> Aggregate
    MouseHandler --> Aggregate
    TimeCalc --> Aggregate
    
    Aggregate --> InputsHandler
    InputsHandler --> StateUpdate
    StateUpdate --> BroadcastMsg
    BroadcastMsg --> DataRead
    DataRead --> ScriptAccess
    ScriptAccess --> LayerExec
    LayerExec --> Canvas
```

## Layer Rendering Pipeline

```mermaid
graph TD
    A["Display Worker<br/>Render Loop"] -->|requestAnimationFrame| B["Execute Worker<br/>Animation Script"]
    B --> C["For Each Layer:<br/>active=true"]
    C --> D["Execute Layer<br/>Animation Script"]
    D --> E["Get Layer Canvas"]
    E --> F["Apply Opacity<br/>context.globalAlpha"]
    F --> G["Composite to Main Canvas<br/>context.drawImage"]
    G --> H{"More Layers?"}
    H -->|Yes| C
    H -->|No| I["Transfer to OffscreenCanvas<br/>ctx.drawImage"]
    I --> J["Ready for Display<br/>Window"]
    J --> A
```

## State Synchronization

```mermaid
graph TB
    subgraph Controls["Controls Worker<br/>(Source of Truth)"]
        AppState["appState<br/>(Immutable Config)"]
        RuntimeState["runtimeData<br/>(Time, BPM, Inputs)"]
    end
    
    subgraph Display1["Display Worker 1"]
        D1State["displayState<br/>(Local Copy)"]
        D1Data["data<br/>(Latest RuntimeData)"]
    end
    
    subgraph Display2["Display Worker 2"]
        D2State["displayState<br/>(Local Copy)"]
        D2Data["data<br/>(Latest RuntimeData)"]
    end
    
    subgraph Sync["Synchronization<br/>(BroadcastChannel)"]
        UpdateConfig["updateconfig<br/>(When config changes)"]
        RuntimeData["runtimedata<br/>(Every frame)"]
    end
    
    AppState -->|updateconfig| UpdateConfig
    RuntimeState -->|broadcast| RuntimeData
    
    UpdateConfig -->|received| D1State
    UpdateConfig -->|received| D2State
    RuntimeData -->|received| D1Data
    RuntimeData -->|received| D2Data
    
    D1State -->|read during render| D1Data
    D2State -->|read during render| D2Data
```

## Error Handling Flow

```mermaid
graph LR
    subgraph Execution["Script Execution"]
        Setup["Setup Script"]
        Animation["Animation Script"]
    end
    
    subgraph Detection["Error Detection"]
        CompileError["Compilation Error"]
        ExecError["Execution Error"]
    end
    
    subgraph Handling["Error Handling<br/>(Display Worker)"]
        OnCompile["onCompilationError"]
        OnExec["onExecutionError"]
    end
    
    subgraph Broadcast["Error Broadcast"]
        CompileMsg["compilationerror<br/>Message"]
        ExecMsg["executionerror<br/>Message"]
    end
    
    subgraph ControlsReception["Controls Worker"]
        ErrorLog["Log to appState.errors"]
    end
    
    subgraph UIDisplay["UI Display"]
        Editor["Show in Editor<br/>Error Panel"]
        Console["Show in Console"]
    end
    
    Setup -->|parse error| CompileError
    Animation -->|runtime error| ExecError
    
    CompileError --> OnCompile
    ExecError --> OnExec
    
    OnCompile -->|broadcastChannel.post| CompileMsg
    OnExec -->|broadcastChannel.post| ExecMsg
    
    CompileMsg -->|received| ErrorLog
    ExecMsg -->|received| ErrorLog
    
    ErrorLog --> Editor
    ErrorLog --> Console
```

## Worker Architecture

```mermaid
graph TB
    subgraph MainContext["Main Thread Context"]
        Window["window object"]
    end
    
    subgraph CW["Controls Worker<br/>(src/controls/Controls.worker.ts)"]
        CWGlobal["self (worker global)"]
        CWListeners["Message Listeners"]
        CWHandlers["Handler Functions"]
    end
    
    subgraph DW1["Display Worker 1<br/>(src/display/Display.worker.ts)"]
        DWGlobal["self (worker global)"]
        DWListeners["BroadcastChannel Listener<br/>+ Worker Message Listener"]
        DWHandlers["Handler Functions"]
    end
    
    subgraph DW2["Display Worker N<br/>(src/display/Display.worker.ts)"]
        DWGlobal2["self (worker global)"]
        DWListeners2["BroadcastChannel Listener<br/>+ Worker Message Listener"]
        DWHandlers2["Handler Functions"]
    end
    
    subgraph TW["Transpiler Worker<br/>(src/utils/tsTranspile.worker.ts)"]
        TWGlobal["self (worker global)"]
        TWListeners["Worker Message Listener"]
        TWHandlers["TypeScript Compiler"]
    end
    
    Window -->|new Worker| CW
    Window -->|new Worker| DW1
    Window -->|new Worker| DW2
    Window -->|new Worker| TW
    
    CWGlobal -->|addEventListener| CWListeners
    CWListeners -->|dispatch| CWHandlers
    
    DWGlobal -->|addEventListener| DWListeners
    DWListeners -->|dispatch| DWHandlers
    
    DWGlobal2 -->|addEventListener| DWListeners2
    DWListeners2 -->|dispatch| DWHandlers2
    
    TWGlobal -->|addEventListener| TWListeners
    TWListeners -->|dispatch| TWHandlers
    
    CWHandlers -.->|async reply| CWListeners
    DWHandlers -.->|async reply| DWListeners
    DWHandlers2 -.->|async reply| DWListeners2
    TWHandlers -.->|async reply| TWListeners
```

---

## Architecture Principles

### 1. **Worker-Based Concurrency**
- Heavy computation (rendering, script execution) runs in workers
- Main thread remains responsive for user interactions
- Each display has its own worker for true parallelism

### 2. **Message-Driven Communication**
- All cross-worker/cross-thread communication via messages
- No shared memory (except transferred OffscreenCanvas)
- BroadcastChannel enables one-to-many communication

### 3. **Separation of Concerns**
- **Main Thread**: UI, user input, state coordination
- **Controls Worker**: State management, configuration, orchestration
- **Display Workers**: Rendering, layer execution, canvas operations
- **Transpiler Worker**: TypeScript compilation

### 4. **Single Source of Truth**
- Controls Worker is the source of truth for AppState
- Each Display Worker maintains its own copy for rendering
- RuntimeData is broadcast to keep all workers in sync

### 5. **Unidirectional Data Flow**
- Configuration flows from Controls → Display workers
- Runtime data flows from Inputs → Controls → Display workers
- Errors and status flow back from Display → Controls

---

## Key Components Reference

| Component | Location | Purpose |
|-----------|----------|---------|
| **Controls Worker** | `src/controls/Controls.worker.ts` | Central state management, orchestration |
| **Display Worker** | `src/display/Display.worker.ts` | Rendering pipeline, layer execution |
| **Transpiler Worker** | `src/utils/tsTranspile.worker.ts` | TypeScript compilation |
| **Communication Utils** | `src/utils/com.ts` | Message creation and handling |
| **Contexts** | `src/controls/contexts/` | React state management |
| **Layers** | `src/layers/{Canvas2D,ThreeJS}/` | Layer implementations |
| **Features** | `src/controls/features/` | UI components for different domains |

