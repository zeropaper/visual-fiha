import type { Meta, StoryObj } from "@storybook/react";
import { Messages } from "./Messages";

// Simplified mock messages for Storybook
const mockMessages = [
  {
    id: "msg-1",
    role: "user" as const,
    parts: [
      {
        type: "text" as const,
        text: "Can you help me create a simple canvas animation that draws a rotating triangle?",
      },
    ],
  },
  {
    id: "msg-2",
    role: "assistant" as const,
    parts: [
      {
        type: "text" as const,
        text: "I'll help you create a rotating triangle animation. Let me write the setup and animation scripts for you.",
      },
    ],
  },
  {
    id: "msg-3",
    role: "user" as const,
    parts: [
      {
        type: "text" as const,
        text: "That looks great! Can you make it change colors over time?",
      },
    ],
  },
  {
    id: "msg-4",
    role: "assistant" as const,
    parts: [
      {
        type: "text" as const,
        text: 'I can add color animation using HSL colors that cycle over time. Here\'s the updated code:\n\n```typescript\n// Enhanced animation with color cycling\nconst ctx = getContext();\nconst { width, height } = getCanvas();\nconst time = Date.now() * 0.001;\n\n// Clear canvas\nctx.clearRect(0, 0, width, height);\n\n// Move to center\nctx.save();\nctx.translate(width / 2, height / 2);\nctx.rotate(rotation);\n\n// Draw triangle\nctx.beginPath();\nctx.moveTo(0, -50);\nctx.lineTo(-43, 25);\nctx.lineTo(43, 25);\nctx.closePath();\n\n// Animated colors\nconst hue = (time * 50) % 360;\nctx.fillStyle = "hsl(" + hue + ", 70%, 60%)";\nctx.fill();\nctx.strokeStyle = "hsl(" + ((hue + 180) % 360) + ", 70%, 60%)";\nctx.lineWidth = 3;\nctx.stroke();\n\nctx.restore();\n\n// Update rotation\nrotation += 0.02;\n```',
      },
    ],
  },
];

const mockMessagesWithConfirmation = [
  ...mockMessages,
  {
    id: "msg-confirm",
    role: "assistant" as const,
    parts: [
      {
        type: "tool-askForConfirmation" as const,
        toolCallId: "confirm-1",
        state: "input-available" as const,
        input: {
          message:
            "This will overwrite your current animation script. Do you want to continue?",
        },
      },
    ],
  },
];

const mockAddToolResult = async () => {
  console.log("Tool result added");
};

const meta: Meta<typeof Messages> = {
  title: "Features/AIAssistant/Messages",
  component: Messages,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    addToolResult: { action: "tool-result-added" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    messages: [],
    addToolResult: mockAddToolResult,
  },
};

export const SingleUserMessage: Story = {
  args: {
    messages: [mockMessages[0]] as any,
    addToolResult: mockAddToolResult,
  },
};

export const ConversationFlow: Story = {
  args: {
    messages: mockMessages as any,
    addToolResult: mockAddToolResult,
  },
};

export const WithConfirmation: Story = {
  args: {
    messages: mockMessagesWithConfirmation as any,
    addToolResult: mockAddToolResult,
  },
};

export const ErrorMessage: Story = {
  args: {
    messages: [
      {
        id: "msg-error",
        role: "assistant" as const,
        parts: [
          {
            type: "text" as const,
            text: "❌ **Error**: Unable to execute the script due to a syntax error.\n\n```\nSyntaxError: Unexpected token '}' at line 15\n```\n\nPlease check your code and try again.",
          },
        ],
      },
    ] as any,
    addToolResult: mockAddToolResult,
  },
};

export const WithCodeBlocks: Story = {
  args: {
    messages: [
      {
        id: "msg-code",
        role: "assistant" as const,
        parts: [
          {
            type: "text" as const,
            text: `Here's how to create a simple particle system:

\`\`\`typescript
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

const particles: Particle[] = [];

function createParticle(x: number, y: number): Particle {
  return {
    x,
    y,
    vx: (Math.random() - 0.5) * 4,
    vy: (Math.random() - 0.5) * 4,
    life: 1.0,
    color: "hsl(" + Math.random() * 360 + ", 70%, 60%)"
  };
}
\`\`\`

This creates a basic particle structure with position, velocity, and color properties.`,
          },
        ],
      },
    ] as any,
    addToolResult: mockAddToolResult,
  },
};

export const ScrollableContainer: Story = {
  render: (args) => (
    <div
      style={{
        height: "400px",
        maxWidth: "600px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "#f8f9fa",
      }}
    >
      <div
        style={{
          padding: "12px",
          backgroundColor: "#343a40",
          color: "white",
          borderBottom: "1px solid #ccc",
        }}
      >
        <strong>🤖 AI Assistant Chat</strong>
      </div>
      <div style={{ height: "calc(100% - 45px)", overflow: "auto" }}>
        <Messages {...args} />
      </div>
    </div>
  ),
  args: {
    messages: mockMessages as any,
    addToolResult: mockAddToolResult,
  },
};
