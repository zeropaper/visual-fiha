import type { Meta, StoryObj } from "@storybook/react";

const AIAssistantGuideComponent = () => (
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
      📖 AI Assistant Usage Guide
    </h1>

    <p style={{ fontSize: "18px", marginBottom: "30px" }}>
      Learn how to effectively use the AI Assistant to enhance your Visual Fiha
      creative coding experience.
    </p>

    <h2 style={{ color: "#4ecdc4", marginBottom: "15px" }}>
      🚀 Getting Started
    </h2>

    <h3 style={{ color: "#96ceb4", marginBottom: "10px" }}>
      1. Configure AI Provider
    </h3>
    <div
      style={{
        backgroundColor: "#d4edda",
        padding: "16px",
        borderRadius: "6px",
        marginBottom: "20px",
        border: "1px solid #c3e6cb",
      }}
    >
      <p style={{ margin: "0 0 12px 0", color: "#155724" }}>
        First, set up your AI provider credentials:
      </p>
      <ul style={{ margin: 0, paddingLeft: "20px", color: "#155724" }}>
        <li>
          <strong>OpenAI</strong> - Get API key from platform.openai.com
        </li>
        <li>
          <strong>Mistral</strong> - Get API key from console.mistral.ai
        </li>
        <li>
          <strong>Ollama</strong> - Set up local server at
          http://localhost:11434
        </li>
      </ul>
    </div>

    <h3 style={{ color: "#96ceb4", marginBottom: "10px" }}>
      2. Start a Conversation
    </h3>
    <p style={{ marginBottom: "20px" }}>
      Open the AI Assistant panel and start with a clear, specific request:
    </p>

    <div
      style={{
        backgroundColor: "#f8f9fa",
        padding: "16px",
        borderRadius: "6px",
        marginBottom: "20px",
        border: "1px solid #dee2e6",
        fontFamily: "monospace",
        fontSize: "14px",
      }}
    >
      <div style={{ marginBottom: "8px", color: "#28a745" }}>
        <strong>✅ Good:</strong> "Create a rotating triangle animation with
        rainbow colors"
      </div>
      <div style={{ color: "#dc3545" }}>
        <strong>❌ Avoid:</strong> "Make something cool"
      </div>
    </div>

    <h2 style={{ color: "#45b7d1", marginBottom: "15px" }}>
      💡 Effective Prompting
    </h2>

    <h3 style={{ color: "#96ceb4", marginBottom: "10px" }}>
      Animation Requests
    </h3>
    <ul style={{ marginBottom: "20px" }}>
      <li>
        "Create a particle system with 100 particles that respond to mouse
        position"
      </li>
      <li>"Make a 3D cube that rotates and changes material based on time"</li>
      <li>
        "Add physics simulation with bouncing balls that collide with canvas
        edges"
      </li>
      <li>"Create a fractal tree animation that grows over time"</li>
    </ul>

    <h3 style={{ color: "#96ceb4", marginBottom: "10px" }}>
      Code Modification
    </h3>
    <ul style={{ marginBottom: "20px" }}>
      <li>"Add MIDI control to the rotation speed parameter"</li>
      <li>"Optimize this animation for better performance"</li>
      <li>"Fix the syntax error in my setup script"</li>
      <li>"Convert this 2D animation to use Three.js"</li>
    </ul>

    <h3 style={{ color: "#96ceb4", marginBottom: "10px" }}>Visual Effects</h3>
    <ul style={{ marginBottom: "20px" }}>
      <li>"Add bloom effect and color cycling to the current scene"</li>
      <li>"Create a tunnel effect with moving textures"</li>
      <li>"Add motion blur and trailing effects"</li>
      <li>"Make the colors respond to audio frequency data"</li>
    </ul>

    <h2 style={{ color: "#6c5ce7", marginBottom: "15px" }}>
      📎 Using Attachments
    </h2>

    <div
      style={{
        backgroundColor: "#fff3cd",
        padding: "16px",
        borderRadius: "6px",
        marginBottom: "20px",
        border: "1px solid #ffeaa7",
      }}
    >
      <h4 style={{ margin: "0 0 8px 0", color: "#856404" }}>
        Supported File Types:
      </h4>
      <ul style={{ margin: 0, paddingLeft: "20px", color: "#856404" }}>
        <li>
          <strong>Images</strong> - Screenshots, textures, reference images
        </li>
        <li>
          <strong>Code Files</strong> - TypeScript, JavaScript, JSON
          configurations
        </li>
        <li>
          <strong>Text Files</strong> - Documentation, requirements, notes
        </li>
        <li>
          <strong>Media</strong> - Video references, audio samples
        </li>
      </ul>
    </div>

    <h3 style={{ color: "#96ceb4", marginBottom: "10px" }}>
      Example Use Cases:
    </h3>
    <ul style={{ marginBottom: "20px" }}>
      <li>Attach a screenshot: "Make this effect but with different colors"</li>
      <li>
        Share existing code: "Improve this particle system for better
        performance"
      </li>
      <li>Provide reference: "Create an animation inspired by this image"</li>
    </ul>

    <h2 style={{ color: "#ff6b6b", marginBottom: "15px" }}>
      🔧 Advanced Features
    </h2>

    <h3 style={{ color: "#96ceb4", marginBottom: "10px" }}>
      Context Awareness
    </h3>
    <p style={{ marginBottom: "15px" }}>
      The AI Assistant understands your current context:
    </p>
    <ul style={{ marginBottom: "20px" }}>
      <li>
        <strong>Layer Type</strong> - Knows if you're working with Canvas 2D or
        Three.js
      </li>
      <li>
        <strong>Current Scripts</strong> - Can read and modify your existing
        code
      </li>
      <li>
        <strong>Visual Output</strong> - Can take screenshots to see current
        results
      </li>
    </ul>

    <h3 style={{ color: "#96ceb4", marginBottom: "10px" }}>Tool Integration</h3>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          padding: "12px",
          backgroundColor: "#e7f3ff",
          borderRadius: "6px",
          border: "1px solid #b3d9ff",
        }}
      >
        <strong style={{ color: "#0056b3" }}>Script Updates</strong>
        <p style={{ margin: "8px 0 0 0", fontSize: "13px", color: "#0056b3" }}>
          Directly modifies your setup and animation scripts
        </p>
      </div>
      <div
        style={{
          padding: "12px",
          backgroundColor: "#fff0e6",
          borderRadius: "6px",
          border: "1px solid #ffcc99",
        }}
      >
        <strong style={{ color: "#cc6600" }}>Visual Feedback</strong>
        <p style={{ margin: "8px 0 0 0", fontSize: "13px", color: "#cc6600" }}>
          Takes screenshots to verify results
        </p>
      </div>
      <div
        style={{
          padding: "12px",
          backgroundColor: "#f0f8e6",
          borderRadius: "6px",
          border: "1px solid #ccdb99",
        }}
      >
        <strong style={{ color: "#4d6600" }}>Safety Checks</strong>
        <p style={{ margin: "8px 0 0 0", fontSize: "13px", color: "#4d6600" }}>
          Asks for confirmation on major changes
        </p>
      </div>
    </div>

    <h2 style={{ color: "#17a2b8", marginBottom: "15px" }}>
      🎯 Best Practices
    </h2>

    <div
      style={{
        backgroundColor: "#d1ecf1",
        padding: "20px",
        borderRadius: "8px",
        border: "1px solid #bee5eb",
        marginBottom: "20px",
      }}
    >
      <h4 style={{ margin: "0 0 12px 0", color: "#0c5460" }}>Do:</h4>
      <ul style={{ margin: 0, paddingLeft: "20px", color: "#0c5460" }}>
        <li>Be specific about what you want to achieve</li>
        <li>Mention performance requirements if relevant</li>
        <li>Provide context about your artistic vision</li>
        <li>Ask for explanations of complex code</li>
        <li>Request optimization suggestions</li>
      </ul>
    </div>

    <div
      style={{
        backgroundColor: "#f8d7da",
        padding: "20px",
        borderRadius: "8px",
        border: "1px solid #f5c6cb",
        marginBottom: "20px",
      }}
    >
      <h4 style={{ margin: "0 0 12px 0", color: "#721c24" }}>Avoid:</h4>
      <ul style={{ margin: 0, paddingLeft: "20px", color: "#721c24" }}>
        <li>Vague requests without clear objectives</li>
        <li>Asking for complete rewrites without context</li>
        <li>Ignoring confirmation dialogs</li>
        <li>Sharing sensitive or personal information</li>
        <li>Expecting the AI to understand external resources</li>
      </ul>
    </div>

    <h2 style={{ color: "#28a745", marginBottom: "15px" }}>
      🔍 Troubleshooting
    </h2>

    <h3 style={{ color: "#96ceb4", marginBottom: "10px" }}>Common Issues:</h3>
    <div
      style={{
        backgroundColor: "#f8f9fa",
        padding: "16px",
        borderRadius: "6px",
        marginBottom: "20px",
      }}
    >
      <ul style={{ margin: 0, paddingLeft: "20px" }}>
        <li>
          <strong>AI not responding:</strong> Check your API credentials and
          internet connection
        </li>
        <li>
          <strong>Script errors:</strong> Ask the AI to review and fix syntax
          issues
        </li>
        <li>
          <strong>Performance issues:</strong> Request optimization or simpler
          alternatives
        </li>
        <li>
          <strong>Unexpected results:</strong> Provide screenshots and describe
          the issue
        </li>
      </ul>
    </div>

    <div
      style={{
        backgroundColor: "#e2e3e5",
        padding: "20px",
        borderRadius: "8px",
        border: "1px solid #c6c8ca",
      }}
    >
      <h4 style={{ margin: "0 0 10px 0", color: "#383d41" }}>💡 Pro Tip</h4>
      <p style={{ margin: 0, color: "#383d41" }}>
        Start with simple requests and gradually build complexity. The AI
        Assistant learns from your conversation context, so each interaction
        builds on previous ones.
      </p>
    </div>
  </div>
);

const meta: Meta<typeof AIAssistantGuideComponent> = {
  title: "Features/AIAssistant/Usage Guide",
  component: AIAssistantGuideComponent,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Comprehensive guide for effectively using the AI Assistant feature.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const CompleteGuide: Story = {};
