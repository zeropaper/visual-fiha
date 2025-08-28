import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useEffect, useState } from "react";
import type { TimeInputValue } from "../../../types";
import { PureTimeline } from "./PureTimeline";

const meta: Meta<typeof PureTimeline> = {
  title: "Features/Timeline/PureTimeline",
  component: PureTimeline,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
    },
    getTimeData: {
      control: false, // Function can't be controlled via Storybook controls
    },
    bpm: {
      control: { type: "number", min: 60, max: 200, step: 1 },
    },
    isRunning: {
      control: "boolean",
    },
    hoveredTime: {
      control: { type: "number", min: 0, max: 60000, step: 100 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Simulated time data state
class TimelineSimulator {
  private startTime: number = Date.now();
  private pausedElapsed: number = 0;
  private _isRunning: boolean = false;
  private _duration: number = 0;

  constructor(
    isRunning: boolean = false,
    duration: number = 0,
    initialElapsed: number = 0,
  ) {
    this._isRunning = isRunning;
    this._duration = duration;
    this.pausedElapsed = initialElapsed;
    this.startTime = Date.now() - initialElapsed;
  }

  play() {
    if (!this._isRunning) {
      this.startTime = Date.now() - this.pausedElapsed;
      this._isRunning = true;
    }
  }

  pause() {
    if (this._isRunning) {
      this.pausedElapsed = this.getElapsed();
      this._isRunning = false;
    }
  }

  reset() {
    this.startTime = Date.now();
    this.pausedElapsed = 0;
  }

  seek(time: number) {
    this.pausedElapsed = time;
    if (this._isRunning) {
      this.startTime = Date.now() - time;
    }
  }

  private getElapsed(): number {
    if (this._isRunning) {
      return Date.now() - this.startTime;
    }
    return this.pausedElapsed;
  }

  getTimeData(): TimeInputValue {
    const elapsed = this.getElapsed();
    return {
      started: this.startTime,
      elapsed,
      duration: this._duration,
      percent: this._duration > 0 ? Math.min(elapsed / this._duration, 1) : 0,
      isRunning: this._isRunning,
    };
  }

  get isRunning() {
    return this._isRunning;
  }

  set duration(value: number) {
    this._duration = value;
  }
}

// Interactive Timeline Story Component
function InteractiveTimelineStory({
  initialDuration = 60000,
  initialElapsed = 15000,
  initialBpm = 120,
}: {
  initialDuration?: number;
  initialElapsed?: number;
  initialBpm?: number;
}) {
  const [simulator] = useState(
    () => new TimelineSimulator(true, initialDuration, initialElapsed),
  );
  const [timeData, setTimeData] = useState<TimeInputValue>(
    simulator.getTimeData(),
  );
  const [bpm, setBpm] = useState(initialBpm);
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);

  // Update time data regularly
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeData(simulator.getTimeData());
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [simulator]);

  const getTimeData = useCallback(() => timeData, [timeData]);

  const handlePlayPause = useCallback(() => {
    if (simulator.isRunning) {
      simulator.pause();
    } else {
      simulator.play();
    }
    setTimeData(simulator.getTimeData());
  }, [simulator]);

  const handleReset = useCallback(() => {
    simulator.reset();
    setTimeData(simulator.getTimeData());
  }, [simulator]);

  const handleBpmChange = useCallback((newBpm: number) => {
    setBpm(newBpm);
  }, []);

  const handleBpmTap = useCallback(() => {
    // Simple BPM tap detection (just increment for demo)
    setBpm((prev) => Math.min(prev + 10, 200));
  }, []);

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = event.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const mousePercent = x / canvas.width;

      if (timeData.duration > 0) {
        // Finite timeline - seek to percentage of duration
        const seekTime = mousePercent * timeData.duration;
        simulator.seek(seekTime);
      } else {
        // Infinite timeline - seek within visible range
        const visibleDuration = Math.max(timeData.elapsed, 30000);
        const seekTime = mousePercent * visibleDuration;
        simulator.seek(seekTime);
      }
      setTimeData(simulator.getTimeData());
    },
    [timeData, simulator],
  );

  const handleCanvasMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = event.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const mousePercent = x / canvas.width;

      if (timeData.duration > 0) {
        setHoveredTime(mousePercent * timeData.duration);
      } else {
        const visibleDuration = Math.max(timeData.elapsed, 30000);
        setHoveredTime(mousePercent * visibleDuration);
      }
    },
    [timeData],
  );

  const handleCanvasMouseLeave = useCallback(() => {
    setHoveredTime(null);
  }, []);

  return (
    <PureTimeline
      getTimeData={getTimeData}
      bpm={bpm}
      isRunning={timeData.isRunning}
      hoveredTime={hoveredTime}
      onCanvasClick={handleCanvasClick}
      onCanvasMouseMove={handleCanvasMouseMove}
      onCanvasMouseLeave={handleCanvasMouseLeave}
      controls={{
        onPlayPause: handlePlayPause,
        onReset: handleReset,
        onBpmChange: handleBpmChange,
        onBpmTap: handleBpmTap,
        canReset: timeData.elapsed > 0,
      }}
    />
  );
}

// Static mock data for simpler stories
const createStaticTimeData = (
  elapsed: number,
  duration: number,
  isRunning: boolean,
): TimeInputValue => ({
  started: Date.now() - elapsed,
  elapsed,
  duration,
  percent: duration > 0 ? elapsed / duration : 0,
  isRunning,
});

const staticMockControls = {
  onPlayPause: () => console.log("Play/Pause clicked"),
  onReset: () => console.log("Reset clicked"),
  onBpmChange: (bpm: number) => console.log("BPM changed to:", bpm),
  onBpmTap: () => console.log("BPM tap clicked"),
  canReset: true,
};

const staticMockHandlers = {
  onCanvasClick: (event: React.MouseEvent<HTMLCanvasElement>) =>
    console.log("Canvas clicked at:", event.clientX, event.clientY),
  onCanvasMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) =>
    console.log("Mouse moved to:", event.clientX, event.clientY),
  onCanvasMouseLeave: () => console.log("Mouse left canvas"),
};

// Interactive Stories
export const FiniteTimelineInteractive: Story = {
  render: () => (
    <InteractiveTimelineStory initialDuration={60000} initialElapsed={15000} />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Fully interactive finite timeline with real-time updates. Try clicking to seek, using play/pause controls, and adjusting BPM.",
      },
    },
  },
};

export const InfiniteTimelineInteractive: Story = {
  render: () => (
    <InteractiveTimelineStory initialDuration={0} initialElapsed={30000} />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Fully interactive infinite timeline with real-time updates. Shows sliding window view for absolute time.",
      },
    },
  },
};

export const FastBPMInteractive: Story = {
  render: () => (
    <InteractiveTimelineStory
      initialDuration={60000}
      initialElapsed={10000}
      initialBpm={180}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Interactive timeline with high BPM (180) showing dense beat markers.",
      },
    },
  },
};

export const SlowBPMInteractive: Story = {
  render: () => (
    <InteractiveTimelineStory
      initialDuration={60000}
      initialElapsed={20000}
      initialBpm={80}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Interactive timeline with low BPM (80) showing sparse beat markers.",
      },
    },
  },
};

// Static Stories for documentation
export const FiniteTimelineRunning: Story = {
  args: {
    getTimeData: () => createStaticTimeData(15000, 60000, true),
    bpm: 120,
    isRunning: true,
    hoveredTime: null,
    controls: staticMockControls,
    ...staticMockHandlers,
  },
  parameters: {
    docs: {
      description: {
        story: "Static example of a running finite timeline (25% complete).",
      },
    },
  },
};

export const FiniteTimelinePaused: Story = {
  args: {
    getTimeData: () => createStaticTimeData(15000, 60000, false),
    bpm: 120,
    isRunning: false,
    hoveredTime: null,
    controls: { ...staticMockControls, canReset: false },
    ...staticMockHandlers,
  },
  parameters: {
    docs: {
      description: {
        story: "Static example of a paused finite timeline.",
      },
    },
  },
};

export const FiniteTimelineWithHover: Story = {
  args: {
    getTimeData: () => createStaticTimeData(15000, 60000, true),
    bpm: 120,
    isRunning: true,
    hoveredTime: 30000, // Hovering at 30 seconds
    controls: staticMockControls,
    ...staticMockHandlers,
  },
  parameters: {
    docs: {
      description: {
        story: "Static example showing hover indicator on timeline.",
      },
    },
  },
};

export const InfiniteTimelineRunning: Story = {
  args: {
    getTimeData: () => createStaticTimeData(30000, 0, true),
    bpm: 140,
    isRunning: true,
    hoveredTime: null,
    controls: staticMockControls,
    ...staticMockHandlers,
  },
  parameters: {
    docs: {
      description: {
        story: "Static example of a running infinite timeline.",
      },
    },
  },
};

export const InfiniteTimelinePaused: Story = {
  args: {
    getTimeData: () => createStaticTimeData(30000, 0, false),
    bpm: 140,
    isRunning: false,
    hoveredTime: null,
    controls: { ...staticMockControls, canReset: false },
    ...staticMockHandlers,
  },
  parameters: {
    docs: {
      description: {
        story: "Static example of a paused infinite timeline.",
      },
    },
  },
};

export const InfiniteTimelineWithHover: Story = {
  args: {
    getTimeData: () => createStaticTimeData(30000, 0, true),
    bpm: 140,
    isRunning: true,
    hoveredTime: 20000, // Hovering at 20 seconds
    controls: staticMockControls,
    ...staticMockHandlers,
  },
  parameters: {
    docs: {
      description: {
        story: "Static example showing hover indicator on infinite timeline.",
      },
    },
  },
};

export const NoTimeData: Story = {
  args: {
    getTimeData: () => null,
    bpm: 120,
    isRunning: false,
    hoveredTime: null,
    controls: { ...staticMockControls, canReset: false },
    ...staticMockHandlers,
  },
  parameters: {
    docs: {
      description: {
        story: "Timeline when no time data is available.",
      },
    },
  },
};

export const HighBPM: Story = {
  args: {
    getTimeData: () => createStaticTimeData(15000, 60000, true),
    bpm: 180,
    isRunning: true,
    hoveredTime: null,
    controls: staticMockControls,
    ...staticMockHandlers,
  },
  parameters: {
    docs: {
      description: {
        story: "Timeline with high BPM (180) showing dense beat markers.",
      },
    },
  },
};

export const LowBPM: Story = {
  args: {
    getTimeData: () => createStaticTimeData(15000, 60000, true),
    bpm: 80,
    isRunning: true,
    hoveredTime: null,
    controls: staticMockControls,
    ...staticMockHandlers,
  },
  parameters: {
    docs: {
      description: {
        story: "Timeline with low BPM (80) showing sparse beat markers.",
      },
    },
  },
};

export const LongDuration: Story = {
  args: {
    getTimeData: () => createStaticTimeData(120000, 600000, true), // 2 minutes of 10 minutes
    bpm: 120,
    isRunning: true,
    hoveredTime: null,
    controls: staticMockControls,
    ...staticMockHandlers,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Timeline with long duration (10 minutes) showing time scale adaptation.",
      },
    },
  },
};
