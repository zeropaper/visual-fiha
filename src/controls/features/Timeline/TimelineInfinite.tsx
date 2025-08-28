import type { MouseEventHandler } from "react";
import { useCallback, useEffect, useRef } from "react";
import type { TimeInputValue } from "../../../types";
import {
  drawBpmTicks,
  drawHoverIndicator,
  drawPlaceholder,
  drawPlayhead,
  drawTimeLabels,
  drawTimeTicks,
  formatTime,
  getTickInterval,
  setupCanvas,
} from "./rendering-utils";
import styles from "./Timeline.module.css";

export interface TimelineInfiniteProps {
  getTimeData: () => TimeInputValue | null;
  bpm: number;
  hoveredTime: number | null;
  onCanvasClick: MouseEventHandler<HTMLCanvasElement>;
  onCanvasMouseMove: MouseEventHandler<HTMLCanvasElement>;
  onCanvasMouseLeave: () => void;
}

const minTimelineDuration = 30000; // Minimum duration for absolute time display (30 seconds)

/**
 * Timeline component for infinite duration (when duration is not set).
 * This renders the timeline with an absolute time scale that shows a sliding window.
 */
export function TimelineInfinite({
  getTimeData,
  bpm,
  hoveredTime,
  onCanvasClick,
  onCanvasMouseMove,
  onCanvasMouseLeave,
}: TimelineInfiniteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const timeData = getTimeData();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = setupCanvas(canvas, ctx);

    if (timeData) {
      // Draw timeline for absolute time (no fixed duration)
      drawAbsoluteTimeline(ctx, width, height, timeData, bpm);
    } else {
      // Draw placeholder text when no time data is available
      drawPlaceholder(ctx, width, height, "No time data available");
    }

    if (hoveredTime) {
      const timeDataForHover = getTimeData();
      if (timeDataForHover) {
        const hoverX =
          (hoveredTime /
            Math.max(timeDataForHover.elapsed, minTimelineDuration)) *
          width;

        drawHoverIndicator(ctx, height, hoverX, hoveredTime);
      }
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
 * Draw timeline for absolute time (no fixed duration)
 */
function drawAbsoluteTimeline(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timeData: TimeInputValue,
  bpm?: number,
) {
  const { elapsed } = timeData;

  // Create a sliding time window - show last 30 seconds worth of time
  const timeWindow = minTimelineDuration; // 30 seconds in ms
  const startTime = Math.max(0, elapsed - timeWindow);

  // Draw time ticks
  const tickInterval = getTickInterval(timeWindow);
  const numTicks = Math.floor(timeWindow / tickInterval);
  drawTimeTicks(ctx, height, numTicks, (i) => {
    const time = startTime + i * tickInterval;
    return ((time - startTime) / timeWindow) * width;
  });

  // Draw playhead (always at the end of the visible window for infinite timeline)
  const playheadX = ((elapsed - startTime) / timeWindow) * width;
  drawPlayhead(ctx, height, playheadX);

  // Draw time labels
  const labelInterval = tickInterval * 5; // Labels every 5 ticks
  const numLabels = Math.floor(timeWindow / labelInterval);
  drawTimeLabels(
    ctx,
    width,
    height,
    numLabels,
    (i) => {
      const time = startTime + i * labelInterval;
      return ((time - startTime) / timeWindow) * width;
    },
    (i) => startTime + i * labelInterval,
  );

  // Always show current time
  ctx.fillStyle = "#ffffff88";
  ctx.font = "10px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const currentTimeLabel = formatTime(elapsed);
  ctx.fillText(currentTimeLabel, 8, 8);

  // Draw BPM ticks if BPM is provided
  if (bpm) {
    drawBpmTicks(ctx, width, height, bpm, timeData, timeWindow, startTime);
  }
}
