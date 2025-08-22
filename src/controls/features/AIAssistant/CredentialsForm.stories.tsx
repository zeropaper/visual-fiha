import type { Meta, StoryObj } from "@storybook/react";
import { AIAssistantCredentialsForm } from "./CredentialsForm";

const meta: Meta<typeof AIAssistantCredentialsForm> = {
  title: "Features/AIAssistant/CredentialsForm",
  component: AIAssistantCredentialsForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    onClose: { action: "closed" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithCloseHandler: Story = {
  args: {
    onClose: () => console.log("Form closed"),
  },
};

export const InDialog: Story = {
  render: (args) => (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        border: "1px solid #dee2e6",
        maxWidth: "400px",
      }}
    >
      <h3 style={{ margin: "0 0 20px 0" }}>AI Assistant Setup</h3>
      <p style={{ margin: "0 0 20px 0", color: "#6c757d" }}>
        Configure your AI provider credentials to enable the assistant.
      </p>
      <AIAssistantCredentialsForm {...args} />
    </div>
  ),
};

export const WithInstructions: Story = {
  render: (args) => (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#181818",
        color: "white",
        borderRadius: "8px",
        maxWidth: "500px",
      }}
    >
      <h3 style={{ margin: "0 0 16px 0", color: "#ff6b6b" }}>
        🤖 AI Assistant Setup
      </h3>

      <div style={{ marginBottom: "20px" }}>
        <h4 style={{ margin: "0 0 8px 0", color: "#4ecdc4" }}>
          Supported Providers:
        </h4>
        <ul style={{ margin: "0 0 16px 0", paddingLeft: "20px" }}>
          <li>
            <strong>OpenAI</strong> - GPT models for code assistance
          </li>
          <li>
            <strong>Mistral</strong> - Alternative AI provider
          </li>
          <li>
            <strong>Ollama</strong> - Local AI server
          </li>
        </ul>
      </div>

      <div
        style={{
          backgroundColor: "#fff3cd",
          color: "#856404",
          padding: "12px",
          borderRadius: "4px",
          marginBottom: "20px",
          fontSize: "14px",
        }}
      >
        <strong>⚠️ Security Note:</strong> Credentials are stored locally in your
        browser. Never share your API keys with others.
      </div>

      <AIAssistantCredentialsForm {...args} />
    </div>
  ),
};
