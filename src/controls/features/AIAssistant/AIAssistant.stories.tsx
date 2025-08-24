import type { Meta, StoryObj } from "@storybook/react";
import { withVisualFihaContexts } from "../../../../.storybook/decorators";
import { AIAssistant } from "./AIAssistant";

const meta: Meta<typeof AIAssistant> = {
  title: "Features/AIAssistant/AIAssistant",
  component: AIAssistant,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Complete AI Assistant component with all required contexts.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    role: {
      control: { type: "select" },
      options: ["setup", "animation"],
      description: "Script role being edited",
    },
    type: {
      control: { type: "select" },
      options: ["worker", "layer"],
      description: "Script type",
    },
    id: {
      control: { type: "text" },
      description: "Unique identifier for the script",
    },
  },
  decorators: [withVisualFihaContexts],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WorkerSetupScript: Story = {
  args: {
    role: "setup",
    type: "worker",
    id: "worker",
  },
};

export const WorkerAnimationScript: Story = {
  args: {
    role: "animation",
    type: "worker",
    id: "worker",
  },
};

export const CanvasLayerSetup: Story = {
  args: {
    role: "setup",
    type: "canvas",
    id: "canvas-layer-1",
  },
};

export const CanvasLayerAnimation: Story = {
  args: {
    role: "animation",
    type: "canvas",
    id: "canvas-layer-1",
  },
};

export const ThreeJSLayerSetup: Story = {
  args: {
    role: "setup",
    type: "threejs",
    id: "threejs-layer-1",
  },
};

export const ThreeJSLayerAnimation: Story = {
  args: {
    role: "animation",
    type: "threejs",
    id: "threejs-layer-1",
  },
};
