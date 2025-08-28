import type { Meta, StoryObj } from "@storybook/react";
import type { TimeInputValue } from "../../../types";
import { TimelineInfinite } from "./TimelineInfinite";

const meta: Meta<typeof TimelineInfinite> = {
  title: "Features/Timeline/TimelineInfinite",
  component: TimelineInfinite,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    getTimeData: {
      control: false, // Function can't be controlled via Storybook controls
    },
    bpm: {
      control: { type: "number", min: 60, max: 200, step: 1 },
    },
    hoveredTime: {
      control: { type: "number", min: 0, max: 60000, step: 100 },
    },
    onCanvasClick: { action: "onCanvasClick" },
    onCanvasMouseMove: { action: "onCanvasMouseMove" },
    onCanvasMouseLeave: { action: "onCanvasMouseLeave" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock time data for different scenarios
const shortElapsed: TimeInputValue = {
  started: Date.now() - 10000,
  elapsed: 10000, // 10 seconds elapsed
  duration: 0, // No fixed duration
  percent: 0, // Not applicable for infinite
  isRunning: true,
};

const mediumElapsed: TimeInputValue = {
  started: Date.now() - 45000,
  elapsed: 45000, // 45 seconds elapsed
  duration: 0, // No fixed duration
  percent: 0, // Not applicable for infinite
  isRunning: true,
};

const longElapsed: TimeInputValue = {
  started: Date.now() - 300000,
  elapsed: 300000, // 5 minutes elapsed
  duration: 0, // No fixed duration
  percent: 0, // Not applicable for infinite
  isRunning: true,
};

const veryLongElapsed: TimeInputValue = {
  started: Date.now() - 1800000,
  elapsed: 1800000, // 30 minutes elapsed
  duration: 0, // No fixed duration
  percent: 0, // Not applicable for infinite
  isRunning: true,
};

const mockHandlers = {
  onCanvasClick: (event: React.MouseEvent<HTMLCanvasElement>) =>
    console.log("Canvas clicked at:", event.clientX, event.clientY),
  onCanvasMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) =>
    console.log("Mouse moved to:", event.clientX, event.clientY),
  onCanvasMouseLeave: () => console.log("Mouse left canvas"),
};

export const ShortElapsed: Story = {
  args: {
    getTimeData: () => shortElapsed,
    bpm: 120,
    hoveredTime: null,
    ...mockHandlers,
  },
};

export const MediumElapsed: Story = {
  args: {
    getTimeData: () => mediumElapsed,
    bpm: 120,
    hoveredTime: null,
    ...mockHandlers,
  },
};

export const LongElapsed: Story = {
  args: {
    getTimeData: () => longElapsed,
    bpm: 120,
    hoveredTime: null,
    ...mockHandlers,
  },
};

export const VeryLongElapsed: Story = {
  args: {
    getTimeData: () => veryLongElapsed,
    bpm: 120,
    hoveredTime: null,
    ...mockHandlers,
  },
};

export const WithHover: Story = {
  args: {
    getTimeData: () => mediumElapsed,
    bpm: 120,
    hoveredTime: 30000, // Hovering at 30 seconds
    ...mockHandlers,
  },
};

export const HighBPM: Story = {
  args: {
    getTimeData: () => mediumElapsed,
    bpm: 180,
    hoveredTime: null,
    ...mockHandlers,
  },
};

export const LowBPM: Story = {
  args: {
    getTimeData: () => mediumElapsed,
    bpm: 80,
    hoveredTime: null,
    ...mockHandlers,
  },
};

export const NoBPM: Story = {
  args: {
    getTimeData: () => mediumElapsed,
    bpm: 0,
    hoveredTime: null,
    ...mockHandlers,
  },
};

export const NoTimeData: Story = {
  args: {
    getTimeData: () => null,
    bpm: 120,
    hoveredTime: null,
    ...mockHandlers,
  },
};

export const Paused: Story = {
  args: {
    getTimeData: () => ({ ...mediumElapsed, isRunning: false }),
    bpm: 120,
    hoveredTime: null,
    ...mockHandlers,
  },
};

export const JustStarted: Story = {
  args: {
    getTimeData: () => ({
      started: Date.now() - 1000,
      elapsed: 1000, // 1 second elapsed
      duration: 0, // No fixed duration
      percent: 0, // Not applicable for infinite
      isRunning: true,
    }),
    bpm: 120,
    hoveredTime: null,
    ...mockHandlers,
  },
};
