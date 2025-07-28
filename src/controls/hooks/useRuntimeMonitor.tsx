import { useEffect, useRef, useState } from "react";
import type { RuntimeData, TimeInputValue } from "src/types";

export function useRuntimeMonitor() {
  const runtimeDataRef = useRef<RuntimeData | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [timeData, setTimeData] = useState<TimeInputValue | null>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Only handle messages of type "
      if (event.data.type !== "runtimedata") {
        return;
      }

      setTimeData(event.data.payload.time);

      if (
        runtimeDataRef.current?.time.isRunning &&
        !event.data.payload.time.isRunning
      ) {
        console.info("[controls-worker] Worker stopped running");
        // If the worker stopped running, reset the elapsed time
        setIsRunning(false);
      } else if (
        !runtimeDataRef.current?.time.isRunning &&
        event.data.payload.time.isRunning
      ) {
        console.info("[controls-worker] Worker started running");
        // If the worker started running, update the state
        setIsRunning(true);
      }

      if (
        event.data.payload.bpm.bpm &&
        event.data.payload.bpm.bpm !== runtimeDataRef.current?.bpm.bpm
      ) {
        console.info(
          "[timeline] BPM changed to %d",
          event.data.payload.bpm.bpm,
        );
        setBpm(event.data.payload.bpm.bpm);
      }

      runtimeDataRef.current = event.data.payload as RuntimeData;
    }

    const broadcastChannel = new BroadcastChannel("core");
    broadcastChannel.addEventListener("message", handleMessage);

    return () => {
      broadcastChannel.removeEventListener("message", handleMessage);
      broadcastChannel.close();
    };
  }, []);
  return {
    isRunning,
    bpm,
    timeData,
  };
}
