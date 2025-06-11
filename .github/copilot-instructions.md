<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This project is a browser-based creative coding platform for interactive visuals, using JavaScript/TypeScript, WebGL, CSS, MIDI, and a modular worker/message architecture. See README.md and architecture.md for details.

## Project Context
- Main languages: TypeScript, JavaScript
- Key technologies: Web Workers, BroadcastChannel, React, Three.js, Monaco Editor
- Messaging and state management are central; see `src/utils/com.ts` for utilities.

## Coding Guidelines
- **Read** [README.md](../README.md), [architecture.md](../architecture.md) and [known bugs](../known-bugs.md) before making changes.
- **Always use** the messaging utilities in `src/utils/com.ts` for cross-thread or cross-context communication.
- **Follow existing messaging patterns**—search for similar message types before introducing new ones.
- **Update or add TypeScript types** in `src/types.ts` or relevant files for any new message or payload.
- **Document** any new message types, handlers, or architectural changes in `architecture.md`.
- **Debounce/throttle** high-frequency messages (e.g., `runtimedata`) as needed for performance.
- **Use transferable objects** (e.g., OffscreenCanvas, ArrayBuffers) where possible for efficiency.
- **Propagate errors** using the `meta`/error pattern in `com.ts`.
- **Write or update tests** for messaging/worker logic when making changes (see `src/utils/com.dom.test.ts`, etc.).
- **Maintain consistent naming** for messages, handlers, and types.

## Stack
- pnpm for package management
- TypeScript for type safety
- Vite for development server and build
- React for UI components
- Three.js for 3D rendering
- Monaco Editor for code editing
- Web Workers for background processing
- BroadcastChannel for inter-thread communication

## Key Files
- `src/utils/com.ts` — Messaging utilities (makeChannelPost, makeChannelListener, autoBind)
- `src/controls/Controls.worker.ts`, `src/display/Display.worker.ts`, `src/controls/tsTranspile.worker.ts` — Worker entry points
- `src/types.ts`, `src/controls/types.ts`, `src/display/types.ts` — Type definitions

## Troubleshooting & FAQ
- If unsure about message flow, consult `architecture.md` and search for the message type in the codebase.
- If you encounter performance issues, profile BroadcastChannel usage and consider batching or filtering messages.
- For new features, always consider their impact on the messaging system and document accordingly.

## Checklist Before Submitting Changes
- [ ] Messaging follows project patterns and uses `src/utils/com.ts`
- [ ] Types and documentation are updated
- [ ] Tests are added/updated if needed
- [ ] Performance and error handling are considered
