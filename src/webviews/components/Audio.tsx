/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as React from "react";
import { useSelector } from "react-redux";
import { useSetBPM } from "../contexts/ComContext";
import { useRead } from "../contexts/DataContext";
import type { WebviewAppState } from "../store";

const defaultState = {
  lastMeasure: 0,
  measuresCount: 0,
  seriesStart: 0,
};

const useRequestAnimationFrame = (fn: (elsapsed: number) => void) => {
  const requestRef = React.useRef<number>();
  const previousTimeRef = React.useRef<number>();

  const animate = (time: number) => {
    if (previousTimeRef.current) {
      fn(time - (previousTimeRef.current || 0));
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);
};

function drawValues(
  canvasCtx: CanvasRenderingContext2D,
  values: Uint8Array | Float32Array,
  color: string,
  transform: (val: number) => number,
) {
  if (!values?.length) return;

  const {
    canvas: { width: w },
  } = canvasCtx;
  const wi = w / values.length;

  canvasCtx.strokeStyle = color;
  canvasCtx.beginPath();
  values.forEach((val: number, i: number) => {
    const vh = transform(val);
    if (i === 0) {
      canvasCtx.moveTo(0, vh);
      return;
    }
    canvasCtx.lineTo(wi * i, vh);
  });
  canvasCtx.stroke();
}

function Visualizer() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const read = useRead();

  useRequestAnimationFrame(() => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    canvas!.width = rect!.width;
    canvas!.height = rect!.height;
    const h = rect!.height;
    const hh = h * 0.5;
    drawValues(ctx, read("frequency"), "red", (val) => h - (val / 255) * h);
    drawValues(
      ctx,
      read("volume"),
      "lime",
      (val) => h - (hh + ((val - 127) / hh) * h),
    );
  });

  return (
    <div className="visualizer-wrapper">
      <canvas className="visualizer" ref={canvasRef} />
    </div>
  );
}

const Audio = () => {
  const {
    bpm: { count: bpm },
    server,
  } = useSelector((state: WebviewAppState) => state);
  const setBPM = useSetBPM();

  const [{ lastMeasure, measuresCount, seriesStart }, setState] =
    React.useState(defaultState);
  const serverURL = `http://${server.host}:${server.port}`;

  const newBPM = Math.round(
    60000 / ((Date.now() - seriesStart) * (1 / measuresCount)),
  );

  const handleBPMClick = () => {
    const now = Date.now();
    if (now - lastMeasure > 2000) {
      setState({
        lastMeasure: now,
        measuresCount: 0,
        seriesStart: now,
      });
      return;
    }

    if (measuresCount > 2) {
      void setBPM(newBPM);
    }

    setState({
      lastMeasure: now,
      measuresCount: measuresCount + 1,
      seriesStart: seriesStart || now,
    });
  };

  return (
    <>
      <div className="button-wrapper">
        <a
          className="button"
          href={`${serverURL}/capture/`}
        >{`${serverURL}/capture/`}</a>
      </div>
      <Visualizer />
      <div className="bpm">
        {`BPM: ${bpm}`}

        <button
          style={{
            borderRadius: 40,
            margin: 20,
            width: 60,
            height: 60,
          }}
          type="button"
          onClick={handleBPMClick}
        >
          {newBPM}
        </button>
      </div>
    </>
  );
};

export default Audio;
