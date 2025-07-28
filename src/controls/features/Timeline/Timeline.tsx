import { useAudioSetup } from "@contexts/AudioSetupContext";
import { useContextWorkerPost } from "@contexts/ControlsContext";
import { Button, buttonStyles } from "@ui/Button";
import { Input, inputStyles } from "@ui/Input";
import { ChevronFirstIcon, PauseIcon, PlayIcon } from "lucide-react";
import type React from "react";
import {
  type MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { TimeInputValue } from "../../../types";
import { useRuntimeMonitor } from "../../hooks/useRuntimeMonitor";
import styles from "./Timeline.module.css";

interface TimelineProps {
  className?: string;
  bpm?: number;
}

const minTimelineDuration = 30000; // Minimum duration for absolute time display (30 seconds)

/**
 * Timeline component that renders a visual timeline with time ticks and a playhead
 * that shows the current position in time. Supports clicking to seek to a specific time.
 */
export function Timeline({ className }: TimelineProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const post = useContextWorkerPost();
  const { isRunning, bpm, getTimeData } = useRuntimeMonitor();
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);

  const { playAll, pauseAll, seekAll, stopAll } = useAudioSetup();

  const getTimelineTime = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>): number => {
      const timeData = getTimeData();
      const canvas = canvasRef.current;
      if (!canvas) return 0;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const mousePercent = x / canvas.width;

      // For relative time, calculate based on duration
      if (timeData?.duration) {
        return mousePercent * timeData.duration;
      }

      const clickedTime =
        mousePercent * Math.max(timeData?.elapsed || 0, minTimelineDuration);
      return clickedTime;
    },
    [getTimeData],
  );

  const handleCanvasClick = useCallback<MouseEventHandler<HTMLCanvasElement>>(
    (event) => {
      const timeValue = getTimelineTime(event);
      seekAll(timeValue);
    },
    [getTimelineTime, seekAll],
  );

  const handleCanvasMouseMove = useCallback<
    MouseEventHandler<HTMLCanvasElement>
  >(
    (event) => {
      setHoveredTime(getTimelineTime(event));
    },
    [getTimelineTime],
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
    const timeData = getTimeData();
    if (timeData) {
      // For absolute time (no duration), show elapsed time with reasonable scale
      if (!timeData.duration) {
        // Draw timeline for absolute time (using elapsed time for scale)
        drawAbsoluteTimeline(ctx, width, height, timeData, bpm);
      } else {
        // Draw timeline for relative time (with known duration)
        drawRelativeTimeline(ctx, width, height, timeData, bpm);
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
      const hoverX = timeData.duration
        ? (hoveredTime / timeData.duration) * width
        : (hoveredTime / Math.max(timeData.elapsed, minTimelineDuration)) *
          width;

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
  }, [getTimeData, hoveredTime, bpm]);

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

  const handlePlayPause = useCallback(() => {
    if (isRunning) {
      pauseAll();
    } else {
      playAll();
    }
  }, [isRunning, playAll, pauseAll]);

  const [lastBpmClick, setLastBpmClick] = useState<number | null>(null);
  // measures the interval between clicks to set Bpm
  const handleBpmClick = useCallback(() => {
    const now = Date.now();
    // If last click was within 1 second, calculate BPM
    if (lastBpmClick && now - lastBpmClick < 1000) {
      // Calculate BPM based on time difference
      const bpmValue = Math.round(60000 / (now - lastBpmClick));
      post?.("setBpm", bpmValue);
    }
    setLastBpmClick(now);
  }, [lastBpmClick, post]);

  const handleBpmChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newBpm = Number.parseInt(event.target.value, 10);
      if (!Number.isNaN(newBpm) && newBpm > 0) {
        post?.("setBpm", newBpm);
      }
    },
    [post],
  );

  return (
    <div
      className={["timeline", styles.timeline, className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.controls}>
        <Button
          variant="icon"
          name="play_pause"
          onClick={handlePlayPause}
          className={[
            "play-pause-button",
            buttonStyles.button,
            buttonStyles.icon,
          ].join(" ")}
        >
          {isRunning ? <PauseIcon /> : <PlayIcon />}
        </Button>
        <Button
          variant="icon"
          name="reset"
          onClick={stopAll}
          disabled={!isRunning || !getTimeData()?.elapsed}
          className={["reset-button", buttonStyles.button].join(" ")}
        >
          <ChevronFirstIcon />
        </Button>

        <Input
          type="number"
          value={bpm}
          onChange={handleBpmChange}
          style={{ width: "4ch" }}
          className={["bpm-input", inputStyles.input].join(" ")}
        />
        <Button
          title="Click several times to set the Bpm"
          onClick={handleBpmClick}
          className={["bpm-button", buttonStyles.button].join(" ")}
        >
          {`${bpm} bpm`}
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        className={[styles.canvas, "timeline-canvas"].join(" ")}
        onClick={handleCanvasClick}
        onKeyDown={() => {}}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleCanvasMouseLeave}
        tabIndex={0}
        height="60"
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
  bpm?: number, // Add bpm as an optional parameter
) {
  const { elapsed } = timeData;

  // Create a sliding time window - show last 30 seconds worth of time
  const timeWindow = minTimelineDuration; // 30 seconds in ms
  const startTime = Math.max(0, elapsed - timeWindow);

  drawTimeTicks(ctx, width, height, timeData);
  drawPlayhead(ctx, width, height, timeData);
  drawTimeLabels(ctx, width, height, timeData);
  drawBpmTicks(ctx, width, height, bpm || 0, timeData, timeWindow, startTime);
}

/**
 * Draw timeline for relative time (with known duration)
 */
export function drawRelativeTimeline(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timeData: TimeInputValue,
  bpm?: number, // Add bpm as an optional parameter
) {
  drawTimeTicks(ctx, width, height, timeData);
  drawPlayhead(ctx, width, height, timeData);
  drawTimeLabels(ctx, width, height, timeData);
  drawBpmTicks(
    ctx,
    width,
    height,
    bpm || 0,
    timeData,
    timeData.duration,
    timeData.started,
  );
}

/**
 * Draw BPM ticks as a sawtooth pattern along the timeline
 */
function drawBpmTicks(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bpm: number,
  timeData: TimeInputValue,
  timeWindow: number,
  startTime: number,
) {
  if (!bpm || !timeData || !timeWindow || !startTime) return;
  ctx.fillStyle = "#00ff00";
  ctx.textBaseline = "top";
  ctx.fillText(`${bpm} bpm`, 8, 8);

  const bpmInterval = 60000 / bpm; // Calculate interval in ms based on Bpm
  const numBpmTicks = Math.floor(
    Math.max(timeData.elapsed, timeWindow) / bpmInterval,
  );

  ctx.strokeStyle = "#00ff00"; // Green color for Bpm ticks
  ctx.lineWidth = 1;

  for (let i = 0; i <= numBpmTicks; i++) {
    const time = startTime + i * bpmInterval;
    const x =
      ((time - startTime) / Math.max(timeData.elapsed, timeWindow)) * width;

    // Draw sawtooth-like pattern
    const sawtoothHeight = i % 2 === 0 ? height * 0.1 : height * 0.2;

    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, sawtoothHeight);
    ctx.stroke();
  }
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
