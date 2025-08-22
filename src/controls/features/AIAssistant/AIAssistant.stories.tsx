import type { Meta, StoryObj } from "@storybook/react";
import type * as monaco from "monaco-editor";
import { withVisualFihaContexts } from "../../../../.storybook/decorators";
import { AIAssistant } from "./AIAssistant";

// Mock Monaco editor for Storybook
const mockEditor = {
  getValue: () => "// Mock editor content",
  setValue: () => {},
  getModel: () => ({
    getLanguageId: () => "typescript",
  }),
  onDidChangeModelContent: () => ({ dispose: () => {} }),
  addCommand: () => {},
  trigger: () => {},
  focus: () => {},
  layout: () => {},
  getDomNode: () => {
    const node = document.createElement("div");
    const guard = document.createElement("div");
    guard.classList.add("overflow-guard");
    node.appendChild(guard);
    return node;
  },
} as unknown as monaco.editor.IStandaloneCodeEditor;

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
    editor: {
      control: false,
      description: "Monaco editor instance",
    },
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
    editor: mockEditor,
    role: "setup",
    type: "worker",
    id: "worker",
    layerType: null,
  },
};

export const WorkerAnimationScript: Story = {
  args: {
    editor: mockEditor,
    role: "animation",
    type: "worker",
    id: "worker",
    layerType: null,
  },
};

export const CanvasLayerSetup: Story = {
  args: {
    editor: mockEditor,
    role: "setup",
    type: "layer",
    id: "canvas-layer-1",
    layerType: "canvas",
  },
};

export const CanvasLayerAnimation: Story = {
  args: {
    editor: mockEditor,
    role: "animation",
    type: "layer",
    id: "canvas-layer-1",
    layerType: "canvas",
  },
};

export const ThreeJSLayerSetup: Story = {
  args: {
    editor: mockEditor,
    role: "setup",
    type: "layer",
    id: "threejs-layer-1",
    layerType: "threejs",
  },
};

export const ThreeJSLayerAnimation: Story = {
  args: {
    editor: mockEditor,
    role: "animation",
    type: "layer",
    id: "threejs-layer-1",
    layerType: "threejs",
  },
};
