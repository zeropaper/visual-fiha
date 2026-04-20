import { useEffect, useRef } from "react";
import TranspileWorker from "../../utils/tsTranspile.worker?worker";

export function useTranspile() {
  const transpilationWorkerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new TranspileWorker();
    if (transpilationWorkerRef.current) {
      transpilationWorkerRef.current.terminate();
    }
    transpilationWorkerRef.current = worker;
    return () => {
      worker.terminate();
    };
  }, []);

  return (code: string, type: string, role: string, id: string) => {
    if (!transpilationWorkerRef.current) {
      console.warn("[ScriptEditor] Transpilation worker is not initialized.");
      return;
    }
    transpilationWorkerRef.current.postMessage({ code, type, role, id });
  };
}
