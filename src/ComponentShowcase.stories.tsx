import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@ui/Button";
import { Input } from "@ui/Input";
import { Select } from "@ui/Select";

const ComponentShowcaseComponent = () => (
  <div
    style={{
      padding: "40px",
      fontFamily: "system-ui, sans-serif",
      maxWidth: "800px",
      margin: "0 auto",
      lineHeight: "1.6",
    }}
  >
    <h1 style={{ color: "#ff6b6b", marginBottom: "30px" }}>
      🧩 Component Showcase
    </h1>

    <div
      style={{
        display: "grid",
        gap: "40px",
        marginBottom: "40px",
      }}
    >
      <section>
        <h2 style={{ color: "#4ecdc4", marginBottom: "20px" }}>Buttons</h2>
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Button>Default Button</Button>
          <Button variant="icon">🎮</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section>
        <h2 style={{ color: "#45b7d1", marginBottom: "20px" }}>
          Form Controls
        </h2>
        <div
          style={{
            display: "grid",
            gap: "16px",
            maxWidth: "300px",
          }}
        >
          <Input placeholder="Enter text..." />
          <Input type="password" placeholder="Password..." />
          <Input type="number" placeholder="0" min="0" max="100" />
          <Select>
            <option value="">Select option...</option>
            <option value="canvas2d">Canvas 2D</option>
            <option value="threejs">Three.js</option>
            <option value="webgl">WebGL</option>
          </Select>
        </div>
      </section>

      <section>
        <h2 style={{ color: "#96ceb4", marginBottom: "20px" }}>
          Interactive Demo
        </h2>
        <div
          style={{
            backgroundColor: "#181818",
            color: "white",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #333",
          }}
        >
          <h3 style={{ margin: "0 0 16px 0" }}>Layer Configuration</h3>
          <div
            style={{
              display: "grid",
              gap: "12px",
              gridTemplateColumns: "1fr auto",
            }}
          >
            <Select>
              <option value="">Layer Type</option>
              <option value="canvas2d">Canvas 2D</option>
              <option value="threejs">Three.js</option>
            </Select>
            <Button variant="icon">➕</Button>

            <Input placeholder="Layer name..." />
            <Button variant="icon">👁️</Button>

            <Input type="range" min="0" max="100" defaultValue="100" />
            <Button variant="icon">🗑️</Button>
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ color: "#6c5ce7", marginBottom: "20px" }}>
          State Examples
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
          }}
        >
          <div
            style={{
              padding: "16px",
              backgroundColor: "#d4edda",
              border: "1px solid #c3e6cb",
              borderRadius: "8px",
            }}
          >
            <h4 style={{ margin: "0 0 8px 0", color: "#155724" }}>
              Success State
            </h4>
            <p
              style={{
                margin: "0 0 12px 0",
                color: "#155724",
                fontSize: "14px",
              }}
            >
              Layer compiled successfully
            </p>
            <Button
              style={{
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
              }}
            >
              Continue
            </Button>
          </div>

          <div
            style={{
              padding: "16px",
              backgroundColor: "#f8d7da",
              border: "1px solid #f5c6cb",
              borderRadius: "8px",
            }}
          >
            <h4 style={{ margin: "0 0 8px 0", color: "#721c24" }}>
              Error State
            </h4>
            <p
              style={{
                margin: "0 0 12px 0",
                color: "#721c24",
                fontSize: "14px",
              }}
            >
              Compilation failed: syntax error
            </p>
            <Button
              style={{
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
              }}
            >
              Fix Error
            </Button>
          </div>

          <div
            style={{
              padding: "16px",
              backgroundColor: "#fff3cd",
              border: "1px solid #ffeaa7",
              borderRadius: "8px",
            }}
          >
            <h4 style={{ margin: "0 0 8px 0", color: "#856404" }}>
              Warning State
            </h4>
            <p
              style={{
                margin: "0 0 12px 0",
                color: "#856404",
                fontSize: "14px",
              }}
            >
              Performance may be affected
            </p>
            <Button
              style={{
                backgroundColor: "#ffc107",
                color: "#212529",
                border: "none",
              }}
            >
              Optimize
            </Button>
          </div>
        </div>
      </section>
    </div>

    <div
      style={{
        marginTop: "40px",
        padding: "20px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        border: "1px solid #dee2e6",
      }}
    >
      <h3 style={{ margin: "0 0 10px 0", color: "#495057" }}>💡 Usage Notes</h3>
      <ul style={{ margin: 0, color: "#6c757d" }}>
        <li>All components support CSS module styling</li>
        <li>
          Icon buttons should include descriptive titles for accessibility
        </li>
        <li>Form controls inherit global font and color schemes</li>
        <li>
          State colors follow semantic conventions (green=success, red=error,
          etc.)
        </li>
      </ul>
    </div>
  </div>
);

const meta: Meta<typeof ComponentShowcaseComponent> = {
  title: "Examples/Component Showcase",
  component: ComponentShowcaseComponent,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Real-world examples of Visual Fiha components in action.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AllComponents: Story = {};

export const DarkTheme: Story = {
  parameters: {
    backgrounds: { default: "dark" },
  },
};

export const LightTheme: Story = {
  parameters: {
    backgrounds: { default: "light" },
  },
};
