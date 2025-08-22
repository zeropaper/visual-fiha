import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { type SidebarTab, SidebarTabs } from "./SidebarTabs";

// Mock tabs for the story
const mockTabs = {
  layers: {
    title: "Layers",
    icon: <span>🎭</span>,
    content: (
      <div>
        <h3>Layers Panel</h3>
        <p>This is where you would manage your visual layers.</p>
        <ul>
          <li>Canvas 2D Layer</li>
          <li>Three.js Layer</li>
          <li>WebGL Layer</li>
        </ul>
      </div>
    ),
  },
  inputs: {
    title: "Inputs",
    icon: <span>🎮</span>,
    content: (
      <div>
        <h3>Inputs Panel</h3>
        <p>Configure your input sources here.</p>
        <ul>
          <li>MIDI Controller</li>
          <li>Audio Input</li>
          <li>Keyboard</li>
          <li>Mouse</li>
        </ul>
      </div>
    ),
  },
  displays: {
    title: "Displays",
    icon: <span>🖥️</span>,
    content: (
      <div>
        <h3>Display Management</h3>
        <p>Manage your display windows and outputs.</p>
        <div>
          <button type="button">Open New Display</button>
          <button type="button">Fullscreen</button>
        </div>
      </div>
    ),
  },
  settings: {
    title: "Settings",
    icon: <span>⚙️</span>,
    content: (
      <div>
        <h3>Settings</h3>
        <p>Application settings and preferences.</p>
        <label>
          <input type="checkbox" /> Dark mode
        </label>
        <br />
        <label>
          <input type="checkbox" /> Auto-save
        </label>
      </div>
    ),
  },
} satisfies Record<string, SidebarTab>;

type TabKey = keyof typeof mockTabs;

// Wrapper component to handle state
function SidebarTabsWrapper({ initialTab }: { initialTab: TabKey }) {
  const [currentTab, setCurrentTab] = useState<TabKey>(initialTab);

  return (
    <SidebarTabs
      tabs={mockTabs}
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
    />
  );
}

const meta: Meta<typeof SidebarTabsWrapper> = {
  title: "UI/SidebarTabs",
  component: SidebarTabsWrapper,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    initialTab: {
      control: "select",
      options: Object.keys(mockTabs),
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LayersTab: Story = {
  args: {
    initialTab: "layers",
  },
};

export const InputsTab: Story = {
  args: {
    initialTab: "inputs",
  },
};

export const DisplaysTab: Story = {
  args: {
    initialTab: "displays",
  },
};

export const SettingsTab: Story = {
  args: {
    initialTab: "settings",
  },
};
