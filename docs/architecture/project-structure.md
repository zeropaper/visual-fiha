# Project Structure

Visual Fiha is organized into a modular, feature-based architecture that supports real-time visual programming and multi-window displays.

## Core Directories

### `/src/`
Main source code directory containing all application logic.

#### `/src/types.ts`
Central type definitions for the entire application, including:
- `AppState` - Main application configuration
- `LayerConfig` - Layer configuration interface
- `RuntimeData` - Real-time data structure
- `InputConfig` - Input source configuration

#### `/src/controls/`
Controls interface - the main user interface for managing the Visual Fiha system.

**Key Files:**
- `ControlsApp.tsx` - Main controls application component
- `Controls.worker.ts` - Web Worker managing application state and coordination
- `main.tsx` - Entry point for the controls interface

**Sub-directories:**
- `features/` - Feature-based component organization
  - `ScriptEditor/` - Monaco Editor integration for code editing
  - `Layers/` - Layer management interface
  - `Inputs/` - Input configuration and monitoring
  - `ControlDisplay/` - Visual display of current state
  - `Help/` - Documentation and help system
  - `Timeline/` - Timeline interface (in development)
  - `Stage/` - Stage configuration
  - `AIAssistant/` - AI-powered assistance features
  - `Intro/` - Onboarding and introduction
- `contexts/` - React contexts for state management
  - `ControlsContext.tsx` - Main application state context
  - `createFastContext.tsx` - Fast context pattern implementation
  - `EditorContext.tsx` - Monaco Editor context
  - `AudioSetupContext.tsx` - Audio configuration context
  - `FileSystemContext.tsx` - File system operations
  - `ChatsContext.tsx` - AI chat integration
  - `defaultAppState.ts` - Default application configuration
- `hooks/` - Custom React hooks

#### `/src/display/`
Display system for rendering visual output in separate windows.

**Key Files:**
- `Display.ts` - Main thread display class
- `Display.worker.ts` - Display Web Worker handling rendering
- `displayState.ts` - Display state management
- `types.ts` - Display-specific type definitions
- `main.ts` - Entry point for display windows

#### `/src/layers/`
Layer implementations for different rendering types.

**Structure:**
- `Layer.ts` - Base layer interface
- `Canvas2D/` - 2D Canvas layer implementation
  - `Canvas2DLayer.ts` - Canvas layer class
  - `canvasTools.ts` - Canvas drawing utilities and tools
- `ThreeJS/` - 3D Three.js layer implementation
  - `ThreeJSLayer.ts` - Three.js layer class
  - `threeTools.ts` - Three.js utilities and helpers

#### `/src/utils/`
Shared utilities and helper functions.

**Key Files:**
- `com.ts` - Communication utilities for Worker messaging
- `Scriptable.ts` - Script execution and management
- `tsTranspile.ts` - TypeScript transpilation utilities
- `tsTranspile.worker.ts` - TypeScript transpilation Web Worker
- `mathTools.ts` - Mathematical utilities for scripts
- `miscTools.ts` - Miscellaneous helper functions
- `make-read.ts` - Input reading system implementation

#### `/src/ui/`
Reusable UI components.

**Components:**
- `Button.tsx` - Button component
- `Input.tsx` - Input field component
- `Select.tsx` - Select dropdown component
- `Textarea.tsx` - Textarea component
- `Markdown.tsx` - Markdown rendering component
- `AdvancedMarkdown.tsx` - Enhanced markdown with features

### `/demos/`
Example scripts and demonstrations.

- `default/` - Default layer scripts
  - `canvas-animation.ts` - Canvas animation examples
  - `threejs-animation.ts` - Three.js animation examples
  - `threejs-setup.ts` - Three.js setup examples

### `/docs/`
Documentation files.

- `architecture/` - Architecture documentation
  - `messaging.md` - Inter-component communication
  - `audio.md` - Audio system architecture
- `canvas-api.md` - Canvas layer API documentation
- `threejs-api.md` - Three.js layer API documentation
- `layers.md` - General layer documentation
- `inputs.md` - Input system documentation

### `/public/`
Static assets and resources.

- `audio/` - Audio samples and loops
- `gltf/` - 3D models and assets
- CSS files, icons, and other static resources

## Architecture Patterns

### Feature-Based Organization
The controls interface is organized by features rather than by file type, making it easier to locate and maintain related functionality.

### Worker-Based Architecture
Heavy computation and state management is handled in Web Workers to maintain UI responsiveness:
- **Controls Worker**: Manages application state and coordinates between components
- **Display Workers**: Handle rendering in separate contexts
- **Transpiler Worker**: Processes TypeScript code compilation

### Context-Driven State Management
React contexts provide efficient state management with selective re-rendering through the fast context pattern.

### Message-Based Communication
All components communicate through a structured message system using BroadcastChannel API and Worker postMessage, enabling loose coupling and scalability.

## Development Workflow

1. **Controls Interface** - Main development environment in `src/controls/`
2. **Layer Development** - Create new layer types in `src/layers/`
3. **Display Testing** - Use separate display windows for output testing
4. **Documentation** - Update relevant docs in `/docs/` directory

This structure supports the visual programming paradigm while maintaining clear separation of concerns and enabling real-time collaboration between multiple display contexts.
