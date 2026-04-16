<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This project is a browser-based creative coding platform for interactive visuals, using JavaScript/TypeScript, WebGL, CSS, MIDI, and a modular worker/message architecture.

## Quick Start for AI Agents
**Before making changes, read:** [README.md](../README.md), [project structure](../docs/architecture/project-structure.md), [messaging architecture](../docs/architecture/messaging.md), and [known bugs](../docs/known-bugs.md).

## Build & Test Commands
```bash
pnpm dev           # Start development server (http://localhost:5173)
pnpm build         # Production build
pnpm test          # Run all tests (*.test.ts and *.test.dom.ts)
pnpm test:watch    # Watch mode for development
pnpm test:coverage # Coverage report
pnpm storybook     # Component development & documentation
```

## Stack & Key Technologies
- **Languages:** TypeScript, JavaScript
- **Build:** Vite, pnpm
- **UI Framework:** React (with feature-based architecture in `src/controls/features/`)
- **Rendering:** Three.js (3D), Canvas 2D API (2D)
- **Editors:** Monaco Editor (code), Storybook (components)
- **Concurrency:** Web Workers (Controls, Display, Transpiler), BroadcastChannel API
- **Code Quality:** Biome (linter/formatter), Vitest (tests)

## Architecture Overview
See detailed docs at [`docs/architecture/`](../docs/architecture/):
- **Architecture Diagram:** [architecture-diagram.md](../docs/architecture/architecture-diagram.md) - Visual mermaid diagrams showing system components, message flows, data flows, and worker architecture
- **Initialization & Message Flows:** [initialization-and-message-flows.md](../docs/architecture/initialization-and-message-flows.md) - Traces app startup and runtime message flows
- **Worker-based:** Controls.worker.ts manages state; Display.worker.ts renders; tsTranspile.worker.ts compiles TypeScript
- **Message-driven:** All inter-thread/window communication via `src/utils/com.ts` utilities
- **Layers:** Canvas2D and ThreeJS implementations in `src/layers/` (see [layer docs](../docs/layers.md))
- **Inputs:** MIDI, audio, time, keyboard, mouse (see [inputs docs](../docs/inputs.md))

## Coding Guidelines
**Messaging (Critical):**
- **Always use** `src/utils/com.ts` utilities for any inter-thread or cross-window communication
- **Search first** for similar message types before creating new ones (prevents duplication)
- **Type all messages** in `src/types.ts` or relevant module types file
- **Document** new message types and handlers in [messaging.md](../docs/architecture/messaging.md)
- **Optimize** high-frequency messages (e.g., `runtimedata`) with debounce/throttle or batching
- **Error handling:** Use `meta`/error pattern from `com.ts`
- **Transferable objects:** Use OffscreenCanvas, ArrayBuffers for efficiency

**Code Organization:**
- **Features:** Place UI components in `src/controls/features/{FeatureName}/`
- **Contexts:** Add new state contexts to `src/controls/contexts/`
- **Types:** Define types in module-level `types.ts` or central `src/types.ts`
- **Utils:** Shared helpers in `src/utils/`, worker-specific logic in their own files

**Testing:**
- **Unit tests:** `*.test.ts` (node environment)
- **DOM/Browser tests:** `*.test.dom.ts` (jsdom environment)
- **Examples:** See `src/utils/com.dom.test.ts`, `src/display/DisplayWorker.test.ts`
- **Storybook:** Use for component development and documentation

**Type Generation:**
- **Run** `pnpm gen-editor-types` after modifying scriptable APIs (`canvasTools.ts`, `threeTools.ts`, etc.)
- **Output:** Editor type definitions in `*.editor-types.txt` for Monaco autocomplete in user scripts

## Key Files by Domain
| Domain | File | Purpose |
|--------|------|---------|
| **Messaging** | `src/utils/com.ts` | makeChannelPost, makeChannelListener, autoBind for worker/window communication |
| **State** | `src/controls/Controls.worker.ts` | Application state management and coordination |
| **Display** | `src/display/Display.worker.ts` | Rendering pipeline for separate display windows |
| **Types** | `src/types.ts` | Central type definitions (AppState, LayerConfig, RuntimeData, etc.) |
| **Transpiler** | `src/controls/tsTranspile.worker.ts` | TypeScript compilation for user scripts |
| **Layers** | `src/layers/Canvas2D/`, `src/layers/ThreeJS/` | Layer implementations and user API (tools) |
| **UI** | `src/ui/` | Reusable components; `src/controls/` for feature-specific UI |
| **Contexts** | `src/controls/contexts/` | React contexts for state management (fast context pattern) |

## Common Tasks
- **Adding a message type:** Define in `src/types.ts`, implement handler in relevant worker, document in [messaging.md](../docs/architecture/messaging.md)
- **Adding a UI feature:** Create `src/controls/features/{FeatureName}/`, add context if needed, use messaging for state
- **Extending Canvas API:** Modify `src/layers/Canvas2D/canvasTools.ts`, run `pnpm gen-editor-types:canvas`
- **Extending ThreeJS API:** Modify `src/layers/ThreeJS/threeTools.ts`, run `pnpm gen-editor-types:threejs`
- **Adding a new input type:** Extend `src/types.ts` InputConfig, implement in `src/controls/features/Inputs/`

## Troubleshooting
- **Message flow unclear?** Consult [messaging.md](../docs/architecture/messaging.md) and search codebase for the message type
- **Performance issues?** Profile BroadcastChannel usage; consider batching, filtering, or debouncing messages
- **Type errors in user scripts?** Run `pnpm gen-editor-types` to regenerate Monaco type definitions
- **Test failures?** Check if test is `*.test.ts` (node) or `*.test.dom.ts` (jsdom); use appropriate environment
- **Known bugs?** See [known-bugs.md](../docs/known-bugs.md) before starting work

## Checklist Before Submitting Changes
- [ ] Messaging follows patterns in `src/utils/com.ts`; new message types documented in [messaging.md](../docs/architecture/messaging.md)
- [ ] Types updated in appropriate `types.ts` file
- [ ] Tests added for worker/messaging logic (`.test.ts` or `.test.dom.ts` as appropriate)
- [ ] Biome linter and formatter satisfied (`pnpm build` should pass)
- [ ] Performance and error handling considered; high-frequency messages optimized
- [ ] Type generation run if scriptable APIs modified (`pnpm gen-editor-types`)
