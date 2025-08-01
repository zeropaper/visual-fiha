# Visual-Fiha Messaging & Worker Architecture

## Overview
Visual-Fiha uses a modular, message-based architecture to coordinate between the main thread, multiple Web Workers, and windows/contexts. Communication is primarily handled via the [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel) and structured message utilities in `src/utils/com.ts`.

## Messaging Utilities
- **`src/utils/com.ts`** provides:
  - `makeChannelPost`: Sends typed messages, optionally awaiting responses (async request/response).
  - `makeChannelListener`: Handles incoming messages, dispatching to registered handlers (sync/async).
  - `autoBind`: Binds a channel (e.g., Worker, BroadcastChannel) to the above utilities for easy integration.

All messages include a `meta` object for tracing, error propagation, and operation tracking.

## Message Posting & Processing: Key Locations

### 1. Controls Worker (`src/controls/Controls.worker.ts`)
- **Posts messages:**
  - Uses `broadcastChannel.postMessage` to broadcast updates (e.g., `updateconfig`, `registerdisplaycallback`, `runtimedata`, `transpiled`).
- **Processes messages:**
  - Listens for messages from the main thread via `self.addEventListener('message', ...)`.
  - Listens for cross-context messages via `broadcastChannel.addEventListener('message', ...)`.

### 2. Display Worker (`src/display/Display.worker.ts`)
- **Posts messages:**
  - Uses `BroadcastChannel.postMessage` for cross-context communication.
  - Uses `worker.postMessage` for main thread communication.
- **Processes messages:**
  - Listens for messages from the main thread via `worker.addEventListener('message', ...)`.
  - Listens for cross-context messages via `BroadcastChannel.onmessage`.
  - Message handling is structured via `autoBind` and handler maps.

### 3. TypeScript Transpiler Worker (`src/utils/tsTranspile.worker.ts`)
- **Posts messages:**
  - Uses `self.postMessage` to return transpile results to the main thread.
  - Uses `broadcastChannel.postMessage` to broadcast transpile results to other contexts.
- **Processes messages:**
  - Listens for messages via `self.onmessage`.

### 4. Main Thread Display (`src/display/Display.ts`)
- **Posts messages:**
  - Uses `worker.postMessage` to send canvas and resize events to the display worker.
- **Processes messages:**
  - Listens for messages from the worker via `worker.addEventListener('message', ...)`.

### 5. Script Editor & Monaco Integration (`src/controls/features/ScriptEditor/`)
- **Posts messages:**
  - On code changes, sends transpile requests to the TypeScript worker
  - Communicates with the Controls Worker for script updates
- **Processes messages:**
  - Receives transpile results and updates Monaco editor state
  - Handles script compilation errors and success notifications

## Updated Messaging Architecture

### `com` Library Usage
The `com` library provides structured messaging utilities:
- **`makeChannelPost`**: Sends typed messages, optionally awaiting responses (async request/response).
- **`makeChannelListener`**: Handles incoming messages, dispatching to registered handlers (sync/async).
- **`autoBind`**: Binds a channel (e.g., Worker, BroadcastChannel) to the above utilities for easy integration.

#### Key Locations
- **`src/utils/com.ts`**: Contains the definitions of `makeChannelPost`, `makeChannelListener`, and `autoBind`.
- **`src/controls/Controls.worker.ts`**: Uses `autoBind` for message handling.
- **`src/display/Display.ts` and `src/display/Display.worker.ts`**: Employ `autoBind` for worker and BroadcastChannel communication.
- **`src/controls/contexts/createFastContext.tsx`**: Utilizes `autoBind` for worker communication.

### `BroadcastChannel` Usage
The `BroadcastChannel` API is used for cross-context communication.

#### Key Locations
- **`src/utils/tsTranspile.worker.ts`**: Posts transpile results to the BroadcastChannel.
- **`src/controls/features/Timeline/`**: Timeline component implementation.
- **`src/controls/Controls.worker.ts`**: Posts updates like `updateconfig` and `runtimedata` to the BroadcastChannel.
- **`src/display/Display.worker.ts`**: Handles messages using `broadcastChannelCom`.

### Worker Messaging
Workers communicate using `postMessage`, `onmessage`, and `addEventListener`.

#### Key Locations
- **`src/utils/tsTranspile.worker.ts`**: Processes messages via `self.onmessage` and posts results using `self.postMessage`.
- **`src/controls/features/ScriptEditor/`**: Sends messages to the transpilation worker.
- **`src/controls/Controls.worker.ts`**: Listens for messages from the main thread and BroadcastChannel.

### Summary
This document now includes detailed findings on the usage of the `com` library, `BroadcastChannel`, and worker messaging. These updates ensure the messaging architecture is accurately documented and aligned with the current implementation.

## Message Flow Example
1. **Config Update:**
   - Main thread sends `updateconfig` to Controls Worker (via `postMessage`).
   - Controls Worker updates config, broadcasts new config via `broadcastChannel.postMessage`.
   - Display Worker receives update via `BroadcastChannel.onmessage`, updates its state.

2. **Runtime Data:**
   - Controls Worker periodically broadcasts `runtimedata` via `broadcastChannel.postMessage`.
   - Display Worker receives and applies runtime data.

3. **Code Transpilation:**
   - User makes changes in Monaco Editor.
   - Monaco Editor sends code change to TypeScript Transpiler Worker.
   - TypeScript Transpiler Worker transpiles code and sends back the result.
   - Monaco Editor receives the transpiled code and can forward it to other components or workers.

## Message Flow Diagram

```mermaid
flowchart TD
    subgraph MainThreadGroup["Main Thread"]
        MonacoEditor["Monaco Editor (Main Thread)"]
    end
    ControlsWorker["Controls Worker (Web Worker)"]
    DisplayWorker["Display Worker (Web Worker)"]
    TsTranspileWorker["TypeScript Transpiler Worker"]
    BroadcastChannel["BroadcastChannel 'core'"]
    AudioCapture["Audio Capture"]
    MidiCapture["MIDI Capture"]

    MainThreadGroup -- postMessage:updateconfig --> ControlsWorker
    ControlsWorker -- postMessage:updateconfig --> BroadcastChannel
    BroadcastChannel -- updateconfig --> DisplayWorker
    ControlsWorker -- postMessage:runtimedata --> BroadcastChannel
    BroadcastChannel -- runtimedata --> DisplayWorker
    MainThreadGroup -- postMessage:offscreencanvas/resize --> DisplayWorker
    MonacoEditor -- code change --> TsTranspileWorker
    TsTranspileWorker -- postMessage:transpiled --> MonacoEditor
    TsTranspileWorker -- postMessage:transpiled --> BroadcastChannel
    BroadcastChannel -- transpiled --> ControlsWorker
    BroadcastChannel -- transpiled --> DisplayWorker
    DisplayWorker -- postMessage:registerdisplay --> BroadcastChannel
    BroadcastChannel -- registerdisplaycallback --> DisplayWorker
    AudioCapture -- audioupdate --> MainThreadGroup
    MidiCapture -- midimessage --> MainThreadGroup
```

This diagram shows the main message flows between the main thread, workers, and channels. Solid arrows represent direct `postMessage` or API calls; arrows through `BroadcastChannel` represent cross-context broadcasts.

## Message Types & Payloads
The following table summarizes the key message types, their senders, receivers, and payload structures. This is not an exhaustive list but covers the main communication patterns in Visual-Fiha.


| Message Type        | Sender                | Receiver(s)            | Payload Structure / Notes                                  | Use COM lib | Location                                        |
|---------------------|-----------------------|------------------------|------------------------------------------------------------|-------------|-------------------------------------------------|
| updateconfig        | Main Thread           | Controls Worker        | `{ field: string, value: any }`                            | Yes         | `src/controls/Controls.worker.ts:130`           |
| updateconfig        | Controls Worker       | BroadcastChannel       | `AppState` (full config)                                   | Yes         | `src/controls/Controls.worker.ts:233`           |
| updateconfig        | BroadcastChannel      | Display Worker         | `AppState` (full config)                                   | Yes         | `src/display/Display.worker.ts:114`             |
| runtimedata         | Controls Worker       | BroadcastChannel       | `RuntimeData`                                              | Yes         | `src/controls/Controls.worker.ts:301`           |
| runtimedata         | BroadcastChannel      | Display Worker         | `RuntimeData`                                              | Yes         | `src/display/Display.worker.ts:148`             |
| offscreencanvas     | Main Thread           | Display Worker         | `{ canvas: OffscreenCanvas }`                              | No          | `src/display/Display.ts:43`                     |
| resize              | Main Thread           | Display Worker         | `{ width: number, height: number }`                        | No          | `src/display/Display.ts:78`                     |
| code change         | Monaco Editor         | TS Transpiler Worker   | `{ code: string, role: string, type: string, id: string }` | No          | `src/controls/features/ScriptEditor/ScriptEditor.tsx` |
| transpiled          | TS Transpiler Worker  | Monaco Editor          | `TranspilePayload`                                         | Yes         | `src/utils/tsTranspile.worker.ts`            |
| transpiled          | TS Transpiler Worker  | BroadcastChannel       | `TranspilePayload`                                         | Yes         | `src/utils/tsTranspile.worker.ts`            |
| transpiled          | BroadcastChannel      | Controls/Display Worker| `TranspilePayload`                                         | Yes         | `src/controls/Controls.worker.ts:193`           |
| registerdisplay     | Display Worker        | BroadcastChannel       | `{ id: string, width: number, height: number }`            | Yes         | `src/display/VFWorker.ts:136`                   |
| registerdisplaycallback | BroadcastChannel  | Display Worker         | `{ id: string, config: AppState }`                         | Yes         | `src/display/Display.worker.ts:148`             |
| audioupdate         | Audio Capture         | Main Thread            | `{ frequency: number[], volume: number[] }`                | No          | `src/controls/features/Inputs/` |
| midimessage         | MIDI Capture          | Main Thread            | `MIDIMessageEvent`                                         | No          | `src/controls/features/Inputs/` |

> For full payload definitions, see the relevant TypeScript types in `src/types.ts`, `src/controls/types.ts`, and `src/utils/com.ts`.
