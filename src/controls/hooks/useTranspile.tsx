import { useEffect, useRef } from "react";

export function useTranspile() {
  const transpilationWorkerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker(
      new URL("../../utils/tsTranspile.worker.ts", import.meta.url),
      { type: "classic" },
    );
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
