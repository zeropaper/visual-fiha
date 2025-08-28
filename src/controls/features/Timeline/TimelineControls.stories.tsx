import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useState } from "react";
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

export const InteractiveBpmTap: Story = {
  name: "Interactive BPM Tap (Averaging)",
  render: () => {
    const [bpm, setBpm] = useState(120);
    const [isRunning, setIsRunning] = useState(false);
    const [tapTimes, setTapTimes] = useState<number[]>([]);
    const [lastCalculatedBpm, setLastCalculatedBpm] = useState<number | null>(
      null,
    );

    const handleBpmTap = useCallback(() => {
      const now = Date.now();

      setTapTimes((prevTimes) => {
        // Filter out clicks older than 2 seconds to keep only recent taps
        const recentTimes = prevTimes.filter((time) => now - time <= 2000);

        // Add the current click time
        const newTimes = [...recentTimes, now];

        // If we have at least 2 clicks, calculate BPM
        if (newTimes.length >= 2) {
          // Calculate intervals between consecutive clicks
          const intervals: number[] = [];
          for (let i = 1; i < newTimes.length; i++) {
            intervals.push(newTimes[i] - newTimes[i - 1]);
          }

          // Calculate average interval
          const averageInterval =
            intervals.reduce((sum, interval) => sum + interval, 0) /
            intervals.length;

          // Convert average interval to BPM
          const bpmValue = Math.round(60000 / averageInterval);

          // Only set BPM if it's within reasonable range (30-300 BPM)
          if (bpmValue >= 30 && bpmValue <= 300) {
            setBpm(bpmValue);
            setLastCalculatedBpm(bpmValue);
          }
        }

        // Keep a maximum of 8 recent clicks
        return newTimes.slice(-8);
      });
    }, []);

    const handlePlayPause = useCallback(() => {
      setIsRunning(!isRunning);
    }, [isRunning]);

    const handleReset = useCallback(() => {
      setIsRunning(false);
      setTapTimes([]);
      setLastCalculatedBpm(null);
    }, []);

    const handleBpmChange = useCallback((newBpm: number) => {
      setBpm(newBpm);
      setTapTimes([]); // Reset tap sequence when manually changing BPM
    }, []);

    return (
      <div style={{ padding: "20px", background: "#1e1e1e", color: "white" }}>
        <h3>BPM Tap Tempo Test - Improved Averaging</h3>
        <p style={{ marginBottom: "20px", color: "#ccc" }}>
          This demonstrates the improved BPM tap functionality that averages
          multiple click intervals. Tap the "Tap" button rhythmically to see the
          BPM calculation improve with each tap.
        </p>

        <div style={{ marginBottom: "20px" }}>
          <div>
            <strong>Current BPM:</strong> {bpm}
          </div>
          <div>
            <strong>Last Calculated:</strong> {lastCalculatedBpm || "None"}
          </div>
          <div>
            <strong>Recent Taps:</strong> {tapTimes.length}
          </div>
          <div>
            <strong>Status:</strong> {isRunning ? "Running" : "Stopped"}
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <strong>Instructions:</strong>
          <ol style={{ marginLeft: "20px", color: "#ccc" }}>
            <li>
              Tap the "Tap" button at a steady rhythm (try 120 BPM = 2 taps per
              second)
            </li>
            <li>
              Notice how the BPM value stabilizes and becomes more accurate with
              more taps
            </li>
            <li>Wait 2+ seconds between sequences to start fresh</li>
            <li>Try different tempos to test the range (30-300 BPM)</li>
          </ol>
        </div>

        <TimelineControls
          isRunning={isRunning}
          bpm={bpm}
          canReset={tapTimes.length > 0 || isRunning}
          onPlayPause={handlePlayPause}
          onReset={handleReset}
          onBpmChange={handleBpmChange}
          onBpmTap={handleBpmTap}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Interactive demonstration of the improved BPM tap tempo functionality that averages multiple click intervals for more precise BPM calculation.",
      },
    },
  },
};
