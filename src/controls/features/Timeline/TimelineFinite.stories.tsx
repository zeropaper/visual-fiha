import type { Meta, StoryObj } from "@storybook/react";
import type { TimeInputValue } from "../../../types";
import { TimelineFinite } from "./TimelineFinite";

const meta: Meta<typeof TimelineFinite> = {
  title: "Features/Timeline/TimelineFinite",
  component: TimelineFinite,
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
const shortDuration: TimeInputValue = {
  started: Date.now() - 5000,
  elapsed: 5000, // 5 seconds elapsed
  duration: 20000, // 20 seconds total
  percent: 0.25, // 25% complete
  isRunning: true,
};

const mediumDuration: TimeInputValue = {
  started: Date.now() - 30000,
  elapsed: 30000, // 30 seconds elapsed
  duration: 120000, // 2 minutes total
  percent: 0.25, // 25% complete
  isRunning: true,
};

const longDuration: TimeInputValue = {
  started: Date.now() - 120000,
  elapsed: 120000, // 2 minutes elapsed
  duration: 600000, // 10 minutes total
  percent: 0.2, // 20% complete
  isRunning: true,
};

const nearEnd: TimeInputValue = {
  started: Date.now() - 55000,
  elapsed: 55000, // 55 seconds elapsed
  duration: 60000, // 60 seconds total
  percent: 0.917, // 91.7% complete
  isRunning: true,
};

const mockHandlers = {
  onCanvasClick: (event: React.MouseEvent<HTMLCanvasElement>) =>
    console.log("Canvas clicked at:", event.clientX, event.clientY),
  onCanvasMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) =>
    console.log("Mouse moved to:", event.clientX, event.clientY),
  onCanvasMouseLeave: () => console.log("Mouse left canvas"),
};

export const ShortDuration: Story = {
  args: {
    getTimeData: () => shortDuration,
    bpm: 120,
    hoveredTime: null,
    ...mockHandlers,
  },
};

export const MediumDuration: Story = {
  args: {
    getTimeData: () => mediumDuration,
    bpm: 120,
    hoveredTime: null,
    ...mockHandlers,
  },
};

export const LongDuration: Story = {
  args: {
    getTimeData: () => longDuration,
    bpm: 120,
    hoveredTime: null,
    ...mockHandlers,
  },
};

export const NearEnd: Story = {
  args: {
    getTimeData: () => nearEnd,
    bpm: 120,
    hoveredTime: null,
    ...mockHandlers,
  },
};

export const WithHover: Story = {
  args: {
    getTimeData: () => mediumDuration,
    bpm: 120,
    hoveredTime: 60000, // Hovering at 1 minute
    ...mockHandlers,
  },
};

export const HighBPM: Story = {
  args: {
    getTimeData: () => mediumDuration,
    bpm: 180,
    hoveredTime: null,
    ...mockHandlers,
  },
};

export const LowBPM: Story = {
  args: {
    getTimeData: () => mediumDuration,
    bpm: 80,
    hoveredTime: null,
    ...mockHandlers,
  },
};

export const NoBPM: Story = {
  args: {
    getTimeData: () => mediumDuration,
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
    getTimeData: () => ({ ...mediumDuration, isRunning: false }),
    bpm: 120,
    hoveredTime: null,
    ...mockHandlers,
  },
};
