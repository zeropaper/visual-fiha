import { useEffect, useRef } from "react";
import styles from "./CanvasVisualizer.module.css";

const minColor = "#8ff"; // cyan for min
const maxColor = "#f8f"; // magenta for max
const averageColor = "#ff8"; // yellow for average
const medianColor = "#fff"; // white for median

export function drawReferenceLines(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  options?: {
    linesY?: number[];
    color?: string;
    lineWidth?: number;
    dash?: number[];
  },
) {
  const { width: w, height: h } = canvas;
  const linesY = options?.linesY || [h / 2];
  const color = options?.color || "#888";
  const lineWidth = options?.lineWidth || 1;
  const dash = options?.dash || [4, 4];
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(dash);
  linesY.forEach((y) => {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  });
  ctx.setLineDash([]);
  ctx.restore();
}

export function drawLine(
  ctx: CanvasRenderingContext2D,
  values: number[],
  color: string,
  transform: (val: number) => number = (val) => val,
) {
  const canvas = ctx.canvas;
  if (!canvas) return;
  if (!values || !values.length) return;
  const { width: w } = canvas;
  const n = values.length;
  const wi = n > 1 ? w / (n - 1) : w;
  ctx.strokeStyle = color;
  ctx.beginPath();
  values.forEach((val: number, i: number) => {
    const vh = transform(val);
    const x = wi * i;
    if (i === 0) {
      ctx.moveTo(x, vh);
      return;
    }
    ctx.lineTo(x, vh);
  });
  ctx.stroke();
}

export function drawInfo(
  ctx: CanvasRenderingContext2D,
  {
    average,
    median,
    min,
    max,
  }: {
    average: number;
    median: number;
    min: number;
    max: number;
  },
) {
  const canvas = ctx.canvas;
  if (!canvas) return;
  ctx.save();
  ctx.font = "12px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const b = canvas.height * 0.5;
  ctx.fillStyle = averageColor;
  ctx.fillText(`Avg: ${average.toFixed(2)}`, 10, -25 + b);
  ctx.fillStyle = medianColor;
  ctx.fillText(`Med: ${median.toFixed(2)}`, 10, -10 + b);
  ctx.fillStyle = minColor;
  ctx.fillText(`Min: ${min.toFixed(2)}`, 10, 10 + b);
  ctx.fillStyle = maxColor;
  ctx.fillText(`Max: ${max.toFixed(2)}`, 10, 25 + b);
  ctx.restore();
}

type VisualizerProps = {
  analyser: AnalyserNode | null;
  drawExtras?: (
    ctx: CanvasRenderingContext2D,
    data: number[],
    h: number,
  ) => void;
};

export function CanvasVisualizer({
  analyser,
  getData,
  lineColor,
  transformValue,
  drawExtras,
}: {
  analyser: AnalyserNode | null;
  getData: (analyser: AnalyserNode, array: Uint8Array) => void;
  lineColor: string;
  transformValue: (val: number, h: number) => number;
  drawExtras?: (
    ctx: CanvasRenderingContext2D,
    data: number[],
    h: number,
  ) => void;
  // writeInputValues: (path: string, value: any) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRequestRef = useRef<number | null>(null);

  function render() {
    if (!analyser) {
      animationFrameRequestRef.current = requestAnimationFrame(render);
      return;
    }
    const canvas = canvasRef.current;
    const canvasCtx = canvas ? canvas.getContext("2d") : null;
    if (!canvasCtx) {
      animationFrameRequestRef.current = requestAnimationFrame(render);
      return;
    }
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    const { height: h } = canvasCtx.canvas;
    canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);

    drawReferenceLines(canvasCtx.canvas, canvasCtx, {
      linesY: [h / 4, h / 2, (3 * h) / 4],
      color: "#fff",
      dash: [2, 4],
    });

    getData(analyser, dataArray);

    const sorted = [...dataArray].sort((a, b) => a - b);
    const info = {
      average: dataArray.reduce((a, b) => a + b, 0) / dataArray.length,
      median: sorted[Math.floor(sorted.length / 2)],
      min: Math.min(...dataArray),
      max: Math.max(...dataArray),
    };
    const transformValueLocal = (val: number) => {
      return transformValue(val, h);
    };
    drawLine(canvasCtx, [info.min, info.min], minColor, transformValueLocal);
    drawLine(canvasCtx, [info.max, info.max], maxColor, transformValueLocal);
    drawLine(
      canvasCtx,
      [info.average, info.average],
      averageColor,
      transformValueLocal,
    );
    drawLine(
      canvasCtx,
      [info.median, info.median],
      medianColor,
      transformValueLocal,
    );
    drawLine(canvasCtx, Array.from(dataArray), lineColor, transformValueLocal);
    if (drawExtras) drawExtras(canvasCtx, Array.from(dataArray), h);
    drawInfo(canvasCtx, info);
    animationFrameRequestRef.current = requestAnimationFrame(render);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    render();
    return () => {
      if (animationFrameRequestRef.current) {
        cancelAnimationFrame(animationFrameRequestRef.current);
        animationFrameRequestRef.current = null;
      }
      const canvas = canvasRef.current;
      if (canvas) {
        const canvasCtx = canvas.getContext("2d");
        if (canvasCtx) {
          canvasCtx.clearRect(0, 0, canvas.width || 0, canvas.height || 0);
        }
      }
    };
  }, [analyser]);

  function handleResize() {
    if (canvasRef.current) {
      canvasRef.current.style.display = "none";
      canvasRef.current.width = (
        canvasRef.current.parentNode as HTMLElement
      ).clientWidth;
      canvasRef.current.height = (
        canvasRef.current.parentNode as HTMLElement
      ).clientHeight;
      canvasRef.current.style.display = "unset";
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const resizeObserver = new ResizeObserver(handleResize);
    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current.parentNode as Element);
      handleResize();
      render();
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className={styles.root}>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

export function Frequency(props: VisualizerProps) {
  return (
    <CanvasVisualizer
      analyser={props.analyser}
      getData={(analyser, arr) => analyser.getByteFrequencyData(arr)}
      lineColor="lime"
      transformValue={(val, h) => h - (((val - 128) / 128) * (h / 2) + h / 2)}
      drawExtras={props.drawExtras}
    />
  );
}

export function TimeDomain(props: VisualizerProps) {
  return (
    <CanvasVisualizer
      analyser={props.analyser}
      getData={(analyser, arr) => analyser.getByteTimeDomainData(arr)}
      lineColor="lime"
      transformValue={(val, h) => ((val - 128) / 128) * (h / 2) + h / 2}
      drawExtras={props.drawExtras}
    />
  );
}
