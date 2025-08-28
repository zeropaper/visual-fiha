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
    const { width, height } = setupCanvas(canvas, ctx);

    if (timeData?.duration) {
      // Draw timeline for relative time (with known duration)
      drawRelativeTimeline(ctx, width, height, timeData, bpm);
    } else {
      // Draw placeholder text when no time data is available
      drawPlaceholder(ctx, width, height, "No finite time data available");
    }

    if (hoveredTime && timeData && timeData.duration) {
      const hoverX = (hoveredTime / timeData.duration) * width;
      drawHoverIndicator(ctx, height, hoverX, hoveredTime);
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
  const { duration } = timeData;
  if (!duration) return;

  // Draw time ticks
  const tickInterval = getTickInterval(duration);
  const numTicks = Math.floor(duration / tickInterval);
  drawTimeTicks(
    ctx,
    height,
    numTicks,
    (i) => ((i * tickInterval) / duration) * width,
  );

  // Draw playhead
  const playheadX = timeData.percent * width;
  drawPlayhead(ctx, height, playheadX);

  // Draw time labels
  const labelInterval = tickInterval * 5; // Labels every 5 ticks
  const numLabels = Math.floor(duration / labelInterval);
  drawTimeLabels(
    ctx,
    width,
    height,
    numLabels,
    (i) => ((i * labelInterval) / duration) * width,
    (i) => i * labelInterval,
  );

  // Always show current time and total duration
  ctx.fillStyle = "#ffffff88";
  ctx.font = "10px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const currentTimeLabel = formatTime(timeData.elapsed);
  const totalTimeLabel = formatTime(duration);
  ctx.fillText(`${currentTimeLabel} / ${totalTimeLabel}`, 8, 8);

  // Draw BPM ticks if BPM is provided
  if (bpm) {
    drawBpmTicks(ctx, width, height, bpm, timeData, duration, timeData.started);
  }
}
