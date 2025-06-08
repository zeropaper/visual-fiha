import { useEffect, useRef } from "react";
import Display from "../display/Display";
import styles from "./ControlsApp.module.css";

export function ControlDisplay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const displayRef = useRef<Display | null>(null);
  function render() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!displayRef.current) {
      displayRef.current = new Display({ canvas, id: "controls-display" });
    }
    const display = displayRef.current;
    // console.info(display.state);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // render();
    return () => {
      if (displayRef.current) {
        // displayRef.current.destroy();
        displayRef.current = null;
      }
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const renderLoop = () => {
      render();
      requestAnimationFrame(renderLoop);
    };
    requestAnimationFrame(renderLoop);
  }, []);

  return (
    <div>
      <canvas
        ref={canvasRef}
        id="controls-display"
        className={styles.controlDisplay}
      />
    </div>
  );
}
