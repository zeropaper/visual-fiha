import type { ScriptInfo } from "src/types";

export interface TranspilePayload extends ScriptInfo {
  code: string;
  original: string;
}

const tsTranspileWorker = new Worker(
  new URL("./tsTranspile.worker.ts", import.meta.url),
  { type: "classic" },
);

export async function tsTranspile(
  code: string,
  type: string,
  role: string,
  id: string,
) {
  return new Promise<TranspilePayload>((resolve, reject) => {
    const timeout = setTimeout(() => {
      tsTranspileWorker.removeEventListener("message", listener);
      reject(new Error("Transpile timeout"));
    }, 1500);

    function listener(event: MessageEvent<TranspilePayload>) {
      if (
        event.data.type !== type ||
        event.data.role !== role ||
        event.data.id !== id
      ) {
        return;
      }
      clearTimeout(timeout);
      resolve(event.data);
      tsTranspileWorker.removeEventListener("message", listener);
    }
    tsTranspileWorker.addEventListener("message", listener);
    tsTranspileWorker.postMessage({ code, type, role, id });
  });
}
