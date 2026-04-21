import type { ScriptInfo } from "../types";

import TranspileWorker from "./tsTranspile.worker?worker";

export interface TranspilePayload extends ScriptInfo {
  code: string;
  original: string;
}

export async function tsTranspile(
  code: string,
  type: string,
  role: string,
  id: string,
) {
  return new Promise<TranspilePayload>((resolve, reject) => {
    const tsTranspileWorker = new TranspileWorker();
    const timeout = setTimeout(() => {
      tsTranspileWorker.removeEventListener("message", listener);
      reject(new Error("Transpile timeout"));
    }, 2500);

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
