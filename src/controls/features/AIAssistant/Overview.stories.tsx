import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import AttachmentTypeIcon from "./AttachmentTypeIcon";
import { AIAssistantCredentialsForm } from "./CredentialsForm";

// Mock data and components showcase
const AIAssistantOverview = () => {
  const [showCredentials, setShowCredentials] = useState(false);

  return (
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
        🤖 AI Assistant Feature
      </h1>

      <p style={{ fontSize: "18px", marginBottom: "30px" }}>
        The AI Assistant is an integrated AI-powered coding assistant that helps
        users create and modify Visual Fiha scripts. It supports multiple AI
        providers and includes specialized tools for working with canvas
        animations and Three.js scenes.
      </p>

      <h2 style={{ color: "#4ecdc4", marginBottom: "15px" }}>🏗️ Architecture</h2>
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
        }}
      >
        <h3 style={{ margin: "0 0 15px 0" }}>Core Components</h3>
        <ul style={{ margin: 0, paddingLeft: "20px" }}>
          <li>
            <strong>AIAssistant.tsx</strong> - Main component with chat
            interface
          </li>
          <li>
            <strong>Messages.tsx</strong> - Message display with markdown and
            tool results
          </li>
          <li>
            <strong>CredentialsForm.tsx</strong> - AI provider setup form
          </li>
          <li>
            <strong>AttachmentsList.tsx</strong> - File attachment management
          </li>
          <li>
            <strong>AttachmentTypeIcon.tsx</strong> - File type icons
          </li>
        </ul>
      </div>

      <h2 style={{ color: "#45b7d1", marginBottom: "15px" }}>🛠️ AI Tools</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
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
            🔧 setScript
          </h4>
          <p style={{ margin: 0, color: "#155724", fontSize: "14px" }}>
            Updates setup or animation scripts for layers or the global worker
          </p>
        </div>

        <div
          style={{
            padding: "16px",
            backgroundColor: "#d1ecf1",
            border: "1px solid #bee5eb",
            borderRadius: "8px",
          }}
        >
          <h4 style={{ margin: "0 0 8px 0", color: "#0c5460" }}>
            📖 getScript
          </h4>
          <p style={{ margin: 0, color: "#0c5460", fontSize: "14px" }}>
            Retrieves current script content for analysis or modification
          </p>
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
            📷 takeScreenshot
          </h4>
          <p style={{ margin: 0, color: "#856404", fontSize: "14px" }}>
            Captures display output for visual feedback and debugging
          </p>
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
            ❓ askForConfirmation
          </h4>
          <p style={{ margin: 0, color: "#721c24", fontSize: "14px" }}>
            Requests user confirmation before potentially destructive operations
          </p>
        </div>
      </div>

      <h2 style={{ color: "#96ceb4", marginBottom: "15px" }}>
        📁 File Type Support
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
          gap: "16px",
          marginBottom: "30px",
          padding: "20px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
        }}
      >
        {[
          { type: "text/plain", label: "Text" },
          { type: "image/png", label: "Images" },
          { type: "video/mp4", label: "Video" },
          { type: "audio/mpeg", label: "Audio" },
          { type: "application/json", label: "JSON" },
          { type: "text/javascript", label: "JS/TS" },
        ].map(({ type, label }) => (
          <div key={type} style={{ textAlign: "center" }}>
            <AttachmentTypeIcon type={type} />
            <div style={{ marginTop: "4px", fontSize: "12px" }}>{label}</div>
          </div>
        ))}
      </div>

      <h2 style={{ color: "#6c5ce7", marginBottom: "15px" }}>
        🔑 Provider Configuration
      </h2>
      <div style={{ marginBottom: "20px" }}>
        <button
          type="button"
          onClick={() => setShowCredentials(!showCredentials)}
          style={{
            padding: "12px 24px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {showCredentials ? "Hide" : "Show"} Credentials Form
        </button>
      </div>

      {showCredentials && (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#181818",
            color: "white",
            borderRadius: "8px",
            marginBottom: "30px",
          }}
        >
          <AIAssistantCredentialsForm
            onClose={() => setShowCredentials(false)}
          />
        </div>
      )}

      <h2 style={{ color: "#ff6b6b", marginBottom: "15px" }}>🚀 Features</h2>
      <div
        style={{
          backgroundColor: "#e9ecef",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
        }}
      >
        <ul style={{ margin: 0, paddingLeft: "20px" }}>
          <li>
            <strong>Multiple AI Providers</strong> - OpenAI, Mistral, and Ollama
            support
          </li>
          <li>
            <strong>Context-Aware</strong> - Understands current layer type and
            scripts
          </li>
          <li>
            <strong>File Attachments</strong> - Support for images, code, and
            other file types
          </li>
          <li>
            <strong>Tool Integration</strong> - Direct script modification and
            screenshot capture
          </li>
          <li>
            <strong>Markdown Rendering</strong> - Rich text formatting with code
            highlighting
          </li>
          <li>
            <strong>Confirmation Dialogs</strong> - Safe script modifications
            with user approval
          </li>
          <li>
            <strong>Persistent Chat</strong> - Conversation history stored
            locally
          </li>
        </ul>
      </div>

      <h2 style={{ color: "#17a2b8", marginBottom: "15px" }}>
        📋 Usage Examples
      </h2>
      <div
        style={{
          backgroundColor: "#d1ecf1",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #bee5eb",
        }}
      >
        <h4 style={{ margin: "0 0 10px 0" }}>Example Prompts:</h4>
        <ul style={{ margin: 0, paddingLeft: "20px" }}>
          <li>"Create a rotating triangle animation with color cycling"</li>
          <li>"Add particle effects to my current scene"</li>
          <li>"Fix the syntax error in my animation script"</li>
          <li>"Make the animation respond to MIDI input"</li>
          <li>"Optimize performance for 60fps rendering"</li>
        </ul>
      </div>
    </div>
  );
};

const meta: Meta<typeof AIAssistantOverview> = {
  title: "Features/AIAssistant/Overview",
  component: AIAssistantOverview,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Comprehensive overview of the AI Assistant feature architecture and capabilities.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const FeatureOverview: Story = {};
