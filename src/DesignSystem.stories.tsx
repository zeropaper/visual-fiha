import type { Meta, StoryObj } from "@storybook/react";

const DesignSystemComponent = () => (
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
      🎨 Visual Fiha Design System
    </h1>

    <h2 style={{ color: "#4ecdc4", marginBottom: "15px" }}>🎨 Color Palette</h2>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "20px",
        marginBottom: "30px",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: "100%",
            height: "80px",
            backgroundColor: "#181818",
            borderRadius: "8px",
            marginBottom: "10px",
            border: "1px solid #333",
          }}
        />
        <strong>Primary Dark</strong>
        <br />
        <code>#181818</code>
      </div>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: "100%",
            height: "80px",
            backgroundColor: "#ff6b6b",
            borderRadius: "8px",
            marginBottom: "10px",
          }}
        />
        <strong>Accent Red</strong>
        <br />
        <code>#ff6b6b</code>
      </div>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: "100%",
            height: "80px",
            backgroundColor: "#4ecdc4",
            borderRadius: "8px",
            marginBottom: "10px",
          }}
        />
        <strong>Accent Teal</strong>
        <br />
        <code>#4ecdc4</code>
      </div>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: "100%",
            height: "80px",
            backgroundColor: "#45b7d1",
            borderRadius: "8px",
            marginBottom: "10px",
          }}
        />
        <strong>Accent Blue</strong>
        <br />
        <code>#45b7d1</code>
      </div>
    </div>

    <h2 style={{ color: "#45b7d1", marginBottom: "15px" }}>📝 Typography</h2>
    <div style={{ marginBottom: "30px" }}>
      <h1 style={{ margin: "0 0 10px 0", fontSize: "32px" }}>
        Heading 1 - Main titles
      </h1>
      <h2 style={{ margin: "0 0 10px 0", fontSize: "24px" }}>
        Heading 2 - Section titles
      </h2>
      <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>
        Heading 3 - Subsection titles
      </h3>
      <p style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
        Body text - Regular content and descriptions
      </p>
      <small style={{ fontSize: "14px", color: "#666" }}>
        Small text - Captions and metadata
      </small>
      <br />
      <br />
      <code
        style={{
          fontSize: "14px",
          backgroundColor: "#f8f9fa",
          padding: "2px 6px",
          borderRadius: "4px",
          fontFamily: "monospace",
        }}
      >
        Code text - Technical content
      </code>
    </div>

    <h2 style={{ color: "#96ceb4", marginBottom: "15px" }}>
      🔲 Component Spacing
    </h2>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "20px",
        marginBottom: "30px",
      }}
    >
      {[4, 8, 12, 16, 20, 24, 32, 40].map((size) => (
        <div key={size} style={{ textAlign: "center" }}>
          <div
            style={{
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: "#4ecdc4",
              borderRadius: "4px",
              margin: "0 auto 10px",
            }}
          />
          <strong>{size}px</strong>
        </div>
      ))}
    </div>

    <h2 style={{ color: "#6c5ce7", marginBottom: "15px" }}>
      🎛️ Component Guidelines
    </h2>

    <h3 style={{ color: "#96ceb4", marginBottom: "10px" }}>Buttons</h3>
    <ul style={{ marginBottom: "20px" }}>
      <li>Use clear, action-oriented labels</li>
      <li>Icon variant for compact interfaces</li>
      <li>Consistent hover and focus states</li>
      <li>Proper disabled states for accessibility</li>
    </ul>

    <h3 style={{ color: "#96ceb4", marginBottom: "10px" }}>Form Controls</h3>
    <ul style={{ marginBottom: "20px" }}>
      <li>Clear placeholder text and labels</li>
      <li>Consistent sizing across input types</li>
      <li>Proper validation states</li>
      <li>Keyboard navigation support</li>
    </ul>

    <h3 style={{ color: "#96ceb4", marginBottom: "10px" }}>Layout</h3>
    <ul style={{ marginBottom: "20px" }}>
      <li>Responsive grid system</li>
      <li>Consistent spacing using 4px base unit</li>
      <li>Dark theme optimized color contrast</li>
      <li>Sidebar navigation pattern</li>
    </ul>

    <h2 style={{ color: "#ff6b6b", marginBottom: "15px" }}>♿ Accessibility</h2>
    <div
      style={{
        backgroundColor: "#d4edda",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "20px",
        border: "1px solid #c3e6cb",
      }}
    >
      <h3 style={{ margin: "0 0 10px 0", color: "#155724" }}>Standards</h3>
      <ul style={{ margin: 0, color: "#155724" }}>
        <li>
          <strong>WCAG 2.1 AA</strong> - Color contrast requirements met
        </li>
        <li>
          <strong>Keyboard Navigation</strong> - All interactive elements
          accessible
        </li>
        <li>
          <strong>Screen Readers</strong> - Proper ARIA labels and semantic HTML
        </li>
        <li>
          <strong>Focus Management</strong> - Clear focus indicators
        </li>
      </ul>
    </div>

    <div
      style={{
        backgroundColor: "#fff3cd",
        padding: "20px",
        borderRadius: "8px",
        border: "1px solid #ffeaa7",
      }}
    >
      <h3 style={{ margin: "0 0 10px 0", color: "#856404" }}>Testing</h3>
      <p style={{ margin: 0, color: "#856404" }}>
        Use the a11y addon in Storybook to automatically test components for
        accessibility violations. All stories should pass a11y checks before
        deployment.
      </p>
    </div>
  </div>
);

const meta: Meta<typeof DesignSystemComponent> = {
  title: "Documentation/Design System",
  component: DesignSystemComponent,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Visual Fiha design system guidelines and standards.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
