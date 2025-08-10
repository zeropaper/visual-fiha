import Display from "@display/Display";
import { useEffect, useRef } from "react";
import styles from "./ControlDisplay.module.css";

export function ControlDisplay({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const displayRef = useRef<Display | null>(null);

  useEffect(() => {
    if (canvasRef.current && !displayRef.current) {
      displayRef.current = new Display({
        canvas: canvasRef.current,
        id: "controls-display",
      });
    }
  }, []);

  useEffect(() => {
    const resizeListener = () => {
      if (displayRef.current) {
        displayRef.current.resize();
      }
    };
    const observer = new ResizeObserver(resizeListener);
    if (canvasRef.current?.parentElement) {
      observer.observe(canvasRef.current?.parentElement);
    }
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="controls-display"
      className={[styles.canvas, "controls-display", className].join(" ")}
      style={{
        background: displayRef.current?.state.stage?.backgroundColor || "#000",
        aspectRatio: `${displayRef.current?.state.stage?.width || "600"}/${displayRef.current?.state.stage?.height || "400"}`,
      }}
    />
  );
}
