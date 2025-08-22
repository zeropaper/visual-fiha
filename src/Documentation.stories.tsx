import type { Meta, StoryObj } from "@storybook/react";

const ArchitectureComponent = () => (
  <div
    style={{
      padding: "40px",
      fontFamily: "system-ui, sans-serif",
      maxWidth: "1000px",
      margin: "0 auto",
      lineHeight: "1.6",
    }}
  >
    <h1 style={{ color: "#ff6b6b", marginBottom: "20px" }}>
      🏗️ Visual Fiha Architecture
    </h1>

    <h2 style={{ color: "#4ecdc4", marginBottom: "15px" }}>
      📡 Messaging Architecture
    </h2>
    <p style={{ marginBottom: "20px" }}>
      Visual Fiha uses a sophisticated messaging system based on Web Workers and
      BroadcastChannel API:
    </p>

    <div
      style={{
        backgroundColor: "#f8f9fa",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "30px",
        fontFamily: "monospace",
        fontSize: "14px",
      }}
    >
      <pre style={{ margin: 0 }}>{`
┌─────────────────┐    BroadcastChannel    ┌─────────────────┐
│   Controls      │◄──────────────────────►│  Display Worker │
│   (Main Thread) │                        │  (Web Worker)   │
└─────────────────┘                        └─────────────────┘
         │                                           │
         │ postMessage                               │
         ▼                                           ▼
┌─────────────────┐                        ┌─────────────────┐
│ Controls Worker │                        │   Canvas/WebGL  │
│  (Web Worker)   │                        │    Rendering    │
└─────────────────┘                        └─────────────────┘
         │
         │ postMessage
         ▼
┌─────────────────┐
│ TypeScript      │
│ Transpiler      │
│ (Web Worker)    │
└─────────────────┘
      `}</pre>
    </div>

    <h2 style={{ color: "#45b7d1", marginBottom: "15px" }}>
      🎛️ Core Components
    </h2>

    <h3 style={{ color: "#96ceb4", marginBottom: "10px" }}>Controls</h3>
    <p style={{ marginBottom: "15px" }}>
      React-based user interface for managing the entire system:
    </p>
    <ul style={{ marginBottom: "20px" }}>
      <li>
        <strong>Layer Management</strong> - Create, configure, and reorder
        visual layers
      </li>
      <li>
        <strong>Script Editor</strong> - Monaco Editor for TypeScript/JavaScript
        code
      </li>
      <li>
        <strong>Input Configuration</strong> - MIDI, audio, and other input
        sources
      </li>
      <li>
        <strong>Display Management</strong> - Multi-window output control
      </li>
    </ul>

    <h3 style={{ color: "#96ceb4", marginBottom: "10px" }}>Scriptables</h3>
    <p style={{ marginBottom: "15px" }}>
      Objects with two main code properties:
    </p>
    <ul style={{ marginBottom: "20px" }}>
      <li>
        <strong>setup</strong> - Initialization script called once when created
      </li>
      <li>
        <strong>update</strong> - Animation script called every frame
      </li>
    </ul>

    <h3 style={{ color: "#96ceb4", marginBottom: "10px" }}>Layers</h3>
    <p style={{ marginBottom: "15px" }}>
      Visual rendering components that are scriptables:
    </p>
    <ul style={{ marginBottom: "20px" }}>
      <li>
        <strong>Canvas 2D</strong> - 2D graphics using Canvas 2D API
      </li>
      <li>
        <strong>Three.js</strong> - 3D graphics using Three.js library
      </li>
      <li>
        <strong>Opacity Control</strong> - Adjustable transparency (0-100%)
      </li>
      <li>
        <strong>Layer Ordering</strong> - Drag to reorder render sequence
      </li>
    </ul>

    <h3 style={{ color: "#96ceb4", marginBottom: "10px" }}>Inputs</h3>
    <p style={{ marginBottom: "15px" }}>
      Data sources processed by scriptables:
    </p>
    <ul style={{ marginBottom: "20px" }}>
      <li>
        <strong>MIDI Controllers</strong> - Hardware control surfaces
      </li>
      <li>
        <strong>Audio Input</strong> - Microphone and line-in processing
      </li>
      <li>
        <strong>Time-based</strong> - Absolute and relative time sources
      </li>
      <li>
        <strong>Interaction</strong> - Mouse, keyboard, and touch events
      </li>
    </ul>

    <h2 style={{ color: "#ff6b6b", marginBottom: "15px" }}>🔄 Data Flow</h2>

    <div
      style={{
        backgroundColor: "#fff3cd",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "30px",
        border: "1px solid #ffeaa7",
      }}
    >
      <ol style={{ margin: 0, paddingLeft: "20px" }}>
        <li>
          <strong>Input Processing</strong> - Raw input data from various
          sources
        </li>
        <li>
          <strong>Script Execution</strong> - TypeScript transpilation and
          execution
        </li>
        <li>
          <strong>State Management</strong> - Application state in Controls
          Worker
        </li>
        <li>
          <strong>Broadcasting</strong> - Real-time data distribution via
          BroadcastChannel
        </li>
        <li>
          <strong>Rendering</strong> - Visual output in Display Workers
        </li>
        <li>
          <strong>Composition</strong> - Layer blending and final output
        </li>
      </ol>
    </div>

    <h2 style={{ color: "#6c5ce7", marginBottom: "15px" }}>
      🛠️ Development Guidelines
    </h2>

    <ul style={{ marginBottom: "20px" }}>
      <li>
        Use messaging utilities in <code>src/utils/com.ts</code>
      </li>
      <li>Follow existing messaging patterns before creating new ones</li>
      <li>Update TypeScript types for new messages and payloads</li>
      <li>
        Document architectural changes in <code>architecture.md</code>
      </li>
      <li>Debounce/throttle high-frequency messages for performance</li>
      <li>Use transferable objects for efficiency where possible</li>
    </ul>

    <div
      style={{
        marginTop: "40px",
        padding: "20px",
        backgroundColor: "#d1ecf1",
        borderRadius: "8px",
        border: "1px solid #bee5eb",
      }}
    >
      <h3 style={{ margin: "0 0 10px 0", color: "#0c5460" }}>📚 Learn More</h3>
      <p style={{ margin: 0, color: "#155724" }}>
        For detailed implementation details, see the project's README.md and
        architecture documentation in the docs/ folder.
      </p>
    </div>
  </div>
);

const meta: Meta<typeof ArchitectureComponent> = {
  title: "Documentation/Architecture",
  component: ArchitectureComponent,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Overview of Visual Fiha's messaging and worker architecture.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
