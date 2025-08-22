import type { Meta, StoryObj } from "@storybook/react";
import AttachmentsList from "./AttachmentsList";

// Mock file attachments
const mockAttachments = [
  {
    type: "file",
    filename: "particle-system.ts",
    mediaType: "text/typescript",
    url: "data:text/plain;base64,aW50ZXJmYWNlIFBhcnRpY2xlIHt9",
  },
  {
    type: "file",
    filename: "background.jpg",
    mediaType: "image/jpeg",
    url: "https://via.placeholder.com/400x300/4ecdc4/ffffff?text=Background+Image",
  },
  {
    type: "file",
    filename: "config.json",
    mediaType: "application/json",
    url: "data:application/json;base64,eyJuYW1lIjoidGVzdCJ9",
  },
  {
    type: "file",
    filename: "demo-video.mp4",
    mediaType: "video/mp4",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
];

const meta: Meta<typeof AttachmentsList> = {
  title: "Features/AIAssistant/AttachmentsList",
  component: AttachmentsList,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    onRemove: { action: "removed" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    attachments: [],
    onRemove: () => {},
  },
};

export const SingleAttachment: Story = {
  args: {
    attachments: [mockAttachments[0]] as any,
    onRemove: () => {},
  },
};

export const MultipleAttachments: Story = {
  args: {
    attachments: mockAttachments as any,
    onRemove: () => {},
  },
};

export const ImageAttachments: Story = {
  args: {
    attachments: [
      {
        type: "file",
        filename: "screenshot1.png",
        mediaType: "image/png",
        url: "https://via.placeholder.com/200x150/ff6b6b/ffffff?text=Screenshot+1",
      },
      {
        type: "file",
        filename: "reference.jpg",
        mediaType: "image/jpeg",
        url: "https://via.placeholder.com/200x150/45b7d1/ffffff?text=Reference",
      },
      {
        type: "file",
        filename: "texture.gif",
        mediaType: "image/gif",
        url: "https://via.placeholder.com/200x150/96ceb4/ffffff?text=Animated+GIF",
      },
    ] as any,
    onRemove: () => {},
  },
};

export const CodeFiles: Story = {
  args: {
    attachments: [
      {
        type: "file",
        filename: "setup.ts",
        mediaType: "text/typescript",
        url: "data:text/plain;base64,Y29uc3QgY2FudmFzID0gZ2V0Q2FudmFzKCk=",
      },
      {
        type: "file",
        filename: "animation.js",
        mediaType: "text/javascript",
        url: "data:text/plain;base64,ZnVuY3Rpb24gYW5pbWF0ZSgpIHt9",
      },
      {
        type: "file",
        filename: "styles.css",
        mediaType: "text/css",
        url: "data:text/plain;base64,Ym9keSB7IG1hcmdpbjogMDsgfQ==",
      },
    ] as any,
    onRemove: () => {},
  },
};

export const MixedFileTypes: Story = {
  args: {
    attachments: [
      {
        type: "file",
        filename: "README.md",
        mediaType: "text/markdown",
        url: "data:text/plain;base64,IyBQcm9qZWN0IFJlYWRtZQ==",
      },
      {
        type: "file",
        filename: "data.json",
        mediaType: "application/json",
        url: "data:application/json;base64,eyJkYXRhIjogInZhbHVlIn0=",
      },
      {
        type: "file",
        filename: "document.pdf",
        mediaType: "application/pdf",
        url: "data:application/pdf;base64,JVBERi0xLjQ=",
      },
    ] as any,
    onRemove: () => {},
  },
};

export const WithRemoveActions: Story = {
  args: {
    attachments: mockAttachments.slice(0, 2) as any,
    onRemove: (filename: string) => {
      console.log(`Remove attachment: ${filename}`);
    },
  },
};

export const InChatInterface: Story = {
  render: (args) => (
    <div
      style={{
        maxWidth: "500px",
        backgroundColor: "#f8f9fa",
        border: "1px solid #dee2e6",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px",
          backgroundColor: "#343a40",
          color: "white",
          borderBottom: "1px solid #dee2e6",
        }}
      >
        <strong>📎 Attachments</strong>
      </div>
      <div style={{ padding: "12px" }}>
        <AttachmentsList {...args} />
      </div>
      <div
        style={{
          padding: "12px",
          backgroundColor: "#e9ecef",
          borderTop: "1px solid #dee2e6",
          fontSize: "12px",
          color: "#6c757d",
        }}
      >
        Drag files here or click to attach
      </div>
    </div>
  ),
  args: {
    attachments: mockAttachments as any,
    onRemove: () => {},
  },
};

export const LongFilenames: Story = {
  args: {
    attachments: [
      {
        type: "file",
        filename:
          "very-long-filename-that-might-overflow-the-container-and-cause-layout-issues.ts",
        mediaType: "text/typescript",
        url: "data:text/plain;base64,Y29uc3QgY2FudmFzID0gZ2V0Q2FudmFzKCk=",
      },
      {
        type: "file",
        filename:
          "another-extremely-long-filename-with-multiple-words-and-numbers-12345.json",
        mediaType: "application/json",
        url: "data:application/json;base64,eyJkYXRhIjogInZhbHVlIn0=",
      },
    ] as any,
    onRemove: () => {},
  },
};
