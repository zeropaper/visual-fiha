import type { Meta, StoryObj } from "@storybook/react";
import { TimelineControls } from "./TimelineControls";

const meta: Meta<typeof TimelineControls> = {
  title: "Features/Timeline/TimelineControls",
  component: TimelineControls,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    isRunning: {
      control: "boolean",
    },
    bpm: {
      control: { type: "number", min: 60, max: 200, step: 1 },
    },
    canReset: {
      control: "boolean",
    },
    onPlayPause: { action: "onPlayPause" },
    onReset: { action: "onReset" },
    onBpmChange: { action: "onBpmChange" },
    onBpmTap: { action: "onBpmTap" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playing: Story = {
  args: {
    isRunning: true,
    bpm: 120,
    canReset: true,
    onPlayPause: () => console.log("Play/Pause clicked"),
    onReset: () => console.log("Reset clicked"),
    onBpmChange: (bpm: number) => console.log("BPM changed to:", bpm),
    onBpmTap: () => console.log("BPM tap clicked"),
  },
};

export const Paused: Story = {
  args: {
    isRunning: false,
    bpm: 120,
    canReset: false,
    onPlayPause: () => console.log("Play/Pause clicked"),
    onReset: () => console.log("Reset clicked"),
    onBpmChange: (bpm: number) => console.log("BPM changed to:", bpm),
    onBpmTap: () => console.log("BPM tap clicked"),
  },
};

export const HighBPM: Story = {
  args: {
    isRunning: true,
    bpm: 180,
    canReset: true,
    onPlayPause: () => console.log("Play/Pause clicked"),
    onReset: () => console.log("Reset clicked"),
    onBpmChange: (bpm: number) => console.log("BPM changed to:", bpm),
    onBpmTap: () => console.log("BPM tap clicked"),
  },
};

export const LowBPM: Story = {
  args: {
    isRunning: true,
    bpm: 80,
    canReset: true,
    onPlayPause: () => console.log("Play/Pause clicked"),
    onReset: () => console.log("Reset clicked"),
    onBpmChange: (bpm: number) => console.log("BPM changed to:", bpm),
    onBpmTap: () => console.log("BPM tap clicked"),
  },
};

export const ResetDisabled: Story = {
  args: {
    isRunning: true,
    bpm: 120,
    canReset: false,
    onPlayPause: () => console.log("Play/Pause clicked"),
    onReset: () => console.log("Reset clicked"),
    onBpmChange: (bpm: number) => console.log("BPM changed to:", bpm),
    onBpmTap: () => console.log("BPM tap clicked"),
  },
};
