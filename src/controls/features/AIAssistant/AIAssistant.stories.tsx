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
    layerType: {
      control: { type: "select" },
      options: ["canvas", "threejs", null],
      description: "Layer type for layer scripts",
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
    layerType: null,
  },
};

export const WorkerAnimationScript: Story = {
  args: {
    role: "animation",
    type: "worker",
    id: "worker",
    layerType: null,
  },
};

export const CanvasLayerSetup: Story = {
  args: {
    role: "setup",
    type: "layer",
    id: "canvas-layer-1",
    layerType: "canvas",
  },
};

export const CanvasLayerAnimation: Story = {
  args: {
    role: "animation",
    type: "layer",
    id: "canvas-layer-1",
    layerType: "canvas",
  },
};

export const ThreeJSLayerSetup: Story = {
  args: {
    role: "setup",
    type: "layer",
    id: "threejs-layer-1",
    layerType: "threejs",
  },
};

export const ThreeJSLayerAnimation: Story = {
  args: {
    role: "animation",
    type: "layer",
    id: "threejs-layer-1",
    layerType: "threejs",
  },
};
