import { useEffect, useRef } from "react";
import Display from "../display/Display";
import styles from "./ControlsApp.module.css";

export function ControlDisplay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const displayRef = useRef<Display | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let _counter1 = 0;
    function render() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      _counter1++;
      if (_counter1 % 60 === 0) {
        console.log("Rendering ControlDisplay", displayRef.current?.state);
      }
      if (!displayRef.current) {
        displayRef.current = new Display({ canvas, id: "controls-display" });
      }
    }
    const animationFrame = requestAnimationFrame(render);
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (displayRef.current) {
        displayRef.current = null;
      }
    };
  }, []);

  return (
    <div>
      <canvas
        ref={canvasRef}
        id="controls-display"
        className={styles.controlDisplay}
        style={{
          background:
            displayRef.current?.state.stage?.backgroundColor || "#000",
          aspectRatio: `${displayRef.current?.state.stage?.width || "600"}/${displayRef.current?.state.stage?.height || "400"}`,
        }}
      />
    </div>
  );
}
