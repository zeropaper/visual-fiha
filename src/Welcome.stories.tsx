import type { Meta, StoryObj } from "@storybook/react";

const WelcomeComponent = () => (
  <div
    style={{
      padding: "40px",
      fontFamily: "system-ui, sans-serif",
      maxWidth: "800px",
      margin: "0 auto",
      lineHeight: "1.6",
    }}
  >
    <h1 style={{ color: "#ff6b6b", marginBottom: "20px" }}>
      🎨 Visual Fiha Component Library
    </h1>

    <p style={{ fontSize: "18px", marginBottom: "30px" }}>
      Welcome to the Visual Fiha Storybook! This is a browser-based creative
      coding platform designed for interactive visual experiences using
      JavaScript, WebGL, CSS, and MIDI controllers.
    </p>

    <h2 style={{ color: "#4ecdc4", marginBottom: "15px" }}>🧩 Components</h2>
    <p style={{ marginBottom: "20px" }}>
      Explore our reusable UI components that power the Visual Fiha interface:
    </p>

    <ul style={{ marginBottom: "30px" }}>
      <li>
        <strong>UI Components</strong> - Basic form controls and interface
        elements
      </li>
      <li>
        <strong>Features</strong> - Complex application-specific components
      </li>
      <li>
        <strong>Layout</strong> - Sidebar, tabs, and organizational components
      </li>
    </ul>

    <h2 style={{ color: "#45b7d1", marginBottom: "15px" }}>🎛️ Architecture</h2>
    <p style={{ marginBottom: "20px" }}>
      Visual Fiha uses a modular worker/message architecture with:
    </p>

    <ul style={{ marginBottom: "30px" }}>
      <li>
        <strong>Controls</strong> - React-based user interface
      </li>
      <li>
        <strong>Display Workers</strong> - Rendering pipeline for visual output
      </li>
      <li>
        <strong>Layers</strong> - Canvas 2D and Three.js rendering layers
      </li>
      <li>
        <strong>Inputs</strong> - MIDI, audio, and interaction handling
      </li>
    </ul>

    <h2 style={{ color: "#96ceb4", marginBottom: "15px" }}>
      🚀 Getting Started
    </h2>
    <p style={{ marginBottom: "10px" }}>
      Navigate through the sidebar to explore different components and their
      variants. Each component includes:
    </p>

    <ul>
      <li>Interactive controls to test different props</li>
      <li>Multiple usage examples and states</li>
      <li>Accessibility testing with a11y addon</li>
      <li>Responsive behavior across different screen sizes</li>
    </ul>

    <div
      style={{
        marginTop: "40px",
        padding: "20px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        border: "1px solid #dee2e6",
      }}
    >
      <h3 style={{ margin: "0 0 10px 0", color: "#495057" }}>💡 Tip</h3>
      <p style={{ margin: 0, color: "#6c757d" }}>
        Use the Controls panel below each story to experiment with different
        component configurations and see how they behave in real-time.
      </p>
    </div>
  </div>
);

const meta: Meta<typeof WelcomeComponent> = {
  title: "Welcome",
  component: WelcomeComponent,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Visual Fiha is a browser-based creative coding platform for interactive visuals.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Introduction: Story = {};
