import type { MouseEventHandler } from "react";
import { useCallback, useEffect, useRef } from "react";
import type { TimeInputValue } from "../../../types";
import styles from "./Timeline.module.css";

export interface TimelineFiniteProps {
  getTimeData: () => TimeInputValue | null;
  bpm: number;
  hoveredTime: number | null;
  onCanvasClick: MouseEventHandler<HTMLCanvasElement>;
  onCanvasMouseMove: MouseEventHandler<HTMLCanvasElement>;
  onCanvasMouseLeave: () => void;
}

/**
 * Timeline component for finite duration (when duration is set).
 * This renders the timeline with a known duration and finite time scale.
 */
export function TimelineFinite({
  getTimeData,
  bpm,
  hoveredTime,
  onCanvasClick,
  onCanvasMouseMove,
  onCanvasMouseLeave,
}: TimelineFiniteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const timeData = getTimeData();
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

    if (timeData?.duration) {
      // Draw timeline for relative time (with known duration)
      drawRelativeTimeline(ctx, width, height, timeData, bpm);
    } else {
      // Draw placeholder text when no time data is available
      ctx.fillStyle = "#ffffff66";
      ctx.font = "14px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const message = "No finite time data available";
      ctx.fillText(message, width / 2, height / 2);
    }

    if (hoveredTime && timeData && timeData.duration) {
      const hoverX = (hoveredTime / timeData.duration) * width;

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
  }, [getTimeData, bpm, hoveredTime]);

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
    <canvas
      ref={canvasRef}
      className={[styles.canvas, "timeline-canvas"].join(" ")}
      onClick={onCanvasClick}
      onKeyDown={() => {}}
      onMouseMove={onCanvasMouseMove}
      onMouseLeave={onCanvasMouseLeave}
      tabIndex={0}
      height="60"
      style={{ cursor: "pointer" }}
      aria-label="Timeline - click to seek, use arrow keys to navigate"
    />
  );
}

/**
 * Draw timeline for relative time (with known duration)
 */
function drawRelativeTimeline(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timeData: TimeInputValue,
  bpm?: number,
) {
  drawTimeTicks(ctx, width, height, timeData);
  drawPlayhead(ctx, width, height, timeData);
  drawTimeLabels(ctx, width, height, timeData);
  if (bpm && timeData.duration) {
    drawBpmTicks(
      ctx,
      width,
      height,
      bpm,
      timeData,
      timeData.duration,
      timeData.started,
    );
  }
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

  if (!duration) return;

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

  if (!duration) return;

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
