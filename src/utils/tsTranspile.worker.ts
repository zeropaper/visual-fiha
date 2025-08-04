// Web Worker for transpiling TypeScript to JavaScript in-browser
/// <reference lib="webworker" />

import type { TranspilePayload } from "./tsTranspile";

self.importScripts("/typescript.js");

const broadcastChannel = new BroadcastChannel("core");

self.onmessage = (e) => {
  const { code, role, type, id } = e.data;
  // @ts-expect-error: typescript is loaded globally
  const ts = self.ts;
  const transpiled = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2017,
    },
  });
  const payload: TranspilePayload = {
    role,
    type,
    id,
    code: transpiled.outputText,
    original: code,
  };
  // console.info("[tsTranspile.worker] Transpiled:", payload);
  self.postMessage(payload);
  broadcastChannel.postMessage({
    type: "transpiled",
    payload,
  });
};

self.addEventListener("close", () => {
  console.log("[tsTranspile.worker] Closed");
  broadcastChannel.close();
});
