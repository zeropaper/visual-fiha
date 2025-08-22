import type { Meta, StoryObj } from "@storybook/react";
import AttachmentTypeIcon from "./AttachmentTypeIcon";

const meta: Meta<typeof AttachmentTypeIcon> = {
  title: "Features/AIAssistant/AttachmentTypeIcon",
  component: AttachmentTypeIcon,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: [
        "text/plain",
        "text/markdown",
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/gif",
        "image/webp",
        "video/mp4",
        "video/webm",
        "audio/mpeg",
        "audio/wav",
        "application/json",
        "application/javascript",
        "text/javascript",
        "text/typescript",
        "unknown/type",
      ],
    },
    className: {
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const TextFile: Story = {
  args: {
    type: "text/plain",
  },
};

export const MarkdownFile: Story = {
  args: {
    type: "text/markdown",
  },
};

export const PDFFile: Story = {
  args: {
    type: "application/pdf",
  },
};

export const ImagePNG: Story = {
  args: {
    type: "image/png",
  },
};

export const ImageJPEG: Story = {
  args: {
    type: "image/jpeg",
  },
};

export const VideoMP4: Story = {
  args: {
    type: "video/mp4",
  },
};

export const AudioMP3: Story = {
  args: {
    type: "audio/mpeg",
  },
};

export const JSONFile: Story = {
  args: {
    type: "application/json",
  },
};

export const JavaScriptFile: Story = {
  args: {
    type: "text/javascript",
  },
};

export const TypeScriptFile: Story = {
  args: {
    type: "text/typescript",
  },
};

export const UnknownFile: Story = {
  args: {
    type: "unknown/type",
  },
};

export const WithCustomClass: Story = {
  args: {
    type: "image/png",
    className: "custom-icon-style",
  },
};

export const AllFileTypes: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        gap: "20px",
        padding: "20px",
      }}
    >
      {[
        { type: "text/plain", label: "Text" },
        { type: "text/markdown", label: "Markdown" },
        { type: "application/pdf", label: "PDF" },
        { type: "image/png", label: "Image" },
        { type: "video/mp4", label: "Video" },
        { type: "audio/mpeg", label: "Audio" },
        { type: "application/json", label: "JSON" },
        { type: "text/javascript", label: "JavaScript" },
        { type: "unknown/type", label: "Unknown" },
      ].map(({ type, label }) => (
        <div
          key={type}
          style={{
            textAlign: "center",
            padding: "16px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <AttachmentTypeIcon type={type} />
          <div style={{ marginTop: "8px", fontSize: "12px" }}>{label}</div>
          <div style={{ fontSize: "10px", color: "#666" }}>{type}</div>
        </div>
      ))}
    </div>
  ),
};
