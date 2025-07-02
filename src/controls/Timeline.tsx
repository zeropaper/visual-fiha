import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RuntimeData, TimeInputValue } from "../types";
import { useContextWorkerPost } from "./ControlsContext";
import styles from "./Timeline.module.css";
import { Button } from "./base/Button";

interface TimelineProps {
  className?: string;
}

const minTimelineDuration = 30000; // Minimum duration for absolute time display (30 seconds)

/**
 * Timeline component that renders a visual timeline with time ticks and a playhead
 * that shows the current position in time. Supports clicking to seek to a specific time.
 */
export function Timeline({ className }: TimelineProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [timeData, setTimeData] = useState<TimeInputValue | null>(null);
  const post = useContextWorkerPost();
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);

  // Listen to runtime data broadcasts from the worker
  useEffect(() => {
    const broadcastChannel = new BroadcastChannel("core");

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "runtimedata") {
        const runtimeData = event.data.payload as RuntimeData;
        setTimeData(runtimeData.time);
      }
    };

    broadcastChannel.addEventListener("message", handleMessage);

    return () => {
      broadcastChannel.removeEventListener("message", handleMessage);
      broadcastChannel.close();
    };
  }, []);

  // Stub function that will be called when clicking on the timeline
  const handleTimelineClick = useCallback(
    (timeValue: number) => {
      console.log(`Timeline clicked at time: ${timeValue}ms`);
      if (timeData && timeData.duration === 0) {
        const isCurrentlyRunning = timeData.isRunning;
        post?.(isCurrentlyRunning ? "stop" : "start");
      }
    },
    [timeData, post],
  );

  // Handle canvas click events
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const clickPercent = x / canvas.width;
      const clickedTime =
        clickPercent * Math.max(timeData?.elapsed || 0, minTimelineDuration);

      handleTimelineClick(clickedTime);
    },
    [timeData?.elapsed, handleTimelineClick],
  );

  // Handle keyboard events for accessibility
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLCanvasElement>) => {
      if (!timeData?.duration) return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        // Click at current position or beginning if not running
        const clickedTime = timeData.isRunning ? timeData.elapsed : 0;
        handleTimelineClick(clickedTime);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        // Seek by 1% of duration
        const seekAmount = timeData.duration * 0.01;
        const currentTime = timeData.elapsed;
        const newTime =
          event.key === "ArrowLeft"
            ? Math.max(0, currentTime - seekAmount)
            : Math.min(timeData.duration, currentTime + seekAmount);
        handleTimelineClick(newTime);
      }
    },
    [timeData, handleTimelineClick],
  );

  const handleCanvasMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const hoverPercent = x / canvas.width;
      const hoverTime = timeData?.elapsed
        ? hoverPercent * Math.max(timeData.elapsed, minTimelineDuration)
        : null;

      setHoveredTime(hoverTime);
    },
    [timeData?.elapsed],
  );

  const handleCanvasMouseLeave = useCallback(() => {
    setHoveredTime(null);
  }, []);

  // Render the timeline
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set canvas size if needed
    if (
      canvas.width !== canvas.offsetWidth ||
      canvas.height !== canvas.offsetHeight
    ) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    // Draw background
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, width, height);

    // Draw timeline border
    ctx.strokeStyle = "#ffffff33";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);

    if (timeData && (timeData.isRunning || timeData.elapsed > 0)) {
      // For absolute time (no duration), show elapsed time with reasonable scale
      if (timeData.duration === 0) {
        // Draw timeline for absolute time (using elapsed time for scale)
        drawAbsoluteTimeline(ctx, width, height, timeData);
      } else {
        // Draw time ticks for relative time (with known duration)
        drawTimeTicks(ctx, width, height, timeData);

        // Draw playhead (current position)
        drawPlayhead(ctx, width, height, timeData);

        // Draw time labels
        drawTimeLabels(ctx, width, height, timeData);
      }
    } else {
      // Draw placeholder text when no time data is available
      ctx.fillStyle = "#ffffff66";
      ctx.font = "14px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const message = "No time data available";
      ctx.fillText(message, width / 2, height / 2);
    }

    if (hoveredTime && timeData) {
      const hoverX =
        (hoveredTime / Math.max(timeData.elapsed, minTimelineDuration)) * width;

      // Draw vertical line at hovered position
      ctx.strokeStyle = "#ffffff88";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hoverX, 0);
      ctx.lineTo(hoverX, height);
      ctx.stroke();

      // Draw hovered time label
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(formatTime(hoveredTime), hoverX, height - 5);
    }
  }, [timeData, hoveredTime]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      render();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  return (
    <div className={[styles.timeline, className].filter(Boolean).join(" ")}>
      <div className={styles.controls}>
        <Button name="play_pause">
          {timeData?.isRunning ? "Pause" : "Play"}
        </Button>
        <Button
          name="reset"
          onClick={() => {
            post?.("stop");
            handleTimelineClick(0);
          }}
        >
          Reset
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onClick={handleCanvasClick}
        onKeyDown={handleKeyDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleCanvasMouseLeave}
        tabIndex={0}
        style={{ cursor: "pointer" }}
        aria-label="Timeline - click to seek, use arrow keys to navigate"
      />
    </div>
  );
}

/**
 * Draw timeline for absolute time (no fixed duration)
 */
function drawAbsoluteTimeline(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timeData: TimeInputValue,
) {
  const { elapsed } = timeData;

  // Create a sliding time window - show last 30 seconds worth of time
  const timeWindow = minTimelineDuration; // 30 seconds in ms
  const startTime = Math.max(0, elapsed - timeWindow);

  // Draw time tick marks for the visible window
  const tickInterval = getTickInterval(timeWindow);
  const numTicks = Math.floor(timeWindow / tickInterval);

  ctx.strokeStyle = "#ffffff44";
  ctx.lineWidth = 1;

  for (let i = 0; i <= numTicks; i++) {
    const time = startTime + i * tickInterval;
    const x = ((time - startTime) / timeWindow) * width;

    // Draw major ticks (every 5th tick is taller)
    const isMajorTick = i % 5 === 0;
    const tickHeight = isMajorTick ? height * 0.4 : height * 0.2;

    ctx.beginPath();
    ctx.moveTo(x, height);
    ctx.lineTo(x, height - tickHeight);
    ctx.stroke();
  }

  // Draw playhead at the current time (rightmost position)
  const playheadX = width; // Always at the right edge for absolute time

  ctx.strokeStyle = "#ff6b6b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(playheadX, 0);
  ctx.lineTo(playheadX, height);
  ctx.stroke();

  // Draw playhead triangle at top
  ctx.fillStyle = "#ff6b6b";
  ctx.beginPath();
  ctx.moveTo(playheadX, 0);
  ctx.lineTo(playheadX - 6, 12);
  ctx.lineTo(playheadX + 6, 12);
  ctx.closePath();
  ctx.fill();

  // Draw time labels for the visible window
  const labelInterval = tickInterval * 5; // Labels every 5 ticks
  const numLabels = Math.floor(timeWindow / labelInterval);

  ctx.fillStyle = "#ffffff88";
  ctx.font = "10px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  for (let i = 0; i <= numLabels; i++) {
    const time = startTime + i * labelInterval;
    const x = ((time - startTime) / timeWindow) * width;
    const timeLabel = formatTime(time);

    // Only draw label if there's enough space
    if (x > 20 && x < width - 20) {
      ctx.fillText(timeLabel, x, height - 20);
    }
  }

  // Always show current time
  ctx.textAlign = "left";
  ctx.fillText(`${formatTime(elapsed)}`, 8, 8);
}

/**
 * Draw time tick marks along the timeline
 */
function drawTimeTicks(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timeData: TimeInputValue,
) {
  const { duration } = timeData;

  // Calculate appropriate tick intervals based on duration
  const tickInterval = getTickInterval(duration);
  const numTicks = Math.floor(duration / tickInterval);

  ctx.strokeStyle = "#ffffff44";
  ctx.lineWidth = 1;

  for (let i = 0; i <= numTicks; i++) {
    const time = i * tickInterval;
    const x = (time / duration) * width;

    // Draw major ticks (every 5th tick is taller)
    const isMajorTick = i % 5 === 0;
    const tickHeight = isMajorTick ? height * 0.4 : height * 0.2;

    ctx.beginPath();
    ctx.moveTo(x, height);
    ctx.lineTo(x, height - tickHeight);
    ctx.stroke();
  }
}

/**
 * Draw the playhead indicating current time position
 */
function drawPlayhead(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timeData: TimeInputValue,
) {
  const { percent } = timeData;
  const x = percent * width;

  // Draw playhead line
  ctx.strokeStyle = "#ff6b6b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, height);
  ctx.stroke();

  // Draw playhead triangle at top
  ctx.fillStyle = "#ff6b6b";
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x - 6, 12);
  ctx.lineTo(x + 6, 12);
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw time labels at major tick positions
 */
function drawTimeLabels(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timeData: TimeInputValue,
) {
  const { duration } = timeData;

  // Calculate appropriate label intervals
  const labelInterval = getTickInterval(duration) * 5; // Labels every 5 ticks
  const numLabels = Math.floor(duration / labelInterval);

  ctx.fillStyle = "#ffffff88";
  ctx.font = "10px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  for (let i = 0; i <= numLabels; i++) {
    const time = i * labelInterval;
    const x = (time / duration) * width;
    const timeLabel = formatTime(time);

    // Only draw label if there's enough space
    if (x > 20 && x < width - 20) {
      ctx.fillText(timeLabel, x, height - 20);
    }
  }

  // Always show current time and total duration
  const currentTimeLabel = formatTime(timeData.elapsed);
  const totalTimeLabel = formatTime(duration);

  ctx.textAlign = "left";
  ctx.fillText(`${currentTimeLabel} / ${totalTimeLabel}`, 8, 8);
}

/**
 * Calculate appropriate tick interval based on duration
 */
function getTickInterval(duration: number): number {
  // Convert to seconds for easier calculation
  const durationSeconds = duration / 1000;

  if (durationSeconds < 10) return 500; // 0.5 second ticks
  if (durationSeconds < 60) return 1000; // 1 second ticks
  if (durationSeconds < 300) return 5000; // 5 second ticks
  if (durationSeconds < 600) return 10000; // 10 second ticks
  if (durationSeconds < 1800) return 30000; // 30 second ticks
  return 60000; // 1 minute ticks
}

/**
 * Format time in milliseconds to human-readable string
 */
function formatTime(timeMs: number): string {
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${seconds}s`;
}
