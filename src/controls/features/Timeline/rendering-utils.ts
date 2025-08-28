import type { TimeInputValue } from "../../../types";

/**
 * Calculate appropriate tick interval based on duration
 */
export function getTickInterval(duration: number): number {
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
export function formatTime(timeMs: number): string {
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${seconds}s`;
}

/**
 * Setup canvas with common properties (clear, resize, background, border)
 */
export function setupCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
): { width: number; height: number } {
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

  return { width: canvas.width, height: canvas.height };
}

/**
 * Draw placeholder text when no time data is available
 */
export function drawPlaceholder(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  message: string,
) {
  ctx.fillStyle = "#ffffff66";
  ctx.font = "14px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(message, width / 2, height / 2);
}

/**
 * Draw BPM ticks as a sawtooth pattern along the timeline
 */
export function drawBpmTicks(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bpm: number,
  timeData: TimeInputValue,
  timeWindow: number,
  startTime: number,
) {
  if (!bpm || !timeData || !timeWindow || startTime < 0) return;

  ctx.fillStyle = "#00ff00";
  ctx.textBaseline = "top";
  ctx.fillText(`${bpm} bpm`, 8, 8);

  const bpmInterval = 60000 / bpm; // Calculate interval in ms based on BPM
  const numBpmTicks = Math.floor(
    Math.max(timeData.elapsed, timeWindow) / bpmInterval,
  );

  ctx.strokeStyle = "#00ff00"; // Green color for BPM ticks
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
 * Draw the playhead triangle and line
 */
export function drawPlayhead(
  ctx: CanvasRenderingContext2D,
  height: number,
  x: number,
) {
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
 * Draw time tick marks along the timeline
 */
export function drawTimeTicks(
  ctx: CanvasRenderingContext2D,
  height: number,
  numTicks: number,
  getTickPosition: (tickIndex: number) => number,
) {
  ctx.strokeStyle = "#ffffff44";
  ctx.lineWidth = 1;

  for (let i = 0; i <= numTicks; i++) {
    const x = getTickPosition(i);

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
 * Draw time labels at major tick positions
 */
export function drawTimeLabels(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  numLabels: number,
  getLabelPosition: (labelIndex: number) => number,
  getLabelTime: (labelIndex: number) => number,
) {
  ctx.fillStyle = "#ffffff88";
  ctx.font = "10px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  for (let i = 0; i <= numLabels; i++) {
    const time = getLabelTime(i);
    const x = getLabelPosition(i);
    const timeLabel = formatTime(time);

    // Only draw label if there's enough space
    if (x > 20 && x < width - 20) {
      ctx.fillText(timeLabel, x, height - 20);
    }
  }
}

/**
 * Draw hover indicator line and time label
 */
export function drawHoverIndicator(
  ctx: CanvasRenderingContext2D,
  height: number,
  hoverX: number,
  hoveredTime: number,
) {
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
